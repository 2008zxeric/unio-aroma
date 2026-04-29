## 任务背景
UNIO AROMA前端移动端产品详情页中ProductReviews组件重复显示两次，需要排查并修复。

## 执行过程
1. 排查三个组件调用关系
2. 定位SiteProductDetail.tsx中双调用
3. 将外部ProductReviews移入desktop分区
4. git commit提交修复

## 关键结果
- 根因：ProductReviews在mobile分区内和外部各调用一次，外部无显隐控制导致移动端重复
- 修复：将外部调用移入desktop分区内部，mobile/desktop各司其职
- 提交：`ceeb340a fix: 移动端用户评价区域重复显示问题`
- 变更文件：`src/site/pages/SiteProductDetail.tsx`

## 结论建议
修复已提交，建议在移动端浏览器验证产品详情页评价区域只显示一次。