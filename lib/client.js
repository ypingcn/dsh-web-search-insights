// @ypingcn/dsh-web-search-insights — browser half.
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
  id: "@ypingcn/dsh-web-search-insights",
  factory: (require) => {
    var module = { exports: {} }
    var exports = module.exports
    Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" })
    var React = require("react")
    var h = React.createElement

    const NS = "dsh-web-search-insights"
    /** Sidebar tab/slot id; stable across package renames, unrelated to npm name. */
    const PKG = "dsh-web-search-insights"
    /** npm package name the Host keys client rows and bundle-config slots by. */
    const PACKAGE_NAME = "@ypingcn/dsh-web-search-insights"
    const KIND = "web-search-insights"
    const PROJECTION_KEY = "webSearchInsights"
    /** Host settings namespace for this plugin row (its profile entry id). */
    const CONFIG_NS = "web-search-insights"
    /** Mirrors the Host's default log directory for unsaved snapshots. */
    const DEFAULT_LOG_DIRECTORY = "~/.dsh/logs"
    /** Same-origin Host route backing the quick-search view. */
    const QUICK_SEARCH_PATH = "/api/dsh-web-search-insights/quick-search"
    const QUICK_SEARCH_HEADER = "x-dsh-web-search-insights"
    /** Same-origin Host route backing the in-config log browser. */
    const LOG_BROWSER_PATH = "/api/dsh-web-search-insights/logs"
    /** Same-origin Host route backing the right-sidebar statistics tab. */
    const STATS_PATH = "/api/dsh-web-search-insights/stats"
    /** Statistics view identity: right-sidebar tab, left nav row, and main panel key. */
    const STATS_TAB_ID = "dsh-web-search-stats"
    const STATS_TAB_KIND = "web-search-stats"
    /** Left nav row order: after Schedules (10), before later extensions. */
    const STATS_PANEL_ORDER = 20
    const STATS_RANGES = [7, 30, 90]
    const STATS_TOP_OPTIONS = [10, 20, 50]
    const QUICK_SEARCH_LIMITS = [5, 10, 15, 20]
    const QUICK_SEARCH_DEFAULT_LIMIT = 10
    const QUICK_SEARCH_HISTORY_KEY = "dsh.web-search-insights.quick-search.history"
    const QUICK_SEARCH_HISTORY_MAX = 20
    /** Turns rendered per page in the sidebar's "session" mode. */
    const PANEL_TURNS_PAGE = 20
    /** Rows of keywords kept visible before the rest folds behind "+N". */
    const PANEL_QUERY_ROWS = 2
    /** Snippet length above which the result card offers an expand toggle. */
    const RESULT_SNIPPET_PREVIEW_CHARS = 140

    /** Live `fetchEntry` preference; the settings form updates it in place. */
    let fetchEntryEnabled = true
    const fetchEntryListeners = new Set()

    function subscribeFetchEntry(listener) {
      fetchEntryListeners.add(listener)
      return () => fetchEntryListeners.delete(listener)
    }

    function getFetchEntryEnabled() {
      return fetchEntryEnabled
    }

    function setFetchEntryEnabled(next) {
      const value = next !== false
      if (value === fetchEntryEnabled) return
      fetchEntryEnabled = value
      for (const listener of fetchEntryListeners) listener()
    }

    const MESSAGES = {
      zh: {
        "panel.title": "搜索记录",
        "panel.guideDesc": "查看本次会话的搜索、抓取与引用情况",
        "panel.turnMode": "本轮",
        "panel.sessionMode": "本会话",
        "panel.summary":
          "会话累计引用 {cited} 个来源（共 {occurrences} 次） · 返回 {returned} 个 · 搜索 {searches} 次",
        "panel.turnSummary":
          "本轮回答引用 {cited} 个来源，其中 {local} 个来自本轮搜索；本轮共返回 {returned} 个来源。",
        "panel.turnLabel": "第 {turn} 轮",
        "panel.searches": "{count} 次搜索",
        "panel.fetches": "{count} 个页面",
        "panel.fetchesFilteredOut": "已按筛选隐藏 {count} 个抓取页面。",
        "panel.fetchGroupCount": "{count} 项",
        "panel.fetchFailed": "失败",
        "panel.fetchFailedCount": "{count} 个失败",
        "panel.fetchFailedSummary": "失败 {count} 个网页",
        "panel.noData": "还没有联网记录。发起一次需要联网的提问后再回来看看。",
        "panel.unavailable": "搜索统计未启用或尚未就绪。",
        "panel.noTurn": "这一轮没有联网记录。",
        "panel.cited": "已引用",
        "panel.notCited": "未引用",
        "panel.fetched": "可能看过",
        "panel.fetchedSummary": "获取 {count} 个网页",
        "panel.fetchesTitle": "主动抓取的页面",
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
        "panel.scopeGroup": "统计范围",
        "panel.filterGroup": "来源筛选",
        "panel.filterChanged": "已筛选：{filter}",
        "panel.modeChanged": "已切换到{mode}",
        "panel.groupedOn": "已按域名分组",
        "panel.groupedOff": "已取消域名分组",
        "panel.loadedMore": "已显示 {count} 轮",
        "panel.groupByDomain": "按域名分组",
        "panel.searchSources": "搜索来源",
        "panel.searchPlaceholder": "按关键词、域名或网址筛选",
        "panel.searchClear": "清除筛选",
        "panel.searchResults": "匹配 {count} 项",
        "panel.noMatches": "没有匹配的来源",
        "panel.groupCount": "{count} 个 · 引用 {cited}",
        "panel.filteredOut": "已按筛选隐藏 {count} 个来源。",
        "panel.openHint": "查看搜索结果",
        "entry.cited": "本轮引用 {count} 个网页",
        "entry.returned": "搜索返回 {count} 个网页",
        "entry.session": "会话累计 {count} 个网页",
        "entry.fetched": "主动抓取 {count} 个网页数据",
        "entry.fetchFailed": "获取失败 {count} 个网页",
        "entry.tooltipFetched": "本轮获取的网页数据",
        "entry.open": "查看",
        "entry.tooltip": "其中本轮搜索来源 {local} 个网页",
        "config.title": "插件配置",
        "config.enabled": "启用插件",
        "config.enabledHint": "关闭后不再写入联网日志，右侧栏也不再统计。",
        "config.directory": "日志目录",
        "config.directoryHint":
          "支持 ~；相对路径按宿主进程的当前目录解析。插件固定写入该目录下的 web-search.jsonl。",
        "config.directoryInvalid": "请填写非空路径。",
        "config.recordErrors": "记录失败调用",
        "config.recordErrorsHint": "搜索或抓取失败时也写一条带错误码的记录。",
        "config.quickSearchView": "快速搜索页面",
        "config.quickSearchViewHint": "控制会话顶部的「快速搜索」视图。",
        "config.statsPanel": "搜索统计面板",
        "config.statsPanelHint": "在右侧栏与左侧菜单显示「搜索统计」，按天汇总搜索次数与关键词分布。",
        "config.fetchEntry": "纯抓取轮次显示入口",
        "config.fetchEntryHint": "关闭后，只有主动抓取、没有搜索的轮次不显示回答末尾入口。",
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
        "config.resetAllConfirm": "确认重置",
        "config.cancel": "取消",
        "config.saved": "已保存",
        "config.overridden": "已覆盖",
        "log.title": "审计日志",
        "log.desc": "浏览 web_search 与 web_fetch 的审计记录，支持按关键词筛选。",
        "log.open": "展开日志",
        "log.close": "收起日志",
        "log.refresh": "刷新",
        "log.loadMore": "加载更多（剩余 {count} 条）",
        "log.empty": "还没有日志记录。",
        "log.loading": "加载中…",
        "log.loadFailed": "日志加载失败：{message}",
        "log.searchPlaceholder": "按关键词、网址或域名筛选",
        "log.searchLabel": "筛选日志",
        "log.total": "共 {count} 条记录",
        "log.noMatches": "没有匹配的记录。",
        "log.toolSearch": "搜索",
        "log.toolFetch": "抓取",
        "log.ok": "成功",
        "log.failed": "失败",
        "log.queries": "关键词",
        "log.sources": "返回来源",
        "log.expand": "展开详情",
        "log.collapse": "收起详情",
        "view.quickSearch": "快速搜索",
        "quick.title": "快速搜索",
        "quick.desc": "输入一个关键词，直接调用 DSH 的搜索能力；不会写入会话记录或统计。",
        "quick.placeholder": "输入一个关键词…",
        "quick.inputLabel": "搜索关键词",
        "quick.queryRequired": "请输入搜索关键词。",
        "quick.confirmClear": "确认清空",
        "quick.historyCleared": "历史查询已清空。",
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
        "quick.resultsAnnounce": "已返回 {count} 条结果。",
        "quick.errorAnnounce": "搜索失败：{message}",
        "quick.historyEmpty": "还没有手动查询记录。",
        "quick.expandSnippet": "展开摘要",
        "quick.collapseSnippet": "收起摘要",
        "stats.title": "搜索统计",
        "stats.guideDesc": "按天查看搜索次数与关键词分布",
        "stats.desc": "统计本机审计日志中的 web_search 使用情况，不包含快速搜索。",
        "stats.rangeGroup": "统计范围",
        "stats.range": "最近 {count} 天",
        "stats.refresh": "刷新",
        "stats.updatedAt": "更新于 {time}",
        "stats.timeZone": "时区：{zone}",
        "stats.loading": "正在统计…",
        "stats.loadFailed": "统计加载失败：{message}",
        "stats.unknownError": "未知错误",
        "stats.retry": "重试",
        "stats.empty": "还没有可统计的搜索记录。",
        "stats.coverage": "仅统计当前保留的日志，最早可回溯到 {day}。",
        "stats.coverageUnknown": "统计范围受日志轮转与保留策略影响。",
        "stats.metricCalls": "搜索次数",
        "stats.metricCallsHint": "一次 web_search 调用计 1 次",
        "stats.metricQueries": "关键词总数",
        "stats.metricSessions": "涉及会话",
        "stats.metricFailed": "失败次数",
        "stats.dailyTitle": "每日搜索次数",
        "stats.viewGroup": "统计视图",
        "stats.dailyTable": "按天明细",
        "stats.toggleTable": "展开按天明细",
        "stats.collapseTable": "收起按天明细",
        "stats.day": "日期",
        "stats.calls": "搜索次数",
        "stats.queries": "关键词数",
        "stats.sessions": "会话数",
        "stats.failed": "失败数",
        "stats.chartSummary": "共 {total} 次搜索，最高 {peak} 次（{day}）",
        "stats.keywordsTitle": "关键词分布",
        "stats.cloudTitle": "词云",
        "stats.cloudHint": "按分词结果生成，字号表示出现次数；点击词汇可在「关键词分布」中过滤",
        "stats.cloudLabel": "关键词词云（按分词）",
        "stats.cloudWord": "「{text}」出现 {count} 次，点击过滤",
        "stats.modeGroup": "关键词口径",
        "stats.modeQuery": "整句",
        "stats.modeTerm": "分词",
        "stats.topGroup": "显示数量",
        "stats.topOption": "前 {count} 个",
        "stats.filterLabel": "过滤关键词列表",
        "stats.filterPlaceholder": "过滤关键词…",
        "stats.filterClear": "清除过滤",
        "stats.filterBy": "按「{text}」过滤",
        "stats.distinct": "共 {count} 个不同关键词",
        "stats.overflow": "另有 {count} 次出现因超出统计上限未纳入",
        "stats.queriesTotal": "关键词共出现 {count} 次",
        "stats.termsTotal": "分词共出现 {count} 次",
        "stats.noKeywords": "这段时间还没有关键词记录。",
        "stats.noMatches": "没有匹配的关键词。",
        "stats.count": "{count} 次",
        "stats.percent": "{percent}%",
        "stats.termHint": "分词按空白与标点切分，连续中文不会进一步拆分。",
        "stats.loaded": "已更新 {count} 天的统计。",
      },
      en: {
        "panel.title": "Search sources",
        "panel.guideDesc": "Review this session's searches, fetched pages, and citations",
        "panel.turnMode": "This turn",
        "panel.sessionMode": "Session",
        "panel.summary":
          "Session: {cited} cited sources ({occurrences} citations) · {returned} returned · {searches} searches",
        "panel.turnSummary":
          "This answer cites {cited} sources, {local} from this turn's searches; {returned} sources were returned this turn.",
        "panel.turnLabel": "Turn {turn}",
        "panel.searches": "{count} searches",
        "panel.fetches": "{count} pages",
        "panel.fetchesFilteredOut": "{count} fetched pages hidden by the filter.",
        "panel.fetchGroupCount": "{count} items",
        "panel.fetchFailed": "failed",
        "panel.fetchFailedCount": "{count} failed",
        "panel.fetchFailedSummary": "{count} fetch failures",
        "panel.noData": "No web activity yet. Ask something that needs the web, then come back.",
        "panel.unavailable": "Search statistics are unavailable or not ready.",
        "panel.noTurn": "This turn has no web records.",
        "panel.cited": "cited",
        "panel.notCited": "not cited",
        "panel.fetched": "may have read",
        "panel.fetchedSummary": "{count} pages fetched",
        "panel.fetchesTitle": "Pages fetched directly",
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
        "panel.scopeGroup": "Statistics scope",
        "panel.filterGroup": "Source filter",
        "panel.filterChanged": "Filter: {filter}",
        "panel.modeChanged": "Switched to {mode}",
        "panel.groupedOn": "Grouped by domain",
        "panel.groupedOff": "Domain grouping off",
        "panel.loadedMore": "Showing {count} turns",
        "panel.groupByDomain": "By domain",
        "panel.searchSources": "Search sources",
        "panel.searchPlaceholder": "Filter by keyword, domain, or URL",
        "panel.searchClear": "Clear filter",
        "panel.searchResults": "{count} matches",
        "panel.noMatches": "No matching sources",
        "panel.groupCount": "{count} · {cited} cited",
        "panel.filteredOut": "{count} sources hidden by the filter.",
        "panel.openHint": "View search sources",
        "entry.cited": "This turn cites {count} pages",
        "entry.returned": "Searches returned {count} pages",
        "entry.session": "Session: {count} pages",
        "entry.fetched": "Fetched {count} pages this turn",
        "entry.fetchFailed": "{count} fetches failed",
        "entry.tooltipFetched": "Pages fetched this turn",
        "entry.open": "View",
        "entry.tooltip": "{local} from this turn's searches",
        "config.title": "Plugin settings",
        "config.enabled": "Enable plugin",
        "config.enabledHint": "When off, no web records are written and the sidebar stops counting.",
        "config.directory": "Log directory",
        "config.directoryHint":
          "Supports ~; a relative path resolves against the Host process cwd. The plugin always writes web-search.jsonl inside it.",
        "config.directoryInvalid": "Enter a non-empty path.",
        "config.recordErrors": "Record failed calls",
        "config.recordErrorsHint": "Write a record with the error code when a search or fetch fails.",
        "config.quickSearchView": "Quick search view",
        "config.quickSearchViewHint": "Show the Quick search view in the conversation header.",
        "config.statsPanel": "Search statistics panel",
        "config.statsPanelHint": "Show Search statistics in the right sidebar and the left navigation with daily counts and keyword distribution.",
        "config.fetchEntry": "Fetch-only entry",
        "config.fetchEntryHint": "When off, turns that only fetched pages show no turn-tail entry.",
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
        "config.resetAllConfirm": "Confirm reset",
        "config.cancel": "Cancel",
        "config.saved": "Saved",
        "config.overridden": "Overridden",
        "log.title": "Audit log",
        "log.desc": "Browse web_search and web_fetch audit records, filterable by keyword.",
        "log.open": "Show log",
        "log.close": "Hide log",
        "log.refresh": "Refresh",
        "log.loadMore": "Load more ({count} left)",
        "log.empty": "No log records yet.",
        "log.loading": "Loading…",
        "log.loadFailed": "Failed to load log: {message}",
        "log.searchPlaceholder": "Filter by keyword, URL, or domain",
        "log.searchLabel": "Filter log",
        "log.total": "{count} records",
        "log.noMatches": "No matching records.",
        "log.toolSearch": "Search",
        "log.toolFetch": "Fetch",
        "log.ok": "OK",
        "log.failed": "Failed",
        "log.queries": "Queries",
        "log.sources": "Sources",
        "log.expand": "Show details",
        "log.collapse": "Hide details",
        "view.quickSearch": "Quick search",
        "quick.title": "Quick search",
        "quick.desc": "Run one keyword through DSH's search provider directly; this does not enter the conversation log or statistics.",
        "quick.placeholder": "Enter one keyword…",
        "quick.inputLabel": "Search keyword",
        "quick.queryRequired": "Enter a search keyword first.",
        "quick.confirmClear": "Confirm clear",
        "quick.historyCleared": "Search history cleared.",
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
        "quick.resultsAnnounce": "Showing {count} results.",
        "quick.errorAnnounce": "Search failed: {message}",
        "quick.historyEmpty": "No manual searches yet.",
        "quick.expandSnippet": "Show full summary",
        "quick.collapseSnippet": "Show less",
        "stats.title": "Search statistics",
        "stats.guideDesc": "Daily search counts and keyword distribution",
        "stats.desc": "web_search usage from this host's audit log; quick searches are not included.",
        "stats.rangeGroup": "Range",
        "stats.range": "Last {count} days",
        "stats.refresh": "Refresh",
        "stats.updatedAt": "Updated {time}",
        "stats.timeZone": "Time zone: {zone}",
        "stats.loading": "Aggregating…",
        "stats.loadFailed": "Could not load statistics: {message}",
        "stats.unknownError": "unknown error",
        "stats.retry": "Retry",
        "stats.empty": "No search records to aggregate yet.",
        "stats.coverage": "Only retained logs are counted; the earliest day is {day}.",
        "stats.coverageUnknown": "Coverage depends on log rotation and retention.",
        "stats.metricCalls": "Searches",
        "stats.metricCallsHint": "One web_search call counts once",
        "stats.metricQueries": "Keywords",
        "stats.metricSessions": "Sessions",
        "stats.metricFailed": "Failures",
        "stats.dailyTitle": "Daily searches",
        "stats.viewGroup": "Statistics view",
        "stats.dailyTable": "Daily details",
        "stats.toggleTable": "Show daily details",
        "stats.collapseTable": "Hide daily details",
        "stats.day": "Date",
        "stats.calls": "Searches",
        "stats.queries": "Keywords",
        "stats.sessions": "Sessions",
        "stats.failed": "Failures",
        "stats.chartSummary": "{total} searches total; peak {peak} on {day}",
        "stats.keywordsTitle": "Keyword distribution",
        "stats.cloudTitle": "Word cloud",
        "stats.cloudHint": "Built from tokenised terms; size reflects frequency. Click a word to filter the ranked list.",
        "stats.cloudLabel": "Keyword word cloud (tokenised)",
        "stats.cloudWord": "\"{text}\" appears {count} times; click to filter",
        "stats.modeGroup": "Keyword mode",
        "stats.modeQuery": "Whole query",
        "stats.modeTerm": "Terms",
        "stats.topGroup": "Show",
        "stats.topOption": "Top {count}",
        "stats.filterLabel": "Filter keywords",
        "stats.filterPlaceholder": "Filter keywords…",
        "stats.filterClear": "Clear filter",
        "stats.filterBy": "Filter by \"{text}\"",
        "stats.distinct": "{count} distinct keywords",
        "stats.overflow": "{count} occurrences exceeded the statistics cap",
        "stats.queriesTotal": "{count} keyword occurrences",
        "stats.termsTotal": "{count} term occurrences",
        "stats.noKeywords": "No keywords in this range yet.",
        "stats.noMatches": "No matching keywords.",
        "stats.count": "{count}×",
        "stats.percent": "{percent}%",
        "stats.termHint": "Terms split on whitespace and punctuation; continuous CJK text is not segmented further.",
        "stats.loaded": "Updated statistics for {count} days.",
      },
    }

    const CSS = `
.wsl-entry{display:flex;align-items:center;gap:8px;box-sizing:border-box;width:100%;border:1px solid var(--dsw-alias-border-l2,#d9d9d9);background:var(--dsw-alias-bg-layer-2,transparent);color:var(--dsw-alias-label-primary,inherit);border-radius:8px;padding:5px 8px 5px 10px;font:inherit;font-size:12px;line-height:1.5;cursor:pointer;text-align:left}
.wsl-entry:hover{border-color:var(--dsw-alias-label-tertiary,#aaa);background:var(--dsw-alias-interactive-bg-hover,rgba(127,127,127,.08))}
.wsl-entry-icons{display:inline-flex;align-items:center;flex:none;padding-left:2px}
.wsl-entry-text{flex:1;min-width:0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.wsl-icon{width:18px;height:18px;border-radius:50%;object-fit:cover;background:var(--dsw-alias-bg-layer-2,#f2f2f2);border:1px solid var(--dsw-alias-border-l1,#eee);display:inline-flex;align-items:center;justify-content:center;font-size:9px;font-weight:600;color:var(--dsw-alias-label-secondary,#666);flex:none;overflow:hidden}
.wsl-entry-icons .wsl-icon{box-shadow:0 0 0 2px var(--dsw-alias-bg-layer-2,#fff)}
.wsl-entry-icons .wsl-icon+.wsl-icon{margin-left:-4px}
.wsl-entry-action{flex:none;display:inline-flex;align-items:center;gap:3px;margin-left:4px;border:1px solid var(--dsw-static-deepseek-450,#5686fe);background:transparent;color:var(--dsw-alias-label-primary,inherit);border-radius:999px;padding:2px 9px;font-size:11px;line-height:1.6;font-weight:600;transition:background-color .15s ease,color .15s ease}
.wsl-entry-action::after{content:"›";content:"›" / "";font-size:14px;line-height:1}
.wsl-entry:hover .wsl-entry-action{background:var(--dsw-alias-interactive-bg-hover,rgba(127,127,127,.08));border-color:var(--dsw-static-deepseek-500,#4176e6);color:var(--dsw-alias-label-primary,inherit)}
.wsl-panel{container-type:inline-size;display:flex;flex-direction:column;gap:10px;padding:12px;height:100%;min-height:0;overflow:hidden;font-size:12px;color:var(--dsw-alias-label-primary,inherit)}
.wsl-chrome{display:flex;flex-direction:column;gap:10px;flex:none;min-width:0}
.wsl-body{display:flex;flex-direction:column;gap:10px;flex:1;min-height:0;overflow:auto;overscroll-behavior:contain;scrollbar-width:thin;scrollbar-color:var(--dsw-alias-label-tertiary,#6b6b6b) transparent;scrollbar-gutter:stable}
.wsl-sr{position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap;border:0}
.wsl-head{display:flex;align-items:center;justify-content:space-between;gap:10px}
.wsl-stats{display:inline-flex;align-items:center;gap:8px;flex-wrap:wrap;color:var(--dsw-alias-label-secondary,#666);line-height:1.5;font-size:11px}
.wsl-head .wsl-stats{justify-content:flex-end;flex:1;min-width:0}
.wsl-stat{display:inline-flex;align-items:center;gap:3px;white-space:nowrap}
.wsl-stat-visual{display:inline-flex;align-items:center;gap:3px;white-space:nowrap}
.wsl-stat-icon{width:13px;height:13px;flex:none;opacity:.85}
.wsl-stat-count{font-variant-numeric:tabular-nums}
.wsl-toolbar{display:flex;flex-wrap:wrap;align-items:center;gap:5px 10px;min-width:0;border-bottom:1px solid var(--dsw-alias-border-l1,#eee);padding-bottom:8px}
.wsl-search{display:flex;align-items:center;gap:4px;flex:1 1 140px;min-width:0;min-height:26px;border:.5px solid var(--dsw-alias-border-l3,#ccc);border-radius:999px;background:var(--dsw-alias-bg-layer-3,#fafafa);padding:0 8px}
.wsl-search:focus-within{border-color:var(--dsw-alias-state-business-primary,#4a7dff);background:var(--dsw-alias-bg-layer-1,#fff)}
.wsl-search-input{flex:1;min-width:0;border:0;background:transparent;color:var(--dsw-alias-label-primary,inherit);font:inherit;font-size:11px;line-height:1.5;padding:0;outline:none}
.wsl-search-input::placeholder{color:var(--dsw-alias-label-tertiary,#999)}
.wsl-search-clear{border:0;background:0 0;color:var(--dsw-alias-label-tertiary,#999);cursor:pointer;font:inherit;font-size:13px;line-height:1;padding:0;flex:none;min-width:16px;height:16px;border-radius:50%;display:inline-flex;align-items:center;justify-content:center}
.wsl-search-clear:hover{color:var(--dsw-alias-label-primary,#111);background:var(--dsw-alias-interactive-bg-hover,rgba(127,127,127,.08))}
.wsl-search-clear:focus-visible{outline:var(--dsw-focus-ring-width) solid var(--dsw-focus-ring-color,var(--dsw-alias-state-business-primary));outline-offset:1px}
.wsl-seg{display:inline-flex;flex:none;flex-wrap:nowrap;gap:0;align-items:center;padding:2px;border-radius:999px;background:var(--dsw-alias-interactive-bg-hover,rgba(127,127,127,.08))}
.wsl-group{display:flex;flex-direction:column;gap:4px;list-style:none}
.wsl-group-head{display:flex;align-items:center;gap:6px;margin:0;font-size:11px;font-weight:600;color:var(--dsw-alias-label-secondary,#666)}
.wsl-group-head .wsl-muted{margin-left:auto;font-weight:400}
.wsl-group-sources{display:flex;flex-direction:column;gap:5px;list-style:none;margin:0;padding-left:2px}
.wsl-seg button{box-sizing:border-box;border:1px solid transparent;background:transparent;color:var(--dsw-alias-label-secondary,#666);border-radius:999px;padding:3px 5px;font:inherit;font-size:11px;line-height:1.45;cursor:pointer;white-space:nowrap;transition:color .12s ease,background-color .12s ease}
.wsl-seg button:hover{color:var(--dsw-alias-label-primary,#111);background:var(--dsw-alias-interactive-bg-active,rgba(127,127,127,.14))}
.wsl-seg button[aria-checked="true"]{color:var(--dsw-alias-label-primary,inherit);background:var(--dsw-alias-bg-layer-1,#fff);box-shadow:0 1px 2px rgba(0,0,0,.12)}
.wsl-icon-toggle{display:inline-flex;align-items:center;justify-content:center;flex:none;margin-left:auto;align-self:stretch;border:1px solid transparent;background:transparent;color:var(--dsw-alias-label-secondary,#666);border-radius:8px;padding:4px 5px;cursor:pointer;transition:color .12s ease,background-color .12s ease,border-color .12s ease}
.wsl-icon-toggle:hover{color:var(--dsw-alias-label-primary,#111);background:var(--dsw-alias-interactive-bg-hover,rgba(127,127,127,.08))}
.wsl-icon-toggle[aria-pressed="true"]{color:var(--dsw-alias-brand-primary,#4a7dff);background:var(--dsw-alias-interactive-bg-active,rgba(127,127,127,.14))}
.wsl-icon-toggle .wsl-stat-icon{width:14px;height:14px}
@container (max-width:380px){.wsl-head .wsl-stats{gap:6px;font-size:10px}.wsl-head .wsl-stat,.wsl-head .wsl-stat-visual{gap:2px}.wsl-head .wsl-stat-icon{width:12px;height:12px}}
@container (min-width:304px){.wsl-seg button{padding:3px 6px}}
@container (min-width:316px){.wsl-seg button{padding:3px 7px}}
@container (min-width:328px){.wsl-seg button{padding:3px 8px}}
@container (min-width:352px){.wsl-seg button{padding:4px 10px}}
.wsl-card{border:1px solid var(--dsw-alias-border-l2,#d9d9d9);border-radius:10px;padding:10px;display:flex;flex-direction:column;gap:8px;background:var(--dsw-alias-bg-layer-1,transparent)}
.wsl-card-head{display:flex;align-items:center;gap:8px;flex-wrap:wrap}
.wsl-card-title{margin:0;font-size:inherit;font-weight:600;line-height:inherit}
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
.wsl-sources{display:flex;flex-direction:column;gap:5px;list-style:none;margin:0;padding:0}
.wsl-source{display:flex;align-items:center;gap:6px;min-width:0}
.wsl-source-title{color:var(--dsw-alias-brand-primary,#3568d9);text-decoration:none;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;min-width:0;flex:1}
.wsl-source .wsl-icon{width:14px;height:14px;font-size:8px}
.wsl-source-status{display:inline-flex;align-items:center;justify-content:flex-end;gap:2px;flex:none;width:30px;margin-left:2px}
.wsl-status-icon,.wsl-status-slot{width:14px;height:14px;flex:none;display:inline-flex;align-items:center;justify-content:center}
.wsl-status-icon .wsl-stat-icon{width:14px;height:14px;opacity:1}
.wsl-status-cited{color:var(--dsw-static-deepseek-600,#3568d9)}
.wsl-status-at{font-size:12px;font-weight:700;line-height:1;font-family:var(--ds-font-family-code,ui-monospace,SFMono-Regular,Menlo,monospace)}
.wsl-status-fetched{color:var(--dsw-alias-state-warn-primary,#a86400)}
.wsl-source-title:hover{text-decoration:underline}
.wsl-source-host{color:var(--dsw-alias-label-tertiary,#6b6b6b);font-size:11px;flex:none;max-width:40%;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.wsl-fetches{display:flex;flex-direction:column;gap:4px;border-top:1px dashed var(--dsw-alias-border-l1,#eee);padding-top:7px}
.wsl-fetch-list{display:flex;flex-direction:column;gap:4px;list-style:none;margin:0;padding:0}
.wsl-fetch-group{display:flex;flex-direction:column;gap:4px;list-style:none}
.wsl-fetch-group-sources{display:flex;flex-direction:column;gap:4px;list-style:none;margin:0;padding:0}
.wsl-fetch-group-head{display:flex;align-items:center;gap:6px;margin:0;font-size:11px;font-weight:600;color:var(--dsw-alias-label-secondary,#666)}
.wsl-fetch-group-head .wsl-muted{margin-left:auto;font-weight:400}
.wsl-fetch{display:flex;align-items:center;gap:6px;min-width:0;list-style:none}
.wsl-fetch a{color:var(--dsw-alias-label-secondary,#666);text-decoration:none;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;min-width:0;flex:1;font-family:var(--ds-font-family-code,ui-monospace,SFMono-Regular,Menlo,monospace);font-size:11px;line-height:16px}
.wsl-fetch a:hover{text-decoration:underline}
.wsl-fetch-status{display:inline-flex;align-items:center;gap:2px;flex:none;border:1px solid var(--dsw-alias-border-l2,#d9d9d9);border-radius:999px;padding:0 5px;height:16px;font-size:11px;font-weight:600;line-height:1;color:var(--dsw-alias-label-secondary,#666);background:transparent}
.wsl-fetch-ok{border-color:var(--dsw-alias-state-success-primary,#1f9d55)}
.wsl-fetch-err{border-color:var(--dsw-alias-state-error-primary,#d64545)}
.wsl-fetch-status svg{width:9px;height:9px;flex:none}
.wsl-fetch-ok svg{color:var(--dsw-alias-state-success-primary,#1f9d55)}
.wsl-fetch-err svg{color:var(--dsw-alias-state-error-primary,#d64545)}
.wsl-empty{color:var(--dsw-alias-label-secondary,#666);padding:12px 4px;line-height:1.6}
.wsl-more{align-self:stretch;border:1px dashed var(--dsw-alias-border-l2,#d9d9d9);background:transparent;color:var(--dsw-alias-label-secondary,#666);border-radius:8px;padding:6px 10px;font:inherit;font-size:11px;line-height:1.5;cursor:pointer}
.wsl-more:hover{border-color:var(--dsw-alias-label-tertiary,#aaa);background:var(--dsw-alias-interactive-bg-hover,rgba(127,127,127,.08))}
.wsl-entry:focus-visible,.wsl-seg button:focus-visible,.wsl-icon-toggle:focus-visible,.wsl-more:focus-visible,.wsl-source-title:focus-visible,.wsl-fetch a:focus-visible,.wsq-help:focus-visible,.wsq-history-toggle:focus-visible,.wsq-history-clear:focus-visible,.wsq-submit:focus-visible,.wsq-select:focus-visible,.wsq-chip:focus-visible,.wsq-cancel:focus-visible,.wsq-result-title:focus-visible,.wsq-snippet-toggle:focus-visible,.wsi-reset:focus-visible{outline:var(--dsw-focus-ring-width) solid var(--dsw-focus-ring-color,var(--dsw-alias-state-business-primary));outline-offset:1px}
.wsl-seg button,.wsl-queries-toggle,.wsl-icon-toggle,.wsq-help,.wsq-history-toggle,.wsq-history-clear,.wsq-cancel,.wsq-chip,.wsq-snippet-toggle,.wsi-reset{min-block-size:24px;min-inline-size:24px}
@media (pointer:coarse){.wsl-seg button,.wsl-queries-toggle,.wsl-icon-toggle,.wsq-help,.wsq-history-toggle,.wsq-history-clear,.wsq-cancel,.wsq-chip,.wsq-snippet-toggle,.wsi-reset{min-block-size:32px;min-inline-size:32px}}
@media (forced-colors:active){.wsl-seg button[aria-checked="true"]{border-color:ButtonText;background:Highlight;color:HighlightText}.wsl-icon-toggle[aria-pressed="true"]{border-color:ButtonText;background:Highlight;color:HighlightText}}
.wsi-config{container-type:inline-size;display:flex;flex-direction:column;gap:14px;width:100%;min-width:0}
.wsi-config-head{margin:0;font-size:14px;font-weight:600;line-height:22px}
.wsi-toggle-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px 20px}
.wsi-toggle-grid .wsi-field-toggle{border:1px solid var(--dsw-alias-border-l2);border-radius:10px;padding:10px 12px}
.wsi-limit-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:0 20px;border-top:1px solid var(--dsw-alias-border-l2)}
.wsi-limit-grid>*+*{border-top:0!important}
@container (max-width:720px){.wsi-toggle-grid,.wsi-limit-grid{grid-template-columns:minmax(0,1fr)}}
.wsi-field{display:flex;flex-direction:column;gap:6px}
.wsi-toggle-row{display:flex;align-items:center;justify-content:space-between;gap:12px;min-width:0}
.wsi-toggle-actions{display:inline-flex;align-items:center;gap:10px;flex:none}
.wsi-field-head{display:flex;align-items:center;justify-content:space-between;gap:12px;min-width:0}
.wsi-label{color:var(--dsw-alias-label-primary);font-size:13px;line-height:20px}
.wsi-badges{display:inline-flex;align-items:center;gap:8px;color:var(--dsw-alias-label-tertiary,#6b6b6b);font-size:12px;line-height:18px;flex:none}
.wsi-reset{border:0;background:0 0;color:var(--dsw-alias-state-business-primary);font:inherit;font-size:12px;cursor:pointer;padding:0}
.wsi-reset:hover{text-decoration:underline}
.wsi-hint{margin:0;color:var(--dsw-alias-label-tertiary,#6b6b6b);font-size:12px;line-height:18px}
.wsi-invalid{margin:0;color:var(--dsw-alias-state-error-primary);font-size:12px;line-height:18px}
.wsi-form{display:flex;flex-direction:column}
.wsi-readonly,.wsi-unavailable{margin:0 0 12px;font-size:12px;line-height:1.5;color:var(--dsw-alias-label-tertiary,#6b6b6b)}
.wsi-footer{display:flex;align-items:center;gap:8px;padding-top:16px}
.wsi-failed{flex:1;min-width:0;margin:0;font-size:12px;line-height:1.5;color:var(--dsw-alias-state-error-primary)}
.wsi-saved{flex:1;min-width:0;margin:0;font-size:12px;line-height:1.5;color:var(--dsw-alias-state-success-primary,#1f9d55)}
.wsi-foot-actions{display:flex;align-items:center;gap:8px;margin-left:auto}
.wsi-save{appearance:none;border:1px solid transparent;border-radius:var(--dsw-radius-md);padding:5px 14px;font:inherit;font-size:13px;line-height:1.5;cursor:pointer;background:var(--dsw-alias-label-primary);color:var(--dsw-alias-bg-layer-3)}
.wsi-save:disabled{opacity:.4;cursor:default}
.wsi-save:focus-visible,.wsi-reset-all:focus-visible{outline:var(--dsw-focus-ring-width) solid var(--dsw-focus-ring-color,var(--dsw-alias-state-business-primary));outline-offset:1px}
.wsi-reset-all{appearance:none;border:1px solid var(--dsw-alias-border-l2);border-radius:var(--dsw-radius-md);padding:5px 14px;font:inherit;font-size:13px;line-height:1.5;cursor:pointer;background:transparent;color:var(--dsw-alias-label-secondary)}
.wsi-reset-all:hover:not(:disabled){border-color:var(--dsw-alias-border-l3);color:var(--dsw-alias-label-primary);background:var(--dsw-alias-interactive-bg-hover,rgba(127,127,127,.08))}
.wsi-reset-all:disabled{opacity:.4;cursor:default}
.wsq-page{box-sizing:border-box;width:min(100%, var(--dsh-chat-content-width, 920px));margin:0 auto;padding:20px 24px 40px;display:flex;flex-direction:column;gap:14px;color:var(--dsw-alias-label-primary);font-size:13px;line-height:1.5}
.wsq-head{display:flex;flex-direction:column;gap:4px}
.wsq-title-row{display:flex;align-items:center;gap:8px;flex-wrap:wrap}
.wsq-title{margin:0;font-size:18px;font-weight:600;line-height:26px}
.wsq-help{box-sizing:border-box;flex:none;width:20px;height:20px;border:.5px solid var(--dsw-alias-border-l3);border-radius:50%;background:transparent;color:var(--dsw-alias-label-tertiary,#6b6b6b);font:inherit;font-size:12px;line-height:1;padding:0;cursor:pointer;display:inline-flex;align-items:center;justify-content:center}
.wsq-help:hover,.wsq-help[data-active="true"]{border-color:var(--dsw-alias-state-business-primary);color:var(--dsw-alias-state-business-primary)}
.wsq-history-toggle{margin-left:auto;border:0;background:0 0;color:var(--dsw-alias-state-business-primary);font:inherit;font-size:12px;line-height:18px;padding:0;cursor:pointer}
.wsq-history-toggle:hover{text-decoration:underline}
.wsq-form{display:flex;flex-wrap:wrap;align-items:center;gap:8px}
.wsq-input{box-sizing:border-box;flex:1 1 180px;min-width:0;height:38px;border:.5px solid var(--dsw-alias-border-l4);border-radius:var(--dsw-radius-md);background:var(--dsw-alias-bg-layer-3);color:var(--dsw-alias-label-primary);font:inherit;font-size:14px;line-height:1.5;outline:none;padding:0 12px}
.wsq-input:focus-visible{border-color:var(--dsw-alias-state-business-primary);outline:var(--dsw-focus-ring-width) solid var(--dsw-focus-ring-color,var(--dsw-alias-state-business-primary));outline-offset:1px}
.wsq-submit{flex:none;height:38px;border-radius:var(--dsw-radius-md);border:1px solid transparent;background:var(--dsw-static-deepseek-600,#3568d9);color:#fff;font:inherit;font-size:13px;line-height:1.5;padding:0 18px;cursor:pointer}
.wsq-submit:hover:not(:disabled){background:var(--dsw-static-deepseek-700,#2b56b8)}
.wsq-submit:disabled{opacity:.45;cursor:default}
.wsq-select-wrap{position:relative;flex:none;display:inline-flex}
.wsq-select{appearance:none;-webkit-appearance:none;flex:none;height:38px;border:.5px solid var(--dsw-alias-border-l4);border-radius:var(--dsw-radius-md);background:var(--dsw-alias-bg-layer-3);color:var(--dsw-alias-label-primary);font:inherit;font-size:14px;line-height:1.5;padding:0 30px 0 10px;cursor:pointer}
.wsq-select-icon{position:absolute;right:9px;top:50%;transform:translateY(-50%);display:inline-flex;align-items:center;justify-content:center;pointer-events:none;color:var(--dsw-alias-label-tertiary,#6b6b6b)}
.wsq-select-icon svg{width:12px;height:12px;fill:none;stroke:currentColor;stroke-width:1.5;stroke-linecap:round;stroke-linejoin:round}
.wsq-select:disabled{opacity:.55;cursor:default}
.wsq-history{display:flex;flex-direction:column;gap:8px;border-top:.5px solid var(--dsw-alias-border-l2);padding-top:12px}
.wsq-history[hidden]{display:none}
.wsq-history-head{display:flex;align-items:center;justify-content:space-between;gap:8px;color:var(--dsw-alias-label-tertiary,#6b6b6b);font-size:12px}
.wsq-history-clear{border:0;background:0 0;color:var(--dsw-alias-state-business-primary);font:inherit;font-size:12px;cursor:pointer;padding:0}
.wsq-history-clear:hover{text-decoration:underline}
.wsq-history-confirm{display:inline-flex;align-items:center;gap:8px}
.wsq-history-confirm-yes{color:var(--dsw-alias-state-error-primary)}
.wsq-chips{display:flex;flex-wrap:wrap;gap:6px}
.wsq-chip{max-width:100%;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;border:.5px solid var(--dsw-alias-border-l1);border-radius:999px;background:transparent;color:var(--dsw-alias-label-secondary);font:inherit;font-size:12px;line-height:1.5;padding:2px 10px;cursor:pointer}
.wsq-chip:hover{border-color:var(--dsw-alias-border-l3);color:var(--dsw-alias-label-primary)}
.wsq-status{display:flex;align-items:center;gap:10px;color:var(--dsw-alias-label-tertiary,#6b6b6b);font-size:12px;line-height:18px;margin:0;min-height:20px}
.wsq-progress{box-sizing:border-box;width:14px;height:14px;flex:none;appearance:none;background:transparent;border:2px solid var(--dsw-alias-border-l3,#ccc);border-top-color:var(--dsw-alias-state-business-primary);border-radius:50%;animation:wsq-spin .8s linear infinite}
@keyframes wsq-spin{to{transform:rotate(1turn)}}
@media (prefers-reduced-motion:reduce){.wsq-progress{animation-duration:6s}}
@media (forced-colors:active){.wsq-progress{forced-color-adjust:none;border-color:CanvasText;border-top-color:Highlight}}
.wsq-error{color:var(--dsw-alias-state-error-primary)}
.wsq-cancel{border:.5px solid var(--dsw-alias-border-l2);border-radius:999px;background:transparent;color:var(--dsw-alias-label-secondary);font:inherit;font-size:12px;line-height:1.5;padding:1px 10px;cursor:pointer}
.wsq-results{display:flex;flex-direction:column;gap:10px;margin:0;padding:0;list-style:none}
.wsq-result{display:flex;flex-direction:column;gap:4px;border:.5px solid var(--dsw-alias-border-l2);border-radius:10px;padding:10px 12px;background:var(--dsw-alias-bg-layer-1);transition:border-color .12s ease,background-color .12s ease}
.wsq-result:hover{border-color:var(--dsw-alias-border-l3,var(--dsw-alias-border-l2));background:var(--dsw-alias-interactive-bg-hover,rgba(127,127,127,.08))}
.wsq-result-title{color:var(--dsw-alias-state-business-primary);text-decoration:none;font-size:13px;font-weight:600;line-height:20px;overflow-wrap:anywhere}
.wsq-result-title:hover{text-decoration:underline}
.wsq-result-url{color:var(--dsw-alias-label-tertiary,#6b6b6b);font-family:var(--ds-font-family-code,ui-monospace,SFMono-Regular,Menlo,monospace);font-size:11px;line-height:16px;overflow-wrap:anywhere}
.wsq-result-snippet{margin:0;color:var(--dsw-alias-label-secondary);font-size:12px;line-height:18px}
.wsq-clamped{display:-webkit-box;-webkit-box-orient:vertical;-webkit-line-clamp:3;overflow:hidden}
.wsq-snippet-toggle{align-self:flex-start;border:0;background:0 0;color:var(--dsw-alias-state-business-primary);font:inherit;font-size:12px;line-height:18px;padding:0;cursor:pointer;min-block-size:24px}
.wsq-snippet-toggle:hover{text-decoration:underline}
.wsq-result-date{color:var(--dsw-alias-label-tertiary,#6b6b6b);font-size:11px;line-height:16px}
.wsl-log{display:flex;flex-direction:column;gap:8px;border-top:1px solid var(--dsw-alias-border-l2,#d9d9d9);padding-top:14px}
.wsl-log-head{display:flex;align-items:center;justify-content:space-between;gap:8px;flex-wrap:wrap}
.wsl-log-title{margin:0;font-size:13px;font-weight:600;line-height:20px;color:var(--dsw-alias-label-primary)}
.wsl-log-desc{margin:0;font-size:11px;line-height:1.5;color:var(--dsw-alias-label-tertiary,#6b6b6b)}
.wsl-log-actions{display:flex;align-items:center;gap:6px;flex:none}
.wsl-log-toggle{border:0;background:0 0;color:var(--dsw-alias-state-business-primary);font:inherit;font-size:12px;cursor:pointer;padding:0}
.wsl-log-toggle:hover{text-decoration:underline}
.wsl-log-refresh{border:1px solid var(--dsw-alias-border-l2);border-radius:var(--dsw-radius-md);background:transparent;color:var(--dsw-alias-label-secondary);font:inherit;font-size:12px;padding:4px 10px;cursor:pointer}
.wsl-log-refresh:hover:not(:disabled){border-color:var(--dsw-alias-border-l3);color:var(--dsw-alias-label-primary)}
.wsl-log-refresh:disabled{opacity:.5;cursor:default}
.wsl-log-search{display:flex;align-items:center;gap:6px}
.wsl-log-search-input{flex:1;min-width:0;height:28px;border:.5px solid var(--dsw-alias-border-l3,#ccc);border-radius:var(--dsw-radius-md);background:var(--dsw-alias-bg-layer-3);color:var(--dsw-alias-label-primary);font:inherit;font-size:12px;padding:0 10px;outline:none}
.wsl-log-search-input:focus-visible{border-color:var(--dsw-alias-state-business-primary);outline:var(--dsw-focus-ring-width) solid var(--dsw-focus-ring-color,var(--dsw-alias-state-business-primary));outline-offset:1px}
.wsl-log-meta{display:flex;align-items:center;gap:8px;color:var(--dsw-alias-label-tertiary,#6b6b6b);font-size:11px}
.wsl-log-list{display:flex;flex-direction:column;gap:6px;list-style:none;margin:0;padding:0;max-height:420px;overflow:auto;scrollbar-width:thin}
.wsl-log-row{display:flex;flex-direction:column;gap:4px;border:.5px solid var(--dsw-alias-border-l1,#eee);border-radius:8px;padding:8px 10px;background:var(--dsw-alias-bg-layer-1)}
.wsl-log-row-head{display:flex;align-items:center;gap:8px;min-width:0}
.wsl-log-time{color:var(--dsw-alias-label-tertiary,#6b6b6b);font-family:var(--ds-font-family-code,ui-monospace,SFMono-Regular,Menlo,monospace);font-size:11px;flex:none}
.wsl-log-tool{display:inline-flex;align-items:center;border-radius:999px;padding:0 7px;font-size:11px;font-weight:600;line-height:18px;flex:none}
.wsl-log-tool-search{background:rgba(53,104,217,.1);color:var(--dsw-static-deepseek-600,#3568d9)}
.wsl-log-tool-fetch{background:rgba(168,100,0,.1);color:var(--dsw-alias-state-warn-primary,#a86400)}
.wsl-log-status{font-size:11px;font-weight:600;flex:none}
.wsl-log-status-ok{color:var(--dsw-alias-state-success-primary,#1f9d55)}
.wsl-log-status-err{color:var(--dsw-alias-state-error-primary,#d64545)}
.wsl-log-summary{flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:12px;color:var(--dsw-alias-label-primary)}
.wsl-log-expand{border:0;background:0 0;color:var(--dsw-alias-state-business-primary);font:inherit;font-size:11px;cursor:pointer;padding:0;flex:none}
.wsl-log-expand:hover{text-decoration:underline}
.wsl-log-detail{display:flex;flex-direction:column;gap:6px;padding-top:4px}
.wsl-log-detail-label{font-size:11px;font-weight:600;color:var(--dsw-alias-label-secondary,#666)}
.wsl-log-queries{display:flex;flex-wrap:wrap;gap:4px}
.wsl-log-chip{border:1px solid var(--dsw-alias-border-l1,#eee);border-radius:999px;padding:1px 8px;font-size:11px;color:var(--dsw-alias-label-secondary,#666);background:var(--dsw-alias-bg-layer-2)}
.wsl-log-url{color:var(--dsw-alias-label-secondary,#666);font-family:var(--ds-font-family-code,ui-monospace,SFMono-Regular,Menlo,monospace);font-size:11px;overflow-wrap:anywhere}
.wsl-log-url a{color:inherit;text-decoration:none}
.wsl-log-url a:hover{text-decoration:underline}
.wsl-log-sources{display:flex;flex-direction:column;gap:3px}
.wsl-log-source{display:flex;align-items:center;gap:6px;min-width:0}
.wsl-log-source-title{color:var(--dsw-alias-state-business-primary,#3568d9);text-decoration:none;font-size:12px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;min-width:0;flex:1}
.wsl-log-source-title:hover{text-decoration:underline}
.wsl-log-error{color:var(--dsw-alias-state-error-primary,#d64545);font-size:11px;font-family:var(--ds-font-family-code,ui-monospace,SFMono-Regular,Menlo,monospace);overflow-wrap:anywhere}
.wsl-log-empty{color:var(--dsw-alias-label-secondary,#666);padding:12px 4px;font-size:12px;line-height:1.5}
.wsl-log-more{align-self:stretch;border:1px dashed var(--dsw-alias-border-l2,#d9d9d9);background:transparent;color:var(--dsw-alias-label-secondary,#666);border-radius:8px;padding:6px 10px;font:inherit;font-size:12px;cursor:pointer}
.wsl-log-more:hover:not(:disabled){border-color:var(--dsw-alias-label-tertiary,#aaa);background:var(--dsw-alias-interactive-bg-hover,rgba(127,127,127,.08))}
.wsl-log-more:disabled{opacity:.5;cursor:default}
.wss-page{box-sizing:border-box;display:flex;flex-direction:column;gap:12px;padding:14px 14px 28px;color:var(--dsw-alias-label-primary);font-size:12px;line-height:1.5}
.wss-main{flex:1;min-height:0;overflow:auto;background:var(--dsw-alias-bg-base)}
.wss-main .wss-page{max-width:1040px;margin:0 auto;padding:24px 28px 48px;gap:16px}
.wss-main .wss-title{font-size:20px;line-height:28px}
.wss-main .wss-metrics{grid-template-columns:repeat(4,minmax(0,1fr))}
.wss-main .wss-chart{height:200px}
.wss-main .wss-keyword-share{width:56px}
@media (max-width:900px){.wss-main .wss-metrics{grid-template-columns:repeat(2,minmax(0,1fr))}}
@media (max-width:560px){.wss-main .wss-page{padding:16px 14px 32px}.wss-main .wss-metrics{grid-template-columns:1fr}}
.wss-head{display:flex;flex-direction:column;gap:4px}
.wss-title-row{display:flex;align-items:center;gap:8px}
.wss-title{margin:0;font-size:16px;font-weight:600;line-height:24px;flex:1}
.wss-refresh{flex:none;border:1px solid var(--dsw-alias-border-l2);border-radius:var(--dsw-radius-md);background:transparent;color:var(--dsw-alias-label-secondary);font:inherit;font-size:12px;padding:3px 10px;cursor:pointer}
.wss-refresh:hover:not(:disabled){border-color:var(--dsw-alias-border-l3);color:var(--dsw-alias-label-primary)}
.wss-refresh:disabled{opacity:.5;cursor:default}
.wss-desc{margin:0;color:var(--dsw-alias-label-tertiary,#6b6b6b);font-size:12px;line-height:18px}
.wss-toolbar{display:flex;align-items:center;gap:8px;flex-wrap:wrap}
.wss-seg{display:inline-flex;border:1px solid var(--dsw-alias-border-l2);border-radius:999px;padding:2px;gap:2px;background:var(--dsw-alias-bg-layer-2)}
.wss-seg-btn{border:0;background:transparent;color:var(--dsw-alias-label-secondary);font:inherit;font-size:11px;line-height:18px;padding:2px 9px;border-radius:999px;cursor:pointer;white-space:nowrap}
.wss-seg-btn[aria-checked="true"]{background:var(--dsw-alias-bg-layer-1);color:var(--dsw-alias-label-primary);box-shadow:0 0 0 1px var(--dsw-alias-border-l2)}
.wss-seg-btn:hover{color:var(--dsw-alias-label-primary)}
.wss-status{color:var(--dsw-alias-label-tertiary,#6b6b6b);font-size:11px;margin:0}
.wss-state{display:flex;flex-direction:column;align-items:flex-start;gap:8px;border:.5px dashed var(--dsw-alias-border-l2);border-radius:10px;padding:16px 12px}
.wss-empty,.wss-empty-inline{margin:0;color:var(--dsw-alias-label-secondary);font-size:12px;line-height:1.6}
.wss-error{margin:0;color:var(--dsw-alias-state-error-primary,#d64545);font-size:12px;overflow-wrap:anywhere}
.wss-retry{border:1px solid var(--dsw-alias-border-l2);border-radius:var(--dsw-radius-md);background:transparent;color:var(--dsw-alias-label-secondary);font:inherit;font-size:12px;padding:4px 10px;cursor:pointer}
.wss-progress{box-sizing:border-box;width:16px;height:16px;appearance:none;background:transparent;border:2px solid var(--dsw-alias-border-l3,#ccc);border-top-color:var(--dsw-alias-state-business-primary);border-radius:50%;animation:wsq-spin .8s linear infinite}
.wss-metrics{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px}
.wss-metric{display:flex;flex-direction:column;gap:1px;border:.5px solid var(--dsw-alias-border-l1);border-radius:10px;padding:8px 10px;background:var(--dsw-alias-bg-layer-1);min-width:0}
.wss-metric-label{color:var(--dsw-alias-label-tertiary,#6b6b6b);font-size:11px}
.wss-metric-value{font-size:18px;font-weight:600;line-height:24px;font-variant-numeric:tabular-nums}
.wss-metric-hint{color:var(--dsw-alias-label-tertiary,#6b6b6b);font-size:10px;line-height:14px}
.wss-tabs{display:flex;align-items:center;gap:2px;border-bottom:.5px solid var(--dsw-alias-border-l2);margin-top:2px}
.wss-tab{position:relative;margin-bottom:-.5px;border:0;border-bottom:1.5px solid transparent;border-radius:6px 6px 0 0;background:transparent;color:var(--dsw-alias-label-secondary);font:inherit;font-size:12px;line-height:20px;padding:5px 10px;cursor:pointer;white-space:nowrap}
.wss-tab:hover{color:var(--dsw-alias-label-primary);background:var(--dsw-alias-interactive-bg-hover,rgba(127,127,127,.08))}
.wss-tab[aria-selected="true"]{color:var(--dsw-alias-label-primary);font-weight:600;border-bottom-color:var(--dsw-alias-state-business-primary,#3568d9)}
.wss-panel{display:flex;flex-direction:column;gap:8px;min-width:0}
.wss-panel[hidden]{display:none}
.wss-panel-tools{display:flex;align-items:center;justify-content:flex-end;gap:8px;flex-wrap:wrap}
.wss-cloud{list-style:none;display:flex;flex-wrap:wrap;align-items:baseline;justify-content:center;gap:5px 12px;margin:0;padding:14px 12px;min-height:72px;border:.5px solid var(--dsw-alias-border-l1);border-radius:10px;background:var(--dsw-alias-bg-layer-1)}
.wss-cloud li{display:inline-flex;max-width:100%;min-width:0}
.wss-cloud-word{border:0;background:transparent;color:var(--dsw-alias-label-primary);font:inherit;font-weight:500;line-height:1.15;padding:0 1px;cursor:pointer;white-space:nowrap;max-width:100%;overflow:hidden;text-overflow:ellipsis}
.wss-cloud-word:hover{color:var(--dsw-alias-state-business-primary,#3568d9)}
.wss-cloud-word[data-top="true"]{color:var(--dsw-static-deepseek-600,#3568d9)}
.wss-section-head{display:flex;align-items:center;justify-content:space-between;gap:8px;flex-wrap:wrap}
.wss-section-title{margin:0;font-size:13px;font-weight:600;line-height:20px}
.wss-link{border:0;background:0 0;color:var(--dsw-alias-state-business-primary);font:inherit;font-size:11px;padding:0;cursor:pointer;white-space:nowrap}
.wss-link:hover{text-decoration:underline}
.wss-chart-wrap{display:flex;flex-direction:column;gap:4px}
.wss-chart{display:flex;align-items:flex-end;gap:1px;height:120px;padding:4px 2px 0;border-bottom:.5px solid var(--dsw-alias-border-l2);background:linear-gradient(to top,var(--dsw-alias-bg-layer-2),transparent)}
.wss-bar-slot{flex:1 1 0;min-width:1px;height:100%;display:flex;align-items:flex-end}
.wss-bar{width:100%;border-radius:2px 2px 0 0;background:var(--dsw-static-deepseek-600,#3568d9);opacity:.82;min-height:0}
.wss-bar-slot:hover .wss-bar{opacity:1}
.wss-axis{display:flex;justify-content:space-between;gap:8px;color:var(--dsw-alias-label-tertiary,#6b6b6b);font-size:10px;font-variant-numeric:tabular-nums}
.wss-table-wrap{max-height:260px;overflow:auto;scrollbar-width:thin;border:.5px solid var(--dsw-alias-border-l1);border-radius:8px}
.wss-table{width:100%;border-collapse:collapse;font-size:11px;font-variant-numeric:tabular-nums}
.wss-table th,.wss-table td{padding:5px 8px;text-align:right;border-bottom:.5px solid var(--dsw-alias-border-l1);white-space:nowrap}
.wss-table thead th{position:sticky;top:0;background:var(--dsw-alias-bg-layer-2);color:var(--dsw-alias-label-secondary);font-weight:600;z-index:1}
.wss-table th:first-child,.wss-table td:first-child{text-align:left}
.wss-table tbody tr:last-child th,.wss-table tbody tr:last-child td{border-bottom:0}
.wss-keyword-toolbar{display:flex;align-items:center;gap:6px;flex-wrap:wrap}
.wss-filter{flex:1 1 120px;min-width:0;height:28px;border:.5px solid var(--dsw-alias-border-l3,#ccc);border-radius:var(--dsw-radius-md);background:var(--dsw-alias-bg-layer-3);color:var(--dsw-alias-label-primary);font:inherit;font-size:12px;padding:0 10px;outline:none}
.wss-filter:focus-visible{border-color:var(--dsw-alias-state-business-primary);outline:var(--dsw-focus-ring-width) solid var(--dsw-focus-ring-color,var(--dsw-alias-state-business-primary));outline-offset:1px}
.wss-top{display:inline-flex;align-items:center;gap:4px;color:var(--dsw-alias-label-tertiary,#6b6b6b);font-size:11px;flex:none}
.wss-select{height:28px;border:.5px solid var(--dsw-alias-border-l3,#ccc);border-radius:var(--dsw-radius-md);background:var(--dsw-alias-bg-layer-3);color:var(--dsw-alias-label-primary);font:inherit;font-size:11px;padding:0 6px}
.wss-meta{margin:0;color:var(--dsw-alias-label-tertiary,#6b6b6b);font-size:11px;line-height:16px}
.wss-keywords{list-style:none;margin:0;padding:0;display:flex;flex-direction:column;gap:4px}
.wss-keyword-row{display:flex;align-items:center;gap:6px;box-sizing:border-box;width:100%;border:.5px solid transparent;border-radius:7px;background:transparent;color:inherit;font:inherit;padding:4px 6px;cursor:pointer;text-align:left;min-width:0}
.wss-keyword-row:hover{background:var(--dsw-alias-interactive-bg-hover,rgba(127,127,127,.08));border-color:var(--dsw-alias-border-l1)}
.wss-keyword-rank{flex:none;width:18px;color:var(--dsw-alias-label-tertiary,#6b6b6b);font-size:10px;font-variant-numeric:tabular-nums;text-align:right}
.wss-keyword-main{flex:1;min-width:0;display:flex;flex-direction:column;gap:3px}
.wss-keyword-text{overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:12px}
.wss-keyword-track{display:block;height:3px;border-radius:999px;background:var(--dsw-alias-bg-layer-3)}
.wss-keyword-fill{display:block;height:100%;border-radius:999px;background:var(--dsw-static-deepseek-600,#3568d9);opacity:.7}
.wss-keyword-count{flex:none;color:var(--dsw-alias-label-secondary);font-size:11px;font-variant-numeric:tabular-nums}
.wss-keyword-share{flex:none;width:44px;text-align:right;color:var(--dsw-alias-label-tertiary,#6b6b6b);font-size:11px;font-variant-numeric:tabular-nums}
.wss-hint{margin:0;color:var(--dsw-alias-label-tertiary,#6b6b6b);font-size:10px;line-height:15px}
.wss-foot{display:flex;justify-content:space-between;gap:8px;flex-wrap:wrap;margin:0;color:var(--dsw-alias-label-tertiary,#6b6b6b);font-size:10px}
.wss-sr{position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0}
.wss-page :focus-visible{outline:var(--dsw-focus-ring-width) solid var(--dsw-focus-ring-color,var(--dsw-alias-state-business-primary));outline-offset:1px}
@media (max-width:420px){.wss-metrics{grid-template-columns:1fr}}
@media (prefers-reduced-motion:reduce){.wss-progress{animation-duration:6s}}
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
      // Citation state wins when a source is both cited and fetched; a fetched
      // page with no citation of its own is reported as "may have read".
      const status = source.cited
        ? t("panel.cited")
        : source.fetched === true
          ? t("panel.fetched")
          : t("panel.notCited")
      const score = typeof source.rerankScore === "number" ? ` · score ${source.rerankScore}` : ""
      const authority = typeof source.authority === "string" && source.authority !== "" ? ` · ${source.authority}` : ""
      return `${title} · ${status}${score}${authority}`
    }

    /** Site icon with two graceful fallbacks: provider icon → favicon → initial. */
    function SiteIcon({ source, t }) {
      const [failed, setFailed] = React.useState(false)
      const src = typeof source.icon === "string" && source.icon !== "" ? source.icon : faviconOf(source.url)
      if (src === "" || failed) {
        return h(
          "span",
          { className: "wsl-icon wsl-icon-fallback", title: iconTitle(source, t), "aria-hidden": "true" },
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

    /**
     * Pick up to five fetched-page icons for a fetch-only turn-tail row.
     *
     * These pages came from `web_fetch` rather than a search result, so they
     * carry no provider icon or citation state; `SiteIcon` falls back to the
     * host favicon and then to the host initial. Multiple pages from one host
     * share that favicon, so only the first page per host is kept.
     */
    function fetchIconSources(entry) {
      const fetches = Array.isArray(entry.fetches) ? entry.fetches : []
      const seen = new Set()
      const picked = []
      for (const fetch of fetches) {
        if (!fetch || typeof fetch.url !== "string" || fetch.url === "") continue
        const host = hostOf(fetch.url)
        if (seen.has(host)) continue
        seen.add(host)
        picked.push({ url: fetch.url, title: "", fetched: true })
        if (picked.length === 5) break
      }
      return picked
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
        warn: [
          h("path", { key: 1, d: "M8 2.2l6 10.6H2z" }),
          h("path", { key: 2, d: "M8 6v3.2" }),
          h("path", { key: 3, d: "M8 11.3v.2" }),
        ],
      }
      return h("svg", common, paths[kind] ?? [])
    }

    /** One compact "icon + count" statistic; `title`, when given, is its accessible text. */
    function Stat({ kind, count, title }) {
      return h(
        "span",
        { className: "wsl-stat" },
        h(
          "span",
          { className: "wsl-stat-visual", "aria-hidden": "true" },
          h(StatIcon, { kind }),
          h("span", { className: "wsl-stat-count" }, String(count)),
        ),
        title !== undefined ? h("span", { className: "wsl-sr" }, title) : null,
      )
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
            ? h(
                "span",
                { className: "wsl-status-icon wsl-status-cited wsl-status-at", title: t("panel.cited") },
                h("span", { "aria-hidden": "true" }, "@"),
                h("span", { className: "wsl-sr" }, t("panel.cited")),
              )
            : null,
        ),
        slot(
          source.fetched
            ? h(
                "span",
                { className: "wsl-status-icon wsl-status-fetched", title: t("panel.fetched") },
                h(StatIcon, { kind: "eye" }),
                h("span", { className: "wsl-sr" }, t("panel.fetched")),
              )
            : null,
        ),
      )
    }

    /** Compact fetch outcome: check/x icon plus the numeric HTTP status code. */
    function FetchStatus({ statusCode, t }) {
      const ok = statusCode >= 200 && statusCode < 400
      const label = ok
        ? t("panel.httpSuccess", { code: statusCode })
        : t("panel.httpFailure", { code: statusCode })
      return h(
        "span",
        {
          className: `wsl-fetch-status ${ok ? "wsl-fetch-ok" : "wsl-fetch-err"}`,
          title: label,
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
        h("span", { "aria-hidden": "true" }, String(statusCode)),
        h("span", { className: "wsl-sr" }, label),
      )
    }

    /** One fetched page row, shared by the flat and domain-grouped renderings. */
    function FetchRow({ fetch, t }) {
      return h(
        "li",
        { className: "wsl-fetch" },
        h("a", { href: fetch.url, target: "_blank", rel: "noreferrer", title: fetch.url }, fetch.url),
        fetch.failed === true
          ? h(
              "span",
              { className: "wsl-fetch-status wsl-fetch-err", title: t("panel.fetchFailed") },
              t("panel.fetchFailed"),
            )
          : typeof fetch.statusCode === "number"
            ? h(FetchStatus, { statusCode: fetch.statusCode, t })
            : null,
      )
    }

    /** Source filters offered above the panel body. */
    const SOURCE_FILTERS = ["all", "cited", "uncited", "fetched"]

    /** Locale key for one filter kind (`all` → `panel.filterAll`). */
    function filterLabelKey(kind) {
      return `panel.filter${kind[0].toUpperCase()}${kind.slice(1)}`
    }

    /**
     * Arrow/Home/End navigation for a segmented radio group. Selecting from
     * the keyboard also activates the option, matching native radio groups.
     */
    function radioKeyDown(event) {
      const keys = ["ArrowRight", "ArrowDown", "ArrowLeft", "ArrowUp", "Home", "End"]
      if (!keys.includes(event.key)) return
      const buttons = Array.from(
        event.currentTarget.parentElement?.querySelectorAll('[role="radio"]') ?? [],
      )
      if (buttons.length === 0) return
      event.preventDefault()
      const current = buttons.indexOf(event.currentTarget)
      let next = current
      if (event.key === "Home") next = 0
      else if (event.key === "End") next = buttons.length - 1
      else if (event.key === "ArrowRight" || event.key === "ArrowDown") {
        next = (current + 1) % buttons.length
      } else {
        next = (current - 1 + buttons.length) % buttons.length
      }
      const target = buttons[next]
      target.focus()
      target.click()
    }

    /** Horizontal roving focus for the statistics view tabs. */
    function tabKeyDown(event) {
      const keys = ["ArrowRight", "ArrowLeft", "Home", "End"]
      if (!keys.includes(event.key)) return
      const buttons = Array.from(
        event.currentTarget.parentElement?.querySelectorAll('[role="tab"]') ?? [],
      )
      if (buttons.length === 0) return
      event.preventDefault()
      const current = buttons.indexOf(event.currentTarget)
      let next
      if (event.key === "Home") next = 0
      else if (event.key === "End") next = buttons.length - 1
      else if (event.key === "ArrowRight") next = (current + 1) % buttons.length
      else next = (current - 1 + buttons.length) % buttons.length
      const target = buttons[next]
      target.focus()
      target.click()
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
        "li",
        { className: "wsl-source" },
        h(SiteIcon, { source, t }),
        h(
          "a",
          {
            className: "wsl-source-title",
            href: source.url,
            target: "_blank",
            rel: "noreferrer",
            title: source.title ? `${source.title} — ${source.url}` : source.url,
          },
          source.title || hostOf(source.url),
        ),
        h("span", { className: "wsl-source-host", title: hostOf(source.url) }, hostOf(source.url)),
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
    function TurnCard({ entry, turn, t, filter = "all", groupMode = "flat", searchQuery = "" }) {
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
      const fetchCount = typeof entry.fetchCount === "number" ? entry.fetchCount : 0
      const fetchOnly = entry.searchCalls === 0 && entry.cited === 0
      const hasSearchStats = entry.searchCalls > 0 || entry.cited > 0 || entry.returned > 0
      const turnSummary = t("panel.turnSummary", {
        cited: entry.cited,
        local: entry.local,
        returned: entry.returned,
      })
      const allSources = Array.isArray(entry.sources) ? entry.sources : []
      const filteredSources = filterSources(allSources, filter)
      // Keyword search matches against the source title, URL, and host. The
      // turn's own queries are also checked so a remembered keyword surfaces
      // every result it produced.
      const needle = searchQuery.trim().toLowerCase()
      const queryText = queries.join(" ").toLowerCase()
      const sources =
        needle === ""
          ? filteredSources
          : filteredSources.filter((source) => {
              const title = typeof source.title === "string" ? source.title.toLowerCase() : ""
              const url = typeof source.url === "string" ? source.url.toLowerCase() : ""
              const host = hostOf(url).toLowerCase()
              return title.includes(needle) || url.includes(needle) || host.includes(needle) || queryText.includes(needle)
            })
      const filteredOut = allSources.length - sources.length
      const allFetches = Array.isArray(entry.fetches) ? entry.fetches : []
      const failedFetches = Array.isArray(entry.failedFetches) ? entry.failedFetches : []
      const allFetchRows = [
        ...allFetches.map((fetch) => ({ ...fetch, failed: false })),
        ...failedFetches.map((fetch) => ({ ...fetch, failed: true })),
      ]
      // "cited" means "search sources cited in the answer"; a directly fetched
      // page is not one of them, so that filter hides the fetch list as well.
      const baseFetchRows = filter === "cited" ? [] : allFetchRows
      const visibleFetchRows =
        needle === ""
          ? baseFetchRows
          : baseFetchRows.filter((fetch) => {
              const url = typeof fetch.url === "string" ? fetch.url.toLowerCase() : ""
              return url.includes(needle) || hostOf(url).toLowerCase().includes(needle) || queryText.includes(needle)
            })
      const hiddenFetches = allFetchRows.length - visibleFetchRows.length
      const fetchGroups = groupMode === "domain" ? groupSourcesByHost(visibleFetchRows) : null
      const showStatus = sources.some((source) => source.cited || source.fetched)
      const shown = allSources.length
      const hidden = typeof entry.sourceCount === 'number' ? Math.max(0, entry.sourceCount - shown) : 0
      const sourceList =
        groupMode === "domain"
          ? h(
              "ul",
              { className: "wsl-sources", role: "list" },
              groupSourcesByHost(sources).map(([host, items]) =>
                h(
                  "li",
                  { className: "wsl-group", key: host },
                  h(
                    "h4",
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
                    "ul",
                    { className: "wsl-group-sources", role: "list" },
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
              "ul",
              { className: "wsl-sources", role: "list" },
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
          h("h3", { className: "wsl-card-title", tabIndex: -1 }, t("panel.turnLabel", { turn })),
          h(
            "span",
            { className: "wsl-muted" },
            fetchOnly
              ? fetchCount > 0
                ? t("panel.fetches", { count: fetchCount })
                : t("panel.fetchFailedCount", { count: entry.failedFetchCount ?? 0 })
              : t("panel.searches", { count: entry.searchCalls }),
          ),
          hasSearchStats
            ? h(
                "div",
                { className: "wsl-stats", title: turnSummary },
                h("span", { className: "wsl-sr" }, turnSummary),
                h(Stat, { kind: "link", count: entry.cited }),
                h(Stat, { kind: "target", count: entry.local }),
                h(Stat, { kind: "list", count: entry.returned }),
              )
            : null,
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
                folded
                  ? h(
                      "button",
                      {
                        // One stable element: expanding must not replace the
                        // focused button with a new node and drop focus.
                        key: "queries-toggle",
                        type: "button",
                        className: "wsl-queries-toggle",
                        "aria-expanded": queriesExpanded ? "true" : "false",
                        title: queriesExpanded
                          ? undefined
                          : t("panel.moreQueries", { count: layout.hidden }),
                        "aria-label": queriesExpanded
                          ? undefined
                          : t("panel.moreQueries", { count: layout.hidden }),
                        onClick: () => setQueriesExpanded((value) => !value),
                      },
                      queriesExpanded ? t("panel.collapseQueries") : `+${layout.hidden}`,
                    )
                  : null,
              ),
            )
          : null,
        sources.length > 0 ? sourceList : null,
        needle !== "" && sources.length === 0 && visibleFetchRows.length === 0
          ? h("div", { className: "wsl-empty" }, t("panel.noMatches"))
          : null,
        filteredOut > 0
          ? h("div", { className: "wsl-muted" }, t("panel.filteredOut", { count: filteredOut }))
          : null,
        hidden > 0 ? h("div", { className: "wsl-muted" }, t("panel.moreSources", { count: hidden })) : null,
        visibleFetchRows.length > 0
          ? h(
              "div",
              { className: "wsl-fetches" },
              h("div", { className: "wsl-muted" }, t("panel.fetchesTitle")),
              h(
                "ul",
                { className: "wsl-fetch-list", role: "list" },
                fetchGroups
                  ? fetchGroups.map(([host, items]) =>
                      h(
                        "li",
                        { className: "wsl-fetch-group", key: host },
                        h(
                          "h4",
                          { className: "wsl-fetch-group-head" },
                          h("span", null, host),
                          h(
                            "span",
                            { className: "wsl-muted" },
                            t(
                              items.some((item) => item.failed === true)
                                ? "panel.fetchGroupCount"
                                : "panel.fetches",
                              { count: items.length },
                            ),
                          ),
                        ),
                        h(
                          "ul",
                          { className: "wsl-fetch-group-sources", role: "list" },
                          items.map((fetch, index) =>
                            h(FetchRow, { key: `${index}:${fetch.url}`, fetch, t }),
                          ),
                        ),
                      ),
                    )
                  : visibleFetchRows.map((fetch, index) =>
                      h(FetchRow, { key: `${index}:${fetch.url}`, fetch, t }),
                    ),
              ),
            )
          : null,
        hiddenFetches > 0
          ? h("div", { className: "wsl-muted" }, t("panel.fetchesFilteredOut", { count: hiddenFetches }))
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
      const fetchEntry = React.useSyncExternalStore(subscribeFetchEntry, getFetchEntryEnabled)
      if (entry === null || sessionCited === null) return null

      const fetchCount = typeof entry.fetchCount === "number" ? entry.fetchCount : 0
      const failedFetchCount = typeof entry.failedFetchCount === "number" ? entry.failedFetchCount : 0
      const searchActivity = entry.searchCalls > 0 || entry.cited > 0
      // A turn that only fetched pages is still a networked answer: keep its
      // entry so the fetched-page list stays reachable. Only turns with no
      // search, no citation, and no fetch activity stay invisible; the
      // settings switch can hide fetch-only entries on top of that.
      if (!searchActivity && fetchCount === 0 && failedFetchCount === 0) return null
      if (!searchActivity && fetchEntry === false) return null

      const parts = searchActivity
        ? [t("entry.cited", { count: entry.cited }), t("entry.session", { count: sessionCited })]
        : []
      if (!searchActivity) {
        if (fetchCount > 0) parts.push(t("entry.fetched", { count: fetchCount }))
        if (failedFetchCount > 0) parts.push(t("entry.fetchFailed", { count: failedFetchCount }))
      }
      if (searchActivity && entry.cited === 0 && entry.searchCalls > 0) {
        parts.push(t("entry.returned", { count: entry.returned }))
      }
      if (searchActivity && fetchCount > 0) {
        parts.push(t("entry.fetched", { count: fetchCount }))
      }
      if (searchActivity && failedFetchCount > 0) {
        parts.push(t("entry.fetchFailed", { count: failedFetchCount }))
      }
      const sources = searchActivity ? iconSources(entry) : fetchIconSources(entry)
      return h(
        "button",
        {
          type: "button",
          className: "wsl-entry",
          title: searchActivity
            ? t("entry.tooltip", { local: entry.local })
            : t("entry.tooltipFetched"),
          "aria-label": `${parts.join(" · ")} · ${t("panel.openHint")}`,
          onClick: () => openPanel(turn.turn),
        },
        h(
          "span",
          { className: "wsl-entry-icons" },
          sources.map((source, index) =>
            h(SiteIcon, { key: `${index}:${source.url}`, source, t }),
          ),
        ),
        h("span", { className: "wsl-entry-text", title: parts.join(" · ") }, parts.join(" · ")),
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
      const [searchQuery, setSearchQuery] = React.useState("")
      const [panelNotice, setPanelNotice] = React.useState("")
      const panelRef = React.useRef(null)
      const bodyRef = React.useRef(null)
      const [gutter, setGutter] = React.useState(0)

      React.useEffect(() => {
        if (focusTurn !== undefined) {
          setMode("turn")
          setSelectedTurn(focusTurn)
        }
      }, [navigation.revision, focusTurn])

      React.useEffect(() => {
        const body = bodyRef.current
        if (body === null) return undefined
        const measure = () => setGutter(body.offsetWidth - body.clientWidth)
        measure()
        if (typeof ResizeObserver === "undefined") return undefined
        const observer = new ResizeObserver(measure)
        observer.observe(body)
        return () => observer.disconnect()
      }, [])

      // React registers `wheel` as a passive listener, so preventDefault() in
      // an onWheel handler is ignored. Register natively with passive:false so
      // a wheel over the fixed chrome scrolls the body without also scrolling
      // the page behind the sidebar.
      React.useEffect(() => {
        const panel = panelRef.current
        if (panel === null) return undefined
        const forwardWheel = (event) => {
          const body = bodyRef.current
          if (body === null || event.deltaY === 0 || body.contains(event.target)) return
          // Firefox reports wheel deltas in lines (deltaMode 1) rather than
          // pixels; scaling by the line height keeps it from barely moving.
          const lineHeight = Number.parseFloat(getComputedStyle(body).lineHeight) || 16
          const unit = event.deltaMode === 1 ? lineHeight : event.deltaMode === 2 ? body.clientHeight : 1
          const before = body.scrollTop
          body.scrollTop = before + event.deltaY * unit
          if (body.scrollTop !== before) event.preventDefault()
        }
        panel.addEventListener("wheel", forwardWheel, { passive: false })
        return () => panel.removeEventListener("wheel", forwardWheel)
      }, [])

      // Only a scope or turn change moves the reader: filtering and grouping
      // re-order rows in place, so keeping the scroll position avoids losing
      // the row the user was looking at.
      React.useEffect(() => {
        const body = bodyRef.current
        if (body !== null) body.scrollTop = 0
      }, [mode, selectedTurn])

      if (stats === undefined || stats === null || stats.v !== 1) {
        return h(
          "div",
          { className: "wsl-panel", ref: panelRef },
          h("div", { className: "wsl-empty" }, t("panel.unavailable")),
        )
      }

      const turnKeys = Object.keys(stats.turns ?? {}).sort((left, right) => Number(right) - Number(left))
      const latestTurn = turnKeys.length > 0 ? Number(turnKeys[0]) : undefined
      const activeTurn = selectedTurn ?? focusTurn ?? latestTurn
      const activeEntry = activeTurn === undefined ? undefined : stats.turns[String(activeTurn)]
      const fetched = stats.session.fetched ?? 0
      const fetchFailed = stats.session.fetchFailed ?? 0
      // Zero counters are not information: a fetch-only session would otherwise
      // show four trailing zeros next to its page count.
      const sessionStats = [
        { kind: "link", count: stats.session.cited },
        { kind: "repeat", count: stats.session.occurrences },
        { kind: "list", count: stats.session.returned },
        { kind: "search", count: stats.session.searches },
        { kind: "page", count: fetched },
        { kind: "warn", count: fetchFailed },
      ].filter((item) => item.count > 0)
      const hasSearchTotals =
        stats.session.cited > 0 ||
        stats.session.occurrences > 0 ||
        stats.session.returned > 0 ||
        stats.session.searches > 0
      const summary = [
        hasSearchTotals
          ? t("panel.summary", {
              cited: stats.session.cited,
              occurrences: stats.session.occurrences,
              returned: stats.session.returned,
              searches: stats.session.searches,
            })
          : "",
        fetched > 0 ? t("panel.fetchedSummary", { count: fetched }) : "",
        fetchFailed > 0 ? t("panel.fetchFailedSummary", { count: fetchFailed }) : "",
      ]
        .filter((part) => part !== "")
        .join(" · ")

      return h(
        "div",
        { className: "wsl-panel", ref: panelRef, role: "region", "aria-label": t("panel.title") },
        h(
          "div",
          { className: "wsl-chrome", style: gutter > 0 ? { paddingRight: gutter } : undefined },
          sessionStats.length > 0
            ? h(
                "div",
                { className: "wsl-head" },
                h("h2", { className: "wsl-sr" }, t("panel.title")),
                h(
                  "div",
                  { className: "wsl-stats", title: summary },
                  h("span", { className: "wsl-sr" }, summary),
                  sessionStats.map((item) => h(Stat, { key: item.kind, kind: item.kind, count: item.count })),
                ),
              )
            : h("h2", { className: "wsl-sr" }, t("panel.title")),
          h(
            "div",
            { className: "wsl-toolbar" },
            h(
              "div",
              { className: "wsl-search", role: "search" },
              h("label", { className: "wsl-sr", htmlFor: "wsl-search-input" }, t("panel.searchSources")),
              h("input", {
                id: "wsl-search-input",
                type: "search",
                className: "wsl-search-input",
                value: searchQuery,
                placeholder: t("panel.searchPlaceholder"),
                "aria-label": t("panel.searchSources"),
                onChange: (event) => {
                  const next = event.target.value
                  setSearchQuery(next)
                  if (next !== "") setPanelNotice(t("panel.searchResults", { count: "…" }))
                },
                onKeyDown: (event) => {
                  if (event.key === "Escape" && searchQuery !== "") {
                    setSearchQuery("")
                    event.target.focus()
                  }
                },
              }),
              searchQuery !== ""
                ? h(
                    "button",
                    {
                      type: "button",
                      className: "wsl-search-clear",
                      "aria-label": t("panel.searchClear"),
                      title: t("panel.searchClear"),
                      onClick: () => setSearchQuery(""),
                    },
                    "×",
                  )
                : null,
            ),
            h(
              "div",
              { className: "wsl-seg wsl-scope", role: "radiogroup", "aria-label": t("panel.scopeGroup") },
              h(
                "button",
                {
                  type: "button",
                  role: "radio",
                  "aria-checked": mode === "turn" ? "true" : "false",
                  tabIndex: mode === "turn" ? 0 : -1,
                  onKeyDown: radioKeyDown,
                  onClick: () => {
                    setMode("turn")
                    setPanelNotice(t("panel.modeChanged", { mode: t("panel.turnMode") }))
                  },
                },
                t("panel.turnMode"),
              ),
              h(
                "button",
                {
                  type: "button",
                  role: "radio",
                  "aria-checked": mode === "session" ? "true" : "false",
                  tabIndex: mode === "session" ? 0 : -1,
                  onKeyDown: radioKeyDown,
                  onClick: () => {
                    setMode("session")
                    setPanelNotice(t("panel.modeChanged", { mode: t("panel.sessionMode") }))
                  },
                },
                t("panel.sessionMode"),
              ),
            ),
            h(
              "div",
              { className: "wsl-seg wsl-filter", role: "radiogroup", "aria-label": t("panel.filterGroup") },
              SOURCE_FILTERS.map((kind) =>
                h(
                  "button",
                  {
                    key: kind,
                    type: "button",
                    role: "radio",
                    "aria-checked": sourceFilter === kind ? "true" : "false",
                    tabIndex: sourceFilter === kind ? 0 : -1,
                    onKeyDown: radioKeyDown,
                    onClick: () => {
                      setSourceFilter(kind)
                      setPanelNotice(
                        t("panel.filterChanged", { filter: t(filterLabelKey(kind)) }),
                      )
                    },
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
                "aria-pressed": groupMode === "domain" ? "true" : "false",
                title: t("panel.groupByDomain"),
                "aria-label": t("panel.groupByDomain"),
                onClick: () => {
                  const next = groupMode === "domain" ? "flat" : "domain"
                  setGroupMode(next)
                  setPanelNotice(t(next === "domain" ? "panel.groupedOn" : "panel.groupedOff"))
                },
              },
              h(StatIcon, { kind: "grid" }),
            ),
          ),
        ),
        h(
          "p",
          { className: "wsl-sr", role: "status", "aria-live": "polite", "aria-atomic": "true" },
          panelNotice,
        ),
        h(
          "div",
          { className: "wsl-body", ref: bodyRef },
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
                    searchQuery,
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
                        searchQuery,
                      }),
                    ),
                  turnKeys.length > visibleTurns
                    ? h(
                        "button",
                        {
                          type: "button",
                          className: "wsl-more",
                          onClick: () => {
                            const next = Math.min(visibleTurns + PANEL_TURNS_PAGE, turnKeys.length)
                            setVisibleTurns(next)
                            setPanelNotice(t("panel.loadedMore", { count: next }))
                            // The last page removes the button itself, so move
                            // focus to the first newly revealed turn instead of
                            // letting it fall back to <body>.
                            if (next < turnKeys.length) return
                            const firstNew = turnKeys[visibleTurns]
                            const focusFirstNew = () => {
                              const heading = bodyRef.current?.querySelector(
                                `[data-turn="${firstNew}"] .wsl-card-title`,
                              )
                              if (heading !== null && heading !== undefined) heading.focus()
                            }
                            if (typeof requestAnimationFrame === "function") {
                              requestAnimationFrame(focusFirstNew)
                            } else {
                              setTimeout(focusFirstNew, 0)
                            }
                          },
                        },
                        t("panel.loadMore", { count: turnKeys.length - visibleTurns }),
                      )
                    : null,
                ),
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
      "statsPanel",
      "fetchEntry",
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
        booleanSpec("statsPanel", true),
        booleanSpec("fetchEntry", true),
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
        statsPanel: form.field("statsPanel"),
        fetchEntry: form.field("fetchEntry"),
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
            h(uiPrimitives().Switch, {
              id,
              checked,
              label,
              disabled,
              "aria-describedby": `${id}-hint`,
              onChange: onToggle,
            }),
          ),
        ),
        h("p", { className: "wsi-hint", id: `${id}-hint` }, hint),
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
      // A save gives no visible acknowledgement on its own: the button simply
      // stops being disabled. Announce the transition so the outcome is clear.
      const [saveNotice, setSaveNotice] = React.useState("")
      const wasSaving = React.useRef(false)
      React.useEffect(() => {
        if (state.saving) {
          wasSaving.current = true
          return
        }
        if (!wasSaving.current) return
        wasSaving.current = false
        setSaveNotice(!state.failed && !state.dirty ? "saved" : "")
      }, [state.saving, state.failed, state.dirty])
      React.useEffect(() => {
        if (state.dirty) setSaveNotice("")
      }, [state.dirty])
      // Leaving the page reloads or discards the staged draft. In-app
      // navigation still needs a Host hook; this at least protects tab close.
      React.useEffect(() => {
        if (!state.dirty || typeof window === "undefined" || typeof window.addEventListener !== "function") {
          return undefined
        }
        const warn = (event) => {
          event.preventDefault()
          event.returnValue = ""
        }
        window.addEventListener("beforeunload", warn)
        return () => window.removeEventListener("beforeunload", warn)
      }, [state.dirty])
      // Reset-all clears every stored override, so it takes a second click on
      // the same button (focus never leaves it) rather than firing on one.
      const [resetState, setResetState] = React.useState("")
      const formRef = React.useRef(null)
      const resetAllRef = React.useRef(null)
      const cancelReset = () => {
        setResetState("")
        resetAllRef.current?.focus()
      }
      const confirmReset = () => {
        setResetState("")
        onResetAll()
        const focusNext = () => {
          const next = formRef.current?.querySelector(
            "button:not(:disabled), input:not(:disabled), select:not(:disabled)",
          )
          if (next !== null && next !== undefined) next.focus()
        }
        if (typeof requestAnimationFrame === "function") requestAnimationFrame(focusNext)
        else setTimeout(focusNext, 0)
      }
      if (!state.available) {
        return h("p", { className: "wsi-unavailable", role: "status" }, labels.unavailable)
      }
      const saveDisabled = !state.dirty || state.invalid || state.saving
      return h(
        "div",
        { className: "wsi-form", ref: formRef },
        state.writable ? null : h("p", { className: "wsi-readonly", role: "status" }, labels.readOnly),
        children,
        h(
          "div",
          { className: "wsi-footer" },
          state.failed
            ? h("p", { className: "wsi-failed", role: "status" }, labels.saveFailed)
            : saveNotice === "saved"
              ? h("p", { className: "wsi-saved", role: "status" }, labels.saved)
              : null,
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
                ref: resetAllRef,
                title: resetDisabled || resetState === "confirm" ? undefined : labels.resetAllHint,
                disabled: resetDisabled,
                onClick: resetState === "confirm" ? confirmReset : () => setResetState("confirm"),
              },
              resetState === "confirm" ? labels.resetAllConfirm : labels.resetAll,
            ),
            resetState === "confirm"
              ? h(
                  "button",
                  { type: "button", className: "wsi-reset-all", onClick: cancelReset },
                  labels.cancel,
                )
              : null,
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

    /** Date-only format for provider timestamps; the raw value stays in `title`. */
    const QUICK_SEARCH_DATE = new Intl.DateTimeFormat(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    })

    /**
     * Format a provider `publishedAt` for display. Unparseable values stay
     * verbatim so a non-ISO provider string never becomes "Invalid Date".
     */
    function quickSearchDate(value) {
      if (typeof value !== "string" || value === "") return ""
      // A date-only provider value is a calendar date, not an instant:
      // `new Date("2026-01-02")` parses as UTC midnight and drifts a day west
      // of UTC. Parse it as local midnight instead.
      const date = /^\d{4}-\d{2}-\d{2}$/.test(value)
        ? new Date(`${value}T00:00:00`)
        : new Date(value)
      return Number.isNaN(date.getTime()) ? value : QUICK_SEARCH_DATE.format(date)
    }

    /** Render one result row: linked title, URL, optional snippet, optional date. */
    function QuickSearchResult({ source, index, t }) {
      const title = typeof source.title === "string" && source.title !== "" ? source.title : hostOf(source.url)
      const [snippetOpen, setSnippetOpen] = React.useState(false)
      const snippet = typeof source.snippet === "string" ? source.snippet : ""
      const longSnippet = snippet.length > RESULT_SNIPPET_PREVIEW_CHARS
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
        snippet !== ""
          ? h(
              React.Fragment,
              null,
              h(
                "p",
                { className: snippetOpen ? "wsq-result-snippet" : "wsq-result-snippet wsq-clamped" },
                snippet,
              ),
              longSnippet
                ? h(
                    "button",
                    {
                      type: "button",
                      className: "wsq-snippet-toggle",
                      "aria-expanded": snippetOpen ? "true" : "false",
                      onClick: () => setSnippetOpen((value) => !value),
                    },
                    snippetOpen ? t("quick.collapseSnippet") : t("quick.expandSnippet"),
                  )
                : null,
            )
          : null,
        typeof source.publishedAt === "string" && source.publishedAt !== ""
          ? h(
              "time",
              { className: "wsq-result-date", dateTime: source.publishedAt, title: source.publishedAt },
              quickSearchDate(source.publishedAt),
            )
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
      // Per-instance ids keep labels and descriptions wired even if the view
      // is ever mounted twice (split panes, previews).
      const uid = React.useId()
      const queryId = `wsq-query-${uid}`
      const limitId = `wsq-limit-${uid}`
      const historyId = `wsq-history-${uid}`
      const queryErrorId = `wsq-query-error-${uid}`
      const [history, setHistory] = React.useState(readQuickSearchHistory)
      const [showHistory, setShowHistory] = React.useState(false)
      const [validation, setValidation] = React.useState("")
      const [clearState, setClearState] = React.useState("idle")
      const [historyNotice, setHistoryNotice] = React.useState("")
      // Alternating a zero-width space makes an identical repeat announce again
      // without changing the visible text.
      const [announceVersion, setAnnounceVersion] = React.useState(0)
      const inputRef = React.useRef(null)
      const historyToggleRef = React.useRef(null)
      const confirmClearRef = React.useRef(null)
      const clearButtonRef = React.useRef(null)
      const restoreClearFocus = React.useRef(false)
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

      // A two-step inline confirmation replaces the destructive action, so the
      // confirm button receives focus instead of the list vanishing under it.
      React.useEffect(() => {
        if (clearState === "confirm") {
          confirmClearRef.current?.focus()
        } else if (clearState === "idle" && restoreClearFocus.current) {
          // Cancelling re-renders the original button; focus it, not the
          // unrelated history toggle above.
          restoreClearFocus.current = false
          clearButtonRef.current?.focus()
        }
      }, [clearState])

      const run = async (rawQuery, nextLimit) => {
        const nextQuery = String(rawQuery ?? "").trim()
        if (nextQuery === "") return
        setValidation("")
        setHistoryNotice("")
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
          setAnnounceVersion((value) => value + 1)
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
          setAnnounceVersion((value) => value + 1)
        }
      }

      const submit = (event) => {
        event.preventDefault()
        if (state.query.trim() === "") {
          setValidation(t("quick.queryRequired"))
          inputRef.current?.focus()
          return
        }
        setValidation("")
        run(state.query, state.limit)
      }

      const cancel = () => {
        const key = quickViewKey(sessionId)
        quickViewAborts.get(key)?.abort()
        quickViewAborts.delete(key)
        updateQuickViewState(sessionId, { status: "idle", message: "" })
      }

      // Changing the result limit only stages the choice: a `<select>` change
      // must not submit the search by itself, so the user re-runs it explicitly.
      const changeLimit = (next) => {
        updateQuickViewState(sessionId, { limit: next })
      }

      const chooseHistory = (item) => {
        const nextLimit = QUICK_SEARCH_LIMITS.includes(item.limit) ? item.limit : state.limit
        updateQuickViewState(sessionId, { query: item.query })
        run(item.query, nextLimit)
      }

      const confirmClear = () => {
        setHistory(clearQuickSearchHistory())
        setHistoryNotice(t("quick.historyCleared"))
        setAnnounceVersion((value) => value + 1)
        setClearState("idle")
        inputRef.current?.focus()
      }

      const cancelClear = () => {
        restoreClearFocus.current = true
        setClearState("idle")
      }

      // Only outcomes are announced: the visible "searching" text is an
      // interstitial state, and the live region stays mounted so a completed
      // search or a failure never updates a node that was just replaced.
      const announcement =
        state.status === "error"
          ? t("quick.errorAnnounce", { message: state.message })
          : state.status === "ready"
            ? state.sources.length === 0
              ? t("quick.noResults")
              : state.truncated
                ? t("quick.truncated", { count: state.sources.length })
                : t("quick.resultsAnnounce", { count: state.sources.length })
            : ""
      const liveMessage = historyNotice !== "" ? historyNotice : announcement
      const repeatSuffix =
        announceVersion % 2 === 1 ? String.fromCharCode(0x200b) : ""
      const liveText = liveMessage === "" ? "" : `${liveMessage}${repeatSuffix}`

      // Keep the previous results visible while a new search is in flight, so
      // the layout and reading position do not collapse on every submission.
      const results =
        state.sources.length > 0
          ? h(
              "div",
              { className: "wsq-results-wrap" },
              h(
                "ul",
                { className: "wsq-results", role: "list" },
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
          : null

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
                    "aria-controls": historyId,
                    ref: historyToggleRef,
                    onClick: () => setShowHistory((value) => !value),
                  },
                  `${t("quick.history")} (${history.length})`,
                )
              : null,
          ),
        ),
        h(
          "search",
          null,
          h(
            "form",
            { className: "wsq-form", noValidate: true, onSubmit: submit },
            h("label", { className: "wsl-sr", htmlFor: queryId }, t("quick.inputLabel")),
            h("input", {
              id: queryId,
              name: "query",
              className: "wsq-input",
              type: "search",
              value: state.query,
              placeholder: t("quick.placeholder"),
              required: true,
              "aria-invalid": validation !== "" ? "true" : undefined,
              "aria-describedby": validation !== "" ? queryErrorId : undefined,
              autoCorrect: "off",
              autoCapitalize: "none",
              spellCheck: false,
              enterKeyHint: "search",
              ref: inputRef,
              onChange: (event) => {
                if (validation !== "") setValidation("")
                updateQuickViewState(sessionId, { query: event.target.value })
              },
            }),
            h("label", { className: "wsl-sr", htmlFor: limitId }, t("quick.limit")),
            h(
              "span",
              { className: "wsq-select-wrap" },
              h(
                "select",
                {
                  id: limitId,
                  name: "limit",
                  className: "wsq-select",
                  value: String(state.limit),
                  disabled: state.status === "loading",
                  onChange: (event) => changeLimit(Number(event.target.value)),
                },
                QUICK_SEARCH_LIMITS.map((value) =>
                  h("option", { key: value, value: String(value) }, t("quick.limitOption", { count: value })),
                ),
              ),
              h(
                "span",
                { className: "wsq-select-icon", "aria-hidden": "true" },
                h("svg", { viewBox: "0 0 12 12" }, h("path", { d: "M2.5 4.5L6 8l3.5-3.5" })),
              ),
            ),
            h(
              "button",
              {
                className: "wsq-submit",
                type: "submit",
                disabled: state.status === "loading",
              },
              t("quick.search"),
            ),
          ),
        ),
        validation !== ""
          ? h(
              "p",
              { className: "wsq-status wsq-error", role: "alert", id: queryErrorId },
              validation,
            )
          : null,
        h(
          "p",
          {
            className: "wsl-sr",
            role: "status",
            "aria-live": "polite",
            "aria-atomic": "true",
          },
          liveText,
        ),
        history.length > 0
          ? h(
              "div",
              { className: "wsq-history", id: historyId, hidden: !showHistory },
              h(
                "div",
                { className: "wsq-history-head" },
                h("span", null, t("quick.history")),
                clearState === "confirm"
                  ? h(
                      "span",
                      {
                        className: "wsq-history-confirm",
                        role: "group",
                        "aria-label": t("quick.clearHistory"),
                      },
                      h(
                        "button",
                        {
                          className: "wsq-history-clear wsq-history-confirm-yes",
                          type: "button",
                          ref: confirmClearRef,
                          onClick: confirmClear,
                        },
                        t("quick.confirmClear"),
                      ),
                      h(
                        "button",
                        {
                          className: "wsq-history-clear",
                          type: "button",
                          onClick: cancelClear,
                        },
                        t("quick.cancel"),
                      ),
                    )
                  : h(
                      "button",
                      {
                        className: "wsq-history-clear",
                        type: "button",
                        ref: clearButtonRef,
                        onClick: () => setClearState("confirm"),
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
              "div",
              { className: "wsq-results-wrap", "aria-busy": "true" },
              h(
                "p",
                { className: "wsq-status" },
                h("progress", {
                  className: "wsq-progress",
                  "aria-label": t("quick.searching"),
                }),
                t("quick.searching"),
                h("button", { className: "wsq-cancel", type: "button", onClick: cancel }, t("quick.cancel")),
              ),
              results,
            )
          : state.status === "error"
            ? h("p", { className: "wsq-status wsq-error" }, state.message)
            : state.status === "ready"
              ? state.sources.length === 0
                ? h("p", { className: "wsq-status" }, t("quick.noResults"))
                : results
              : (results ??
                h(
                  "p",
                  { className: "wsq-status" },
                  history.length === 0 ? t("quick.empty") : t("quick.historyEmpty"),
                )),
      )
    }

    /** Format an ISO timestamp as local date+time for the log list. */
    const LOG_TIME = new Intl.DateTimeFormat(undefined, {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    })

    function logTime(value) {
      if (typeof value !== "string" || value === "") return ""
      const date = new Date(value)
      return Number.isNaN(date.getTime()) ? value : LOG_TIME.format(date)
    }

    /**
     * In-config audit log browser. Collapsed by default so the settings form
     * stays the primary surface; expanding fetches the latest page from the
     * same-origin route and renders records with keyword filtering.
     */
    function LogBrowser({ t }) {
      const [open, setOpen] = React.useState(false)
      const [records, setRecords] = React.useState([])
      const [total, setTotal] = React.useState(0)
      const [offset, setOffset] = React.useState(0)
      const [query, setQuery] = React.useState("")
      const [loading, setLoading] = React.useState(false)
      const [error, setError] = React.useState("")
      const [expanded, setExpanded] = React.useState(null)
      const limit = 50
      const aborted = React.useRef(false)

      const load = React.useCallback(
        (reset) => {
          const nextOffset = reset ? 0 : offset
          aborted.current = false
          setLoading(true)
          setError("")
          const params = new URLSearchParams({
            offset: String(nextOffset),
            limit: String(limit),
          })
          if (query.trim() !== "") params.set("q", query.trim())
          fetch(`${LOG_BROWSER_PATH}?${params.toString()}`, {
            headers: { [QUICK_SEARCH_HEADER]: "1" },
          })
            .then((response) => response.json())
            .then((payload) => {
              if (aborted.current) return
              if (payload?.ok) {
                const value = payload.value
                setRecords(reset ? value.records : [...records, ...value.records])
                setTotal(value.total)
                setOffset(nextOffset + value.records.length)
              } else {
                setError(payload?.error?.message ?? "unknown error")
              }
            })
            .catch((err) => {
              if (aborted.current) return
              setError(err instanceof Error ? err.message : String(err))
            })
            .finally(() => {
              if (!aborted.current) setLoading(false)
            })
        },
        [offset, query, records],
      )

      // Fetch the first page when the panel opens. A change to the keyword
      // resets the offset and reloads from the top.
      React.useEffect(() => {
        if (!open) return undefined
        load(true)
        return () => {
          aborted.current = true
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
      }, [open, query])

      const hasMore = offset < total

      return h(
        "div",
        { className: "wsl-log" },
        h(
          "div",
          { className: "wsl-log-head" },
          h(
            "div",
            null,
            h("h3", { className: "wsl-log-title" }, t("log.title")),
            h("p", { className: "wsl-log-desc" }, t("log.desc")),
          ),
          h(
            "div",
            { className: "wsl-log-actions" },
            h(
              "button",
              {
                type: "button",
                className: "wsl-log-toggle",
                onClick: () => setOpen((value) => !value),
                "aria-expanded": open ? "true" : "false",
              },
              open ? t("log.close") : t("log.open"),
            ),
          ),
        ),
        open
          ? h(
              React.Fragment,
              null,
              h(
                "div",
                { className: "wsl-log-search" },
                h("label", { className: "wsl-sr", htmlFor: "wsl-log-search" }, t("log.searchLabel")),
                h("input", {
                  id: "wsl-log-search",
                  type: "search",
                  className: "wsl-log-search-input",
                  placeholder: t("log.searchPlaceholder"),
                  value: query,
                  onChange: (event) => setQuery(event.target.value),
                  "aria-label": t("log.searchLabel"),
                }),
                h(
                  "button",
                  {
                    type: "button",
                    className: "wsl-log-refresh",
                    disabled: loading,
                    onClick: () => load(true),
                  },
                  t("log.refresh"),
                ),
              ),
              h(
                "div",
                { className: "wsl-log-meta" },
                total > 0 ? t("log.total", { count: total }) : null,
                loading ? t("log.loading") : null,
                error !== "" ? t("log.loadFailed", { message: error }) : null,
              ),
              records.length === 0 && !loading
                ? h("div", { className: "wsl-log-empty" }, query !== "" ? t("log.noMatches") : t("log.empty"))
                : h(
                    "ul",
                    { className: "wsl-log-list" },
                    records.map((record, index) => {
                      const callId = typeof record.callId === "string" ? record.callId : String(index)
                      const isSearch = record.tool === "web_search"
                      const isOpen = expanded === callId
                      const summary = isSearch
                        ? Array.isArray(record.queries)
                          ? record.queries.join(" · ")
                          : ""
                        : typeof record.url === "string"
                          ? record.url
                          : ""
                      return h(
                        "li",
                        { className: "wsl-log-row", key: callId },
                        h(
                          "div",
                          { className: "wsl-log-row-head" },
                          h("span", { className: "wsl-log-time" }, logTime(record.ts)),
                          h(
                            "span",
                            {
                              className: `wsl-log-tool ${isSearch ? "wsl-log-tool-search" : "wsl-log-tool-fetch"}`,
                            },
                            isSearch ? t("log.toolSearch") : t("log.toolFetch"),
                          ),
                          record.ok === false
                            ? h("span", { className: "wsl-log-status wsl-log-status-err" }, t("log.failed"))
                            : h("span", { className: "wsl-log-status wsl-log-status-ok" }, t("log.ok")),
                          h("span", { className: "wsl-log-summary", title: summary }, summary),
                          h(
                            "button",
                            {
                              type: "button",
                              className: "wsl-log-expand",
                              "aria-expanded": isOpen ? "true" : "false",
                              onClick: () => setExpanded(isOpen ? null : callId),
                            },
                            isOpen ? t("log.collapse") : t("log.expand"),
                          ),
                        ),
                        isOpen
                          ? h(
                              "div",
                              { className: "wsl-log-detail" },
                              isSearch && Array.isArray(record.queries) && record.queries.length > 0
                                ? h(
                                    "div",
                                    null,
                                    h("span", { className: "wsl-log-detail-label" }, t("log.queries")),
                                    h(
                                      "div",
                                      { className: "wsl-log-queries" },
                                      record.queries.map((q, i) =>
                                        h("span", { className: "wsl-log-chip", key: `${i}:${q}` }, q),
                                      ),
                                    ),
                                  )
                                : null,
                              !isSearch && typeof record.url === "string"
                                ? h(
                                    "div",
                                    { className: "wsl-log-url" },
                                    h("a", { href: record.url, target: "_blank", rel: "noreferrer" }, record.url),
                                    typeof record.statusCode === "number" ? ` · ${record.statusCode}` : null,
                                  )
                                : null,
                              record.ok === false && typeof record.error?.message === "string"
                                ? h("div", { className: "wsl-log-error" }, record.error.message)
                                : null,
                              isSearch && Array.isArray(record.sources) && record.sources.length > 0
                                ? h(
                                    "div",
                                    null,
                                    h("span", { className: "wsl-log-detail-label" }, t("log.sources")),
                                    h(
                                      "div",
                                      { className: "wsl-log-sources" },
                                      record.sources.slice(0, 20).map((source, i) =>
                                        h(
                                          "div",
                                          { className: "wsl-log-source", key: `${i}:${source.url}` },
                                          h(
                                            "a",
                                            {
                                              className: "wsl-log-source-title",
                                              href: source.url,
                                              target: "_blank",
                                              rel: "noreferrer",
                                              title: source.url,
                                            },
                                            source.title || source.url,
                                          ),
                                        ),
                                      ),
                                    ),
                                  )
                                : null,
                            )
                          : null,
                      )
                    }),
                  ),
              hasMore && records.length > 0
                ? h(
                    "button",
                    {
                      type: "button",
                      className: "wsl-log-more",
                      disabled: loading,
                      onClick: () => load(false),
                    },
                    t("log.loadMore", { count: total - offset }),
                  )
                : null,
            )
          : null,
      )
    }

    /**
     * Search statistics view, shared by the right-sidebar tab and the global
     * left-nav panel (`page` switches the heading level and wide layout).
     *
     * The host aggregates the JSONL audit log; this view only renders the
     * payload, so switching keyword mode or the visible top N never triggers
     * another log scan. `refresh=1` bypasses the host's short-lived cache.
     */
    function StatsPanel({ t, page = false }) {
      const uid = React.useId()
      const filterId = `wss-filter-${uid}`
      const tableId = `wss-table-${uid}`
      const callsTabId = `wss-calls-tab-${uid}`
      const keywordsTabId = `wss-keywords-tab-${uid}`
      const cloudTabId = `wss-cloud-tab-${uid}`
      const callsPanelId = `wss-calls-panel-${uid}`
      const keywordsPanelId = `wss-keywords-panel-${uid}`
      const cloudPanelId = `wss-cloud-panel-${uid}`
      const [days, setDays] = React.useState(30)
      const [data, setData] = React.useState(null)
      const [status, setStatus] = React.useState("loading")
      const [error, setError] = React.useState("")
      const [view, setView] = React.useState("calls")
      const [mode, setMode] = React.useState("queries")
      const [topN, setTopN] = React.useState(20)
      const [filter, setFilter] = React.useState("")
      const [showTable, setShowTable] = React.useState(false)
      const [reload, setReload] = React.useState(0)
      const controllerRef = React.useRef(null)

      React.useEffect(() => {
        const controller = typeof AbortController === "function" ? new AbortController() : undefined
        controllerRef.current = controller
        setStatus("loading")
        setError("")
        const params = new URLSearchParams({ days: String(days) })
        let zone = ""
        try {
          zone = Intl.DateTimeFormat().resolvedOptions().timeZone || ""
        } catch {
          zone = ""
        }
        if (zone !== "") params.set("tz", zone)
        // A manual refresh asks the host to skip its result cache.
        if (reload > 0) params.set("refresh", "1")
        fetch(`${STATS_PATH}?${params.toString()}`, {
          headers: { [QUICK_SEARCH_HEADER]: "1" },
          ...(controller === undefined ? {} : { signal: controller.signal }),
        })
          .then((response) => response.json())
          .then((payload) => {
            if (controller?.signal.aborted) return
            if (payload?.ok === true && payload.value !== undefined) {
              setData(payload.value)
              setStatus("ready")
            } else {
              setError(payload?.error?.message ?? t("stats.unknownError"))
              setStatus("error")
            }
          })
          .catch((err) => {
            if (controller?.signal.aborted) return
            setError(err instanceof Error ? err.message : String(err))
            setStatus("error")
          })
        return () => {
          if (controller !== undefined) controller.abort()
        }
      }, [days, reload])

      const total = data?.totals ?? {
        calls: 0,
        queries: 0,
        sessions: 0,
        failedCalls: 0,
        sources: 0,
      }
      const daily = Array.isArray(data?.daily) ? data.daily : []
      const keywords = data?.keywords?.[mode] ?? { total: 0, distinct: 0, overflow: 0, items: [] }
      const needle = filter.trim().toLowerCase()
      const matched = (Array.isArray(keywords.items) ? keywords.items : []).filter(
        (item) => needle === "" || item.text.toLowerCase().includes(needle),
      )
      const visible = matched.slice(0, topN)
      const maxCount = matched.reduce((max, item) => Math.max(max, item.count), 0)
      // The cloud always reflects the tokenised view, even while the ranked
      // list is showing whole queries.
      const termsStats = data?.keywords?.terms ?? {
        total: 0,
        distinct: 0,
        overflow: 0,
        items: [],
      }
      const termItems = Array.isArray(termsStats.items) ? termsStats.items : []
      const cloudWords = termItems.slice(0, 30)
      const cloudMax = cloudWords.reduce((max, item) => Math.max(max, item.count), 0)
      const dailyMax = daily.reduce((max, entry) => Math.max(max, entry.calls), 0)
      const peak = daily.reduce(
        (best, entry) => (entry.calls > (best?.calls ?? 0) ? entry : best),
        undefined,
      )
      const isEmpty = status === "ready" && total.calls === 0 && total.failedCalls === 0

      const metric = (label, value, hint) =>
        h(
          "div",
          { className: "wss-metric" },
          h("span", { className: "wss-metric-label" }, label),
          h("strong", { className: "wss-metric-value" }, String(value)),
          hint === undefined ? null : h("span", { className: "wss-metric-hint" }, hint),
        )

      const rangeButtons = h(
        "div",
        { className: "wss-seg", role: "radiogroup", "aria-label": t("stats.rangeGroup") },
        STATS_RANGES.map((value) =>
          h(
            "button",
            {
              key: value,
              type: "button",
              className: "wss-seg-btn",
              role: "radio",
              "aria-checked": days === value ? "true" : "false",
              tabIndex: days === value ? 0 : -1,
              onKeyDown: radioKeyDown,
              onClick: () => setDays(value),
            },
            t("stats.range", { count: value }),
          ),
        ),
      )

      const modeButtons = h(
        "div",
        { className: "wss-seg", role: "radiogroup", "aria-label": t("stats.modeGroup") },
        [
          ["queries", t("stats.modeQuery")],
          ["terms", t("stats.modeTerm")],
        ].map(([value, label]) =>
          h(
            "button",
            {
              key: value,
              type: "button",
              className: "wss-seg-btn",
              role: "radio",
              "aria-checked": mode === value ? "true" : "false",
              tabIndex: mode === value ? 0 : -1,
              onKeyDown: radioKeyDown,
              onClick: () => setMode(value),
            },
            label,
          ),
        ),
      )

      const cloudPanel = h(
        "section",
        {
          className: "wss-panel",
          role: "tabpanel",
          id: cloudPanelId,
          "aria-labelledby": cloudTabId,
          hidden: view !== "cloud",
        },
        cloudWords.length === 0
          ? h("p", { className: "wss-empty-inline" }, t("stats.noKeywords"))
          : h(
              React.Fragment,
              null,
              h(
                "ul",
                { className: "wss-cloud", "aria-label": t("stats.cloudLabel") },
                cloudWords.map((item, index) => {
                  const ratio = cloudMax > 0 ? Math.sqrt(item.count / cloudMax) : 0
                  return h(
                    "li",
                    { key: item.text },
                    h(
                      "button",
                      {
                        type: "button",
                        className: "wss-cloud-word",
                        "data-top": index === 0 ? "true" : undefined,
                        style: {
                          fontSize: `${12 + Math.round(ratio * 14)}px`,
                          opacity: 0.6 + 0.4 * ratio,
                        },
                        title: t("stats.count", { count: item.count }),
                        "aria-label": t("stats.cloudWord", {
                          text: item.text,
                          count: item.count,
                        }),
                        onClick: () => {
                          setFilter(item.text)
                          setView("keywords")
                        },
                      },
                      item.text,
                    ),
                  )
                }),
              ),
              h(
                "p",
                { className: "wss-meta" },
                t("stats.termsTotal", { count: termsStats.total }),
                termsStats.distinct > 0
                  ? ` · ${t("stats.distinct", { count: termsStats.distinct })}`
                  : null,
                termsStats.overflow > 0
                  ? ` · ${t("stats.overflow", { count: termsStats.overflow })}`
                  : null,
              ),
            ),
        h("p", { className: "wss-hint" }, t("stats.cloudHint")),
      )

      const viewTabs = h(
        "div",
        { className: "wss-tabs", role: "tablist", "aria-label": t("stats.viewGroup") },
        [
          ["calls", t("stats.metricCalls"), callsTabId, callsPanelId],
          ["keywords", t("stats.keywordsTitle"), keywordsTabId, keywordsPanelId],
          ["cloud", t("stats.cloudTitle"), cloudTabId, cloudPanelId],
        ].map(([value, label, tabId, panelId]) =>
          h(
            "button",
            {
              key: value,
              type: "button",
              role: "tab",
              id: tabId,
              className: "wss-tab",
              "aria-selected": view === value ? "true" : "false",
              "aria-controls": panelId,
              tabIndex: view === value ? 0 : -1,
              onKeyDown: tabKeyDown,
              onClick: () => setView(value),
            },
            label,
          ),
        ),
      )

      const dailyTable = showTable
        ? h(
            "div",
            { className: "wss-table-wrap", id: tableId },
            h(
              "table",
              { className: "wss-table" },
              h("caption", { className: "wss-sr" }, t("stats.dailyTable")),
              h(
                "thead",
                null,
                h(
                  "tr",
                  null,
                  h("th", { scope: "col" }, t("stats.day")),
                  h("th", { scope: "col" }, t("stats.calls")),
                  h("th", { scope: "col" }, t("stats.queries")),
                  h("th", { scope: "col" }, t("stats.sessions")),
                  h("th", { scope: "col" }, t("stats.failed")),
                ),
              ),
              h(
                "tbody",
                null,
                daily
                  .slice()
                  .reverse()
                  .map((entry) =>
                    h(
                      "tr",
                      { key: entry.day },
                      h("th", { scope: "row" }, h("time", { dateTime: entry.day }, entry.day)),
                      h("td", null, String(entry.calls)),
                      h("td", null, String(entry.queries)),
                      h("td", null, String(entry.sessions)),
                      h("td", null, String(entry.failedCalls)),
                    ),
                  ),
              ),
            ),
          )
        : null

      const keywordRow = (item, index) => {
        const percent = keywords.total > 0 ? (item.count / keywords.total) * 100 : 0
        const width = maxCount > 0 ? (item.count / maxCount) * 100 : 0
        return h(
          "li",
          { className: "wss-keyword", key: `${index}:${item.text}` },
          h(
            "button",
            {
              type: "button",
              className: "wss-keyword-row",
              title: t("stats.filterBy", { text: item.text }),
              onClick: () => setFilter(item.text),
            },
            h("span", { className: "wss-keyword-rank" }, String(index + 1)),
            h(
              "span",
              { className: "wss-keyword-main" },
              h("span", { className: "wss-keyword-text" }, item.text),
              h(
                "span",
                { className: "wss-keyword-track", "aria-hidden": "true" },
                h("span", { className: "wss-keyword-fill", style: { width: `${width}%` } }),
              ),
            ),
            h("span", { className: "wss-keyword-count" }, t("stats.count", { count: item.count })),
            h(
              "span",
              { className: "wss-keyword-share" },
              t("stats.percent", {
                percent: percent >= 10 ? String(Math.round(percent)) : percent.toFixed(1),
              }),
            ),
          ),
        )
      }

      let body
      if (status === "error") {
        body = h(
          "div",
          { className: "wss-state" },
          h("p", { className: "wss-error" }, t("stats.loadFailed", { message: error })),
          h(
            "button",
            { type: "button", className: "wss-retry", onClick: () => setReload((value) => value + 1) },
            t("stats.retry"),
          ),
        )
      } else if (status === "loading" && data === null) {
        body = h(
          "div",
          { className: "wss-state" },
          h("progress", { className: "wss-progress", "aria-label": t("stats.loading") }),
          h("p", { className: "wss-status" }, t("stats.loading")),
        )
      } else if (isEmpty) {
        body = h(
          "div",
          { className: "wss-state" },
          h("p", { className: "wss-empty" }, t("stats.empty")),
          h("p", { className: "wss-hint" }, t("stats.coverageUnknown")),
        )
      } else {
        body = h(
          React.Fragment,
          null,
          h(
            "div",
            { className: "wss-metrics" },
            metric(t("stats.metricCalls"), total.calls, t("stats.metricCallsHint")),
            metric(t("stats.metricQueries"), total.queries),
            metric(t("stats.metricSessions"), total.sessions),
            metric(t("stats.metricFailed"), total.failedCalls),
          ),
          viewTabs,
          h(
            "section",
            {
              className: "wss-panel",
              role: "tabpanel",
              id: callsPanelId,
              "aria-labelledby": callsTabId,
              hidden: view !== "calls",
            },
            h(
              "div",
              { className: "wss-section-head" },
              h("h3", { className: "wss-section-title" }, t("stats.dailyTitle")),
              h(
                "button",
                {
                  type: "button",
                  className: "wss-link",
                  "aria-expanded": showTable ? "true" : "false",
                  "aria-controls": tableId,
                  onClick: () => setShowTable((value) => !value),
                },
                showTable ? t("stats.collapseTable") : t("stats.toggleTable"),
              ),
            ),
            h(
              "div",
              { className: "wss-chart-wrap" },
              h(
                "div",
                {
                  className: "wss-chart",
                  role: "img",
                  "aria-label": t("stats.chartSummary", {
                    total: total.calls,
                    peak: peak?.calls ?? 0,
                    day: peak?.day ?? data.from,
                  }),
                },
                daily.map((entry) =>
                  h(
                    "div",
                    { className: "wss-bar-slot", key: entry.day },
                    h("div", {
                      className: "wss-bar",
                      style: {
                        height: `${
                          dailyMax === 0
                            ? 0
                            : Math.max(entry.calls > 0 ? 4 : 0, (entry.calls / dailyMax) * 100)
                        }%`,
                      },
                      title: `${entry.day} · ${t("stats.count", { count: entry.calls })}`,
                    }),
                  ),
                ),
              ),
              h(
                "div",
                { className: "wss-axis" },
                h("time", { dateTime: data.from }, data.from),
                h("time", { dateTime: data.to }, data.to),
              ),
            ),
            dailyTable,
          ),
          h(
            "section",
            {
              className: "wss-panel",
              role: "tabpanel",
              id: keywordsPanelId,
              "aria-labelledby": keywordsTabId,
              hidden: view !== "keywords",
            },
            h("div", { className: "wss-panel-tools" }, modeButtons),
            h(
              "div",
              { className: "wss-keyword-toolbar" },
              h("label", { className: "wss-sr", htmlFor: filterId }, t("stats.filterLabel")),
              h("input", {
                id: filterId,
                type: "search",
                className: "wss-filter",
                placeholder: t("stats.filterPlaceholder"),
                value: filter,
                "aria-label": t("stats.filterLabel"),
                onChange: (event) => setFilter(event.target.value),
              }),
              filter === ""
                ? null
                : h(
                    "button",
                    { type: "button", className: "wss-link", onClick: () => setFilter("") },
                    t("stats.filterClear"),
                  ),
              h(
                "label",
                { className: "wss-top" },
                h("span", null, t("stats.topGroup")),
                h(
                  "select",
                  {
                    className: "wss-select",
                    value: String(topN),
                    "aria-label": t("stats.topGroup"),
                    onChange: (event) => setTopN(Number(event.target.value)),
                  },
                  STATS_TOP_OPTIONS.map((value) =>
                    h("option", { key: value, value: String(value) }, t("stats.topOption", { count: value })),
                  ),
                ),
              ),
            ),
            h(
              "p",
              { className: "wss-meta" },
              mode === "queries"
                ? t("stats.queriesTotal", { count: keywords.total })
                : t("stats.termsTotal", { count: keywords.total }),
              keywords.distinct > 0 ? ` · ${t("stats.distinct", { count: keywords.distinct })}` : null,
              keywords.overflow > 0 ? ` · ${t("stats.overflow", { count: keywords.overflow })}` : null,
            ),
            keywords.total === 0
              ? h("p", { className: "wss-empty-inline" }, t("stats.noKeywords"))
              : visible.length === 0
                ? h("p", { className: "wss-empty-inline" }, t("stats.noMatches"))
                : h("ol", { className: "wss-keywords" }, visible.map(keywordRow)),
            mode === "terms" ? h("p", { className: "wss-hint" }, t("stats.termHint")) : null,
          ),
          cloudPanel,
          h(
            "p",
            { className: "wss-foot" },
            h("span", null, t("stats.updatedAt", { time: logTime(data.generatedAt) })),
            h("span", null, t("stats.timeZone", { zone: data.timeZone })),
          ),
          h(
            "p",
            { className: "wss-hint" },
            data.coverage?.earliestDay
              ? t("stats.coverage", { day: data.coverage.earliestDay })
              : t("stats.coverageUnknown"),
          ),
        )
      }

      return h(
        "div",
        { className: "wss-page" },
        h(
          "div",
          { className: "wss-head" },
          h(
            "div",
            { className: "wss-title-row" },
            h(page ? "h1" : "h2", { className: "wss-title" }, t("stats.title")),
            h(
              "button",
              {
                type: "button",
                className: "wss-refresh",
                disabled: status === "loading",
                onClick: () => setReload((value) => value + 1),
              },
              t("stats.refresh"),
            ),
          ),
          h("p", { className: "wss-desc" }, t("stats.desc")),
        ),
        h(
          "div",
          { className: "wss-toolbar" },
          rangeButtons,
          status === "loading" ? h("span", { className: "wss-status" }, t("stats.loading")) : null,
        ),
        h(
          "p",
          {
            className: "wss-sr",
            role: "status",
            "aria-live": "polite",
            "aria-atomic": "true",
          },
          status === "loading"
            ? t("stats.loading")
            : status === "ready"
              ? t("stats.loaded", { count: days })
              : "",
        ),
        body,
      )
    }

    /**
     * Full-page shell for the global left-nav panel. The right-sidebar tab
     * keeps the compact layout; the main panel centers the same view at page
     * width and owns its scrolling.
     */
    function StatsPage(props) {
      return h("div", { className: "wss-main" }, h(StatsPanel, { ...props, page: true }))
    }

    /**
     * Left navigation glyph. The sidebar owns the button, label, active state,
     * and tooltip; this is decorative and inherits the row's current color.
     */
    function StatsNavIcon({ size = 16 }) {
      return h(
        "svg",
        {
          width: size,
          height: size,
          viewBox: "0 0 16 16",
          fill: "none",
          stroke: "currentColor",
          strokeWidth: 1.4,
          strokeLinecap: "round",
          strokeLinejoin: "round",
          "aria-hidden": "true",
          focusable: "false",
        },
        h("path", { d: "M3 13V8" }),
        h("path", { d: "M8 13V3" }),
        h("path", { d: "M13 13V6" }),
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
        resetAllConfirm: t("config.resetAllConfirm"),
        cancel: t("config.cancel"),
        saved: t("config.saved"),
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
            h(ConfigToggle, {
              id: "wsi-stats-panel",
              label: t("config.statsPanel"),
              hint: t("config.statsPanelHint"),
              field: state.statsPanel,
              disabled,
              onToggle: (checked) => edit("statsPanel", checked ? "true" : "false"),
              onReset: () => resetField("statsPanel"),
              resetLabel: t("config.reset"),
              overriddenLabel: t("config.overridden"),
            }),
            h(ConfigToggle, {
              id: "wsi-fetch-entry",
              label: t("config.fetchEntry"),
              hint: t("config.fetchEntryHint"),
              field: state.fetchEntry,
              disabled,
              onToggle: (checked) => edit("fetchEntry", checked ? "true" : "false"),
              onReset: () => resetField("fetchEntry"),
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
              inputMode: "numeric",
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
              inputMode: "numeric",
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
              inputMode: "numeric",
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
        h(LogBrowser, { t }),
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

      // The statistics view has its own gate (`statsPanel`). It has three
      // surfaces: the left navigation row + global main panel, and the
      // right-sidebar tab. Register them up front so compositions without the
      // settings service still get the feature; the configForms effect below
      // removes them when the user turns it off.
      const registerStatsSurfaces = () => {
        // Main panel first: the left row must never address a missing panel.
        const disposeMain = ctx.slots.inject("main", () =>
          ctx.slots.register(
            {
              name: "main",
              key: STATS_TAB_ID,
              locale: NS,
            },
            StatsPage,
          ),
        )
        const disposeNav = ctx.slots.inject("sidebar.panellist", () =>
          ctx.slots.register(
            {
              name: "sidebar.panellist",
              id: STATS_TAB_ID,
              order: STATS_PANEL_ORDER,
              locale: NS,
              label: () => t("stats.title"),
            },
            StatsNavIcon,
          ),
        )
        const disposePane = ctx.slots.inject("sidebar.right.pane.tab", () =>
          ctx.slots.register(
            {
              name: "sidebar.right.pane.tab",
              key: STATS_TAB_ID,
              locale: NS,
            },
            StatsPanel,
          ),
        )
        const disposeType = ctx.effect(
          () =>
            ctx.sidebarRightTabs.register({
              id: STATS_TAB_ID,
              kind: STATS_TAB_KIND,
              priority: "extension",
              title: () => t("stats.title"),
              guide: [
                {
                  id: STATS_TAB_ID,
                  order: 41,
                  title: () => t("stats.title"),
                  description: () => t("stats.guideDesc"),
                },
              ],
            }),
          "web-search-insights: stats tab",
        )
        return () => {
          // If the main panel is the active page, return to the conversation
          // before its slot disappears, then unregister the row before the
          // panel it points at.
          try {
            if (ctx.layout?.panelInfo?.getSnapshot?.().activePanelId === STATS_TAB_ID) {
              ctx.layout.selectPanel(null)
            }
          } catch {
            /* layout may be unavailable in a minimal composition */
          }
          disposePane()
          disposeNav()
          disposeMain()
          disposeType()
        }
      }
      let disposeStatsSurfaces
      const syncStatsSurfaces = (enabled) => {
        if (enabled && disposeStatsSurfaces === undefined) {
          disposeStatsSurfaces = registerStatsSurfaces()
        } else if (!enabled && disposeStatsSurfaces !== undefined) {
          const dispose = disposeStatsSurfaces
          disposeStatsSurfaces = undefined
          dispose()
        }
      }
      syncStatsSurfaces(true)

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
            const snapshot = form.getSnapshot()
            // Only an explicit false hides either surface: loading snapshots
            // and deployments without a served config keep the defaults (on).
            setFetchEntryEnabled(snapshot.value?.fetchEntry)
            const enabled = snapshot.value?.quickSearchView !== false
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

      // The statistics surfaces follow `statsPanel`; an explicit false disposes
      // the left nav row, main panel, and right tab; an absent value (loading
      // snapshot) keeps them on.
      ctx.inject(["configForms"], (configScope) => {
        configScope.effect(() => {
          const form = configScope.configForms.get(CONFIG_NS)
          const sync = () => {
            const snapshot = form.getSnapshot()
            syncStatsSurfaces(snapshot.value?.statsPanel !== false)
          }
          const unsubscribe = form.subscribe(sync)
          sync()
          return () => {
            unsubscribe()
            syncStatsSurfaces(false)
          }
        }, "web-search-insights: stats panel")
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
                    key: PACKAGE_NAME,
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

    exports.name = PACKAGE_NAME
    exports.inject = ["slots", "locale", "layout", "sidebarRight", "sidebarRightTabs"]
    exports.apply = apply
    return module.exports
  },
})
