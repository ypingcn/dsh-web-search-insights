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
    snippet?: string
    publishedAt?: string
  }>
  answer?: string
  error?: {
    message: string
    name?: string
    code?: string
  }
}

export interface Config {
  enabled?: boolean
  file?: string
  tools?: string[]
  includeSnippet?: boolean
  includeAnswer?: boolean
  recordErrors?: boolean
  console?: boolean
}

export declare function apply(ctx: Context, config?: Config): () => Promise<void>
