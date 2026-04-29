# 任务总结 - 移动端用户评价区域重复显示修复

**时间**: 2026-04-29 12:11 GMT+8

## 问题描述
UNIO AROMA 前端移动端产品详情页中，用户评价区域（ProductReviews）重复显示两次。

## 根因分析
`SiteProductDetail.tsx` 中 `ProductReviews` 组件被调用两次：
1. **Line 415-417**: 在 mobile 分区内部（`sm:hidden` → 仅移动端显示）
2. **Line 702-704**: 在两个分区外部（无可见性类 → 移动端和桌面端都显示）

由于外部调用无 CSS 可见性控制，导致：
- **移动端**: 两个 ProductReviews 都显示 → 重复 ❌
- **桌面端**: 只有外部的显示 → 正常 ✓

## 修复方案
将外部区域的 ProductReviews 移入 desktop 分区内部（在 `</div>{/* end desktop */}` 之前）

修复后结构：
- Mobile 分区（`sm:hidden`）: 包含 ProductReviews → 仅移动端显示
- Desktop 分区（`hidden sm:block`）: 包含 ProductReviews → 仅桌面端显示
- 外部区域: 无 ProductReviews

## 提交记录
```
[feature/supabase ceeb340a] fix: 移动端用户评价区域重复显示问题
 1 file changed, 540 insertions(+), 391 deletions(-)
```

## 文件变更
- `src/site/pages/SiteProductDetail.tsx`: 将外部 ProductReviews 移入 desktop 分区

## 验证建议
在移动端浏览器访问产品详情页，确认用户评价区域只显示一次。
