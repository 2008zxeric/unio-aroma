import { ScentItem, Destination, Category } from './types';

const RAW_BASE = 'https://raw.githubusercontent.com/2008zxeric/unio-aroma/main/assets/';
const CACHE_V = '?v=900.35'; 

export const ASSETS = {
  logo: `${RAW_BASE}brand/logo.svg${CACHE_V}`,
  xhs_link: 'https://xhslink.com/m/AcZDZuYhsVd',
  hero_zen: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=2560',
  hero_eric: 'https://images.unsplash.com/photo-1544198365-f5d60b6d8190?q=80&w=1920', 
  hero_alice: 'https://images.unsplash.com/photo-1576086213369-97a306d36557?q=80&w=1920',
  hero_spary: `${RAW_BASE}brand/spary.webp${CACHE_V}`, 
  banner: `${RAW_BASE}brand/banner.webp${CACHE_V}`,
  brand_image: `${RAW_BASE}brand/brand.webp${CACHE_V}`,
  packaging_sample: `${RAW_BASE}brand/see.webp${CACHE_V}`, // 用户提供的包装样例图
  placeholder: 'https://images.unsplash.com/photo-1540555700478-4be289fbecee?q=80&w=800'
};

export const REGION_VISUALS = {
  china: 'https://images.unsplash.com/photo-1508804185872-d7badad00f7d?q=80&w=1920',
  asia: 'https://images.unsplash.com/photo-1528127269322-539801943592?q=80&w=600',
  europe: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?q=80&w=600',
  africa: 'https://images.unsplash.com/photo-1516026672322-bc52d61a55d5?q=80&w=600',
  america: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=600'
};

const RAW_PROD = `${RAW_BASE}products/`;
const RAW_DEST = `${RAW_BASE}destinations/`;
const RAW_ALBUM = `${RAW_BASE}Ericalbum/`;

export const DATABASE: Record<string, ScentItem> = {};
export const DESTINATIONS: Record<string, Destination> = {};

const addP = (cat: 'yuan'|'he'|'jing', group: string, n: string, en: string, folder: string, id: string, customImg?: string) => {
  const filename = en.replace(/\s/g, '%20');
  DATABASE[id] = {
    id, category: cat, subGroup: group, name: n, herb: n, herbEn: en.toUpperCase().trim(),
    region: 'Extreme Origin', status: 'arrived_origin', visited: true, accent: '#D75437',
    hero: customImg || `${RAW_PROD}${folder}/${filename}.webp${CACHE_V}`,
    shortDesc: cat === 'yuan' ? '极境溯源 / 单方生存原力' : (cat === 'he' ? '一人一方 / 科学频率重构' : '境之感知 / 极简芳香美学'), 
    narrative: `“在 ${n} 分子的震颤中，我听见了生命在极限环境下的抗争。这不仅是香气，更是被浓缩的意志。”`,
    benefits: ['意识重构', '深度频率校准', '内在秩序恢复'], 
    usage: '【寻香仪式】取三滴精油于掌心，合十温热，闭目由鼻息深处缓慢引入意识核心，感受分子频率的精准对位。', 
    precautions: 'UNIO 馆藏坚持高纯度提取。敏感肤质请在实验室建议下稀释使用。',
    ericDiary: `见证了 ${n} 在极端重压下迸发的顽强。那是大自然在静默中书写的生存史诗。`, 
    aliceDiary: `低温气相萃取完整封存了 ${n} 的分子几何结构，每一滴都承载着极境的原始疗愈信号。`,
    aliceLabDiary: `GC/MS 质谱分析揭示了 ${n} 非凡的化学序位。这种独特的分子组合不仅能安抚感官，更能深入重构因都市喧嚣而破碎的情绪频率。`, 
    recommendation: '元香 UNIO 限量馆藏。仅为 1% 的觉知灵魂保留。'
  } as ScentItem;
};

const addD = (id:string, n:string, en:string, reg:string, c:number, img:string, pIds: string[] = [], s:'arrived'|'locked'='arrived', isCN:boolean=false, sub?:string, mPhots?: string[], eDiary?: string, aDiary?: string) => {
  DESTINATIONS[id] = {
    id, name:n, en, region:reg, status:s, visitCount:c, scenery:img, emoji:'📍',
    herbDescription: '极境原生分子档案', knowledge:'已存入元香 UNIO 核心频率库', productIds: pIds, isChinaProvince:isCN, subRegion:sub,
    ericDiary: eDiary || `第 ${c} 次踏上 ${n}。这里的空气中弥漫着一种坚韧的静谧。`, 
    aliceDiary: aDiary || `我们在实验室尝试将其分子结构完整保留，贯彻“一人一方”的调配哲学。`, 
    memoryPhotos: mPhots || [img, img, img]
  };
};

// --- [元系列：25款] ---
const yuanGroups = ['Metal', 'Wood', 'Water', 'Fire', 'Earth'];
const yuanFolders = ['metal', 'wood', 'water', 'fire', 'earth'];
const yuanNames = [
  ['神圣乳香', '极境薄荷', '极境尤加利', '极境茶树', '极境香茅'],
  ['老山檀香', '极境丝柏', '极境雪松', '极境松针', '神圣花梨木'],
  ['极境没药', '深根岩兰草', '暗夜广藿香', '极境杜松', '极境安息香'],
  ['大马士革玫瑰', '极境依兰', '大花茉莉', '日光橙花', '极境天竺葵'],
  ['佛手柑', '横断生姜', '极境红橘', '极境葡萄柚', '极境橡木苔']
];
const yuanEns = [
  ['Sacred Frankincense', 'Peppermint from Peaks', ' Eucalyptus Glaciale', 'Tea Tree Antiseptic', 'Citronella Clarissima'],
  ['Aged Sandalwood', 'Misty Cypress', 'Himalayan Cedar', 'Boreal Pine', 'Sacred Rosewood Isle'],
  ['Myrrh Secreta', 'Deep Root Vetiver', 'Patchouli Nocturne', 'Juniper by the Loch', 'Benzoin Ambrosia'],
  ['Damask Rose Aureate', 'Ylang Equatorial', 'Jasminum Grandiflorum', 'Neroli Soleil', 'Geranium Rose\u0301'],
  ['Bergamot Alba', 'Zingiber Terrae', 'Mandarin Jucunda', 'Grapefruit Pomona', 'Oakmoss Taiga']
];
yuanNames.forEach((group, i) => group.forEach((name, j) => {
  addP('yuan', `元 · ${yuanGroups[i]}`, name, yuanEns[i][j], yuanFolders[i], `yuan_${yuanFolders[i]}_${j}`);
}));

// --- [和系列：15款] ---
const heGroups = ['Body', 'Mind', 'Soul'];
const heNames = [
  ['云感霜', '晨曦液', '月华油', '清冽发', '润迹膏'], 
  ['止语雾', '归处膏', '听泉露', '微光氛', '深吸瓶'], 
  ['无界油', '悬浮露', '破晓珠', '空寂水', '共振方']
];
const heEns = [
  ['cloud velvet', 'Dawn Glow', 'Moonlight Oil', 'Frost Mint', 'Trace Balm'], 
  ['Silent Mist', 'Sanctuary', 'Zen Fountain', 'Glimmer', 'Deep Breath'], 
  ['Boundless', 'Floating', 'Daybreak', 'Void Moss', 'Resonant']
];
heNames.forEach((group, i) => group.forEach((name, j) => {
  const groupLabel = heGroups[i];
  // 在适当位置加入包装样例展示
  let customImg = (groupLabel === 'Soul' && j === 4) ? ASSETS.packaging_sample : ((groupLabel === 'Mind' || groupLabel === 'Soul') ? ASSETS.brand_image : undefined);
  addP('he', `香 · ${groupLabel}`, name, heEns[i][j], groupLabel.toLowerCase(), `he_${groupLabel.toLowerCase()}_${j}`, customImg);
}));

// --- [境系列：10款] ---
const jingNames = [['陶瓷皿', '芳香链', '木核扩', '蜡烛', '存香瓶'], ['一柱香', '觉知珠', '清空石', '归真座', '承露璃']];
const jingEns = [['Crackled', 'Necklace ', 'Walnut', 'candle', 'Vessel'], ['Incense Sticks', 'Rollerball', 'Gypsum', 'mountain', 'glass']];
jingNames[0].forEach((n, j) => addP('jing', '境 · 芳香美学', n, jingEns[0][j], 'place', `jing_place_${j}`));
jingNames[1].forEach((n, j) => addP('jing', '境 · 凝思之物', n, jingEns[1][j], 'Meditation', `jing_meditation_${j}`)); // 已重命名

const ALL_IDS = Object.keys(DATABASE);
const getProducts = (seed: string) => ALL_IDS.sort(() => seed.length % 10 - 5).slice(0, 6);

// --- [亚洲：18个目的地 - 纯化叙事] ---
addD('w_thai','泰国','THAILAND','亚洲',40,'https://images.unsplash.com/photo-1528127269322-539801943592?q=80&w=1200', getProducts('th'), 'arrived', false, undefined, [`${RAW_ALBUM}Thailand/th1.webp${CACHE_V}`,`${RAW_ALBUM}Thailand/th2.webp${CACHE_V}`,`${RAW_ALBUM}Thailand/th3.webp${CACHE_V}`],
"清迈晨间的湿热空气里，我捕捉到了一种近乎禅意的草木波动。那是森林最谦卑的致意。",
"泰国高活性分子在 Alice 实验室通过分层提纯，保留了最具穿透力的清凉定力。");

addD('w_in','印度','INDIA','亚洲',3,'https://images.unsplash.com/photo-1506461883276-594a12b11cf3?q=80&w=1200', getProducts('in'), 'arrived', false, undefined, undefined,
"迈索尔的檀香是刻在骨子里的古老记忆，每一次呼吸都是与千年前的权威对话。",
"实验室测定其檀香醇含量达到巅峰，是复方中稳定神经中轴的核心‘频率之锚’。");

addD('w_hk','中国香港','HONG KONG','亚洲',18,`${RAW_DEST}Hongkong.webp${CACHE_V}`, getProducts('hk'), 'arrived', false, undefined, undefined,
"霓虹下的海风带着咸涩，在极度压缩的空间里，沉香的残留是最后的文明尊严。",
"针对高压都市样本，我们利用香港沉香的特殊频宽调配出能够快速建立心理防线的动态配方。");

addD('w_my','马来西亚','MALAYSIA','亚洲',13,`${RAW_DEST}Malaysia.webp${CACHE_V}`, getProducts('my'), 'arrived', false, undefined, undefined,
"雨林结香是树木自我疗愈的奇迹。在这里，我读懂了生命在毁灭边缘迸发的重生原力。",
"马来西亚沉香中富含稀有的倍半萜类分子，被用于强化‘元’系列在感官修护上的穿透深度。");

addD('w_id','印度尼西亚','INDONESIA','亚洲',12,'https://images.unsplash.com/photo-1537996194471-e657df975ab4?q=80&w=1200', getProducts('id'), 'arrived', false, undefined, undefined,
"爪哇火山灰养育了极其浓郁的香料。那是一种从地底爆发的热度，带着岩浆余温般的侵略感。",
"印尼岩兰草的深根系锁住了大地的重力。实验室将其作为纠正情绪漂浮感的重型调节剂。");

addD('w_uae','阿联酋','UAE','亚洲',12,'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?q=80&w=1200', getProducts('uae'), 'arrived', false, undefined, undefined,
"烈日与冷气交替的沙漠里，乳香构筑了私密且神圣的呼吸领地。它是沙漠之魂的秩序感。",
"极干旱环境下树脂分子的极高稳定性，为‘境’系列提供了极其持久且纯净的持香基石。");

addD('w_vn','越南','VIETNAM','亚洲',6,'https://images.unsplash.com/photo-1528127269322-539801943592?q=80&w=600', getProducts('vn'), 'arrived', false, undefined, undefined,
"惠安水沉的甜凉感是森林在雨季的叹息。轻盈而具有极强的指向性。",
"我们在实验室成功复刻了这种‘凉感穿透力’，旨在快速校准由于焦虑导致的呼吸频率失衡。");

addD('w_kz','哈萨克斯坦','KAZAKHSTAN','亚洲',4,'https://images.unsplash.com/photo-1563245372-f21724e3856d?q=80&w=1200', getProducts('kz'), 'arrived', false, undefined, undefined,
"中亚旷野上野生香草的野蛮生长，是对风最好的回应。一种自由且荒凉的生存意志。",
"哈萨克斯坦香草中的天然抗逆分子多肽，在实验室被提取用于增强感官的心理免疫力。");

addD('w_jp','日本','JAPAN','亚洲',2,'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?q=80&w=1200', getProducts('jp'), 'arrived', false, undefined, undefined,
"北海道冷杉林里雪落的寂静，让时间仿佛处于凝固状态。那是极简美学的嗅觉原点。",
"扁柏分子的精准镇静作用是 Alice 实验室对抗失眠杂音的高阶方案。");

addD('w_ir','伊朗','IRAN','亚洲',2,`${RAW_DEST}Iran.webp${CACHE_V}`, getProducts('ir'), 'arrived', false, undefined, undefined,
"设拉子玫瑰在荒漠边缘的傲放，是坚韧灵魂的最后温柔，带着波斯尘埃的厚重历史感。",
"伊朗玫瑰中特有的香醇比例展现了极佳的心理‘圆满感’，用于重塑破碎的内在幸福频率。");

addD('w_jo','约旦','JORDAN','亚洲',2,'https://images.unsplash.com/photo-1547234935-80c7145ec969?q=80&w=1200', getProducts('jo'), 'arrived', false, undefined, undefined,
"死海边干热季风里本草对水分的极致渴望，赋予了香气惊人的凝聚力。那是绝境中的生命力。",
"约旦产地的树脂提取物展现出卓越的‘分子锁水’能力，在感官上呈现出极高湿润度的滋养感。");

addD('w_mac','中国澳门','MACAU','亚洲',2,`${RAW_DEST}Macao.webp${CACHE_V}`, getProducts('mac'), 'arrived', false, undefined, undefined,
"石板路间交会的南洋与欧陆香气，是旧时代在繁华背后的隐秘呼吸。",
"澳门目的地启发了我们将欧陆冷香与暖木进行对位分析，寻找跨文化碰撞后的奇异平衡。");

addD('w_sg','新加坡','SINGAPORE','亚洲',2,`${RAW_DEST}Singapore.webp${CACHE_V}`, getProducts('sg'), 'arrived', false, undefined, undefined,
"花园城市的秩序感。即使是被管理的绿意，也散发着一种精确到毫厘的尊严。",
"新加坡的植物分子被用作实验室‘秩序重构’的基准。我们研究如何利用精确感消除混乱。");

addD('w_kr','韩国','SOUTH KOREA','亚洲',1,'https://images.unsplash.com/photo-1517154421773-0529f29ea451?q=80&w=1200', getProducts('kr'), 'arrived', false, undefined, undefined,
"首尔老韩屋檐下的松针香，是对自我的极致审视，带着浓烈的留白感。",
"韩国红松的多萜成分在 GC/MS 下展现出对专注力的极强诱导性，是‘和’系列的核心组分。");

addD('w_kh','柬埔寨','CAMBODIA','亚洲',1,`${RAW_DEST}Cambodia.webp${CACHE_V}`, getProducts('kh'), 'arrived', false, undefined, undefined,
"吴哥窟巨大树根对古迹的缠绕，是时间对文明的接管。腐殖质与古木的混合极具厚度。",
"柬埔寨森林中的原始菌群信息被实验室转译为感官重启频率，用于对抗长期亚健康的钝感。");

addD('w_kp','朝鲜','NORTH KOREA','亚洲',1,`${RAW_DEST}North%20Korea.webp${CACHE_V}`, getProducts('kp'), 'arrived', false, undefined, undefined,
"长白山北麓凛冽空气里，冷香是植物不带修饰的生存力，极度纯粹。",
"极北产地的样本具有无可比拟的化学纯度，是实验室进行意志强化配方的关键添加。");

addD('w_lk','斯里兰卡','SRI LANKA','亚洲',2,'https://images.unsplash.com/photo-1546708973-b339540b5162?q=80&w=1200', getProducts('lk'), 'arrived', false, undefined, undefined,
"锡兰雨后茶园的辛香，混合着印度洋的咸意，是一座漂浮的芳香孤岛。",
"肉桂与生姜分子的热力协同是实验室经典案例，旨在调理都市环境中感官的寒湿困顿。");

addD('w_np','尼泊尔','NEPAL','亚洲',2,'https://images.unsplash.com/photo-1544735716-392fe2489ffa?q=80&w=1200', getProducts('np'), 'arrived', false, undefined, undefined,
"喜马拉雅晨祷中的杜松烟火气，是凡尘与神圣的交汇。空气稀薄却满载信仰。",
"高海拔杜松精油中极高比例的单萜烯为大脑提供‘氧气感’振奋，解决长期脑力过载问题。");

// --- [欧洲：18个目的地] ---
addD('w_tr','土耳其','TURKEY','欧洲',8,'https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?q=80&w=1200', getProducts('tr'), 'arrived', false, undefined, undefined,
"卡帕多奇亚玫瑰在干渴岩缝里的傲放，是带有火属性的意志美学。",
"针对土耳其玫瑰的‘频率位移’修复能力，实验室构建了针对极度敏感灵魂的韧性防线。");

addD('w_fr','法国','FRANCE','欧洲',5,'https://images.unsplash.com/photo-1499002238440-d264edd596ec?q=80&w=1200', getProducts('fr'), 'arrived', false, undefined, undefined,
"格拉斯的晨露不仅仅是水，它是被蒸馏过的优雅史诗。浪漫在这里是有秩序的。",
"法国薰衣草的酯类平衡是 Alice 实验室的‘静奢’金标，用于稳定所有复方的灵魂骨架。");

addD('w_pl','波兰','POLAND','欧洲',5,`${RAW_DEST}Poland.webp${CACHE_V}`, getProducts('pl'), 'arrived', false, undefined, undefined,
"波罗的海琥珀与针叶林交织，带来一种极具安全感的木质底蕴。一种清新却忧郁的保护色。",
"波兰样本展示了极强的抗寒保护分子，实验室利用这种‘包裹感’缓解佩戴者的社交焦虑。");

addD('w_de','德国','GERMANY','欧洲',4,'https://images.unsplash.com/photo-1467269204594-9661b134dd2b?q=80&w=1200', getProducts('de'), 'arrived', false, undefined, undefined,
"黑森林深处的理性秩序。每一株松树的呼吸频率仿佛都经过严密的逻辑推演。",
"德国产地严谨的分子结构被用于‘逻辑清理’配方，旨在消除长期的认知疲劳。");

addD('w_it','意大利','ITALY','欧洲',2,'https://images.unsplash.com/photo-1523906834658-6e24ef2386f9?q=80&w=1200', getProducts('it'), 'arrived', false, undefined, undefined,
"西西里岛的阳光被封存在柑橘表皮，是地中海跳动的脉搏，毫无保留的热情。",
"佛手柑中极高比例的乙酸芳樟酯是实验室的‘多巴胺引擎’，能瞬间瓦解情绪低潮。");

addD('w_at','奥地利','AUSTRIA','欧洲',2,'https://images.unsplash.com/photo-1516550893923-42d28e5677af?q=80&w=1200', getProducts('at'), 'arrived', false, undefined, undefined,
"冰川融水滋养的山地草本，有着接近银色的清冽光泽，极简而圣洁。",
"我们在奥地利高山针叶中分离出稀有碳氢化合物，旨在重建佩戴者内心的‘仰止’高度。");

addD('w_dk','丹麦','DENMARK','欧洲',2,'https://images.unsplash.com/photo-1513622470522-26c3c8a854bc?q=80&w=1200', getProducts('dk'), 'arrived', false, undefined, undefined,
"北欧 Hygge 生活下的香气是壁炉的余温，不侵略，却有着最长情的陪伴感。",
"丹麦目的地的研究核心是‘低分贝香气’，让分子在空间中几乎隐形却持续发挥安抚效力。");

addD('w_hu','匈牙利','HUNGARY','欧洲',2,'https://images.unsplash.com/photo-1503917988258-f87a78e3c995?q=80&w=1200', getProducts('hu'), 'arrived', false, undefined, undefined,
"布达佩斯古老温泉边的草本混合，是大地深处的愈合之手在触摸感官。",
"匈牙利产地样本富含矿物质共振，实验室将其转化为能够恢复情绪韧性的关键因子。");

addD('w_es','西班牙','SPAIN','欧洲',1,`${RAW_DEST}Spain.webp${CACHE_V}`, getProducts('es'), 'arrived', false, undefined, undefined,
"岩蔷薇在干渴荒野中的凝结，是斗牛士般的决绝与深沉，香气浓郁且固执。",
"西班牙岩蔷薇具有非凡的定香力，实验室将其用于保存那些最易消散的灵感瞬间。");

addD('w_nl','荷兰','NETHERLANDS','欧洲',1,'https://images.unsplash.com/photo-1512470876302-972faa2aa9a4?q=80&w=1200', getProducts('nl'), 'arrived', false, undefined, undefined,
"在运河与风车间捕捉到了湿润植物的生命秩序。这是一种被精密计算过的自然美。",
"实验室研究荷兰样本中水分子的感官传导，致力于通过香气营造通透的呼吸感。");

addD('w_mc','摩纳哥','MONACO','欧洲',1,`${RAW_DEST}Monaco.webp${CACHE_V}`, getProducts('mc'), 'arrived', false, undefined, undefined,
"蔚蓝海岸的顶级静谧。一种被高度文明过滤后的纯净，优雅得近乎冷漠。",
"摩纳哥产地样本代表了极致的‘感官优越感’。Alice 将其引入高端定制系列作为调性基准。");

addD('w_lu','卢森堡','LUXEMBOURG','欧洲',1,`${RAW_DEST}Luxembourg.webp${CACHE_V}`, getProducts('lu'), 'arrived', false, undefined, undefined,
"古堡森林里的苔藓香，是历史沉淀出的绿色威严。一种极具包容力的宁静。",
"实验室对卢森堡森林苔藓进行了分子模拟，其独有的泥土芬芳能诱导大脑进入深层休眠。");

addD('w_pt','葡萄牙','PORTUGAL','欧洲',1,`${RAW_DEST}Portugal.webp${CACHE_V}`, getProducts('pt'), 'arrived', false, undefined, undefined,
"大西洋彼岸的咸味混合着古老木材。那是地理大发现时代的英雄余韵。",
"葡萄牙海岸草本中特有的盐分振动，被实验室用于激发长期压抑状态下的勇气本能。");

addD('w_is','冰岛','ICELAND','欧洲',1,`${RAW_DEST}Ice%20island.webp${CACHE_V}`, getProducts('is'), 'arrived', false, undefined, undefined,
"冰火交融的大地上，本草拥有一种近似于矿物的冷酷。极度纯净，不带任何修饰。",
"冰岛地衣在 Alice 实验室中被解析为‘感官清道夫’，能瞬间剥离长期都市生活的感官粘滞。");

addD('w_bg','保加利亚','BULGARIA','欧洲',1,`${RAW_DEST}Bulgaria.webp${CACHE_V}`, getProducts('bg'), 'arrived', false, undefined, undefined,
"玫瑰谷的晨曦里，万亩玫瑰同时呼吸，这种震颤是对生命最高级的礼赞。",
"保加利亚奥图玫瑰精油是感官修复的顶级材料，其复杂的分子链提供了无可比拟的心理安慰。");

addD('w_uk','英国','UK','欧洲',0,'https://images.unsplash.com/photo-1486299267070-83823f5448dd?q=80&w=1200', [], 'locked', false, undefined, undefined,
"期待在大英博物馆的旧纸张与乡村薄雾间，寻找到那种恪守秩序的贵族香气。",
"实验室已为英国薄荷建立档案。其冷冽的绅士调性将成为未来‘止语’系列的补充。");

addD('w_hr','克罗地亚','CROATIA','欧洲',0,'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?q=80&w=1200', [], 'locked', false, undefined, undefined,
"在亚得里亚海的阳光下，我梦想着寻找到那抹在石墙缝中顽强生长的永生花。",
"克罗地亚蜡菊的修护频率极具研究价值，我们计划将其引入未来的抗衰老感官模块。");

addD('w_gr','希腊','GREECE','欧洲',0,'https://images.unsplash.com/photo-1503152394-c571994fd383?q=80&w=1200', [], 'locked', false, undefined, undefined,
"爱琴海岛上的古老本草，见证了众神的呼吸. 那是一种带着大理石质感的肃穆感。",
"实验室正试图复刻希腊野草中那种‘阳光直射’带来的正向频率，以对抗冬季抑郁。");

// --- [非洲：7个目的地] ---
addD('w_sa','南非','SOUTH AFRICA','非洲',12,`${RAW_DEST}South%20africa.webp${CACHE_V}`, getProducts('sa'), 'arrived', false, undefined, undefined,
"红土地上的烈日锻造了植物最坚韧的防御分子。一种不驯服的苍劲力量。",
"南非本草具有天然的‘野性防御’信号，实验室将其转化为强化心理屏障的介质。");

addD('w_zw','津巴布韦','ZIMBABWE','非洲',1,`${RAW_DEST}Zimbabwe.webp${CACHE_V}`, getProducts('zw'), 'arrived', false, undefined, undefined,
"维多利亚瀑布水雾里的植物经受着亿万次洗礼。在巨响中找到了极致的平衡。",
"利用超临界萃取技术，Alice 封存了津巴布韦木材的时间频率，作为连接过去与当下的锚点。");

addD('w_eg','埃及','EGYPT','非洲',2,`${RAW_DEST}Egypt.webp${CACHE_V}`, getProducts('eg'), 'arrived', false, undefined, undefined,
"尼罗河边的圣洁蓝莲花。那是数千年法老神权的感官残留，宁静得如同死亡。",
"实验室对埃及蓝莲花的镇静效应极度痴迷。其独特的感官麻痹感被精细化用于深度放松。");

addD('w_ke','肯尼亚','KENYA','非洲',2,`${RAW_DEST}Kenya.webp${CACHE_V}`, getProducts('ke'), 'arrived', false, undefined, undefined,
"东非大裂谷的红土地上，草本拥有着原始的动态美感，像是一场无止境的迁徙。",
"肯尼亚产地样本的高动态频率被用于激发用户疲软的生命直觉，重燃对感官的掌控力。");

addD('w_mg','马达加斯加','MADAGASCAR','非洲',0,`${RAW_DEST}Madagascar.webp${CACHE_V}`, [], 'locked', false, undefined, undefined,
"孤岛上的物种奇迹。我渴望在这片从未被驯化的森林里寻找到超越常识的香气。",
"实验室正着手研究马达加斯加香草醛的特殊构型，其‘无条件的温暖感’是未来的研究重点。");

addD('w_mu','毛里求斯','MAURITIUS','非洲',1,`${RAW_DEST}Mauritius.webp${CACHE_V}`, getProducts('mu'), 'arrived', false, undefined, undefined,
"火山岛上的热带花园，这里的香气带着海水的硫磺味，一种极其原始的再生感。",
"毛里求斯目的地的研究成果已应用于‘元’系列。它展现出的极高分子重组活性令人振奋。");

addD('w_ma','摩洛哥','MOROCCO','非洲',0,'https://images.unsplash.com/photo-1489493585363-d69421e0edd3?q=80&w=1200', [], 'locked', false, undefined, undefined,
"在马拉喀什的香料市场与沙漠交界处，寻找那抹能让人产生幻觉的感官异域力。",
"实验室已预定摩洛哥雪松样本。其极其深邃的木质频段有望重构现代人的睡眠基石。");

// --- [美洲/大洋洲：10个目的地] ---
addD('w_us','美国','USA','美洲/大洋洲',7,'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=1200', getProducts('us'), 'arrived', false, undefined, undefined,
"加州红杉林的巍峨，是大地对天空的长久守望。每一寸木质都刻满了耐力。",
"美国产地样本在 Alice 实验室中被用于强化感官的长久续航力，对抗无止境的日常消耗。");

addD('w_mx','墨西哥','MEXICO','美洲/大洋洲',4,`${RAW_DEST}Mexico.webp${CACHE_V}`, getProducts('mx'), 'arrived', false, undefined, undefined,
"阿兹特克的古老热度，在龙舌兰与仙人掌间脉动。一种近乎致幻的生命能量。",
"实验室通过墨西哥植物样本提取出的‘热烈因子’，致力于重建后疫情时代低迷的情绪张力。");

addD('w_br','巴西','BRAZIL','美洲/大洋洲',8,`${RAW_DEST}Brazil.webp${CACHE_V}`, getProducts('br'), 'arrived', false, undefined, undefined,
"亚马孙雨林的狂野心跳。万物竞争的香气极具侵略性，这是生命最原始的状态。",
"针对巴西样本的高活性分子簇，实验室开发了专门的感官唤醒程序，激活沉睡的身体本能。");

addD('w_ar','阿根廷','ARGENTINA','美洲/大洋洲',1,`${RAW_DEST}Argentina.webp${CACHE_V}`, getProducts('ar'), 'arrived', false, undefined, undefined,
"潘帕斯草原的孤独风声，混合着马黛茶的苦涩，是一种极致的独立美学。",
"实验室在阿根廷马黛草样本中分离出一种清醒分子，专门用于重塑决策时的理性频段。");

addD('w_ht','海地','HAITI','美洲/大洋洲',0,`${RAW_DEST}Haiti.webp${CACHE_V}`, [], 'locked', false, undefined, undefined,
"加勒比海的贫瘠却孕育了全球最优秀的岩兰草，苦难中开出的嗅觉之花。",
"海地岩兰草的复杂分子序列是实验室梦寐就求的定香基石，代表了灵魂最坚韧的底层支撑。");

addD('w_ca','加拿大','CANADA','美洲/大洋洲',0,'https://images.unsplash.com/photo-1503614472-8c93d56e92ce?q=80&w=1200', [], 'locked', false, undefined, undefined,
"落基山脉的冷空气与枫木。那种从骨子里透出的清甜与宏大。",
"实验室正规划引入加拿大黑云杉。其高频振动能有效剥离由都市污染带来的感官‘粘膜’。");

addD('w_pe','秘鲁','PERU','美洲/大洋洲',0,'https://images.unsplash.com/photo-1526392060635-9d6019884377?q=80&w=1200', [], 'locked', false, undefined, undefined,
"安第斯山脉的神圣木香，伴随着印加文明的余温，是一种跨越生死的感官旅程。",
"实验室正在破解秘鲁圣木分子的特殊共振模式，用于开发最高阶的‘净愈’处方。");

addD('w_au','澳大利亚','AUSTRALIA','美洲/大洋洲',0,'https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?q=80&w=1200', [], 'locked', false, undefined, undefined,
"红色内陆的极旱本草，散发着带有铁锈味的芬芳，极简却极具震撼力。",
"澳大利亚尤加利多变异种的抗菌活性是未来的科研重点，助力建立家庭感官防护林。");

addD('w_an','南极洲','ANTARCTICA','美洲/大洋洲',0,'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=1200', [], 'locked', false, undefined, undefined,
"在绝对零度的边缘，我渴望捕捉到时间静止的嗅觉证据。那里不仅是终点，也是原点。",
"实验室通过南极极端样本进行压力测试，致力于研发能跨越极端温差的分子稳定技术。");

addD('w_cu','古巴','CUBA','美洲/大洋洲',0,'https://images.unsplash.com/photo-1506461883276-594a12b11cf3?q=80&w=1200', [], 'locked', false, undefined, undefined,
"哈瓦那街头的陈年烟草与阳光，一种被时光浸润后的从容与颓废美学。",
"实验室在古巴样本中研究复杂生物碱对情绪的瞬间舒缓作用，打造沉溺式的解压意境。");

// --- [中国寻香坐标：34个省份/区域 - 全文本差异化优化] ---
const CHINA_DIARIES: Record<string, [string, string]> = {
  '四川': ["青城山的晨雾与岷江的水汽，交织成一种湿润的青绿感，那是神州大地最灵动的呼吸。", "实验室分析发现，四川高海拔地区的本草中富含抗压性的挥发性分子，能有效拓宽感官的耐受边界。"],
  '云南': ["横断山脉的垂直气候，让同一株本草拥有了四季的生命厚度。在这里，香气是有阶梯感的。", "Alice 致力于捕捉云南多样性生态中的‘共生频率’，用于重塑因单一都市生活而失衡的情绪生态。"],
  '西藏': ["在纳木错的湖边，稀薄氧气里的香气有着接近虚无的纯净。这种极简是对灵魂最底层的净化。", "针对高寒低氧环境下的植物样本，实验室提取了独特的极性分子，旨在瞬间清空大脑多余的冗余杂音。"],
  '贵州': ["喀斯特地貌深处的阴凉，养育了带有泥土深处凉意的菌群与草木香。深沉且稳固。", "实验室复刻了贵州深山的湿度共振，打造出能让意识迅速下沉、回归稳态的深层修护方案。"],
  '新疆': ["天山雪水与塔里木烈日的极差，淬炼出香料中惊人的糖分与热烈意志。", "我们通过分析新疆特产草本的抗逆性分子链，构建了一套针对极端情绪波动的高速平抑系统。"],
  '甘肃': ["丝绸之路上被风沙打磨过的本草，有着一种近似于矿物的苍劲美，不带半点娇羞。", "Alice 利用甘肃产地的坚韧分子结构，开发出能够增强佩戴者核心意志力的‘定力’模块。"],
  '内蒙古': ["在大草原广袤的辽阔里，野草的香气是肆意且不设防的。那是自由最直白的注脚。", "实验室研究发现，草原样本具有极佳的舒张特性，能显著缓解现代人长期的生理性呼吸短促。"],
  '北京': ["紫禁城红墙下的古柏香，是岁月沉淀出的厚重秩序感，带着皇城根特有的威严。", "实验室尝试提取古树中的长效倍半萜频率，为快节奏的精英生活提供一种持久的定力背景。"],
  '上海': ["弄堂里的万家灯火与黄浦江的海风，勾勒出一种摩登而世俗的烟火气，精致且包容。", "针对海派文化的多样性，我们调配出一种能兼顾逻辑思维与艺术感知的高频平衡配方。"],
  '广东': ["岭南的湿热造就了本草极强的药食同源属性。这种香气是鲜活的、有温度的生存力。", "Alice 实验室利用广东中医药本草的高活性，打造出能快速建立身心循环屏障的感官方案。"]
};

const PROVINCE_GROUPS: Record<string, string[]> = {
  '西南': ['四川', '云南', '西藏', '贵州', '重庆'],
  '西北': ['新疆', '甘肃', '陕西', '宁夏', '青海'],
  '华南': ['广东', '福建', '海南', '广西'],
  '华东': ['浙江', '江苏', '上海', '安徽', '江西', '山东', '台湾'],
  '华北': ['北京', '天津', '河北', '山西', '内蒙古'],
  '华中': ['河南', '湖北', '湖南'],
  '东北': ['辽宁', '吉林', '黑龙江']
};
Object.entries(PROVINCE_GROUPS).forEach(([sub, list]) => {
  list.forEach((prov) => {
    const visits = Math.floor(Math.random() * 5) + 3; 
    const diaries = CHINA_DIARIES[prov] || [
      `穿梭于${prov}，我寻找的是那份属于${sub}大地的独特频率。这里的香气是与时间对话的证据。`,
      `针对${prov}的地理微气候，实验室在 GC/MS 下重构了专属的${prov}分子图谱，旨在解决当代感官的同质化危机。`
    ];
    addD(`cn_${prov}`, prov, prov.toUpperCase(), '亚洲', visits, REGION_VISUALS.china, getProducts(prov), 'arrived', true, sub, undefined, diaries[0], diaries[1]);
  });
});

export const ASSET_REGISTRY = { brand: { logo: ASSETS.logo, xhs_link: ASSETS.xhs_link } };
export const PRODUCT_OVERRIDES: Record<string, string> = {};
