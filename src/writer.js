/**
 * Serialized JSONL writer.
 *
 * The `tools/result` event is a synchronous emit, so appends are queued instead
 * of awaited in the listener. `flush()` lets the plugin's disposer drain the
 * queue on unload and gives tests a deterministic barrier.
 *
 * @module dsh-web-search-logger/writer
 */
import { appendFile, mkdir } from 'node:fs/promises'
import { dirname } from 'node:path'

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

  /**
   * @param {string} file - absolute JSONL path.
   * @param {{ warn?: (message: string) => void } | undefined} logger - host logger.
   */
  constructor(file, logger) {
    this.#file = file
    this.#logger = logger
  }

  /** Current file path, for diagnostics and tests. */
  get file() {
    return this.#file
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
    this.#queue = this.#queue
      .then(async () => {
        await this.#ensureDirectory()
        await appendFile(this.#file, line, 'utf8')
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
      this.#directoryReady = mkdir(dirname(this.#file), { recursive: true }).catch((error) => {
        this.#directoryReady = undefined
        throw error
      })
    }
    return this.#directoryReady
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
      this.#logger?.warn?.(`[web-search-logger] ${message}: ${detail}`)
    } catch {
      /* logger is best-effort */
    }
  }
}
