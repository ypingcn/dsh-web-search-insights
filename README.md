# dsh-web-search-insights

DeepSeek Harness（DSH）插件：把 Agent 的 `web_search` 使用情况做成「可审计的日志 + 可回看的引用统计」。

- **审计日志**：每次 `web_search` 的关键词与结果网址 + 标题写入 JSONL；
- **会话统计**：`webSearchInsights` 投影产出本轮/本会话的引用来源、返回来源、被 `web_fetch` 抓取过的页面；
- **界面**：每条回答末尾的引用入口，以及右侧栏的「搜索记录」面板。

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
    file: ~/.dsh/logs/web-search-insights.jsonl
```

web profile 默认启用 HMR，本地 link 安装后改 `src/` 会触发热重载；未生效时重启 `dsh web`。

## 配置项

插件管理页打开「搜索溯源」后，详情页里会直接出现配置表单，可修改下面四项并保存；保存写入 profile 配置并即时生效（无需重启）。也可以继续手写 profile 的 `cordis.patch.yml`。

| 字段 | 类型 | 默认值 | 说明 |
|---|---|---|---|
| `enabled` | boolean | `true` | 总开关 |
| `file` | string | `~/.dsh/logs/web-search.jsonl` | 日志路径；支持 `~`，相对路径按宿主 cwd |
| `tools` | string[] | `["web_search"]` | 要观察的工具名 |
| `recordErrors` | boolean | `true` | 失败是否也记录 |

## 日志格式

```json
{"v":1,"ts":"2026-10-24T02:32:00.000Z","tool":"web_search","callId":"call_abc","rootCallId":"call_abc","sessionId":"session-...","provider":"deepseek-official","model":"deepseek-v4-flash","cwd":"/home/user/project","queries":["关键词1","关键词2"],"ok":true,"sourceCount":2,"truncated":false,"sources":[{"url":"https://example.com/a","title":"标题 A"},{"url":"https://example.com/b","title":"标题 B"}]}
```

快速查看：

```bash
tail -f ~/.dsh/logs/web-search.jsonl
tail -n 20 ~/.dsh/logs/web-search.jsonl | jq -r '.ts + "  " + (.queries | join(" | "))'
tail -n 5 ~/.dsh/logs/web-search.jsonl | jq -r '.queries[], (.sources[] | "  - \(.title // "(no title)") <\(.url)>")'
```
