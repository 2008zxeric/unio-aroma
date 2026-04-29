## 任务背景
用户反馈产品详情页缺少字段（产地、学名等），并询问是否需要在价格下加"参考价"提示。

## 执行过程
1. 检查 unioaroma-website 项目结构和数据库类型
2. 确认数据库已有 origin、scientific_name、extraction_method 等字段
3. 确认"参考价"已显示（页面已有参考售价）
4. 更新 types.ts 类型定义
5. 修改 SiteProductDetail.tsx（移动端+桌面端）新增字段展示
6. 验证代码编译

## 关键结果
- 新增显示字段：产地(origin)、学名(scientific_name)、提炼方式(extraction_method)、短描述(short_desc)
- 中英文标签：产地/Origin、提炼方式/Extraction 等
- 文件变更：types.ts、SiteProductDetail.tsx

## 结论建议
前台已完善显示。建议在 CMS 后台补充现有产品的产地和学名数据，确保信息完整展示。