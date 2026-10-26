/**
 * Project one settled tool execution into a JSONL record.
 *
 * This is the extension point for future fields (turn/step, provider request
 * id, per-query attribution, …): keep `buildRecord` pure and side-effect free.
 *
 * @module dsh-web-search-insights/record
 */

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

/**
 * @param {any} exec - settled execution: `name`, `callId`, `rootCallId`, `arguments`, `agent`.
 * @param {any} result - settled canonical result (`{ isError, value }`).
 * @param {import('./config.js').NormalizedConfig} options - normalized config.
 * @returns {Record<string, any> | undefined} record to append, or `undefined` to skip.
 */
export function buildRecord(exec, result, options) {
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

  if (result?.isError) {
    if (!options.recordErrors) return undefined
    record.ok = false
    record.error = {
      message: String(result.error?.message ?? 'unknown error'),
      ...(typeof result.error?.info?.name === 'string' ? { name: result.error.info.name } : {}),
      ...(typeof result.error?.info?.code === 'string' ? { code: result.error.info.code } : {}),
    }
    return record
  }

  const value = result?.value
  /** @type {Array<Record<string, string>>} */
  const sources = []
  for (const source of Array.isArray(value?.sources) ? value.sources : []) {
    if (source === null || typeof source !== 'object') continue
    if (typeof source.url !== 'string' || source.url === '') continue
    /** @type {Record<string, string>} */
    const item = { url: source.url }
    if (typeof source.title === 'string' && source.title !== '') item.title = source.title
    if (typeof source.publishedAt === 'string' && source.publishedAt !== '') {
      item.publishedAt = source.publishedAt
    }
    sources.push(item)
  }

  record.ok = true
  record.sourceCount = sources.length
  record.truncated = value?.truncated === true
  record.sources = sources
  return record
}
