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
  useRef(initial) {
    return { current: initial }
  },
  useSyncExternalStore(_subscribe, getSnapshot) {
    return getSnapshot()
  },
}

/** Minimal stand-in for the shared settings-form primitives. */
class FakeSettingsFormModel {
  constructor(scope, specs) {
    this.scope = scope
    this.specs = new Map(specs.map((spec) => [spec.field, spec]))
  }

  bind(read) {
    const store = {
      value: read(),
      listeners: new Set(),
    }
    store.getSnapshot = () => store.value
    store.subscribe = (listener) => {
      store.listeners.add(listener)
      return () => store.listeners.delete(listener)
    }
    store.set = (value) => {
      store.value = value
      for (const listener of store.listeners) listener()
    }
    return store
  }

  shell() {
    return { available: true, writable: true, dirty: false, invalid: false, saving: false, failed: false }
  }

  field(field) {
    const spec = this.specs.get(field)
    const value = this.scope.getSnapshot().value?.[field]
    return { text: spec.format(value), overridden: false, invalid: false }
  }

  actions() {
    return { edit() {}, resetField() {}, save() {}, discard() {} }
  }

  dispose() {}
}

const fakePrimitives = {
  SettingsFormModel: FakeSettingsFormModel,
  SettingsForm(props) {
    return { type: 'form', props }
  },
  SettingsValueField(props) {
    return { type: 'field', props }
  },
  Switch(props) {
    return { type: 'switch', props }
  },
  Tooltip(props) {
    return { type: 'tooltip', props }
  },
  settingsTextField(field) {
    return {
      field,
      format: (value) => (typeof value === 'string' ? value : ''),
      parse: (text) => ({ kind: 'set', value: text.trim() }),
    }
  },
}

await import('../lib/client.js')
assert.ok(captured, 'bundle must register itself through __ModuleLoader__')
assert.equal(captured.id, 'dsh-web-search-insights')
const client = captured.factory((name) => {
  if (name === 'react') return fakeReact
  if (name === '@deepseek-ai/dsh-client-ui-primitives') return fakePrimitives
  throw new Error(`unexpected client require: ${name}`)
})
assert.equal(client.name, 'dsh-web-search-insights')
assert.equal(typeof client.apply, 'function')
assert.ok(client.inject.includes('slots'))
assert.ok(client.inject.includes('sidebarRightTabs'))

const registrations = []
const tabs = []
let opened
const dictionaries = {}
const fakeConfigForms = {
  get() {
    return {
      getSnapshot: () => ({
        status: 'ready',
        writable: true,
        base: {},
        user: undefined,
        value: {
          enabled: true,
          file: '~/.dsh/logs/web-search.jsonl',
          tools: ['web_search'],
          recordErrors: true,
        },
      }),
      subscribe() {
        return () => {}
      },
    }
  },
  whileServed(_namespaces, register) {
    return register(new Set(['web-search-insights']))
  },
}
const fakeCtx = {
  effect(fn) {
    return fn()
  },
  inject(_services, factory) {
    const child = {
      configForms: fakeConfigForms,
      effect: (fn) => fn(),
    }
    factory(child)
    return { dispose() {} }
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
assert.equal(turnTail.options.id, 'dsh-web-search-insights')
const injected = turnTail.options.inject('session-1')
injected.openPanel(3)
assert.equal(opened.kind, 'web-search-insights')
assert.deepEqual(opened.options.params, { sessionId: 'session-1', turn: 3 })

const pane = registrations.find((entry) => entry.options.name === 'sidebar.right.pane.tab')
assert.ok(pane, 'sidebar pane body must be registered')
assert.equal(pane.options.key, 'dsh-web-search-insights')
assert.ok(tabs.some((tab) => tab && tab.kind === 'web-search-insights'), 'sidebar type must be registered')

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
        { url: 'https://c.test/z', statusCode: 500 },
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

const t = fakeCtx.locale.bind('dsh-web-search-insights')

// Every `t()` call must resolve: a missing key renders the key itself, which
// this fallback bind makes visible below.
for (const locale of ['zh', 'en']) {
  assert.equal(typeof dictionaries['dsh-web-search-insights'][locale]['panel.notCited'], 'string')
}

const quickView = registrations.find((entry) => entry.options.name === 'conversation.view')
assert.ok(quickView, 'quick-search conversation view must be registered')
assert.equal(quickView.options.id, 'quick-search')
assert.equal(quickView.options.order, 20)
assert.equal(quickView.options.label(), '快速搜索')
const quickElement = quickView.component({ t, sessionId: 'session-1' })
const quickText = JSON.stringify(quickElement)
assert.match(quickText, /快速搜索/)
assert.match(quickText, /输入一个关键词/)
assert.doesNotMatch(quickText, /"className":"wsq-desc"/, 'description never occupies its own row')
assert.match(quickText, /"type":"tooltip"/, 'the help button carries a tooltip')
assert.match(quickText, /关于快速搜索/)
assert.match(quickText, /wsq-select/)
assert.match(quickText, /"5".*"10".*"15".*"20"/)

/** Depth-first search over fake React element trees. */
function elementsOfType(node, type, found = []) {
  if (node === null || typeof node !== 'object') return found
  if (node.type === type) found.push(node)
  for (const child of node.children ?? []) elementsOfType(child, type, found)
  return found
}

const originalFetch = globalThis.fetch
globalThis.fetch = async () => ({
  ok: true,
  json: async () => ({
    ok: true,
    value: {
      sources: [
        { url: 'https://a.test/result', title: 'A title', snippet: 'A snippet', publishedAt: '2026-01-02' },
      ],
      truncated: false,
    },
  }),
})
try {
  const sessionId = 'session-quick-search'
  const firstRender = quickView.component({ t, sessionId })
  elementsOfType(firstRender, 'input')[0].props.onChange({ target: { value: 'A' } })
  const secondRender = quickView.component({ t, sessionId })
  elementsOfType(secondRender, 'form')[0].props.onSubmit({ preventDefault() {} })
  await new Promise((resolve) => setTimeout(resolve, 10))
  const thirdRender = quickView.component({ t, sessionId })
  const persistedText = JSON.stringify(thirdRender)
  assert.match(persistedText, /A title/, 'query state survives remount')
  assert.match(persistedText, /A snippet/)
  assert.match(persistedText, /2026-01-02/)
} finally {
  globalThis.fetch = originalFetch
}

const configSlot = registrations.find((entry) => entry.options.name === 'plugins.bundle.config')
assert.ok(configSlot, 'bundle config page must be registered')
assert.equal(configSlot.options.key, 'dsh-web-search-insights')
assert.equal(configSlot.options.locale, 'dsh-web-search-insights')
const configFace = configSlot.options.inject()
const configCard = configSlot.component({ ...configFace, view: 'page', t })
const configText = JSON.stringify(configCard)
assert.match(configText, /插件配置/)
assert.match(configText, /启用插件/)
assert.match(configText, /日志文件/)
assert.match(configText, /记录失败调用/)
assert.match(configText, /观察工具/)
assert.match(configText, /wsi-field-toggle/)
assert.match(configText, /wsi-toggle-row/)
assert.match(configText, /wsi-toggle-grid/)

const entryElement = turnTail.component({
  turn: { turn: 1 },
  useProjection: (_key, selector) => selector(fixture),
  t,
  openPanel: () => {},
})
const entryText = JSON.stringify(entryElement)
assert.match(entryText, /本轮引用 2 个网页 · 会话累计 2 个网页 · 主动抓取 2 个网页数据/)
assert.match(entryText, /查看/)
assert.match(entryText, /未引用/, 'uncited icons carry a localized tooltip')
assert.doesNotMatch(entryText, /panel\.notCited/, 'no raw i18n key leaks into the UI')

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
assert.match(panelText, /未引用/)
assert.match(panelText, /可能看过/)
assert.match(panelText, /wsl-source-status/)
assert.match(panelText, /已引用/)
assert.match(panelText, /"@"/)
assert.match(panelText, /主动抓取数据的页面/)
assert.match(panelText, /wsl-fetch-ok/)
assert.match(panelText, /wsl-fetch-err/)
assert.match(panelText, /"200"/)
assert.match(panelText, /"500"/)
assert.doesNotMatch(panelText, /HTTP 200/)

assert.equal((panelText.match(/"className":"wsl-source-status"/g) ?? []).length, 6, 'mixed list reserves the status column for every row')

const noStatusFixture = {
  ...fixture,
  turns: {
    1: {
      ...fixture.turns[1],
      sources: fixture.turns[1].sources.map((source) => ({ ...source, cited: false, fetched: false })),
    },
  },
}
const noStatusPanel = pane.component({
  useProjection: () => noStatusFixture,
  useTabInfo: () => ({ tab: { navigation: { params: { sessionId: 'session-1', turn: 1 }, revision: 3 } } }),
  t,
})
assert.equal((JSON.stringify(noStatusPanel).match(/wsl-source-status/g) ?? []).length, 0, 'no-status list removes the column entirely')

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
