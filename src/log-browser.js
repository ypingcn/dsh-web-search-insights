/**
 * Host half of the log browser: one same-origin HTTP route that serves the
 * JSONL audit log with keyword filtering and pagination.
 *
 * The route mirrors the quick-search safety checks (loopback socket,
 * same-origin, plugin header) because the log may contain search keywords.
 * Reading is streaming so a multi-megabyte log never blocks the event loop.
 *
 * @module dsh-web-search-insights/log-browser
 */
import { createReadStream } from 'node:fs'
import { createInterface } from 'node:readline'
import { stat } from 'node:fs/promises'
import { isTrustedQuickSearchRequest } from './quick-search.js'

/** Exact route path used by the browser half. */
export const LOG_BROWSER_PATH = '/api/dsh-web-search-insights/logs'

/** Default page size. */
const DEFAULT_LIMIT = 50
/** Hard cap on records returned in one response. */
const MAX_LIMIT = 500

/** Read one query parameter as a trimmed string. */
function paramOf(request, name) {
  const url = request?.url ?? ''
  const index = url.indexOf('?')
  if (index < 0) return ''
  const query = url.slice(index + 1)
  for (const pair of query.split('&')) {
    const equal = pair.indexOf('=')
    const key = equal < 0 ? pair : pair.slice(0, equal)
    if (decodeURIComponent(key) === name) {
      return equal < 0 ? '' : decodeURIComponent(pair.slice(equal + 1).replace(/\+/gu, ' '))
    }
  }
  return ''
}

/** Read a non-negative integer within bounds. */
function readCount(value, fallback, max) {
  if (value === '') return fallback
  const parsed = Number.parseInt(value, 10)
  if (!Number.isFinite(parsed) || parsed < 0) return fallback
  return Math.min(parsed, max)
}

/**
 * Collect the JSONL records that match a keyword, then slice the requested
 * page. Newest records are returned first, matching the user's expectation
 * that the top of the list is the most recent activity.
 *
 * @param {string} file - absolute JSONL path.
 * @param {string} needle - lower-cased keyword (empty = no filter).
 * @param {number} offset - records to skip from the newest end.
 * @param {number} limit - records to return.
 * @returns {Promise<{ records: any[], total: number }>}
 */
async function readLogPage(file, needle, offset, limit) {
  /** @type {any[]} */
  const matching = []
  try {
    await stat(file)
  } catch (error) {
    if (error?.code === 'ENOENT') return { records: [], total: 0 }
    throw error
  }
  const stream = createReadStream(file, { encoding: 'utf8' })
  const reader = createInterface({ input: stream, crlfDelay: Infinity })
  for await (const line of reader) {
    const trimmed = line.trim()
    if (trimmed === '') continue
    let record
    try {
      record = JSON.parse(trimmed)
    } catch {
      // A malformed line never aborts the whole read.
      continue
    }
    if (needle === '' || recordMatches(record, needle)) matching.push(record)
  }
  // Newest first: the log appends in time order, so reverse to surface the
  // latest calls at the top of the browser.
  matching.reverse()
  const total = matching.length
  const records = matching.slice(offset, offset + limit)
  return { records, total }
}

/**
 * Whether a record contains the keyword. Matches against the user-facing
 * fields: search queries, fetched URL, source titles, and error messages.
 *
 * @param {any} record - one parsed JSONL record.
 * @param {string} needle - lower-cased keyword.
 * @returns {boolean}
 */
function recordMatches(record, needle) {
  if (Array.isArray(record.queries)) {
    for (const query of record.queries) {
      if (typeof query === 'string' && query.toLowerCase().includes(needle)) return true
    }
  }
  if (typeof record.url === 'string' && record.url.toLowerCase().includes(needle)) return true
  if (typeof record.error?.message === 'string' && record.error.message.toLowerCase().includes(needle)) {
    return true
  }
  if (Array.isArray(record.sources)) {
    for (const source of record.sources) {
      if (typeof source.title === 'string' && source.title.toLowerCase().includes(needle)) return true
      if (typeof source.url === 'string' && source.url.toLowerCase().includes(needle)) return true
    }
  }
  return false
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

/**
 * Answer one log-browser request.
 *
 * @param {() => string} getFile - returns the current active log path.
 * @param {any} request - incoming request.
 * @param {any} response - outgoing response.
 */
async function handleLogBrowser(getFile, request, response) {
  if (request.method !== 'GET') {
    response.writeHead(405, { allow: 'GET' })
    response.end()
    return
  }
  if (!isTrustedQuickSearchRequest(request)) {
    sendJson(response, 403, { ok: false, error: { code: 'FORBIDDEN', message: 'request is not trusted' } })
    return
  }
  const needle = paramOf(request, 'q').trim().toLowerCase()
  const offset = readCount(paramOf(request, 'offset'), 0, Number.MAX_SAFE_INTEGER)
  const limit = readCount(paramOf(request, 'limit'), DEFAULT_LIMIT, MAX_LIMIT)
  try {
    const file = getFile()
    const { records, total } = await readLogPage(file, needle, offset, limit)
    sendJson(response, 200, { ok: true, value: { records, total, offset, limit, hasMore: offset + limit < total } })
  } catch (error) {
    sendJson(response, 200, {
      ok: false,
      error: {
        code: typeof error?.code === 'string' ? error.code : 'LOG_READ_ERROR',
        message: error instanceof Error ? error.message : String(error),
      },
    })
  }
}

/**
 * Install the log-browser route when this composition owns a web server.
 *
 * @param {any} ctx - host plugin context.
 * @param {() => string} getFile - returns the current active log path.
 */
export function installLogBrowserRoute(ctx, getFile) {
  if (typeof ctx?.inject !== 'function') return
  const getter = typeof getFile === 'function' ? getFile : () => ''
  ctx.inject(['webServer'], (scope) => {
    scope.effect(
      () =>
        scope.webServer.register({
          kind: 'exact',
          path: LOG_BROWSER_PATH,
          handler: (request, response) => handleLogBrowser(getter, request, response),
        }),
      'web-search-insights: log browser route',
    )
  })
}
