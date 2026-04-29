## 任务背景
用户反馈后台审核通过的评价无法同步到前台展示，需排查并修复。

## 执行过程
1. 定位根因：ProductReviews 组件使用静态本地文件
2. 确认 Supabase 无 reviews 表，无审核流程
3. 明确分支结构：feature/supabase 为正式分支
4. 设计三步修复方案：建表+前台改造+后台管理

## 关键结果
- 根因已确认：前台评价组件与 Supabase 完全隔离
- 提供建表 SQL（含 is_approved 审核字段）
- 规划数据层 reviewService + ProductReviews 改造方案
- 规划后台 /admin/reviews 评价管理页面

## 结论建议
需用户先执行建表 SQL，随后开始代码改造。