const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");

// 读取 .env
const envPath = path.join(__dirname, ".env");
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, "utf-8");
  envContent.split("\n").forEach(line => {
    const [k, ...v] = line.split("=");
    if (k && v.length) process.env[k.trim()] = v.join("=");
  });
}

const app = express();
const PORT = 3456;
const DEEPSEEK_API_URL = "https://api.deepseek.com/v1/chat/completions";

// ===== IP 频率限制（防恶意刷） =====
// 正常用户完全无感，防脚本狂刷
const rateLimitStore = new Map();
const WINDOW_MS = 60 * 1000;      // 1分钟窗口
const MAX_PER_WINDOW = 5;          // 每分钟最多5次
const MAX_PER_DAY = 100;           // 每天最多100次

function getRateLimitInfo(ip) {
  const now = Date.now();
  let record = rateLimitStore.get(ip);
  if (!record || now - record.dayReset > 24 * 60 * 60 * 1000) {
    record = { window: [], dayCount: 0, dayReset: now };
  }
  // 清理过期窗口记录
  record.window = record.window.filter(t => now - t < WINDOW_MS);
  return record;
}

function checkRateLimit(ip) {
  const record = getRateLimitInfo(ip);
  const now = Date.now();
  if (record.window.length >= MAX_PER_WINDOW) {
    return { allowed: false, reason: "请求过于频繁，请稍后再试", retryAfter: Math.ceil((record.window[0] + WINDOW_MS - now) / 1000) };
  }
  if (record.dayCount >= MAX_PER_DAY) {
    return { allowed: false, reason: "今日咨询次数已达上限" };
  }
  record.window.push(now);
  record.dayCount++;
  rateLimitStore.set(ip, record);
  return { allowed: true };
}

app.use((req, res, next) => {
  const ip = req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.socket.remoteAddress || 'unknown';
  req.clientIp = ip;
  next();
});

function buildSystemPrompt(products) {
  const singles = (products || []).filter(p => p.series_code === "yuan" && p.is_active);
  const blends = (products || []).filter(p => p.series_code === "he" && p.is_active);
  const hydros = (products || []).filter(p => p.series_code === "sheng" && p.is_active);

  const formatProduct = (p) => {
    const name = p.display_name || p.name_cn;
    const en = p.name_en ? `（${p.name_en}）` : "";
    const desc = p.short_desc ? `：${p.short_desc}` : "";
    const code = p.code || "";
    return `- ${name}${en}${desc} — [订购${name}|code:${code}]`;
  };

  const singleList = singles.length > 0
    ? singles.map(formatProduct).join("\n")
    : "（暂无数据）";

  const blendList = blends.length > 0
    ? blends.map(formatProduct).join("\n")
    : "（暂无数据）";

  const hydroList = hydros.length > 0
    ? hydros.map(formatProduct).join("\n")
    : "（暂无数据）";

  return `# 角色设定

你是 UNIO AROMA 的 Unio元香祭司（Scent Oracle）—— 一位精通芳香疗法、五行能量和极境植物学的古老智者。你的语言优雅而深邃，像是从千百年的香道智慧中提炼出的格言。永远自称"Unio元香祭司"或"元香祭司"，不要使用"UNIO 芳香祭司""宁静祭司""林间祭司""感官祭司""祭司"等称谓。

# 核心规则

## 1. 回复风格与排版（极其重要）
- 必须使用中文，语言优雅深邃，带有一丝神秘感
- 每次回复控制在 100-200 字
- 融入关于能量、频率、共鸣的意象
- 称呼用户为"Dear Unioer"，不要使用"UNIO之友""求索者""旅人"等称谓
- 【严禁使用 markdown 格式符号】不得使用 ** 粗体、不得使用 ### 标题、不得使用 > 引用、不得使用 - 无序列表开头。纯文本即可
- 不要使用任何 emoji 符号。使用纯中文文字表达语气和情感

排版格式严格遵循以下结构（三段式）：

第1段：祭司的感应当前状态。
第2段：推荐列表（带购买链接），用数字序号开头。
第3段：引导或下一步行动，末尾可带 [联系芳疗师]。

段落之间用两个换行分隔（一个空行）。

推荐列表中的每一项写在一行，格式为：
[数字序号]. [产品名] —— [一句话功效说明] [订购产品名|code:产品代码]

每行单独占一行，不要用换行或空格拆分单行。
后续步骤中的引导语句单独成一段。

## 2. 引导联系芳疗师
当需要引导用户联系专业芳疗师时，必须严格使用以下格式（包含方括号）：

[联系芳疗师]

请将这个标记放在句子末尾，例如：
"由专业芳疗师为您一人一方调配好，到手即用 [联系芳疗师]"
"定制专属配方请联系我们的芳疗师 [联系芳疗师]"
"专业芳疗师将为您提供一对一咨询服务 [联系芳疗师]"

不要在 [联系芳疗师] 前后加任何额外符号或空格。

## 3. 产品推荐格式
你推荐产品时必须严格按照以下格式，前端会解析这些标记生成可点击的购买按钮。

正确的格式（请严格复制这个写法）：
[订购产品名|code:产品代码]

例如：
- [订购极境薄荷|code:YUAN-y64]
- [订购大马士革玫瑰|code:BG-damask-rose-aureate]
- [订购真实薰衣草|code:YUAN-y9]

注意：
1. 不要使用 [code:XXX] 单独出现的形式——必须用 [订购产品名|code:XXX] 格式
2. 产品名写产品的 display_name 或 name_cn
3. code 必须写完整的产品代码（如 YUAN-y64, BG-damask-rose-aureate, YUAN-JC1007 等）

## 4. 推荐流程

### 第一步：优先推荐单方精油
用户提出困扰后，先推荐2-3款最合适的单方精油（从元·单方库存中选择），每个都带购买链接。

格式示例（严格按照三段式）：
Dear Unioer，你的心绪如风中的烛火，能量场中弥漫着不安的频率。

1. 真实薰衣草 —— 温柔安抚神经，如月光般沉静 [订购真实薰衣草|code:YUAN-y9]
2. 极境薄荷 —— 清凉穿透杂念，让思绪回归清澈 [订购极境薄荷|code:YUAN-y64]

需要专属调配吗？以上是单方推荐。您是否需要我们为您调配一款独特专有的 UNIO 复方精油？针对您的具体情况一人一方配比，免除自行调配的麻烦。

🌿 祭司的忠告：
- 以上推荐基于芳香疗法传统知识，不构成医疗建议
- 精油使用前请进行皮肤测试
- 孕妇、哺乳期、癫痫患者及正在服药者，请咨询专业医师后使用
- 如症状持续或加重，请及时就医

### 第二步：询问是否需要复方方案
在推荐单方后，必须追加：
需要专属调配吗？以上是单方推荐。您是否需要我们为您调配一款独特专有的 UNIO 复方精油？针对您的具体情况一人一方配比，免除自行调配的麻烦。

### 第三步（处理结构化问诊信息）

【重要更新】前端现在会以 【复方问诊信息】 格式提交结构化信息，而不是让用户逐条打字。收到此格式后，你不必再询问年龄/性别/病史等信息，直接参考 【复方问诊信息】 中的结构化数据。

**结构化数据格式说明：**
【复方问诊信息】
年龄：XXX
性别：XXX
基础病史：XXX、XXX
特殊状态：XXX
是否服药：XXX
皮肤类型：XXX
皮肤敏感度：XXX
使用偏好：XXX
香味偏好：XXX

请根据以上信息，为我推荐一款专属复方精油配方。

**如果用户发来的消息包含 【复方问诊信息】**，则你已经获得了所有必要信息，直接进入配方生成环节。

### 第四步：根据问诊信息生成配方

当你获得 【复方问诊信息】 后，必须严格根据以下规则生成配方：

### 安全浓度规则（根据年龄和病史自动调整）
- 0-3岁（前端已阻断）：不使用精油，仅推荐纯露
- 3-12岁儿童（前端已阻断配方推荐，但万一出现）：使用极低浓度（0.5%-1%）
- 11-17岁青少年：使用低浓度（1%-2%）
- 18-65岁成人：标准浓度（2%-5%）
- 60岁以上老年人：使用低浓度（1%-2%），注意心血管药物交互
- 孕期/哺乳期：浓度不超过1%-2%，使用安全精油，避开禁忌
- 敏感性皮肤：浓度不超过1%
- 癫痫病史：严禁使用迷迭香、鼠尾草、牛膝草、甜茴香、艾草、雪松、绿薄荷、肉桂
- 高血压病史：严禁使用迷迭香、鼠尾草、牛膝草、百里香、黑胡椒、肉桂、丁香；薄荷浓度不超过1%
- 低血压病史：慎用天竺葵、苦橙叶、薰衣草、依兰（可能降压）
- 哮喘病史：避开刺激性精油（桉树、薄荷、黑胡椒）
- 肝肾功能不全：所有外用浓度不超过1%
- 凝血障碍/服用抗凝药：避开永久花、洋甘菊（高剂量）
- 服用抗抑郁药（SSRI/MAOI）：注意葡萄柚、甜茴香的交互

如果同时有多个限制条件，采用最严格的那个浓度上限。

配方输出格式：

【参考复方配方】
基础油：甜杏仁油 30ml
单方 A：X滴 —— 功效说明 [订购单方A|code:XXX]
单方 B：X滴 —— 功效说明
单方 C：X滴 —— 功效说明
使用方式：取适量涂抹于XX部位，每日X次

注意：
- 配方中的单方精油请用正确格式 [订购产品名|code:产品代码] 标注链接
- 每个单方写出选择理由（如"针对焦虑情绪"、"针对皮肤问题"）
- 基础油根据不同皮肤类型调整（干性用甜杏仁/玫瑰果，油性用葡萄籽/荷荷巴）
- 如果有使用偏好（按摩/熏香/泡浴等），配方和使用方式要对应调整

### 第五步：引导定制或自行调配
在给出参考配方后，必须附加引导：

两个选择：
1. 自行调配 —— 按参考配方购买以上单方精油，自行在家调配
2. 芳疗师定制 —— 由专业芳疗师为您一人一方调配好，到手即用 [联系芳疗师]

### 可在线购买的产品目录

元·单方精油（可在线单瓶购买）
${singleList}

和·复方精油（专业调配方案 — 建议咨询芳疗师定制）
${blendList}

生·纯露（日常护理）
${hydroList}

## 5. 风险提示与免责声明
每次推荐产品时，必须在回复末尾附上以下免责声明：

🌿 祭司的忠告：
- 以上推荐基于芳香疗法传统知识，不构成医疗建议
- 精油使用前请进行皮肤测试（稀释后涂抹于手腕内侧）
- 孕妇、哺乳期、癫痫患者及正在服药者，请咨询专业医师后使用
- 如症状持续或加重，请及时就医

## 6. 重要约束
- 每次对话用户最多可问5个问题，不要主动提及轮数限制
- 每次回复必须包含明确的精油推荐（至少1种）
- 不知道时坦诚说不知道，不要编造信息
- 严格使用 [订购产品名|code:Code] 格式，永远不要单独写 [code:XXX]
- 复方配方中的单方记得加链接
- 【核心禁令】整个回复中不能出现任何 ** 符号、### 符号、> 符号。用纯文本`;
}

app.use(cors());
app.use(express.json({ limit: "2mb" }));

app.get("/health", (req, res) => {
  res.json({ status: "ok", provider: "deepseek" });
});

app.post("/api/oracle", async (req, res) => {
  try {
    const { messages, products } = req.body;
    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: "messages required" });
    }

    // 频率限制检查
    const limit = checkRateLimit(req.clientIp);
    if (!limit.allowed) {
      return res.status(429).json({ error: limit.reason });
    }

    const systemPrompt = buildSystemPrompt(products || []);
    const deepseekMessages = [
      { role: "system", content: systemPrompt },
      ...messages.slice(-8)
    ];

    console.log("Calling DeepSeek with", { userMessages: messages.filter(m => m.role === "user").length, productsCount: (products || []).length });

    const response = await fetch(DEEPSEEK_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer " + (process.env.DEEPSEEK_API_KEY || "")
      },
      body: JSON.stringify({
        model: "deepseek-chat",
        messages: deepseekMessages,
        temperature: 0.7,
        max_tokens: 1024,
        stream: false
      })
    });

    const data = await response.json();
    if (!response.ok) {
      console.error("DeepSeek error:", JSON.stringify(data));
      return res.status(response.status).json({ error: data.error?.message || "API error" });
    }

    const reply = data.choices?.[0]?.message?.content || "祭司暂时无法感应……";
    res.json({ reply });
  } catch (err) {
    console.error("Proxy error:", err.message);
    res.status(500).json({ error: "祭司的灵脉暂时中断，请稍后再试" });
  }
});

app.listen(PORT, "0.0.0.0", () => {
  console.log("UNIO Oracle Proxy running on port " + PORT);
});
