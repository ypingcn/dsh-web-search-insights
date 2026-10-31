/**
 * Type surface for dsh-web-search-insights.
 */
import type { Context } from '@deepseek-ai/cordis'

export declare const name: 'web-search-insights'

/** One JSONL entry appended by the plugin. */
export interface WebSearchLogRecord {
  v: 1
  /** ISO-8601 UTC time at which the tool call settled. */
  ts: string
  tool: string
  callId: string
  rootCallId: string
  sessionId?: string
  provider?: string
  model?: string
  cwd?: string
  /** Search keywords, in call order. */
  queries: string[]
  ok: boolean
  sourceCount?: number
  truncated?: boolean
  sources?: Array<{
    url: string
    title?: string
    publishedAt?: string
  }>
  error?: {
    message: string
    name?: string
    code?: string
  }
}

/** One JSONL entry written for a settled `web_fetch` call. */
export interface WebFetchLogRecord {
  v: 1
  ts: string
  tool: 'web_fetch'
  callId: string
  rootCallId: string
  sessionId?: string
  provider?: string
  model?: string
  cwd?: string
  /** Requested URL, normalized. */
  url: string
  ok: boolean
  statusCode?: number
  truncated?: boolean
  /** Decoded body kind; content itself is never logged. */
  bodyKind?: 'html' | 'text'
  contentLength?: number
  error?: {
    message: string
    name?: string
    code?: string
  }
}

export type WebInsightLogRecord = WebSearchLogRecord | WebFetchLogRecord

export interface Config {
  enabled?: boolean
  /** Log directory; the plugin always writes `web-search.jsonl` inside it. */
  directory?: string
  /**
   * @deprecated Full log path from older profiles. Ignored when `directory` is
   * present.
   */
  file?: string
  recordErrors?: boolean
  /** Show the "quick search" conversation view (browser-side switch). */
  quickSearchView?: boolean
  /** Show the turn-tail entry for turns that only fetched pages (browser-side switch). */
  fetchEntry?: boolean
  /** Rotate the active log at this many MB; 0 disables rotation. */
  maxSizeMb?: number
  /** Rotated files to keep; 0 keeps all of them. */
  maxFiles?: number
  /** Delete rotated files older than this many days; 0 disables age cleanup. */
  retentionDays?: number
}

export declare function apply(ctx: Context, config?: Config): () => Promise<void>
