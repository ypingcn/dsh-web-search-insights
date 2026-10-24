/**
 * Client bundle contract test: loads the hand-written browser bundle with a
 * fake module loader and a fake React, then exercises the slot wiring and the
 * two rendered surfaces.
 *
 *   node test/client.test.mjs
 */
import assert from 'node:assert/strict'

let captured
globalThis.window = {
  __ModuleLoader__: {
    load(definition) {
      captured = definition
    },
  },
}

const fakeReact = {
  createElement(type, props, ...children) {
    const nextProps = { ...(props ?? {}), children: children.flat(Infinity) }
    if (typeof type === 'function') return type(nextProps)
    return { type, props: props ?? {}, children: nextProps.children }
  },
  useState(initial) {
    return [typeof initial === 'function' ? initial() : initial, () => {}]
  },
  useEffect() {},
}

await import('../lib/client.js')
assert.ok(captured, 'bundle must register itself through __ModuleLoader__')
assert.equal(captured.id, 'dsh-web-search-logger')
const client = captured.factory((name) => {
  if (name === 'react') return fakeReact
  throw new Error(`unexpected client require: ${name}`)
})
assert.equal(client.name, 'dsh-web-search-logger')
assert.equal(typeof client.apply, 'function')
assert.ok(client.inject.includes('slots'))
assert.ok(client.inject.includes('sidebarRightTabs'))

const registrations = []
const tabs = []
let opened
const dictionaries = {}
const fakeCtx = {
  effect(fn) {
    return fn()
  },
  locale: {
    register(namespace, messages) {
      dictionaries[namespace] = messages
      return () => {}
    },
    bind(namespace) {
      return (key, params = {}) =>
        (dictionaries[namespace]?.zh?.[key] ?? key).replace(
          /\{(\w+)\}/g,
          (_match, name) => String(params[name] ?? ''),
        )
    },
  },
  slots: {
    inject(name, factory) {
      const dispose = factory()
      if (typeof dispose === 'function') return dispose
      return () => {}
    },
    register(options, component) {
      registrations.push({ options, component })
      if (options.name === 'sidebar.right.pane.tab') tabs.push(options.key)
      return () => {}
    },
  },
  sidebarRightTabs: {
    register(definition) {
      tabs.push(definition)
      return () => {}
    },
  },
  sidebarRight: {
    openTab(kind, options) {
      opened = { kind, options }
    },
  },
}

client.apply(fakeCtx)

const turnTail = registrations.find((entry) => entry.options.name === 'conversation.chat.turnTail')
assert.ok(turnTail, 'turn-tail entry must be registered')
assert.equal(turnTail.options.id, 'dsh-web-search-logger')
const injected = turnTail.options.inject('session-1')
injected.openPanel(3)
assert.equal(opened.kind, 'web-search-logger')
assert.deepEqual(opened.options.params, { sessionId: 'session-1', turn: 3 })

const pane = registrations.find((entry) => entry.options.name === 'sidebar.right.pane.tab')
assert.ok(pane, 'sidebar pane body must be registered')
assert.equal(pane.options.key, 'dsh-web-search-logger')
assert.ok(tabs.some((tab) => tab && tab.kind === 'web-search-logger'), 'sidebar type must be registered')

const fixture = {
  v: 1,
  session: { searches: 2, returned: 3, cited: 2, occurrences: 3, fetched: 2 },
  latestTurn: 1,
  turns: {
    1: {
      searchCalls: 1,
      returned: 2,
      cited: 2,
      local: 1,
      occurrences: 2,
      queries: ['alpha'],
      sourceCount: 6,
      fetchCount: 2,
      fetches: [
        { url: 'https://a.test/x', statusCode: 200 },
        { url: 'https://c.test/z', statusCode: 200 },
      ],
      sources: [
        { url: 'https://a.test/x', title: 'A', cited: true, rerankScore: 2, icon: 'https://icons.test/a.png' },
        { url: 'https://b.test/y', title: 'B', cited: true, rerankScore: 1, icon: 'https://icons.test/b.png' },
        { url: 'https://c.test/z', title: 'C', cited: false, fetched: true, rerankScore: 9, icon: 'https://icons.test/c.png' },
        { url: 'https://d.test/z', title: 'D', cited: false, rerankScore: 8, icon: 'https://icons.test/d.png' },
        { url: 'https://e.test/z', title: 'E', cited: false, rerankScore: 7, icon: 'https://icons.test/e.png' },
        { url: 'https://f.test/z', title: 'F', cited: false, rerankScore: 6 },
      ],
    },
  },
}

const t = fakeCtx.locale.bind('dsh-web-search-logger')
const entryElement = turnTail.component({
  turn: { turn: 1 },
  useProjection: (_key, selector) => selector(fixture),
  t,
  openPanel: () => {},
})
const entryText = JSON.stringify(entryElement)
assert.match(entryText, /本轮引用 2 个网页 · 会话累计 2 个网页 · 主动抓取 2 个网页数据/)
assert.match(entryText, /查看/)

const zeroFixture = {
  ...fixture,
  turns: {
    ...fixture.turns,
    2: {
      searchCalls: 1,
      returned: 4,
      cited: 0,
      local: 0,
      occurrences: 0,
      queries: ['zero'],
      sourceCount: 4,
      fetchCount: 0,
      fetches: [],
      sources: [],
    },
  },
}
const zeroEntry = turnTail.component({
  turn: { turn: 2 },
  useProjection: (_key, selector) => selector(zeroFixture),
  t,
  openPanel: () => {},
})
assert.match(JSON.stringify(zeroEntry), /本轮引用 0 个网页 · 会话累计 2 个网页 · 搜索返回 4 个网页/)

const images = []
function collectImages(node) {
  if (node === null || typeof node !== 'object') return
  if (node.type === 'img') images.push(node.props.src)
  for (const child of node.children ?? []) collectImages(child)
}
collectImages(entryElement)
assert.deepEqual(images, [
  'https://icons.test/a.png',
  'https://icons.test/b.png',
  'https://icons.test/c.png',
  'https://icons.test/d.png',
  'https://icons.test/e.png',
], 'cited icons first, then uncited by rerank score, capped at five')

const panelElement = pane.component({
  useProjection: () => fixture,
  useTabInfo: () => ({
    tab: { navigation: { params: { sessionId: 'session-1', turn: 1 }, revision: 2 } },
  }),
  t,
})
const panelText = JSON.stringify(panelElement)
assert.match(panelText, /搜索记录/)
assert.match(panelText, /会话累计引用 2 个来源（共 3 次） · 返回 3 个 · 搜索 2 次 · 获取 2 个网页/)
assert.match(panelText, /本轮回答引用 2 个来源，其中 1 个来自本轮搜索；本轮共返回 2 个来源。/)
assert.match(panelText, /已引用/)
assert.match(panelText, /可能看过/)
assert.match(panelText, /未引用/)
assert.match(panelText, /获取的网页（最新数据）/)

// Without projection data both surfaces degrade to "unavailable" instead of throwing.
const emptyEntry = turnTail.component({
  turn: { turn: 1 },
  useProjection: (_key, selector) => selector(undefined),
  t,
  openPanel: () => {},
})
assert.equal(emptyEntry, null)
const emptyPanel = pane.component({
  useProjection: () => undefined,
  useTabInfo: () => ({ tab: { navigation: { params: undefined, revision: 0 } } }),
  t,
})
assert.match(JSON.stringify(emptyPanel), /统计未启用/)

console.log('client tests passed')
