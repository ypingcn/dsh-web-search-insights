/**
 * Host quick-search route contract: validation, trust checks, and the response
 * envelope the browser view consumes.
 *
 *   node test/quick-search.test.mjs
 */
import assert from 'node:assert/strict'
import {
  QUICK_SEARCH_LIMITS,
  QUICK_SEARCH_PATH,
  installQuickSearchRoute,
  isTrustedQuickSearchRequest,
  readQuickSearchRequest,
} from '../src/quick-search.js'

assert.deepEqual(QUICK_SEARCH_LIMITS, [5, 10, 15, 20])
assert.equal(QUICK_SEARCH_PATH, '/api/dsh-web-search-insights/quick-search')

assert.deepEqual(readQuickSearchRequest({ query: '  hello  ' }), { query: 'hello', limit: 10 })
assert.deepEqual(readQuickSearchRequest({ query: 'hello', limit: 20 }), { query: 'hello', limit: 20 })
assert.match(readQuickSearchRequest({ query: '   ' }).error, /non-empty/)
assert.match(readQuickSearchRequest({ query: 'hello', limit: 12 }).error, /limit must be one of/)
assert.match(readQuickSearchRequest({ query: 'x'.repeat(501) }).error, /at most/)

const trustedRequest = {
  headers: {
    'x-dsh-web-search-insights': '1',
    host: '127.0.0.1:3080',
    origin: 'http://127.0.0.1:3080',
    'sec-fetch-site': 'same-origin',
  },
  socket: { remoteAddress: '127.0.0.1' },
}
assert.equal(isTrustedQuickSearchRequest(trustedRequest), true)
assert.equal(isTrustedQuickSearchRequest({ ...trustedRequest, headers: {} }), false)
assert.equal(isTrustedQuickSearchRequest({ ...trustedRequest, socket: { remoteAddress: '192.168.1.10' } }), false)
assert.equal(
  isTrustedQuickSearchRequest({
    ...trustedRequest,
    headers: { ...trustedRequest.headers, origin: 'http://evil.test:3080' },
  }),
  false,
)

let route
let searchRequest
const fakeCtx = {
  inject(services, factory) {
    assert.deepEqual(services, ['web', 'webServer'])
    factory({
      effect: (fn) => fn(),
      web: {
        async search(request) {
          searchRequest = request
          return {
            sources: [
              { url: 'https://a.test/x', title: 'A', snippet: 'snippet A', publishedAt: '2026-01-02' },
              { url: 'https://b.test/y', extra: 'dropped' },
            ],
            truncated: true,
          }
        },
      },
      webServer: {
        register(definition) {
          route = definition
          return () => {}
        },
      },
    })
  },
}
installQuickSearchRoute(fakeCtx)
assert.equal(route.path, QUICK_SEARCH_PATH)

/** Request/response doubles for one route invocation. */
function exchange(body, overrides = {}) {
  const request = {
    method: 'POST',
    headers: { ...trustedRequest.headers, ...overrides.headers },
    socket: { remoteAddress: overrides.remoteAddress ?? '127.0.0.1' },
    async *[Symbol.asyncIterator]() {
      if (body !== undefined) yield Buffer.from(JSON.stringify(body))
    },
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
  return { request, response }
}

{
  const { request, response } = exchange({ query: 'hello', limit: 5 })
  await route.handler(request, response)
  assert.equal(response.status, 200)
  assert.deepEqual(JSON.parse(response.payload), {
    ok: true,
    value: {
      sources: [
        { url: 'https://a.test/x', title: 'A', snippet: 'snippet A', publishedAt: '2026-01-02' },
        { url: 'https://b.test/y' },
      ],
      truncated: true,
    },
  })
  assert.deepEqual(searchRequest, { query: 'hello', maxResults: 5 })
}

{
  const { request, response } = exchange({ query: 'hello', limit: 12 })
  await route.handler(request, response)
  assert.equal(response.status, 400)
  assert.equal(JSON.parse(response.payload).error.code, 'BAD_REQUEST')
}

{
  const { request, response } = exchange({ query: 'hello' }, { headers: { 'x-dsh-web-search-insights': '0' } })
  await route.handler(request, response)
  assert.equal(response.status, 403)
  assert.equal(JSON.parse(response.payload).error.code, 'FORBIDDEN')
}

{
  const { request, response } = exchange(undefined)
  request.method = 'GET'
  await route.handler(request, response)
  assert.equal(response.status, 405)
}

{
  const failing = {
    inject(services, factory) {
      factory({
        effect: (fn) => fn(),
        web: {
          async search() {
            const error = new Error('provider exploded')
            error.code = 'WEB_PROVIDER_ERROR'
            throw error
          },
        },
        webServer: {
          register(definition) {
            route = definition
            return () => {}
          },
        },
      })
    },
  }
  installQuickSearchRoute(failing)
  const { request, response } = exchange({ query: 'hello' })
  await route.handler(request, response)
  assert.equal(response.status, 200)
  assert.deepEqual(JSON.parse(response.payload), {
    ok: false,
    error: { code: 'WEB_PROVIDER_ERROR', message: 'provider exploded' },
  })
}

console.log('quick-search tests passed')
