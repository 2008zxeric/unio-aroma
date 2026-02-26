# Unio 元香 · 拾载寻香 (Original Harmony)

> **"從極境擷取寧静 — From Extreme to Harmony."**

Unio 元香 是一家专注于极境单方精油与身心灵平衡的“静奢”香氛品牌。本官网通过交互式寻香地图、AI 祭坛与视觉实验室，呈现创始人 Eric 与首席科学家 Alice 十载寻香的完整轨迹。

---

## 创始人视觉资产上传指南 (Brand Aesthetic Guidelines)

为了维持官网“高级静奢风”的视觉统一性，上传图片前请参考以下建议尺寸：

### 1. 核心比例与尺寸
| 类型 | 建议比例 | 建议尺寸 (px) | 用途 |
| :--- | :--- | :--- | :--- |
| **产品单图** | **3:4** | 1200 x 1600 | 集合页、详情页、地图侧边栏 |
| **极境风景图** | **16:9** / 3:4 | 1920 x 1080 | 详情页 Hero、地图背景 |
| **寻香记忆相册**| 1:1 / 3:4 | 1200 x 1200 | 寻香随笔配图 |
| **品牌 Logo** | 1:1 (PNG) | 512 x 512 | 全局导航、页脚 |

### 2. 视觉准则
- **色调**：倾向于大地色、低饱和度、自然光影。避免过度鲜艳的饱和色。
- **构图**：极简主义。主体居中并保持适当的物理留白（White Space）。
- **背景**：产品图建议采用具有质感的自然材质背景（如米白石材、棉麻、木纹）。

---

## 技术架构
- **Frontend**: React 19 + Tailwind CSS
- **AI Engine**: Google Gemini API (Flash 3 & Flash-Image 2.5)
- **Asset Hub**: GitHub + Unsplash API (Sig-Dynamic)

## 开发者说明
修改 `constants.tsx` 可调整全站数据。图片资源建议托管于 GitHub 仓库并使用 `raw.githubusercontent.com` 链接，以获得最佳加载稳定性。
