/**
 * UNIO AROMA 前台 - 感官祭司 AI 聊天页
 * v4 — 复方问诊勾选表单集成
 */
import { useState, useEffect, useRef, useCallback } from 'react';
import { ArrowRight, Activity, Wind, MessageCircle, Loader2, RefreshCw, ShoppingCart, AlertTriangle, FlaskRound } from 'lucide-react';
import { getProducts } from '../siteDataService';
import type { Product } from '../types';
import BlendingQuestionnaire, { serializeQuestionnaire, QuestionnaireData, DEFAULT_QUESTIONNAIRE } from '../components/BlendingQuestionnaire';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

interface SiteOracleProps {
  onNavigate: (view: string, params?: any) => void;
  onShowWechat?: () => void;
}

// 阿里云 DeepSeek 代理地址
const ORACLE_API = '/api/oracle-proxy';

// 最大咨询轮数
const MAX_TURNS = 5;

// localStorage 键名
const STORAGE_KEY = 'unio_oracle_messages';
const QUESTIONNAIRE_KEY = 'unio_blending_questionnaire';

// 欢迎语
const GREETING = '从极境撷取芳香，因世界元于一息。\n\n我是 UNIO元香祭司，已准备好感知你此刻的杂音。';

// 预设问题（方便用户快速选择）
const QUICK_QUESTIONS = [
  '最近总是焦虑失眠...',
  '皮肤暗沉、缺乏光泽',
  '工作中注意力不集中',
  '秋冬干燥，喉咙不舒服',
  '肩颈酸痛，浑身疲惫',
  '想提升空间能量场'
];

// 匹配用户"要复方"意图的关键词
const BLENDING_INTENT_PATTERNS = [
  /要.*(复方|配方|调配|定制|调)/i,
  /需要.*(复方|调配|定制|配方)/i,
  /想.*(复方|调|定制|搭配)/i,
  /复方.*(吧|啊|下|试试|可以)/i,
  /帮我.*(复方|配|调|定)/i,
  /请.*(复方|配|调|定)/i,
  /好.*(复方|配|调)/i,
  /可以.*(复方|配|调)/i,
  /定制.*(配方|复方|精油)/i,
  /一人一方/i,
  /专属.*(配方|调配|复方)/i,
];

/**
 * 检测用户消息是否表达了"要复方"的意图
 */
function isBlendingIntent(text: string): boolean {
  // 这些模式表示用户还在描述问题，不是要复方
  const skipPatterns = [
    /复方.*是.*什么/i,
    /什么.*是.*复方/i,
    /复方.*介绍/i,
    /复方.*价格/i,
    /复方.*多少钱/i,
  ];
  for (const sp of skipPatterns) {
    if (sp.test(text)) return false;
  }

  for (const p of BLENDING_INTENT_PATTERNS) {
    if (p.test(text)) return true;
  }
  return false;
}

/**
 * 检测祭司上一条回复是否在询问"是否需要复方"
 */
function isAskingForBlend(content: string): boolean {
  const askPatterns = [
    /是否需要.*复方/i,
    /需要.*复方/i,
    /要不要.*复方/i,
    /要.*定制.*复方/i,
    /要.*调配.*复方/i,
    /为您调配.*复方/i,
    /一人一方/i,
  ];
  return askPatterns.some(p => p.test(content));
}

/**
 * 从 localStorage 读取已保存的对话
 */
function loadMessages(): ChatMessage[] {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch {}
  return [{ role: 'assistant', content: GREETING }];
}

/**
 * 保存对话到 localStorage
 */
function saveMessages(messages: ChatMessage[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
  } catch {}
}

/**
 * 保存问诊表单数据
 */
function saveQuestionnaireData(data: QuestionnaireData) {
  try {
    localStorage.setItem(QUESTIONNAIRE_KEY, JSON.stringify(data));
  } catch {}
}

/**
 * 加载问诊表单数据
 */
function loadQuestionnaireData(): QuestionnaireData | null {
  try {
    const saved = localStorage.getItem(QUESTIONNAIRE_KEY);
    if (saved) return JSON.parse(saved);
  } catch {}
  return null;
}

const SiteOracle: React.FC<SiteOracleProps> = ({ onNavigate, onShowWechat }) => {
  const [messages, setMessages] = useState<ChatMessage[]>(loadMessages);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [turnCount, setTurnCount] = useState(0);
  const [reachLimit, setReachLimit] = useState(false);
  const [apiError, setApiError] = useState(false);

  // 复方问诊表单状态
  const [showQuestionnaire, setShowQuestionnaire] = useState(false);
  const [lastBlendingData, setLastBlendingData] = useState<QuestionnaireData | null>(null);

  const scrollRef = useRef<HTMLDivElement>(null);
  const productsLoaded = useRef(false);
  const savedRef = useRef(false);

  // 页面加载时获取产品知识库
  useEffect(() => {
    if (productsLoaded.current) return;
    productsLoaded.current = true;
    getProducts()
      .then(data => {
        console.log(`祭司已感知 ${data.length} 种芳香精灵`);
        setProducts(data);
      })
      .catch(err => console.warn('未能加载产品知识库:', err));
  }, []);

  // 同步对话到 localStorage
  useEffect(() => {
    if (!savedRef.current) {
      savedRef.current = true;
      return;
    }
    saveMessages(messages);
  }, [messages]);

  // 自动滚动
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
    }
  }, [messages, loading, showQuestionnaire]);

  const sendToOracle = useCallback(async (userMessage: string, history: ChatMessage[]) => {
    const recentHistory = history.slice(-6);
    const payload = {
      messages: [
        ...recentHistory.filter(m => m.role === 'user' || m.role === 'assistant'),
        { role: 'user', content: userMessage }
      ],
      products: products.map(p => ({
        id: p.id,
        code: p.code,
        display_name: p.display_name || p.name_cn,
        name_cn: p.name_cn,
        name_en: p.name_en || '',
        series_code: p.series_code,
        short_desc: p.short_desc || '',
        benefits: p.benefits || [],
        is_active: p.is_active,
        category: p.category || ''
      }))
    };

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000);

      const resp = await fetch(ORACLE_API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        signal: controller.signal
      });
      clearTimeout(timeoutId);

      if (!resp.ok) {
        const err = await resp.json().catch(() => ({}));
        throw new Error((err as any).error || `HTTP ${resp.status}`);
      }

      const data = await resp.json();
      setApiError(false);
      return data.reply || '祭司暂时无法感应……';
    } catch (err: any) {
      console.error('Oracle API error:', err);
      setApiError(true);
      if (err.name === 'TimeoutError' || err.message?.includes('timeout') || err.name === 'AbortError') {
        return '祭司的灵脉需要更长的时间感应……请稍后再试。';
      }
      return '祭司的灵脉暂时中断（' + (err.message?.split('\n')[0]?.substring(0, 50) || '未知') + '），请稍后再试。';
    }
  }, [products]);

  const handleSend = useCallback(async () => {
    const trimmedInput = input.trim();
    if (!trimmedInput || loading || reachLimit) return;

    // 检查是否已达到上限
    if (turnCount >= MAX_TURNS) {
      setReachLimit(true);
      return;
    }

    setInput('');
    const userMsg: ChatMessage = { role: 'user', content: trimmedInput };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setLoading(true);
    setTurnCount(prev => prev + 1);

    // 检测是否表达了"要复方"的意图
    // 检查上一条祭司消息是否在询问复方
    const lastAssistantMsg = [...messages].reverse().find(m => m.role === 'assistant');
    const shouldShowForm = (
      isBlendingIntent(trimmedInput) ||
      (lastAssistantMsg && isAskingForBlend(lastAssistantMsg.content) && /^(好|可以|要|是|嗯|行|ok|试试|对的)/i.test(trimmedInput))
    );

    if (shouldShowForm) {
      // 不发送到API，而是展示问诊表单
      setLoading(false);
      setShowQuestionnaire(true);
      // 加载之前保存过的问诊数据（如果有）
      const savedData = loadQuestionnaireData();
      if (savedData) {
        setLastBlendingData(savedData);
      }
      return;
    }

    const reply = await sendToOracle(trimmedInput, messages);

    setMessages(prev => [...prev, { role: 'assistant', content: reply }]);
    setLoading(false);
  }, [input, loading, reachLimit, turnCount, messages, sendToOracle]);

  /**
   * 问诊表单提交后的回调
   */
  const handleQuestionnaireSubmit = useCallback((data: QuestionnaireData) => {
    setShowQuestionnaire(false);
    setLastBlendingData(data);
    saveQuestionnaireData(data);

    const serialized = serializeQuestionnaire(data);

    // 将结构化的问诊数据作为用户消息发送
    const userMsg: ChatMessage = {
      role: 'user',
      content: `我想要一款专属复方精油。${serialized}`
    };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);

    // 消耗一次轮数（如果还没消耗的话）
    setTurnCount(prev => prev + 1);

    // 发送请求
    setLoading(true);
    sendToOracle(userMsg.content, messages).then(reply => {
      setMessages(prev => [...prev, { role: 'assistant', content: reply }]);
      setLoading(false);
    });
  }, [messages, sendToOracle]);

  const handleQuestionnaireCancel = useCallback(() => {
    setShowQuestionnaire(false);
  }, []);

  const handleReset = useCallback(() => {
    const fresh: ChatMessage[] = [{ role: 'assistant', content: GREETING }];
    setMessages(fresh);
    setTurnCount(0);
    setReachLimit(false);
    setApiError(false);
    setShowQuestionnaire(false);
    setLastBlendingData(null);
    saveMessages(fresh);
  }, []);

  // 快速选择问题
  const handleQuickQuestion = useCallback((q: string) => {
    setInput(q);
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-[#F5F5F5] relative overflow-hidden pt-20 pb-10">
      {/* 顶部状态栏 */}
      <div className="fixed top-20 left-1/2 -translate-x-1/2 z-[600]">
        <div className="px-6 py-2 rounded-full border bg-white/80 backdrop-blur-xl shadow-lg border-green-100 flex items-center gap-3">
          <div className={`w-2 h-2 rounded-full ${apiError ? 'bg-red-500' : 'bg-green-500'} animate-pulse`} />
          <span className="text-[10px] font-bold tracking-widest uppercase text-black/60">
            {apiError ? '祭司信号弱 · 重连中' : `祭司在线 · ${turnCount}/${MAX_TURNS}`}
          </span>
        </div>
      </div>

      {/* 聊天主体 */}
      <div className="max-w-4xl mx-auto w-full flex-1 flex flex-col bg-white rounded-[2.5rem] md:rounded-[4rem] shadow-2xl overflow-hidden border border-black/5 relative mb-4">
        {/* 头部 */}
        <div className="p-4 md:p-10 border-b border-black/5 bg-white/90 backdrop-blur-xl sticky top-0 z-10 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 md:w-14 md:h-14 bg-black rounded-full flex items-center justify-center text-[#D4AF37]">
              <Activity size={24} className={loading ? 'animate-pulse' : ''} />
            </div>
            <div>
              <h3 className="text-xl md:text-3xl font-bold tracking-widest text-black/80">UNIO元香祭司</h3>
              <p className="text-[7px] md:text-[9px] tracking-[0.4em] uppercase opacity-30 font-bold mt-1">DeepSeek Scent Oracle · UNIO</p>
            </div>
          </div>
          <button
            onClick={handleReset}
            className="p-2 hover:bg-stone-50 rounded-full text-black/20 transition-all"
            title="重置对话"
          >
            <RefreshCw size={20} />
          </button>
        </div>

        {/* 消息区域 */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 md:p-12 space-y-8 md:space-y-12" style={{ minHeight: '400px' }}>
          {messages.map((m, i) => (
            <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`group relative max-w-[90%] md:max-w-[80%] p-5 md:p-10 rounded-[1.8rem] md:rounded-[3rem] text-sm md:text-xl leading-relaxed whitespace-pre-line ${
                m.role === 'user'
                  ? 'bg-[#1a1a1a] text-white rounded-tr-none shadow-xl'
                  : 'bg-[#FAF9F5] text-black/80 rounded-tl-none'
              }`}>
                {renderMessageContent(m.content, onNavigate, onShowWechat)}
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex justify-start">
              <div className="bg-[#FAF9F5] p-5 md:p-10 rounded-[1.8rem] md:rounded-[3rem] text-black/30 italic flex items-center gap-4">
                <Wind size={20} className="animate-spin text-[#D75437]" />
                祭司正在调配极境分子频率...
              </div>
            </div>
          )}

          {/* 复方问诊表单嵌入 */}
          {showQuestionnaire && (
            <div className="flex justify-start">
              <div className="w-full max-w-xl">
                <BlendingQuestionnaire
                  onSubmit={handleQuestionnaireSubmit}
                  onCancel={handleQuestionnaireCancel}
                  onContactWechat={onShowWechat}
                />
              </div>
            </div>
          )}

          {/* 5次咨询已满提示 */}
          {reachLimit && (
            <div className="flex justify-center">
              <div className="bg-amber-50 border border-amber-200 p-4 md:p-6 rounded-2xl text-center max-w-md">
                <AlertTriangle size={24} className="text-amber-500 mx-auto mb-2" />
                <p className="text-sm md:text-base text-amber-800 font-medium">
                  本次咨询已达 {MAX_TURNS} 次上限
                </p>
                <p className="text-xs md:text-sm text-amber-600 mt-1">
                  祭司需要回归极境汲取新的智慧。<br />
                  点击右上角重置按钮，开启新的对话。
                </p>
              </div>
            </div>
          )}

          {/* 快速选择问题（仅当无对话且无复方表单时） */}
          {messages.length === 1 && !loading && !reachLimit && !showQuestionnaire && (
            <div className="mt-8">
              <p className="text-xs text-black/20 text-center mb-4 tracking-widest uppercase">—— 诉说你的困扰 ——</p>
              <div className="flex flex-wrap justify-center gap-2 md:gap-3 px-4">
                {QUICK_QUESTIONS.map((q, i) => (
                  <button
                    key={i}
                    onClick={() => handleQuickQuestion(q)}
                    className="px-4 py-2 md:px-6 md:py-3 bg-[#FAF9F5] hover:bg-black hover:text-white border border-black/10 rounded-full text-xs md:text-sm transition-all duration-300 text-black/60"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* 输入区域 */}
        <div className="p-4 md:p-10 bg-[#F5F5F5]/50 border-t border-black/5">
          <div className="max-w-3xl mx-auto flex gap-3 md:gap-6 bg-white p-2 md:p-4 rounded-full shadow-xl border border-black/5">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder={
                showQuestionnaire ? '请先完成上方的问诊表单'
                : loading ? '祭司沉思中...'
                : reachLimit ? '咨询已达上限，请重置对话'
                : '倾诉你内心的杂音...'
              }
              disabled={loading || reachLimit || showQuestionnaire}
              className="flex-1 px-4 md:px-10 outline-none text-sm md:text-lg bg-transparent placeholder:opacity-20 min-w-0"
            />
            <button
              onClick={handleSend}
              disabled={loading || !input.trim() || reachLimit || showQuestionnaire}
              className="w-10 h-10 md:w-16 md:h-16 bg-[#1a1a1a] text-white rounded-full flex items-center justify-center hover:bg-[#D75437] transition-all disabled:opacity-20 active:scale-95 shadow-lg shrink-0"
            >
              {loading ? <Loader2 className="animate-spin" /> : <ArrowRight className="w-5 h-5 md:w-8 md:h-8" />}
            </button>
          </div>
          {/* 复方表单提示 */}
          {showQuestionnaire && (
            <p className="text-center text-xs text-black/30 mt-3 flex items-center justify-center gap-1.5">
              <FlaskRound size={12} />
              祭司正在了解你的身体状况，以便精准调配
            </p>
          )}
          {reachLimit && (
            <p className="text-center text-xs text-amber-500 mt-3">
              点击右上角 <RefreshCw size={12} className="inline" /> 重置按钮开始新对话
            </p>
          )}

          {/* 上次问诊数据快捷恢复 */}
          {lastBlendingData && !showQuestionnaire && messages.length > 2 && (
            <div className="mt-3 flex justify-center">
              <button
                onClick={() => setShowQuestionnaire(true)}
                className="inline-flex items-center gap-1.5 px-3 py-2 text-[10px] text-black/40 hover:text-black/70 border border-black/8 rounded-full hover:bg-white transition-all"
              >
                <FlaskRound size={12} />
                修改问诊信息，重新调配复方
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

/**
 * 渲染消息内容，将购买链接标记转为可点击的产品详情按钮
 * 同时将"祭司的忠告"免责声明块渲染为独立警示卡片
 * 支持的格式（3种，按优先级）：
 *   1. [订购产品名|code:XXX]       ← 主要格式
 *   2. [code:XXX]                  ← 退化格式
 *   3. [订购元·XXX]                 ← 极旧格式兼容
 *   4. [联系芳疗师] / [咨询芳疗师]  ← 统一打开微信客服二维码
 */
function renderMessageContent(content: string, onNavigate: (view: string, params?: any) => void, onShowWechat?: () => void) {
  if (!content) return null;

  // 检测是否包含"祭司的忠告"免责声明块
  const disclaimerIdx = content.indexOf('祭司的忠告');
  if (disclaimerIdx >= 0) {
    const sliceStart = content.lastIndexOf('🌿', disclaimerIdx);
    if (sliceStart >= 0) {
      const mainBody = content.slice(0, sliceStart).trim();
      const disclaimer = content.slice(sliceStart).trim();
      return (
        <>
          {renderMarkup(mainBody, onNavigate, false, onShowWechat)}
          <div className="mt-6 pt-4 border-t border-amber-200/50">
            {renderMarkup(disclaimer, onNavigate, true, onShowWechat)}
          </div>
        </>
      );
    }
  }

  return renderMarkup(content, onNavigate, false, onShowWechat);
}

/**
 * 渲染富文本标记（购买链接 + 文本），可选是否为警示模式
 */
function renderMarkup(
  text: string,
  onNavigate: (view: string, params?: any) => void,
  isDisclaimer: boolean = false,
  onShowWechat?: () => void
) {
  const parts = text.split(/(\[[^\]]*\])/g);

  if (isDisclaimer) {
    const bodyParts = text.split(/🌿\s*\**祭司的忠告\**/);
    const disclaimerBody = bodyParts[bodyParts.length - 1]?.trim() || text;
    return (
      <div className="bg-amber-50/80 border border-amber-200/60 rounded-xl px-4 py-3 md:px-5 md:py-4">
        <div className="flex items-center gap-2 mb-2">
          <AlertTriangle size={14} className="text-amber-600 shrink-0" />
          <span className="text-[10px] md:text-[11px] font-bold tracking-widest uppercase text-amber-800">
            安全提示
          </span>
        </div>
        <div className="text-[11px] md:text-[13px] leading-relaxed text-amber-700/90 whitespace-pre-wrap">
          {disclaimerBody}
        </div>
      </div>
    );
  }

  return (
    <>
      {parts.map((part, i) => {
        const btn = renderButton(part, onNavigate, onShowWechat);
        if (btn) return <span key={i}>{btn}</span>;
        return <span key={i} className="whitespace-pre-line">{part}</span>;
      })}
    </>
  );
}

/**
 * 将单个标记片段转为可点击按钮，不匹配则返回 null
 */
function renderButton(part: string, onNavigate: (view: string, params?: any) => void, onShowWechat?: () => void) {
  // 1. [订购产品名|code:XXX] — 标准格式
  const orderCodeMatch = part.match(/^\[订购(.+)\|code:(.+)\]$/);
  if (orderCodeMatch) {
    const productName = orderCodeMatch[1].trim();
    const productCode = orderCodeMatch[2].trim();
    return (
      <button
        onClick={() => onNavigate('product', { productCode })}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 md:px-4 md:py-2 bg-[#D75437] text-white rounded-full text-xs md:text-sm hover:bg-[#c04a30] transition-all mx-1 shadow-sm"
        title="查看产品详情"
      >
        <ShoppingCart size={14} />
        {productName}
      </button>
    );
  }

  // 2. [code:XXX] — 退化格式
  const bareCodeMatch = part.match(/^\[code:(.+)\]$/);
  if (bareCodeMatch) {
    const productCode = bareCodeMatch[1].trim();
    return (
      <button
        onClick={() => onNavigate('product', { productCode })}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 md:px-4 md:py-2 bg-[#D75437] text-white rounded-full text-xs md:text-sm hover:bg-[#c04a30] transition-all mx-1 shadow-sm"
        title={productCode}
      >
        <ShoppingCart size={14} />
        查看{productCode}
      </button>
    );
  }

  // 3. [订购元·XXX] / [订购生·XXX] 旧格式
  const oldOrderMatch = part.match(/^\[订购(元|生)·(.+)\]$/);
  if (oldOrderMatch) {
    const seriesCode = oldOrderMatch[1] === '元' ? 'yuan' : 'sheng';
    const productName = oldOrderMatch[2];
    return (
      <button
        onClick={() => onNavigate('collections', { series: seriesCode })}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 md:px-4 md:py-2 bg-[#D75437] text-white rounded-full text-xs md:text-sm hover:bg-[#c04a30] transition-all mx-1 shadow-sm"
        title="前往馆藏页"
      >
        <ShoppingCart size={14} />
        {productName}
      </button>
    );
  }

  // 4. [联系芳疗师] [咨询芳疗师] [联系我们芳疗师] [联系专业芳疗师] — 打开微信客服二维码
  if (part === '[联系芳疗师]' || part === '[咨询芳疗师]' || part === '[联系我们芳疗师]' || part === '[联系专业芳疗师]') {
    return (
      <button
        onClick={() => onShowWechat?.()}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 md:px-4 md:py-2 bg-[#07C160] text-white rounded-full text-xs md:text-sm hover:bg-[#06ad56] transition-all mx-1 shadow-sm"
      >
        <MessageCircle size={14} />
        联系芳疗师
      </button>
    );
  }

  return null;
}

export default SiteOracle;
