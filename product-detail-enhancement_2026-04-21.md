# 产品详情页字段增强

## 任务
用户反馈前台产品页面缺少一些字段（如产品产地），询问是否有必要出现。

## 分析结果

### 数据库已有但前台未显示的字段
| 字段 | 说明 | 建议显示 |
|------|------|---------|
| `origin` | 产品产地 | ✅ 必要，核心信息 |
| `scientific_name` | 学名（拉丁名） | ✅ 专业感，精油品类应显示 |
| `extraction_method` | 提炼方式（蒸馏/压榨等） | ✅ 专业信息，体现品质 |
| `short_desc` | 短描述/特点提炼 | 可选 |

### "参考价"显示
✅ 已有！页面已显示"参考售价 / REFERENCE PRICE"

## 实施修改

### 1. 类型定义更新 (`src/site/types.ts`)
```typescript
export interface Product {
  // ... 原有字段
  scientific_name?: string;       // 学名（拉丁名）
  short_desc?: string;           // 短描述/特点提炼
  origin?: string;               // 产品产地
  extraction_method?: string;    // 提炼方式
  price_100ml?: number;          // 补充100ml价格
}
```

### 2. 产品详情页更新 (`src/site/pages/SiteProductDetail.tsx`)

**移动端新增：**
- 标题下方显示学名（斜体）
- 产地标签行
- 规格信息区域（产地/提炼方式/规格）

**桌面端新增：**
- 标题下方显示学名（斜体）
- 产品规格信息卡片（产地/提炼方式/规格/学名），使用网格布局
- 中英文标签：产地/Origin、提炼方式/Extraction 等

## 产品详情页应丰富完整的原因
1. **专业性**：精油品类，学名和提炼方式是专业信息
2. **信任感**：产地透明增加用户信任
3. **SEO价值**：更多信息有助于搜索引擎收录
4. **转化率**：详细的产品信息帮助用户决策

## 文件变更
- `unioaroma-website/src/site/types.ts` - 类型定义增强
- `unioaroma-website/src/site/pages/SiteProductDetail.tsx` - 移动端+桌面端字段显示

## 下一步建议
1. 在CMS后台确保填写这些字段数据
2. 可考虑在产品列表卡片也显示产地（可选）
3. 如果数据中 `origin` 为空，可以尝试从 `country_id` 关联获取国家名
