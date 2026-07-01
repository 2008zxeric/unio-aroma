/**
 * 模糊搜索工具 — 支持拼音前缀匹配
 *
 * 用法：matchProduct(product, keyword) → boolean
 *
 * 匹配逻辑：
 * 1. 中文名 / 英文名 / 编码的模糊包含
 * 2. 拼音前缀匹配（输入拉丁字母时自动启用）
 *    "薰衣草" → pinyin "xun yi cao"
 *    输入 "x" 命中 "xun"，"xu" 命中 "xun"，
 *    "xun" 命中，"xuny" 命中 "xun yi"...
 */

import { pinyin } from 'pinyin-pro';

/** 产品搜索匹配接口 */
interface Searchable {
  name_cn?: string;
  name_en?: string;
  code?: string;
}

/**
 * 预处理拼音：将中文名转拼音（空格分隔全拼 + 首字母）
 * 结果缓存在 Map 中避免重复计算
 */
const pinyinCache = new Map<string, { full: string; initials: string }>();

function getPinyin(text: string): { full: string; initials: string } {
  const cached = pinyinCache.get(text);
  if (cached) return cached;

  try {
    const full = pinyin(text, { toneType: 'none', type: 'array' }).join(' ').toLowerCase();
    const initials = pinyin(text, { pattern: 'first', toneType: 'none', type: 'array' }).join('').toLowerCase();
    const result = { full, initials };
    pinyinCache.set(text, result);
    return result;
  } catch (e) {
    // pinyin-pro 加载失败时返回空，走直接包含匹配
    console.warn('pinyin matching unavailable:', e);
    const result = { full: '', initials: '' };
    pinyinCache.set(text, result);
    return result;
  }
}

/**
 * 检查 product 是否匹配 keyword
 * - keyword 为空 → 匹配（调用方自行处理 "显示全部"）
 * - keyword 为中文 → 中文名/编码包含匹配
 * - keyword 为拉丁字母 → 拼音 + 英文名 + 编码匹配
 */
export function matchProduct(product: Searchable, keyword: string): boolean {
  if (!keyword) return true;

  const kw = keyword.toLowerCase().trim();

  // 1. 中文名直接包含
  if (product.name_cn?.toLowerCase().includes(kw)) return true;
  // 2. 英文名包含
  if (product.name_en?.toLowerCase().includes(kw)) return true;
  // 3. 编码包含
  if (product.code?.toLowerCase().includes(kw)) return true;

  // 4. 拼音匹配（仅拉丁字符输入）
  const isLatin = /^[a-z]+$/i.test(kw);
  if (!isLatin) return false;

  try {
    const py = getPinyin(product.name_cn || '');

    // 4a. 全拼匹配：keyword 作为拼音序列的前缀
    //     去掉空格后检查 startsWith
    const fullNoSpace = py.full.replace(/\s/g, '');
    if (fullNoSpace.startsWith(kw.replace(/\s/g, ''))) return true;

    // 4b. 首字母匹配：keyword 是首字母序列的前缀
    //     "薰衣草" → initials "xyc"
    if (py.initials.startsWith(kw)) return true;

    // 4c. 拼音单词级前缀匹配：keyword 匹配任意字的拼音前缀
    const words = py.full.split(' ');
    for (const w of words) {
      if (w.startsWith(kw)) return true;
    }

    return false;
  } catch (e) {
    // 拼音匹配失败时，退化到基础匹配（已在前三步检查过，这里必定不匹配）
    return false;
  }
}
