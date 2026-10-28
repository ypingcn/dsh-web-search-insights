/**
 * Unit tests for the framework baseline: real plugin, fake Cordis context,
 * real JSONL file. The disposer drains the writer queue, so reads are
 * deterministic without polling.
 *
 *   node test/unit.mjs
 */
import assert from 'node:assert/strict'
import { mkdir, mkdtemp, readFile, readdir, rm, stat, utimes, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { apply, Config, name } from '../src/index.js'
import { normalizeConfig, readConfigField, snapshotConfig } from '../src/config.js'
import { JsonlWriter } from '../src/writer.js'

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

const root = await mkdtemp(join(tmpdir(), 'dsh-web-search-insights-'))

try {
  // 1. Success: keywords, titles, URLs, session metadata; snippet/answer never recorded.
  const file = join(root, 'nested', 'web-search.jsonl')
  let ctx = createContext()
  let dispose = apply(ctx, { file })
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
      publishedAt: '2026-01-02',
    },
    { url: 'https://example.com/b', title: 'Example B' },
  ])
  assert.equal(record.answer, undefined, 'provider answer is not recorded')
  assert.match(record.ts, /^\d{4}-\d{2}-\d{2}T/)
  if (process.platform !== 'win32') {
    assert.equal((await stat(file)).mode & 0o777, 0o600, 'a new log file is owner-only')
  }

  // 2. Failures record their structured error.
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

  // 3. Ignored inputs write nothing: other tools, blank queries, disabled.
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

  // Legacy `tools` keys in existing profiles are ignored; the observer is
  // fixed to web_search instead of trusting a now-removed allowlist.
  const legacy = join(root, 'legacy.jsonl')
  ctx = createContext()
  dispose = apply(ctx, { file: legacy, tools: ['bash'] })
  ctx.emit('tools/result', searchExec(), successResult)
  await dispose()
  assert.equal((await readRecords(legacy)).length, 1, 'legacy tools config no longer narrows observation')

  // Directory mode writes the fixed file name inside the configured directory.
  const directoryLogs = join(root, 'directory-mode')
  ctx = createContext()
  dispose = apply(ctx, { directory: directoryLogs })
  ctx.emit('tools/result', searchExec(), successResult)
  await dispose()
  assert.equal((await readRecords(join(directoryLogs, 'web-search.jsonl'))).length, 1)

  // 4. A malformed result never throws into the host.
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

  // 5. Wrong config types fail loud instead of silently defaulting.
  assert.throws(() => apply(createContext(), { directory: 42 }), /`directory` must be a non-empty string/)
  assert.throws(() => apply(createContext(), { file: 42 }), /`file` must be a non-empty string/)
  assert.throws(() => apply(createContext(), { enabled: 'yes' }), /`enabled` must be a boolean/)
  assert.throws(
    () => apply(createContext(), { quickSearchView: 'yes' }),
    /`quickSearchView` must be a boolean/,
  )
  assert.throws(
    () => apply(createContext(), { maxSizeMb: -1 }),
    /`maxSizeMb` must be a non-negative number/,
  )
  assert.throws(
    () => apply(createContext(), { maxSizeMb: '10' }),
    /`maxSizeMb` must be a non-negative number/,
  )
  assert.throws(() => apply(createContext(), { maxFiles: 1.5 }), /`maxFiles` must be a non-negative integer/)
  assert.throws(
    () => apply(createContext(), { retentionDays: '7' }),
    /`retentionDays` must be a non-negative integer/,
  )

  // 6. Volatile config refs: live edits move the writer and toggle logging.
  const liveA = join(root, 'live-a.jsonl')
  const liveB = join(root, 'live-b.jsonl')
  let liveEnabled = true
  let liveFile = liveA
  const liveConfig = {
    enabled: { get: () => liveEnabled },
    file: { get: () => liveFile },
    recordErrors: { get: () => true },
  }
  ctx = createContext()
  dispose = apply(ctx, liveConfig)
  ctx.emit('tools/result', searchExec(), successResult)
  liveFile = liveB
  ctx.emit('loader/volatile-update')
  ctx.emit('tools/result', searchExec(), successResult)
  liveEnabled = false
  ctx.emit('loader/volatile-update')
  ctx.emit('tools/result', searchExec(), successResult)
  await dispose()
  assert.equal((await readRecords(liveA)).length, 1, 'first write stays in A')
  assert.equal((await readRecords(liveB)).length, 1, 'second write follows the live file')
  assert.equal(liveEnabled, false)

  // 7. Host wiring: settings policy and the projection fiber follow `enabled`.
  let autoPolicy
  let projections = 0
  let projectionDisposals = 0
  const handlers = new Map()
  const wiringCtx = {
    logger: { info() {}, warn() {}, error() {} },
    fiber: {},
    on(event, handler) {
      handlers.set(event, handler)
      return () => handlers.delete(event)
    },
    inject(services, factory) {
      if (services.includes('webServer')) return { dispose() {} }
      if (services.includes('settings')) {
        factory({
          effect: (fn) => fn(),
          settings: {
            configure(options) {
              autoPolicy = options.auto
              return () => {}
            },
          },
        })
        return { dispose() {} }
      }
      if (services.includes('sessionProjections')) {
        factory({
          sessionProjections: {
            register() {
              projections += 1
            },
          },
        })
        return {
          dispose() {
            projectionDisposals += 1
          },
        }
      }
      throw new Error(`unexpected inject: ${services.join(', ')}`)
    },
  }
  let wiringEnabled = true
  const wiringConfig = {
    enabled: { get: () => wiringEnabled },
    file: { get: () => join(root, 'wiring.jsonl') },
    recordErrors: { get: () => true },
  }
  dispose = apply(wiringCtx, wiringConfig)
  assert.equal(autoPolicy, false, 'auto-generated settings page is suppressed')
  assert.equal(projections, 1)
  wiringEnabled = false
  handlers.get('loader/volatile-update')()
  assert.equal(projectionDisposals, 1, 'disabling disposes the projection fiber')
  wiringEnabled = true
  handlers.get('loader/volatile-update')()
  assert.equal(projections, 2, 're-enabling registers the projection again')
  await dispose()

  // 8. Size rotation keeps every record when `maxFiles` is unlimited.
  const logger = { warn() {} }
  const rotationDir = join(root, 'rotation')
  const rotationFile = join(rotationDir, 'web-search.jsonl')
  const rotationWriter = new JsonlWriter(rotationFile, logger, {
    maxBytes: 220,
    maxFiles: 0,
    retentionDays: 0,
  })
  for (let index = 0; index < 10; index += 1) {
    rotationWriter.append({ index, pad: 'x'.repeat(80) })
  }
  await rotationWriter.flush()
  let rotationNames = (await readdir(rotationDir)).sort()
  assert.equal(rotationNames.includes('web-search.jsonl'), true, 'the active file stays in place')
  assert.ok(
    rotationNames.some((entry) => entry.startsWith('web-search.jsonl.')),
    'the writer rotated at least once',
  )
  let rotatedLines = 0
  for (const entry of rotationNames) {
    rotatedLines += (await readFile(join(rotationDir, entry), 'utf8')).split('\n').filter(Boolean).length
  }
  assert.equal(rotatedLines, 10, 'rotation never drops a record')

  // 9. `maxFiles` keeps only the newest rotated files.
  const cappedDir = join(root, 'rotation-capped')
  const cappedWriter = new JsonlWriter(join(cappedDir, 'web-search.jsonl'), logger, {
    maxBytes: 220,
    maxFiles: 2,
    retentionDays: 0,
  })
  for (let index = 0; index < 10; index += 1) {
    cappedWriter.append({ index, pad: 'x'.repeat(80) })
  }
  await cappedWriter.flush()
  rotationNames = (await readdir(cappedDir)).sort()
  assert.equal(
    rotationNames.filter((entry) => entry.startsWith('web-search.jsonl.')).length,
    2,
    'maxFiles keeps exactly two rotated files',
  )

  // 10. Retention deletes only old rotated files, never unrelated ones.
  const retentionDir = join(root, 'retention')
  await mkdir(retentionDir, { recursive: true })
  const retentionFile = join(retentionDir, 'web-search.jsonl')
  const oldRotated = `${retentionFile}.2026-01-01T00-00-00-000Z`
  const unrelated = join(retentionDir, 'keep-me.txt')
  await writeFile(oldRotated, 'old\n')
  await writeFile(unrelated, 'keep\n')
  const monthAgo = new Date(Date.now() - 30 * 86_400_000)
  await utimes(oldRotated, monthAgo, monthAgo)
  const retentionWriter = new JsonlWriter(retentionFile, logger, {
    maxBytes: 10_000,
    maxFiles: 0,
    retentionDays: 7,
  })
  // Cleanup runs on the first append, without waiting for a rotation.
  retentionWriter.append({ pad: 'x'.repeat(10) })
  await retentionWriter.flush()
  const retained = await readdir(retentionDir)
  assert.equal(retained.includes('web-search.jsonl.2026-01-01T00-00-00-000Z'), false, 'expired file removed')
  assert.equal(retained.includes('keep-me.txt'), true, 'unrelated files are untouched')

  // 11. MB is the user-facing unit; the writer still receives bytes.
  assert.equal(snapshotConfig({ maxSizeMb: 0.5 }).maxBytes, 512 * 1024)
  assert.equal(snapshotConfig({ maxSizeMb: 0 }).maxBytes, 0)

  // 12. A directory fixes the active file name; legacy full paths still work.
  assert.match(
    normalizeConfig({ directory: '~/insights' }).file,
    /[\\/]insights[\\/]web-search\.jsonl$/,
  )
  assert.match(snapshotConfig({}).file, /[\\/]\.dsh[\\/]logs[\\/]web-search\.jsonl$/)
  const legacyPath = join(root, 'legacy-name.jsonl')
  assert.equal(normalizeConfig({ file: legacyPath }).file, legacyPath)
  assert.match(
    normalizeConfig({ directory: '~/insights', file: legacyPath }).file,
    /[\\/]insights[\\/]web-search\.jsonl$/,
    'directory wins over the deprecated file',
  )

  // 13. Schema (when the peer resolves) supplies volatile defaults.
  if (Config) {
    const defaults = Config({})
    assert.equal(readConfigField(defaults, 'enabled'), true)
    assert.equal(readConfigField(defaults, 'directory'), undefined, 'the directory has no schema default')
    assert.equal(readConfigField(defaults, 'file'), undefined, 'the legacy path has no schema default')
    assert.equal(readConfigField(defaults, 'recordErrors'), true)
    assert.equal(readConfigField(defaults, 'quickSearchView'), true)
    assert.equal(readConfigField(defaults, 'maxSizeMb'), 10)
    assert.equal(readConfigField(defaults, 'maxFiles'), 5)
    assert.equal(readConfigField(defaults, 'retentionDays'), 0)
    assert.equal(typeof defaults.enabled.get, 'function', 'settings fields stay volatile')
    const live = snapshotConfig(defaults)
    assert.match(live.file, /[\\/]\.dsh[\\/]logs[\\/]web-search\.jsonl$/)
    const liveDirectory = snapshotConfig(Config({ directory: '~/custom-logs' }))
    assert.match(liveDirectory.file, /[\\/]custom-logs[\\/]web-search\.jsonl$/)
    assert.equal(live.enabled, true)
    assert.equal(live.recordErrors, true)
    assert.equal(live.quickSearchView, true)
    assert.equal(live.maxSizeMb, 10)
    assert.equal(live.maxBytes, 10 * 1024 * 1024)
    assert.equal(live.maxFiles, 5)
    assert.equal(live.retentionDays, 0)
    assert.equal('includeSnippet' in defaults, false)
    assert.equal('includeAnswer' in defaults, false)
  } else {
    console.log('note: @deepseek-ai/schemastery unavailable; Config schema assertions skipped')
  }

  console.log(`dsh-web-search-insights (${name}): unit tests passed`)
} finally {
  await rm(root, { recursive: true, force: true })
}
