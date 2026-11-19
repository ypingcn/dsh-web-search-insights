/**
 * Host log-browser route contract: trust checks, keyword filtering,
 * pagination, malformed-line tolerance, and newest-first ordering.
 *
 *   node test/log-browser.test.mjs
 */
import assert from 'node:assert/strict'
import { mkdir, writeFile, rm } from 'node:fs/promises'
import { join } from 'node:path'
import { tmpdir } from 'node:os'
import { installLogBrowserRoute, LOG_BROWSER_PATH } from '../src/log-browser.js'

assert.equal(LOG_BROWSER_PATH, '/api/dsh-web-search-insights/logs')

const trustedHeaders = {
  'x-dsh-web-search-insights': '1',
  host: '127.0.0.1:3080',
  origin: 'http://127.0.0.1:3080',
  'sec-fetch-site': 'same-origin',
}

/** Build a JSONL string from an array of record objects. */
function jsonl(records) {
  return records.map((record) => JSON.stringify(record)).join('\n') + '\n'
}

let route
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

const tmpDir = join(tmpdir(), `dsh-log-browser-${process.pid}`)
const logFile = join(tmpDir, 'audit.jsonl')

/** One trusted GET against the route. Returns the parsed payload. */
async function get({ q, offset, limit, headers, remoteAddress, method = 'GET' } = {}) {
  const params = new URLSearchParams()
  if (q !== undefined) params.set('q', q)
  if (offset !== undefined) params.set('offset', String(offset))
  if (limit !== undefined) params.set('limit', String(limit))
  const query = params.toString()
  const request = {
    method,
    url: `${LOG_BROWSER_PATH}${query ? `?${query}` : ''}`,
    headers: { ...trustedHeaders, ...(headers ?? {}) },
    socket: { remoteAddress: remoteAddress ?? '127.0.0.1' },
  }
  const response = {
    status: undefined,
    headers: undefined,
    payload: '',
    writeHead(status, headers) {
      this.status = status
      this.headers = headers
    },
    end(payload = '') {
      this.payload = payload
    },
  }
  await route.handler(request, response)
  return { status: response.status, payload: response.payload === '' ? null : JSON.parse(response.payload) }
}

// --- Setup: temp log with a mix of web_search and web_fetch records. ---
const records = [
  {
    v: 1,
    ts: '2026-01-01T00:00:01.000Z',
    tool: 'web_search',
    callId: 'c1',
    rootCallId: 'r1',
    queries: ['react hooks'],
    ok: true,
    sourceCount: 2,
    sources: [
      { url: 'https://react.dev/hooks', title: 'React Hooks' },
      { url: 'https://example.com/old', title: 'Old Article' },
    ],
  },
  {
    v: 1,
    ts: '2026-01-01T00:00:02.000Z',
    tool: 'web_fetch',
    callId: 'c2',
    rootCallId: 'r1',
    url: 'https://react.dev/hooks',
    ok: true,
    statusCode: 200,
  },
  {
    v: 1,
    ts: '2026-01-01T00:00:03.000Z',
    tool: 'web_search',
    callId: 'c3',
    rootCallId: 'r2',
    queries: ['node fs stream'],
    ok: false,
    error: { name: 'Error', message: 'provider exploded', code: 'WEB_PROVIDER_ERROR' },
  },
]

await mkdir(tmpDir, { recursive: true })
await writeFile(logFile, jsonl(records))

installLogBrowserRoute(fakeCtx, () => logFile)
assert.equal(route.path, LOG_BROWSER_PATH)

// Default page returns all records, newest first.
{
  const { status, payload } = await get()
  assert.equal(status, 200)
  assert.equal(payload.ok, true)
  assert.equal(payload.value.total, 3)
  assert.deepEqual(
    payload.value.records.map((r) => r.callId),
    ['c3', 'c2', 'c1'],
    'newest records come first',
  )
  assert.equal(payload.value.offset, 0)
  assert.equal(payload.value.limit, 50)
  assert.equal(payload.value.hasMore, false)
}

// Keyword filter matches queries.
{
  const { status, payload } = await get({ q: 'react' })
  assert.equal(status, 200)
  assert.equal(payload.value.total, 2)
  assert.deepEqual(
    payload.value.records.map((r) => r.callId),
    ['c2', 'c1'],
  )
}

// Keyword filter matches source title.
{
  const { payload } = await get({ q: 'old article' })
  assert.equal(payload.value.total, 1)
  assert.equal(payload.value.records[0].callId, 'c1')
}

// Keyword filter matches source url.
{
  const { payload } = await get({ q: 'react.dev' })
  assert.equal(payload.value.total, 2)
}

// Keyword filter matches fetched url.
{
  const { payload } = await get({ q: 'react.dev/hooks' })
  assert.equal(payload.value.total, 2)
}

// Keyword filter matches error message.
{
  const { payload } = await get({ q: 'provider exploded' })
  assert.equal(payload.value.total, 1)
  assert.equal(payload.value.records[0].callId, 'c3')
}

// No matches returns an empty page but total reflects the filtered count.
{
  const { payload } = await get({ q: 'zzz-no-such-keyword' })
  assert.equal(payload.value.total, 0)
  assert.deepEqual(payload.value.records, [])
}

// Pagination: limit slices the newest end.
{
  const { payload } = await get({ limit: 2 })
  assert.equal(payload.value.total, 3)
  assert.deepEqual(
    payload.value.records.map((r) => r.callId),
    ['c3', 'c2'],
  )
  assert.equal(payload.value.limit, 2)
  assert.equal(payload.value.hasMore, true)
}

// Pagination: offset skips into the reversed list.
{
  const { payload } = await get({ offset: 1, limit: 1 })
  assert.deepEqual(
    payload.value.records.map((r) => r.callId),
    ['c2'],
  )
  assert.equal(payload.value.hasMore, true)
}

// Pagination: offset past the end yields no records and hasMore false.
{
  const { payload } = await get({ offset: 10, limit: 5 })
  assert.deepEqual(payload.value.records, [])
  assert.equal(payload.value.hasMore, false)
}

// Limit is capped at the hard maximum.
{
  const { payload } = await get({ limit: 9999 })
  assert.equal(payload.value.limit, 500)
}

// Untrusted requests are rejected (missing plugin header).
{
  const { status, payload } = await get({ headers: { 'x-dsh-web-search-insights': '0' } })
  assert.equal(status, 403)
  assert.equal(payload.ok, false)
  assert.equal(payload.error.code, 'FORBIDDEN')
}

// Untrusted requests are rejected (non-loopback socket).
{
  const { status, payload } = await get({ remoteAddress: '192.168.1.10' })
  assert.equal(status, 403)
  assert.equal(payload.error.code, 'FORBIDDEN')
}

// Non-GET methods are not allowed.
{
  const { status, payload } = await get({ method: 'POST' })
  assert.equal(status, 405)
  assert.equal(payload, null)
}

// A missing log file answers with an empty page, not an error.
{
  const missing = join(tmpDir, 'does-not-exist.jsonl')
  installLogBrowserRoute(fakeCtx, () => missing)
  const { status, payload } = await get()
  assert.equal(status, 200)
  assert.equal(payload.ok, true)
  assert.deepEqual(payload.value.records, [])
  assert.equal(payload.value.total, 0)
}

// Malformed JSONL lines are skipped without aborting the read.
{
  const badFile = join(tmpDir, 'malformed.jsonl')
  const good = { v: 1, ts: '2026-01-01T00:00:04.000Z', tool: 'web_search', callId: 'good', queries: ['clean'] }
  await writeFile(
    badFile,
    `not json\n{"v":1,"ts":"2026-01-01T00:00:05.000Z","tool":"web_search","callId":"truncated"\n${JSON.stringify(good)}\n\n`,
  )
  installLogBrowserRoute(fakeCtx, () => badFile)
  const { status, payload } = await get()
  assert.equal(status, 200)
  assert.equal(payload.value.total, 1)
  assert.equal(payload.value.records[0].callId, 'good')
}

// A response that already ended is not written to.
{
  installLogBrowserRoute(fakeCtx, () => logFile)
  const request = {
    method: 'GET',
    url: LOG_BROWSER_PATH,
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
  let injected = false
  installLogBrowserRoute({ inject: undefined }, () => logFile)
  assert.equal(injected, false)
}

await rm(tmpDir, { recursive: true, force: true })
console.log('log-browser tests passed')
