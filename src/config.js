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
import { isAbsolute, join, resolve } from 'node:path'

/** Default log directory; `~` expansion is supported. */
export const DEFAULT_DIRECTORY = '~/.dsh/logs'

/** Fixed active log name inside the configured directory. */
export const LOG_FILENAME = 'web-search.jsonl'

/** Default active log path, derived from the directory and fixed name. */
export const DEFAULT_FILE = `${DEFAULT_DIRECTORY}/${LOG_FILENAME}`

/** Rotate the active log once it would exceed this many MB (0 disables). */
export const DEFAULT_MAX_SIZE_MB = 10

/** Rotated files kept next to the active log (0 keeps every rotation). */
export const DEFAULT_MAX_FILES = 5

/** Delete rotated logs older than this many days (0 disables age cleanup). */
export const DEFAULT_RETENTION_DAYS = 0

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
  enabled: z.boolean().default(true).volatile(),
  /**
   * Log directory. `~` expands; relative paths resolve from the host cwd.
   * No default: an absent value lets the legacy `file` fallback apply.
   */
  directory: z.string().volatile(),
  /**
   * @deprecated Full log path kept for existing profiles. `directory` wins when
   * both are present.
   */
  file: z.string().volatile(),
  /** Also record failed calls (`ok: false` plus the error). */
  recordErrors: z.boolean().default(true).volatile(),
  /** Show the "quick search" conversation view. Browser-side gate. */
  quickSearchView: z.boolean().default(true).volatile(),
  /** Rotate the active log at this size in MB; 0 disables size rotation. */
  maxSizeMb: z.number().default(DEFAULT_MAX_SIZE_MB).volatile(),
  /** Rotated files to keep; 0 keeps all of them. */
  maxFiles: z.number().default(DEFAULT_MAX_FILES).volatile(),
  /** Delete rotated files older than this many days; 0 disables age cleanup. */
  retentionDays: z.number().default(DEFAULT_RETENTION_DAYS).volatile(),
})

/**
 * Expand `~` and make a directory or file path absolute. Relative paths
 * resolve against the host process cwd, so one deployment writes one file
 * regardless of session.
 *
 * @param {string} path - configured directory or file path.
 * @returns {string} absolute path.
 */
export function resolveHostPath(path) {
  if (path === '~') return homedir()
  if (path.startsWith('~/')) return resolve(homedir(), path.slice(2))
  return isAbsolute(path) ? path : resolve(process.cwd(), path)
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
  for (const field of ['recordErrors', 'quickSearchView']) {
    if (source[field] !== undefined && typeof source[field] !== 'boolean') {
      throw new TypeError(`web-search-insights: \`${field}\` must be a boolean`)
    }
  }
  for (const field of ['directory', 'file']) {
    if (source[field] !== undefined && (typeof source[field] !== 'string' || source[field].trim() === '')) {
      throw new TypeError(`web-search-insights: \`${field}\` must be a non-empty string`)
    }
  }
  if (
    source.maxSizeMb !== undefined &&
    (typeof source.maxSizeMb !== 'number' || !Number.isFinite(source.maxSizeMb) || source.maxSizeMb < 0)
  ) {
    throw new TypeError('web-search-insights: `maxSizeMb` must be a non-negative number')
  }
  for (const field of ['maxFiles', 'retentionDays']) {
    if (source[field] !== undefined && (!Number.isInteger(source[field]) || source[field] < 0)) {
      throw new TypeError(`web-search-insights: \`${field}\` must be a non-negative integer`)
    }
  }
}

/** Read a non-negative integer, falling back to the schema default. */
function readCount(value, fallback) {
  return Number.isInteger(value) && value >= 0 ? value : fallback
}

/** Read a non-negative MB value, falling back to the schema default. */
function readMegabytes(value, fallback) {
  return typeof value === 'number' && Number.isFinite(value) && value >= 0 ? value : fallback
}

/** Convert a MB setting to the byte limit the writer consumes. */
function megabytesToBytes(value) {
  return Math.round(value * 1024 * 1024)
}

/**
 * Validate and normalize plugin config.
 *
 * The returned `file` is the absolute active log path. A configured
 * `directory` always resolves to `<directory>/web-search.jsonl`; the deprecated
 * `file` path is only used when no directory is set.
 *
 * @param {unknown} config - loaded plugin config.
 * @returns {{
 *   enabled: boolean,
 *   file: string,
 *   recordErrors: boolean,
 *   quickSearchView: boolean,
 *   maxSizeMb: number,
 *   maxBytes: number,
 *   maxFiles: number,
 *   retentionDays: number,
 * }} normalized options.
 */
export function normalizeConfig(config) {
  const source = config !== null && typeof config === 'object' && !Array.isArray(config) ? config : {}
  assertConfigTypes(source)
  const directory =
    typeof source.directory === 'string' && source.directory.trim() !== ''
      ? source.directory.trim()
      : undefined
  const legacyFile =
    typeof source.file === 'string' && source.file.trim() !== '' ? source.file.trim() : undefined
  const maxSizeMb = readMegabytes(source.maxSizeMb, DEFAULT_MAX_SIZE_MB)
  return {
    enabled: source.enabled !== false,
    // A configured directory owns the file name; the legacy full path is only
    // consulted for profiles written before the directory setting existed.
    file:
      directory !== undefined
        ? join(resolveHostPath(directory), LOG_FILENAME)
        : resolveHostPath(legacyFile ?? DEFAULT_FILE),
    recordErrors: source.recordErrors !== false,
    quickSearchView: source.quickSearchView !== false,
    maxSizeMb,
    maxBytes: megabytesToBytes(maxSizeMb),
    maxFiles: readCount(source.maxFiles, DEFAULT_MAX_FILES),
    retentionDays: readCount(source.retentionDays, DEFAULT_RETENTION_DAYS),
  }
}

/**
 * Read one config field, unwrapping a schemastery volatile reference. The
 * loader turns every `.volatile()` field into `{ get() }` so a settings write
 * can replace the value without reloading the plugin.
 *
 * @param {unknown} config - plugin config object.
 * @param {string} field - field name.
 * @returns {unknown} the live value, or undefined when absent.
 */
export function readConfigField(config, field) {
  if (config === null || typeof config !== 'object') return undefined
  const value = config[field]
  return value !== null && typeof value === 'object' && typeof value.get === 'function'
    ? value.get()
    : value
}

/**
 * Snapshot the live config into the normalized shape the writer and recorder
 * consume. Re-read this after every `loader/volatile-update` event.
 *
 * @param {unknown} config - plugin config object (raw or volatile).
 * @returns {ReturnType<typeof normalizeConfig>} normalized options.
 */
export function snapshotConfig(config) {
  return normalizeConfig({
    enabled: readConfigField(config, 'enabled'),
    directory: readConfigField(config, 'directory'),
    file: readConfigField(config, 'file'),
    recordErrors: readConfigField(config, 'recordErrors'),
    quickSearchView: readConfigField(config, 'quickSearchView'),
    maxSizeMb: readConfigField(config, 'maxSizeMb'),
    maxFiles: readConfigField(config, 'maxFiles'),
    retentionDays: readConfigField(config, 'retentionDays'),
  })
}
