/**
 * dsh-web-search-insights — plugin entry.
 *
 * Three outputs from one package:
 *
 * 1. JSONL audit log: every settled `web_search` call becomes one line with
 *    the search keywords plus the returned URLs and titles.
 * 2. Session statistics: the `webSearchInsights` projection folds durable
 *    session events into per-turn citation/source counters for the client.
 * 3. UI: the answer-tail citation entry, the right-sidebar search panel, and
 *    the plugin page's configuration card (browser half in `lib/client.js`).
 *
 * Hook: the tool registry's `tools/result` emit, which receives the settled
 * execution and the canonical `web_search` value:
 *
 *   { sources: [{ url, title?, snippet?, publishedAt? }], truncated, content? }
 *
 * Logging is fail-safe: I/O and projection errors are logged through
 * `ctx.logger` and can never change the result the model sees.
 *
 * @module dsh-web-search-insights
 */
import { Config, snapshotConfig } from './config.js'
import { installQuickSearchRoute } from './quick-search.js'
import { webSearchInsightsDefinition } from './projection.js'
import { buildRecord } from './record.js'
import { JsonlWriter } from './writer.js'

export { Config }
export { webSearchInsightsDefinition } from './projection.js'
export { buildRecord, normalizeQueries } from './record.js'
export { JsonlWriter } from './writer.js'
export { installQuickSearchRoute, QUICK_SEARCH_PATH } from './quick-search.js'

/** Cordis plugin name; also the default loader row id. */
export const name = 'web-search-insights'

/**
 * Install the `tools/result` observer.
 *
 * @param {any} ctx - Cordis plugin context.
 * @param {unknown} [config] - loaded plugin config.
 * @returns {() => Promise<void>} async disposer that drains pending appends.
 */
export function apply(ctx, config) {
  if (ctx === undefined || ctx === null || typeof ctx.on !== 'function') {
    throw new TypeError('web-search-insights: requires a Cordis context')
  }
  // Everything the plugin owns is re-read from this snapshot; settings writes
  // replace volatile config values in place and emit `loader/volatile-update`.
  let options = snapshotConfig(config)
  let writer = new JsonlWriter(options.file, ctx.logger, options)
  /** @type {any} */
  let projection

  // Feed the client-side statistics panel. `ctx.inject` keeps the JSONL log
  // working in profiles that do not compose the projection service, and the
  // fiber is disposed/recreated when the settings page toggles `enabled`.
  const syncProjection = () => {
    if (options.enabled && projection === undefined && typeof ctx.inject === 'function') {
      projection = ctx.inject(['sessionProjections'], (scope) => {
        scope.sessionProjections.register(webSearchInsightsDefinition)
      })
      return
    }
    if (!options.enabled && projection !== undefined) {
      const previous = projection
      projection = undefined
      void previous.dispose()
    }
  }
  syncProjection()
  installQuickSearchRoute(ctx)

  // The configuration page lives in the plugin manager. Suppress any future
  // auto-generated settings page for this entry so it never appears twice.
  if (typeof ctx.inject === 'function') {
    ctx.inject(['settings'], (settingsScope) => {
      settingsScope.effect(() => settingsScope.settings.configure({ auto: false }, ctx.fiber))
    })
  }

  ctx.on('loader/volatile-update', () => {
    options = snapshotConfig(config)
    writer.configure(options)
    syncProjection()
  })

  /** Point appends at the current `file`, draining the previous writer. */
  const retired = []
  const writerFor = (file) => {
    if (writer.file === file) {
      writer.configure(options)
      return writer
    }
    const previous = writer
    writer = new JsonlWriter(file, ctx.logger, options)
    retired.push(previous)
    return writer
  }

  ctx.on('tools/result', (exec, result) => {
    if (!options.enabled) return
    try {
      if (exec === null || typeof exec !== 'object') return
      if (typeof exec.name !== 'string' || !options.tools.has(exec.name)) return
      const record = buildRecord(exec, result, options)
      if (record === undefined) return
      writerFor(options.file).append(record)
    } catch (error) {
      try {
        ctx.logger?.warn?.(
          `[web-search-insights] observer failed: ${error instanceof Error ? error.message : String(error)}`,
        )
      } catch {
        /* logger is best-effort */
      }
    }
  })

  return async () => {
    if (projection !== undefined) {
      const previous = projection
      projection = undefined
      await previous.dispose()
    }
    await Promise.all([...retired.map((item) => item.flush()), writer.flush()])
  }
}
