## 任务背景
为 UNIO Aroma 品牌补写31个产品的 short_desc 和4个产品的 alice_lab，写入 Supabase 数据库。

## 执行过程
1. 建立 Supabase 连接（URL + anon key）
2. 准备31条 short_desc（10-20字中文精准定位）
3. 准备4条 alice_lab（80-150字专业冷静描述）
4. 分批执行 update 操作：27条仅 short_desc 单独更新，4条 short_desc+alice_lab 合并更新
5. 逐条确认写入结果

## 关键结果
- ✅ 27条 short_desc 更新成功
- ✅ 4条 short_desc + alice_lab 同时更新成功（橙花Neroli、橙花、胡萝卜籽、玫瑰果油）
- 共计处理 31/35 条记录，全部写入成功
- 产物文件：task-summary_20260421-1131.md

## 结论建议
任务完成。所有产品描述已成功写入 Supabase products 表，可直接在数据库中验证更新结果。