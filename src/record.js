/**
 * Project one settled tool execution into a JSONL record.
 *
 * This is the extension point for future fields (turn/step, provider request
 * id, per-query attribution, …): keep `buildRecord` pure and side-effect free.
 *
 * @module dsh-web-search-insights/record
 */
import { normalizeSources, normalizeUrl } from './url-utils.js'

/**
 * Keep only the string queries the model actually sent.
 *
 * @param {unknown} queries - raw `exec.arguments.queries`.
 * @returns {string[]} non-blank queries, in call order.
 */
export function normalizeQueries(queries) {
  if (!Array.isArray(queries)) return []
  return queries.filter((query) => typeof query === 'string' && query.trim() !== '')
}

/** Copy the session/model metadata shared by every observed tool record. */
function applyAgent(exec, record) {
  const agent = exec.agent
  if (agent !== null && typeof agent === 'object') {
    if (typeof agent.id === 'string' && agent.id !== '') record.sessionId = agent.id
    const provider = agent.options?.provider
    const model = agent.options?.model
    if (typeof provider === 'string' && provider !== '') record.provider = provider
    if (typeof model === 'string' && model !== '') record.model = model
    const cwd = agent.session?.meta?.cwd
    if (typeof cwd === 'string' && cwd !== '') record.cwd = cwd
  }
}

/**
 * Copy the canonical failure payload onto a record when failed calls are
 * configured to be logged. Returns false when this call should be skipped.
 *
 * @param {Record<string, any>} record - record under construction.
 * @param {any} result - settled canonical result.
 * @param {import('./config.js').NormalizedConfig} options - normalized config.
 * @returns {boolean} whether the record should be appended.
 */
function applyError(record, result, options) {
  if (!options.recordErrors) return false
  record.ok = false
  record.error = {
    message: String(result.error?.message ?? 'unknown error'),
    ...(typeof result.error?.info?.name === 'string' ? { name: result.error.info.name } : {}),
    ...(typeof result.error?.info?.code === 'string' ? { code: result.error.info.code } : {}),
  }
  return true
}

/**
 * One settled `web_fetch` call: the requested URL plus HTTP outcome. The body
 * itself never enters the log — only its kind and length, when present.
 *
 * @param {any} exec - settled execution.
 * @param {any} result - settled canonical result.
 * @param {import('./config.js').NormalizedConfig} options - normalized config.
 * @returns {Record<string, any> | undefined} record to append.
 */
function buildFetchRecord(exec, result, options) {
  const url = typeof exec.arguments?.url === 'string' ? normalizeUrl(exec.arguments.url) : ''
  if (url === '') return undefined

  /** @type {Record<string, any>} */
  const record = {
    v: 1,
    ts: new Date().toISOString(),
    tool: exec.name,
    callId: exec.callId,
    rootCallId: exec.rootCallId,
    url,
  }
  applyAgent(exec, record)

  if (result?.isError) {
    return applyError(record, result, options) ? record : undefined
  }

  const value = result?.value
  record.ok = true
  if (typeof value?.statusCode === 'number') record.statusCode = value.statusCode
  record.truncated = value?.truncated === true
  if (typeof value?.body?.kind === 'string' && value.body.kind !== '') record.bodyKind = value.body.kind
  if (typeof value?.body?.content === 'string') record.contentLength = value.body.content.length
  return record
}

/**
 * @param {any} exec - settled execution: `name`, `callId`, `rootCallId`, `arguments`, `agent`.
 * @param {any} result - settled canonical result (`{ isError, value }`).
 * @param {import('./config.js').NormalizedConfig} options - normalized config.
 * @returns {Record<string, any> | undefined} record to append, or `undefined` to skip.
 */
export function buildRecord(exec, result, options) {
  if (exec?.name === 'web_fetch') return buildFetchRecord(exec, result, options)
  if (exec?.name !== 'web_search') return undefined

  const queries = normalizeQueries(exec?.arguments?.queries)
  if (queries.length === 0) return undefined

  /** @type {Record<string, any>} */
  const record = {
    v: 1,
    ts: new Date().toISOString(),
    tool: exec.name,
    callId: exec.callId,
    rootCallId: exec.rootCallId,
    queries,
  }
  applyAgent(exec, record)

  if (result?.isError) {
    return applyError(record, result, options) ? record : undefined
  }

  const value = result?.value
  // Same normalization as the projection, so a URL matches between the log
  // and the statistics panel; the log keeps only the compact field subset.
  const sources = normalizeSources(value?.sources).map((source) => ({
    url: source.url,
    ...(source.title !== '' ? { title: source.title } : {}),
    ...(source.publishedAt !== undefined ? { publishedAt: source.publishedAt } : {}),
  }))

  record.ok = true
  record.sourceCount = sources.length
  record.truncated = value?.truncated === true
  record.sources = sources
  return record
}
