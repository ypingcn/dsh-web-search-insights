/**
 * Projection unit tests: synthetic session events, no host or model needed.
 *
 *   node test/projection.test.mjs
 */
import assert from 'node:assert/strict'
import { webSearchStatsDefinition as definition } from '../src/projection.js'

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
  sourceCount: 2,
  sources: [
    { url: 'https://a.test/x?utm_source=news', title: 'A', cited: true },
    { url: 'https://b.test/y', title: 'B', cited: false },
  ],
})
assert.deepEqual(wire.session, { searches: 1, returned: 2, cited: 1, occurrences: 1 })

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

console.log('projection tests passed')
