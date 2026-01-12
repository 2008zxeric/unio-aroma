import { ScentItem, Destination } from './types';

/**
 * ------------------------------------------------------------------
 * 1. 品牌全局资产区 (元香Unio - 静奢美学)
 * ------------------------------------------------------------------
 */
const CDN_BASE = 'https://cdn.jsdelivr.net/gh/2008zxeric/unio-aroma@main/assets/';
const RAW_BASE = 'https://raw.githubusercontent.com/2008zxeric/unio-aroma/main/assets/';
const CACHE_V = '?v=12.0'; 

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
    xiang: 'https://images.unsplash.com/photo-1601049541289-9b1b7bbbfe19?q=80&w=800', 
    vessel: 'https://images.unsplash.com/photo-1544413647-ad342111a43a?q=80&w=800',
    incense: 'https://images.unsplash.com/photo-1505394033323-4241b2213fd3?q=80&w=800',
    space: 'https://images.unsplash.com/photo-1512331283953-199ed3000636?q=80&w=800',
    placeholder: 'https://images.unsplash.com/photo-1540555700478-4be289fbecee?q=80&w=800'
  }
};

const PROD_PATH = `${CDN_BASE}products/`;
const RAW_PROD = `${RAW_BASE}products/`;

export const PRODUCT_OVERRIDES: Record<string, string> = {
  "yuan_gold_frankincense": `${PROD_PATH}metal/Sacred%20Frankincense.webp${CACHE_V}`,
  "yuan_gold_mint": `${PROD_PATH}metal/Peppermint%20from%20Peaks.webp${CACHE_V}`,
  "yuan_gold_eucalyptus": `${RAW_PROD}metal/%20Eucalyptus%20Glaciale.webp${CACHE_V}`,
  "yuan_gold_teatree": `${PROD_PATH}metal/Tea%20Tree%20Antiseptic.webp${CACHE_V}`,
  "yuan_gold_lemongrass": `${PROD_PATH}metal/Citronella%20Clarissima.webp${CACHE_V}`,
  "yuan_wood_sandalwood": `${PROD_PATH}wood/Aged%20Sandalwood.webp${CACHE_V}`,
  "yuan_wood_cypress": `${PROD_PATH}wood/Misty%20Cypress.webp${CACHE_V}`,
  "yuan_wood_cedar": `${PROD_PATH}wood/Himalayan%20Cedar.webp${CACHE_V}`,
  "yuan_wood_pine": `${PROD_PATH}wood/Boreal%20Pine.webp${CACHE_V}`,
  "yuan_wood_rosewood": `${PROD_PATH}wood/Sacred%20Rosewood%20Isle.webp${CACHE_V}`,
  "yuan_water_juniper": `${PROD_PATH}water/Juniper%20by%20the%20Loch.webp${CACHE_V}`,
  "yuan_water_vetiver": `${PROD_PATH}water/Deep%20Root%20Vetiver.webp${CACHE_V}`,
  "yuan_water_patchouli": `${PROD_PATH}water/Patchouli%20Nocturne.webp${CACHE_V}`,
  "yuan_water_myrrh": `${PROD_PATH}water/Myrrh%20Secreta.webp${CACHE_V}`,
  "yuan_water_benzoin": `${PROD_PATH}water/Benzoin%20Ambrosia.webp${CACHE_V}`,
  "yuan_fire_rose": `${PROD_PATH}fire/Damask%20Rose%20Aureate.webp${CACHE_V}`,
  "yuan_fire_ylang": `${PROD_PATH}fire/Ylang%20Equatorial.webp${CACHE_V}`,
  "yuan_fire_jasminum": `${RAW_PROD}fire/Jasminum%20Grandiflorum.webp${CACHE_V}`,
  "yuan_fire_neroli": `${RAW_PROD}fire/Neroli%20Soleil.webp${CACHE_V}`,
  "yuan_fire_geranium": `${RAW_PROD}fire/Geranium%20Rose%CC%81.webp${CACHE_V}`,
  "yuan_earth_bergamot": `${PROD_PATH}earth/Bergamot%20Alba.webp${CACHE_V}`,
  "yuan_earth_ginger": `${PROD_PATH}earth/Zingiber%20Terrae.webp${CACHE_V}`,
  "yuan_earth_mandarin": `${PROD_PATH}earth/Mandarin%20Jucunda.webp${CACHE_V}`,
  "yuan_earth_grapefruit": `${PROD_PATH}earth/Grapefruit%20Pomona.webp${CACHE_V}`,
  "yuan_earth_oakmoss": `${PROD_PATH}earth/Oakmoss%20Taiga.webp${CACHE_V}`,
  "he_body_1": `${PROD_PATH}body/cloud%20velvet.webp${CACHE_V}`,
  "he_body_2": `${PROD_PATH}body/Dawn%20Glow.webp${CACHE_V}`,
  "he_body_3": `${PROD_PATH}body/Moonlight%20Oil.webp${CACHE_V}`,
  "he_body_4": `${PROD_PATH}body/Frost%20Mint.webp${CACHE_V}`,
  "he_body_5": `${PROD_PATH}body/Trace%20Balm.webp${CACHE_V}`,
  "he_mind_1": `${PROD_PATH}mind/Silent%20Mist.webp${CACHE_V}`,
  "he_mind_2": `${PROD_PATH}mind/Sanctuary.webp${CACHE_V}`,
  "he_mind_3": `${PROD_PATH}mind/Zen%20Fountain.webp${CACHE_V}`,
  "he_mind_4": `${PROD_PATH}mind/Glimmer.webp${CACHE_V}`,
  "he_mind_5": `${PROD_PATH}mind/Deep%20Breath.webp${CACHE_V}`,
  "he_soul_1": `${PROD_PATH}soul/Boundless.webp${CACHE_V}`,
  "he_soul_2": `${PROD_PATH}soul/Floating.webp${CACHE_V}`,
  "he_soul_3": `${PROD_PATH}soul/Daybreak.webp${CACHE_V}`,
  "he_soul_4": `${PROD_PATH}soul/Void%20Moss.webp${CACHE_V}`,
  "he_soul_5": `${PROD_PATH}soul/Resonant.webp${CACHE_V}`,
  "jing_field_1": `${RAW_PROD}place/Crackled.webp${CACHE_V}`,
  "jing_field_2": `${RAW_PROD}place/Necklace%20.webp${CACHE_V}`,
  "jing_field_3": `${RAW_PROD}place/Walnut.webp${CACHE_V}`,
  "jing_field_4": `${RAW_PROD}place/candle.webp${CACHE_V}`,
  "jing_field_5": `https://images.unsplash.com/photo-1602928321679-560bb453f190?q=80&w=800`, 
  "jing_meditation_1": `${RAW_PROD}Meditation/Incense%20Sticks.webp${CACHE_V}`,
  "jing_meditation_2": `${RAW_PROD}Meditation/Rollerball.webp${CACHE_V}`,
  "jing_meditation_3": `${RAW_PROD}Meditation/Gypsum.webp${CACHE_V}`,
  "jing_meditation_4": `${RAW_PROD}Meditation/mountain.webp${CACHE_V}`,
  "jing_meditation_5": `${RAW_PROD}Meditation/glass.webp${CACHE_V}`,
};

export const ASSETS = {
  logo: ASSET_REGISTRY.brand.logo,
  hero_zen: ASSET_REGISTRY.brand.hero_home,
  hero_forest: ASSET_REGISTRY.brand.hero_story,
  xhs_link: ASSET_REGISTRY.brand.xhs_link
};

export const DATABASE: Record<string, ScentItem> = {};

/**
 * ------------------------------------------------------------------
 * 4. 全球寻香坐标 (DESTINATIONS) - 恢复 80+ 完整列表
 * ------------------------------------------------------------------
 */
export const DESTINATIONS: Record<string, Destination> = {};

const getPic = (i: number, sig: string) => {
  const ids = ['1464822759023-fed622ff2c3b', '1506744038136-46273834b3fb', '1441974231531-c6227db76b6e', '1499002238440-d264edd596ec', '1530789253388-582c481c54b0', '1519681393784-d120267933ba', '1501785888041-af3ef285b470', '1500530855697-b586d89ba3ee'];
  return `https://images.unsplash.com/photo-${ids[i % ids.length]}?auto=format&fit=crop&q=80&w=1200&sig=${sig}`;
};

const WORLD_RAW_DATA = {
  '亚洲': [
    { n: '泰国', c: 40, s: 'arrived', d: '安息香、罗勒、香茅等热带香料', p: ['yuan_water_benzoin'] },
    { n: '中国香港', c: 18, s: 'arrived', d: '重要的芳香贸易与调香中心', p: ['he_mind_5'] },
    { n: '马来西亚', c: 13, s: 'arrived', d: '安息香', p: [] },
    { n: '印尼', c: 12, s: 'arrived', d: '广藿香、丁香、肉豆蔻', p: ['yuan_water_patchouli'] },
    { n: '阿联酋', c: 12, s: 'arrived', d: '干旱地区特色含精油植物（如没药）', p: ['yuan_water_myrrh'] },
    { n: '越南', c: 6, s: 'arrived', d: '安息香、沉香', p: [] },
    { n: '哈萨克斯坦', c: 4, s: 'arrived', d: '中亚当地特色芳香植物', p: [] },
    { n: '印度', c: 3, s: 'arrived', d: '岩兰草（东印度檀香）、茉莉、檀香', p: ['yuan_wood_sandalwood'] },
    { n: '日本', c: 2, s: 'arrived', d: '桧木、柚子、扁柏', p: ['yuan_wood_cedar'] },
    { n: '伊朗', c: 2, s: 'arrived', d: '藏红花、玫瑰等', p: ['yuan_fire_rose'] },
    { n: '约旦', c: 2, s: 'arrived', d: '沙漠特色芳香植物', p: [] },
    { n: '中国澳门', c: 2, s: 'arrived', d: '芳香文化与贸易节点', p: [] },
    { n: '新加坡', c: 2, s: 'arrived', d: '东南亚芳香枢纽', p: [] },
    { n: '韩国', c: 1, s: 'arrived', d: '松针、竹子、柑橘', p: ['yuan_wood_pine'] },
    { n: '柬埔寨', c: 1, s: 'arrived', d: '香茅、卡南加（伊兰伊兰近缘种）', p: [] },
    { n: '朝鲜', c: 1, s: 'arrived', d: '当地特色植物', p: [] },
    { n: '斯里兰卡', c: 0, s: 'locked', d: '肉桂（品质闻名）、柠檬草、胡椒', p: [] },
    { n: '尼泊尔', c: 0, s: 'locked', d: '喜马拉雅雪松、冬青、穗甘松', p: [] }
  ],
  '欧洲': [
    { n: '土耳其', c: 8, s: 'arrived', d: '玫瑰、月桂等', p: [] },
    { n: '波兰', c: 5, s: 'arrived', d: '东欧当地特色植物', p: [] },
    { n: '法国', c: 5, s: 'arrived', d: '格拉斯（世界香水之都：玫瑰、茉莉、薰衣草）', p: ['yuan_fire_jasminum'] },
    { n: '德国', c: 4, s: 'arrived', d: '洋甘菊、草药提取物技术中心', p: [] },
    { n: '意大利', c: 2, s: 'arrived', d: '柠檬（卡拉布里亚）、迷迭香、鼠尾草', p: ['yuan_earth_bergamot'] },
    { n: '奥地利', c: 2, s: 'arrived', d: '当地特色植物', p: [] },
    { n: '丹麦', c: 2, s: 'arrived', d: '北欧当地特色植物', p: [] },
    { n: '匈牙利', c: 2, s: 'arrived', d: '薰衣草、鼠尾草', p: [] },
    { n: '西班牙', c: 1, s: 'arrived', d: '苦橙、迷迭香、薰衣草', p: [] },
    { n: '荷兰', c: 1, s: 'arrived', d: '郁金香、花卉育种与贸易中心', p: [] },
    { n: '摩纳哥', c: 1, s: 'arrived', d: '高端香水文化窗口', p: [] },
    { n: '卢森堡', c: 1, s: 'arrived', d: '当地特色植物', p: [] },
    { n: '保加利亚', c: 0, s: 'locked', d: '大马士革玫瑰精油核心产区', p: [] },
    { n: '英国', c: 0, s: 'locked', d: '现代芳疗发源地与学术中心', p: [] },
    { n: '葡萄牙', c: 0, s: 'locked', d: '岩蔷薇、桉树、橙花', p: [] },
    { n: '克罗地亚', c: 0, s: 'locked', d: '薰衣草、鼠尾草、松树', p: [] },
    { n: '希腊', c: 0, s: 'locked', d: '香桃木、橄榄油、马郁兰', p: [] }
  ],
  '非洲': [
    { n: '南非', c: 12, s: 'arrived', d: '路易波士、天竺葵、布枯', p: ['yuan_fire_geranium'] },
    { n: '肯尼亚', c: 2, s: 'arrived', d: '茶油、蜡菊等', p: [] },
    { n: '埃及', c: 2, s: 'arrived', d: '茉莉、香草（历史悠久）', p: [] },
    { n: '津巴布韦', c: 1, s: 'arrived', d: '当地特色植物', p: [] },
    { n: '马达加斯加', c: 0, s: 'locked', d: '伊兰伊兰（依兰）、丁香、香草', p: ['yuan_fire_ylang'] },
    { n: '摩洛哥', c: 0, s: 'locked', d: '玫瑰、雪松、茉莉', p: [] }
  ],
  '北美洲': [
    { n: '美国', c: 7, s: 'arrived', d: '薄荷、留兰香、柑橘类精油', p: ['yuan_gold_mint'] },
    { n: '墨西哥', c: 4, s: 'arrived', d: '莱姆、香草、Copaiba精油', p: [] },
    { n: '海地', c: 0, s: 'locked', d: '岩兰草（西印度檀香） 重要产区', p: [] }
  ],
  '南美洲': [
    { n: '巴西', c: 8, s: 'arrived', d: '甜橙、柠檬、玫瑰木', p: ['yuan_earth_mandarin'] },
    { n: '阿根廷', c: 0, s: 'locked', d: '柠檬、绿花白千层、马黛茶精油', p: [] }
  ],
  '大洋洲': [
    { n: '澳大利亚', c: 0, s: 'locked', d: '茶树、尤加利、檀香（澳大利亚种）', p: [] }
  ]
};

let dIdx = 0;
Object.entries(WORLD_RAW_DATA).forEach(([region, list]) => {
  list.forEach((item) => {
    const id = `dest_global_${dIdx++}`;
    DESTINATIONS[id] = {
      id, name: item.n, en: item.n.toUpperCase(), region: region === '北美洲' || region === '南美洲' || region === '大洋洲' ? '美洲/大洋洲' : region,
      status: item.s as 'arrived' | 'locked', visitCount: item.c, 
      scenery: getPic(dIdx, id), emoji: '📍',
      herbDescription: item.d, knowledge: `${item.n} 产区分子图谱已存档。`,
      productIds: item.p || [],
      ericDiary: `在 ${item.n} 的荒野中，我听见了植物为了生存而发出的芬芳呐喊。`,
      aliceDiary: `样本分析显示，${item.n} 原产地的活性成分具有独特的地域生物活性。`,
      memoryPhotos: [getPic(dIdx+100, id+'_1'), getPic(dIdx+110, id+'_2'), getPic(dIdx+120, id+'_3')]
    };
  });
});

// 中华神州保留部分
const CHINA_PROVINCES = [
  { n: '四川', sub: '华西' }, { n: '云南', sub: '华西' }, { n: '西藏', sub: '华西' },
  { n: '广东', sub: '华南' }, { n: '福建', sub: '华南' }, { n: '海南', sub: '华南' },
  { n: '浙江', sub: '华东' }, { n: '江苏', sub: '华东' }, { n: '北京', sub: '华北' },
  { n: '新疆', sub: '西北' }, { n: '甘肃', sub: '西北' }, { n: '陕西', sub: '西北' },
  { n: '上海', sub: '华东' }, { n: '山东', sub: '华东' }, { n: '湖南', sub: '华中' },
  { n: '湖北', sub: '华中' }, { n: '河南', sub: '华中' }, { n: '贵州', sub: '华西' },
  { n: '广西', sub: '华南' }, { n: '江西', sub: '华东' }, { n: '安徽', sub: '华东' }
];

CHINA_PROVINCES.forEach((prov, i) => {
  const id = `cn_${prov.sub}_${prov.n}`;
  DESTINATIONS[id] = {
    id, name: prov.n, en: prov.n.toUpperCase() + ', CHINA', region: '亚洲', status: 'arrived',
    visitCount: 15, scenery: getPic(i + 400, id), emoji: '📍',
    herbDescription: '神州极境原生寻踪。', knowledge: '原生分子图谱已解码。',
    productIds: prov.n === '云南' ? ['yuan_fire_rose'] : prov.n === '甘肃' ? ['yuan_gold_mint'] : [],
    ericDiary: `${prov.n} 的气味，是大地写给游子的家书。`,
    aliceDiary: `神州原生植物样本显示出独特的抗氧化活性与极佳纯度。`,
    memoryPhotos: [getPic(i+410, id+'_1'), getPic(i+420, id+'_2'), getPic(i+430, id+'_3')],
    isChinaProvince: true, subRegion: prov.sub
  };
});

/**
 * ------------------------------------------------------------------
 * 5. 产品数据库初始化
 * ------------------------------------------------------------------
 */
const YUAN_GROUP_CONF: Record<string, any> = {
  'gold': { theme: '元 · 肃降', eric: '金之意志在于决断。我在阿曼荒原见乳香凝泪，那是植物的生命盾牌。', alice: '高浓度单萜烯，确保分子链纯粹。', benefits: ['呼吸净化', '意识清空'], usage: '滴入扩香皿或合掌嗅吸。', precautions: '三岁以下慎用。' },
  'wood': { theme: '元 · 生发', eric: '老山檀香是时间的琥珀，木的频率向下扎根。', alice: '倍半萜醇比例突破行业标准，长效平抑神经活跃。', benefits: ['深度睡眠', '焦虑平复'], usage: '配合胡桃木扩香器。', precautions: '质地浓稠需及时清理。' },
  'water': { theme: '元 · 润泽', eric: '杜松与岩兰草，带走身体里陈旧的杂质。', alice: '渗透压调节功能，辅助微循环。', benefits: ['通透重塑', '排解沉积'], usage: '配合矿石项链全天候萦绕。', precautions: '生理期前三天减量。' },
  'fire': { theme: '元 · 释放', eric: '玫瑰与依兰是炽热的燃烧，消融坚硬的压抑。', alice: '香茅醇黄金配比，瞬间提升多巴胺。', benefits: ['情感释放', '魅力重塑'], usage: '极少量嗅吸。', precautions: '高敏体质请先皮试。' },
  'earth': { theme: '元 · 稳定', eric: '生姜蕴含大地热能。当你觉得漂浮时，土让你重新脚踏实地。', alice: '富含姜烯，温中散寒。', benefits: ['中心能量', '消化平衡'], usage: '配合景观扩香。', precautions: '柑橘类具光敏性。' }
};

const YUAN_DEFS = [
  { slug: 'gold', items: [{ n: '神圣乳香', e: 'frankincense', en: 'Sacred Frankincense' }, { n: '极境薄荷', e: 'mint', en: 'Peppermint' }, { n: '极境尤加利', e: 'eucalyptus', en: 'Eucalyptus' }, { n: '极境茶树', e: 'teatree', en: 'Tea Tree' }, { n: '极境香茅', e: 'lemongrass', en: 'Citronella' }] },
  { slug: 'wood', items: [{ n: '老山檀香', e: 'sandalwood', en: 'Sandalwood' }, { n: '极境丝柏', e: 'cypress', en: 'Cypress' }, { n: '极境雪松', e: 'cedar', en: 'Cedar' }, { n: '极境松针', e: 'pine', en: 'Pine' }, { n: '神圣花梨木', e: 'rosewood', en: 'Rosewood' }] },
  { slug: 'water', items: [{ n: '极境杜松', e: 'juniper', en: 'Juniper' }, { n: '极境岩兰草', e: 'vetiver', en: 'Vetiver' }, { n: '极境广藿香', e: 'patchouli', en: 'Patchouli' }, { n: '极境没药', e: 'myrrh', en: 'Myrrh' }, { n: '极境安息香', e: 'benzoin', en: 'Benzoin' }] },
  { slug: 'fire', items: [{ n: '大马士革玫瑰', e: 'rose', en: 'Damask Rose' }, { n: '极境依兰', e: 'ylang', en: 'Ylang' }, { n: '极境茉莉', e: 'jasminum', en: 'Jasminum' }, { n: '极境橙花', e: 'neroli', en: 'Neroli' }, { n: '极境天竺葵', e: 'geranium', en: 'Geranium' }] },
  { slug: 'earth', items: [{ n: '极境佛手柑', e: 'bergamot', en: 'Bergamot' }, { n: '横断生姜', e: 'ginger', en: 'Ginger' }, { n: '极境红橘', e: 'mandarin', en: 'Mandarin' }, { n: '极境葡萄柚', e: 'grapefruit', en: 'Grapefruit' }, { n: '极境橡木苔', e: 'oakmoss', en: 'Oakmoss' }] }
];

YUAN_DEFS.forEach(g => {
  const conf = YUAN_GROUP_CONF[g.slug];
  g.items.forEach(item => {
    const id = `yuan_${g.slug}_${item.e}`;
    DATABASE[id] = {
      id, category: 'yuan', subGroup: conf.theme, name: item.n, herb: item.n, herbEn: item.en,
      region: '全球极境', status: 'arrived_origin', visited: true, accent: '#D75437',
      hero: PRODUCT_OVERRIDES[id] || ASSET_REGISTRY.visual_anchors.yuan,
      shortDesc: '极境高纯度单方萃取 / 99.9%', narrative: `“撷取 ${item.n} 在极限环境下的生存意志。”`,
      ericDiary: conf.eric, aliceDiary: conf.alice, aliceLabDiary: conf.alice,
      benefits: conf.benefits, recommendation: '适合进阶寻香者。', usage: item.n === '神圣乳香' ? '滴入扩香皿或合掌嗅吸。' : '根据需求滴入介质。', precautions: conf.precautions
    };
  });
});

const XIANG_GROUPS = [
  { theme: '香 · 能量', slug: 'body', items: [{ n: '云感 · 玫瑰檀香润肤霜', e: 'Cloud Velvet' }, { n: '晨曦 · 葡萄柚生姜沐浴露', e: 'Dawn Glow' }, { n: '月华 · 依兰天竺葵身体油', e: 'Moonlight Oil' }, { n: '清冽 · 尤加利薄荷洗发水', e: 'Frost Mint' }, { n: '润迹 · 丝柏护手精华', e: 'Trace Balm' }] },
  { theme: '香 · 愈合', slug: 'mind', items: [{ n: '止语 · 薰衣草岩兰草喷雾', e: 'Silent Mist' }, { n: '归处 · 橙花佛手柑舒缓膏', e: 'Sanctuary' }, { n: '听泉 · 洋甘菊广藿香凝露', e: 'Zen Fountain' }, { n: '微光 · 茉莉红橘淡香氛', e: 'Glimmer' }, { n: '深吸 · 杜松子乳香清吸瓶', e: 'Deep Breath' }] },
  { theme: '香 · 觉知', slug: 'soul', items: [{ n: '无界 · 没药乳香冥想油', e: 'Boundless' }, { n: '悬浮 · 杜松雪松觉醒露', e: 'Floating' }, { n: '破晓 · 香蜂草滚珠精萃', e: 'Daybreak' }, { n: '空寂 · 橡木苔安息香香水', e: 'Void Moss' }, { n: '共振 · 檀香鼠尾草复方', e: 'Resonant' }] }
];

XIANG_GROUPS.forEach(g => {
  g.items.forEach((item, i) => {
    const id = `he_${g.slug}_${i + 1}`;
    DATABASE[id] = {
      id, category: 'he', subGroup: g.theme, name: item.n, herb: item.n, herbEn: item.e,
      region: '拾载实验室', status: 'arrived', visited: true, accent: '#1C39BB',
      hero: PRODUCT_OVERRIDES[id] || ASSET_REGISTRY.visual_anchors.xiang,
      shortDesc: '复合处方级配比 / Synergy', narrative: `“将极境意志转化为日常感官修复。”`,
      ericDiary: `香系列是我对 Alice 实验室成果的感性注脚。`,
      aliceDiary: `微乳化技术确保活性分子跨越角质屏障。`,
      aliceLabDiary: `实现长效缓释。`,
      benefits: ['能量对齐', '屏障修护'], recommendation: '都市修复首选。', usage: '洁面或沐浴后使用。', precautions: '开封后 6 个月内用完。'
    };
  });
});

const JING_DEFS = [
  { id: 'jing_field_1', n: '极境 · 冰裂纹陶瓷扩香皿', desc: '汝窑工艺，裂纹呼吸。' },
  { id: 'jing_field_2', n: '流年 · 矿石扩香项链', desc: '随身的移动香场。' },
  { id: 'jing_field_3', n: '隐迹 · 胡桃木车载扩香', desc: '黑胡桃木重塑旅途。' },
  { id: 'jing_field_4', n: '素馨 · 纯手工植物蜡烛', desc: '单方融合。' },
  { id: 'jing_field_5', n: '赤焰 · 吹制玻璃扩香器', desc: '微温驱动扩散。' },
  { id: 'jing_meditation_1', n: '一柱 · 降真香线香', desc: '古法合香。' },
  { id: 'jing_meditation_2', n: '觉知 · 寻香滚珠', desc: '锚定思绪。' },
  { id: 'jing_meditation_3', n: '清空 · 香氛石膏', desc: '分子级空间清理。' },
  { id: 'jing_meditation_4', n: '归真 · 景观扩香座', desc: '双重修行。' },
  { id: 'jing_meditation_5', n: '承露 · 存香器', desc: '当代极简。' }
];

JING_DEFS.forEach(p => {
  DATABASE[p.id] = {
    id: p.id, category: 'jing', subGroup: p.id.includes('meditation') ? '境 · 冥想' : '境 · 场域', name: p.n, herb: p.n, herbEn: p.id,
    region: '艺术工坊', status: 'arrived', visited: true, accent: '#D4AF37',
    hero: PRODUCT_OVERRIDES[p.id] || ASSET_REGISTRY.visual_anchors.vessel,
    shortDesc: '空间配器 / Vessel', narrative: p.desc,
    ericDiary: `器皿是气味的骨架。`, aliceDiary: `物理介质精准控制。`, aliceLabDiary: `控制扩散速率。`,
    benefits: ['场域净化', '意识唤醒'], recommendation: '冥想空间常设。', usage: '根据器皿滴入精油。', precautions: '陶瓷易碎。'
  };
});
