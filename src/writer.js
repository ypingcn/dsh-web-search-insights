/**
 * Serialized JSONL writer with size-based rotation and age cleanup.
 *
 * The `tools/result` event is a synchronous emit, so appends are queued instead
 * of awaited in the listener. `flush()` lets the plugin's disposer drain the
 * queue on unload and gives tests a deterministic barrier.
 *
 * Rotation happens inside the same queue as appends, so a rotation can never
 * interleave with a write. Rotated files sit next to the active log as
 * `<file>.<ISO timestamp>`; only names matching that exact suffix are considered
 * for cleanup, so unrelated files are never touched.
 *
 * @module dsh-web-search-insights/writer
 */
import { appendFile, mkdir, readdir, rename, stat, unlink } from 'node:fs/promises'
import { basename, dirname, join } from 'node:path'

/** Suffix of a rotated file; also the guard for cleanup. */
const ROTATION_SUFFIX = /^\d{4}-\d{2}-\d{2}T\d{2}-\d{2}-\d{2}-\d{3}Z$/u

/** Read a non-negative integer limit, falling back to "disabled". */
function readLimit(value) {
  return Number.isInteger(value) && value >= 0 ? value : 0
}

/** ISO timestamp with filesystem-safe separators. */
function rotationSuffix() {
  return new Date().toISOString().replace(/[:.]/gu, '-')
}

/** Append-only writer that never lets an I/O error escape to the caller. */
export class JsonlWriter {
  /** @type {string} */
  #file
  /** @type {{ warn?: (message: string) => void } | undefined} */
  #logger
  /** @type {Promise<void>} */
  #queue = Promise.resolve()
  /** @type {Promise<void> | undefined} */
  #directoryReady
  /** Active file size; `undefined` until the first stat. */
  #bytes
  /** Rotate when the active file would exceed this many bytes (0 = off). */
  #maxBytes = 0
  /** Rotated files to keep (0 = keep all). */
  #maxFiles = 0
  /** Delete rotated files older than this many days (0 = off). */
  #retentionDays = 0
  /** Whether the first-append cleanup has run for the current limits. */
  #pruned = false

  /**
   * @param {string} file - absolute JSONL path.
   * @param {{ warn?: (message: string) => void } | undefined} logger - host logger.
   * @param {{ maxBytes?: number, maxFiles?: number, retentionDays?: number }} [options] -
   *   rotation limits; applied to appends queued after this call.
   */
  constructor(file, logger, options = {}) {
    this.#file = file
    this.#logger = logger
    this.configure(options)
  }

  /** Current file path, for diagnostics and tests. */
  get file() {
    return this.#file
  }

  /**
   * Replace the rotation limits. Safe to call on a live writer: queued appends
   * read the limits when they run.
   *
   * @param {{ maxBytes?: number, maxFiles?: number, retentionDays?: number }} [options] -
   *   new limits; omitted fields disable the corresponding behavior.
   * @returns {void}
   */
  configure(options = {}) {
    const maxBytes = readLimit(options?.maxBytes)
    const maxFiles = readLimit(options?.maxFiles)
    const retentionDays = readLimit(options?.retentionDays)
    if (
      maxBytes !== this.#maxBytes ||
      maxFiles !== this.#maxFiles ||
      retentionDays !== this.#retentionDays
    ) {
      this.#pruned = false
    }
    this.#maxBytes = maxBytes
    this.#maxFiles = maxFiles
    this.#retentionDays = retentionDays
  }

  /**
   * Queue one record. Serialization happens eagerly so a later mutation of
   * `record` cannot change what was queued.
   *
   * @param {Record<string, unknown>} record - plain JSON-serializable record.
   * @returns {void}
   */
  append(record) {
    let line
    try {
      line = `${JSON.stringify(record)}\n`
    } catch (error) {
      this.#warn('cannot serialize record', error)
      return
    }
    const bytes = Buffer.byteLength(line)
    this.#queue = this.#queue
      .then(async () => {
        await this.#ensureDirectory()
        if (!this.#pruned) {
          this.#pruned = true
          await this.#prune()
        }
        await this.#ensureSize()
        if (this.#maxBytes > 0 && this.#bytes > 0 && this.#bytes + bytes > this.#maxBytes) {
          await this.#rotate()
        }
        // `mode` only applies on creation, so an existing log keeps its own
        // permissions while a new one is never group/world readable.
        await appendFile(this.#file, line, { encoding: 'utf8', mode: 0o600 })
        this.#bytes += bytes
      })
      .catch((error) => {
        this.#warn(`append to ${this.#file} failed`, error)
      })
  }

  /** Resolve after every queued append has settled. */
  flush() {
    return this.#queue
  }

  /** Create the log directory once; a failure resets the memo for a retry. */
  #ensureDirectory() {
    if (this.#directoryReady === undefined) {
      this.#directoryReady = mkdir(dirname(this.#file), { recursive: true, mode: 0o700 }).catch((error) => {
        this.#directoryReady = undefined
        throw error
      })
    }
    return this.#directoryReady
  }

  /** Learn the active file's current size once, so restarts respect the cap. */
  async #ensureSize() {
    if (this.#bytes !== undefined) return
    try {
      this.#bytes = (await stat(this.#file)).size
    } catch (error) {
      if (error?.code !== 'ENOENT') this.#warn(`cannot stat ${this.#file}`, error)
      this.#bytes = 0
    }
  }

  /**
   * Move the active file aside and prune rotated siblings. A failure leaves the
   * writer on the active file rather than losing records.
   *
   * @returns {Promise<void>}
   */
  async #rotate() {
    const target = `${this.#file}.${rotationSuffix()}`
    try {
      await rename(this.#file, target)
    } catch (error) {
      if (error?.code !== 'ENOENT') {
        this.#warn(`cannot rotate ${this.#file}`, error)
        return
      }
    }
    this.#bytes = 0
    await this.#prune()
  }

  /** Delete rotated files beyond `maxFiles` or older than `retentionDays`. */
  async #prune() {
    if (this.#maxFiles <= 0 && this.#retentionDays <= 0) return
    const directory = dirname(this.#file)
    const prefix = `${basename(this.#file)}.`
    let names
    try {
      names = await readdir(directory)
    } catch (error) {
      this.#warn(`cannot list ${directory}`, error)
      return
    }

    const rotated = []
    for (const name of names) {
      if (!name.startsWith(prefix)) continue
      if (!ROTATION_SUFFIX.test(name.slice(prefix.length))) continue
      const path = join(directory, name)
      try {
        const info = await stat(path)
        rotated.push({ path, mtimeMs: info.mtimeMs })
      } catch {
        /* a concurrent cleanup already removed it */
      }
    }
    rotated.sort((left, right) => right.mtimeMs - left.mtimeMs)

    const cutoff = this.#retentionDays > 0 ? Date.now() - this.#retentionDays * 86_400_000 : undefined
    for (let index = 0; index < rotated.length; index += 1) {
      const item = rotated[index]
      const overCount = this.#maxFiles > 0 && index >= this.#maxFiles
      const expired = cutoff !== undefined && item.mtimeMs < cutoff
      if (!overCount && !expired) continue
      try {
        await unlink(item.path)
      } catch (error) {
        this.#warn(`cannot remove ${item.path}`, error)
      }
    }
  }

  /**
   * Best-effort warning: logging must never break the observed tool call.
   *
   * @param {string} message - diagnostic prefix.
   * @param {unknown} error - failure detail.
   */
  #warn(message, error) {
    const detail = error instanceof Error ? error.message : String(error)
    try {
      this.#logger?.warn?.(`[web-search-insights] ${message}: ${detail}`)
    } catch {
      /* logger is best-effort */
    }
  }
}
