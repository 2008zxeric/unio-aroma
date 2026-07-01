# Hermes 同步规则通知文档

这份文档是发给 Hermes 的正式工作说明。  
目标只有一个：**Hermes 与 Codex 在这个项目里必须通过共享文件保持同步，任何重要操作都要留下日志。**

## 工作目录

统一工作目录：

- `/Users/EricMac/.qclaw/workspace`

Hermes 在这个项目中工作时，默认以上面这个目录为主，不要把关键信息只留在别的临时目录或私有上下文里。

## 启动时必须先读取

每次 Hermes 开始工作前，先读以下文件：

1. `AGENTS.md`
2. `MEMORY.md`
3. `memory/YYYY-MM-DD.md`（今天）
4. `memory/YYYY-MM-DD.md`（昨天，如果存在）
5. `.hermes/README.md`
6. `.hermes/activity-log.ndjson`

如果某个文件不存在，可以继续，但不能因此跳过整个流程。

## 做完重要工作后必须写入

每次 Hermes 做完“有实际影响”的工作后，必须同时写入下面两个地方：

1. `memory/YYYY-MM-DD.md`
2. `.hermes/activity-log.ndjson`

这两者的作用不同：

- `memory/YYYY-MM-DD.md`：给人看的，方便 Codex 和人类快速理解发生了什么
- `.hermes/activity-log.ndjson`：给系统和 agent 读取的，方便自动同步和后续检索

## 什么叫“有实际影响”的工作

以下行为都必须记日志：

- 改了代码
- 部署了网站
- 改了生产环境配置
- 改了域名、DNS、Vercel alias
- 改了计划文件或任务方案
- 改了自动化、提醒、工作流
- 发现了会影响后续工作的 blocker
- 做了一个未来需要记住的决策

## 日志怎么写

### 1. Daily log 写法

写到 `memory/YYYY-MM-DD.md`，用简短 bullet 即可。

推荐格式：

```md
- 2026-06-30 20:10 CST — Hermes — 更新首页文案层级与 CTA 结构。文件：`src/site/pages/SiteHome.tsx`、`src/index.css`。下一步：请 Codex 验证部署产物。
```

### 2. NDJSON 写法

写到 `.hermes/activity-log.ndjson`，一行一个 JSON：

```json
{"ts":"2026-06-30T20:10:00+08:00","agent":"hermes","action":"edit","summary":"Updated homepage copy hierarchy and CTA treatment.","files":["src/site/pages/SiteHome.tsx","src/index.css"],"project":"unio-aroma-site","next":"Ask Codex to verify deploy artifacts."}
```

## 部署规则

在这个项目里，“部署到线上”不等于只执行一次 `vercel deploy --prod`。  
只有满足下面三条，才算部署完成：

1. 最新 production deployment 在 Vercel 上 ready
2. `unioaroma.com` 指向最新 deployment
3. `www.unioaroma.com` 指向最新 deployment

不能默认认为自定义域名会自动跟随最新部署，必须检查 alias 绑定结果。

## 域名规则

以下两个地址都属于正式生产入口：

- `https://unioaroma.com`
- `https://www.unioaroma.com`

如果其中任意一个域名还在返回旧资源、旧页面、旧样式，都不算部署完成。

## 看到别的未提交改动时

如果 Hermes 看到不是自己做的未提交修改：

- 不要回退
- 先理解这些改动
- 尽量与现有改动兼容
- 只有在确实阻塞安全工作时再提问

## 最重要的一条

**如果 Hermes 希望 Codex 以后知道某件事，就必须现在把它写进共享文件。**

不能只留在对话上下文里，不能只留在脑子里，不能只留在某个私有 agent 状态里。

## 参考文件

如果 Hermes 需要更完整的内部规范，可以继续看：

- `AGENTS.md`
- `.hermes/README.md`
- `.hermes/activity-log.ndjson`

## 一句话总结

Hermes 在这个项目中的所有重要动作，都必须通过共享日志文件显式同步给 Codex。
