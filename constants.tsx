
import { ScentItem, Destination } from './types';

/**
 * ------------------------------------------------------------------
 * 1. 品牌全局资产区 (元香Unio - 静奢美学)
 * ------------------------------------------------------------------
 */
const CDN_BASE = 'https://cdn.jsdelivr.net/gh/2008zxeric/unio-aroma@main/assets/';
const RAW_BASE = 'https://raw.githubusercontent.com/2008zxeric/unio-aroma/main/assets/';
const CACHE_V = '?v=105.0'; 

export const ASSET_REGISTRY = {
  brand: {
    // 这里建议以后替换为您的 SVG 链接，目前代码中已做滤镜优化
    logo: `${CDN_BASE}brand/logo.png${CACHE_V}`,
    hero_home: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=1920', 
    hero_story: 'https://images.unsplash.com/photo-1471922694854-ff1b63b20054?q=80&w=1200',
    xhs_link: 'https://xhslink.com/m/AcZDZuYhsVd'
  },
  visual_anchors: {
    yuan: 'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?q=80&w=800',
    xiang: 'https://images.unsplash.com/photo-1601049541289-9b1b7bbbfe19?q=80&w=800', 
    vessel: 'https://images.unsplash.com/photo-1544413647-ad342111a43a?q=80&w=800',
    placeholder: 'https://images.unsplash.com/photo-1518173946687-a4c8a9b749f5?q=80&w=800'
  }
};

export const ASSETS = {
  logo: ASSET_REGISTRY.brand.logo,
  xhs_link: ASSET_REGISTRY.brand.xhs_link,
  hero_zen: ASSET_REGISTRY.brand.hero_home,
  hero_forest: ASSET_REGISTRY.brand.hero_story,
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

export const DATABASE: Record<string, ScentItem> = {};
export const DESTINATIONS: Record<string, Destination> = {};

const getPic = (i: number, sig: string) => {
  const ids = ['1464822759023-fed622ff2c3b', '1506744038136-46273834b3fb', '1441974231531-c6227db76b6e', '1499002238440-d264edd596ec', '1530789253388-582c481c54b0', '1519681393784-d120267933ba', '1501785888041-af3ef285b470', '1500530855697-b586d89ba3ee'];
  return `https://images.unsplash.com/photo-${ids[i % ids.length]}?auto=format&fit=crop&q=80&w=1200&sig=${sig}`;
};

/**
 * 4. 寻香坐标初始化
 */
const WORLD_DATA = {
  '亚洲': [
    { n: '泰国', c: 40, s: 'arrived', d: '安息香、罗勒、香茅' },
    { n: '印度', c: 3, s: 'arrived', d: '岩兰草、茉莉、檀香' },
    { n: '日本', c: 2, s: 'arrived', d: '桧木、柚子、扁柏' },
    { n: '中国香港', c: 18, s: 'arrived', d: '芳香贸易与调香中心' },
    { n: '马来西亚', c: 13, s: 'arrived', d: '顶级安息香' },
    { n: '印尼', c: 12, s: 'arrived', d: '广藿香、丁香、肉豆蔻' },
    { n: '阿联酋', c: 12, s: 'arrived', d: '没药、乳香、沙漠韧性植物' },
    { n: '越南', c: 6, s: 'arrived', d: '安息香、沉香' },
    { n: '哈萨克斯坦', c: 4, s: 'arrived', d: '中亚耐寒芳草' },
    { n: '伊朗', c: 2, s: 'arrived', d: '藏红花、大马士革玫瑰' },
    { n: '约旦', c: 2, s: 'arrived', d: '死海周边特色植物' },
    { n: '中国澳门', c: 2, s: 'arrived', d: '芳香文化交流' },
    { n: '新加坡', c: 2, s: 'arrived', d: '东南亚枢纽' },
    { n: '韩国', c: 1, s: 'arrived', d: '松针、竹子、柑橘' },
    { n: '柬埔寨', c: 1, s: 'arrived', d: '香茅、卡南加' },
    { n: '朝鲜', c: 1, s: 'arrived', d: '原生耐寒草本' },
    { n: '斯里兰卡', c: 0, s: 'locked', d: '锡兰肉桂、柠檬草' },
    { n: '尼泊尔', c: 0, s: 'locked', d: '喜马拉雅雪松、穗甘松' }
  ],
  '欧洲': [
    { n: '土耳其', c: 8, s: 'arrived', d: '玫瑰、月桂' },
    { n: '波兰', c: 5, s: 'arrived', d: '波罗的海林间芳草' },
    { n: '法国', c: 5, s: 'arrived', d: '格拉斯玫瑰、茉莉、薰衣草' },
    { n: '德国', c: 4, s: 'arrived', d: '洋甘菊、高精草药' },
    { n: '意大利', c: 2, s: 'arrived', d: '柠檬、鼠尾草' },
    { n: '奥地利', c: 2, s: 'arrived', d: '阿尔卑斯高山精华' },
    { n: '丹麦', c: 2, s: 'arrived', d: '北欧原生耐寒植物' },
    { n: '匈牙利', c: 2, s: 'arrived', d: '薰衣草、鼠尾草' },
    { n: '西班牙', c: 1, s: 'arrived', d: '苦橙、迷迭香、薰衣草' },
    { n: '荷兰', c: 1, s: 'arrived', d: '郁金香、花卉贸易' },
    { n: '摩纳哥', c: 1, s: 'arrived', d: '高端香水视窗' },
    { n: '卢森堡', c: 1, s: 'arrived', d: '西欧特色芳草' },
    { n: '保加利亚', c: 0, s: 'locked', d: '大马士革玫瑰' },
    { n: '英国', c: 0, s: 'locked', d: '现代芳疗学术中心' },
    { n: '葡萄牙', c: 0, s: 'locked', d: '岩蔷薇、桉树、橙花' },
    { n: '克罗地亚', c: 0, s: 'locked', d: '海岛薰衣草' },
    { n: '希腊', c: 0, s: 'locked', d: '香桃木、橄榄、马郁兰' }
  ],
  '非洲': [
    { n: '南非', c: 12, s: 'arrived', d: '路易波士、天竺葵、布枯' },
    { n: '肯尼亚', c: 2, s: 'arrived', d: '茶油、蜡菊' },
    { n: '埃及', c: 2, s: 'arrived', d: '茉莉、古典香草' },
    { n: '津巴布韦', c: 1, s: 'arrived', d: '东部高原植物' },
    { n: '马达加斯加', c: 0, s: 'locked', d: '依兰、丁香、香草' },
    { n: '摩洛哥', c: 0, s: 'locked', d: '极境玫瑰、雪松、茉莉' }
  ],
  '美洲/大洋洲': [
    { n: '美国', c: 7, s: 'arrived', d: '薄荷、柑橘' },
    { n: '墨西哥', c: 4, s: 'arrived', d: '莱姆、香草、Copaiba' },
    { n: '巴西', c: 8, s: 'arrived', d: '甜橙、柠檬、玫瑰木' },
    { n: '海地', c: 0, s: 'locked', d: '岩兰草（西印度檀香）' },
    { n: '阿根廷', c: 0, s: 'locked', d: '柠檬、绿花白千层、马黛茶' },
    { n: '澳大利亚', c: 0, s: 'locked', d: '茶树、尤加利、澳洲檀香' }
  ]
};

let dIdx = 0;
Object.entries(WORLD_DATA).forEach(([region, list]) => {
  list.forEach((item) => {
    const id = `dest_global_${dIdx++}`;
    DESTINATIONS[id] = {
      id, name: item.n, en: item.n.toUpperCase(), region, status: item.s as any,
      visitCount: item.c, scenery: getPic(dIdx, id), emoji: '📍',
      herbDescription: item.d, knowledge: `${item.n} 寻香数据库已存档。`,
      productIds: [],
      ericDiary: `在 ${item.n} 的足迹，是生命在极境中的坚韧表白。`,
      aliceDiary: `实验室分析显示，${item.n} 产区的分子图谱具有环境适应带来的独特紧固性。`,
      memoryPhotos: [getPic(dIdx+100, id+'_1'), getPic(dIdx+110, id+'_2'), getPic(dIdx+120, id+'_3')]
    };
  });
});

const CHINA_PROVINCES = [
  { n: '四川', sub: '西南', e: '蜀地深山的薄雾里，藏着对抗湿冷的智慧。', a: '高活性单萜烯显著。' },
  { n: '云南', sub: '西南', e: '横断山脉的起伏，是生命多样性的史诗。', a: '黄金醇醛配比。' },
  { n: '西藏', sub: '西南', e: '在纳木错的寒风中，触碰生命的震动。', a: '极高能级次生代谢。' },
  { n: '贵州', sub: '西南', e: '万峰林间的草木灵气。', a: '富硒环境影响结构。' },
  { n: '广东', sub: '华南', e: '岭南的雨，洗净沉香木的浮华。', a: '分子级稳定性指纹。' },
  { n: '福建', sub: '华南', e: '茶香与海风的诗意平衡。', a: '多酚氧化还原电位研究。' },
  { n: '海南', sub: '华南', e: '海岛椰林下的包容生命。', a: '热带海洋性油脂分析。' },
  { n: '广西', sub: '华南', e: '漓江烟雨的洗涤感官。', a: '喀斯特矿物沉积效应。' },
  { n: '浙江', sub: '华东', e: '江南诗意中的精准科学。', a: '微乳化专利应用。' },
  { n: '江苏', sub: '华东', e: '园林深处的苔藓隐喻。', a: '微观环境分子偏移。' },
  { n: '上海', sub: '华东', e: '都市金属感中的温存处方。', a: '抗应激神经修复核心。' },
  { n: '安徽', sub: '华东', e: '黄山松的坚毅，是美学的具象。', a: '针叶蒎烯高纯提炼。' },
  { n: '山东', sub: '华东', e: '齐鲁大地的生命张力。', a: '北方沿海净感分子。' },
  { n: '北京', sub: '华北', e: '皇城古木的百年静默意志。', a: '缓慢合成长寿路径。' },
  { n: '山西', sub: '华北', e: '黄土高原下的根系温热。', a: '地心能量传导模型。' },
  { n: '湖南', sub: '华中', e: '湘江畔的野性脉动。', a: '循环激活红外验证。' },
  { n: '新疆', sub: '西北', e: '天山下的薰衣草生存极限。', a: '强光造就紧固分子键。' },
  { n: '甘肃', sub: '西北', e: '河西走廊的植物抗争史。', a: '荒漠内酯分子发现。' },
  { n: '陕西', sub: '西北', e: '秦岭脊梁的嗅觉分水岭。', a: '雪松倍半萜醇优势。' }
];

CHINA_PROVINCES.forEach((prov, i) => {
  const id = `cn_${prov.sub}_${prov.n}`;
  DESTINATIONS[id] = {
    id, name: prov.n, en: prov.n.toUpperCase() + ', CHINA', region: '亚洲', status: 'arrived',
    visitCount: Math.floor(Math.random() * 5) + 3,
    scenery: getPic(i + 400, id), emoji: '📍',
    herbDescription: '神州原生极境寻踪档案。', knowledge: '原生分子图谱已存档。',
    productIds: prov.n === '云南' ? ['yuan_fire_rose'] : [],
    ericDiary: prov.e, aliceDiary: prov.a,
    memoryPhotos: [getPic(i+410, id+'_1'), getPic(i+420, id+'_2'), getPic(i+430, id+'_3')],
    isChinaProvince: true, subRegion: prov.sub
  };
});

// 5. 产品初始化 (50款)
const YUAN_GROUP_CONF: Record<string, any> = {
  'gold': { theme: '元 · 肃降', eric: '乳香是大地的眼泪。', alice: '高纯度单萜烯。', benefits: ['呼吸净化', '深层镇静'], usage: '扩香。', precautions: '孕期前三月禁用。' },
  'wood': { theme: '元 · 生发', eric: '老山檀香是时间的琥珀。', alice: 'Santalol 占比 >90%。', benefits: ['深度安眠', '锚定能量'], usage: '按摩。', precautions: '敏感肌稀释。' },
  'water': { theme: '元 · 润泽', eric: '杜松子是深山清泉。', alice: '渗透压平衡效应。', benefits: ['空间净化', '代谢负能'], usage: '足浴或喷雾。', precautions: '肾病患者慎用。' },
  'fire': { theme: '元 · 释放', eric: '玫瑰在烈日下盛放。', alice: '多巴胺通路激活。', benefits: ['爱意激发', '情绪释放'], usage: '香氛。', precautions: '勿大面积涂抹。' },
  'earth': { theme: '元 · 稳定', eric: '生姜是大地的温热。', alice: '姜辣素活性分子。', benefits: ['温热升阳', '强化意志'], usage: '扩香或按摩。', precautions: '洗澡前勿用。' }
};

const YUAN_DEFS = [
  { slug: 'gold', items: [{ n: '神圣乳香', e: 'frankincense' }, { n: '极境薄荷', e: 'mint' }, { n: '极境尤加利', e: 'eucalyptus' }, { n: '极境茶树', e: 'teatree' }, { n: '极境香茅', e: 'lemongrass' }] },
  { slug: 'wood', items: [{ n: '老山檀香', e: 'sandalwood' }, { n: '极境丝柏', e: 'cypress' }, { n: '极境雪松', e: 'cedar' }, { n: '极境松针', e: 'pine' }, { n: '神圣花梨木', e: 'rosewood' }] },
  { slug: 'water', items: [{ n: '极境杜松', e: 'juniper' }, { n: '极境岩兰草', e: 'vetiver' }, { n: '极境广藿香', e: 'patchouli' }, { n: '极境没药', e: 'myrrh' }, { n: '极境安息香', e: 'benzoin' }] },
  { slug: 'fire', items: [{ n: '大马士革玫瑰', e: 'rose' }, { n: '极境依兰', e: 'ylang' }, { n: '极境茉莉', e: 'jasminum' }, { n: '极境橙花', e: 'neroli' }, { n: '极境天竺葵', e: 'geranium' }] },
  { slug: 'earth', items: [{ n: '极境佛手柑', e: 'bergamot' }, { n: '横断生姜', e: 'ginger' }, { n: '极境红橘', e: 'mandarin' }, { n: '极境葡萄柚', e: 'grapefruit' }, { n: '极境橡木苔', e: 'oakmoss' }] }
];

YUAN_DEFS.forEach(g => {
  const conf = YUAN_GROUP_CONF[g.slug];
  g.items.forEach(item => {
    const id = `yuan_${g.slug}_${item.e}`;
    DATABASE[id] = {
      id, category: 'yuan', subGroup: conf.theme, name: item.n, herb: item.n, herbEn: item.e.toUpperCase(),
      region: '全球极境', status: 'arrived_origin', visited: true, accent: '#D75437',
      hero: PRODUCT_OVERRIDES[id] || ASSET_REGISTRY.visual_anchors.yuan,
      shortDesc: '极境高纯度单方萃取 / 100% PURE', narrative: `“撷取 ${item.n} 在极端环境下的生命防御。”`,
      ericDiary: conf.eric, aliceDiary: conf.alice, aliceLabDiary: conf.alice,
      benefits: conf.benefits, recommendation: '高级寻香者之选。', usage: conf.usage, precautions: conf.precautions
    };
  });
});

const XIANG_GROUPS = [
  { theme: '香 · 能量 (Body)', slug: 'body', items: [{ n: '云感润肤霜', e: 'Cloud Velvet' }, { n: '晨曦沐浴露', e: 'Dawn Glow' }, { n: '月华身体油', e: 'Moonlight Oil' }, { n: '清冽洗发水', e: 'Frost Mint' }, { n: '润迹护手精华', e: 'Trace Balm' }] },
  { theme: '香 · 愈合 (Mind)', slug: 'mind', items: [{ n: '止语喷雾', e: 'Silent Mist' }, { n: '归处舒缓膏', e: 'Sanctuary' }, { n: '听泉凝露', e: 'Zen Fountain' }, { n: '微光淡香氛', e: 'Glimmer' }, { n: '深吸清吸瓶', e: 'Deep Breath' }] },
  { theme: '香 · 觉知 (Soul)', slug: 'soul', items: [{ n: '无界冥想油', e: 'Boundless' }, { n: '悬浮觉醒露', e: 'Floating' }, { n: '破晓滚珠', e: 'Daybreak' }, { n: '空寂香水', e: 'Void Moss' }, { n: '共振复方', e: 'Resonant' }] }
];

XIANG_GROUPS.forEach(g => {
  g.items.forEach((item, i) => {
    const id = `he_${g.slug}_${i + 1}`;
    DATABASE[id] = {
      id, category: 'he', subGroup: g.theme, name: item.n, herb: item.n, herbEn: item.e,
      region: '拾载实验室', status: 'arrived', visited: true, accent: '#1C39BB',
      hero: PRODUCT_OVERRIDES[id] || ASSET_REGISTRY.visual_anchors.xiang,
      shortDesc: '极境复合处方配比', narrative: `将极境意志转化为日常感官修复。`,
      ericDiary: `这是我对都市快节奏生活的诗意解救方案。`,
      aliceDiary: `采用微乳化专利技术实现的复合分子结构。`,
      aliceLabDiary: `长效缓释，深层修复。`,
      benefits: ['能量重塑', '感官平衡'], recommendation: '都市生活必备。', usage: '取适量均匀涂抹。', precautions: '开封后请于 6 个月内用完。'
    };
  });
});

const JING_DEFS = [
  { id: 'jing_field_1', n: '冰裂纹陶瓷扩香皿', g: '境 · 场域之物', e: '器皿是香气的肉身。', a: '高孔隙率低温瓷。' },
  { id: 'jing_field_2', n: '矿石扩香项链', g: '境 · 场域之物', e: '随身佩戴的宁静坐标。', a: '天然火山矿石吸附原理。' },
  { id: 'jing_field_3', n: '胡桃木车载扩香', g: '境 · 场域之物', e: '安抚被速度撕碎的时间。', a: '物理风动力控制设计。' },
  { id: 'jing_field_4', n: '手工植物蜡烛', g: '境 · 场域之物', e: '火光中的分子生命跳动。', a: '大豆蜡与高纯精油共融。' },
  { id: 'jing_field_5', n: '吹制玻璃扩香器', g: '境 · 场域之物', e: '光影与分子的双重交响。', a: '空气流体力学应用。' },
  { id: 'jing_meditation_1', n: '一柱 · 纯木线香', g: '境 · 冥想之物', e: '古法合香，一柱定心。', a: '天然木粉无添加。' },
  { id: 'jing_meditation_2', n: '觉知 · 能量滚珠器', g: '境 · 冥想之物', e: '感官锚定器。', a: '精密流控设计。' },
  { id: 'jing_meditation_3', n: '清空 · 扩香石膏', g: '境 · 冥想之物', e: '极简空间呼吸感。', a: '高白石膏缓释特性。' },
  { id: 'jing_meditation_4', n: '归真 · 景观扩香座', g: '境 · 冥想之物', e: '微缩的极境美学视角。', a: '多孔结构吸附。' },
  { id: 'jing_meditation_5', n: '承露 · 精密存香器', g: '境 · 冥想之物', e: '保护分子生命尊严。', a: '避光密封。' }
];

JING_DEFS.forEach(p => {
  DATABASE[p.id] = {
    id: p.id, category: 'jing', subGroup: p.g, name: p.n, herb: p.n, herbEn: p.id.toUpperCase(),
    region: '艺术工坊', status: 'arrived', visited: true, accent: '#D4AF37',
    hero: PRODUCT_OVERRIDES[p.id] || ASSET_REGISTRY.visual_anchors.vessel,
    shortDesc: '感官美学载体 / Vessel', narrative: '决定香气在空间呈现姿态的物理外壳。',
    ericDiary: p.e, aliceDiary: p.a, aliceLabDiary: p.a,
    benefits: ['场域美学', '宁静锚点'], recommendation: '建议配合“元”系列单方使用。', usage: '滴入 3-5 滴。', precautions: '易碎物品，小心轻放。'
  };
});
