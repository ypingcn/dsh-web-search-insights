/**
 * URL normalization and citation extraction.
 *
 * Kept dependency-free and pure so both the host fold and tests can use it.
 * Search providers often return URLs with fragments (`#1#1#1`) and tracking
 * parameters; matching a cited URL to a returned source without normalizing
 * would silently miss most citations.
 *
 * @module dsh-web-search-insights/url-utils
 */

/** Query parameters that never identify a different document. */
const TRACKING_PARAMS = new Set([
  'gclid',
  'fbclid',
  'msclkid',
  'spm',
  'ref',
  'from',
  'source',
])

/** Strip code fences and inline code so example URLs are not counted as citations. */
const FENCE_PATTERN = /```[\s\S]*?```/g
const INLINE_CODE_PATTERN = /`[^`]*`/g

/** Markdown link target, autolink, and bare URL patterns. */
const MARKDOWN_LINK_PATTERN = /\[[^\]]*\]\((https?:\/\/[^)\s]+)\)/g
const AUTOLINK_PATTERN = /<(https?:\/\/[^>\s]+)>/g
const BARE_URL_PATTERN = /(?<![([<"'])(https?:\/\/[^\s<>)\]"'\\]+)/g

/**
 * Trim punctuation that commonly wraps a URL in prose or Markdown.
 *
 * @param {string} raw - raw candidate.
 * @returns {string} trimmed candidate.
 */
function trimWrapped(raw) {
  return raw
    .trim()
    .replace(/^[<("'[]+/u, '')
    .replace(/[>)"'\].,;:!?，。；：！？]+$/u, '')
}

/**
 * Normalize one URL into the identity used for matching.
 *
 * Rules: lowercase scheme/host, drop `www.`, drop default ports, keep path
 * case, drop the trailing slash, drop the fragment, drop tracking parameters,
 * and sort remaining query parameters. Returns `''` for non-http(s) or invalid
 * input.
 *
 * @param {string} raw - URL from a provider or model answer.
 * @returns {string} normalized key, or `''` when unusable.
 */
export function normalizeUrl(raw) {
  if (typeof raw !== 'string' || raw.trim() === '') return ''
  const candidate = trimWrapped(raw)
  let url
  try {
    url = new URL(candidate)
  } catch {
    return ''
  }
  if (url.protocol !== 'http:' && url.protocol !== 'https:') return ''

  let host = url.hostname.toLowerCase()
  if (host.startsWith('www.')) host = host.slice(4)
  const port =
    url.port === '80' || url.port === '443' || url.port === '' ? '' : `:${url.port}`
  const path = url.pathname.replace(/\/+$/u, '') || '/'

  const params = [...url.searchParams.entries()]
    .filter(([key]) => {
      const lower = key.toLowerCase()
      return !TRACKING_PARAMS.has(lower) && !lower.startsWith('utm_') && !lower.startsWith('share_')
    })
    .sort(([left], [right]) => (left < right ? -1 : left > right ? 1 : 0))
  const query =
    params.length === 0
      ? ''
      : `?${params
          .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
          .join('&')}`

  return `${url.protocol}//${host}${port}${path}${query}`
}

/**
 * A display-safe version of a URL: the original minus a fragment.
 *
 * @param {string} raw - original URL.
 * @returns {string} URL suitable for a link label.
 */
export function displayUrl(raw) {
  if (typeof raw !== 'string') return ''
  const text = raw.trim()
  if (text === '') return ''
  const hash = text.indexOf('#')
  return hash === -1 ? text : text.slice(0, hash)
}

/**
 * Extract normalized URL keys from assistant text, preserving duplicates so
 * callers can count occurrences. Markdown links, autolinks, and bare URLs are
 * all recognized; code blocks are ignored.
 *
 * @param {string} text - assistant answer text.
 * @returns {string[]} normalized keys in appearance order, duplicates preserved.
 */
export function extractUrls(text) {
  if (typeof text !== 'string' || text === '') return []
  let body = text.replace(FENCE_PATTERN, ' ').replace(INLINE_CODE_PATTERN, ' ')
  /** @type {string[]} */
  const found = []

  body = body.replace(MARKDOWN_LINK_PATTERN, (_match, url) => {
    found.push(url)
    return ' '
  })
  body = body.replace(AUTOLINK_PATTERN, (_match, url) => {
    found.push(url)
    return ' '
  })
  body = body.replace(BARE_URL_PATTERN, (url) => {
    found.push(url)
    return ' '
  })

  return found.map(normalizeUrl).filter((key) => key !== '')
}

/**
 * Read a usable `site_icon` value: a small data URI or an http(s) URL.
 *
 * @param {unknown} value - provider `site_icon`.
 * @returns {string} icon reference, or `''` when unusable.
 */
function readIcon(value) {
  if (typeof value !== 'string' || value === '') return ''
  const icon = value.trim()
  if (icon.startsWith('data:image/')) return icon.length <= 4096 ? icon : ''
  if (icon.length > 2048) return ''
  try {
    const url = new URL(icon)
    return url.protocol === 'http:' || url.protocol === 'https:' ? url.href : ''
  } catch {
    return ''
  }
}

/**
 * Read a finite rerank score under the documented snake_case name (with a
 * couple of tolerant aliases for other providers).
 *
 * @param {Record<string, unknown>} item - one provider source.
 * @returns {number | undefined} score.
 */
function readRerankScore(item) {
  for (const field of ['rerank_score', 'rerankScore', 'score']) {
    const value = item[field]
    if (typeof value === 'number' && Number.isFinite(value)) return value
    if (typeof value === 'string' && value.trim() !== '') {
      const parsed = Number(value)
      if (Number.isFinite(parsed)) return parsed
    }
  }
  return undefined
}

/**
 * Read the registry-style source list from `web_search` presentation meta.
 *
 * The canonical `WebSource` only promises url/title/snippet/publishedAt, but a
 * custom search provider may attach site_icon/authority/rerank_score. Those are
 * preserved when present and ignored when absent.
 *
 * @param {unknown} meta - persisted `tool/result` meta.
 * @returns {Array<{
 *   key: string,
 *   url: string,
 *   title: string,
 *   icon?: string,
 *   authority?: string,
 *   rerankScore?: number,
 * }>} deduplicated sources.
 */
export function readSources(meta) {
  if (meta === null || typeof meta !== 'object') return []
  const list = Array.isArray(meta.sources) ? meta.sources : []
  /** @type {Array<any>} */
  const sources = []
  const seen = new Set()
  for (const item of list) {
    if (item === null || typeof item !== 'object') continue
    const rawUrl = typeof item.url === 'string' ? item.url : ''
    const key = normalizeUrl(rawUrl)
    if (key === '' || seen.has(key)) continue
    seen.add(key)
    const icon = readIcon(item.site_icon ?? item.siteIcon ?? item.icon)
    const authority = typeof item.authority === 'string' ? item.authority.slice(0, 200) : ''
    const rerankScore = readRerankScore(item)
    sources.push({
      key,
      url: displayUrl(rawUrl),
      title: typeof item.title === 'string' ? item.title : '',
      ...(icon !== '' ? { icon } : {}),
      ...(authority !== '' ? { authority } : {}),
      ...(rerankScore !== undefined ? { rerankScore } : {}),
    })
  }
  return sources
}
