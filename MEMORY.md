# MEMORY.md

- **2026-04-16**：记忆系统启用
- **2026-04-22**：微信通道（wechat-access + openclaw-weixin）首次成功连通；之前微信问好时收到兜底回复「抱歉，这个问题我暂时无法解答」，排查后发现是 WebSocket 连接/路由问题，重试后正常；用户希望微信端 AI 更幽默好玩；更新了 SOUL.md 注入人格、USER.md 补充基本信息

## UNIO AROMA 项目关键配置

### 分支策略（2026-04-28 更新）
- `main`：旧站纯静态备份 ❌ 不动
- `feature/supabase`：**正式工作分支**（unioaroma.com 正在跑这个）✅ 可开发 + 可部署
- `backup-main-stable`：稳定版备份 ❌ 不动
- `dev/wechat-remote`：已删除

### 本地路径
`/Users/EricMac/.qclaw/workspace/unioaroma-website`

### GitHub
`https://github.com/2008zxeric/unio-aroma`

### 当前问题：Reviews 评价不同步
- **根因**：`ProductReviews` 组件读的是本地静态文件 `src/site/data/reviews.ts`，未连接 Supabase
- **影响**：后台审批的评价无法展示到前台
- **计划**：创建 `reviews` 表 → 添加 `reviewService` → 改造前台组件 → 新增后台评价管理页

## 用户身份与偏好

- 主要通讯渠道：微信
