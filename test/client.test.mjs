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
  session: { searches: 2, returned: 3, cited: 2, occurrences: 3 },
  latestTurn: 1,
  turns: {
    1: {
      searchCalls: 1,
      returned: 2,
      cited: 2,
      local: 1,
      occurrences: 2,
      queries: ['alpha'],
      sourceCount: 2,
      sources: [
        { url: 'https://a.test/x', title: 'A', cited: true },
        { url: 'https://b.test/y', title: 'B', cited: false },
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
assert.match(entryText, /本轮引用 2 条（含历史来源）/)
assert.match(entryText, /会话累计 2 条/)

const panelElement = pane.component({
  useProjection: () => fixture,
  useTabInfo: () => ({
    tab: { navigation: { params: { sessionId: 'session-1', turn: 1 }, revision: 2 } },
  }),
  t,
})
const panelText = JSON.stringify(panelElement)
assert.match(panelText, /搜索记录/)
assert.match(panelText, /会话累计引用 2 个来源/)
assert.match(panelText, /本轮回答引用 2 个（含历史来源）/)
assert.match(panelText, /已引用/)
assert.match(panelText, /未引用/)

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
