/**
 * Unit tests for URL normalization and citation extraction.
 *
 *   node test/url-utils.test.mjs
 */
import assert from 'node:assert/strict'
import { buildRecord } from '../src/record.js'
import { extractUrls, normalizeSources, normalizeUrl, readSources } from '../src/url-utils.js'

// Fragment and tracking parameters must not change the identity.
assert.equal(
  normalizeUrl('https://www.Example.com/a/?utm_source=x&b=2&a=1#section'),
  'https://example.com/a?a=1&b=2',
)
assert.equal(normalizeUrl('https://example.com/'), 'https://example.com/')
assert.equal(normalizeUrl('ftp://example.com/a'), '')
assert.equal(normalizeUrl('not a url'), '')

// Markdown, autolinks, and bare URLs all count; code blocks do not.
const text = [
  'See [A](https://a.test/x#frag) and <https://b.test/y>.',
  'Bare https://c.test/z?utm_medium=m, plus `https://ignored.test/code`.',
  '```',
  'https://ignored.test/fence',
  '```',
  'Duplicate [A2](https://a.test/x).',
].join('\n')
assert.deepEqual(extractUrls(text), [
  'https://a.test/x',
  'https://a.test/x',
  'https://b.test/y',
  'https://c.test/z',
])

// One payload, two consumers: the audit log and the projection must agree on
// URL identity (dedupe plus fragment/tracking normalization).
const sourceList = [
  { url: 'https://www.Example.com/a/?utm_source=x#frag', title: 'A', publishedAt: '2026-01-02' },
  { url: 'https://example.com/a?utm_source=y', title: 'duplicate of A' },
  { url: '', title: 'dropped' },
  { url: 'https://b.test/y', title: 'B', site_icon: 'https://icons.test/b.png', rerank_score: 0.5 },
]
const normalized = normalizeSources(sourceList)
assert.deepEqual(normalized.map((item) => item.key), ['https://example.com/a', 'https://b.test/y'])
assert.deepEqual(
  readSources({ sources: sourceList }).map((item) => item.key),
  normalized.map((item) => item.key),
)
const record = buildRecord(
  { name: 'web_search', callId: 'c1', rootCallId: 'c1', arguments: { queries: ['q'] } },
  { isError: false, value: { sources: sourceList, truncated: false } },
  { recordErrors: true },
)
assert.deepEqual(
  record.sources.map((item) => normalizeUrl(item.url)),
  normalized.map((item) => item.key),
  'the log and the projection resolve the same source identity',
)
assert.deepEqual(record.sources, [
  { url: 'https://www.Example.com/a/?utm_source=x', title: 'A', publishedAt: '2026-01-02' },
  { url: 'https://b.test/y', title: 'B' },
])

console.log('url-utils tests passed')
