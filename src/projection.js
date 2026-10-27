/**
 * Session projection for web search usage.
 *
 * Folds the durable session log into two numbers per turn plus a session
 * aggregate:
 * - `cited`: distinct URLs from this turn's final answer that come from any
 *   web_search result known so far in the session (includes earlier turns).
 * - `local`: the subset of those URLs that came from web_search calls in this
 *   same turn.
 *
 * The fold also keeps every returned source per turn, so the panel can show
 * "all returned sources + whether each was cited".
 *
 * @module dsh-web-search-insights/projection
 */
import { displayUrl, extractUrls, normalizeUrl, readSources } from './url-utils.js'

/** Projection key shared with the client bundle. */
export const KEY = 'webSearchInsights'

/** Wire format version; bump only for incompatible client changes. */
export const WIRE_VERSION = 1

const MAX_TURNS = 200
const MAX_SOURCES_PER_TURN = 50
const MAX_QUERIES_PER_TURN = 20
const MAX_POOL = 4000
const MAX_CALLS = 1000
const MAX_PENDING_KEYS = 500
const MAX_TEXT = 64 * 1024

/** Runtime validator used by the projection registry (`schema.parse`). */
const objectSchema = {
  parse(value) {
    if (value === null || typeof value !== 'object' || Array.isArray(value)) {
      throw new TypeError('web-search insights: expected a plain object')
    }
    if (value.v !== WIRE_VERSION) {
      throw new TypeError(`web-search insights: unsupported version ${String(value.v)}`)
    }
    return value
  },
}

/**
 * One turn's counters and source list.
 *
 * @returns {{
 *   searchCalls: number,
 *   queries: string[],
 *   sources: Array<{ key: string, url: string, title: string, cited: boolean }>,
 *   returned: number,
 *   cited: number,
 *   local: number,
 *   occurrences: number,
 * }}
 */
function emptyTurn() {
  return {
    searchCalls: 0,
    queries: [],
    sources: [],
    returned: 0,
    cited: 0,
    local: 0,
    occurrences: 0,
    fetches: [],
    fetchCount: 0,
  }
}

/**
 * Extract assistant text from message content blocks.
 *
 * @param {unknown} message - persisted assistant message.
 * @returns {string} concatenated text blocks (capped).
 */
function assistantText(message) {
  if (message === null || typeof message !== 'object') return ''
  const blocks = Array.isArray(message.content) ? message.content : []
  let text = ''
  for (const block of blocks) {
    if (block !== null && typeof block === 'object' && block.type === 'text' && typeof block.text === 'string') {
      text += block.text
    }
    if (text.length >= MAX_TEXT) break
  }
  return text.slice(0, MAX_TEXT)
}

/**
 * Parse the model's `queries` argument from the raw `tool/call` JSON string.
 *
 * @param {unknown} raw - raw arguments JSON.
 * @returns {string[]} non-blank queries.
 */
function parseQueries(raw) {
  if (typeof raw !== 'string' || raw === '') return []
  try {
    const args = JSON.parse(raw)
    if (args === null || typeof args !== 'object' || !Array.isArray(args.queries)) return []
    return args.queries.filter((query) => typeof query === 'string' && query.trim() !== '')
  } catch {
    return []
  }
}

/**
 * Parse the URL argument of a `web_fetch` call.
 *
 * @param {unknown} raw - raw arguments JSON.
 * @returns {string} normalized URL, or `''`.
 */
function parseFetchUrl(raw) {
  if (typeof raw !== 'string' || raw === '') return ''
  try {
    const args = JSON.parse(raw)
    return typeof args?.url === 'string' ? normalizeUrl(args.url) : ''
  } catch {
    return ''
  }
}

/**
 * Merge new queries into a turn's list without duplicates.
 *
 * @param {string[]} existing - current queries.
 * @param {string[]} added - new queries.
 * @returns {string[]} capped merged list.
 */
function mergeQueries(existing, added) {
  const merged = [...existing]
  for (const query of added) {
    if (!merged.includes(query)) merged.push(query)
    if (merged.length >= MAX_QUERIES_PER_TURN) break
  }
  return merged.slice(0, MAX_QUERIES_PER_TURN)
}

/**
 * Commit the turn's pending final-answer URLs against the session pool.
 *
 * @param {any} state - projection state.
 * @param {number} turn - turn number.
 * @returns {any} next state.
 */
function commitTurn(state, turn) {
  const pending = state.pending
  if (pending === null || pending.turn !== turn) return state

  const pool = new Set(state.pool)
  const current = state.turns[String(turn)] ?? emptyTurn()
  const localSources = new Set(current.sources.map((source) => source.key))
  const counts = new Map()
  for (const key of pending.keys) counts.set(key, (counts.get(key) ?? 0) + 1)

  const citedKeys = new Set(state.citedKeys)
  const citedNow = new Set()
  let cited = 0
  let local = 0
  let occurrences = 0

  for (const [key, count] of counts) {
    if (pool.has(key)) {
      cited += 1
      occurrences += count
      citedNow.add(key)
      citedKeys.add(key)
    }
    if (localSources.has(key)) local += 1
  }

  // A turn with no searches and no citations is not worth a row.
  if (current.searchCalls === 0 && cited === 0) {
    return { ...state, pending: null }
  }

  const sources = current.sources.map((source) =>
    citedNow.has(source.key) ? { ...source, cited: true } : source,
  )
  const turns = {
    ...state.turns,
    [String(turn)]: { ...current, cited, local, occurrences, sources },
  }

  // Keep only the newest turns in the state; older rows fall out of the UI but
  // session totals remain complete.
  const turnKeys = Object.keys(turns).sort((left, right) => Number(right) - Number(left))
  for (const stale of turnKeys.slice(MAX_TURNS)) delete turns[stale]

  return {
    ...state,
    pending: null,
    turns,
    citedKeys: [...citedKeys].slice(-MAX_POOL),
    session: {
      ...state.session,
      cited: Math.min(citedKeys.size, MAX_POOL),
      occurrences: state.session.occurrences + occurrences,
    },
  }
}

/**
 * Fold one committed session event.
 *
 * @param {any} state - previous state.
 * @param {any} event - committed session event.
 * @returns {any} next state (same reference when unrelated).
 */
function apply(state, event) {
  if (event === null || typeof event !== 'object') return state
  if (typeof event.seq === 'number' && event.seq < state.inherited) return state
  const data = event.data
  if (data === null || typeof data !== 'object') return state

  switch (event.type) {
    case 'tool/call': {
      if (typeof data.callId !== 'string' || typeof data.name !== 'string') return state
      const calls = {
        ...state.calls,
        [data.callId]: {
          name: data.name,
          turn: typeof data.turn === 'number' ? data.turn : 0,
          queries: parseQueries(data.arguments),
          url: parseFetchUrl(data.arguments),
          done: false,
        },
      }
      const ids = Object.keys(calls)
      for (const stale of ids.slice(0, Math.max(0, ids.length - MAX_CALLS))) delete calls[stale]
      // Any text emitted before this call is narration, not the final answer;
      // dropping it keeps a later turn/end from citing the narration.
      const pending =
        state.pending !== null && (typeof data.turn !== 'number' || state.pending.turn === data.turn)
          ? null
          : state.pending
      return { ...state, calls, pending }
    }

    case 'tool/result': {
      const callId = data.message?.source?.callId
      if (typeof callId !== 'string') return state
      const call = state.calls[callId]
      // A pruner may append the same result again with only `content` changed.
      // Pair once so occurrences and source counts stay idempotent.
      if (call === undefined || call.done === true) return state
      if (call.name !== 'web_search' && call.name !== 'web_fetch') {
        // Other tool pairings are only needed until their result arrives.
        const calls = { ...state.calls }
        delete calls[callId]
        return { ...state, calls }
      }
      const calls = { ...state.calls, [callId]: { ...call, done: true } }

      if (call.name === 'web_fetch') {
        if (data.message?.isError === true || data.error !== undefined) return { ...state, calls }
        const requested = typeof call.url === 'string' ? call.url : ''
        const final = typeof data.meta?.url === 'string' ? normalizeUrl(data.meta.url) : ''
        const key = final !== '' ? final : requested
        if (key === '') return { ...state, calls }
        const turn = typeof call.turn === 'number' && call.turn > 0 ? call.turn : data.turn
        if (typeof turn !== 'number') return { ...state, calls }
        const current = state.turns[String(turn)] ?? emptyTurn()
        const fetches = [...current.fetches]
        if (!fetches.some((fetch) => fetch.key === key)) {
          fetches.push({
            key,
            url: displayUrl(typeof data.meta?.url === 'string' ? data.meta.url : call.url),
            ...(typeof data.meta?.statusCode === 'number' ? { statusCode: data.meta.statusCode } : {}),
          })
        }
        const fetchedKeys = new Set([key, requested].filter((item) => item !== ''))
        const sources = current.sources.map((source) =>
          fetchedKeys.has(source.key) && source.fetched !== true
            ? { ...source, fetched: true }
            : source,
        )
        const sessionKeys = new Set(state.fetchedKeys)
        sessionKeys.add(key)
        return {
          ...state,
          calls,
          fetchedKeys: [...sessionKeys].slice(-MAX_POOL),
          turns: {
            ...state.turns,
            [String(turn)]: {
              ...current,
              sources,
              fetches,
              fetchCount: fetches.length,
            },
          },
          session: {
            ...state.session,
            fetched: Math.min(sessionKeys.size, MAX_POOL),
          },
        }
      }

      const turn = typeof call.turn === 'number' && call.turn > 0 ? call.turn : data.turn
      if (typeof turn !== 'number') return { ...state, calls }
      const current = state.turns[String(turn)] ?? emptyTurn()
      const sources = [...current.sources]
      const byKey = new Map(sources.map((source, index) => [source.key, index]))
      for (const source of readSources(data.meta)) {
        const existing = byKey.get(source.key)
        if (existing !== undefined) {
          const previous = sources[existing]
          sources[existing] = {
            ...previous,
            ...(previous.title === '' && source.title !== '' ? { title: source.title } : {}),
            ...(previous.icon === undefined && source.icon !== undefined ? { icon: source.icon } : {}),
            ...(previous.authority === undefined && source.authority !== undefined ? { authority: source.authority } : {}),
            ...(previous.rerankScore === undefined && source.rerankScore !== undefined
              ? { rerankScore: source.rerankScore }
              : {}),
          }
          continue
        }
        byKey.set(source.key, sources.length)
        sources.push({
          ...source,
          cited: false,
          ...(current.fetches.some((fetch) => fetch.key === source.key) ? { fetched: true } : {}),
        })
      }
      const pool = [...state.pool]
      const poolSet = new Set(pool)
      // `returned` is a lifetime counter, not `pool.length`: the pool is capped
      // for citation matching, so deriving the count from it would freeze at
      // MAX_POOL. A source evicted from the pool and returned again later is
      // counted twice; that needs more than MAX_POOL distinct sources first.
      let added = 0
      for (const source of sources) {
        if (!poolSet.has(source.key)) {
          poolSet.add(source.key)
          pool.push(source.key)
          added += 1
        }
      }
      if (pool.length > MAX_POOL) pool.splice(0, pool.length - MAX_POOL)

      return {
        ...state,
        calls,
        pool,
        turns: {
          ...state.turns,
          [String(turn)]: {
            ...current,
            searchCalls: current.searchCalls + 1,
            queries: mergeQueries(current.queries, call.queries),
            sources,
            returned: sources.length,
          },
        },
        session: {
          ...state.session,
          searches: state.session.searches + 1,
          returned: state.session.returned + added,
        },
      }
    }

    case 'assistant/message': {
      if (typeof data.turn !== 'number') return state
      const text = assistantText(data.message)
      if (text.trim() === '') return state
      const keys = extractUrls(text).slice(0, MAX_PENDING_KEYS)
      // Only the last text-bearing assistant message of a turn is the final
      // answer; intermediate narration is overwritten here.
      return { ...state, pending: { turn: data.turn, keys } }
    }

    case 'turn/end': {
      return typeof data.turn === 'number' ? commitTurn(state, data.turn) : state
    }

    case 'turn/start': {
      // Defensive: a log may lack the previous turn/end.
      if (state.pending !== null && state.pending.turn !== data.turn) {
        return commitTurn(state, state.pending.turn)
      }
      return state
    }

    default:
      return state
  }
}

/**
 * Build the immutable initial state for one session.
 *
 * @param {unknown} _header - session header (unused).
 * @param {number} inheritedEventCount - fork-inherited prefix length.
 * @returns {any} initial state.
 */
function init(_header, inheritedEventCount) {
  return {
    v: WIRE_VERSION,
    inherited: typeof inheritedEventCount === 'number' ? inheritedEventCount : 0,
    calls: {},
    pending: null,
    turns: {},
    pool: [],
    citedKeys: [],
    fetchedKeys: [],
    session: { searches: 0, returned: 0, cited: 0, occurrences: 0, fetched: 0 },
  }
}

/** Cache one wire value per state reference (stable for consumers). */
const viewCache = new WeakMap()

/**
 * Project internal state to the client-visible whole value.
 *
 * @param {any} state - projection state.
 * @returns {any} wire value.
 */
function view(state) {
  const cached = viewCache.get(state)
  if (cached !== undefined) return cached

  const turnKeys = Object.keys(state.turns).sort((left, right) => Number(right) - Number(left))
  const turns = {}
  for (const key of turnKeys) {
    const turn = state.turns[key]
    turns[key] = {
      searchCalls: turn.searchCalls,
      returned: turn.returned,
      cited: turn.cited,
      local: turn.local,
      occurrences: turn.occurrences,
      queries: turn.queries,
      fetchCount: turn.fetchCount ?? 0,
      fetches: (turn.fetches ?? []).map((fetch) => ({
        url: fetch.url,
        ...(fetch.statusCode !== undefined ? { statusCode: fetch.statusCode } : {}),
      })),
      sourceCount: turn.sources.length,
      sources: turn.sources.slice(0, MAX_SOURCES_PER_TURN).map((source) => ({
        url: displayUrl(source.url),
        title: source.title,
        cited: source.cited,
        ...(source.fetched === true ? { fetched: true } : {}),
        ...(source.icon !== undefined ? { icon: source.icon } : {}),
        ...(source.authority !== undefined ? { authority: source.authority } : {}),
        ...(source.rerankScore !== undefined ? { rerankScore: source.rerankScore } : {}),
      })),
      ...(turn.sources.length > MAX_SOURCES_PER_TURN ? { sourcesTruncated: true } : {}),
    }
  }

  const value = {
    v: WIRE_VERSION,
    session: {
      searches: state.session.searches,
      returned: state.session.returned,
      cited: state.session.cited,
      occurrences: state.session.occurrences,
      fetched: state.session.fetched ?? 0,
    },
    turns,
    ...(turnKeys.length > 0 ? { latestTurn: Number(turnKeys[0]) } : {}),
  }
  viewCache.set(state, value)
  return value
}

/** Registered projection definition. */
export const webSearchInsightsDefinition = {
  key: KEY,
  stateVersion: 2,
  stateSchema: objectSchema,
  init,
  apply,
  wire: {
    viewSchema: objectSchema,
    view,
  },
}
