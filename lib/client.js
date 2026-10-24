// dsh-web-search-logger — browser half.
//
// Hand-written client bundle in the official module-system format:
//   window.__ModuleLoader__.load({ id, factory })
// The factory runs once, on materialization; `require` resolves only the shell
// baseline (React here). The Host half still owns the session projection; this
// file only renders the turn-tail entry and the right-sidebar panel.
window.__ModuleLoader__.load({
  id: "dsh-web-search-logger",
  factory: (require) => {
    var module = { exports: {} }
    var exports = module.exports
    Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" })
    var React = require("react")
    var h = React.createElement

    const NS = "dsh-web-search-logger"
    const PKG = "dsh-web-search-logger"
    const KIND = "web-search-logger"
    const PROJECTION_KEY = "webSearchStats"

    const MESSAGES = {
      zh: {
        "panel.title": "搜索记录",
        "panel.guideDesc": "查看本次会话的搜索来源与引用情况",
        "panel.turnMode": "本轮",
        "panel.sessionMode": "本会话",
        "panel.summary":
          "会话累计引用 {cited} 个来源（共 {occurrences} 次） · 返回 {returned} 个 · 搜索 {searches} 次",
        "panel.turnSummary":
          "本轮回答引用 {cited} 个来源，其中 {local} 个来自本轮搜索；本轮共返回 {returned} 个来源。",
        "panel.turnLabel": "第 {turn} 轮",
        "panel.searches": "{count} 次搜索",
        "panel.noData": "还没有搜索记录。发起一次需要联网的提问后再回来看看。",
        "panel.unavailable": "搜索统计未启用或尚未就绪。",
        "panel.noTurn": "这一轮没有搜索记录。",
        "panel.cited": "已引用",
        "panel.notCited": "未引用",
        "panel.fetched": "可能看过",
        "panel.fetchedSummary": "获取 {count} 个网页",
        "panel.fetchesTitle": "获取的网页（最新数据）",
        "panel.http": "HTTP {code}",
        "panel.moreSources": "还有 {count} 个来源未展示。",
        "panel.openHint": "查看搜索结果",
        "entry.cited": "本轮引用 {count} 条",
        "entry.none": "本轮未引用 · 返回 {count} 条",
        "entry.session": "会话累计 {count} 条",
        "entry.fetched": "参考了 {count} 个网页的最新数据",
        "entry.open": "查看",
        "entry.tooltip": "其中本轮搜索来源 {local} 条",
      },
      en: {
        "panel.title": "Search sources",
        "panel.guideDesc": "Review this session's search sources and citations",
        "panel.turnMode": "This turn",
        "panel.sessionMode": "Session",
        "panel.summary":
          "Session: {cited} cited sources ({occurrences} citations) · {returned} returned · {searches} searches",
        "panel.turnSummary":
          "This answer cites {cited} sources, {local} from this turn's searches; {returned} sources were returned this turn.",
        "panel.turnLabel": "Turn {turn}",
        "panel.searches": "{count} searches",
        "panel.noData": "No searches yet. Ask something that needs the web, then come back.",
        "panel.unavailable": "Search statistics are unavailable or not ready.",
        "panel.noTurn": "This turn has no search records.",
        "panel.cited": "cited",
        "panel.notCited": "not cited",
        "panel.fetched": "may have read",
        "panel.fetchedSummary": "{count} pages fetched",
        "panel.fetchesTitle": "Fetched pages (latest data)",
        "panel.http": "HTTP {code}",
        "panel.moreSources": "{count} more sources not shown.",
        "panel.openHint": "View search sources",
        "entry.cited": "This turn cites {count} sources (incl. earlier turns)",
        "entry.none": "Not cited this turn · {count} returned",
        "entry.session": "Session: {count}",
        "entry.fetched": "consulted latest data from {count} pages",
        "entry.open": "View",
        "entry.tooltip": "{local} from this turn's searches",
      },
    }

    const CSS = `
.wsl-entry{display:inline-flex;align-items:center;gap:8px;max-width:100%;border:1px solid var(--dsw-alias-border-l2,#d9d9d9);background:var(--dsw-alias-bg-layer-2,transparent);color:var(--dsw-alias-label-primary,inherit);border-radius:8px;padding:5px 10px;font:inherit;font-size:12px;line-height:1.5;cursor:pointer;text-align:left}
.wsl-entry:hover{border-color:var(--dsw-alias-label-tertiary,#aaa);background:var(--dsw-alias-interactive-bg-hover,rgba(127,127,127,.08))}
.wsl-entry-icons{display:inline-flex;align-items:center;flex:none;padding-left:2px}
.wsl-icon{width:18px;height:18px;border-radius:50%;object-fit:cover;background:var(--dsw-alias-bg-layer-2,#f2f2f2);border:1px solid var(--dsw-alias-border-l1,#eee);display:inline-flex;align-items:center;justify-content:center;font-size:9px;font-weight:600;color:var(--dsw-alias-label-secondary,#666);flex:none;overflow:hidden}
.wsl-entry-icons .wsl-icon+.wsl-icon{margin-left:-4px}
.wsl-entry-action{flex:none;color:var(--dsw-alias-brand-primary,#4a7dff);margin-left:2px}
.wsl-panel{display:flex;flex-direction:column;gap:10px;padding:12px;height:100%;min-height:0;overflow:auto;font-size:12px;color:var(--dsw-alias-label-primary,inherit)}
.wsl-head{display:flex;align-items:flex-start;justify-content:space-between;gap:10px}
.wsl-title{font-size:14px;font-weight:600;line-height:1.4;margin:0;flex:none}
.wsl-stats{display:inline-flex;align-items:center;gap:8px;flex-wrap:wrap;color:var(--dsw-alias-label-secondary,#666);line-height:1.5;font-size:11px}
.wsl-head .wsl-stats{justify-content:flex-end;flex:1;min-width:0}
.wsl-stat{display:inline-flex;align-items:center;gap:3px;white-space:nowrap}
.wsl-stat-icon{width:13px;height:13px;flex:none;opacity:.85}
.wsl-stat-count{font-variant-numeric:tabular-nums}
.wsl-seg{display:flex;gap:6px;border-bottom:1px solid var(--dsw-alias-border-l1,#eee);padding-bottom:8px}
.wsl-seg button{border:1px solid var(--dsw-alias-border-l2,#d9d9d9);background:transparent;color:var(--dsw-alias-label-secondary,#666);border-radius:999px;padding:3px 10px;font:inherit;font-size:11px;cursor:pointer}
.wsl-seg button[data-active="true"]{color:var(--dsw-alias-label-primary,inherit);border-color:var(--dsw-alias-brand-primary,#4a7dff);background:var(--dsw-alias-bg-layer-2,transparent)}
.wsl-card{border:1px solid var(--dsw-alias-border-l2,#d9d9d9);border-radius:10px;padding:10px;display:flex;flex-direction:column;gap:8px;background:var(--dsw-alias-bg-layer-1,transparent)}
.wsl-card-head{display:flex;align-items:center;gap:8px;flex-wrap:wrap}
.wsl-card-title{font-weight:600}
.wsl-card-head .wsl-stats{margin-left:auto}
.wsl-muted{color:var(--dsw-alias-label-secondary,#666);font-size:11px;line-height:1.5}
.wsl-queries{display:flex;flex-wrap:wrap;gap:5px}
.wsl-chip{border:1px solid var(--dsw-alias-border-l1,#eee);border-radius:999px;padding:1px 8px;color:var(--dsw-alias-label-secondary,#666);font-size:11px;line-height:1.6;max-width:100%;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.wsl-sources{display:flex;flex-direction:column;gap:5px}
.wsl-source{display:flex;align-items:baseline;gap:6px;min-width:0}
.wsl-source-title{color:var(--dsw-alias-brand-primary,#4a7dff);text-decoration:none;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;min-width:0;flex:1}
.wsl-source .wsl-icon{width:14px;height:14px;font-size:8px}
.wsl-source-title:hover{text-decoration:underline}
.wsl-source-host{color:var(--dsw-alias-label-tertiary,#999);font-size:10px;flex:none;max-width:40%;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.wsl-badge{flex:none;border-radius:999px;padding:0 6px;font-size:10px;line-height:1.6;border:1px solid var(--dsw-alias-border-l2,#d9d9d9);color:var(--dsw-alias-label-secondary,#666)}
.wsl-badge-on{border-color:var(--dsw-alias-brand-primary,#4a7dff);color:var(--dsw-alias-brand-primary,#4a7dff)}
.wsl-badge-seen{border-color:var(--dsw-alias-state-warn-primary,#d98a00);color:var(--dsw-alias-state-warn-primary,#d98a00)}
.wsl-fetches{display:flex;flex-direction:column;gap:4px;border-top:1px dashed var(--dsw-alias-border-l1,#eee);padding-top:7px}
.wsl-fetch{display:flex;align-items:baseline;gap:6px;min-width:0}
.wsl-fetch a{color:var(--dsw-alias-label-secondary,#666);text-decoration:none;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;min-width:0;flex:1}
.wsl-fetch a:hover{text-decoration:underline}
.wsl-fetch code{font-size:10px;color:var(--dsw-alias-label-tertiary,#999);flex:none}
.wsl-empty{color:var(--dsw-alias-label-secondary,#666);padding:12px 4px;line-height:1.6}
`.trim()

    if (typeof document !== "undefined") {
      const tag = "dsh-web-search-logger/client.css"
      const existing = document.querySelector(`style[data-plugin-css="${tag}"]`)
      if (existing !== null) {
        // HMR reloads re-run the factory in the same document; refresh the
        // existing stylesheet instead of skipping it, otherwise CSS edits
        // never reach the open page.
        existing.textContent = CSS
      } else {
        const style = document.createElement("style")
        style.dataset.plugin = PKG
        style.dataset.pluginCss = tag
        style.textContent = CSS
        document.head.appendChild(style)
      }
    }

    /** Hostname for a source row's secondary label. */
    function hostOf(url) {
      try {
        return new URL(url).hostname.replace(/^www\./, "")
      } catch {
        return url
      }
    }

    /** Origin favicon as the fallback when the provider supplies no site_icon. */
    function faviconOf(url) {
      try {
        return `${new URL(url).origin}/favicon.ico`
      } catch {
        return ""
      }
    }

    /** First host letter, used when even the fallback favicon fails to load. */
    function initialOf(url) {
      try {
        return new URL(url).hostname.replace(/^www\./, "").charAt(0).toUpperCase() || "?"
      } catch {
        return "?"
      }
    }

    /** Human label for an icon tooltip. */
    function iconTitle(source, t) {
      const title = source.title || hostOf(source.url)
      const cited = source.cited ? t("panel.cited") : t("panel.notCited")
      const score = typeof source.rerankScore === "number" ? ` · score ${source.rerankScore}` : ""
      const authority = typeof source.authority === "string" && source.authority !== "" ? ` · ${source.authority}` : ""
      return `${title} · ${cited}${score}${authority}`
    }

    /** Site icon with two graceful fallbacks: provider icon → favicon → initial. */
    function SiteIcon({ source, t }) {
      const [failed, setFailed] = React.useState(false)
      const src = typeof source.icon === "string" && source.icon !== "" ? source.icon : faviconOf(source.url)
      if (src === "" || failed) {
        return h(
          "span",
          { className: "wsl-icon wsl-icon-fallback", title: iconTitle(source, t) },
          initialOf(source.url),
        )
      }
      return h("img", {
        className: "wsl-icon",
        src,
        alt: "",
        loading: "lazy",
        referrerPolicy: "no-referrer",
        title: iconTitle(source, t),
        onError: () => setFailed(true),
      })
    }

    /**
     * Pick up to five icons for the turn-tail row: cited sources first, each
     * group ordered by rerank_score descending, then fill from uncited sources.
     */
    function iconSources(entry) {
      const sources = Array.isArray(entry.sources) ? entry.sources : []
      return sources
        .map((source, index) => ({ source, index }))
        .filter(({ source }) => source && typeof source.url === "string" && source.url !== "")
        .sort((left, right) => {
          const cited = Number(right.source.cited) - Number(left.source.cited)
          if (cited !== 0) return cited
          const leftScore = typeof left.source.rerankScore === "number" ? left.source.rerankScore : -Infinity
          const rightScore = typeof right.source.rerankScore === "number" ? right.source.rerankScore : -Infinity
          if (rightScore !== leftScore) return rightScore - leftScore
          return left.index - right.index
        })
        .slice(0, 5)
        .map(({ source }) => source)
    }

    /** Small line icon for one compact statistic. */
    function StatIcon({ kind }) {
      const common = {
        className: "wsl-stat-icon",
        viewBox: "0 0 16 16",
        fill: "none",
        stroke: "currentColor",
        strokeWidth: "1.5",
        strokeLinecap: "round",
        strokeLinejoin: "round",
        "aria-hidden": "true",
      }
      const paths = {
        link: [
          h("path", { key: 1, d: "M6.5 9.5l3-3" }),
          h("path", { key: 2, d: "M7 5l1.5-1.5a2.5 2.5 0 013.5 3.5L10.5 8.5" }),
          h("path", { key: 3, d: "M9 11l-1.5 1.5a2.5 2.5 0 01-3.5-3.5L5.5 7.5" }),
        ],
        list: [h("path", { key: 1, d: "M3 4.5h10M3 8h10M3 11.5h7" })],
        search: [
          h("circle", { key: 1, cx: "6.5", cy: "6.5", r: "3.5" }),
          h("path", { key: 2, d: "M9 9l4 4" }),
        ],
        repeat: [h("path", { key: 1, d: "M4 6.5h8l-2-2M12 9.5H4l2 2" })],
        page: [
          h("path", { key: 1, d: "M4 2.5h5l3 3v8H4z" }),
          h("path", { key: 2, d: "M9 2.5v3h3M8 8v3M6.5 9.5L8 11l1.5-1.5" }),
        ],
        target: [
          h("circle", { key: 1, cx: "8", cy: "8", r: "4.5" }),
          h("circle", { key: 2, cx: "8", cy: "8", r: "1.5", fill: "currentColor", stroke: "none" }),
        ],
      }
      return h("svg", common, paths[kind] ?? [])
    }

    /** One compact "icon + count" statistic; the full sentence lives in the tooltip. */
    function Stat({ kind, count, title }) {
      const props = { className: "wsl-stat" }
      if (title !== undefined) {
        props.title = title
        props["aria-label"] = title
      } else {
        props["aria-hidden"] = "true"
      }
      return h("span", props, h(StatIcon, { kind }), h("span", { className: "wsl-stat-count" }, String(count)))
    }

    /** Page/source status badge: cited wins over fetched, fetched over untouched. */
    function sourceBadge(source, t) {
      if (source.cited) return { label: t("panel.cited"), className: "wsl-badge wsl-badge-on" }
      if (source.fetched) return { label: t("panel.fetched"), className: "wsl-badge wsl-badge-seen" }
      return { label: t("panel.notCited"), className: "wsl-badge" }
    }

    /** One turn's card: counters, keywords, sources, and fetched pages. */
    function TurnCard({ entry, turn, t }) {
      const sources = Array.isArray(entry.sources) ? entry.sources : []
      const shown = sources.length
      const hidden = typeof entry.sourceCount === 'number' ? Math.max(0, entry.sourceCount - shown) : 0
      return h(
        "section",
        { className: "wsl-card", "data-turn": turn },
        h(
          "div",
          { className: "wsl-card-head" },
          h("span", { className: "wsl-card-title" }, t("panel.turnLabel", { turn })),
          h("span", { className: "wsl-muted" }, t("panel.searches", { count: entry.searchCalls })),
          h(
            "div",
            {
              className: "wsl-stats",
              title: t("panel.turnSummary", {
                cited: entry.cited,
                local: entry.local,
                returned: entry.returned,
              }),
              "aria-label": t("panel.turnSummary", {
                cited: entry.cited,
                local: entry.local,
                returned: entry.returned,
              }),
            },
            h(Stat, { kind: "link", count: entry.cited }),
            h(Stat, { kind: "target", count: entry.local }),
            h(Stat, { kind: "list", count: entry.returned }),
          ),
        ),
        Array.isArray(entry.queries) && entry.queries.length > 0
          ? h(
              "div",
              { className: "wsl-queries" },
              entry.queries.map((query, index) =>
                h("span", { className: "wsl-chip", key: `${index}:${query}`, title: query }, query),
              ),
            )
          : null,
        sources.length > 0
          ? h(
              "div",
              { className: "wsl-sources" },
              sources.map((source, index) =>
                h(
                  "div",
                  { className: "wsl-source", key: `${index}:${source.url}` },
                  h(SiteIcon, { source, t }),
                  h(
                    "a",
                    {
                      className: "wsl-source-title",
                      href: source.url,
                      target: "_blank",
                      rel: "noreferrer",
                      title: source.url,
                    },
                    source.title || hostOf(source.url),
                  ),
                  h("span", { className: "wsl-source-host" }, hostOf(source.url)),
                  (() => {
                    const badge = sourceBadge(source, t)
                    return h("span", { className: badge.className }, badge.label)
                  })(),
                ),
              ),
            )
          : null,
        hidden > 0 ? h("div", { className: "wsl-muted" }, t("panel.moreSources", { count: hidden })) : null,
        entry.fetchCount > 0 && Array.isArray(entry.fetches)
          ? h(
              "div",
              { className: "wsl-fetches" },
              h("div", { className: "wsl-muted" }, t("panel.fetchesTitle")),
              entry.fetches.map((fetch, index) =>
                h(
                  "div",
                  { className: "wsl-fetch", key: `${index}:${fetch.url}` },
                  h("a", { href: fetch.url, target: "_blank", rel: "noreferrer", title: fetch.url }, fetch.url),
                  typeof fetch.statusCode === "number"
                    ? h("code", null, t("panel.http", { code: fetch.statusCode }))
                    : null,
                ),
              ),
            )
          : null,
      )
    }

    /** Entry row appended after each completed answer in the Chat view. */
    function EntryRow(props) {
      const { turn, useProjection, t, openPanel } = props
      const turnKey = String(turn.turn)
      const entry = useProjection(PROJECTION_KEY, (value) => {
        if (value === undefined || value === null || value.v !== 1) return null
        return value.turns[turnKey] ?? null
      })
      const sessionCited = useProjection(PROJECTION_KEY, (value) =>
        value !== undefined && value !== null && value.v === 1 ? value.session.cited : null,
      )
      if (entry === null || sessionCited === null) return null
      if (entry.searchCalls === 0 && entry.cited === 0) return null

      const label =
        entry.cited > 0
          ? t("entry.cited", { count: entry.cited })
          : t("entry.none", { count: entry.returned })
      const fetched = typeof entry.fetchCount === "number" && entry.fetchCount > 0
        ? ` · ${t("entry.fetched", { count: entry.fetchCount })}`
        : ""
      return h(
        "button",
        {
          type: "button",
          className: "wsl-entry",
          title: t("entry.tooltip", { local: entry.local }),
          onClick: () => openPanel(turn.turn),
        },
        h(
          "span",
          { className: "wsl-entry-icons" },
          iconSources(entry).map((source, index) =>
            h(SiteIcon, { key: `${index}:${source.url}`, source, t }),
          ),
        ),
        h("span", null, `${label} · ${t("entry.session", { count: sessionCited })}${fetched}`),
        h("span", { className: "wsl-entry-action" }, t("entry.open")),
      )
    }

    /** Right-sidebar panel body. */
    function PanelBody(props) {
      const { useProjection, useTabInfo, t } = props
      const tabInfo = useTabInfo()
      const navigation = tabInfo.tab.navigation
      const params = navigation.params
      const focusTurn =
        params !== null && typeof params === "object" && typeof params.turn === "number"
          ? params.turn
          : undefined
      const stats = useProjection(PROJECTION_KEY)
      const [mode, setMode] = React.useState(focusTurn === undefined ? "session" : "turn")
      const [selectedTurn, setSelectedTurn] = React.useState(focusTurn)

      React.useEffect(() => {
        if (focusTurn !== undefined) {
          setMode("turn")
          setSelectedTurn(focusTurn)
        }
      }, [navigation.revision, focusTurn])

      if (stats === undefined || stats === null || stats.v !== 1) {
        return h("div", { className: "wsl-panel" }, h("div", { className: "wsl-empty" }, t("panel.unavailable")))
      }

      const turnKeys = Object.keys(stats.turns ?? {}).sort((left, right) => Number(right) - Number(left))
      const latestTurn = turnKeys.length > 0 ? Number(turnKeys[0]) : undefined
      const activeTurn = selectedTurn ?? focusTurn ?? latestTurn
      const activeEntry = activeTurn === undefined ? undefined : stats.turns[String(activeTurn)]

      return h(
        "div",
        { className: "wsl-panel" },
        h(
          "div",
          { className: "wsl-head" },
          h("h2", { className: "wsl-title" }, t("panel.title")),
          h(
            "div",
            {
              className: "wsl-stats",
              title:
                t("panel.summary", {
                  cited: stats.session.cited,
                  occurrences: stats.session.occurrences,
                  returned: stats.session.returned,
                  searches: stats.session.searches,
                }) +
                (stats.session.fetched > 0
                  ? ` · ${t("panel.fetchedSummary", { count: stats.session.fetched })}`
                  : ""),
            },
            h(Stat, { kind: "link", count: stats.session.cited }),
            h(Stat, { kind: "repeat", count: stats.session.occurrences }),
            h(Stat, { kind: "list", count: stats.session.returned }),
            h(Stat, { kind: "search", count: stats.session.searches }),
            stats.session.fetched > 0
              ? h(Stat, { kind: "page", count: stats.session.fetched })
              : null,
          ),
        ),
        h(
          "div",
          { className: "wsl-seg" },
          h(
            "button",
            {
              type: "button",
              "data-active": mode === "turn" ? "true" : "false",
              onClick: () => setMode("turn"),
            },
            t("panel.turnMode"),
          ),
          h(
            "button",
            {
              type: "button",
              "data-active": mode === "session" ? "true" : "false",
              onClick: () => setMode("session"),
            },
            t("panel.sessionMode"),
          ),
        ),
        turnKeys.length === 0
          ? h("div", { className: "wsl-empty" }, t("panel.noData"))
          : mode === "turn"
            ? activeEntry === undefined
              ? h("div", { className: "wsl-empty" }, t("panel.noTurn"))
              : h(TurnCard, { entry: activeEntry, turn: activeTurn, t })
            : turnKeys.map((key) => h(TurnCard, { entry: stats.turns[key], turn: Number(key), t })),
      )
    }

    /** Client entry: one turn-tail row, one sidebar tab type, one pane body. */
    function apply(ctx) {
      ctx.effect(() => ctx.locale.register(NS, MESSAGES), "web-search-logger: dictionaries")
      const t = ctx.locale.bind(NS)

      ctx.effect(
        () =>
          ctx.sidebarRightTabs.register({
            id: PKG,
            kind: KIND,
            priority: "extension",
            title: () => t("panel.title"),
            guide: [
              {
                id: PKG,
                order: 40,
                title: () => t("panel.title"),
                description: () => t("panel.guideDesc"),
              },
            ],
          }),
        "web-search-logger: sidebar type",
      )

      ctx.slots.inject("sidebar.right.pane.tab", () =>
        ctx.slots.register(
          {
            name: "sidebar.right.pane.tab",
            key: PKG,
            locale: NS,
          },
          PanelBody,
        ),
      )

      ctx.slots.inject("conversation.chat.turnTail", () =>
        ctx.slots.register(
          {
            name: "conversation.chat.turnTail",
            id: PKG,
            order: 30,
            locale: NS,
            inject: (sessionId) => ({
              openPanel: (turnNumber) => {
                try {
                  ctx.sidebarRight.openTab(KIND, { params: { sessionId, turn: turnNumber } })
                } catch {
                  /* the sidebar may be unavailable in a minimal composition */
                }
              },
            }),
          },
          EntryRow,
        ),
      )
    }

    exports.name = "dsh-web-search-logger"
    exports.inject = ["slots", "locale", "sidebarRight", "sidebarRightTabs"]
    exports.apply = apply
    return module.exports
  },
})
