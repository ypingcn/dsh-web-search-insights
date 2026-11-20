/**
 * Host half of the search-usage statistics panel.
 *
 * Reads the local JSONL audit log (active file plus rotated siblings) and folds
 * every settled `web_search` record into:
 *
 * - per-day counters: calls, queries, sessions, failures, returned sources;
 * - keyword distributions: whole queries (default) and simple whitespace /
 *   punctuation terms, each as a top-N ranking.
 *
 * The aggregation runs on the host so the browser never downloads the whole
 * log. Results are cached briefly and invalidated by the file list's
 * size/mtime signature, so a fresh append shows up without a manual cache
 * flush.
 *
 * @module dsh-web-search-insights/stats
 */
import { createReadStream } from 'node:fs'
import { readdir, stat } from 'node:fs/promises'
import { basename, dirname, join } from 'node:path'
import { createInterface } from 'node:readline'
import { isTrustedQuickSearchRequest } from './quick-search.js'
import { ROTATION_SUFFIX } from './writer.js'

/** Exact route path used by the browser half. */
export const STATS_PATH = '/api/dsh-web-search-insights/stats'

/** Default statistics window, in days. */
export const STATS_DEFAULT_DAYS = 30

/** Largest accepted statistics window, in days. */
export const STATS_MAX_DAYS = 365

/** Distinct keyword keys kept per mode before folding into `overflow`. */
export const STATS_MAX_KEYWORDS = 50_000

/** Keywords returned per mode. */
export const STATS_TOP_KEYWORDS = 50

/** Result cache lifetime; a manual refresh bypasses it. */
const CACHE_TTL_MS = 60_000

/** Result cache entries kept; older entries are evicted first. */
const CACHE_MAX_ENTRIES = 8

/** Date fields used for the `YYYY-MM-DD` day key. */
const DAY_OPTIONS = { year: 'numeric', month: '2-digit', day: '2-digit' }

/** Terms are split on whitespace and common CJK / ASCII punctuation. */
const TERM_SPLIT =
  /[\s,，。、;；:：/|·\-—–_"'“”‘’()（）\[\]{}<>《》!?！？]+/u

/** Very common English words that add no signal to a keyword ranking. */
const STOPWORDS = new Set([
  'a',
  'an',
  'and',
  'are',
  'as',
  'at',
  'be',
  'but',
  'by',
  'for',
  'from',
  'had',
  'has',
  'have',
  'how',
  'in',
  'into',
  'is',
  'it',
  'its',
  'not',
  'of',
  'on',
  'or',
  'that',
  'the',
  'their',
  'then',
  'there',
  'these',
  'they',
  'this',
  'to',
  'was',
  'were',
  'what',
  'when',
  'where',
  'which',
  'who',
  'why',
  'will',
  'with',
])

/** @type {Map<string, { at: number, value: ReturnType<typeof shapeResult> }>} */
const cache = new Map()

/** Host timezone, used when the browser sends none or an invalid one. */
function hostTimeZone() {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC'
  } catch {
    return 'UTC'
  }
}

/**
 * Validate a browser-supplied IANA timezone, falling back to the host zone.
 *
 * @param {unknown} value - raw `tz` query parameter.
 * @returns {string} a timezone accepted by `Intl.DateTimeFormat`.
 */
export function resolveTimeZone(value) {
  if (typeof value !== 'string' || value.trim() === '') return hostTimeZone()
  const candidate = value.trim()
  try {
    new Intl.DateTimeFormat('en-CA', { ...DAY_OPTIONS, timeZone: candidate }).format(0)
    return candidate
  } catch {
    return hostTimeZone()
  }
}

/** Two-digit zero padding. */
function pad2(value) {
  return value < 10 ? `0${value}` : String(value)
}

/** Build a formatter that maps an instant to a `YYYY-MM-DD` day in a zone. */
function dayFormatter(timeZone) {
  const formatter = new Intl.DateTimeFormat('en-CA', { ...DAY_OPTIONS, timeZone })
  return (date) => {
    let year = ''
    let month = ''
    let day = ''
    for (const part of formatter.formatToParts(date)) {
      if (part.type === 'year') year = part.value
      else if (part.type === 'month') month = part.value
      else if (part.type === 'day') day = part.value
    }
    return `${year}-${month}-${day}`
  }
}

/**
 * Continuous day labels ending at the current day in `timeZone`.
 *
 * Calendar arithmetic is done in UTC so a DST transition can never duplicate
 * or skip a label; only the starting "today" comes from the target zone.
 *
 * @param {string} timeZone - validated IANA zone.
 * @param {number} days - window length.
 * @param {number} now - epoch milliseconds.
 * @returns {string[]} oldest-first `YYYY-MM-DD` labels.
 */
export function buildDayWindow(timeZone, days, now) {
  const dayOf = dayFormatter(timeZone)
  const [year, month, day] = dayOf(new Date(now)).split('-').map(Number)
  const labels = []
  for (let offset = days - 1; offset >= 0; offset -= 1) {
    const date = new Date(Date.UTC(year, month - 1, day - offset))
    labels.push(`${date.getUTCFullYear()}-${pad2(date.getUTCMonth() + 1)}-${pad2(date.getUTCDate())}`)
  }
  return labels
}

/** Clamp a raw `days` value into the accepted range. */
export function clampDays(value) {
  const parsed = Number.parseInt(value, 10)
  if (!Number.isFinite(parsed) || parsed <= 0) return STATS_DEFAULT_DAYS
  return Math.min(parsed, STATS_MAX_DAYS)
}

/** NFKC + trim + collapse internal whitespace. */
export function normalizeQuery(value) {
  if (typeof value !== 'string') return ''
  return value.normalize('NFKC').trim().replace(/\s+/gu, ' ')
}

/**
 * Split a normalized query into simple terms.
 *
 * This is deliberately not a Chinese tokenizer: continuous CJK text stays one
 * term, which the panel explains in its help text.
 *
 * @param {string} query - normalized query text.
 * @returns {string[]} lowercase terms, in order, duplicates preserved.
 */
export function splitTerms(query) {
  const terms = []
  for (const raw of query.split(TERM_SPLIT)) {
    const term = raw.normalize('NFKC').toLowerCase()
    if (term.length < 2) continue
    if (STOPWORDS.has(term)) continue
    terms.push(term)
  }
  return terms
}

/**
 * List the active log plus its rotated siblings, oldest first.
 *
 * Only names matching the writer's rotation suffix are considered, so
 * unrelated files in the log directory are never read.
 *
 * @param {string} activeFile - absolute active log path.
 * @returns {Promise<string[]>} existing log paths.
 */
export async function listLogFiles(activeFile) {
  if (typeof activeFile !== 'string' || activeFile === '') return []
  const directory = dirname(activeFile)
  const prefix = `${basename(activeFile)}.`
  let names
  try {
    names = await readdir(directory)
  } catch (error) {
    if (error?.code !== 'ENOENT') throw error
    names = []
  }
  /** @type {Array<{ path: string, mtimeMs: number }>} */
  const found = []
  for (const name of names) {
    if (!name.startsWith(prefix)) continue
    if (!ROTATION_SUFFIX.test(name.slice(prefix.length))) continue
    found.push({ path: join(directory, name), mtimeMs: 0 })
  }
  found.push({ path: activeFile, mtimeMs: 0 })
  const files = []
  for (const entry of found) {
    try {
      const info = await stat(entry.path)
      if (!info.isFile()) continue
      files.push({ path: entry.path, mtimeMs: info.mtimeMs })
    } catch (error) {
      if (error?.code !== 'ENOENT') throw error
    }
  }
  files.sort((left, right) => left.mtimeMs - right.mtimeMs || left.path.localeCompare(right.path))
  return files.map((entry) => entry.path)
}

/** Add one keyword occurrence while enforcing the distinct-key cap. */
function addKeyword(map, key, text, weight, state) {
  const current = map.get(key)
  if (current !== undefined) {
    current.count += weight
    return
  }
  if (map.size >= state.maxKeywords) {
    state.overflow += 1
    return
  }
  map.set(key, { text, count: weight })
}

/**
 * Rank a keyword map and keep the requested top entries.
 *
 * `overflow` counts occurrences whose key was dropped once the distinct-key
 * cap was reached; `distinct` stays the number of keys actually retained, so
 * the panel never implies knowledge it does not have.
 */
function rankKeywords(map, total, overflow, top) {
  const items = [...map.values()]
    .sort(
      (left, right) =>
        right.count - left.count ||
        (left.text < right.text ? -1 : left.text > right.text ? 1 : 0),
    )
    .slice(0, top)
  return { total, distinct: map.size, overflow, items }
}

/** Read one JSONL file and fold its in-window `web_search` records. */
async function scanFile(file, state) {
  let stream
  try {
    await stat(file)
  } catch (error) {
    if (error?.code !== 'ENOENT') state.unreadable += 1
    return
  }
  try {
    stream = createReadStream(file, { encoding: 'utf8' })
    const reader = createInterface({ input: stream, crlfDelay: Infinity })
    for await (const line of reader) {
      const trimmed = line.trim()
      if (trimmed === '') continue
      let record
      try {
        record = JSON.parse(trimmed)
      } catch {
        continue
      }
      if (record === null || typeof record !== 'object' || record.tool !== 'web_search') continue
      const ts = typeof record.ts === 'string' ? record.ts : ''
      if (ts === '') continue
      const date = new Date(ts)
      if (Number.isNaN(date.getTime())) continue
      if (state.earliestTs === undefined || ts < state.earliestTs) state.earliestTs = ts

      const day = state.dayOf(date)
      if (!state.daySet.has(day)) continue
      state.matched += 1
      const bucket = state.buckets.get(day)
      // A failed call still belongs to a session, so it counts toward the
      // session metric even though it contributes no queries or sources.
      if (typeof record.sessionId === 'string' && record.sessionId !== '') {
        state.totals.sessions.add(record.sessionId)
        if (state.daySessions.has(day)) state.daySessions.get(day).add(record.sessionId)
      }
      if (record.ok === false) {
        bucket.failedCalls += 1
        state.totals.failedCalls += 1
        continue
      }

      const queries = []
      if (Array.isArray(record.queries)) {
        for (const query of record.queries) {
          const text = normalizeQuery(query)
          if (text !== '') queries.push(text)
        }
      }
      if (queries.length === 0) continue

      const sources = Number.isFinite(record.sourceCount)
        ? record.sourceCount
        : Array.isArray(record.sources)
          ? record.sources.length
          : 0
      bucket.calls += 1
      bucket.queries += queries.length
      bucket.sources += sources
      state.totals.calls += 1
      state.totals.queries += queries.length
      state.totals.sources += sources

      for (const text of queries) {
        addKeyword(state.queryMap, text.toLowerCase(), text, 1, state.queryState)
        state.queryOccurrences += 1
      }
    }
  } catch {
    state.unreadable += 1
  } finally {
    if (stream !== undefined) stream.destroy()
  }
}

/**
 * Fold every log file into the statistics payload.
 *
 * @param {string[]} files - log paths, oldest first.
 * @param {{ days?: number, timeZone?: string, now?: number, maxKeywords?: number }} [options] -
 *   window, timezone, clock, and the distinct-key cap (tests lower it).
 * @returns {Promise<ReturnType<typeof shapeResult>>} statistics payload.
 */
export async function aggregateLogs(files, options = {}) {
  const days = clampDays(options.days ?? STATS_DEFAULT_DAYS)
  const timeZone = resolveTimeZone(options.timeZone)
  const now = Number.isFinite(options.now) ? options.now : Date.now()
  const maxKeywords =
    Number.isInteger(options.maxKeywords) && options.maxKeywords > 0
      ? options.maxKeywords
      : STATS_MAX_KEYWORDS

  const dayOf = dayFormatter(timeZone)
  const labels = buildDayWindow(timeZone, days, now)
  const buckets = new Map(
    labels.map((day) => [
      day,
      { day, calls: 0, queries: 0, failedCalls: 0, sources: 0 },
    ]),
  )
  const daySessions = new Map(labels.map((day) => [day, new Set()]))

  const state = {
    dayOf,
    daySet: new Set(labels),
    buckets,
    daySessions,
    totals: { calls: 0, queries: 0, sessions: new Set(), failedCalls: 0, sources: 0 },
    queryMap: new Map(),
    queryState: { maxKeywords, overflow: 0 },
    queryOccurrences: 0,
    termTotal: 0,
    earliestTs: undefined,
    matched: 0,
    unreadable: 0,
  }

  for (const file of files) await scanFile(file, state)

  // Terms are derived from the retained whole queries, weighted by how often
  // each query appeared, so one scan serves both modes.
  const termMap = new Map()
  const termState = { maxKeywords, overflow: 0 }
  for (const entry of state.queryMap.values()) {
    for (const term of splitTerms(entry.text)) {
      addKeyword(termMap, term, term, entry.count, termState)
      state.termTotal += entry.count
    }
  }

  return shapeResult({
    timeZone,
    from: labels[0],
    to: labels[labels.length - 1],
    now,
    buckets,
    daySessions,
    totals: state.totals,
    matched: state.matched,
    unreadable: state.unreadable,
    fileCount: files.length,
    earliestTs: state.earliestTs,
    dayOf,
    queryMap: state.queryMap,
    queryTotal: state.queryOccurrences,
    queryState: state.queryState,
    termMap,
    termTotal: state.termTotal,
    termState,
  })
}

/** Build the wire payload from the scan state. */
function shapeResult(result) {
  return {
    timeZone: result.timeZone,
    from: result.from,
    to: result.to,
    generatedAt: new Date(result.now).toISOString(),
    coverage: {
      files: result.fileCount,
      unreadableFiles: result.unreadable,
      matchedRecords: result.matched,
      ...(result.earliestTs !== undefined
        ? { earliestDay: result.dayOf(new Date(result.earliestTs)) }
        : {}),
    },
    totals: {
      calls: result.totals.calls,
      queries: result.totals.queries,
      sessions: result.totals.sessions.size,
      failedCalls: result.totals.failedCalls,
      sources: result.totals.sources,
    },
    daily: [...result.buckets.values()].map((bucket) => ({
      day: bucket.day,
      calls: bucket.calls,
      queries: bucket.queries,
      sessions: result.daySessions.get(bucket.day)?.size ?? 0,
      failedCalls: bucket.failedCalls,
      sources: bucket.sources,
    })),
    keywords: {
      queries: rankKeywords(
        result.queryMap,
        result.queryTotal,
        result.queryState.overflow,
        STATS_TOP_KEYWORDS,
      ),
      terms: rankKeywords(result.termMap, result.termTotal, result.termState.overflow, STATS_TOP_KEYWORDS),
    },
  }
}

/** Read one request query parameter as a decoded string. */
function paramOf(request, name) {
  const url = request?.url ?? ''
  const index = url.indexOf('?')
  if (index < 0) return ''
  const query = url.slice(index + 1)
  for (const pair of query.split('&')) {
    const equal = pair.indexOf('=')
    const key = equal < 0 ? pair : pair.slice(0, equal)
    try {
      if (decodeURIComponent(key) !== name) continue
      return equal < 0 ? '' : decodeURIComponent(pair.slice(equal + 1).replace(/\+/gu, ' '))
    } catch {
      continue
    }
  }
  return ''
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

/** Signature of the current log set, used as the cache key. */
async function signatureOf(files) {
  const parts = []
  for (const file of files) {
    try {
      const info = await stat(file)
      parts.push(`${file}:${info.size}:${info.mtimeMs}`)
    } catch {
      parts.push(`${file}:missing`)
    }
  }
  return parts.join('|')
}

/** Store a result, evicting the oldest entry when the cache is full. */
function remember(key, value) {
  cache.set(key, { at: Date.now(), value })
  while (cache.size > CACHE_MAX_ENTRIES) {
    const oldest = cache.keys().next().value
    cache.delete(oldest)
  }
}

/**
 * Answer one statistics request.
 *
 * @param {() => string} getFile - returns the current active log path.
 * @param {any} request - incoming request.
 * @param {any} response - outgoing response.
 */
async function handleStats(getFile, request, response) {
  if (request.method !== 'GET') {
    response.writeHead(405, { allow: 'GET' })
    response.end()
    return
  }
  if (!isTrustedQuickSearchRequest(request)) {
    sendJson(response, 403, { ok: false, error: { code: 'FORBIDDEN', message: 'request is not trusted' } })
    return
  }
  try {
    const days = clampDays(paramOf(request, 'days') || undefined)
    const timeZone = resolveTimeZone(paramOf(request, 'tz'))
    const refresh = paramOf(request, 'refresh') === '1'
    const files = await listLogFiles(getFile())
    const signature = await signatureOf(files)
    const key = `${days}|${timeZone}|${signature}`
    const hit = cache.get(key)
    let value
    if (!refresh && hit !== undefined && Date.now() - hit.at < CACHE_TTL_MS) {
      value = hit.value
    } else {
      value = await aggregateLogs(files, { days, timeZone })
      remember(key, value)
    }
    sendJson(response, 200, { ok: true, value })
  } catch (error) {
    sendJson(response, 200, {
      ok: false,
      error: {
        code: typeof error?.code === 'string' ? error.code : 'STATS_READ_ERROR',
        message: error instanceof Error ? error.message : String(error),
      },
    })
  }
}

/**
 * Install the statistics route when this composition owns a web server.
 *
 * @param {any} ctx - host plugin context.
 * @param {() => string} getFile - returns the current active log path.
 */
export function installStatsRoute(ctx, getFile) {
  if (typeof ctx?.inject !== 'function') return
  const getter = typeof getFile === 'function' ? getFile : () => ''
  ctx.inject(['webServer'], (scope) => {
    scope.effect(
      () =>
        scope.webServer.register({
          kind: 'exact',
          path: STATS_PATH,
          handler: (request, response) => handleStats(getter, request, response),
        }),
      'web-search-insights: stats route',
    )
  })
}
