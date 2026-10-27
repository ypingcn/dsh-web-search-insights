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

/** Write one JSON response. */
function sendJson(response, status, payload) {
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

/** Answer one quick-search request through the DSH web seam. */
async function handleQuickSearch(web, request, response) {
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
  try {
    const result = await web.search({ query: parsed.query, maxResults: parsed.limit })
    sendJson(response, 200, {
      ok: true,
      value: {
        sources: Array.isArray(result?.sources) ? result.sources.map(projectSource) : [],
        truncated: result?.truncated === true,
        ...(typeof result?.content === 'string' && result.content !== '' ? { content: result.content } : {}),
      },
    })
  } catch (error) {
    sendJson(response, 200, {
      ok: false,
      error: {
        code: typeof error?.code === 'string' ? error.code : 'WEB_PROVIDER_ERROR',
        message: error instanceof Error ? error.message : String(error),
      },
    })
  }
}

/**
 * Install the quick-search route when this composition owns a web server and
 * the web service. Both are optional so the plugin still loads elsewhere.
 *
 * @param {any} ctx - host plugin context.
 */
export function installQuickSearchRoute(ctx) {
  if (typeof ctx?.inject !== 'function') return
  ctx.inject(['web', 'webServer'], (scope) => {
    scope.effect(
      () =>
        scope.webServer.register({
          kind: 'exact',
          path: QUICK_SEARCH_PATH,
          handler: (request, response) => handleQuickSearch(scope.web, request, response),
        }),
      'web-search-insights: quick search route',
    )
  })
}
