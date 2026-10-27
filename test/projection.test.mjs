/**
 * Projection unit tests: synthetic session events, no host or model needed.
 *
 *   node test/projection.test.mjs
 */
import assert from 'node:assert/strict'
import { webSearchInsightsDefinition as definition } from '../src/projection.js'

const event = (seq, type, data) => ({ seq, type, data })

const call = (seq, turn, callId, name, queries = []) =>
  event(seq, 'tool/call', {
    turn,
    step: 1,
    callId,
    name,
    arguments: JSON.stringify({ queries }),
  })

const result = (seq, turn, callId, sources) =>
  event(seq, 'tool/result', {
    turn,
    step: 1,
    message: { role: 'tool', source: { kind: 'tool', callId }, content: [] },
    meta: {
      sources: sources.map(([url, title, extra = {}]) => ({ url, title, ...extra })),
      truncated: false,
    },
  })

const fetchCall = (seq, turn, callId, url) =>
  event(seq, 'tool/call', {
    turn,
    step: 1,
    callId,
    name: 'web_fetch',
    arguments: JSON.stringify({ url }),
  })

const fetchResult = (seq, turn, callId, url, statusCode = 200) =>
  event(seq, 'tool/result', {
    turn,
    step: 1,
    message: { role: 'tool', source: { kind: 'tool', callId }, content: [] },
    meta: { url, statusCode, truncated: false },
  })

const answer = (seq, turn, text) =>
  event(seq, 'assistant/message', {
    turn,
    step: 1,
    message: { role: 'assistant', content: [{ type: 'text', text }] },
    stream: [],
  })

const end = (seq, turn) => event(seq, 'turn/end', { turn, reason: { kind: 'stop' } })

/** Fold an event list. */
function fold(events, inherited = 0) {
  let state = definition.init({}, inherited)
  for (const item of events) state = definition.apply(state, item)
  return state
}

// 1. Turn 1 returns two sources; the answer cites one plus an unrelated URL.
let state = fold([
  call(0, 1, 'c1', 'web_search', ['alpha']),
  result(1, 1, 'c1', [
    ['https://a.test/x?utm_source=news#1', 'A'],
    ['https://b.test/y', 'B'],
  ]),
  answer(2, 1, 'Answer cites [A](https://a.test/x) and https://unrelated.test/'),
  end(3, 1),
])
let wire = definition.wire.view(state)
assert.equal(wire.v, 1)
assert.deepEqual(wire.turns['1'], {
  searchCalls: 1,
  returned: 2,
  cited: 1,
  local: 1,
  occurrences: 1,
  queries: ['alpha'],
  fetchCount: 0,
  fetches: [],
  sourceCount: 2,
  sources: [
    { url: 'https://a.test/x?utm_source=news', title: 'A', cited: true },
    { url: 'https://b.test/y', title: 'B', cited: false },
  ],
})
assert.deepEqual(wire.session, { searches: 1, returned: 2, cited: 1, occurrences: 1, fetched: 0 })

// 2. Turn 2 has no new search but cites both earlier sources.
state = definition.apply(state, answer(4, 2, 'Again [A](https://a.test/x) and [B](https://b.test/y).'))
state = definition.apply(state, end(5, 2))
wire = definition.wire.view(state)
assert.equal(wire.turns['2'].searchCalls, 0)
assert.equal(wire.turns['2'].cited, 2)
assert.equal(wire.turns['2'].local, 0, 'no source came from this turn')
assert.equal(wire.session.cited, 2)
assert.equal(wire.session.occurrences, 3)

// 3. Turn 3 searches again and cites the new source.
state = fold([
  call(0, 1, 'c1', 'web_search', ['alpha']),
  result(1, 1, 'c1', [['https://a.test/x', 'A'], ['https://b.test/y', 'B']]),
  answer(2, 1, '[A](https://a.test/x)'),
  end(3, 1),
])
state = definition.apply(state, answer(4, 2, '[B](https://b.test/y)'))
state = definition.apply(state, end(5, 2))
state = definition.apply(state, call(6, 3, 'c2', 'web_search', ['gamma']))
state = definition.apply(state, result(7, 3, 'c2', [['https://c.test/z', 'C']]))
state = definition.apply(state, answer(8, 3, '[C](https://c.test/z)'))
state = definition.apply(state, end(9, 3))
wire = definition.wire.view(state)
assert.equal(wire.turns['3'].cited, 1)
assert.equal(wire.turns['3'].local, 1)
assert.equal(wire.session.cited, 3)
assert.equal(wire.session.occurrences, 3)

// 4. Duplicate `tool/result` append (surface replacement) stays idempotent.
const duplicateState = fold([
  call(10, 4, 'c3', 'web_search', ['delta']),
  result(11, 4, 'c3', [['https://d.test/a', 'D']]),
  result(12, 4, 'c3', [['https://d.test/a', 'D']]),
  answer(13, 4, '[D](https://d.test/a)'),
  end(14, 4),
])
wire = definition.wire.view(duplicateState)
assert.equal(wire.turns['4'].searchCalls, 1)
assert.equal(wire.turns['4'].returned, 1)
assert.equal(wire.session.searches, 1)

// 5. Fork-inherited prefix is skipped, so parent citations are not counted.
const forkState = fold([
  call(0, 1, 'parent', 'web_search'),
  result(1, 1, 'parent', [['https://parent.test/p', 'P']]),
  answer(2, 1, '[P](https://parent.test/p)'),
  end(3, 1),
  call(6, 2, 'child', 'web_search'),
  result(7, 2, 'child', [['https://child.test/c', 'C']]),
  answer(8, 2, '[C](https://child.test/c)'),
  end(9, 2),
], 6)
wire = definition.wire.view(forkState)
assert.equal(wire.turns['1'], undefined, 'inherited turn must be ignored')
assert.equal(wire.turns['2'].cited, 1)
assert.equal(wire.session.cited, 1)

// 6. Wire schema and JSON-shape invariants.
assert.doesNotThrow(() => definition.wire.viewSchema.parse(wire))
assert.equal(JSON.stringify(wire).includes('undefined'), false)


// 7. Provider metadata (site_icon / authority / rerank_score) survives the fold.
const metadataState = fold([
  call(20, 7, 'meta', 'web_search', ['metadata']),
  result(21, 7, 'meta', [
    [
      'https://m.test/a',
      'Meta A',
      {
        site_icon: 'https://icons.test/a.png',
        authority: 'm.test',
        rerank_score: 0.87,
      },
    ],
  ]),
  answer(22, 7, '[Meta A](https://m.test/a)'),
  end(23, 7),
])
const metadataWire = definition.wire.view(metadataState)
assert.deepEqual(metadataWire.turns['7'].sources[0], {
  url: 'https://m.test/a',
  title: 'Meta A',
  cited: true,
  icon: 'https://icons.test/a.png',
  authority: 'm.test',
  rerankScore: 0.87,
})


// 8. A web_fetch call marks the matching search source as "may have read".
const fetchState = fold([
  call(30, 8, 's1', 'web_search', ['fetch']),
  result(31, 8, 's1', [
    ['https://a.test/x', 'A'],
    ['https://b.test/y', 'B'],
  ]),
  fetchCall(32, 8, 'f1', 'https://a.test/x'),
  fetchResult(33, 8, 'f1', 'https://a.test/x', 200),
  answer(34, 8, '[B](https://b.test/y)'),
  end(35, 8),
])
const fetchWire = definition.wire.view(fetchState)
assert.equal(fetchWire.turns['8'].fetchCount, 1)
assert.deepEqual(fetchWire.turns['8'].fetches, [{ url: 'https://a.test/x', statusCode: 200 }])
assert.equal(fetchWire.turns['8'].sources[0].fetched, true)
assert.equal(fetchWire.turns['8'].sources[0].cited, false)
assert.equal(fetchWire.turns['8'].sources[1].cited, true)
assert.equal(fetchWire.turns['8'].sources[1].fetched, undefined)
assert.equal(fetchWire.session.fetched, 1)

// 9. `returned` is a lifetime count, so it keeps growing past the matching
//    pool cap instead of freezing at MAX_POOL.
const bigSources = Array.from({ length: 4100 }, (_, index) => [`https://big.test/${index}`, `S${index}`])
const bigState = fold([
  call(40, 9, 'big', 'web_search', ['big']),
  result(41, 9, 'big', bigSources),
  end(42, 9),
])
const bigWire = definition.wire.view(bigState)
assert.equal(bigWire.turns['9'].returned, 4100)
assert.equal(bigWire.session.returned, 4100, 'session returned does not freeze at the pool cap')
assert.equal(bigWire.turns['9'].sourceCount, 4100)
assert.equal(bigWire.turns['9'].sources.length, 50, 'the wire view still caps per-turn sources')
assert.equal(bigWire.turns['9'].sourcesTruncated, true)

// 10. Unchanged turns reuse their wire object across views.
let cachedState = fold([
  call(50, 10, 'cache', 'web_search', ['cache']),
  result(51, 10, 'cache', [['https://cache.test/x', 'C']]),
  answer(52, 10, '[C](https://cache.test/x)'),
  end(53, 10),
])
const beforeView = definition.wire.view(cachedState)
cachedState = definition.apply(cachedState, answer(54, 11, 'Narration for a turn that has not ended.'))
const afterView = definition.wire.view(cachedState)
assert.notEqual(afterView, beforeView)
assert.equal(afterView.turns['10'], beforeView.turns['10'], 'unchanged turn reuses its wire object')
assert.deepEqual(afterView.turns['10'], beforeView.turns['10'])

// 11. Text before a tool call is narration, not the final answer: a turn that
//     ends without a later answer text must not count the narration's links.
const narrated = fold([
  call(60, 12, 'n1', 'web_search', ['narrated']),
  result(61, 12, 'n1', [['https://n.test/a', 'N']]),
  answer(62, 12, 'I will look at [N](https://n.test/a) next.'),
  fetchCall(63, 12, 'f1', 'https://n.test/a'),
  fetchResult(64, 12, 'f1', 'https://n.test/a', 200),
  end(65, 12),
])
const narratedWire = definition.wire.view(narrated)
assert.equal(narratedWire.turns['12'].cited, 0, 'narration before a tool call is not an answer')
assert.equal(narratedWire.turns['12'].local, 0)
assert.equal(narratedWire.session.cited, 0)

// 12. An answer emitted after the tool call still commits normally.
const followed = fold([
  call(70, 13, 'n2', 'web_search', ['followed']),
  result(71, 13, 'n2', [['https://n.test/b', 'N2']]),
  answer(72, 13, 'Looking at [N2](https://n.test/b) first.'),
  fetchCall(73, 13, 'f2', 'https://n.test/b'),
  fetchResult(74, 13, 'f2', 'https://n.test/b', 200),
  answer(75, 13, 'Final: [N2](https://n.test/b).'),
  end(76, 13),
])
const followedWire = definition.wire.view(followed)
assert.equal(followedWire.turns['13'].cited, 1)
assert.equal(followedWire.turns['13'].local, 1)

console.log('projection tests passed')
