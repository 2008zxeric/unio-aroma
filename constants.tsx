import { ScentItem, Destination } from './types';

/**
 * ------------------------------------------------------------------
 * 1. 品牌全局资产区 (使用 jsDelivr CDN 加速)
 * ------------------------------------------------------------------
 */
const CDN_BASE = 'https://cdn.jsdelivr.net/gh/2008zxeric/unio-aroma@main/assets/';
const CACHE_V = '?v=1.2'; // 更新版本号以刷新缓存

export const ASSET_REGISTRY = {
  brand: {
    logo: `${CDN_BASE}brand/logo.png${CACHE_V}`,
    qr_code: 'https://images.unsplash.com/photo-1557838923-2985c318be48?q=80&w=400',
    hero_home: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=1920', 
    hero_story: 'https://images.unsplash.com/photo-1471922694854-ff1b63b20054?q=80&w=1200',
    fallback: 'https://images.unsplash.com/photo-1493246507139-91e8bef99c02?q=80&w=1200',
    xhs_link: 'https://xhslink.com/m/AcZDZuYhsVd'
  },
  visual_anchors: {
    yuan: 'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?q=80&w=800',
    he: 'https://images.unsplash.com/photo-1601049541289-9b1b7bbbfe19?q=80&w=800',
    vessel: 'https://images.unsplash.com/photo-1544413647-ad342111a43a?q=80&w=800',
    incense: 'https://images.unsplash.com/photo-1505394033323-4241b2213fd3?q=80&w=800',
    space: 'https://images.unsplash.com/photo-1512331283953-199ed3000636?q=80&w=800',
    placeholder: 'https://images.unsplash.com/photo-1540555700478-4be289fbecee?q=80&w=800'
  }
};

/**
 * ------------------------------------------------------------------
 * 2. 单品图片自定义区 (Product Image Overrides)
 * ------------------------------------------------------------------
 */
const PROD_PATH = `${CDN_BASE}products/`;

export const PRODUCT_OVERRIDES: Record<string, string> = {
  // 元 · 金 系列 (Metal) - 迁移至 /metal/ 目录并改为 .webp
  "yuan_gold_frankincense": `${PROD_PATH}metal/Sacred%20Frankincense.webp${CACHE_V}`,
  "yuan_gold_mint": `${PROD_PATH}metal/Peppermint%20from%20Peaks.webp${CACHE_V}`,
  "yuan_gold_eucalyptus": `${PROD_PATH}metal/Eucalyptus%20Glaciale.webp${CACHE_V}`,
  "yuan_gold_teatree": `${PROD_PATH}metal/Tea%20Tree%20Antiseptic.webp${CACHE_V}`,
  "yuan_gold_lemongrass": `${PROD_PATH}metal/Citronella%20Clarissima.webp${CACHE_V}`,
  
  // 元 · 木 系列 (Wood) - 已改为 .webp
  "yuan_wood_sandalwood": `${PROD_PATH}wood/Aged%20Sandalwood.webp${CACHE_V}`,
  "yuan_wood_cypress": `${PROD_PATH}wood/Misty%20Cypress.webp${CACHE_V}`,
  "yuan_wood_cedar": `${PROD_PATH}wood/Himalayan%20Cedar.webp${CACHE_V}`,
  "yuan_wood_pine": `${PROD_PATH}wood/Boreal%20Pine.webp${CACHE_V}`,
  "yuan_wood_rosewood": `${PROD_PATH}wood/Sacred%20Rosewood%20Isle.webp${CACHE_V}`,

  // 元 · 水 系列 (Water) - 改为 .webp
  "yuan_water_juniper": `${PROD_PATH}water/Juniper%20by%20the%20Loch.webp${CACHE_V}`,
  "yuan_water_vetiver": `${PROD_PATH}water/Deep%20Root%20Vetiver.webp${CACHE_V}`,
  "yuan_water_patchouli": `${PROD_PATH}water/Patchouli%20Nocturne.webp${CACHE_V}`,
  "yuan_water_myrrh": `${PROD_PATH}water/Myrrh%20Secreta.webp${CACHE_V}`,
  "yuan_water_benzoin": `${PROD_PATH}water/Benzoin%20Ambrosia.webp${CACHE_V}`,

  // 元 · 土 系列 (Earth) - 改为 .webp
  "yuan_earth_bergamot": `${PROD_PATH}earth/Bergamot%20Alba.webp${CACHE_V}`,
  "yuan_earth_ginger": `${PROD_PATH}earth/Zingiber%20Terrae.webp${CACHE_V}`,
  "yuan_earth_mandarin": `${PROD_PATH}earth/Mandarin%20Jucunda.webp${CACHE_V}`,
  "yuan_earth_grapefruit": `${PROD_PATH}earth/Grapefruit%20Pomona.webp${CACHE_V}`,
  "yuan_earth_oakmoss": `${PROD_PATH}earth/Oakmoss%20Taiga.webp${CACHE_V}`,

  // 元 · 火 系列 (Fire) - 改为 .webp
  "yuan_fire_rose": `${PROD_PATH}fire/Damask%20Rose%20Aureate.webp${CACHE_V}`,
  "yuan_fire_ylang": `${PROD_PATH}fire/Ylang%20Equatorial.webp${CACHE_V}`,
  "yuan_fire_jasmine": `${PROD_PATH}fire/Jasminum%20Grandiflorum.webp${CACHE_V}`,
  "yuan_fire_neroli": `${PROD_PATH}fire/Neroli%20Soleil.webp${CACHE_V}`,
  "yuan_fire_geranium": `${PROD_PATH}fire/Geranium%20Ros%C3%A9.webp${CACHE_V}`,

  // 和 · 身 系列 (Harmony Body) - 改为 .webp
  "he_body_1": `${PROD_PATH}body/cloud%20velvet.webp${CACHE_V}`,
  "he_body_2": `${PROD_PATH}body/Dawn%20Glow.webp${CACHE_V}`,
  "he_body_3": `${PROD_PATH}body/Moonlight%20Oil.webp${CACHE_V}`,
  "he_body_4": `${PROD_PATH}body/Frost%20Mint.webp${CACHE_V}`,
  "he_body_5": `${PROD_PATH}body/Trace%20Balm.webp${CACHE_V}`,

  // 境 · 场 系列 (Sanctuary Place) - 改为 .webp
  "jing_field_3": `${PROD_PATH}place/Walnut.webp${CACHE_V}`,
};

export const ASSETS = {
  logo: ASSET_REGISTRY.brand.logo,
  rednote_qr: ASSET_REGISTRY.brand.qr_code,
  hero_zen: ASSET_REGISTRY.brand.hero_home,
  hero_forest: ASSET_REGISTRY.brand.hero_story,
  heroFallback: ASSET_REGISTRY.brand.fallback,
  xhs_link: ASSET_REGISTRY.brand.xhs_link
};

const getPic = (i: number, sig: string) => {
  const ids = ['1464822759023-fed622ff2c3b', '1506744038136-46273834b3fb', '1441974231531-c6227db76b6e', '1499002238440-d264edd596ec', '1530789253388-582c481c54b0', '1519681393784-d120267933ba', '1501785888041-af3ef285b470', '1500530855697-b586d89ba3ee'];
  const id = ids[i % ids.length];
  return `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&q=80&w=1200&sig=${sig}`;
};

export const DATABASE: Record<string, ScentItem> = {};

// 1. 元系列 (Origin)
const YUAN_DEFS = [
  { g: '金 · 肃降', slug: 'gold', items: [{ n: '神圣乳香', e: 'frankincense' }, { n: '极境薄荷', e: 'mint' }, { n: '极境尤加利', e: 'eucalyptus' }, { n: '极境茶树', e: 'teatree' }, { n: '极境香茅', e: 'lemongrass' }] },
  { g: '木 · 生发', slug: 'wood', items: [{ n: '老山檀香', e: 'sandalwood' }, { n: '极境丝柏', e: 'cypress' }, { n: '极境雪松', e: 'cedar' }, { n: '极境松针', e: 'pine' }, { n: '神圣花梨木', e: 'rosewood' }] },
  { g: '水 · 润泽', slug: 'water', items: [{ n: '极境杜松', e: 'juniper' }, { n: '极境岩兰草', e: 'vetiver' }, { n: '极境广藿香', e: 'patchouli' }, { n: '极境没药', e: 'myrrh' }, { n: '极境安息香', e: 'benzoin' }] },
  { g: '火 · 释放', slug: 'fire', items: [{ n: '大马士革玫瑰', e: 'rose' }, { n: '极境依兰', e: 'ylang' }, { n: '极境茉莉', e: 'jasmine' }, { n: '极境橙花', e: 'neroli' }, { n: '极境天竺葵', e: 'geranium' }] },
  { g: '土 · 稳定', slug: 'earth', items: [{ n: '极境佛手柑', e: 'bergamot' }, { n: '横断生姜', e: 'ginger' }, { n: '极境红橘', e: 'mandarin' }, { n: '极境葡萄柚', e: 'grapefruit' }, { n: '极境橡木苔', e: 'oakmoss' }] }
];

YUAN_DEFS.forEach((group) => {
  group.items.forEach((item) => {
    const id = `yuan_${group.slug}_${item.e}`;
    DATABASE[id] = {
      id, category: 'yuan', subGroup: group.g, name: item.n, herb: item.n, herbEn: 'PURE ESSENCE',
      region: '全球极境', status: 'arrived_origin', visited: true, accent: '#D75437',
      hero: PRODUCT_OVERRIDES[id] || ASSET_REGISTRY.visual_anchors.yuan,
      shortDesc: '极境高纯度单方萃取 / 99.9% 纯度',
      narrative: '每一滴液体，都曾是植物为了在极境生存而进化的防御意志。',
      benefits: ['频率修复', '感官平衡'], aliceLabDiary: 'GC-MS质谱分析显示该单方成分纯净度极高。',
      recommendation: '直接扩香。', usage: '取1滴于掌心嗅吸。', precautions: '高浓度请勿直涂。'
    };
  });
});

// 2. 和系列 (Harmony)
const HE_DEFS = [
  { g: '身 · 能量', slug: 'body', items: [{ n: '云感 · 玫瑰檀香润肤霜', e: 'Cloud Velvet' }, { n: '晨曦 · 葡萄柚生姜沐浴露', e: 'Dawn Glow' }, { n: '月华 · 依兰天竺葵身体油', e: 'Moonlight Oil' }, { n: '清冽 · 尤加利薄荷洗发水', e: 'Frost Mint' }, { n: '润迹 · 丝柏护手精华', e: 'Trace Balm' }] },
  { g: '心 · 疗愈', slug: 'mind', items: [{ n: '止语 · 薰衣草岩兰草喷雾', e: 'Silent Mist' }, { n: '归处 · 橙花佛手柑舒缓膏', e: 'Sanctuary' }, { n: '听泉 · 洋甘菊广藿香凝露', e: 'Zen Fountain' }, { n: '微光 · 茉莉红橘淡香氛', e: 'Glimmer' }, { n: '深吸 · 杜松子乳香清吸瓶', e: 'Deep Breath' }] },
  { g: '灵 · 觉醒', slug: 'soul', items: [{ n: '无界 · 没药乳香冥想油', e: 'Boundless' }, { n: '悬浮 · 杜松雪松觉醒露', e: 'Floating' }, { n: '破晓 · 香蜂草滚珠精萃', e: 'Daybreak' }, { n: '空寂 · 橡木苔安息香香水', e: 'Void Moss' }, { n: '共振 · 檀香鼠耳草复方', e: 'Resonant' }] }
];

HE_DEFS.forEach((group) => {
  group.items.forEach((item, i) => {
    const id = `he_${group.slug}_${i + 1}`;
    DATABASE[id] = {
      id, category: 'he', subGroup: group.g, name: item.n, herb: item.n, herbEn: item.e,
      region: '拾载实验室', status: 'arrived', visited: true, accent: '#1C39BB',
      hero: PRODUCT_OVERRIDES[id] || ASSET_REGISTRY.visual_anchors.he,
      shortDesc: '身心灵处方级组分',
      narrative: '基于特定维度的频率修复，打破感官日常。',
      benefits: ['能量对齐'], aliceLabDiary: '分子协同效应测试表现卓越。',
      recommendation: '日常护理。', usage: '均匀涂抹。', precautions: '先进行小面积测试。'
    };
  });
});

// 3. 境系列 (Sanctuary)
const JING_DEFS = [
  { g: '场 · 净愈', slug: 'field', items: [{ n: '极境 · 冰裂纹手作陶瓷扩香皿', e: 'Crackled' }, { n: '素空 · 天然多孔矿石扩香座', e: 'Mineral' }, { n: '隐迹 · 胡桃木车载扩香器', e: 'Walnut' }, { n: '流岚 · 磨砂质感扩香机', e: 'Mistflow' }, { n: '归藏 · 铝合金旅行扩香盒', e: 'Alloy Box' }] },
  { g: '意 · 冥想', slug: 'meditation', items: [{ n: '一炷 · 降真香手工线香', e: 'Zen Incense' }, { n: '定念 · 黄铜倒流香座', e: 'Censer' }, { n: '观照 · 极简黑檀木插香座', e: 'Holder' }, { n: '止观 · 纯手工植物蜡烛', e: 'Candle' }, { n: '息灾 · 手工铜制灭烟铃', e: 'Snuffer' }] }
];

JING_DEFS.forEach((group) => {
  group.items.forEach((item, i) => {
    const id = `jing_${group.slug}_${i + 1}`;
    DATABASE[id] = {
      id, category: 'jing', subGroup: group.g, name: item.n, herb: item.n, herbEn: item.e,
      region: '艺术工坊', status: 'arrived', visited: true, accent: '#D4AF37',
      hero: PRODUCT_OVERRIDES[id] || ASSET_REGISTRY.visual_anchors.vessel,
      shortDesc: '器以载道，气以通神',
      narrative: '重塑场域的物理边界。',
      benefits: ['美学修辞'], aliceLabDiary: '材质与分子的扩散速率呈正相关。',
      recommendation: '静态陈设。', usage: '配合精油。', precautions: '手工品请轻放。'
    };
  });
});

/**
 * ------------------------------------------------------------------
 * 3. 全球寻香坐标区 (DESTINATIONS)
 * ------------------------------------------------------------------
 */
export const DESTINATIONS: Record<string, Destination> = {};

const WORLD_DATA = {
  '亚洲': [
    { n: '中国', c: 23, p: ['yuan_gold_frankincense'], d: '云南（香料之乡）、甘肃苦水镇（玫瑰精油）等', s: 'arrived' },
    { n: '泰国', c: 40, p: ['yuan_fire_ylang'], d: '安息香、罗勒、香茅等热带香料', s: 'arrived' },
    { n: '印度', c: 3, p: ['yuan_wood_sandalwood'], d: '岩兰草（东印度檀香）、茉莉、檀香', s: 'arrived' },
    { n: '日本', c: 2, p: ['yuan_wood_cedar'], d: '桧木、柚子、扁柏', s: 'arrived' },
    { n: '中国香港', c: 18, p: ['he_mind_5'], d: '重要的芳香贸易与调香中心', s: 'arrived' },
    { n: '马来西亚', c: 13, p: ['yuan_water_benzoin'], d: '特级安息香核心产区', s: 'arrived' },
    { n: '印度尼西亚', c: 12, p: ['yuan_water_patchouli'], d: '广藿香、丁香、肉豆蔻', s: 'arrived' },
    { n: '阿联酋', c: 12, p: ['yuan_gold_myrrh'], d: '干旱地区特色含精油植物（如没药）', s: 'arrived' },
    { n: '越南', c: 6, p: [], d: '安息香、沉香', s: 'arrived' },
    { n: '哈萨克斯坦', c: 4, p: [], d: '当地特色植物', s: 'arrived' },
    { n: '伊朗', c: 2, p: [], d: '藏红花、玫瑰等核心产地', s: 'arrived' },
    { n: '约旦', c: 2, p: [], d: '当地特色植物', s: 'arrived' },
    { n: '中国澳门', c: 2, p: [], d: '芳香文化与贸易节点', s: 'arrived' },
    { n: '新加坡', c: 2, p: [], d: '东南亚芳香枢纽', s: 'arrived' },
    { n: '韩国', c: 1, p: [], d: '松针、竹子、柑橘', s: 'arrived' },
    { n: '柬埔寨', c: 1, p: [], d: '香茅、卡南加（伊兰伊兰近缘种）', s: 'arrived' },
    { n: '朝鲜', c: 1, p: [], d: '当地特色植物', s: 'arrived' },
    { n: '斯里兰卡', c: 0, p: [], d: '肉桂（品质闻名）、柠檬草、胡椒', s: 'locked' },
    { n: '尼泊尔', c: 0, p: [], d: '喜马拉雅雪松、冬青、穗甘松', s: 'locked' }
  ],
  '欧洲': [
    { n: '土耳其', c: 8, p: ['yuan_fire_rose'], d: '玫瑰、月桂等核心产区', s: 'arrived' },
    { n: '波兰', c: 5, p: [], d: '当地特色植物', s: 'arrived' },
    { n: '法国', c: 5, p: ['yuan_fire_jasmine'], d: '格拉斯（世界香水之都：玫瑰、茉莉、薰衣草）', s: 'arrived' },
    { n: '德国', c: 4, p: [], d: '洋甘菊、草药提取物技术中心', s: 'arrived' },
    { n: '意大利', c: 2, p: ['yuan_earth_bergamot'], d: '柠檬（卡拉布里亚）、迷迭香、鼠尾草', s: 'arrived' },
    { n: '奥地利', c: 2, p: [], d: '当地特色植物', s: 'arrived' },
    { n: '丹麦', c: 2, p: [], d: '当地特色植物', s: 'arrived' },
    { n: '匈牙利', c: 2, p: [], d: '薰衣草、鼠尾草', s: 'arrived' },
    { n: '西班牙', c: 1, p: [], d: '苦橙、迷迭香、薰衣草', s: 'arrived' },
    { n: '荷兰', c: 1, p: [], d: '郁金香、花卉育种与贸易中心', s: 'arrived' },
    { n: '摩纳哥', c: 1, p: [], d: '（高端香水文化窗口）', s: 'arrived' },
    { n: '卢森堡', c: 1, p: [], d: '当地特色植物', s: 'arrived' },
    { n: '保加利亚', c: 0, p: [], d: '大马士革玫瑰精油核心产区', s: 'locked' },
    { n: '英国', c: 0, p: [], d: '现代芳疗发源地与学术中心', s: 'locked' },
    { n: '葡萄牙', c: 0, p: [], d: '岩蔷薇、桉树、橙花', s: 'locked' },
    { n: '克罗地亚', c: 0, p: [], d: '薰衣草、鼠尾草、松树', s: 'locked' },
    { n: '希腊', c: 0, p: [], d: '香桃木、橄榄油、马郁兰', s: 'locked' }
  ],
  '非洲': [
    { n: '南非', c: 12, p: ['yuan_fire_geranium'], d: '路易波士、天竺葵、布枯', s: 'arrived' },
    { n: '肯尼亚', c: 2, p: [], d: '茶油、蜡菊等核心提取物', s: 'arrived' },
    { n: '埃及', c: 2, p: [], d: '茉莉、香草、卡鲁美（古埃及配方核心）', s: 'arrived' },
    { n: '津巴布韦', c: 1, p: [], d: '当地特色芳香灌木', s: 'arrived' },
    { n: '马达加斯加', c: 0, p: [], d: '伊兰伊兰（顶级依兰）、香草、罗文莎叶', s: 'locked' },
    { n: '摩洛哥', c: 0, p: [], d: '阿特拉斯雪松、摩洛哥玫瑰、橙花', s: 'locked' }
  ],
  '美洲/大洋洲': [
    { n: '巴西', c: 8, p: ['yuan_earth_mandarin'], d: '甜橙、柠檬、玫瑰木、古巴香脂', s: 'arrived' },
    { n: '美国', c: 7, p: ['yuan_gold_mint'], d: '胡椒薄荷、弗吉尼亚雪松、柑橘类精油', s: 'arrived' },
    { n: '墨西哥', c: 4, p: [], d: '莱姆、墨西哥香草、万寿菊精油', s: 'arrived' },
    { n: '海地', c: 0, p: [], d: '岩兰草（全球品质之冠）、阿米香树', s: 'locked' },
    { n: '阿根廷', c: 0, p: [], d: '柠檬、绿花白千层、马黛茶萃取', s: 'locked' },
    { n: '澳大利亚', c: 0, p: [], d: '茶树、蓝胶尤加利、澳洲檀香、指橙', s: 'locked' }
  ]
};

let dIdx = 0;
Object.entries(WORLD_DATA).forEach(([region, list]) => {
  list.forEach((item) => {
    const id = `dest_${dIdx++}`;
    DESTINATIONS[id] = {
      id, name: item.n, en: item.n.toUpperCase(), region, status: item.s as 'arrived' | 'locked',
      visitCount: item.c, scenery: getPic(dIdx, id), emoji: '📍',
      herbDescription: item.d, knowledge: '极境分子图谱已解码。',
      productIds: item.p,
      ericDiary: `第 ${item.c} 次在 ${item.n} 寻香，大地通过气味向我述说生存的奥秘。`,
      aliceDiary: `该坐标样本显示植物次生代谢物极佳，频率稳定。`,
      memoryPhotos: [getPic(dIdx+100, id+'_m1'), getPic(dIdx+110, id+'_m2'), getPic(dIdx+120, id+'_m3')]
    };
  });
});

// 神州全境探访
const CHINA_PROVINCES = [
  { n: '四川', sub: '华西' }, { n: '云南', sub: '华西' }, { n: '西藏', sub: '华西' },
  { n: '广东', sub: '华南' }, { n: '福建', sub: '华南' }, { n: '海南', sub: '华南' },
  { n: '浙江', sub: '华东' }, { n: '江苏', sub: '华东' }, { n: '安徽', sub: '华东' },
  { n: '新疆', sub: '西北' }, { n: '甘肃', sub: '西北' }, { n: '陕西', sub: '西北' },
  { n: '北京', sub: '华北' }, { n: '山西', sub: '华北' }, { n: '湖北', sub: '华中' },
  { n: '上海', sub: '华东' }, { n: '山东', sub: '华东' }, { n: '湖南', sub: '华中' },
  { n: '广西', sub: '华南' }, { n: '江西', sub: '华东' }, { n: '吉林', sub: '华北' }
];

CHINA_PROVINCES.forEach((prov, i) => {
  const id = `cn_${prov.sub}_${prov.n}`;
  DESTINATIONS[id] = {
    id, name: prov.n, en: prov.n.toUpperCase() + ', CHINA', region: '亚洲', status: 'arrived',
    visitCount: 15, scenery: getPic(i + 200, id), emoji: '📍',
    herbDescription: '神州极境原生寻踪', knowledge: '原生分子图谱已解码。',
    productIds: prov.n === '云南' ? ['yuan_fire_rose'] : prov.n === '甘肃' ? ['he_body_1'] : [],
    ericDiary: `神州寻香，${prov.n} 的气味是记忆中最厚重的家书。`,
    aliceDiary: `神州原生植物显示出独特的抗氧化活性与极佳纯度。`,
    memoryPhotos: [getPic(i+210, id+'_m1'), getPic(i+220, id+'_m2'), getPic(i+230, id+'_m3')],
    isChinaProvince: true, subRegion: prov.sub
  };
});
