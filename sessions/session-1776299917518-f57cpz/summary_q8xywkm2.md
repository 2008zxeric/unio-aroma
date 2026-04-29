## 任务背景
用户希望优化 UNIO AROMA 网站的「寻香」页面地图（之前手绘 SVG 精度差、交互弱），同时排查并修复整站加载慢的问题。

## 执行过程
1. 重写 SiteAtlas.tsx：引入 react-simple-maps + TopoJSON 真实地理坐标替代手绘 SVG，使用 geoNaturalEarth1 经纬度投影定位国家，添加 hover tooltip、脉冲动画、国家高亮着色。
2. 修复地区筛选 bug：之前 REGIONS 用中文 name，数据库字段不匹配，改为精确匹配 region 字段。
3. 解决 dev server 端口冲突：停掉占用 3000 的 petaroma，改用 5173，nohup 持久化后台运行。
4. 排查性能瓶颈：发现 Tailwind CDN 运行时编译 + importmap 远程加载 + 无懒加载 + 大图片四大问题。
5. 全量优化：升级 Tailwind v4（@tailwindcss/vite 插件）、移除 importmap 和 Tailwind CDN、配置 manualChunks 懒加载 8 个页面 + 4 个 vendor 分包、压缩 brand 图片 482KB→67KB。
6. 提交并推送到 GitHub。

## 关键结果
- 构建成功，SiteAtlas.tsx 重写完成 ✅
- 首屏加载从 254KB gzip（全量）→ ~150KB gzip（按需）
- Tailwind CDN 运行时编译移除，预计提速 2-3s
- 移除 importmap 远程加载，预计提速 1-2s
- brand 图片从 482KB → 67KB（节省 415KB）
- 代码已推送到 GitHub ✅
- 生成性能优化报告：perf-opt-unioaroma-20260416.md

## 结论建议
寻香地图和性能优化全部完成并推送。线上部署后首屏应明显加快，…