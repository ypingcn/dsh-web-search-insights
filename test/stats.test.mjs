/**
 * Host statistics contract: day bucketing, timezone handling, rotated logs,
 * malformed-line tolerance, both keyword modes, and route safety.
 *
 *   node test/stats.test.mjs
 */
import assert from 'node:assert/strict'
import { mkdir, rm, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import { tmpdir } from 'node:os'
import {
  aggregateLogs,
  buildDayWindow,
  clampDays,
  installStatsRoute,
  listLogFiles,
  resolveTimeZone,
  splitTerms,
  STATS_PATH,
} from '../src/stats.js'

assert.equal(STATS_PATH, '/api/dsh-web-search-insights/stats')

/** Build a JSONL string from an array of record objects. */
function jsonl(records) {
  return records.map((record) => JSON.stringify(record)).join('\n') + '\n'
}

/** One successful web_search record. */
function search(ts, queries, extra = {}) {
  return {
    v: 1,
    ts,
    tool: 'web_search',
    callId: `call-${ts}-${queries.join('-')}`,
    queries,
    ok: true,
    ...extra,
  }
}

const tmpDir = join(tmpdir(), `dsh-stats-${process.pid}`)
const logFile = join(tmpDir, 'web-search.jsonl')
const rotatedFile = join(tmpDir, 'web-search.jsonl.2026-01-02T00-00-00-000Z')
const unrelatedFile = join(tmpDir, 'other.jsonl')

// --- Setup: active log, a rotated sibling, and an unrelated file. ---
await mkdir(tmpDir, { recursive: true })
await writeFile(
  logFile,
  jsonl([
      search('2026-01-01T15:30:00.000Z', ['Alpha', 'alpha beta'], {
        sessionId: 's1',
        sourceCount: 3,
      }),
      search('2026-01-01T16:30:00.000Z', ['Alpha'], { sessionId: 's1', sourceCount: 2 }),
      {
        v: 1,
        ts: '2026-01-02T01:00:00.000Z',
        tool: 'web_search',
        callId: 'failed',
        queries: ['failed query'],
        ok: false,
        sessionId: 's2',
        error: { message: 'provider failed' },
      },
      {
        v: 1,
        ts: '2026-01-02T02:00:00.000Z',
        tool: 'web_fetch',
        callId: 'fetch',
        url: 'https://example.test/',
        ok: true,
      },
      'not json',
      '',
    ]),
    { mode: 0o600 },
)
await writeFile(
  rotatedFile,
  jsonl([search('2026-01-02T03:00:00.000Z', ['Rotated'], { sessionId: 's3', sourceCount: 1 })]),
)
await writeFile(unrelatedFile, jsonl([search('2026-01-02T04:00:00.000Z', ['unrelated'])]))

// The route uses the real clock, so its fixture must sit inside the current
// window; aggregation tests above pin `now` explicitly instead.
const routeFile = join(tmpDir, 'route.jsonl')
const minutesAgo = (minutes) => new Date(Date.now() - minutes * 60_000).toISOString()
await writeFile(
  routeFile,
  jsonl([
    search(minutesAgo(120), ['Route A'], { sessionId: 'route-1', sourceCount: 2 }),
    search(minutesAgo(60), ['Route B'], { sessionId: 'route-2', sourceCount: 1 }),
    {
      v: 1,
      ts: minutesAgo(30),
      tool: 'web_search',
      callId: 'route-failed',
      queries: ['Route failed'],
      ok: false,
      sessionId: 'route-3',
      error: { message: 'provider failed' },
    },
  ]),
)

// --- Log discovery ---
{
  const files = await listLogFiles(logFile)
  assert.deepEqual(files.sort(), [logFile, rotatedFile].sort())
  assert.equal((await listLogFiles('')).length, 0)
  assert.equal((await listLogFiles(join(tmpDir, 'missing.jsonl'))).length, 0)
}

// --- Aggregation in Asia/Shanghai across the UTC day boundary ---
const now = Date.parse('2026-01-03T00:00:00Z')
const shanghai = await aggregateLogs([logFile, rotatedFile], {
  days: 7,
  timeZone: 'Asia/Shanghai',
  now,
})

assert.equal(shanghai.from, '2025-12-28')
assert.equal(shanghai.to, '2026-01-03')
assert.equal(shanghai.daily.length, 7)
assert.deepEqual(shanghai.totals, {
  calls: 3,
  queries: 4,
  sessions: 3,
  failedCalls: 1,
  sources: 6,
})
assert.equal(shanghai.coverage.files, 2)
assert.equal(shanghai.coverage.matchedRecords, 4)
assert.equal(shanghai.coverage.earliestDay, '2026-01-01')

const byDay = Object.fromEntries(shanghai.daily.map((entry) => [entry.day, entry]))
// 15:30Z is 23:30 in Shanghai; 16:30Z is 00:30 the next day.
assert.equal(byDay['2026-01-01'].calls, 1)
assert.equal(byDay['2026-01-01'].queries, 2)
assert.equal(byDay['2026-01-02'].calls, 2)
assert.equal(byDay['2026-01-02'].queries, 2)
assert.equal(byDay['2026-01-02'].failedCalls, 1)
assert.equal(byDay['2026-01-02'].sessions, 3)
// Days with no records are still present as zero rows.
assert.equal(byDay['2025-12-31'].calls, 0)

// --- The same instants bucket differently in UTC ---
const utc = await aggregateLogs([logFile], { days: 7, timeZone: 'UTC', now })
const utcByDay = Object.fromEntries(utc.daily.map((entry) => [entry.day, entry]))
assert.equal(utcByDay['2026-01-01'].calls, 2)
assert.equal(utcByDay['2026-01-01'].queries, 3)
assert.equal(utcByDay['2026-01-02'].calls, 0)
assert.equal(utc.daily.length, 7)

// --- Keyword modes ---
assert.deepEqual(shanghai.keywords.queries.items, [
  { text: 'Alpha', count: 2 },
  { text: 'Rotated', count: 1 },
  { text: 'alpha beta', count: 1 },
])
assert.equal(shanghai.keywords.queries.total, 4)
assert.equal(shanghai.keywords.queries.distinct, 3)
assert.deepEqual(shanghai.keywords.terms.items, [
  { text: 'alpha', count: 3 },
  { text: 'beta', count: 1 },
  { text: 'rotated', count: 1 },
])
assert.equal(shanghai.keywords.terms.total, 5)

// --- Distinct-key cap folds extra keys into `overflow` occurrences ---
const capped = await aggregateLogs([logFile, rotatedFile], {
  days: 7,
  timeZone: 'Asia/Shanghai',
  now,
  maxKeywords: 1,
})
assert.equal(capped.keywords.queries.distinct, 1)
assert.equal(capped.keywords.queries.overflow, 2)
assert.equal(capped.keywords.queries.items.length, 1)

// --- Empty inputs ---
{
  const empty = await aggregateLogs([], { days: 3, timeZone: 'UTC', now })
  assert.equal(empty.daily.length, 3)
  assert.deepEqual(empty.totals, { calls: 0, queries: 0, sessions: 0, failedCalls: 0, sources: 0 })
  assert.equal(empty.coverage.earliestDay, undefined)
  assert.equal(empty.keywords.queries.total, 0)
  assert.equal(empty.keywords.terms.total, 0)
}

// --- Helpers ---
assert.deepEqual(splitTerms('The Quick, brown-fox 中文 查询 a'), ['quick', 'brown', 'fox', '中文', '查询'])
assert.deepEqual(splitTerms('  '), [])
assert.equal(resolveTimeZone('UTC'), 'UTC')
assert.equal(resolveTimeZone('Not/AZone'), Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC')
assert.equal(resolveTimeZone(''), Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC')
assert.equal(clampDays(undefined), 30)
assert.equal(clampDays('0'), 30)
assert.equal(clampDays('7'), 7)
assert.equal(clampDays('9999'), 365)

// DST: a continuous window around the spring-forward date has no gaps.
{
  const labels = buildDayWindow('America/New_York', 7, Date.parse('2026-03-10T12:00:00Z'))
  assert.deepEqual(labels, [
    '2026-03-04',
    '2026-03-05',
    '2026-03-06',
    '2026-03-07',
    '2026-03-08',
    '2026-03-09',
    '2026-03-10',
  ])
}

// --- Route ---
const trustedHeaders = {
  'x-dsh-web-search-insights': '1',
  host: '127.0.0.1:3080',
  origin: 'http://127.0.0.1:3080',
  'sec-fetch-site': 'same-origin',
}

let route
let activeFile = routeFile
const fakeCtx = {
  inject(services, factory) {
    assert.deepEqual(services, ['webServer'])
    factory({
      effect: (fn) => fn(),
      webServer: {
        register(definition) {
          route = definition
          return () => {}
        },
      },
    })
  },
}

installStatsRoute(fakeCtx, () => activeFile)
assert.equal(route.path, STATS_PATH)

async function get({ days, tz, refresh, headers, remoteAddress, method = 'GET' } = {}) {
  const params = new URLSearchParams()
  if (days !== undefined) params.set('days', String(days))
  if (tz !== undefined) params.set('tz', tz)
  if (refresh !== undefined) params.set('refresh', refresh)
  const query = params.toString()
  const request = {
    method,
    url: `${STATS_PATH}${query === '' ? '' : `?${query}`}`,
    headers: { ...trustedHeaders, ...(headers ?? {}) },
    socket: { remoteAddress: remoteAddress ?? '127.0.0.1' },
  }
  const response = {
    status: undefined,
    headers: undefined,
    payload: '',
    writeHead(status, responseHeaders) {
      this.status = status
      this.headers = responseHeaders
    },
    end(payload = '') {
      this.payload = payload
    },
  }
  await route.handler(request, response)
  return {
    status: response.status,
    payload: response.payload === '' ? null : JSON.parse(response.payload),
  }
}

{
  const { status, payload } = await get({ days: 7, tz: 'Asia/Shanghai' })
  assert.equal(status, 200)
  assert.equal(payload.ok, true)
  assert.equal(payload.value.totals.calls, 2)
  assert.equal(payload.value.totals.failedCalls, 1)
  assert.equal(payload.value.timeZone, 'Asia/Shanghai')
  assert.equal(payload.value.daily.length, 7)
  assert.equal(payload.headers, undefined)
  assert.equal(typeof payload.value.generatedAt, 'string')
}

{
  const { status, payload } = await get({ days: 0 })
  assert.equal(status, 200)
  assert.equal(payload.value.daily.length, 30)
}

{
  const { status, payload } = await get({ tz: 'Not/AZone' })
  assert.equal(status, 200)
  assert.equal(payload.value.timeZone, Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC')
}

{
  const { status } = await get({ method: 'POST' })
  assert.equal(status, 405)
}

{
  const { status, payload } = await get({ headers: { host: '' } })
  assert.equal(status, 403)
  assert.equal(payload.error.code, 'FORBIDDEN')
}

{
  activeFile = join(tmpDir, 'does-not-exist.jsonl')
  const { status, payload } = await get()
  assert.equal(status, 200)
  assert.equal(payload.ok, true)
  assert.equal(payload.value.totals.calls, 0)
  assert.equal(payload.value.daily.length, 30)
  activeFile = routeFile
}

// --- Appending invalidates the cache through the file signature ---
{
  const first = await get({ days: 7, tz: 'Asia/Shanghai' })
  assert.equal(first.payload.value.totals.calls, 2)
  await writeFile(
    routeFile,
    jsonl([search(new Date().toISOString(), ['Fresh keyword'], { sessionId: 'route-4' })]),
    { flag: 'a' },
  )
  const second = await get({ days: 7, tz: 'Asia/Shanghai' })
  assert.equal(second.payload.value.totals.calls, 3)
}

// A response that already ended is not written to.
{
  const request = {
    method: 'GET',
    url: STATS_PATH,
    headers: { ...trustedHeaders },
    socket: { remoteAddress: '127.0.0.1' },
  }
  const response = {
    writableEnded: true,
    status: undefined,
    payload: '',
    writeHead() {
      this.status = 'called'
    },
    end(payload = '') {
      this.payload = payload
    },
  }
  await route.handler(request, response)
  assert.equal(response.status, undefined)
  assert.equal(response.payload, '')
}

// No inject() means the route is a no-op (plugin without a web server).
{
  installStatsRoute({ inject: undefined }, () => logFile)
}

await rm(tmpDir, { recursive: true, force: true })
console.log('stats tests passed')
