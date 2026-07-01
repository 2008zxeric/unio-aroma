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
  name_cn?: string | null;
  name_en?: string | null;
  code?: string | null;
}

/**
 * 预处理拼音：将中文名转拼音（空格分隔全拼 + 首字母）
 * 结果缓存在 Map 中避免重复计算
 */
const pinyinCache = new Map<string, { full: string; initials: string }>();

function getPinyin(text: string): { full: string; initials: string } {
  if (!text) return { full: '', initials: '' };

  const cached = pinyinCache.get(text);
  if (cached) return cached;

  try {
    const full = pinyin(text, { toneType: 'none', type: 'array' }).join(' ').toLowerCase();
    const initials = pinyin(text, { pattern: 'first', toneType: 'none', type: 'array' }).join('').toLowerCase();
    const result = { full, initials };
    pinyinCache.set(text, result);
    return result;
  } catch {
    const result = { full: '', initials: '' };
    pinyinCache.set(text, result);
    return result;
  }
}

/** 安全转小写并检查包含（处理 null/undefined） */
function safeIncludes(text: string | null | undefined, keyword: string): boolean {
  return (text || '').toLowerCase().includes(keyword);
}

/**
 * 检查 product 是否匹配 keyword
 */
export function matchProduct(product: Searchable, keyword: string): boolean {
  if (!keyword) return true;

  const kw = keyword.toLowerCase().trim();
  if (!kw) return true;

  // 1. 中文名直接包含
  if (safeIncludes(product.name_cn, kw)) return true;
  // 2. 英文名包含
  if (safeIncludes(product.name_en, kw)) return true;
  // 3. 编码包含
  if (safeIncludes(product.code, kw)) return true;

  // 4. 拼音匹配（仅拉丁字符输入）
  if (!/^[a-z]+$/i.test(kw)) return false;

  try {
    const py = getPinyin(product.name_cn || '');

    // 4a. 全拼匹配
    const fullNoSpace = py.full.replace(/\s/g, '');
    if (fullNoSpace && fullNoSpace.startsWith(kw.replace(/\s/g, ''))) return true;

    // 4b. 首字母匹配
    if (py.initials && py.initials.startsWith(kw)) return true;

    // 4c. 拼音单词级前缀匹配
    for (const w of py.full.split(' ')) {
      if (w && w.startsWith(kw)) return true;
    }

    return false;
  } catch {
    return false;
  }
}
