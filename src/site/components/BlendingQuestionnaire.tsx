/**
 * UNIO AROMA 前台 — 复方精油问诊勾选表单
 *
 * 用户同意配复方后弹出，通过勾选替代大段文字描述。
 * 收集：年龄段、性别、基础病史、特殊状态、皮肤类型、使用偏好等。
 *
 * 设计原则：
 * - 极简奢华风格，与品牌视觉一致
 * - 分步（必填 → 选填），避免一次性信息过载
 * - 儿童（≤10岁）自动阻断，建议联系芳疗师
 * - 安全勾选联动（选中孕期/癫痫等，显示提示）
 */

import { useState, useCallback, useRef } from 'react';
import { AlertTriangle, ChevronLeft, ChevronRight, X, Sparkles, Heart, Shield } from 'lucide-react';

/* ============================================
   Types
   ============================================ */

export interface QuestionnaireData {
  /** 年龄段 */
  ageGroup: string;
  /** 性别 */
  gender: string;
  /** 基础病史（多选） */
  conditions: string[];
  /** 特殊状态（多选，如孕期/哺乳期） */
  specialStatus: string[];
  /** 是否有在服药 */
  onMedication: 'yes' | 'no' | '';
  /** 药物详情（服用什么药） */
  medicationDetails: string;
  /** 皮肤类型 */
  skinType: string;
  /** 皮肤敏感度 */
  skinSensitivity: string;
  /** 使用方式偏好 */
  usagePreference: string;
  /** 香味偏好 */
  scentPreference: string;
}

export const DEFAULT_QUESTIONNAIRE: QuestionnaireData = {
  ageGroup: '',
  gender: '',
  conditions: [],
  specialStatus: [],
  onMedication: '',
  medicationDetails: '',
  skinType: '',
  skinSensitivity: '',
  usagePreference: '',
  scentPreference: '',
};

/* ============================================
   Props
   ============================================ */

interface BlendingQuestionnaireProps {
  onSubmit: (data: QuestionnaireData) => void;
  onCancel: () => void;
  onContactWechat?: () => void;
}

/* ============================================
   Options
   ============================================ */

const AGE_GROUPS = [
  { value: '0-10', label: '10岁以下', note: '不适合复方精油' },
  { value: '11-17', label: '11-17岁', note: '青少年，需低浓度' },
  { value: '18-30', label: '18-30岁' },
  { value: '31-45', label: '31-45岁' },
  { value: '46-60', label: '46-60岁' },
  { value: '60+', label: '60岁以上', note: '老年，需低浓度' },
];

const GENDERS = [
  { value: 'male', label: '男性' },
  { value: 'female', label: '女性' },
];

const CONDITIONS = [
  { value: 'none', label: '无基础病', sensitive: false },
  { value: 'hypertension', label: '高血压', sensitive: false, warning: '将避开迷迭香、鼠尾草等升压精油' },
  { value: 'hypotension', label: '低血压', sensitive: false, warning: '将控制降压类精油的用量' },
  { value: 'epilepsy', label: '癫痫', sensitive: true, warning: '将避开迷迭香、鼠尾草、牛膝草等，严格控量' },
  { value: 'asthma', label: '哮喘', sensitive: true, warning: '将避免刺激性精油，建议熏香时保持通风' },
  { value: 'skin_disease', label: '皮肤病（湿疹/银屑病等）', sensitive: false, warning: '将使用低浓度配方，避开刺激成分' },
  { value: 'allergy', label: '过敏体质', sensitive: false, warning: '建议先做皮肤敏感测试' },
  { value: 'liver_kidney', label: '肝肾功能不全', sensitive: true, warning: '将使用极低浓度（1%以下）' },
  { value: 'heart_disease', label: '心脏病', sensitive: true, warning: '将避开兴奋类精油' },
  { value: 'diabetes', label: '糖尿病', sensitive: false, warning: '将注意血糖相关精油的用量' },
  { value: 'coagulation', label: '凝血障碍', sensitive: true, warning: '将避开永久花等影响凝血类精油' },
  { value: 'thyroid', label: '甲状腺功能异常', sensitive: false, warning: '将注意激素活性类精油' },
  { value: 'cancer', label: '癌症史（尤其激素相关）', sensitive: true, warning: '请务必咨询主治医师后使用' },
  { value: 'other', label: '其他', sensitive: false },
];

const SPECIAL_STATUS = [
  { value: 'none', label: '无特殊状态', sensitive: false },
  { value: 'pregnant', label: '孕期', sensitive: true, warning: '前三甲禁用大多数精油。将使用极低浓度（1%以下）或仅推荐纯露' },
  { value: 'breastfeeding', label: '哺乳期', sensitive: true, warning: '将避开薄荷、鼠尾草等影响乳汁的精油' },
  { value: 'preparing', label: '备孕期', sensitive: false, warning: '将使用温和配方，避开强激素活性精油' },
  { value: 'post_surgery', label: '近期手术（3个月内）', sensitive: true, warning: '伤口未愈合区域避免涂抹精油' },
];

const SKIN_TYPES = [
  { value: '', label: '不太清楚 / 无特殊' },
  { value: 'dry', label: '干性' },
  { value: 'oily', label: '油性' },
  { value: 'combination', label: '混合性' },
  { value: 'neutral', label: '中性' },
  { value: 'sensitive', label: '敏感性' },
];

const SKIN_SENSITIVITIES = [
  { value: '', label: '不太清楚 / 无特殊' },
  { value: 'normal', label: '耐受良好' },
  { value: 'mild', label: '轻度敏感' },
  { value: 'high', label: '极易过敏/有皮炎史' },
];

const USAGE_PREFERENCES = [
  { value: '', label: '无所谓，听从祭司建议' },
  { value: 'massage', label: '按摩（搭配载体油）' },
  { value: 'aromatherapy', label: '熏香 / 扩香' },
  { value: 'bath', label: '泡浴' },
  { value: 'inhalation', label: '直接吸入' },
  { value: 'topical', label: '局部涂抹 / 滚珠' },
  { value: 'spray', label: '喷雾' },
];

const SCENT_PREFERENCES = [
  { value: '', label: '无特殊偏好' },
  { value: 'floral', label: '花香调（玫瑰/薰衣草/洋甘菊等）' },
  { value: 'woody', label: '木质调（雪松/檀香/松等）' },
  { value: 'citrus', label: '柑橘调（甜橙/柠檬/葡萄柚等）' },
  { value: 'herbal', label: '草本调（薄荷/迷迭香/罗勒等）' },
  { value: 'spicy', label: '辛香调（姜/肉桂/黑胡椒等）' },
  { value: 'earthy', label: '树脂调（乳香/没药/安息香等）' },
];

/* ============================================
   Utility — 将表单数据转为 AI 可理解的文本
   ============================================ */

export function serializeQuestionnaire(data: QuestionnaireData): string {
  const parts: string[] = [];

  // 年龄
  const ageLabel = AGE_GROUPS.find(a => a.value === data.ageGroup)?.label || data.ageGroup;
  parts.push(`年龄：${ageLabel}`);

  // 性别
  if (data.gender) {
    parts.push(`性别：${GENDERS.find(g => g.value === data.gender)?.label || data.gender}`);
  }

  // 基础病
  if (data.conditions.includes('none') || data.conditions.length === 0) {
    parts.push('无基础病史');
  } else {
    const condLabels = data.conditions
      .filter(c => c !== 'none')
      .map(c => CONDITIONS.find(cond => cond.value === c)?.label || c);
    parts.push(`基础病史：${condLabels.join('、')}`);
  }

  // 特殊状态（孕期/哺乳期等最优先提及）
  if (data.specialStatus.includes('none') || data.specialStatus.length === 0) {
    // 不添加
  } else {
    const statusLabels = data.specialStatus
      .filter(s => s !== 'none')
      .map(s => SPECIAL_STATUS.find(st => st.value === s)?.label || s);
    parts.push(`特殊状态：${statusLabels.join('、')}`);
  }

  // 用药
  if (data.onMedication === 'yes') {
    const details = data.medicationDetails?.trim();
    if (details) {
      parts.push(`正在服用药物：${details}`);
    } else {
      parts.push('正在服用药物（请祭司在配方中注意药物交互作用）');
    }
  }

  // 皮肤
  const skinLabel = SKIN_TYPES.find(s => s.value === data.skinType)?.label;
  if (skinLabel && data.skinType) {
    parts.push(`皮肤类型：${skinLabel}`);
  }
  const sensLabel = SKIN_SENSITIVITIES.find(s => s.value === data.skinSensitivity)?.label;
  if (sensLabel && data.skinSensitivity) {
    parts.push(`皮肤敏感度：${sensLabel}`);
  }

  // 使用偏好
  const usageLabel = USAGE_PREFERENCES.find(u => u.value === data.usagePreference)?.label;
  if (usageLabel && data.usagePreference) {
    parts.push(`使用偏好：${usageLabel}`);
  }

  // 香味偏好
  const scentLabel = SCENT_PREFERENCES.find(s => s.value === data.scentPreference)?.label;
  if (scentLabel && data.scentPreference) {
    parts.push(`香味偏好：${scentLabel}`);
  }

  return `【复方问诊信息】\n${parts.join('\n')}\n\n请根据以上信息，为我推荐一款专属复方精油配方。需包含：基础油、单方精油及滴数、使用方式。`;
}

/* ============================================
   步骤定义
   ============================================ */

type Step = 'step1' | 'step2' | 'blocked';

/* ============================================
   Component
   ============================================ */

const BlendingQuestionnaire: React.FC<BlendingQuestionnaireProps> = ({ onSubmit, onCancel, onContactWechat }) => {
  const [data, setData] = useState<QuestionnaireData>({ ...DEFAULT_QUESTIONNAIRE });
  const [step, setStep] = useState<Step>('step1');
  const scrollRef = useRef<HTMLDivElement>(null);

  // 基础病是否选了"全无"
  const hasNoConditions = data.conditions.includes('none');
  const hasNoStatus = data.specialStatus.includes('none');

  // 是否是儿童
  const isChild = data.ageGroup === '0-10';

  // 是否有安全警告
  const warnings = useCallback(() => {
    const list: string[] = [];
    for (const c of data.conditions) {
      const cond = CONDITIONS.find(x => x.value === c);
      if (cond?.warning) list.push(cond.warning);
    }
    for (const s of data.specialStatus) {
      const st = SPECIAL_STATUS.find(x => x.value === s);
      if (st?.warning) list.push(st.warning);
    }
    return [...new Set(list)];
  }, [data.conditions, data.specialStatus])();

  // 是否有敏感选项
  const hasSensitive = (() => {
    for (const c of data.conditions) {
      if (CONDITIONS.find(x => x.value === c)?.sensitive) return true;
    }
    for (const s of data.specialStatus) {
      if (SPECIAL_STATUS.find(x => x.value === s)?.sensitive) return true;
    }
    return false;
  })();

  const handleConditionToggle = (value: string) => {
    setData(prev => {
      let conditions = [...prev.conditions];
      if (value === 'none') {
        if (conditions.includes('none')) {
          // 再点一次"无"→ 取消"无"，恢复到可自由勾选
          conditions = [];
        } else {
          conditions = ['none'];
        }
      } else {
        conditions = conditions.filter(c => c !== 'none');
        if (conditions.includes(value)) {
          conditions = conditions.filter(c => c !== value);
        } else {
          conditions.push(value);
        }
      }
      return { ...prev, conditions };
    });
  };

  const handleStatusToggle = (value: string) => {
    setData(prev => {
      let status = [...prev.specialStatus];
      if (value === 'none') {
        if (status.includes('none')) {
          // 再点一次"无"→ 取消"无"，恢复到可自由勾选
          status = [];
        } else {
          status = ['none'];
        }
      } else {
        status = status.filter(s => s !== 'none');
        if (status.includes(value)) {
          status = status.filter(s => s !== value);
        } else {
          status.push(value);
        }
      }
      return { ...prev, specialStatus: status };
    });
  };

  const canProceedStep1 = (): boolean => {
    if (!data.ageGroup) return false;
    if (!data.gender) return false;
    if (data.conditions.length === 0) return false;
    if (data.specialStatus.length === 0) return false;
    return true;
  };

  const handleNext = () => {
    if (isChild) {
      setStep('blocked');
      return;
    }
    setStep('step2');
    setTimeout(() => scrollRef.current?.scrollTo({ top: 0, behavior: 'smooth' }), 50);
  };

  const handleSubmit = () => {
    if (!data.ageGroup || !data.gender) return;
    onSubmit(data);
  };

  const handleAgeSelect = (value: string) => {
    if (value === '0-10') {
      setData(prev => ({ ...prev, ageGroup: value }));
    } else {
      setData(prev => ({ ...prev, ageGroup: value }));
    }
  };

  return (
    <div className="bg-[#FAF9F5] rounded-3xl border border-black/5 p-5 md:p-8 shadow-lg max-w-xl w-full mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-5 border-b border-black/5 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-black flex items-center justify-center">
            <Sparkles size={14} className="text-[#D4AF37]" />
          </div>
          <div>
            <h4 className="text-sm md:text-base font-bold tracking-wider text-black/80">
              复方精油问诊
            </h4>
            <p className="text-[9px] tracking-widest uppercase text-black/25 font-bold">
              {step === 'step1' ? '必填 · 安全评估' : '选填 · 个性化偏好'}
            </p>
          </div>
        </div>
        <button
          onClick={onCancel}
          className="p-1.5 hover:bg-black/5 rounded-full transition-colors"
        >
          <X size={16} className="text-black/30" />
        </button>
      </div>

      <div ref={scrollRef} className="max-h-[60vh] overflow-y-auto space-y-6 pr-1">
        {/* ==================== STEP 1 ==================== */}
        {step === 'step1' && (
          <>
            {/* 年龄段 */}
            <Section label="年龄段 *">
              <div className="grid grid-cols-2 gap-2">
                {AGE_GROUPS.map(ag => (
                  <button
                    key={ag.value}
                    onClick={() => handleAgeSelect(ag.value)}
                    className={`px-3 py-2.5 rounded-xl text-xs md:text-sm border transition-all text-left ${
                      data.ageGroup === ag.value
                        ? 'border-black bg-black text-white'
                        : 'border-black/8 bg-white text-black/60 hover:border-black/30'
                    }`}
                  >
                    <span className="font-medium">{ag.label}</span>
                    {ag.note && (
                      <span className="block text-[10px] opacity-50 mt-0.5">{ag.note}</span>
                    )}
                  </button>
                ))}
              </div>
            </Section>

            {/* 性别 */}
            <Section label="性别 *">
              <div className="flex gap-2">
                {GENDERS.map(g => (
                  <button
                    key={g.value}
                    onClick={() => setData(prev => ({ ...prev, gender: g.value }))}
                    className={`flex-1 px-3 py-2.5 rounded-xl text-xs md:text-sm border transition-all ${
                      data.gender === g.value
                        ? 'border-black bg-black text-white'
                        : 'border-black/8 bg-white text-black/60 hover:border-black/30'
                    }`}
                  >
                    {g.label}
                  </button>
                ))}
              </div>
            </Section>

            {/* 基础病史 */}
            <Section label="是否有以下基础病症？ *">
              <div className="flex flex-wrap gap-1.5">
                {CONDITIONS.map(c => {
                  const isSelected = data.conditions.includes(c.value);
                  const isNoneSelected = hasNoConditions;
                  const isDisabled = c.value !== 'none' && isNoneSelected && !isSelected;
                  return (
                    <button
                      key={c.value}
                      onClick={() => handleConditionToggle(c.value)}
                      disabled={isDisabled}
                      className={`px-2.5 py-1.5 rounded-lg text-[11px] md:text-xs border transition-all ${
                        isSelected
                          ? c.value === 'none'
                            ? 'border-green-600 bg-green-50 text-green-700'
                            : c.sensitive
                              ? 'border-amber-400 bg-amber-50 text-amber-700'
                              : 'border-black bg-black text-white'
                          : 'border-black/8 bg-white text-black/50 hover:border-black/20'
                      } ${isDisabled ? 'opacity-30 cursor-not-allowed' : ''}`}
                    >
                      {c.sensitive && isSelected && (
                        <Shield size={10} className="inline mr-1 -mt-0.5" />
                      )}
                      {c.label}
                    </button>
                  );
                })}
              </div>
            </Section>

            {/* 特殊状态 */}
            <Section label="特殊状态（如适用） *">
              <div className="flex flex-wrap gap-1.5">
                {SPECIAL_STATUS.map(s => {
                  const isSelected = data.specialStatus.includes(s.value);
                  const isNoneSelected = hasNoStatus;
                  const isDisabled = s.value !== 'none' && isNoneSelected && !isSelected;
                  return (
                    <button
                      key={s.value}
                      onClick={() => handleStatusToggle(s.value)}
                      disabled={isDisabled}
                      className={`px-2.5 py-1.5 rounded-lg text-[11px] md:text-xs border transition-all ${
                        isSelected
                          ? s.value === 'none'
                            ? 'border-green-600 bg-green-50 text-green-700'
                            : s.sensitive
                              ? 'border-red-300 bg-red-50 text-red-700'
                              : 'border-black bg-black text-white'
                          : 'border-black/8 bg-white text-black/50 hover:border-black/20'
                      } ${isDisabled ? 'opacity-30 cursor-not-allowed' : ''}`}
                    >
                      {s.sensitive && isSelected && (
                        <Shield size={10} className="inline mr-1 -mt-0.5" />
                      )}
                      {s.label}
                    </button>
                  );
                })}
              </div>
            </Section>

            {/* 安全警告 */}
            {warnings.length > 0 && (
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 space-y-1">
                <div className="flex items-center gap-1.5">
                  <AlertTriangle size={12} className="text-amber-600" />
                  <span className="text-[10px] font-bold tracking-wider text-amber-800 uppercase">安全提示</span>
                </div>
                {warnings.map((w, i) => (
                  <p key={i} className="text-[11px] leading-relaxed text-amber-700/80">{w}</p>
                ))}
              </div>
            )}

            {/* 用药询问 */}
            <Section label="是否正在服用处方药或补充剂？">
              <div className="flex gap-2">
                {['yes', 'no'].map(v => (
                  <button
                    key={v}
                    onClick={() => setData(prev => ({ ...prev, onMedication: v as 'yes' | 'no' }))}
                    className={`flex-1 px-3 py-2 rounded-xl text-xs md:text-sm border transition-all ${
                      data.onMedication === v
                        ? 'border-black bg-black text-white'
                        : 'border-black/8 bg-white text-black/60 hover:border-black/30'
                    }`}
                  >
                    {v === 'yes' ? '正在服用' : '未服用'}
                  </button>
                ))}
              </div>
              {data.onMedication === 'yes' && (
                <div className="mt-2">
                  <textarea
                    value={data.medicationDetails}
                    onChange={(e) => setData(prev => ({ ...prev, medicationDetails: e.target.value }))}
                    placeholder="请列出您正在服用的药物名称（如：华法林、二甲双胍、优甲乐等），以便祭司综合评估安全性。"
                    rows={2}
                    className="w-full px-3 py-2 rounded-xl border border-black/8 bg-white text-xs md:text-sm text-black/70 placeholder:text-black/20 outline-none focus:border-black/30 transition-all resize-none"
                  />
                </div>
              )}
            </Section>

            {/* 下一步 */}
            <div className="pt-2">
              <button
                onClick={handleNext}
                disabled={!canProceedStep1()}
                className="w-full py-3 rounded-xl bg-black text-white text-sm font-bold tracking-wider flex items-center justify-center gap-2 disabled:opacity-25 hover:bg-black/90 transition-all"
              >
                下一步
                <ChevronRight size={16} />
              </button>
            </div>
          </>
        )}

        {/* ==================== BLOCKED（儿童阻断） ==================== */}
        {step === 'blocked' && (
          <div className="text-center py-6 space-y-4">
            <div className="w-14 h-14 bg-amber-50 rounded-full flex items-center justify-center mx-auto border border-amber-200">
              <AlertTriangle size={24} className="text-amber-500" />
            </div>
            <div>
              <h4 className="text-base font-bold text-black/80 mb-1">温馨提示</h4>
              <p className="text-sm text-black/50 leading-relaxed">
                10岁以下儿童不建议使用复方精油配方。
              </p>
              <p className="text-xs text-black/30 mt-2 leading-relaxed">
                儿童的皮肤屏障和代谢系统尚未发育完全，复方精油浓度较高可能引起不适。
                建议先使用温和的纯露产品，或咨询专业芳疗师获取更安全的使用建议。
              </p>
            </div>
            <div className="flex flex-col gap-2 pt-2">
              {onContactWechat && (
                <button
                  onClick={onContactWechat}
                  className="w-full py-2.5 rounded-xl bg-[#07C160] text-white text-sm font-bold hover:bg-[#06ad56] transition-all"
                >
                  联系专业芳疗师
                </button>
              )}
              <button
                onClick={onCancel}
                className="w-full py-2.5 rounded-xl border border-black/10 text-black/50 text-sm hover:bg-black/5 transition-all"
              >
                返回，继续了解单方精油
              </button>
            </div>
          </div>
        )}

        {/* ==================== STEP 2（选填） ==================== */}
        {step === 'step2' && (
          <>
            {/* 皮肤类型 */}
            <Section label="皮肤类型（选填）">
              <div className="grid grid-cols-2 gap-2">
                {SKIN_TYPES.map(s => (
                  <button
                    key={s.value}
                    onClick={() => setData(prev => ({ ...prev, skinType: s.value }))}
                    className={`px-3 py-2 rounded-xl text-xs md:text-sm border transition-all ${
                      data.skinType === s.value
                        ? 'border-black bg-black text-white'
                        : 'border-black/8 bg-white text-black/60 hover:border-black/20'
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </Section>

            {/* 皮肤敏感度 */}
            <Section label="皮肤敏感度（选填）">
              <div className="grid grid-cols-2 gap-2">
                {SKIN_SENSITIVITIES.map(s => (
                  <button
                    key={s.value}
                    onClick={() => setData(prev => ({ ...prev, skinSensitivity: s.value }))}
                    className={`px-3 py-2 rounded-xl text-xs md:text-sm border transition-all ${
                      data.skinSensitivity === s.value
                        ? 'border-black bg-black text-white'
                        : 'border-black/8 bg-white text-black/60 hover:border-black/20'
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </Section>

            {/* 使用方式 */}
            <Section label="最期望的使用方式（选填）">
              <div className="grid grid-cols-1 gap-1.5">
                {USAGE_PREFERENCES.map(u => (
                  <button
                    key={u.value}
                    onClick={() => setData(prev => ({ ...prev, usagePreference: u.value }))}
                    className={`px-3 py-2 rounded-xl text-xs md:text-sm border transition-all text-left ${
                      data.usagePreference === u.value
                        ? 'border-black bg-black text-white'
                        : 'border-black/8 bg-white text-black/60 hover:border-black/20'
                    }`}
                  >
                    {u.label}
                  </button>
                ))}
              </div>
            </Section>

            {/* 香味偏好 */}
            <Section label="香味偏好（选填）">
              <div className="flex flex-wrap gap-1.5">
                {SCENT_PREFERENCES.map(s => (
                  <button
                    key={s.value}
                    onClick={() => setData(prev => ({ ...prev, scentPreference: s.value }))}
                    className={`px-2.5 py-1.5 rounded-lg text-[11px] md:text-xs border transition-all ${
                      data.scentPreference === s.value
                        ? 'border-black bg-black text-white'
                        : 'border-black/8 bg-white text-black/50 hover:border-black/20'
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </Section>

            {/* 安全提示摘要 */}
            {warnings.length > 0 && (
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 space-y-1">
                <div className="flex items-center gap-1.5">
                  <Shield size={12} className="text-amber-600" />
                  <span className="text-[10px] font-bold tracking-wider text-amber-800 uppercase">安全已考虑</span>
                </div>
                <p className="text-[11px] text-amber-700/80">
                  祭司已注意到您的健康状况，配方向自动调整浓度、避开禁忌精油。
                </p>
              </div>
            )}

            {/* 提交 */}
            <div className="pt-2 space-y-2">
              <button
                onClick={handleSubmit}
                className="w-full py-3 rounded-xl bg-black text-white text-sm font-bold tracking-wider flex items-center justify-center gap-2 hover:bg-black/90 transition-all"
              >
                <Heart size={14} />
                提交，请祭司调配复方
              </button>
              <button
                onClick={() => setStep('step1')}
                className="w-full py-2 rounded-xl flex items-center justify-center gap-1 text-xs text-black/40 hover:text-black/60 transition-all"
              >
                <ChevronLeft size={12} />
                返回修改必填信息
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

/* ====== 小组件：带标题的块 ====== */

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <label className="block text-[11px] md:text-xs font-bold tracking-wider text-black/50 uppercase">
        {label}
      </label>
      {children}
    </div>
  );
}

export default BlendingQuestionnaire;
