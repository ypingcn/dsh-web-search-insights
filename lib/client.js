// dsh-web-search-insights — browser half.
//
// Hand-written client bundle in the official module-system format:
//   window.__ModuleLoader__.load({ id, factory })
// The factory runs once, on materialization; `require` resolves the shell
// baseline (React and the shared settings-form primitives). The Host half owns
// the session projection and config storage; this file renders the turn-tail
// entry, the right-sidebar panel, and the plugin page's configuration card.
window.__ModuleLoader__.load({
  id: "dsh-web-search-insights",
  factory: (require) => {
    var module = { exports: {} }
    var exports = module.exports
    Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" })
    var React = require("react")
    var h = React.createElement

    const NS = "dsh-web-search-insights"
    const PKG = "dsh-web-search-insights"
    const KIND = "web-search-insights"
    const PROJECTION_KEY = "webSearchInsights"
    /** Host settings namespace for this plugin row (its profile entry id). */
    const CONFIG_NS = "web-search-insights"
    /** Same-origin Host route backing the quick-search view. */
    const QUICK_SEARCH_PATH = "/api/dsh-web-search-insights/quick-search"
    const QUICK_SEARCH_HEADER = "x-dsh-web-search-insights"
    const QUICK_SEARCH_LIMITS = [5, 10, 15, 20]
    const QUICK_SEARCH_DEFAULT_LIMIT = 10
    const QUICK_SEARCH_HISTORY_KEY = "dsh.web-search-insights.quick-search.history"
    const QUICK_SEARCH_HISTORY_MAX = 20

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
        "panel.fetched": "可能看过",
        "panel.fetchedSummary": "获取 {count} 个网页",
        "panel.fetchesTitle": "主动抓取数据的页面",
        "panel.httpSuccess": "请求成功（{code}）",
        "panel.httpFailure": "请求失败（{code}）",
        "panel.moreSources": "还有 {count} 个来源未展示。",
        "panel.openHint": "查看搜索结果",
        "entry.cited": "本轮引用 {count} 个网页",
        "entry.returned": "搜索返回 {count} 个网页",
        "entry.session": "会话累计 {count} 个网页",
        "entry.fetched": "主动抓取 {count} 个网页数据",
        "entry.open": "查看",
        "entry.tooltip": "其中本轮搜索来源 {local} 个网页",
        "config.title": "插件配置",
        "config.enabled": "启用插件",
        "config.enabledHint": "关闭后不再写入搜索日志，右侧栏也不再统计。",
        "config.file": "日志文件",
        "config.fileHint": "支持 ~；相对路径按宿主进程的当前目录解析。",
        "config.fileInvalid": "请填写非空路径。",
        "config.recordErrors": "记录失败调用",
        "config.recordErrorsHint": "搜索失败时也写一条带错误码的记录。",
        "config.tools": "观察工具",
        "config.toolsHint": "逗号分隔；只有返回 queries + sources/truncated 结构的工具才能正确记录，普通使用保持 web_search。",
        "config.toolsInvalid": "每个工具名都必须非空。",
        "config.save": "保存",
        "config.saving": "保存中…",
        "config.saveFailed": "宿主没有接受这些值，已保留供你修改。",
        "config.readOnly": "当前部署不允许修改配置。",
        "config.unavailable": "插件未加载或配置尚未就绪。",
        "config.reset": "恢复默认",
        "config.overridden": "已覆盖",
        "view.quickSearch": "快速搜索",
        "quick.title": "快速搜索",
        "quick.desc": "输入一个关键词，直接调用 DSH 的搜索能力；不会写入会话记录或统计。",
        "quick.placeholder": "输入一个关键词…",
        "quick.search": "搜索",
        "quick.searching": "搜索中…",
        "quick.cancel": "取消",
        "quick.limit": "结果数量",
        "quick.limitOption": "{count} 条",
        "quick.help": "关于快速搜索",
        "quick.history": "历史查询",
        "quick.clearHistory": "清空历史",
        "quick.empty": "输入关键词后按回车或点击「搜索」。",
        "quick.noResults": "没有找到结果。",
        "quick.truncated": "仅显示前 {count} 个结果。",
        "quick.historyEmpty": "还没有手动查询记录。",
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
        "panel.fetched": "may have read",
        "panel.fetchedSummary": "{count} pages fetched",
        "panel.fetchesTitle": "Fetched pages (latest data)",
        "panel.httpSuccess": "Request succeeded ({code})",
        "panel.httpFailure": "Request failed ({code})",
        "panel.moreSources": "{count} more sources not shown.",
        "panel.openHint": "View search sources",
        "entry.cited": "This turn cites {count} pages",
        "entry.returned": "Searches returned {count} pages",
        "entry.session": "Session: {count} pages",
        "entry.fetched": "actively fetched {count} pages of data",
        "entry.open": "View",
        "entry.tooltip": "{local} from this turn's searches",
        "config.title": "Plugin settings",
        "config.enabled": "Enable plugin",
        "config.enabledHint": "When off, no search records are written and the sidebar stops counting.",
        "config.file": "Log file",
        "config.fileHint": "Supports ~; a relative path resolves against the Host process cwd.",
        "config.fileInvalid": "Enter a non-empty path.",
        "config.recordErrors": "Record failed calls",
        "config.recordErrorsHint": "Write a record with the error code when a search fails.",
        "config.tools": "Observed tools",
        "config.toolsHint": "Comma separated; only tools returning queries + sources/truncated work. Keep web_search for normal use.",
        "config.toolsInvalid": "Every tool name must be non-empty.",
        "config.save": "Save",
        "config.saving": "Saving…",
        "config.saveFailed": "The deployment did not accept these values; they were left for you to correct.",
        "config.readOnly": "This deployment stores settings read-only.",
        "config.unavailable": "This plugin is not loaded, so it cannot be configured right now.",
        "config.reset": "Reset to default",
        "config.overridden": "Overridden",
        "view.quickSearch": "Quick search",
        "quick.title": "Quick search",
        "quick.desc": "Run one keyword through DSH's search provider directly; this does not enter the conversation log or statistics.",
        "quick.placeholder": "Enter one keyword…",
        "quick.search": "Search",
        "quick.searching": "Searching…",
        "quick.cancel": "Cancel",
        "quick.limit": "Results",
        "quick.limitOption": "{count} results",
        "quick.help": "About quick search",
        "quick.history": "Recent searches",
        "quick.clearHistory": "Clear history",
        "quick.empty": "Type a keyword, then press Enter or click Search.",
        "quick.noResults": "No results.",
        "quick.truncated": "Showing the first {count} results.",
        "quick.historyEmpty": "No manual searches yet.",
      },
    }

    const CSS = `
.wsl-entry{display:flex;align-items:center;gap:8px;box-sizing:border-box;width:100%;border:1px solid var(--dsw-alias-border-l2,#d9d9d9);background:var(--dsw-alias-bg-layer-2,transparent);color:var(--dsw-alias-label-primary,inherit);border-radius:8px;padding:5px 8px 5px 10px;font:inherit;font-size:12px;line-height:1.5;cursor:pointer;text-align:left}
.wsl-entry:hover{border-color:var(--dsw-alias-label-tertiary,#aaa);background:var(--dsw-alias-interactive-bg-hover,rgba(127,127,127,.08))}
.wsl-entry-icons{display:inline-flex;align-items:center;flex:none;padding-left:2px}
.wsl-entry-text{flex:1;min-width:0}
.wsl-icon{width:18px;height:18px;border-radius:50%;object-fit:cover;background:var(--dsw-alias-bg-layer-2,#f2f2f2);border:1px solid var(--dsw-alias-border-l1,#eee);display:inline-flex;align-items:center;justify-content:center;font-size:9px;font-weight:600;color:var(--dsw-alias-label-secondary,#666);flex:none;overflow:hidden}
.wsl-entry-icons .wsl-icon+.wsl-icon{margin-left:-4px}
.wsl-entry-action{flex:none;display:inline-flex;align-items:center;gap:3px;margin-left:4px;border:1px solid var(--dsw-static-deepseek-450,#5686fe);background:transparent;color:var(--dsw-static-deepseek-450,#5686fe);border-radius:999px;padding:2px 9px;font-size:11px;line-height:1.6;font-weight:600;transition:background-color .15s ease,color .15s ease}
.wsl-entry-action::after{content:"›";font-size:14px;line-height:1}
.wsl-entry:hover .wsl-entry-action{background:var(--dsw-static-deepseek-500,#4176e6);border-color:var(--dsw-static-deepseek-500,#4176e6);color:#fff}
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
.wsl-source{display:flex;align-items:center;gap:6px;min-width:0}
.wsl-source-title{color:var(--dsw-alias-brand-primary,#4a7dff);text-decoration:none;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;min-width:0;flex:1}
.wsl-source .wsl-icon{width:14px;height:14px;font-size:8px}
.wsl-source-status{display:inline-flex;align-items:center;justify-content:flex-end;gap:2px;flex:none;width:30px;margin-left:2px}
.wsl-status-icon,.wsl-status-slot{width:14px;height:14px;flex:none;display:inline-flex;align-items:center;justify-content:center}
.wsl-status-icon .wsl-stat-icon{width:14px;height:14px;opacity:1}
.wsl-status-cited{color:var(--dsw-static-deepseek-450,#5686fe)}
.wsl-status-at{font-size:12px;font-weight:700;line-height:1;font-family:var(--ds-font-family-code,ui-monospace,SFMono-Regular,Menlo,monospace)}
.wsl-status-fetched{color:var(--dsw-alias-state-warn-primary,#d98a00)}
.wsl-source-title:hover{text-decoration:underline}
.wsl-source-host{color:var(--dsw-alias-label-tertiary,#999);font-size:10px;flex:none;max-width:40%;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.wsl-fetches{display:flex;flex-direction:column;gap:4px;border-top:1px dashed var(--dsw-alias-border-l1,#eee);padding-top:7px}
.wsl-fetch{display:flex;align-items:baseline;gap:6px;min-width:0}
.wsl-fetch a{color:var(--dsw-alias-label-secondary,#666);text-decoration:none;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;min-width:0;flex:1}
.wsl-fetch a:hover{text-decoration:underline}
.wsl-fetch-status{display:inline-flex;align-items:center;gap:2px;flex:none;border-radius:999px;padding:0 5px;height:16px;font-size:10px;font-weight:600;line-height:1;color:#fff}
.wsl-fetch-ok{background:var(--dsw-alias-state-success-primary,#1f9d55)}
.wsl-fetch-err{background:var(--dsw-alias-state-error-primary,#d64545)}
.wsl-fetch-status svg{width:9px;height:9px;flex:none}
.wsl-empty{color:var(--dsw-alias-label-secondary,#666);padding:12px 4px;line-height:1.6}
.wsi-config{display:flex;flex-direction:column;gap:14px;width:100%;min-width:0}
.wsi-config-head{margin:0;font-size:14px;font-weight:600;line-height:22px}
.wsi-toggle-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px 20px}
.wsi-toggle-grid .wsi-field-toggle{border:.5px solid var(--dsw-alias-border-l2);border-radius:10px;padding:10px 12px}
@media (width<=720px){.wsi-toggle-grid{grid-template-columns:minmax(0,1fr)}}
.wsi-field{display:flex;flex-direction:column;gap:6px}
.wsi-toggle-row{display:flex;align-items:center;justify-content:space-between;gap:12px;min-width:0}
.wsi-toggle-actions{display:inline-flex;align-items:center;gap:10px;flex:none}
.wsi-field-head{display:flex;align-items:center;justify-content:space-between;gap:12px;min-width:0}
.wsi-label{color:var(--dsw-alias-label-primary);font-size:13px;line-height:20px}
.wsi-badges{display:inline-flex;align-items:center;gap:8px;color:var(--dsw-alias-label-tertiary);font-size:12px;line-height:18px;flex:none}
.wsi-reset{border:0;background:0 0;color:var(--dsw-alias-state-business-primary);font:inherit;font-size:12px;cursor:pointer;padding:0}
.wsi-reset:hover{text-decoration:underline}
.wsi-hint{margin:0;color:var(--dsw-alias-label-tertiary);font-size:12px;line-height:18px}
.wsi-invalid{margin:0;color:var(--dsw-alias-state-error-primary);font-size:12px;line-height:18px}
.wsq-page{box-sizing:border-box;width:min(100%, var(--dsh-chat-content-width, 920px));margin:0 auto;padding:20px 24px 40px;display:flex;flex-direction:column;gap:14px;color:var(--dsw-alias-label-primary);font-size:13px;line-height:1.5}
.wsq-head{display:flex;flex-direction:column;gap:4px}
.wsq-title-row{display:flex;align-items:center;gap:8px;flex-wrap:wrap}
.wsq-title{margin:0;font-size:18px;font-weight:600;line-height:26px}
.wsq-help{box-sizing:border-box;flex:none;width:20px;height:20px;border:.5px solid var(--dsw-alias-border-l3);border-radius:50%;background:transparent;color:var(--dsw-alias-label-tertiary);font:inherit;font-size:12px;line-height:1;padding:0;cursor:pointer;display:inline-flex;align-items:center;justify-content:center}
.wsq-help:hover,.wsq-help[data-active="true"]{border-color:var(--dsw-alias-state-business-primary);color:var(--dsw-alias-state-business-primary)}
.wsq-history-toggle{margin-left:auto;border:0;background:0 0;color:var(--dsw-alias-state-business-primary);font:inherit;font-size:12px;line-height:18px;padding:0;cursor:pointer}
.wsq-history-toggle:hover{text-decoration:underline}
.wsq-form{display:flex;align-items:center;gap:8px}
.wsq-input{box-sizing:border-box;flex:1;min-width:0;height:38px;border:.5px solid var(--dsw-alias-border-l4);border-radius:var(--dsw-radius-md);background:var(--dsw-alias-bg-layer-3);color:var(--dsw-alias-label-primary);font:inherit;font-size:14px;line-height:1.5;outline:none;padding:0 12px}
.wsq-input:focus-visible{border-color:var(--dsw-alias-state-business-primary)}
.wsq-submit{flex:none;height:38px;border-radius:var(--dsw-radius-md);border:1px solid transparent;background:var(--dsw-static-deepseek-450,#5686fe);color:#fff;font:inherit;font-size:13px;line-height:1.5;padding:0 18px;cursor:pointer}
.wsq-submit:hover:not(:disabled){background:var(--dsw-static-deepseek-500,#4176e6)}
.wsq-submit:disabled{opacity:.45;cursor:default}
.wsq-select{flex:none;height:38px;border:.5px solid var(--dsw-alias-border-l4);border-radius:var(--dsw-radius-md);background:var(--dsw-alias-bg-layer-3);color:var(--dsw-alias-label-primary);font:inherit;font-size:13px;line-height:1.5;padding:0 8px;cursor:pointer}
.wsq-select:disabled{opacity:.55;cursor:default}
.wsq-history{display:flex;flex-direction:column;gap:8px;border-top:.5px solid var(--dsw-alias-border-l2);padding-top:12px}
.wsq-history-head{display:flex;align-items:center;justify-content:space-between;gap:8px;color:var(--dsw-alias-label-tertiary);font-size:12px}
.wsq-history-clear{border:0;background:0 0;color:var(--dsw-alias-state-business-primary);font:inherit;font-size:12px;cursor:pointer;padding:0}
.wsq-history-clear:hover{text-decoration:underline}
.wsq-chips{display:flex;flex-wrap:wrap;gap:6px}
.wsq-chip{max-width:100%;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;border:.5px solid var(--dsw-alias-border-l1);border-radius:999px;background:transparent;color:var(--dsw-alias-label-secondary);font:inherit;font-size:12px;line-height:1.5;padding:2px 10px;cursor:pointer}
.wsq-chip:hover{border-color:var(--dsw-alias-border-l3);color:var(--dsw-alias-label-primary)}
.wsq-status{display:flex;align-items:center;gap:10px;color:var(--dsw-alias-label-tertiary);font-size:12px;line-height:18px;margin:0;min-height:20px}
.wsq-error{color:var(--dsw-alias-state-error-primary)}
.wsq-cancel{border:.5px solid var(--dsw-alias-border-l2);border-radius:999px;background:transparent;color:var(--dsw-alias-label-secondary);font:inherit;font-size:12px;line-height:1.5;padding:1px 10px;cursor:pointer}
.wsq-results{display:flex;flex-direction:column;gap:10px;margin:0;padding:0;list-style:none}
.wsq-result{display:flex;flex-direction:column;gap:4px;border:.5px solid var(--dsw-alias-border-l2);border-radius:10px;padding:10px 12px;background:var(--dsw-alias-bg-layer-1)}
.wsq-result-title{color:var(--dsw-alias-state-business-primary);text-decoration:none;font-size:13px;font-weight:600;line-height:20px;overflow-wrap:anywhere}
.wsq-result-title:hover{text-decoration:underline}
.wsq-result-url{color:var(--dsw-alias-label-tertiary);font-family:var(--ds-font-family-code,ui-monospace,SFMono-Regular,Menlo,monospace);font-size:11px;line-height:16px;overflow-wrap:anywhere}
.wsq-result-snippet{margin:0;color:var(--dsw-alias-label-secondary);font-size:12px;line-height:18px}
.wsq-result-date{color:var(--dsw-alias-label-tertiary);font-size:11px;line-height:16px}
`.trim()

    if (typeof document !== "undefined") {
      const tag = "dsh-web-search-insights/client.css"
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
        eye: [
          h("path", { key: 1, d: "M1.8 8s2.2-3.5 6.2-3.5S14.2 8 14.2 8s-2.2 3.5-6.2 3.5S1.8 8 1.8 8z" }),
          h("circle", { key: 2, cx: "8", cy: "8", r: "1.7" }),
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

    /**
     * Fixed-width status cells for one source row: cited and fetched are
     * independent icons, and empty cells keep every title column aligned.
     */
    function SourceStatus({ source, t, showStatus }) {
      if (!showStatus) return null
      const slot = (icon) => icon ?? h("span", { className: "wsl-status-slot" })
      return h(
        "span",
        { className: "wsl-source-status" },
        slot(
          source.cited
            ? h("span", { className: "wsl-status-icon wsl-status-cited wsl-status-at", title: t("panel.cited") }, "@")
            : null,
        ),
        slot(
          source.fetched
            ? h("span", { className: "wsl-status-icon wsl-status-fetched", title: t("panel.fetched") },
                h(StatIcon, { kind: "eye" }))
            : null,
        ),
      )
    }

    /** Compact fetch outcome: check/x icon plus the numeric HTTP status code. */
    function FetchStatus({ statusCode, t }) {
      const ok = statusCode >= 200 && statusCode < 400
      return h(
        "span",
        {
          className: `wsl-fetch-status ${ok ? "wsl-fetch-ok" : "wsl-fetch-err"}`,
          title: ok
            ? t("panel.httpSuccess", { code: statusCode })
            : t("panel.httpFailure", { code: statusCode }),
        },
        h(
          "svg",
          {
            viewBox: "0 0 12 12",
            fill: "none",
            stroke: "currentColor",
            strokeWidth: "1.8",
            strokeLinecap: "round",
            strokeLinejoin: "round",
            "aria-hidden": "true",
          },
          ok
            ? h("path", { d: "M2.5 6.2l2.2 2.2 4.8-5" })
            : h("path", { d: "M3 3l6 6M9 3L3 9" }),
        ),
        h("span", null, String(statusCode)),
      )
    }

    /** One turn's card: counters, keywords, sources, and fetched pages. */
    function TurnCard({ entry, turn, t }) {
      const sources = Array.isArray(entry.sources) ? entry.sources : []
      const showStatus = sources.some((source) => source.cited || source.fetched)
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
                  h(SourceStatus, { source, t, showStatus }),
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
                    ? h(FetchStatus, { statusCode: fetch.statusCode, t })
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

      const parts = [
        t("entry.cited", { count: entry.cited }),
        t("entry.session", { count: sessionCited }),
      ]
      if (entry.cited === 0 && entry.searchCalls > 0) {
        parts.push(t("entry.returned", { count: entry.returned }))
      }
      if (typeof entry.fetchCount === "number" && entry.fetchCount > 0) {
        parts.push(t("entry.fetched", { count: entry.fetchCount }))
      }
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
        h("span", { className: "wsl-entry-text" }, parts.join(" · ")),
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

    /** Lazily load the shared UI primitives (settings form controls). */
    let primitives
    function uiPrimitives() {
      if (primitives === undefined) primitives = require("@deepseek-ai/dsh-client-ui-primitives")
      return primitives
    }

    /** Text model for a boolean field; the Switch still renders the control. */
    function booleanSpec(field) {
      return {
        field,
        format: (value) => (value === true ? "true" : value === false ? "false" : ""),
        parse: (text) => {
          const next = String(text).trim().toLowerCase()
          if (next === "true") return { kind: "set", value: true }
          if (next === "false") return { kind: "set", value: false }
          return undefined
        },
      }
    }

    /** Comma-separated tool names; a blank value clears the override. */
    function toolsSpec() {
      return {
        field: "tools",
        format: (value) => (Array.isArray(value) ? value.join(", ") : ""),
        parse: (text) => {
          const items = String(text)
            .split(",")
            .map((item) => item.trim())
            .filter((item) => item !== "")
          return items.length === 0 ? { kind: "clear" } : { kind: "set", value: items }
        },
      }
    }

    /** Build the settings form model over this plugin row's config namespace. */
    function createConfigForm(configForms) {
      const ui = uiPrimitives()
      const scope = configForms.get(CONFIG_NS)
      const form = new ui.SettingsFormModel(scope, [
        ui.settingsTextField("file"),
        booleanSpec("enabled"),
        booleanSpec("recordErrors"),
        toolsSpec(),
      ])
      const state = form.bind(() => ({
        ...form.shell(),
        file: form.field("file"),
        enabled: form.field("enabled"),
        recordErrors: form.field("recordErrors"),
        tools: form.field("tools"),
      }))
      const actions = form.actions()
      return {
        inject: () => ({
          store: state,
          edit: actions.edit,
          resetField: actions.resetField,
          save: actions.save,
          discard: actions.discard,
        }),
        dispose: () => form.dispose(),
      }
    }

    /** One boolean setting rendered as a Switch over the text-model draft. */
    function ConfigToggle(props) {
      const { id, label, hint, field, disabled, onToggle, onReset, resetLabel, overriddenLabel } = props
      const checked = field.text === "true"
      return h(
        "div",
        { className: "wsi-field wsi-field-toggle" },
        h(
          "div",
          { className: "wsi-toggle-row" },
          h("label", { className: "wsi-label", htmlFor: id }, label),
          h(
            "span",
            { className: "wsi-toggle-actions" },
            field.overridden
              ? h(
                  "span",
                  { className: "wsi-badges" },
                  overriddenLabel,
                  h("button", { type: "button", className: "wsi-reset", onClick: onReset, disabled }, resetLabel),
                )
              : null,
            h(uiPrimitives().Switch, { checked, label, disabled, onChange: onToggle }),
          ),
        ),
        h("p", { className: "wsi-hint" }, hint),
      )
    }

    /** Safe localStorage read: private modes and tests may not expose it. */
    function readStoredText(key) {
      try {
        return typeof localStorage === "undefined" ? undefined : localStorage.getItem(key) ?? undefined
      } catch {
        return undefined
      }
    }

    /** Safe localStorage write. */
    function writeStoredText(key, value) {
      try {
        if (typeof localStorage !== "undefined") localStorage.setItem(key, value)
      } catch {
        /* storage may be unavailable */
      }
    }

    /** Every new session starts at the default limit; a session keeps its choice in memory. */
    function readQuickSearchLimit() {
      return QUICK_SEARCH_DEFAULT_LIMIT
    }

    /** Global manual-query history, newest first. */
    function readQuickSearchHistory() {
      const raw = readStoredText(QUICK_SEARCH_HISTORY_KEY)
      if (raw === undefined) return []
      try {
        const parsed = JSON.parse(raw)
        if (!Array.isArray(parsed)) return []
        return parsed
          .filter((item) => item && typeof item.query === "string" && item.query.trim() !== "")
          .slice(0, QUICK_SEARCH_HISTORY_MAX)
          .map((item) => ({
            query: item.query,
            at: typeof item.at === "number" ? item.at : 0,
            ...QUICK_SEARCH_LIMITS.includes(item.limit) ? { limit: item.limit } : {},
          }))
      } catch {
        return []
      }
    }

    /** Move one query to the front of the global history and persist it. */
    function rememberQuickSearch(query, limit) {
      const next = [
        { query, at: Date.now(), ...QUICK_SEARCH_LIMITS.includes(limit) ? { limit } : {} },
        ...readQuickSearchHistory().filter((item) => item.query !== query),
      ].slice(0, QUICK_SEARCH_HISTORY_MAX)
      writeStoredText(QUICK_SEARCH_HISTORY_KEY, JSON.stringify(next))
      return next
    }

    /** Clear the persisted history and return the empty list. */
    function clearQuickSearchHistory() {
      writeStoredText(QUICK_SEARCH_HISTORY_KEY, "[]")
      return []
    }

    /** Render one result row: linked title, URL, optional snippet, optional date. */
    function QuickSearchResult({ source, index, t }) {
      const title = typeof source.title === "string" && source.title !== "" ? source.title : hostOf(source.url)
      return h(
        "li",
        { className: "wsq-result", key: `${index}:${source.url}` },
        h(
          "a",
          {
            className: "wsq-result-title",
            href: source.url,
            target: "_blank",
            rel: "noreferrer",
            title: source.url,
          },
          title,
        ),
        h("div", { className: "wsq-result-url" }, source.url),
        typeof source.snippet === "string" && source.snippet !== ""
          ? h("p", { className: "wsq-result-snippet" }, source.snippet)
          : null,
        typeof source.publishedAt === "string" && source.publishedAt !== ""
          ? h("span", { className: "wsq-result-date" }, source.publishedAt)
          : null,
      )
    }

    /** Per-session view state survives tab switches without keeping React mounted. */
    const quickViewStates = new Map()
    const quickViewListeners = new Set()
    const quickViewAborts = new Map()

    function quickViewKey(sessionId) {
      return typeof sessionId === "string" && sessionId !== "" ? sessionId : "global"
    }

    function defaultQuickViewState() {
      return {
        query: "",
        limit: readQuickSearchLimit(),
        status: "idle",
        sources: [],
        truncated: false,
        message: "",
      }
    }

    function getQuickViewState(sessionId) {
      const key = quickViewKey(sessionId)
      let state = quickViewStates.get(key)
      if (state === undefined) {
        state = defaultQuickViewState()
        quickViewStates.set(key, state)
      }
      return state
    }

    function updateQuickViewState(sessionId, patch) {
      const key = quickViewKey(sessionId)
      quickViewStates.set(key, { ...getQuickViewState(sessionId), ...patch })
      for (const listener of quickViewListeners) listener()
    }

    function subscribeQuickViewState(listener) {
      quickViewListeners.add(listener)
      return () => quickViewListeners.delete(listener)
    }

    /** Conversation view: one keyword input, a result limit, and direct results. */
    function QuickSearchView({ sessionId, t }) {
      const state = React.useSyncExternalStore(subscribeQuickViewState, () => getQuickViewState(sessionId))
      const ui = uiPrimitives()
      const [history, setHistory] = React.useState(readQuickSearchHistory)
      const [showHistory, setShowHistory] = React.useState(false)
      const mounted = React.useRef(true)

      React.useEffect(
        () => () => {
          mounted.current = false
        },
        [],
      )

      const run = async (rawQuery, nextLimit) => {
        const nextQuery = String(rawQuery ?? "").trim()
        if (nextQuery === "") return
        const key = quickViewKey(sessionId)
        quickViewAborts.get(key)?.abort()
        const controller = new AbortController()
        quickViewAborts.set(key, controller)
        updateQuickViewState(sessionId, {
          query: nextQuery,
          limit: nextLimit,
          status: "loading",
          message: "",
        })
        try {
          const response = await fetch(QUICK_SEARCH_PATH, {
            method: "POST",
            headers: {
              "content-type": "application/json",
              [QUICK_SEARCH_HEADER]: "1",
            },
            body: JSON.stringify({ query: nextQuery, limit: nextLimit }),
            signal: controller.signal,
          })
          const payload = await response.json().catch(() => undefined)
          if (!response.ok) {
            throw new Error(payload?.error?.message ?? `HTTP ${response.status}`)
          }
          if (payload?.ok !== true) {
            throw new Error(payload?.error?.message ?? "search failed")
          }
          if (quickViewAborts.get(key) !== controller) return
          const value = payload.value ?? {}
          const sources = Array.isArray(value.sources) ? value.sources : []
          quickViewAborts.delete(key)
          updateQuickViewState(sessionId, {
            status: "ready",
            query: nextQuery,
            limit: nextLimit,
            sources,
            truncated: value.truncated === true,
            message: "",
          })
          const nextHistory = rememberQuickSearch(nextQuery, nextLimit)
          if (mounted.current) setHistory(nextHistory)
        } catch (error) {
          if (controller.signal.aborted) return
          if (quickViewAborts.get(key) === controller) quickViewAborts.delete(key)
          updateQuickViewState(sessionId, {
            status: "error",
            query: nextQuery,
            limit: nextLimit,
            message: error instanceof Error ? error.message : String(error),
          })
        }
      }

      const submit = (event) => {
        event.preventDefault()
        run(state.query, state.limit)
      }

      const cancel = () => {
        const key = quickViewKey(sessionId)
        quickViewAborts.get(key)?.abort()
        quickViewAborts.delete(key)
        updateQuickViewState(sessionId, { status: "idle", message: "" })
      }

      const changeLimit = (next) => {
        updateQuickViewState(sessionId, { limit: next })
        if (state.status === "ready" && state.query !== "") run(state.query, next)
      }

      const chooseHistory = (item) => {
        const nextLimit = QUICK_SEARCH_LIMITS.includes(item.limit) ? item.limit : state.limit
        updateQuickViewState(sessionId, { query: item.query })
        run(item.query, nextLimit)
      }

      return h(
        "div",
        { className: "wsq-page" },
        h(
          "div",
          { className: "wsq-head" },
          h(
            "div",
            { className: "wsq-title-row" },
            h("h2", { className: "wsq-title" }, t("quick.title")),
            h(
              ui.Tooltip,
              {
                label: t("quick.desc"),
                side: "bottom",
                maxWidth: 360,
                openOnClick: true,
              },
              h(
                "button",
                {
                  className: "wsq-help",
                  type: "button",
                  title: t("quick.help"),
                  "aria-label": t("quick.help"),
                },
                "?",
              ),
            ),
            history.length > 0
              ? h(
                  "button",
                  {
                    className: "wsq-history-toggle",
                    type: "button",
                    "aria-expanded": showHistory ? "true" : "false",
                    onClick: () => setShowHistory((value) => !value),
                  },
                  `${t("quick.history")} (${history.length})`,
                )
              : null,
          ),
        ),
        h(
          "form",
          { className: "wsq-form", onSubmit: submit },
          h("input", {
            className: "wsq-input",
            type: "search",
            value: state.query,
            placeholder: t("quick.placeholder"),
            "aria-label": t("quick.placeholder"),
            autoFocus: true,
            onChange: (event) => updateQuickViewState(sessionId, { query: event.target.value }),
          }),
          h(
            "select",
            {
              className: "wsq-select",
              value: String(state.limit),
              disabled: state.status === "loading",
              "aria-label": t("quick.limit"),
              onChange: (event) => changeLimit(Number(event.target.value)),
            },
            QUICK_SEARCH_LIMITS.map((value) =>
              h("option", { key: value, value: String(value) }, t("quick.limitOption", { count: value })),
            ),
          ),
          h(
            "button",
            {
              className: "wsq-submit",
              type: "submit",
              disabled: state.status === "loading" || state.query.trim() === "",
            },
            t("quick.search"),
          ),
        ),
        showHistory && history.length > 0
          ? h(
              "div",
              { className: "wsq-history" },
              h(
                "div",
                { className: "wsq-history-head" },
                h("span", null, t("quick.history")),
                h(
                  "button",
                  {
                    className: "wsq-history-clear",
                    type: "button",
                    onClick: () => setHistory(clearQuickSearchHistory()),
                  },
                  t("quick.clearHistory"),
                ),
              ),
              h(
                "div",
                { className: "wsq-chips" },
                history.map((item, index) =>
                  h(
                    "button",
                    {
                      className: "wsq-chip",
                      type: "button",
                      key: `${index}:${item.query}`,
                      title: item.query,
                      onClick: () => chooseHistory(item),
                    },
                    item.query,
                  ),
                ),
              ),
            )
          : null,
        state.status === "loading"
          ? h(
              "p",
              { className: "wsq-status" },
              t("quick.searching"),
              h("button", { className: "wsq-cancel", type: "button", onClick: cancel }, t("quick.cancel")),
            )
          : state.status === "error"
            ? h("p", { className: "wsq-status wsq-error" }, state.message)
            : state.status === "ready"
              ? state.sources.length === 0
                ? h("p", { className: "wsq-status" }, t("quick.noResults"))
                : h(
                    "div",
                    { className: "wsq-results-wrap" },
                    h(
                      "ul",
                      { className: "wsq-results" },
                      state.sources.map((source, index) =>
                        h(QuickSearchResult, { key: `${index}:${source.url}`, source, index, t }),
                      ),
                    ),
                    state.truncated
                      ? h(
                          "p",
                          { className: "wsq-status" },
                          t("quick.truncated", { count: state.sources.length }),
                        )
                      : null,
                  )
              : h(
                  "p",
                  { className: "wsq-status" },
                  history.length === 0 ? t("quick.empty") : t("quick.historyEmpty"),
                ),
      )
    }

    /** Bundle-level configuration card shown on the plugin page. */
    function ConfigCard(props) {
      const { t, store, edit, resetField, save, discard } = props
      const state = React.useSyncExternalStore(store.subscribe, store.getSnapshot)
      if (props.view === "summary") return null
      const ui = uiPrimitives()
      const labels = {
        save: t("config.save"),
        saving: t("config.saving"),
        saveFailed: t("config.saveFailed"),
        readOnly: t("config.readOnly"),
        unavailable: t("config.unavailable"),
      }
      const disabled = !state.writable || state.saving
      return h(
        "div",
        { className: "wsi-config" },
        h("h3", { className: "wsi-config-head" }, t("config.title")),
        h(
          ui.SettingsForm,
          { state, labels, onSave: save, onDiscard: discard },
          h(
            "div",
            { className: "wsi-toggle-grid" },
            h(ConfigToggle, {
              id: "wsi-enabled",
              label: t("config.enabled"),
              hint: t("config.enabledHint"),
              field: state.enabled,
              disabled,
              onToggle: (checked) => edit("enabled", checked ? "true" : "false"),
              onReset: () => resetField("enabled"),
              resetLabel: t("config.reset"),
              overriddenLabel: t("config.overridden"),
            }),
            h(ConfigToggle, {
              id: "wsi-record-errors",
              label: t("config.recordErrors"),
              hint: t("config.recordErrorsHint"),
              field: state.recordErrors,
              disabled,
              onToggle: (checked) => edit("recordErrors", checked ? "true" : "false"),
              onReset: () => resetField("recordErrors"),
              resetLabel: t("config.reset"),
              overriddenLabel: t("config.overridden"),
            }),
          ),
          h(ui.SettingsValueField, {
            id: "wsi-file",
            label: t("config.file"),
            hint: t("config.fileHint"),
            text: state.file.text,
            invalid: state.file.invalid,
            invalidLabel: t("config.fileInvalid"),
            overridden: state.file.overridden,
            overriddenLabel: t("config.overridden"),
            resetLabel: t("config.reset"),
            onReset: () => resetField("file"),
            disabled,
            onEdit: (text) => edit("file", text),
          }),
          h(ui.SettingsValueField, {
            id: "wsi-tools",
            label: t("config.tools"),
            hint: t("config.toolsHint"),
            text: state.tools.text,
            invalid: state.tools.invalid,
            invalidLabel: t("config.toolsInvalid"),
            overridden: state.tools.overridden,
            overriddenLabel: t("config.overridden"),
            resetLabel: t("config.reset"),
            onReset: () => resetField("tools"),
            disabled,
            onEdit: (text) => edit("tools", text),
          }),
        ),
      )
    }

    /** Client entry: one turn-tail row, one sidebar tab type, one pane body. */
    function apply(ctx) {
      ctx.effect(() => ctx.locale.register(NS, MESSAGES), "web-search-insights: dictionaries")
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
        "web-search-insights: sidebar type",
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

      ctx.slots.inject("conversation.view", () =>
        ctx.slots.register(
          {
            name: "conversation.view",
            id: "quick-search",
            order: 20,
            locale: NS,
            label: () => t("view.quickSearch"),
          },
          QuickSearchView,
        ),
      )

      // Bundle-level configuration page in the plugin manager. The form only
      // exists while the Host serves this row's settings namespace; optional
      // injection keeps compositions without the settings service untouched.
      ctx.inject(["configForms"], (configScope) => {
        configScope.effect(
          () =>
            configScope.configForms.whileServed([CONFIG_NS], () => {
              const form = createConfigForm(configScope.configForms)
              const disposeSlot = ctx.slots.inject("plugins.bundle.config", () =>
                ctx.slots.register(
                  {
                    name: "plugins.bundle.config",
                    key: PKG,
                    locale: NS,
                    inject: () => form.inject(),
                  },
                  ConfigCard,
                ),
              )
              return () => {
                disposeSlot()
                form.dispose()
              }
            }),
          "web-search-insights: config page",
        )
      })
    }

    exports.name = "dsh-web-search-insights"
    exports.inject = ["slots", "locale", "sidebarRight", "sidebarRightTabs"]
    exports.apply = apply
    return module.exports
  },
})
