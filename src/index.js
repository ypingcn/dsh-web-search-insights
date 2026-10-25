/**
 * dsh-web-search-insights — plugin entry.
 *
 * Three outputs from one package:
 *
 * 1. JSONL audit log: every settled `web_search` call becomes one line with
 *    the search keywords plus the returned URLs and titles.
 * 2. Session statistics: the `webSearchInsights` projection folds durable
 *    session events into per-turn citation/source counters for the client.
 * 3. UI: the answer-tail citation entry and the right-sidebar search panel
 *    (browser half in `lib/client.js`).
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
import { Config, normalizeConfig } from './config.js'
import { webSearchInsightsDefinition } from './projection.js'
import { buildRecord } from './record.js'
import { JsonlWriter } from './writer.js'

export { Config }
export { webSearchInsightsDefinition } from './projection.js'
export { buildRecord, normalizeQueries } from './record.js'
export { JsonlWriter } from './writer.js'

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
  const options = normalizeConfig(config)
  const writer = new JsonlWriter(options.file, ctx.logger)

  // Feed the client-side statistics panel. `ctx.inject` keeps the JSONL log
  // working in profiles that do not compose the projection service.
  if (options.enabled && typeof ctx.inject === 'function') {
    ctx.inject(['sessionProjections'], (scope) => {
      scope.sessionProjections.register(webSearchInsightsDefinition)
    })
  }

  ctx.on('tools/result', (exec, result) => {
    if (!options.enabled) return
    try {
      if (exec === null || typeof exec !== 'object') return
      if (typeof exec.name !== 'string' || !options.tools.has(exec.name)) return
      const record = buildRecord(exec, result, options)
      if (record === undefined) return
      writer.append(record)
      if (options.console) {
        const outcome = record.ok
          ? `${record.sourceCount} source(s)`
          : `failed (${record.error?.code ?? 'error'})`
        try {
          ctx.logger?.info?.(`[web-search-insights] ${record.queries.join(' | ')} → ${outcome}`)
        } catch {
          /* logger is best-effort */
        }
      }
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

  return () => writer.flush()
}
