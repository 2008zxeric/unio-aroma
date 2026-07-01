# MEMORY.md

- **2026-04-16**：记忆系统启用
- **2026-04-22**：微信通道（wechat-access + openclaw-weixin）首次成功连通；之前微信问好时收到兜底回复「抱歉，这个问题我暂时无法解答」，排查后发现是 WebSocket 连接/路由问题，重试后正常；用户希望微信端 AI 更幽默好玩；更新了 SOUL.md 注入人格、USER.md 补充基本信息

## UNIO AROMA 项目关键配置（2026-06-30 更新）

### 项目定位
- 元香 UNIO / UNIO AROMA：精油品牌官网 + 后台管理系统，生产地址 `https://www.unioaroma.com`。
- GitHub：`https://github.com/2008zxeric/unio-aroma`。
- 部署：Vercel 项目 `unio-aroma-site`，推送到 GitHub 后触发自动部署；可用 `vercel --prod --yes` 手动部署。
- 域名要求：生产部署必须覆盖 `unioaroma.com` 与 `www.unioaroma.com`；以后每次用户说“部署到线上”都默认检查这两个域名都已绑定并指向当前生产部署。
- 数据库：Supabase PostgreSQL；前端使用 anon key 直连，受 RLS 限制，没有传统 REST 后端。

### 当前主要代码路径
- 官网/后台仓库当前在 `/Users/EricMac/.qclaw/workspace`，这是 Git 仓库和 Vercel 项目本体。
- `/Users/EricMac/Documents/unioaroma` 当前更像资料/自动化/小程序工作区，不是官网仓库根目录；其中 `unio-aroma-miniprogram-clean/` 是微信小程序相关目录。
- 交接文档来源：`/Users/ericmac/Desktop/UNIO_AROMA_交接文档_Codex.md`，编写日期 2026-06-30。

### 技术栈
- React 19 + TypeScript 5.8 + Vite 6，路由使用 `react-router-dom` v7 的 HashRouter。
- Tailwind CSS 4 通过 `@tailwindcss/vite` 加载，图标用 Lucide React。
- 关键依赖：`@supabase/supabase-js`、`@google/genai`（Oracle/Gemini）、`browser-image-compression`、`react-simple-maps`、`topojson-client`。
- 关键脚本：`npm run dev`（本地 :3000）、`npm run build`（生产构建后删除 `.woff`）、`npm run preview`。

### 架构入口与路由
- `App.tsx`：根组件，`/admin/*` 进入 `AdminRouter`，其他进入 `SiteApp`。
- `index.tsx`：挂载 `HashRouter + App`。
- 前台路由使用 hash：`#/home`、`#/collections`、`#/product/{code}`、`#/atlas`、`#/china-atlas`、`#/destination/{id}`、`#/story`、`#/oracle`。
- 后台路由：`#/admin`、`#/admin/login`、`#/admin/products`、`#/admin/countries`、`#/admin/banners`、`#/admin/texts`、`#/admin/recommends`、`#/admin/inventory`、`#/admin/reviews`、`#/admin/images`、`#/admin/series`、`#/admin/welcome-video`、`#/admin/dicts`、`#/admin/users`、`#/admin/settings`、`#/admin/audit-logs`。

### 重要文件
- `src/site/designTokens.ts`：前台设计令牌，品牌四色是朱砂红 `#D75437`、香槟金 `#D4AF37`、深蓝 `#1C39BB`、墨绿 `#1A2E1A`。
- `src/site/SiteApp.tsx`：前台应用壳，包含导航/动画/路由。
- `src/site/pages/SiteHome.tsx`：前台首页，体量最大之一。
- `src/lib/dataService.ts`：后台/共享 CRUD 数据服务层，所有 Supabase 操作优先走这里。
- `src/lib/auth.tsx`：后台认证与 RBAC。
- `src/admin/pages/InventoryManage.tsx`：库存利润页，最大最复杂，改动需谨慎。
- `src/admin/pages/Dashboard.tsx`：仪表盘，已包含统计卡片和 DetailModal。

### 数据层与库存逻辑
- 数据操作模式：`productService`、`countryService` 等 service 对象封装 `getAll/getById/create/update/delete`，不要绕过既有 dataService 模式随手直连。
- 库存统计在 `dataService.ts -> inventoryService.getAllSummaries()` 内存聚合：`purchase_records.volume_ml - sales_records.volume_ml`；没有数据库视图或存储过程。
- 核心表：`products`、`countries`、`series`、`banners`、`site_texts`、`home_recommends`、`purchase_records`、`sales_records`、`finance_records`、`dict_items`、`admin_users`、`reviews`、`audit_logs`、`images`。
- 系列编码：`yuan`（元·单方）、`he`（合·复方）、`sheng`（生·纯露）、`jing`（香·空间）。

### 权限与后台约定
- 后台四角色：`super_admin`、`admin`、`editor`、`viewer`。
- 权限通过 `useAuth()`、`PermissionGuard`/`<Perm action="...">` 实现；需要权限的操作必须包权限守卫。
- Toast 使用 `useToast()`，不要用 `alert()`。
- 后台入口隐藏在前台：长按 Logo 1.5 秒进入后台登录页。

### 常见坑
- 路由必须保持 HashRouter，URL 是 `#/xxx`，不要迁移成 BrowserRouter 风格 `/xxx`。
- 图片上传后台走 Supabase Storage 直传，绕过 Vercel 4.5MB body 限制。
- `npm run build` 会删除 `.woff`，只保留 `.woff2`，这是有意为之。
- 库存归零不是直接 UPDATE，而是通过“归零”按钮自动补录 10ml 进货来冲抵负库存。
- 库存总览首屏需同时拉取 `financeRecords`，否则 Dashboard 统计卡片首次可能缺少其他收支。
- Vercel 配置 HTML 不缓存、静态资源强缓存；“页面没变化”先查部署状态。

### 最近交接记录（截至 2026-06-30）
- 最新交接文档记录 HEAD 为 `a03f3bbe`（main 分支）。
- 近期提交：`a03f3bbe` 经手人默认当前用户；`fde43225` 桌面端库存表格操作列；`18f43973` Dashboard 详情弹窗；`41333cba` stable v250630。
- 2026-06-30 本机仓库当前有未提交改动：`.gitignore` 与 `src/site/pages/SiteHome.tsx`，不确定归属时不要覆盖或回退。

## 用户身份与偏好

- 主要通讯渠道：微信
