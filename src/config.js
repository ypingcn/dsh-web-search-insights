/**
 * Configuration schema, defaults, and normalization.
 *
 * `@deepseek-ai/schemastery` is an optional peer: when it resolves, the loader
 * validates config and applies `.default()` values before `apply()` runs; when
 * it does not (e.g. a plugin inserted by absolute path), `normalizeConfig`
 * provides the same defaults and fails loud on wrong types.
 *
 * @module dsh-web-search-insights/config
 */
import { homedir } from 'node:os'
import { isAbsolute, resolve } from 'node:path'

/** Default JSONL destination; `~` expansion is supported. */
export const DEFAULT_FILE = '~/.dsh/logs/web-search.jsonl'

/** Tools whose settled result carries `{ queries }` + `{ sources, truncated }`. */
export const DEFAULT_TOOLS = ['web_search']

/**
 * Optional peer dependency. A missing module is not an activation failure:
 * the schema is a convenience, not a runtime requirement.
 */
const z = await import('@deepseek-ai/schemastery')
  .then((module) => module.default)
  .catch(() => undefined)

/** Config schema, when `@deepseek-ai/schemastery` is resolvable. */
export const Config = z?.object({
  /** Master switch; disable without uninstalling. */
  enabled: z.boolean().default(true),
  /** JSONL destination. `~` expands; relative paths resolve from the host cwd. */
  file: z.string().default(DEFAULT_FILE),
  /** Tool names to observe; only `web_search` has this argument/result shape. */
  tools: z.array(z.string()).default(DEFAULT_TOOLS),
  /** Add each source's provider snippet (off by default: snippets can be long). */
  includeSnippet: z.boolean().default(false),
  /** Add the provider's prose answer next to the source list. */
  includeAnswer: z.boolean().default(false),
  /** Also record failed calls (`ok: false` plus the error). */
  recordErrors: z.boolean().default(true),
  /** Emit a one-line summary through the host logger. */
  console: z.boolean().default(false),
})

/**
 * Expand `~` and make the path absolute. Relative paths resolve against the
 * host process cwd, so one deployment writes one file regardless of session.
 *
 * @param {string} file - configured destination.
 * @returns {string} absolute log path.
 */
export function resolveLogFile(file) {
  if (file === '~') return homedir()
  if (file.startsWith('~/')) return resolve(homedir(), file.slice(2))
  return isAbsolute(file) ? file : resolve(process.cwd(), file)
}

/**
 * Reject structurally wrong config before it silently falls back to defaults.
 * The schema path has already enforced this; this path covers schema-less
 * activation.
 *
 * @param {Record<string, unknown>} source - raw plugin config.
 */
function assertConfigTypes(source) {
  if (source.enabled !== undefined && typeof source.enabled !== 'boolean') {
    throw new TypeError('web-search-insights: `enabled` must be a boolean')
  }
  for (const field of ['includeSnippet', 'includeAnswer', 'recordErrors', 'console']) {
    if (source[field] !== undefined && typeof source[field] !== 'boolean') {
      throw new TypeError(`web-search-insights: \`${field}\` must be a boolean`)
    }
  }
  if (source.file !== undefined && (typeof source.file !== 'string' || source.file.trim() === '')) {
    throw new TypeError('web-search-insights: `file` must be a non-empty string')
  }
  if (source.tools !== undefined) {
    if (!Array.isArray(source.tools) || source.tools.some((tool) => typeof tool !== 'string' || tool === '')) {
      throw new TypeError('web-search-insights: `tools` must be an array of non-empty tool names')
    }
  }
}

/**
 * Validate and normalize plugin config.
 *
 * @param {unknown} config - loaded plugin config.
 * @returns {{
 *   enabled: boolean,
 *   file: string,
 *   tools: Set<string>,
 *   includeSnippet: boolean,
 *   includeAnswer: boolean,
 *   recordErrors: boolean,
 *   console: boolean,
 * }} normalized options.
 */
export function normalizeConfig(config) {
  const source = config !== null && typeof config === 'object' && !Array.isArray(config) ? config : {}
  assertConfigTypes(source)
  const tools = Array.isArray(source.tools) ? source.tools : []
  return {
    enabled: source.enabled !== false,
    file: resolveLogFile(
      typeof source.file === 'string' && source.file.trim() !== ''
        ? source.file.trim()
        : DEFAULT_FILE,
    ),
    tools: new Set(tools.length > 0 ? tools : DEFAULT_TOOLS),
    includeSnippet: source.includeSnippet === true,
    includeAnswer: source.includeAnswer === true,
    recordErrors: source.recordErrors !== false,
    console: source.console === true,
  }
}
