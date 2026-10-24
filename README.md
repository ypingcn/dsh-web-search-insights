# dsh-web-search-logger

DeepSeek Harness（DSH）插件：每当 Agent 通过 `web_search` 工具搜索时，记录**关键词**与**结果网址 + 标题**，并在界面上展示本轮/本会话的引用统计。

除了 JSONL 审计日志，现在还提供两层界面：每条回答末尾的引用入口，以及右侧栏的「搜索记录」面板。

## 目录结构

```text
dsh-web-search-logger/
├── package.json          # 插件包；dsh.bundle.patch 指向 cordis.patch.yml
├── cordis.patch.yml      # 作为 bundle 安装时插入插件行
├── src/
│   ├── index.js          # 插件入口：name / Config / apply
│   ├── config.js         # 配置 schema、默认值、路径展开与校验
│   ├── record.js         # 纯函数投影：exec + result → 日志记录
│   ├── writer.js         # JSONL 串行写入器（队列 + flush）
│   ├── url-utils.js      # URL 归一化、引用提取、来源读取
│   ├── projection.js     # 会话统计投影（本轮/会话引用与来源）
│   └── index.d.ts        # 类型声明
├── lib/client.js         # 浏览器端：回答末尾入口 + 右侧栏面板
├── test/                 # 投影、URL、客户端契约、JSONL 测试
└── README.md
```

模块边界：

- `record.js` 不碰 I/O，只做数据投影，是最主要的扩展点；
- `writer.js` 不关心记录内容，只负责串行追加、建目录、吞掉 I/O 错误；
- `projection.js` 把持久会话事件折叠成界面统计，纯同步、可回放；
- `lib/client.js` 只负责界面，不参与日志与统计计算；
- `index.js` 把它们接起来，并且**不改变工具结果**；
- `config.js` 是唯一读取配置的地方。

## 工作原理

DSH 的工具注册表在每次调用结束后发出 `tools/result`，参数为：

- `exec`：`name`、`callId`、`rootCallId`、`arguments`、`agent`
- `result`：`{ isError, value }`

`web_search` 的规范返回值：

```json
{
  "sources": [{ "url": "...", "title": "...", "snippet": "...", "publishedAt": "..." }],
  "truncated": false,
  "content": "provider 的可选总结"
}
```

插件订阅事件，过滤 `exec.name`，从 `arguments.queries` 取关键词、从 `value.sources` 取 `url`/`title`，然后写入 JSONL。日志失败只上报 `ctx.logger.warn`，不会中断搜索。

选这个钩子的原因：与搜索提供方无关（DeepSeek 官方、Exa、自定义 provider 都走同一个工具），拿到的是最终合并去重后的结构化来源，不需要解析模型可见文本。

## 已实现

- [x] `tools/result` 钩子与工具名过滤
- [x] 关键词、URL、标题、来源数量、截断标记
- [x] 会话上下文：`sessionId`、`provider`、`model`、`cwd`
- [x] 失败记录（`ok:false` + 错误码），可关闭
- [x] 可选 snippet / provider 总结
- [x] 串行追加、目录自动创建、错误吞噬、卸载时 flush
- [x] 配置 schema（可选 peer 缺失时自动退化为内置校验）
- [x] 会话统计投影：本轮引用、含历史来源、本轮搜索来源子计数、会话累计
- [x] 回答末尾引用入口
- [x] 右侧栏「搜索记录」面板（按轮展示全部返回来源与被引用标记）
- [x] 回答末尾来源图标（最多 5 个，已引用优先、rerank_score 降序）
- [x] 记录 `web_fetch` 网页获取：面板标记「可能看过」，回答末尾汇总参考网页数
- [x] 单元测试

## 界面

### 回答末尾入口

每次回答完成后，末尾会出现一行入口：

```text
本轮引用 3 个网页 · 会话累计 12 个网页    查看 ›
```

- 主数字是**本轮最终回答**里引用的、来自本会话所有 `web_search` 来源的 URL 去重数（含之前轮次搜到的来源）。
- 本轮没有搜索也没有引用时不显示；有搜索但零引用时显示「本轮引用 0 个网页 · 会话累计 N 个网页 · 搜索返回 M 个网页」。
- 右侧「查看 ›」是按钮样式，点击后打开右侧栏面板，并定位到这一轮。
- 入口行左侧额外展示本轮搜索结果的站点图标，最多 5 个：优先展示被引用来源，组内按 `rerank_score` 从高到低排序；不足 5 个时用未被引用的来源按分数补全。
- 优先使用搜索接口返回的 `site_icon`；没有时回退到站点 `favicon.ico`，再失败则显示站点首字母。
- 本轮调用了 `web_fetch` 时，末尾额外显示「主动抓取 N 个网页数据」。

### 右侧栏「搜索记录」面板

- 标题右侧汇总：会话累计引用来源数（含引用次数）、返回来源数、搜索次数、获取网页数，以图标 + 数字展示。
- 每轮标题右侧展示引用/本轮来源/返回数；悬停整组统计时，用一句话显示本轮完整状态。
- `本轮 / 本会话` 切换。
- 每轮卡片：本轮回答引用、其中本轮搜索来源、返回数量、关键词；调用过网页获取时，额外列出「主动抓取数据的页面」。
- 来源列表展示该轮**全部返回来源**，每行带站点图标；行尾用图标表示状态：蓝色 `@` 为已引用，橙色眼睛为可能看过（被 `web_fetch` 成功抓取）。
- 整轮来源都没有状态时不预留状态列；只要有一个来源有状态，所有行保留固定状态列以保证对齐。
- 抓取页面行尾用绿色对勾 / 红色叉号加纯数字状态码表示成功或失败。
- 来源元数据 `authority`、`rerank_score` 会保留在投影中，并用于图标排序与 tooltip；当前默认搜索 provider 不返回这些字段时自动降级。
- 从右侧栏的面板列表也可以直接打开（不需要先点回答末尾入口）。

统计口径：

- **引用**只算本轮最后一条带文本的助手回答，中间过程叙述和代码块里的 URL 不算。
- URL 会先归一化（去 fragment、去跟踪参数、去尾斜杠、排序 query）再与搜索来源匹配。
- 会话累计按去重 URL 计；「引用次数」按出现次数计。
- fork 继承的父会话前缀不计入子会话统计；子会话单独统计。

## 路线图（尚未实现）

- [ ] 按 session 拆分文件或按大小/日期轮转
- [ ] 来源域名排行、关键词排行
- [ ] 导出 CSV/Markdown 报告的小脚本
- [ ] 写入失败重试与磁盘上限保护
- [ ] 与 `web_fetch` 的关联记录

## 安装

> 回答末尾入口和右侧栏面板需要浏览器端 bundle，只有**方式 B（作为 bundle 安装）**会加载；方式 A 只提供 JSONL 与 Host 统计，不显示界面。

### 方式 A：直接路径插入（本地开发最快）

编辑 `~/.dsh/profiles/web/cordis.patch.yml`：

```yaml
- insert:
    - id: web-search-logger
      name: /home/ypingcn/dsh-workspace/dsh-web-search-logger/src/index.js
      config:
        file: ~/.dsh/logs/web-search.jsonl
```

web profile 默认启用 HMR，保存后会重组并挂载新增行；改已有行会 dispose 旧 fiber 再按新配置 `apply`。如果没生效（或改了 `src/` 源码），重启 `dsh web`。

> 这种方式不写 profile 依赖与 lockfile，peer 解析较弱；`@deepseek-ai/schemastery` 解析不到时插件会自动退化为内置配置校验。

### 方式 B：作为 bundle 安装

```bash
dsh plugin --profile web add link:/home/ypingcn/dsh-workspace/dsh-web-search-logger
```

包声明了 `dsh.bundle.patch`，安装后会被自动加入 `dsh.profile.bundles`（未自动加入时手动追加）。之后可在 profile 的 `cordis.patch.yml` 里按 row id `web-search-logger` 覆盖配置：

```yaml
- id: web-search-logger
  name: dsh-web-search-logger
  config:
    includeSnippet: true
```

## 配置项

| 字段 | 类型 | 默认值 | 说明 |
|---|---|---|---|
| `enabled` | boolean | `true` | 总开关 |
| `file` | string | `~/.dsh/logs/web-search.jsonl` | 日志路径；支持 `~`，相对路径按宿主 cwd |
| `tools` | string[] | `["web_search"]` | 要观察的工具名 |
| `includeSnippet` | boolean | `false` | 是否写入来源摘要 |
| `includeAnswer` | boolean | `false` | 是否附带 provider 总结 |
| `recordErrors` | boolean | `true` | 失败是否也记录 |
| `console` | boolean | `false` | 是否向宿主 logger 打摘要 |

## 日志格式

```json
{"v":1,"ts":"2026-10-24T02:32:00.000Z","tool":"web_search","callId":"call_abc","rootCallId":"call_abc","sessionId":"session-...","provider":"deepseek-official","model":"deepseek-v4-flash","cwd":"/home/ypingcn/project","queries":["关键词1","关键词2"],"ok":true,"sourceCount":2,"truncated":false,"sources":[{"url":"https://example.com/a","title":"标题 A"},{"url":"https://example.com/b","title":"标题 B"}]}
```

快速查看：

```bash
tail -f ~/.dsh/logs/web-search.jsonl
tail -n 20 ~/.dsh/logs/web-search.jsonl | jq -r '.ts + "  " + (.queries | join(" | "))'
tail -n 5 ~/.dsh/logs/web-search.jsonl | jq -r '.queries[], (.sources[] | "  - \(.title // "(no title)") <\(.url)>")'
```

## 测试

```bash
cd /home/ypingcn/dsh-workspace/dsh-web-search-logger
npm test
```

覆盖：URL 归一化/引用提取、投影 fold（本轮/历史来源、fork 前缀、重复 tool/result、代码块）、客户端 bundle 的入口与面板渲染、JSONL 日志、失败记录、配置校验。

## 边界

- 只记录 `web_search` 工具调用，不记录 `web_fetch` 或 provider 内部未暴露的中间搜索。
- 一次调用带多个 query 时，工具层已合并结果，无法按 query 拆分来源。
- 多会话并发写同一文件时按行追加；需要严格隔离时可按会话拆 `file`（路线图）。
- 统计只读取持久会话事件；旧日志缺少 `tool/result` 的 `meta` 时，该次搜索会记为返回 0 个来源（JSONL 仍可记录工具结果）。
- 右侧栏每轮最多展示 50 个来源、最近 200 轮；更早的完整记录仍在 JSONL 中。
- 插件在 DSH 宿主进程内执行，拥有宿主文件权限；不要从不可信来源加载绝对路径插件。
