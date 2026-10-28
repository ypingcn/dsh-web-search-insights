# dsh-web-search-insights

DeepSeek Harness（DSH）插件：把 Agent 的 `web_search` 使用情况做成「可审计的日志 + 可回看的引用统计」。

- **审计日志**：每次 `web_search` 的关键词与结果网址 + 标题写入 JSONL；
- **会话统计**：`webSearchInsights` 投影产出本轮/本会话的引用来源、返回来源、被 `web_fetch` 抓取过的页面；
- **界面**：每条回答末尾的引用入口，以及右侧栏的「搜索记录」面板（支持按已引用/未引用/已抓取筛选与按域名分组）。

## 安装

### 方式 A：从 GitHub 安装（推荐）

```bash
dsh plugin --profile web add github:ypingcn/dsh-web-search-insights
```

### 方式 B：本地 link 安装（开发调试）

```bash
dsh plugin --profile web add link:/path/to/dsh-web-search-insights
```

两种方式安装的都是 bundle：包声明了 `dsh.bundle.patch`，安装后会被自动加入 `dsh.profile.bundles`（未自动加入时手动追加）。之后可在 profile 的 `cordis.patch.yml` 里按 row id `web-search-insights` 覆盖配置：

```yaml
- id: web-search-insights
  name: dsh-web-search-insights
  config:
    directory: ~/.dsh/logs
```

web profile 默认启用 HMR，本地 link 安装后改 `src/` 会触发热重载；未生效时重启 `dsh web`。

## 配置项

插件管理页打开「搜索溯源」后，详情页里会直接出现配置表单，可修改下面七项并保存；保存写入 profile 配置并即时生效（无需重启）。表单底部「保存」右侧的「重置全部」会一次把七项恢复默认并立即写入，不需要再点保存。也可以继续手写 profile 的 `cordis.patch.yml`。

| 字段 | 类型 | 默认值 | 说明 |
|---|---|---|---|
| `enabled` | boolean | `true` | 总开关 |
| `directory` | string | `~/.dsh/logs` | 日志目录；插件固定写入其中的 `web-search.jsonl`，支持 `~`，相对路径按宿主 cwd |
| `recordErrors` | boolean | `true` | 失败是否也记录 |
| `quickSearchView` | boolean | `true` | 是否显示会话顶部的「快速搜索」视图；关闭后立即隐藏 |
| `maxSizeMb` | number | `10` | 活动日志超过该大小（MB）时轮转；`0` 关闭 |
| `maxFiles` | number | `5` | 保留的轮转文件份数；`0` 不限制 |
| `retentionDays` | number | `0` | 轮转文件保留天数，超期清理；`0` 不按时间清理 |

## 快速搜索

会话顶部「对话 / 轨迹」右侧新增「快速搜索」view：输入一个关键词，直接调用 DSH 的搜索 provider，不经过模型，也不会写入会话记录或统计。

- 结果数量是搜索框同行的下拉选项，可选 5 / 10 / 15 / 20，默认 10；新会话/刷新后回到 10，当前会话内切换视图会保留选择；
- 结果展示标题、URL、摘要、日期，点击在新标签页打开；
- 说明文字通过标题旁问号的 tooltip 展示，默认不占行；历史查询默认收起，点标题旁的「历史查询」展开；
- 手动查询历史是全局的，保存在浏览器 localStorage；
- 页面宽度复用对话主栏的 `--dsh-chat-content-width`，拖动对话两侧的宽度手柄会同步调整搜索页宽度；
- 当前查询和结果按会话保留在当前浏览器会话的内存里，切换「对话 / 轨迹」再回来不会丢失；刷新页面后重置；
- 该功能依赖宿主提供同源 HTTP 路由 `/api/dsh-web-search-insights/quick-search`，仅本机同源请求可用；
- 单次查询最多 15 秒，超时返回 504；同一宿主最多 4 个并发查询，超出返回 429。

## 日志格式

```json
{"v":1,"ts":"2026-10-24T02:32:00.000Z","tool":"web_search","callId":"call_abc","rootCallId":"call_abc","sessionId":"session-...","provider":"deepseek-official","model":"deepseek-v4-flash","cwd":"/home/user/project","queries":["关键词1","关键词2"],"ok":true,"sourceCount":2,"truncated":false,"sources":[{"url":"https://example.com/a","title":"标题 A"},{"url":"https://example.com/b","title":"标题 B"}]}
```

插件固定写入 `<directory>/web-search.jsonl`；日志超过 `maxSizeMb` 时会改名为 `web-search.jsonl.<时间戳>`，`maxFiles` 与 `retentionDays` 控制保留份数和天数，`tail -f` 仍可跟随活动文件。

旧版本使用的 `file`（完整文件路径）仍然生效，但 `directory` 存在时优先；目录模式下文件名不再可配置。

来源 URL 会去掉 `#fragment`，并按规范化身份去重：同一文档即使带不同跟踪参数也只记一次，与统计面板的匹配规则保持一致。

快速查看：

```bash
tail -f ~/.dsh/logs/web-search.jsonl
tail -n 20 ~/.dsh/logs/web-search.jsonl | jq -r '.ts + "  " + (.queries | join(" | "))'
tail -n 5 ~/.dsh/logs/web-search.jsonl | jq -r '.queries[], (.sources[] | "  - \(.title // "(no title)") <\(.url)>")'
```
