/**
 * Unit tests for URL normalization and citation extraction.
 *
 *   node test/url-utils.test.mjs
 */
import assert from 'node:assert/strict'
import { extractUrls, normalizeUrl } from '../src/url-utils.js'

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

console.log('url-utils tests passed')
