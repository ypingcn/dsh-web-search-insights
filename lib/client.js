// dsh-web-search-insights — browser half.
//
// Hand-written client bundle in the official module-system format:
//   window.__ModuleLoader__.load({ id, factory })
// `id` must be the npm package name: the Host keys every client graph row by
// the resolved package name and rejects a bundle that registers anything else.
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
    /** npm package name; also the sidebar tab/slot id and the `plugins.bundle.config` key. */
    const PKG = "dsh-web-search-insights"
    const KIND = "web-search-insights"
    const PROJECTION_KEY = "webSearchInsights"
    /** Host settings namespace for this plugin row (its profile entry id). */
    const CONFIG_NS = "web-search-insights"
    /** Mirrors the Host's default log directory for unsaved snapshots. */
    const DEFAULT_LOG_DIRECTORY = "~/.dsh/logs"
    /** Same-origin Host route backing the quick-search view. */
    const QUICK_SEARCH_PATH = "/api/dsh-web-search-insights/quick-search"
    const QUICK_SEARCH_HEADER = "x-dsh-web-search-insights"
    const QUICK_SEARCH_LIMITS = [5, 10, 15, 20]
    const QUICK_SEARCH_DEFAULT_LIMIT = 10
    const QUICK_SEARCH_HISTORY_KEY = "dsh.web-search-insights.quick-search.history"
    const QUICK_SEARCH_HISTORY_MAX = 20
    /** Turns rendered per page in the sidebar's "session" mode. */
    const PANEL_TURNS_PAGE = 20
    /** Rows of keywords kept visible before the rest folds behind "+N". */
    const PANEL_QUERY_ROWS = 2

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
        "panel.fetchesTitle": "主动抓取数据的页面",
        "panel.httpSuccess": "请求成功（{code}）",
        "panel.httpFailure": "请求失败（{code}）",
        "panel.moreSources": "还有 {count} 个来源未展示。",
        "panel.moreQueries": "展开其余 {count} 个关键词",
        "panel.collapseQueries": "收起",
        "panel.loadMore": "加载更多（剩余 {count} 轮）",
        "panel.filterAll": "全部",
        "panel.filterCited": "已引用",
        "panel.filterUncited": "未引用",
        "panel.filterFetched": "已抓取",
        "panel.groupByDomain": "按域名分组",
        "panel.groupCount": "{count} 个 · 引用 {cited}",
        "panel.filteredOut": "已按筛选隐藏 {count} 个来源。",
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
        "config.directory": "日志目录",
        "config.directoryHint":
          "支持 ~；相对路径按宿主进程的当前目录解析。插件固定写入该目录下的 web-search.jsonl。",
        "config.directoryInvalid": "请填写非空路径。",
        "config.recordErrors": "记录失败调用",
        "config.recordErrorsHint": "搜索失败时也写一条带错误码的记录。",
        "config.quickSearchView": "快捷搜索页面",
        "config.quickSearchViewHint": "控制会话顶部的「快速搜索」视图。",
        "config.maxSizeMb": "日志大小上限（MB）",
        "config.maxSizeMbHint": "活动日志超过该大小时轮转，0 表示不轮转。",
        "config.maxFiles": "保留轮转份数",
        "config.maxFilesHint": "轮转后最多保留几个历史文件，0 表示不限制。",
        "config.retentionDays": "保留天数",
        "config.retentionDaysHint": "超过该天数的轮转文件会被清理，0 表示不按时间清理。",
        "config.numberInvalid": "请填写非负整数。",
        "config.save": "保存",
        "config.saving": "保存中…",
        "config.saveFailed": "宿主没有接受这些值，已保留供你修改。",
        "config.readOnly": "当前部署不允许修改配置。",
        "config.unavailable": "插件未加载或配置尚未就绪。",
        "config.reset": "恢复默认",
        "config.resetAll": "重置全部",
        "config.resetAllHint": "将所有配置恢复默认并立即保存。",
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
        "panel.notCited": "not cited",
        "panel.fetched": "may have read",
        "panel.fetchedSummary": "{count} pages fetched",
        "panel.fetchesTitle": "Fetched pages (latest data)",
        "panel.httpSuccess": "Request succeeded ({code})",
        "panel.httpFailure": "Request failed ({code})",
        "panel.moreSources": "{count} more sources not shown.",
        "panel.moreQueries": "Show {count} more keywords",
        "panel.collapseQueries": "Show less",
        "panel.loadMore": "Show more ({count} turns left)",
        "panel.filterAll": "All",
        "panel.filterCited": "Cited",
        "panel.filterUncited": "Uncited",
        "panel.filterFetched": "Fetched",
        "panel.groupByDomain": "By domain",
        "panel.groupCount": "{count} · {cited} cited",
        "panel.filteredOut": "{count} sources hidden by the filter.",
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
        "config.directory": "Log directory",
        "config.directoryHint":
          "Supports ~; a relative path resolves against the Host process cwd. The plugin always writes web-search.jsonl inside it.",
        "config.directoryInvalid": "Enter a non-empty path.",
        "config.recordErrors": "Record failed calls",
        "config.recordErrorsHint": "Write a record with the error code when a search fails.",
        "config.quickSearchView": "Quick search view",
        "config.quickSearchViewHint": "Show the Quick search view in the conversation header.",
        "config.maxSizeMb": "Max log size (MB)",
        "config.maxSizeMbHint": "Rotate the active log once it exceeds this size; 0 disables rotation.",
        "config.maxFiles": "Rotated files to keep",
        "config.maxFilesHint": "How many rotated files to keep; 0 keeps all of them.",
        "config.retentionDays": "Retention (days)",
        "config.retentionDaysHint": "Delete rotated files older than this many days; 0 disables age cleanup.",
        "config.numberInvalid": "Enter a non-negative integer.",
        "config.save": "Save",
        "config.saving": "Saving…",
        "config.saveFailed": "The deployment did not accept these values; they were left for you to correct.",
        "config.readOnly": "This deployment stores settings read-only.",
        "config.unavailable": "This plugin is not loaded, so it cannot be configured right now.",
        "config.reset": "Reset to default",
        "config.resetAll": "Reset all",
        "config.resetAllHint": "Restore every setting to its default and save immediately.",
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
.wsl-panel{container-type:inline-size;display:flex;flex-direction:column;gap:10px;padding:12px;height:100%;min-height:0;overflow:auto;font-size:12px;color:var(--dsw-alias-label-primary,inherit)}
.wsl-head{display:flex;align-items:flex-start;justify-content:space-between;gap:10px}
.wsl-title{font-size:14px;font-weight:600;line-height:1.4;margin:0;flex:none}
.wsl-stats{display:inline-flex;align-items:center;gap:8px;flex-wrap:wrap;color:var(--dsw-alias-label-secondary,#666);line-height:1.5;font-size:11px}
.wsl-head .wsl-stats{justify-content:flex-end;flex:1;min-width:0}
.wsl-stat{display:inline-flex;align-items:center;gap:3px;white-space:nowrap}
.wsl-stat-icon{width:13px;height:13px;flex:none;opacity:.85}
.wsl-stat-count{font-variant-numeric:tabular-nums}
.wsl-toolbar{display:flex;flex-wrap:wrap;align-items:center;gap:5px 10px;min-width:0;border-bottom:1px solid var(--dsw-alias-border-l1,#eee);padding-bottom:8px}
.wsl-seg{display:inline-flex;flex:none;flex-wrap:nowrap;gap:0;align-items:center;padding:2px;border-radius:999px;background:var(--dsw-alias-interactive-bg-hover,rgba(127,127,127,.08))}
.wsl-group{display:flex;flex-direction:column;gap:4px}
.wsl-group-head{display:flex;align-items:center;gap:6px;font-size:11px;font-weight:600;color:var(--dsw-alias-label-secondary,#666)}
.wsl-group-head .wsl-muted{margin-left:auto;font-weight:400}
.wsl-group-sources{display:flex;flex-direction:column;gap:5px;padding-left:2px}
.wsl-seg button{border:0;background:transparent;color:var(--dsw-alias-label-secondary,#666);border-radius:999px;padding:3px 5px;font:inherit;font-size:11px;line-height:1.45;cursor:pointer;white-space:nowrap;transition:color .12s ease,background-color .12s ease}
.wsl-seg button:hover{color:var(--dsw-alias-label-primary,#111);background:var(--dsw-alias-interactive-bg-active,rgba(127,127,127,.14))}
.wsl-seg button[data-active="true"]{color:var(--dsw-alias-label-primary,inherit);background:var(--dsw-alias-bg-layer-1,#fff);box-shadow:0 1px 2px rgba(0,0,0,.12)}
.wsl-icon-toggle{display:inline-flex;align-items:center;justify-content:center;flex:none;border:1px solid transparent;background:transparent;color:var(--dsw-alias-label-secondary,#666);border-radius:8px;padding:4px 5px;cursor:pointer;transition:color .12s ease,background-color .12s ease,border-color .12s ease}
.wsl-icon-toggle:hover{color:var(--dsw-alias-label-primary,#111);background:var(--dsw-alias-interactive-bg-hover,rgba(127,127,127,.08))}
.wsl-icon-toggle[data-active="true"]{color:var(--dsw-alias-brand-primary,#4a7dff);background:var(--dsw-alias-interactive-bg-active,rgba(127,127,127,.14))}
.wsl-icon-toggle .wsl-stat-icon{width:14px;height:14px}
@container (min-width:304px){.wsl-seg button{padding:3px 6px}}
@container (min-width:316px){.wsl-seg button{padding:3px 7px}}
@container (min-width:328px){.wsl-seg button{padding:3px 8px}}
@container (min-width:352px){.wsl-seg button{padding:4px 10px}}
.wsl-card{border:1px solid var(--dsw-alias-border-l2,#d9d9d9);border-radius:10px;padding:10px;display:flex;flex-direction:column;gap:8px;background:var(--dsw-alias-bg-layer-1,transparent)}
.wsl-card-head{display:flex;align-items:center;gap:8px;flex-wrap:wrap}
.wsl-card-title{font-weight:600}
.wsl-card-head .wsl-stats{margin-left:auto}
.wsl-muted{color:var(--dsw-alias-label-secondary,#666);font-size:11px;line-height:1.5}
.wsl-queries{display:flex;flex-wrap:wrap;gap:5px}
.wsl-queries-block{position:relative;display:flex;flex-direction:column;gap:4px;min-width:0}
.wsl-queries-measure{position:absolute;top:0;left:0;right:0;visibility:hidden;pointer-events:none}
.wsl-queries-probe{position:absolute;top:0;left:0;right:auto;bottom:auto;display:inline-block;visibility:hidden;pointer-events:none}
.wsl-chip{border:1px solid var(--dsw-alias-border-l1,#eee);border-radius:999px;padding:1px 8px;color:var(--dsw-alias-label-secondary,#666);font-size:11px;line-height:1.6;max-width:100%;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.wsl-queries-toggle{flex:none;border:1px dashed var(--dsw-alias-border-l2,#d9d9d9);border-radius:999px;background:transparent;color:var(--dsw-alias-label-secondary,#666);font:inherit;font-size:11px;line-height:1.6;padding:1px 8px;cursor:pointer;white-space:nowrap}
.wsl-queries-toggle:hover{border-color:var(--dsw-alias-label-tertiary,#aaa);background:var(--dsw-alias-interactive-bg-hover,rgba(127,127,127,.08));color:var(--dsw-alias-label-primary,#111)}
.wsl-queries-toggle:focus-visible{outline:var(--dsw-focus-ring-width) solid var(--dsw-focus-ring-color,var(--dsw-alias-state-business-primary));outline-offset:1px}
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
.wsl-more{align-self:stretch;border:1px dashed var(--dsw-alias-border-l2,#d9d9d9);background:transparent;color:var(--dsw-alias-label-secondary,#666);border-radius:8px;padding:6px 10px;font:inherit;font-size:11px;line-height:1.5;cursor:pointer}
.wsl-more:hover{border-color:var(--dsw-alias-label-tertiary,#aaa);background:var(--dsw-alias-interactive-bg-hover,rgba(127,127,127,.08))}
.wsi-config{display:flex;flex-direction:column;gap:14px;width:100%;min-width:0}
.wsi-config-head{margin:0;font-size:14px;font-weight:600;line-height:22px}
.wsi-toggle-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px 20px}
.wsi-toggle-grid .wsi-field-toggle{border:.5px solid var(--dsw-alias-border-l2);border-radius:10px;padding:10px 12px}
.wsi-limit-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:0 20px;border-top:.5px solid var(--dsw-alias-border-l2)}
.wsi-limit-grid>*+*{border-top:0!important}
@media (width<=720px){.wsi-toggle-grid,.wsi-limit-grid{grid-template-columns:minmax(0,1fr)}}
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
.wsi-form{display:flex;flex-direction:column}
.wsi-readonly,.wsi-unavailable{margin:0 0 12px;font-size:12px;line-height:1.5;color:var(--dsw-alias-label-tertiary)}
.wsi-footer{display:flex;align-items:center;gap:8px;padding-top:16px}
.wsi-failed{flex:1;min-width:0;margin:0;font-size:12px;line-height:1.5;color:var(--dsw-alias-state-error-primary)}
.wsi-foot-actions{display:flex;align-items:center;gap:8px;margin-left:auto}
.wsi-save{appearance:none;border:1px solid transparent;border-radius:var(--dsw-radius-md);padding:5px 14px;font:inherit;font-size:13px;line-height:1.5;cursor:pointer;background:var(--dsw-alias-label-primary);color:var(--dsw-alias-bg-layer-3)}
.wsi-save:disabled{opacity:.4;cursor:default}
.wsi-save:focus-visible,.wsi-reset-all:focus-visible{outline:var(--dsw-focus-ring-width) solid var(--dsw-focus-ring-color,var(--dsw-alias-state-business-primary));outline-offset:1px}
.wsi-reset-all{appearance:none;border:.5px solid var(--dsw-alias-border-l2);border-radius:var(--dsw-radius-md);padding:5px 14px;font:inherit;font-size:13px;line-height:1.5;cursor:pointer;background:transparent;color:var(--dsw-alias-label-secondary)}
.wsi-reset-all:hover:not(:disabled){border-color:var(--dsw-alias-border-l3);color:var(--dsw-alias-label-primary);background:var(--dsw-alias-interactive-bg-hover,rgba(127,127,127,.08))}
.wsi-reset-all:disabled{opacity:.4;cursor:default}
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
        grid: [
          h("rect", { key: 1, x: "3", y: "3", width: "4", height: "4", rx: "1" }),
          h("rect", { key: 2, x: "9", y: "3", width: "4", height: "4", rx: "1" }),
          h("rect", { key: 3, x: "3", y: "9", width: "4", height: "4", rx: "1" }),
          h("rect", { key: 4, x: "9", y: "9", width: "4", height: "4", rx: "1" }),
        ],
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

    /** Source filters offered above the panel body. */
    const SOURCE_FILTERS = ["all", "cited", "uncited", "fetched"]

    /** Locale key for one filter kind (`all` → `panel.filterAll`). */
    function filterLabelKey(kind) {
      return `panel.filter${kind[0].toUpperCase()}${kind.slice(1)}`
    }

    /** Apply one source filter without reordering the list. */
    function filterSources(sources, filter) {
      if (filter === "cited") return sources.filter((source) => source.cited === true)
      if (filter === "uncited") return sources.filter((source) => source.cited !== true)
      if (filter === "fetched") return sources.filter((source) => source.fetched === true)
      return sources
    }

    /** Group sources by host, preserving first-appearance order. */
    function groupSourcesByHost(sources) {
      const groups = new Map()
      for (const source of sources) {
        const host = hostOf(source.url)
        if (!groups.has(host)) groups.set(host, [])
        groups.get(host).push(source)
      }
      return [...groups.entries()]
    }

    /** One source row, shared by the flat and grouped renderings. */
    function SourceRow({ source, t, showStatus }) {
      return h(
        "div",
        { className: "wsl-source" },
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
      )
    }

    /** Prefer the paint-blocking effect so unfolded chips never flash. */
    const useMeasureEffect = React.useLayoutEffect ?? React.useEffect

    /**
     * Fit the keyword chips and the "+N" pill into the first two rows.
     * Returns how many chips to keep before folding the rest, or
     * `overflow: false` when every chip already fits in two rows.
     */
    function queryLayoutOf(list, probe) {
      const chips = Array.from(list.querySelectorAll("[data-query-chip]"))
      if (chips.length === 0) return { overflow: false, visible: 0, hidden: 0 }
      const rows = []
      for (let index = 0; index < chips.length; index += 1) {
        const top = chips[index].offsetTop
        if (rows.length === 0 || top > rows[rows.length - 1].top) rows.push({ top, start: index })
      }
      if (rows.length <= PANEL_QUERY_ROWS) return { overflow: false, visible: chips.length, hidden: 0 }

      const listRect = list.getBoundingClientRect()
      const gap = Number.parseFloat(getComputedStyle(list).columnGap) || 5
      const pillWidth = probe === null ? 0 : probe.getBoundingClientRect().width
      const lastRowStart = rows[PANEL_QUERY_ROWS - 1].start
      let visible = rows[PANEL_QUERY_ROWS].start
      // Drop trailing last-row chips until the pill fits on that row;
      // stopping at lastRowStart lets the pill start the last row instead.
      while (visible > lastRowStart) {
        const lastRect = chips[visible - 1].getBoundingClientRect()
        if (listRect.right - lastRect.right >= pillWidth + gap + 4) break
        visible -= 1
      }
      return { overflow: true, visible, hidden: chips.length - visible }
    }

    /** One turn's card: counters, keywords, sources, and fetched pages. */
    function TurnCard({ entry, turn, t, filter = "all", groupMode = "flat" }) {
      const queries = Array.isArray(entry.queries) ? entry.queries : []
      const queryKey = queries.join("\u0000")
      const measureList = React.useRef(null)
      const measureProbe = React.useRef(null)
      const [measureState, setMeasureState] = React.useState("idle")
      const [queriesExpanded, setQueriesExpanded] = React.useState(false)
      const [queryLayout, setQueryLayout] = React.useState("unmeasured")
      // Mount the hidden measuring list first; tests and non-DOM renders keep
      // seeing only the real list.
      useMeasureEffect(() => {
        setMeasureState("ready")
      }, [])
      useMeasureEffect(() => {
        const list = measureList.current
        if (measureState !== "ready" || list === null || typeof ResizeObserver === "undefined") return undefined
        const measure = () => {
          const next = queryLayoutOf(list, measureProbe.current)
          setQueryLayout((previous) =>
            previous !== "unmeasured" &&
            previous.overflow === next.overflow &&
            previous.visible === next.visible &&
            previous.hidden === next.hidden
              ? previous
              : next,
          )
        }
        measure()
        const observer = new ResizeObserver(measure)
        observer.observe(list)
        return () => observer.disconnect()
      }, [measureState, queryKey])
      const canMeasure = measureState === "ready"
      const layout = queryLayout === "unmeasured" ? null : queryLayout
      const folded = layout !== null && layout.overflow
      const shownQueries = folded && !queriesExpanded ? queries.slice(0, layout.visible) : queries
      const allSources = Array.isArray(entry.sources) ? entry.sources : []
      const sources = filterSources(allSources, filter)
      const filteredOut = allSources.length - sources.length
      const showStatus = sources.some((source) => source.cited || source.fetched)
      const shown = allSources.length
      const hidden = typeof entry.sourceCount === 'number' ? Math.max(0, entry.sourceCount - shown) : 0
      const sourceList =
        groupMode === "domain"
          ? h(
              "div",
              { className: "wsl-sources" },
              groupSourcesByHost(sources).map(([host, items]) =>
                h(
                  "div",
                  { className: "wsl-group", key: host },
                  h(
                    "div",
                    { className: "wsl-group-head" },
                    h("span", null, host),
                    h(
                      "span",
                      { className: "wsl-muted" },
                      t("panel.groupCount", {
                        count: items.length,
                        cited: items.filter((source) => source.cited === true).length,
                      }),
                    ),
                  ),
                  h(
                    "div",
                    { className: "wsl-group-sources" },
                    items.map((source, index) =>
                      h(SourceRow, {
                        key: `${index}:${source.url}`,
                        source,
                        t,
                        showStatus,
                      }),
                    ),
                  ),
                ),
              ),
            )
          : h(
              "div",
              { className: "wsl-sources" },
              sources.map((source, index) =>
                h(SourceRow, { key: `${index}:${source.url}`, source, t, showStatus }),
              ),
            )
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
        queries.length > 0
          ? h(
              "div",
              { className: "wsl-queries-block" },
              canMeasure
                ? h(
                    "div",
                    {
                      ref: measureList,
                      className: "wsl-queries wsl-queries-measure",
                      "aria-hidden": "true",
                    },
                    queries.map((query, index) =>
                      h(
                        "span",
                        {
                          className: "wsl-chip",
                          key: `measure:${index}:${query}`,
                          title: query,
                          "data-query-chip": "true",
                        },
                        query,
                      ),
                    ),
                    h(
                      "span",
                      {
                        ref: measureProbe,
                        className: "wsl-queries-toggle wsl-queries-probe",
                        "aria-hidden": "true",
                      },
                      `+${queries.length}`,
                    ),
                  )
                : null,
              h(
                "div",
                { className: "wsl-queries" },
                shownQueries.map((query, index) =>
                  h("span", { className: "wsl-chip", key: `${index}:${query}`, title: query }, query),
                ),
                folded && !queriesExpanded
                  ? h(
                      "button",
                      {
                        type: "button",
                        className: "wsl-queries-toggle",
                        "aria-expanded": "false",
                        title: t("panel.moreQueries", { count: layout.hidden }),
                        "aria-label": t("panel.moreQueries", { count: layout.hidden }),
                        onClick: () => setQueriesExpanded(true),
                      },
                      `+${layout.hidden}`,
                    )
                  : null,
                folded && queriesExpanded
                  ? h(
                      "button",
                      {
                        type: "button",
                        className: "wsl-queries-toggle",
                        "aria-expanded": "true",
                        onClick: () => setQueriesExpanded(false),
                      },
                      t("panel.collapseQueries"),
                    )
                  : null,
              ),
            )
          : null,
        sources.length > 0 ? sourceList : null,
        filteredOut > 0
          ? h("div", { className: "wsl-muted" }, t("panel.filteredOut", { count: filteredOut }))
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
      const [visibleTurns, setVisibleTurns] = React.useState(PANEL_TURNS_PAGE)
      const [sourceFilter, setSourceFilter] = React.useState("all")
      const [groupMode, setGroupMode] = React.useState("flat")

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
          { className: "wsl-toolbar" },
          h(
            "div",
            { className: "wsl-seg wsl-scope" },
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
          h(
            "div",
            { className: "wsl-seg wsl-filter" },
            SOURCE_FILTERS.map((kind) =>
              h(
                "button",
                {
                  key: kind,
                  type: "button",
                  "data-active": sourceFilter === kind ? "true" : "false",
                  "aria-pressed": sourceFilter === kind ? "true" : "false",
                  onClick: () => setSourceFilter(kind),
                },
                t(filterLabelKey(kind)),
              ),
            ),
          ),
          h(
            "button",
            {
              type: "button",
              className: "wsl-icon-toggle",
              "data-active": groupMode === "domain" ? "true" : "false",
              "aria-pressed": groupMode === "domain" ? "true" : "false",
              title: t("panel.groupByDomain"),
              "aria-label": t("panel.groupByDomain"),
              onClick: () => setGroupMode((value) => (value === "domain" ? "flat" : "domain")),
            },
            h(StatIcon, { kind: "grid" }),
          ),
        ),
        turnKeys.length === 0
          ? h("div", { className: "wsl-empty" }, t("panel.noData"))
          : mode === "turn"
            ? activeEntry === undefined
              ? h("div", { className: "wsl-empty" }, t("panel.noTurn"))
              : h(TurnCard, {
                  key: String(activeTurn),
                  entry: activeEntry,
                  turn: activeTurn,
                  t,
                  filter: sourceFilter,
                  groupMode,
                })
            : h(
                React.Fragment,
                null,
                turnKeys
                  .slice(0, visibleTurns)
                  .map((key) =>
                    h(TurnCard, {
                      key,
                      entry: stats.turns[key],
                      turn: Number(key),
                      t,
                      filter: sourceFilter,
                      groupMode,
                    }),
                  ),
                turnKeys.length > visibleTurns
                  ? h(
                      "button",
                      {
                        type: "button",
                        className: "wsl-more",
                        onClick: () => setVisibleTurns((count) => count + PANEL_TURNS_PAGE),
                      },
                      t("panel.loadMore", { count: turnKeys.length - visibleTurns }),
                    )
                  : null,
              ),
      )
    }

    /** Lazily load the shared UI primitives (settings form controls). */
    let primitives
    function uiPrimitives() {
      if (primitives === undefined) primitives = require("@deepseek-ai/dsh-client-ui-primitives")
      return primitives
    }

    /**
     * Number model that shows the schema default when the Host serves no
     * resolved section. Without it a linked plugin (or a Host that has not
     * reloaded the new schema yet) renders an empty input even though the
     * plugin actually runs with the default.
     */
    function numberSpec(field, fallback, integer = false) {
      return {
        field,
        format: (value) =>
          typeof value === "number" && Number.isFinite(value) ? String(value) : String(fallback),
        parse: (text) => {
          const next = String(text).trim()
          if (next === "") return { kind: "clear" }
          const parsed = Number(next)
          if (!Number.isFinite(parsed) || parsed < 0) return undefined
          if (integer && !Number.isInteger(parsed)) return undefined
          return { kind: "set", value: parsed }
        },
      }
    }

    /**
     * Text model for a boolean field; the Switch still renders the control.
     * `fallback` mirrors the schema default when a deployment serves no
     * resolved section (so the switch agrees with the actual runtime default).
     */
    function booleanSpec(field, fallback = false) {
      return {
        field,
        format: (value) =>
          value === true ? "true" : value === false ? "false" : fallback ? "true" : "",
        parse: (text) => {
          const next = String(text).trim().toLowerCase()
          if (next === "true") return { kind: "set", value: true }
          if (next === "false") return { kind: "set", value: false }
          return undefined
        },
      }
    }

    /**
     * Text model for the log directory. Shows the schema default when the Host
     * serves no resolved section, matching the runtime path the Host derives.
     */
    function directorySpec() {
      return {
        field: "directory",
        format: (value) =>
          typeof value === "string" && value.trim() !== "" ? value : DEFAULT_LOG_DIRECTORY,
        parse: (text) => {
          const next = String(text).trim()
          return next === "" ? { kind: "clear" } : { kind: "set", value: next }
        },
      }
    }

    /**
     * Every field reset by the global action, in order. `file` is the deprecated
     * legacy path: it is not rendered, but resetting it prevents an old override
     * from resurfacing after the directory override is cleared.
     */
    const CONFIG_FIELDS = [
      "enabled",
      "recordErrors",
      "quickSearchView",
      "directory",
      "file",
      "maxSizeMb",
      "maxFiles",
      "retentionDays",
    ]

    /** Build the settings form model over this plugin row's config namespace. */
    function createConfigForm(configForms) {
      const ui = uiPrimitives()
      const scope = configForms.get(CONFIG_NS)
      const form = new ui.SettingsFormModel(scope, [
        directorySpec(),
        ui.settingsTextField("file"),
        booleanSpec("enabled"),
        booleanSpec("recordErrors"),
        booleanSpec("quickSearchView", true),
        numberSpec("maxSizeMb", 10),
        numberSpec("maxFiles", 5, true),
        numberSpec("retentionDays", 0, true),
      ])
      const state = form.bind(() => ({
        ...form.shell(),
        directory: form.field("directory"),
        file: form.field("file"),
        enabled: form.field("enabled"),
        recordErrors: form.field("recordErrors"),
        quickSearchView: form.field("quickSearchView"),
        maxSizeMb: form.field("maxSizeMb"),
        maxFiles: form.field("maxFiles"),
        retentionDays: form.field("retentionDays"),
      }))
      const actions = form.actions()
      /**
       * One-click reset: stage every field back to its schema default and
       * persist in the same action, so the user does not have to press Save
       * afterwards.
       */
      const resetAll = () => {
        for (const field of CONFIG_FIELDS) actions.resetField(field)
        actions.save()
      }
      return {
        inject: () => ({
          store: state,
          edit: actions.edit,
          resetField: actions.resetField,
          resetAll,
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

    /**
     * SettingsForm-compatible shell. The shared primitive only renders Save in
     * its footer, so the plugin owns the footer here to place the reset-all
     * action directly to the right of Save. Unmounting still discards staged
     * edits, matching the primitive's behaviour.
     */
    function ConfigFormShell(props) {
      const { state, labels, onSave, onDiscard, onResetAll, resetDisabled, children } = props
      const discard = React.useRef(onDiscard)
      discard.current = onDiscard
      React.useEffect(
        () => () => {
          discard.current()
        },
        [],
      )
      if (!state.available) {
        return h("p", { className: "wsi-unavailable", role: "status" }, labels.unavailable)
      }
      const saveDisabled = !state.dirty || state.invalid || state.saving
      return h(
        "div",
        { className: "wsi-form" },
        state.writable ? null : h("p", { className: "wsi-readonly", role: "status" }, labels.readOnly),
        children,
        h(
          "div",
          { className: "wsi-footer" },
          state.failed ? h("p", { className: "wsi-failed", role: "status" }, labels.saveFailed) : null,
          h(
            "div",
            { className: "wsi-foot-actions" },
            h(
              "button",
              { type: "button", className: "wsi-save", disabled: saveDisabled, onClick: onSave },
              state.saving ? labels.saving : labels.save,
            ),
            h(
              "button",
              {
                type: "button",
                className: "wsi-reset-all",
                title: labels.resetAllHint,
                disabled: resetDisabled,
                onClick: onResetAll,
              },
              labels.resetAll,
            ),
          ),
        ),
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

      // Reset on setup as well as teardown: StrictMode runs setup → cleanup →
      // setup on the same instance, so a cleanup-only flag would stay false and
      // silently stop history updates after the first search.
      React.useEffect(() => {
        mounted.current = true
        return () => {
          mounted.current = false
        }
      }, [])

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
      const { t, store, edit, resetField, resetAll, save, discard } = props
      const state = React.useSyncExternalStore(store.subscribe, store.getSnapshot)
      if (props.view === "summary") return null
      const ui = uiPrimitives()
      const labels = {
        save: t("config.save"),
        saving: t("config.saving"),
        saveFailed: t("config.saveFailed"),
        readOnly: t("config.readOnly"),
        unavailable: t("config.unavailable"),
        resetAll: t("config.resetAll"),
        resetAllHint: t("config.resetAllHint"),
      }
      const disabled = !state.writable || state.saving
      // Enabled when anything is overridden or edited; resetting everything
      // without overrides would be a no-op save.
      const hasOverrides = CONFIG_FIELDS.some((field) => state[field]?.overridden === true)
      const resetDisabled = disabled || (!state.dirty && !hasOverrides)
      return h(
        "div",
        { className: "wsi-config" },
        h("h3", { className: "wsi-config-head" }, t("config.title")),
        h(
          ConfigFormShell,
          { state, labels, onSave: save, onDiscard: discard, onResetAll: resetAll, resetDisabled },
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
            h(ConfigToggle, {
              id: "wsi-quick-search-view",
              label: t("config.quickSearchView"),
              hint: t("config.quickSearchViewHint"),
              field: state.quickSearchView,
              disabled,
              onToggle: (checked) => edit("quickSearchView", checked ? "true" : "false"),
              onReset: () => resetField("quickSearchView"),
              resetLabel: t("config.reset"),
              overriddenLabel: t("config.overridden"),
            }),
          ),
          h(ui.SettingsValueField, {
            id: "wsi-directory",
            label: t("config.directory"),
            hint: t("config.directoryHint"),
            text: state.directory.text,
            invalid: state.directory.invalid,
            invalidLabel: t("config.directoryInvalid"),
            overridden: state.directory.overridden,
            overriddenLabel: t("config.overridden"),
            resetLabel: t("config.reset"),
            onReset: () => resetField("directory"),
            disabled,
            onEdit: (text) => edit("directory", text),
          }),
          h(
            "div",
            { className: "wsi-limit-grid" },
            h(ui.SettingsValueField, {
              id: "wsi-max-size-mb",
              label: t("config.maxSizeMb"),
              hint: t("config.maxSizeMbHint"),
              text: state.maxSizeMb.text,
              invalid: state.maxSizeMb.invalid,
              invalidLabel: t("config.numberInvalid"),
              overridden: state.maxSizeMb.overridden,
              overriddenLabel: t("config.overridden"),
              resetLabel: t("config.reset"),
              onReset: () => resetField("maxSizeMb"),
              disabled,
              onEdit: (text) => edit("maxSizeMb", text),
            }),
            h(ui.SettingsValueField, {
              id: "wsi-max-files",
              label: t("config.maxFiles"),
              hint: t("config.maxFilesHint"),
              text: state.maxFiles.text,
              invalid: state.maxFiles.invalid,
              invalidLabel: t("config.numberInvalid"),
              overridden: state.maxFiles.overridden,
              overriddenLabel: t("config.overridden"),
              resetLabel: t("config.reset"),
              onReset: () => resetField("maxFiles"),
              disabled,
              onEdit: (text) => edit("maxFiles", text),
            }),
            h(ui.SettingsValueField, {
              id: "wsi-retention-days",
              label: t("config.retentionDays"),
              hint: t("config.retentionDaysHint"),
              text: state.retentionDays.text,
              invalid: state.retentionDays.invalid,
              invalidLabel: t("config.numberInvalid"),
              overridden: state.retentionDays.overridden,
              overriddenLabel: t("config.overridden"),
              resetLabel: t("config.reset"),
              onReset: () => resetField("retentionDays"),
              disabled,
              onEdit: (text) => edit("retentionDays", text),
            }),
          ),
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

      // The quick-search view follows the `quickSearchView` switch. The config
      // form is the live source; while the snapshot is still loading the view
      // stays on, matching the schema default.
      const registerQuickView = () =>
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

      ctx.inject(["configForms"], (configScope) => {
        configScope.effect(() => {
          const form = configScope.configForms.get(CONFIG_NS)
          let disposeView
          const sync = () => {
            // Only an explicit false hides the view: loading snapshots and
            // deployments without a served config keep the default (on).
            const enabled = form.getSnapshot().value?.quickSearchView !== false
            if (enabled && disposeView === undefined) {
              const dispose = registerQuickView()
              disposeView = typeof dispose === "function" ? dispose : () => {}
            } else if (!enabled && disposeView !== undefined) {
              const dispose = disposeView
              disposeView = undefined
              dispose()
            }
          }
          const unsubscribe = form.subscribe(sync)
          sync()
          return () => {
            unsubscribe()
            if (disposeView !== undefined) {
              const dispose = disposeView
              disposeView = undefined
              dispose()
            }
          }
        }, "web-search-insights: quick search view")
      })

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
