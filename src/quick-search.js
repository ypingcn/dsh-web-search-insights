/**
 * Host half of the "quick search" view: one same-origin HTTP route that
 * resolves a single user keyword through the DSH web search seam.
 *
 * The route is intentionally independent from `tools/result`: manual queries
 * do not enter the JSONL audit log or the session statistics, and they never
 * call a model.
 *
 * @module dsh-web-search-insights/quick-search
 */

/** Exact route path used by the browser half. */
export const QUICK_SEARCH_PATH = '/api/dsh-web-search-insights/quick-search'

/** Request header proving the caller went through the plugin's browser code. */
export const QUICK_SEARCH_HEADER = 'x-dsh-web-search-insights'

/** Result limits the view offers. */
export const QUICK_SEARCH_LIMITS = [5, 10, 15, 20]

/** Default result limit. */
export const QUICK_SEARCH_DEFAULT_LIMIT = 10

/** Longest a single provider call may run before the route answers 504. */
export const QUICK_SEARCH_TIMEOUT_MS = 15_000

/** Concurrent provider calls allowed per host process. */
export const QUICK_SEARCH_MAX_CONCURRENT = 4

/** Longest accepted keyword, in characters. */
const QUERY_MAX_CHARS = 500

/** Largest accepted request body, in bytes. */
const BODY_MAX_BYTES = 4096

/** True for a remote address the host itself owns. */
function isLoopback(address) {
  return typeof address === 'string' && /^(?:::1|::ffff:127\.|127\.)/.test(address)
}

/** Read one request header as a trimmed string. */
function headerOf(request, name) {
  const value = request?.headers?.[name]
  return Array.isArray(value) ? value[0] ?? '' : typeof value === 'string' ? value : ''
}

/**
 * Whether the request came from the plugin's browser code on this host.
 * Mirrors the safety checks third-party settings routes use: same-origin,
 * loopback socket, and an explicit plugin header.
 */
export function isTrustedQuickSearchRequest(request) {
  if (headerOf(request, QUICK_SEARCH_HEADER) !== '1') return false
  if (!isLoopback(request?.socket?.remoteAddress)) return false
  const site = headerOf(request, 'sec-fetch-site')
  if (site !== '' && site !== 'same-origin') return false
  const host = headerOf(request, 'host')
  if (host === '') return false
  const origin = headerOf(request, 'origin')
  if (origin === '') {
    try {
      return isLoopback(new URL(`http://${host}`).hostname)
    } catch {
      return false
    }
  }
  try {
    const parsed = new URL(origin)
    return (
      (parsed.protocol === 'http:' || parsed.protocol === 'https:') &&
      isLoopback(parsed.hostname) &&
      parsed.host === host
    )
  } catch {
    return false
  }
}

/** Read a JSON body with a hard size cap. */
async function readJsonBody(request) {
  const chunks = []
  let bytes = 0
  for await (const chunk of request) {
    const buffer = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk)
    bytes += buffer.byteLength
    if (bytes > BODY_MAX_BYTES) throw new Error('request body is too large')
    chunks.push(buffer)
  }
  const text = Buffer.concat(chunks).toString('utf8')
  return text === '' ? {} : JSON.parse(text)
}

/** True once the peer has gone away or the response was already sent. */
function isClosed(response) {
  return response?.writableEnded === true || response?.destroyed === true
}

/** Write one JSON response, unless the socket is already gone. */
function sendJson(response, status, payload) {
  if (isClosed(response)) return
  const body = JSON.stringify(payload)
  response.writeHead(status, {
    'content-type': 'application/json; charset=utf-8',
    'cache-control': 'no-store',
    'content-length': Buffer.byteLength(body),
  })
  response.end(body)
}

/** Keep only the fields the view renders. */
function projectSource(source) {
  return {
    url: source.url,
    ...(typeof source.title === 'string' && source.title !== '' ? { title: source.title } : {}),
    ...(typeof source.snippet === 'string' && source.snippet !== '' ? { snippet: source.snippet } : {}),
    ...(typeof source.publishedAt === 'string' && source.publishedAt !== ''
      ? { publishedAt: source.publishedAt }
      : {}),
  }
}

/** Validate one search request; returns `{ query, limit }` or an error sentence. */
export function readQuickSearchRequest(body) {
  const query = typeof body?.query === 'string' ? body.query.trim() : ''
  if (query === '') return { error: 'query must be a non-empty string' }
  if (query.length > QUERY_MAX_CHARS) return { error: `query must be at most ${QUERY_MAX_CHARS} characters` }
  const rawLimit = body?.limit
  const limit = rawLimit === undefined ? QUICK_SEARCH_DEFAULT_LIMIT : rawLimit
  if (!QUICK_SEARCH_LIMITS.includes(limit)) {
    return { error: `limit must be one of ${QUICK_SEARCH_LIMITS.join(', ')}` }
  }
  return { query, limit }
}

/**
 * Answer one quick-search request through the DSH web seam.
 *
 * @param {any} web - the host's `web` service.
 * @param {any} request - incoming request.
 * @param {any} response - outgoing response.
 * @param {{ timeoutMs: number, maxConcurrent: number, gate: { active: number } }} limits -
 *   per-route timeout, concurrency cap, and its shared counter.
 */
async function handleQuickSearch(web, request, response, limits) {
  if (request.method !== 'POST') {
    response.writeHead(405, { allow: 'POST' })
    response.end()
    return
  }
  if (!isTrustedQuickSearchRequest(request)) {
    sendJson(response, 403, { ok: false, error: { code: 'FORBIDDEN', message: 'request is not trusted' } })
    return
  }
  let body
  try {
    body = await readJsonBody(request)
  } catch (error) {
    sendJson(response, 400, {
      ok: false,
      error: { code: 'BAD_REQUEST', message: error instanceof Error ? error.message : String(error) },
    })
    return
  }
  const parsed = readQuickSearchRequest(body)
  if (parsed.error !== undefined) {
    sendJson(response, 400, { ok: false, error: { code: 'BAD_REQUEST', message: parsed.error } })
    return
  }
  if (limits.gate.active >= limits.maxConcurrent) {
    sendJson(response, 429, {
      ok: false,
      error: {
        code: 'TOO_MANY_REQUESTS',
        message: `at most ${limits.maxConcurrent} concurrent searches`,
      },
    })
    return
  }
  limits.gate.active += 1

  const controller = new AbortController()
  let timedOut = false
  let timer
  // A prematurely closed response means nobody is listening any more; abort the
  // provider call instead of letting it finish into a dead socket.
  const onClose = () => {
    if (response?.writableEnded !== true) controller.abort()
  }
  if (typeof response?.on === 'function') response.on('close', onClose)

  try {
    const timeout = new Promise((_resolve, reject) => {
      timer = setTimeout(() => {
        timedOut = true
        controller.abort()
        const error = new Error(`search timed out after ${limits.timeoutMs}ms`)
        error.code = 'QUICK_SEARCH_TIMEOUT'
        reject(error)
      }, limits.timeoutMs)
    })
    // The seam takes the cancellation signal as its second argument. Attach a
    // no-op catch so a provider rejecting after the timeout stays handled.
    const search = Promise.resolve().then(() =>
      web.search({ query: parsed.query, maxResults: parsed.limit }, controller.signal),
    )
    search.catch(() => {})
    const result = await Promise.race([search, timeout])
    // The view renders sources only; the provider's synthesized `content` is
    // deliberately not forwarded to keep the response small.
    sendJson(response, 200, {
      ok: true,
      value: {
        sources: Array.isArray(result?.sources) ? result.sources.map(projectSource) : [],
        truncated: result?.truncated === true,
      },
    })
  } catch (error) {
    sendJson(response, timedOut ? 504 : 200, {
      ok: false,
      error: {
        code: timedOut
          ? 'QUICK_SEARCH_TIMEOUT'
          : typeof error?.code === 'string'
            ? error.code
            : 'WEB_PROVIDER_ERROR',
        message: error instanceof Error ? error.message : String(error),
      },
    })
  } finally {
    if (timer !== undefined) clearTimeout(timer)
    if (typeof response?.off === 'function') response.off('close', onClose)
    limits.gate.active -= 1
  }
}

/**
 * Install the quick-search route when this composition owns a web server and
 * the web service. Both are optional so the plugin still loads elsewhere.
 *
 * @param {any} ctx - host plugin context.
 * @param {{ timeoutMs?: number, maxConcurrent?: number }} [options] - safety
 *   limits; mainly overridden by tests.
 */
export function installQuickSearchRoute(ctx, options = {}) {
  if (typeof ctx?.inject !== 'function') return
  const timeoutMs =
    Number.isFinite(options?.timeoutMs) && options.timeoutMs > 0
      ? options.timeoutMs
      : QUICK_SEARCH_TIMEOUT_MS
  const maxConcurrent =
    Number.isInteger(options?.maxConcurrent) && options.maxConcurrent > 0
      ? options.maxConcurrent
      : QUICK_SEARCH_MAX_CONCURRENT
  const gate = { active: 0 }
  ctx.inject(['web', 'webServer'], (scope) => {
    scope.effect(
      () =>
        scope.webServer.register({
          kind: 'exact',
          path: QUICK_SEARCH_PATH,
          handler: (request, response) =>
            handleQuickSearch(scope.web, request, response, { timeoutMs, maxConcurrent, gate }),
        }),
      'web-search-insights: quick search route',
    )
  })
}
