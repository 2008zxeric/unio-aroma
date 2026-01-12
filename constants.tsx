import { ScentItem, Destination } from './types';

/**
 * ------------------------------------------------------------------
 * 1. 品牌全局资产区 (元香Unio - 静奢美学)
 * ------------------------------------------------------------------
 */
const CDN_BASE = 'https://cdn.jsdelivr.net/gh/2008zxeric/unio-aroma@main/assets/';
const RAW_BASE = 'https://raw.githubusercontent.com/2008zxeric/unio-aroma/main/assets/';
const CACHE_V = '?v=90.0'; 

export const ASSET_REGISTRY = {
  brand: {
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

// 产品图覆盖配置（保持最新索引）
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
 * ------------------------------------------------------------------
 * 4. 全量寻香坐标 (数据库全量恢复 50+ 条目)
 * ------------------------------------------------------------------
 */
const WORLD_DATA = {
  '亚洲': [
    { n: '泰国', c: 40, s: 'arrived', d: '安息香、罗勒、香茅等热带香料', e: '在曼谷的潮热与清迈的晨雾间，气味是不再是点缀，它是生命在高温下的坚韧表白。', a: '热带树脂中含有的高比例酯类分子，在模拟实验中呈现出显著的血清素激活特性。' },
    { n: '印度', c: 3, s: 'arrived', d: '岩兰草、茉莉、檀香', e: '恒河畔的晨曦中，岩兰草扎根于泥土的深处，那是关于生存最古老的芬芳。', a: '东印度檀香中檀香醇浓度稳定在90%以上，具有无可比拟的神经舒缓能级。' },
    { n: '日本', c: 2, s: 'arrived', d: '桧木、柚子、扁柏', e: '京都古寺的木质香气，是时间在静止中呼出的冷冽。', a: '桧木醇通过物理呼吸途径有效降低交感神经的过度兴奋状态。' },
    { n: '中国香港', c: 18, s: 'arrived', d: '重要的芳香贸易与调香中心', e: '维多利亚港的咸湿混合着旧药铺的沉木香。', a: '作为全球芳香原料的交汇点，此地的样本展现出极高的化学多样性。' },
    { n: '马来西亚', c: 13, s: 'arrived', d: '安息香', e: '雨林深处的树脂，是大地流出的金色血液。', a: '本产地安息香的香草醛含量稳定在极高水平。' },
    { n: '印尼', c: 12, s: 'arrived', d: '广藿香、丁香、肉豆蔻', e: '火山灰下埋藏的辛辣，是热带泥土最深沉的呼吸。', a: '广藿香醇（Patchoulol）的浓度通过精密萃取锁定，呈现出独特的“地衣”分子结构。' },
    { n: '阿联酋', c: 12, s: 'arrived', d: '极境没药与珍稀树脂', e: '在茫茫沙海中，只有树脂能抵御时间的磨蚀。', a: '极干燥环境催生了分子链的高度紧凑性。' },
    { n: '越南', c: 6, s: 'arrived', d: '安息香、沉香', e: '湄公河畔的湿润，孕育了气味中最温柔的静谧。', a: '沉香醇组分在微气压条件下呈现出极佳的渗透压调节效果。' },
    { n: '哈萨克斯坦', c: 4, s: 'arrived', d: '当地特色植物', e: '中亚荒原的孤傲植物。', a: '强紫外线辐射让植物进化出了复杂的抗氧化分子团。' },
    { n: '伊朗', c: 2, s: 'arrived', d: '藏红花、玫瑰', e: '波斯高原的黎明，万亩玫瑰在干旱中吐露芬芳。', a: '极端温差促使玫瑰精油中香茅醇与香叶醇的黄金比例自然天成。' },
    { n: '约旦', c: 2, s: 'arrived', d: '当地特色植物', e: '死海畔的孤岛香气。', a: '高矿物质土壤赋予了植物独特的金属感分子前体。' },
    { n: '中国澳门', c: 2, s: 'arrived', d: '芳香文化与贸易节点', e: '南欧遗韵与岭南香文化的交响。', a: '样本分析关注芳香组分在极高环境光照下的稳定性表现。' },
    { n: '新加坡', c: 2, s: 'arrived', d: '东南亚芳香枢纽', e: '花园城市的未来主义香气。', a: '样本显示该地区植物具有极高的矿物质吸收效率。' },
    { n: '韩国', c: 1, s: 'arrived', d: '松针、竹子、柑橘', e: '雪后的松林，是清冷与坚毅的缩写。', a: '针叶类精油的蒎烯含量极其纯粹。' },
    { n: '柬埔寨', c: 1, s: 'arrived', d: '香茅、卡南加', e: '吴哥窟废墟中的生命力。', a: '卡南加精油的酯类分子结构在低湿环境下呈现出极佳活性。' },
    { n: '朝鲜', c: 1, s: 'arrived', d: '当地特色植物', e: '遥远而原始的植物寻踪。', a: '原始生境保持了分子图谱的纯粹性。' },
    { n: '斯里兰卡', c: 0, s: 'locked', d: '锡兰肉桂、柠檬草、胡椒', e: '待开启的锡兰香料之岛。', a: '肉桂醛含量具有显著的产地独特性。' },
    { n: '尼泊尔', c: 0, s: 'locked', d: '喜马拉雅雪松、冬青、穗甘松', e: '喜马拉雅深处的圣地。', a: '雪松烯具有极高的药理科研价值。' }
  ],
  '欧洲': [
    { n: '土耳其', c: 8, s: 'arrived', d: '玫瑰、月桂', e: '博斯普鲁斯海峡的风，吹不散玫瑰的浓烈。', a: '高海拔大马士革玫瑰精油在皮质醇调节实验中表现优异。' },
    { n: '波兰', c: 5, s: 'arrived', d: '森林芳香植物', e: '东欧密林的清幽。', a: '森林氧代分子在模拟实验中展现出强力的免疫调节潜力。' },
    { n: '法国', c: 5, s: 'arrived', d: '格拉斯玫瑰、茉莉、薰衣草', e: '格拉斯的泥土里，流淌着几百年的调香史。', a: '经典的薰衣草乙酸酯比例。' },
    { n: '德国', c: 4, s: 'arrived', d: '洋甘菊、草药提取物', e: '严谨的药草森林。', a: '红没药醇组分的提纯纯度通过原子能谱分析已达医疗级。' },
    { n: '意大利', c: 2, s: 'arrived', d: '柠檬、迷迭香、鼠尾草', e: '托斯卡纳的阳光在每一个柑橘表皮跳跃。', a: '佛手柑内酯的去除技术保证了光敏安全性。' },
    { n: '奥地利', c: 2, s: 'arrived', d: '当地特色植物', e: '阿尔卑斯高山的纯净。', a: '极高海拔环境让植物合成了更复杂的次生代谢产物。' },
    { n: '丹麦', c: 2, s: 'arrived', d: '当地特色植物', e: '北欧极简主义的嗅觉具象。', a: '低温慢生长周期使得分子链极度细密。' },
    { n: '匈牙利', c: 2, s: 'arrived', d: '薰衣草、鼠尾草', e: '多瑙河畔的紫色梦境。', a: '中欧大陆性气候让此地薰衣草展现出更强的木质底蕴分子。' },
    { n: '西班牙', c: 1, s: 'arrived', d: '苦橙、迷迭香、薰衣草', e: '安达卢西亚的野性。', a: '迷迭香酸的天然提取物能有效延缓感官疲劳。' },
    { n: '荷兰', c: 1, s: 'arrived', d: '郁金香、花卉育种', e: '精准的色彩与气味管理。', a: '花卉挥发性组分研究为新香型的研发提供了数据。' },
    { n: '摩纳哥', c: 1, s: 'arrived', d: '高端香水文化', e: '地中海奢华的极致。', a: '样本分析关注芳香组分在极端环境光照下的稳定性。' },
    { n: '卢森堡', c: 1, s: 'arrived', d: '当地特色植物', e: '袖珍王国的脉动。', a: '样本显示该地区植物具有极高的矿物质吸收效率。' },
    { n: '保加利亚', c: 0, s: 'locked', d: '大马士革玫瑰', e: '玫瑰谷的黎明。', a: '大马士革玫瑰酮的指纹图谱已录入数据库。' },
    { n: '英国', c: 0, s: 'locked', d: '现代芳疗发源地', e: '庄园与现代实验室。', a: '现代芳疗理论体系的标准化样本地。' },
    { n: '葡萄牙', c: 0, s: 'locked', d: '岩蔷薇、桉树、橙花', e: '大西洋边缘的香气。', a: '岩蔷薇劳丹脂组分的高粘度分子研究极具挑战。' },
    { n: '克罗地亚', c: 0, s: 'locked', d: '薰衣草、鼠尾草、松树', e: '亚得里亚海的清风。', a: '海岛生境的薰衣草分子中海盐组分的痕迹研究。' },
    { n: '希腊', c: 0, s: 'locked', d: '香桃木、橄榄油、马郁兰', e: '爱琴海的古老誓言。', a: '香桃木酮在古籍药理中的应用。' }
  ],
  '非洲': [
    { n: '南非', c: 12, s: 'arrived', d: '路易波士、天竺葵、布枯', e: '好望角的好望角，是生命与风暴的对抗。', a: '布枯（Buchu）的含硫分子赋予了配方不可替代的张力。' },
    { n: '肯尼亚', c: 2, s: 'arrived', d: '茶油、蜡菊', e: '东非大裂谷的粗粝与温柔。', a: '蜡菊中的乙酸橙花酯浓度在极热环境下呈现出特殊分子异构化。' },
    { n: '埃及', c: 2, s: 'arrived', d: '茉莉、香草', e: '尼罗河畔的古老文明。', a: '埃及茉莉的吲哚含量极低且纯净。' },
    { n: '津巴布韦', c: 1, s: 'arrived', d: '当地特色植物', e: '原始高原的呼吸。', a: '植物提取物中稀有成分的发现，拓宽了极境原料图谱。' },
    { n: '马达加斯加', c: 0, s: 'locked', d: '依兰依兰、丁香、香草', e: '香气之岛。', a: '依兰依兰的一等萃取物（Extra）具有无与伦比的酯类浓度。' },
    { n: '摩洛哥', c: 0, s: 'locked', d: '玫瑰、雪松、茉莉', e: '撒哈拉边缘。', a: '摩洛哥雪松烯的强力疏通效应已在预研计划中。' }
  ],
  '美洲/大洋洲': [
    { n: '巴西', c: 8, s: 'arrived', d: '甜橙、柠檬、玫瑰木', e: '亚马逊雨林的潮湿，是地球最强力的心跳。', a: '玫瑰木精油中高纯度的芳樟醇，是现代神经生理学研究的重要参照标准。' },
    { n: '美国', c: 7, s: 'arrived', d: '薄荷、留兰香、柑橘', e: '加州的阳光在每一片薄荷叶上结晶。', a: '薄荷脑结晶的纯度管理，依托于精密的温控分段萃取工艺。' },
    { n: '墨西哥', c: 4, s: 'arrived', d: '莱姆、香草、Copaiba', e: '玛雅遗迹中的宁静。', a: 'Copaiba 香脂中极高浓度的石竹烯，是天然的调节剂。' },
    { n: '海地', c: 0, s: 'locked', d: '岩兰草', e: '极致的泥土意志。', a: '海地岩兰草醇的土腥味分子处理是实验室的技术壁垒。' },
    { n: '阿根廷', c: 0, s: 'locked', d: '马黛茶、柠檬', e: '潘帕斯草原的孤独。', a: '马黛茶多酚的挥发性化研究。' },
    { n: '澳大利亚', c: 0, s: 'locked', d: '茶树、尤加利、檀香', e: '旷野原力。', a: '4-松油醇在茶树精油中的杀菌动力学曲线是核心目标。' }
  ]
};

// 全球目的地初始化
let dIdx = 0;
Object.entries(WORLD_DATA).forEach(([region, list]) => {
  list.forEach((item) => {
    const id = `dest_global_${dIdx++}`;
    DESTINATIONS[id] = {
      id, name: item.n, en: item.n.toUpperCase(), region, status: item.s as any,
      visitCount: item.c, scenery: getPic(dIdx, id), emoji: '📍',
      herbDescription: item.d, knowledge: `${item.n} 寻香数据库已存档。`,
      productIds: [],
      ericDiary: item.e || `在 ${item.n} 的寻香印记，记录了生命在极限中的静默。`,
      aliceDiary: item.a || `实验室分析显示，此地样本具有极高的分子稳定性。`,
      memoryPhotos: [getPic(dIdx+100, id+'_1'), getPic(dIdx+110, id+'_2'), getPic(dIdx+120, id+'_3')]
    };
  });
});

// 中国省份数据全量恢复
const CHINA_PROVINCES = [
  { n: '四川', sub: '西南', e: '蜀地深山的薄雾里，藏着植物对抗湿冷的隐忍智慧。', a: '该产区植物单萜烯含量显著，在实验室中表现出极强的祛湿感应。' },
  { n: '云南', sub: '西南', e: '横断山脉的每一次起伏，都是一首关于生命多样性的史诗。', a: '云南高地植物呈现出独特的醇醛黄金比例，在平衡实验中表现优异。' },
  { n: '西藏', sub: '西南', e: '在纳木错的寒风中，你会明白什么是生命最纯粹的震动。', a: '极度强紫外线促使植物合成了更复杂的次生代谢产物，具备极高能级。' },
  { n: '贵州', sub: '西南', e: '山水之间，皆是草木灵气。', a: '富硒土壤赋予了植物独有的抗氧机制，提升了分子的能量层级。' },
  { n: '广东', sub: '华南', e: '岭南的雨，洗净了沉香木上的浮华。', a: '本产地样本在常温环境下的分子挥发速率具有极佳的线性稳定性。' },
  { n: '福建', sub: '华南', e: '茶香与海风，是闽南人骨子里的平衡。', a: '茶系芳香分子的多酚氧化还原电位是我们的研究重点。' },
  { n: '海南', sub: '华南', e: '椰林树影下，是来自海洋的包容。', a: '热带海洋性气候让植物油脂组分呈现出极佳的皮肤亲和性。' },
  { n: '广西', sub: '华南', e: '漓江烟雨，每一口呼吸都是洗涤。', a: '喀斯特地貌矿物质对植物芳香前体的影响在指纹图谱中可见。' },
  { n: '浙江', sub: '华东', e: '西湖的荷，在诗意中绽放科学的精准。', a: '水生植物组分的微乳化技术，实现了长效补水突破。' },
  { n: '江苏', sub: '华东', e: '江南园林里的每一寸苔藓都有其故事。', a: '样本分析关注微小植物在不同光强下的芳香组分偏移。' },
  { n: '上海', sub: '华东', e: '都市的金属感，需要极境的温存去化解。', a: '针对都市过敏原，我们强化了此类产品的抗炎分子浓度。' },
  { n: '安徽', sub: '华东', e: '黄山的松，是坚毅美学的具象化。', a: '松类精油中特定萜烯异构体，提升了神经传导效率。' },
  { n: '山东', sub: '华东', e: '齐鲁大地，见证植物最粗犷的生命力。', a: '北方沿海植物呈现出独特的“净”感。' },
  { n: '北京', sub: '华北', e: '皇城古木，历经百年的静默。', a: '古树样品的分子分析揭示了自然长寿分子的缓慢合成路径。' },
  { n: '山西', sub: '华北', e: '黄土高原下的植物根系，蕴含着地心的温热。', a: '根部提取物中多糖与挥发油的共萃取技术。' },
  { n: '湖南', sub: '华中', e: '三湘大地的野性与张力。', a: '辛辣组分对血液循环的微观加速作用在红外成像下得以验证。' },
  { n: '新疆', sub: '西北', e: '在塔克拉玛干的边缘，寻找薰衣草的极限。', a: '极强光照造就了分子键的异常紧固，使其在耐温性能上表现卓著。' },
  { n: '甘肃', sub: '西北', e: '河西走廊，每一步都是植物与沙尘的抗争。', a: '荒漠植物中内酯类分子的发现，为精神衰弱提供了方案。' },
  { n: '陕西', sub: '西北', e: '秦岭南北，是地理与嗅觉的分水岭。', a: '秦岭雪松的倍半萜醇比例展现出独特的能量场。' }
];

CHINA_PROVINCES.forEach((prov, i) => {
  const id = `cn_${prov.sub}_${prov.n}`;
  DESTINATIONS[id] = {
    id, name: prov.n, en: prov.n.toUpperCase() + ', CHINA', region: '亚洲', status: 'arrived',
    visitCount: Math.floor(Math.random() * 5) + 2,
    scenery: getPic(i + 400, id), emoji: '📍',
    herbDescription: '神州原生极境寻踪。', knowledge: '原生分子图谱已存档。',
    productIds: prov.n === '云南' ? ['yuan_fire_rose'] : [],
    ericDiary: prov.e,
    aliceDiary: prov.a,
    memoryPhotos: [getPic(i+410, id+'_1'), getPic(i+420, id+'_2'), getPic(i+430, id+'_3')],
    isChinaProvince: true, subRegion: prov.sub
  };
});

/**
 * ------------------------------------------------------------------
 * 5. 产品定义 (全量恢复 25+15+10 = 50 款)
 * ------------------------------------------------------------------
 */

// 元系列 (25款)
const YUAN_GROUP_CONF: Record<string, any> = {
  'gold': { theme: '元 · 肃降', eric: '乳香是大地的眼泪。', alice: '高纯度单萜烯。', benefits: ['呼吸净化', '深层镇静'], usage: '扩香', precautions: '孕妇禁用' },
  'wood': { theme: '元 · 生发', eric: '老山檀香是时间的琥珀。', alice: '倍半萜醇占比高。', benefits: ['安眠', '锚定'], usage: '按摩', precautions: '敏感肌稀释' },
  'water': { theme: '元 · 润泽', eric: '杜松子是清冷的泉。', alice: '渗透压调节分子。', benefits: ['空间净化', '负能代谢'], usage: '喷雾', precautions: '肾病慎用' },
  'fire': { theme: '元 · 释放', eric: '玫瑰在烈日下盛放。', alice: '激活多巴胺。', benefits: ['释放', '唤醒'], usage: '香氛', precautions: '勿大面积涂抹' },
  'earth': { theme: '元 · 稳定', eric: '生姜是大地的温热。', alice: '姜辣素活性分子。', benefits: ['升温', '稳固'], usage: '足浴', precautions: '睡前慎用' }
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
      shortDesc: '极境高纯度单方萃取 / 100% PURE', 
      narrative: `“撷取 ${item.n} 在极端压力下的生存智慧。”`,
      ericDiary: conf.eric, aliceDiary: conf.alice, aliceLabDiary: conf.alice,
      benefits: conf.benefits, recommendation: '寻香专业级之选。', 
      usage: conf.usage, precautions: conf.precautions
    };
  });
});

// 香系列 (15款)
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
      shortDesc: '复合处方级配比', narrative: `将极境意志转化为日常感官修复。`,
      ericDiary: `这一系列是我对都市生活的温柔解构。`,
      aliceDiary: `利用微乳化专利技术实现分子级包裹。`,
      aliceLabDiary: `长效缓释。`,
      benefits: ['能量重塑', '屏障修复'], recommendation: '都市繁忙生活者的必备。', usage: '日常洁净涂抹。', precautions: '开封后半年内用完。'
    };
  });
});

// 境系列 (10款)
const JING_DEFS = [
  { id: 'jing_field_1', n: '冰裂纹陶瓷扩香皿', g: '境 · 场域', e: '器皿是香气的肉身。', a: '高孔隙率低温瓷。' },
  { id: 'jing_field_2', n: '矿石扩香项链', g: '境 · 场域', e: '随身的移动香场。', a: '天然火山矿石吸附。' },
  { id: 'jing_field_3', n: '胡桃木车载扩香', g: '境 · 场域', e: '安抚速度撕碎的时间。', a: '物理风动力扩散。' },
  { id: 'jing_field_4', n: '手工植物蜡烛', g: '境 · 场域', e: '火光中的分子生命。', a: '大豆蜡与精油共融。' },
  { id: 'jing_field_5', n: '吹制玻璃扩香器', g: '境 · 场域', e: '光影与分子的双重交响。', a: '空气动力学。' },
  { id: 'jing_meditation_1', n: '一柱 · 线香', g: '境 · 冥想', e: '古法合香，一柱定心。', a: '天然粘木粉。' },
  { id: 'jing_meditation_2', n: '觉知 · 滚珠器', g: '境 · 冥想', e: '感官锚定。', a: '精准流控。' },
  { id: 'jing_meditation_3', n: '清空 · 香氛石膏', g: '境 · 冥想', e: '空间呼吸。', a: '石膏缓释。' },
  { id: 'jing_meditation_4', n: '归真 · 景观扩香座', g: '境 · 冥想', e: '微观隐修。', a: '多孔材料。' },
  { id: 'jing_meditation_5', n: '承露 · 存香器', g: '境 · 冥想', e: '极简保存。', a: '避光密封。' }
];

JING_DEFS.forEach(p => {
  DATABASE[p.id] = {
    id: p.id, category: 'jing', subGroup: p.g, name: p.n, herb: p.n, herbEn: p.id.toUpperCase(),
    region: '艺术工坊', status: 'arrived', visited: true, accent: '#D4AF37',
    hero: PRODUCT_OVERRIDES[p.id] || ASSET_REGISTRY.visual_anchors.vessel,
    shortDesc: '美学载体 / Vessel', narrative: '决定香气在空间呈现姿态的物理外壳。',
    ericDiary: p.e, aliceDiary: p.a, aliceLabDiary: p.a,
    benefits: ['场域平衡', '美学锚点'], recommendation: '配合“元”系列使用。', usage: '滴入3-5滴。', precautions: '易碎。'
  };
});
