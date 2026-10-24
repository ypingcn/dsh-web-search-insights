# dsh-web-search-logger

DeepSeek Harness（DSH）插件框架：每当 Agent 通过 `web_search` 工具搜索时，把**关键词**和**结果网址 + 标题**追加写入 JSONL 日志。

当前是**可运行的第一阶段骨架**：核心链路（事件订阅 → 结构化投影 → 串行落盘）已打通，后续能力按下面的路线图增量添加。

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
│   └── index.d.ts        # 类型声明
├── test/unit.mjs         # 假 Cordis 上下文 + 真实落盘测试
└── README.md
```

模块边界：

- `record.js` 不碰 I/O，只做数据投影，是最主要的扩展点；
- `writer.js` 不关心记录内容，只负责串行追加、建目录、吞掉 I/O 错误；
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
- [x] 单元测试

## 路线图（尚未实现）

- [ ] 按 session 拆分文件或按大小/日期轮转
- [ ] 去重与统计视图（关键词排行、域名排行）
- [ ] 导出 CSV/Markdown 报告的小脚本
- [ ] 写入失败重试与磁盘上限保护
- [ ] Web 侧边栏的日志查看面板（Client 插件）
- [ ] 与 `web_fetch` 的关联记录

## 安装

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
node test/unit.mjs
```

测试覆盖：成功记录、snippet/answer 开关、失败记录、非目标工具/空 query/禁用过滤、畸形结果不抛错、错误配置 fail-loud、schema 默认值。

## 边界

- 只记录 `web_search` 工具调用，不记录 `web_fetch` 或 provider 内部未暴露的中间搜索。
- 一次调用带多个 query 时，工具层已合并结果，无法按 query 拆分来源。
- 多会话并发写同一文件时按行追加；需要严格隔离时可按会话拆 `file`（路线图）。
- 插件在 DSH 宿主进程内执行，拥有宿主文件权限；不要从不可信来源加载绝对路径插件。
