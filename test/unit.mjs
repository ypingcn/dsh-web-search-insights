/**
 * Unit tests for the framework baseline: real plugin, fake Cordis context,
 * real JSONL file. The disposer drains the writer queue, so reads are
 * deterministic without polling.
 *
 *   node test/unit.mjs
 */
import assert from 'node:assert/strict'
import { mkdtemp, readFile, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { apply, Config, name } from '../src/index.js'

/** Minimal Cordis context that records event handlers. */
function createContext() {
  const handlers = new Map()
  return {
    logger: { info() {}, warn() {}, error() {} },
    on(event, handler) {
      handlers.set(event, handler)
      return () => handlers.delete(event)
    },
    emit(event, ...args) {
      return handlers.get(event)?.(...args)
    },
  }
}

/** Fake successful `web_search` execution. */
function searchExec(overrides = {}) {
  return {
    name: 'web_search',
    callId: 'call_1',
    rootCallId: 'call_1',
    arguments: { queries: ['deepseek harness', 'dsh plugin'] },
    agent: {
      id: 'session-1',
      options: { provider: 'mint-dev', model: 'MintDevDS' },
      session: { meta: { cwd: '/home/user/project' } },
    },
    ...overrides,
  }
}

const successResult = {
  isError: false,
  value: {
    content: 'A short provider answer.',
    truncated: true,
    sources: [
      {
        url: 'https://example.com/a',
        title: 'Example A',
        snippet: 'Snippet A',
        publishedAt: '2026-01-02',
      },
      { url: 'https://example.com/b', title: 'Example B' },
      { url: '', title: 'dropped: empty url' },
    ],
  },
}

/** Read all records after the disposer has flushed the queue. */
async function readRecords(file) {
  const text = await readFile(file, 'utf8')
  return text.split('\n').filter((line) => line.trim() !== '').map((line) => JSON.parse(line))
}

const root = await mkdtemp(join(tmpdir(), 'dsh-web-search-logger-'))

try {
  // 1. Success: keywords, titles, URLs, session metadata; snippet opt-in.
  const file = join(root, 'nested', 'web-search.jsonl')
  let ctx = createContext()
  let dispose = apply(ctx, { file, includeSnippet: true })
  ctx.emit('tools/result', searchExec(), successResult)
  await dispose()
  let [record] = await readRecords(file)
  assert.equal(record.v, 1)
  assert.equal(record.tool, 'web_search')
  assert.equal(record.sessionId, 'session-1')
  assert.equal(record.provider, 'mint-dev')
  assert.equal(record.model, 'MintDevDS')
  assert.equal(record.cwd, '/home/user/project')
  assert.deepEqual(record.queries, ['deepseek harness', 'dsh plugin'])
  assert.equal(record.ok, true)
  assert.equal(record.sourceCount, 2)
  assert.equal(record.truncated, true)
  assert.deepEqual(record.sources, [
    {
      url: 'https://example.com/a',
      title: 'Example A',
      snippet: 'Snippet A',
      publishedAt: '2026-01-02',
    },
    { url: 'https://example.com/b', title: 'Example B' },
  ])
  assert.equal(record.answer, undefined, 'answer is opt-in')
  assert.match(record.ts, /^\d{4}-\d{2}-\d{2}T/)

  // 2. Snippets stay off by default; answer opt-in.
  const plain = join(root, 'plain.jsonl')
  ctx = createContext()
  dispose = apply(ctx, { file: plain, includeAnswer: true })
  ctx.emit('tools/result', searchExec(), successResult)
  await dispose()
  ;[record] = await readRecords(plain)
  assert.equal(record.sources[0].snippet, undefined)
  assert.equal(record.answer, 'A short provider answer.')

  // 3. Failures record their structured error.
  const errors = join(root, 'errors.jsonl')
  ctx = createContext()
  dispose = apply(ctx, { file: errors })
  ctx.emit('tools/result', searchExec(), {
    isError: true,
    error: {
      message: 'provider exploded',
      info: { name: 'WebError', code: 'WEB_PROVIDER_ERROR' },
    },
  })
  await dispose()
  ;[record] = await readRecords(errors)
  assert.equal(record.ok, false)
  assert.deepEqual(record.error, {
    message: 'provider exploded',
    name: 'WebError',
    code: 'WEB_PROVIDER_ERROR',
  })

  // 4. Ignored inputs write nothing: other tools, blank queries, disabled.
  const ignored = join(root, 'ignored.jsonl')
  ctx = createContext()
  dispose = apply(ctx, { file: ignored })
  ctx.emit('tools/result', { ...searchExec(), name: 'bash' }, successResult)
  ctx.emit('tools/result', searchExec({ arguments: { queries: ['  '] } }), successResult)
  await dispose()
  await assert.rejects(() => readFile(ignored, 'utf8'))

  const disabledFile = join(root, 'disabled.jsonl')
  ctx = createContext()
  dispose = apply(ctx, { file: disabledFile, enabled: false })
  ctx.emit('tools/result', searchExec(), successResult)
  await dispose()
  await assert.rejects(() => readFile(disabledFile, 'utf8'))

  // 5. A malformed result never throws into the host.
  const malformed = join(root, 'malformed.jsonl')
  ctx = createContext()
  dispose = apply(ctx, { file: malformed })
  assert.doesNotThrow(() =>
    ctx.emit('tools/result', searchExec(), { isError: false, value: { sources: 'nope' } }),
  )
  await dispose()
  ;[record] = await readRecords(malformed)
  assert.deepEqual(record.sources, [])
  assert.equal(record.sourceCount, 0)

  // 6. Wrong config types fail loud instead of silently defaulting.
  assert.throws(() => apply(createContext(), { file: 42 }), /`file` must be a non-empty string/)
  assert.throws(() => apply(createContext(), { enabled: 'yes' }), /`enabled` must be a boolean/)

  // 7. Schema (when the peer resolves) supplies defaults.
  if (Config) {
    const defaults = Config({})
    assert.equal(defaults.enabled, true)
    assert.equal(defaults.file, '~/.dsh/logs/web-search.jsonl')
    assert.deepEqual(defaults.tools, ['web_search'])
  } else {
    console.log('note: @deepseek-ai/schemastery unavailable; Config schema assertions skipped')
  }

  console.log(`dsh-web-search-logger (${name}): unit tests passed`)
} finally {
  await rm(root, { recursive: true, force: true })
}
