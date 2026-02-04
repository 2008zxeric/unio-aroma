import { ScentItem, Destination, Category } from './types';

const RAW_BASE = 'https://raw.githubusercontent.com/2008zxeric/unio-aroma/main/assets/';
const PROVINCE_BASE = `${RAW_BASE}province/`;
const ERIC_PHOTO_BASE = `${RAW_BASE}ericphoto/`;
const CACHE_V = '?v=1008.65'; 

export const ASSETS = {
  logo: `${RAW_BASE}brand/logo.svg${CACHE_V}`,
  xhs_link: 'https://xhslink.com/m/AcZDZuYhsVd',
  hero_zen: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=2560',
  hero_eric: 'https://images.unsplash.com/photo-1544198365-f5d60b6d8190?q=80&w=1920', 
  hero_alice: 'https://images.unsplash.com/photo-1576086213369-97a306d36557?q=80&w=1920',
  hero_spary: `${RAW_BASE}brand/spary.webp${CACHE_V}`, 
  banner: `${RAW_BASE}brand/banner.webp${CACHE_V}`,
  brand_image: `${RAW_BASE}brand/brand.webp${CACHE_V}`,
  map: `${RAW_BASE}brand/map.webp${CACHE_V}`,
  packaging_sample: `${RAW_BASE}brand/see.webp${CACHE_V}`,
  placeholder: 'https://images.unsplash.com/photo-1540555700478-4be289fbecee?q=80&w=800'
};

export const ASSET_REGISTRY = { brand: ASSETS };
export const PRODUCT_OVERRIDES: Record<string, string> = {};

const ERIC_JOURNAL: Record<string, string> = {
  '神圣乳香': '树脂结晶的那一刻，大地停止了呼吸。我们在多法尔山脉捕捉到的，是本草在极端干旱中凝结的生存意志。',
  '老山檀香': '三十载春秋化作一段心材，α-檀香醇的深度超出了实验室的预期，那是时间沉降后的尊严。',
  '大马士革玫瑰': '三千公斤花瓣萃取的一公斤，是清晨五点谷地里尚未蒸发的灵魂，系情绪疗愈的黄金标准。',
  '极境薄荷': '在阿尔卑斯的冷冽风中，我撕碎一片薄荷叶，那股直冲眉心的凉意，彻底洗礼了灵魂。',
};

const ALICE_LAB_DIARY: Record<string, string> = {
  '神圣乳香': '树脂结晶率＞12%，冷压蒸馏保留α-蒎烯活性，冥想时使用可降低皮质醇17%。',
  '极境薄荷': '左旋薄荷酮纯度91%，提神醒脑峰值在吸入后3分钟，建议避免晚间使用。',
  '老山檀香': '心材醇沉≥30年，α-檀香醇含量突破55%，情绪安抚效果可持续2小时以上。',
  '大马士革玫瑰': '3,000kg花瓣仅萃取1kg精油，芳樟醇+香茅醇协同，系情绪疗愈的黄金标准。',
};

export const REGION_VISUALS = {
  china: 'https://images.unsplash.com/photo-1508804185872-d7badad00f7d?q=80&w=2560', 
  asia: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?q=80&w=1200',
  europe: 'https://images.unsplash.com/photo-1467269204594-9661b134dd2b?q=80&w=1200',
  africa: 'https://images.unsplash.com/photo-1489493585363-d69421e0edd3?q=80&w=1200',
  america: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=1200'
};

export const DATABASE: Record<string, ScentItem> = {};
export const DESTINATIONS: Record<string, Destination> = {};

const RAW_PROD = `${RAW_BASE}products/`;
const RAW_DEST = `${RAW_BASE}destinations/`;

const addP = (cat: Category, group: string, n: string, en: string, folder: string, id: string, price: string, spec: string, customImg?: string) => {
  let heroUrl = "";
  if (customImg && (customImg.startsWith('http') || customImg.startsWith('data:'))) {
    heroUrl = customImg;
  } else {
    const fileName = customImg || `${en.trim()}.webp`;
    const encodedFileName = fileName.replace(/\s/g, '%20');
    heroUrl = `${RAW_PROD}${folder}/${encodedFileName}${CACHE_V}`;
  }
  
  DATABASE[id] = {
    id, category: cat, subGroup: group, name: n, herb: n, herbEn: en.toUpperCase().trim(),
    region: 'Extreme Origin', status: 'arrived_origin', visited: true, accent: '#D75437',
    price, specification: spec, hero: heroUrl,
    shortDesc: cat === 'yuan' ? '元 · 单方 / 极境生存原力' : (cat === 'he' ? '香 · 复方 / 科学频率重构' : '境 · 空间 / 极简芳香美学'), 
    narrative: ERIC_JOURNAL[n] || `“在 ${n} 的分子震颤中，找回生命在极限环境下的抗争记忆。”`,
    benefits: ['意识重构', '深度频率校准', '内在秩序恢复'],
    usage: '取三滴精油于掌心，温热后由鼻息深处缓慢引入。',
    precautions: 'UNIO 馆藏坚持高纯度。建议在专业指导下使用。',
    ericDiary: ERIC_JOURNAL[n] || `在 ${n} 的微光里，我找到了生命的顽强。`, 
    aliceDiary: `我们在实验室尝试将其分子结构完整保留，贯彻“一人一方”的调配哲学。`,
    aliceLabDiary: ALICE_LAB_DIARY[n] || `我们在实验室对 ${n} 进行冷压提纯，封存其原生信号。`, 
    recommendation: '元香 UNIO 限量馆藏。仅为 1% 的觉知灵魂保留。'
  } as ScentItem;
};

const addD = (id:string, n:string, en:string, reg:string, c:number, img:string, pIds: string[] = [], s:'arrived'|'locked'='arrived', isCN:boolean=false, sub?:string) => {
  const diary = ERIC_JOURNAL[id] || ERIC_JOURNAL[`cn_${n}`] || ERIC_JOURNAL[n] || `第 ${c} 次踏上 ${n}。这里的空气中弥漫着一种坚韧的静谧。`;
  const prefix = en.toLowerCase().replace(/[^a-z]/g, '').slice(0, 3);
  const memoryPhotos = [
    `${ERIC_PHOTO_BASE}${prefix}1.webp${CACHE_V}`,
    `${ERIC_PHOTO_BASE}${prefix}2.webp${CACHE_V}`,
    `${ERIC_PHOTO_BASE}${prefix}3.webp${CACHE_V}`
  ];
  DESTINATIONS[id] = {
    id, name:n, en, region:reg, status:s, visitCount:c, scenery:img, emoji:'📍',
    herbDescription: '极境原生分子档案', knowledge:'已存入 UNIO 核心库频率库', productIds: pIds, isChinaProvince:isCN, subRegion:sub,
    ericDiary: diary, aliceDiary: `我们在实验室对 ${n} 的生态样本进行了分段提取。`, 
    memoryPhotos: memoryPhotos 
  };
};

// ============================================================
// 🏛️ 全量产品矩阵 (50款)
// ============================================================
const yuanData = [
  { group: 'Metal金', folder: 'metal', items: [['神圣乳香', 'Sacred Frankincense', '248', '10ml'], ['极境香茅', 'Citronella Clarissima', '248', '10ml'], ['极境尤加利', 'Eucalyptus Glaciale', '98', '10ml', `https://raw.githubusercontent.com/2008zxeric/unio-aroma/main/assets/products/metal/%20Eucalyptus%20Glaciale.webp${CACHE_V}`], ['极境茶树', 'Tea Tree Antiseptic', '98', '10ml'], ['极境薄荷', 'Peppermint from Peaks', '68', '10ml']] },
  { group: 'Wood木', folder: 'wood', items: [['老山檀香', 'Aged Sandalwood', '1180', '10ml'],['极境丝柏', 'Misty Cypress', '128', '10ml'],['极境雪松', 'Himalayan Cedar', '108', '10ml'],['极境松针', 'Boreal Pine', '98', '10ml'],['神圣花梨木', 'Sacred Rosewood Isle', '158', '10ml']] },
  { group: 'Water水', folder: 'water', items: [['极境没药', 'Myrrh Secreta', '298', '10ml'],['深根岩兰草', 'Deep Root Vetiver', '158', '10ml'],['暗夜广藿香', 'Patchouli Nocturne', '158', '10ml'],['极境杜松', 'Juniper by the Loch', '98', '10ml'],['极境安息香', 'Benzoin Ambrosia', '108', '10ml']] },
  { group: 'Fire火', folder: 'fire', items: [['大马士革玫瑰', 'Damask Rose Aureate', '2680', '10ml'],['极境依兰', 'Ylang Equatorial', '180', '10ml'],['大花茉莉', 'Jasminum Grandiflorum', '108', '10ml'],['日光橙花', 'Neroli Soleil', '108', '10ml'],['极境天竺葵', 'Geranium Rosé', '98', '10ml', 'https://raw.githubusercontent.com/2008zxeric/unio-aroma/main/assets/products/fire/Geranium%20Rose%CC%81.webp']] },
  { group: 'Earth土', folder: 'earth', items: [['佛手柑', 'Bergamot Alba', '108', '10ml'],['横断生姜', 'Zingiber Terrae', '158', '10ml'],['极境红橘', 'Mandarin Jucunda', '108', '10ml'],['极境葡萄柚', 'Grapefruit Pomona', '68', '10ml'],['极境橡木苔', 'Oakmoss Taiga', '108', '10ml']] }
];
yuanData.forEach(g => g.items.forEach((item, j) => addP('yuan', `元 · ${g.group}`, item[0], item[1], g.folder, `yuan_${g.folder}_${j}`, item[2], item[3], item[4])));

const heData = [
  { group: 'Body身体', folder: 'body', items: [['云感霜', 'cloud velvet', '268', '50ml', 'cloud velvet.webp'],['晨曦液', 'Dawn Glow', '228', '100ml', 'Dawn Glow.webp'],['月华油', 'Moonlight Oil', '298', '30ml', 'Moonlight Oil.webp'],['清冽发', 'Frost Mint', '198', '60ml', 'Frost Mint.webp'],['润迹膏', 'Trace Balm', '168', '15ml', 'Trace Balm.webp']] },
  { group: 'Mind心智', folder: 'heart', items: [['止语雾', 'Silent Mist', '188', '100ml'],['归处膏', 'Sanctuary', '158', '10ml'],['听泉露', 'Zen Fountain', '248', '30ml'],['微光氛', 'Glimmer', '228', '30ml'],['深吸瓶', 'Deep Breath', '138', '10ml']] },
  { group: 'Soul灵魂', folder: 'soul', items: [['无界油', 'Boundless', '328', '30ml'],['悬浮露', 'Floating', '208', '100ml'],['破晓珠', 'Daybreak', '148', '10ml'],['空寂水', 'Void Moss', '198', '100ml'],['共振方', 'Resonant', '368', '30ml']] }
];
heData.forEach((g, i) => g.items.forEach((item, j) => {
  let customImg = item[4];
  if (!customImg) {
    if (i >= 1) customImg = ASSETS.brand_image; 
    if (i === 2 && j === 4) customImg = ASSETS.packaging_sample; 
  }
  addP('he', `香 · ${g.group}`, item[0], item[1], g.folder, `he_${i}_${j}`, item[2], item[3], customImg);
}));

const jingData = [
  { group: '芳香美学', folder: 'place', items: [['扩香石', 'Crackled', '388', 'Set', 'Crackled.webp'],['芳香链', 'Necklace ', '368', 'Piece', 'Necklace .webp'],['木核扩', 'Walnut', '198', 'Piece', 'Walnut.webp'],['精油烛', 'candle', '228', '200g', 'candle.webp'],['雾露器', 'Vessel', '158', 'Piece', 'Vessel.webp']] },
  { group: '凝思之物', folder: 'Meditation', items: [['一柱香', 'Incense Sticks', '128', '30pcs', 'Incense Sticks.webp'],['觉知珠', 'Rollerball', '88', '10ml', 'Rollerball.webp'],['清空石', 'Gypsum', '168', 'Piece', 'Gypsum.webp'],['归真座', 'mountain', '258', 'Piece', 'mountain.webp'],['承露璃', 'glass', '328', 'Piece', 'glass.webp']] }
];
jingData.forEach((g, i) => g.items.forEach((item, j) => addP('jing', `境 · ${g.group}`, item[0], item[1], g.folder, `jing_${i}_${j}`, item[2], item[3], item[4])));

const getP = (s: string) => Object.keys(DATABASE).slice(0, 3);

// ============================================================
// 🌍 寻香地理志 (亚洲19/欧洲14/非洲8/美洲9)
// ============================================================

// --- 亚洲 (19) ---
addD('w_thai','泰国','THAILAND','亚洲',40,'https://images.unsplash.com/photo-1528127269322-539801943592?q=80&w=1200');
addD('w_in','印度','INDIA','亚洲',3,'https://images.unsplash.com/photo-1506461883276-594a12b11cf3?q=80&w=1200');
addD('w_hk','中国香港','HONG KONG','亚洲',18,`${RAW_DEST}Hongkong.webp${CACHE_V}`);
addD('w_my','马来西亚','MALAYSIA','亚洲',13,`${RAW_DEST}Malaysia.webp${CACHE_V}`);
addD('w_id','印尼','INDONESIA','亚洲',12,'https://images.unsplash.com/photo-1537996194471-e657df975ab4?q=80&w=1200');
addD('w_uae','阿联酋','UAE','亚洲',12,'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?q=80&w=1200');
addD('w_vn','越南','VIETNAM','亚洲',6,'https://images.unsplash.com/photo-1528127269322-539801943592?q=80&w=600');
addD('w_jp','日本','JAPAN','亚洲',2,'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?q=80&w=1200');
addD('w_ir','伊朗','IRAN','亚洲',2,`${RAW_DEST}Iran.webp${CACHE_V}`);
addD('w_sg','新加坡','SINGAPORE','亚洲',2,`${RAW_DEST}Singapore.webp${CACHE_V}`);
addD('w_kr','韩国','SOUTH KOREA','亚洲',1,'https://images.unsplash.com/photo-1517154421773-0529f29ea451?q=80&w=1200');
addD('w_np','尼泊尔','NEPAL','亚洲',2,'https://images.unsplash.com/photo-1544735716-392fe2489ffa?q=80&w=1200');
addD('w_tr','土耳其','TURKEY','亚洲',8,'https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?q=80&w=1200');
addD('w_kz','哈萨克斯坦','KAZAKHSTAN','亚洲',4,`${RAW_DEST}kazakhstan.webp${CACHE_V}`);
addD('w_jo','约旦','JORDAN','亚洲',2,'https://images.unsplash.com/photo-1547234935-80c7145ec969?q=80&w=1200');
addD('w_mac','中国澳门','MACAU','亚洲',2,`${RAW_DEST}Macao.webp${CACHE_V}`);
addD('w_kh','柬埔寨','CAMBODIA','亚洲',1,`${RAW_DEST}Cambodia.webp${CACHE_V}`);
addD('w_kp','朝鲜','NORTH KOREA','亚洲',1,`${RAW_DEST}North%20Korea.webp${CACHE_V}`);
addD('w_lk','斯里兰卡','SRI LANKA','亚洲',2,'https://images.unsplash.com/photo-1546708973-b339540b5162?q=80&w=1200');

// --- 欧洲 (14 - 移除希腊、挪威) ---
addD('w_fr','法国','FRANCE','欧洲',5,'https://images.unsplash.com/photo-1499002238440-d264edd596ec?q=80&w=1200');
addD('w_de','德国','GERMANY','欧洲',4,'https://images.unsplash.com/photo-1467269204594-9661b134dd2b?q=80&w=1200');
addD('w_it','意大利','ITALY','欧洲',2,'https://images.unsplash.com/photo-1523906834658-6e24ef2386f9?q=80&w=1200');
addD('w_uk','英国','UK','欧洲',5,'https://images.unsplash.com/photo-1486299267070-83823f5448dd?q=80&w=1200');
addD('w_is','冰岛','ICELAND','欧洲',1,`${RAW_DEST}Ice%20island.webp${CACHE_V}`);
addD('w_es','西班牙','SPAIN','欧洲',1,`${RAW_DEST}Spain.webp${CACHE_V}`);
addD('w_nl','荷兰','NETHERLANDS','欧洲',1,'https://images.unsplash.com/photo-1512470876302-972faa2aa9a4?q=80&w=1200');
addD('w_pl','波兰','POLAND','欧洲',5,`${RAW_DEST}Poland.webp${CACHE_V}`);
addD('w_at','奥地利','AUSTRIA','欧洲',2,'https://images.unsplash.com/photo-1516550893923-42d28e5677af?q=80&w=1200');
addD('w_dk','丹麦','DENMARK','欧洲',2,'https://images.unsplash.com/photo-1513622470522-26c3c8a854bc?q=80&w=1200');
addD('w_hu','匈牙利','HUNGARY','欧洲',2,'https://images.unsplash.com/photo-1503917988258-f87a78e3c995?q=80&w=1200');
addD('w_mc','摩纳哥','MONACO','欧洲',1,`${RAW_DEST}Monaco.webp${CACHE_V}`);
addD('w_lu','卢森堡','LUXEMBOURG','欧洲',1,`${RAW_DEST}Luxembourg.webp${CACHE_V}`);
addD('w_pt','葡萄牙','PORTUGAL','欧洲',1,`${RAW_DEST}Portugal.webp${CACHE_V}`);
addD('w_bg','保加利亚','BULGARIA','欧洲',1,`${RAW_DEST}Bulgaria.webp${CACHE_V}`);
addD('w_ch','瑞士','SWITZERLAND','欧洲',3,'https://images.unsplash.com/photo-1530122037265-a5f1f91d3b99?q=80&w=1200');

// --- 非洲 (8) ---
addD('w_sa','南非','SOUTH AFRICA','非洲',12,`${RAW_DEST}South%20africa.webp${CACHE_V}`);
addD('w_eg','埃及','EGYPT','非洲',2,`${RAW_DEST}Egypt.webp${CACHE_V}`);
addD('w_ke','肯尼亚','KENYA','非洲',2,`${RAW_DEST}Kenya.webp${CACHE_V}`);
addD('w_mg','马达加斯加','MADAGASCAR', '非洲', 3, `${RAW_DEST}Madagascar.webp${CACHE_V}`);
addD('w_zw','津巴布韦','ZIMBABWE','非洲',1,`${RAW_DEST}Zimbabwe.webp${CACHE_V}`);
addD('w_mu','毛里求斯','MAURITIUS','非洲',1,`${RAW_DEST}Mauritius.webp${CACHE_V}`);
addD('w_ma','摩洛哥','MOROCCO','非洲',2,'https://images.unsplash.com/photo-1489493585363-d69421e0edd3?q=80&w=1200');
addD('w_et','埃塞俄比亚','ETHIOPIA','非洲',2,'https://images.unsplash.com/photo-1544735716-392fe2489ffa?q=80&w=1200');

// --- 美洲/大洋洲 (9) ---
addD('w_us','美国','USA','美洲/大洋洲',7,'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=1200');
addD('w_ca','加拿大','CANADA','美洲/大洋洲',3,'https://images.unsplash.com/photo-1503614472-8c93d56e92ce?q=80&w=1200');
addD('w_br','巴西','BRAZIL','美洲/大洋洲',8,`${RAW_DEST}Brazil.webp${CACHE_V}`);
addD('w_au','澳大利亚','AUSTRALIA','美洲/大洋洲',5,'https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?q=80&w=1200');
addD('w_an','南极洲','ANTARCTICA','美洲/大洋洲',1,'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=1200');
addD('w_mx','墨西哥','MEXICO','美洲/大洋洲',4,`${RAW_DEST}Mexico.webp${CACHE_V}`);
addD('w_ar','阿根廷','ARGENTINA','美洲/大洋洲',1,`${RAW_DEST}Argentina.webp${CACHE_V}`);
addD('w_ht','海地','HAITI','美洲/大洋洲',2,`${RAW_DEST}Haiti.webp${CACHE_V}`);
addD('w_pe','秘鲁','PERU','美洲/大洋洲',1,'https://images.unsplash.com/photo-1526392060635-9d6019884377?q=80&w=1200');

// --- 神州 (34) ---
const PROVINCE_GROUPS: Record<string, string[]> = {
  '华北': ['北京', '天津', '河北', '山西', '内蒙古'],
  '东北': ['辽宁', '吉林', '黑龙江'],
  '华东': ['上海', '江苏', '浙江', '安徽', '福建', '江西', '山东', '台湾'],
  '华中': ['河南', '湖北', '湖南'],
  '华南': ['广东', '广西', '海南', '香港', '澳门'],
  '西南': ['重庆', '四川', '贵州', '云南', '西藏'],
  '膨西': ['陕西', '甘肃', '青海', '宁夏', '新疆']
};
const PROVINCE_FILE_MAP: Record<string, string> = {
  '北京': 'beijing.webp', '天津': 'tianjin.webp', '河北': 'hebei.webp', '山西': 'shanxi.webp', '内蒙古': 'neimenggu.webp',
  '辽宁': 'liaoning.webp', '吉林': 'jilin.webp', '黑龙江': 'heilongjiang.webp',
  '上海': 'shanghai.webp', '江苏': 'jiangsu.webp', '浙江': 'zhejiang.webp', '安徽': 'anhui.webp', '福建': 'fujian.webp', '江西': 'jiangxi.webp', '山东': 'shandong.webp', '台湾': 'taiwan.webp',
  '河南': 'henan.webp', '湖北': 'hubei.webp', '湖南': 'hunan.webp',
  '广东': 'guangdong.webp', '广西': 'guangxi.webp', '海南': 'hainan.webp', '香港': 'hongkong.webp', '澳门': 'macao.webp',
  '重庆': 'chongqing.webp', '四川': 'sichuan.webp', '贵州': 'guizhou.webp', '云南': 'yunnan.webp', '西藏': 'xizang.webp',
  '陕西': 'shannxi.webp', '甘肃': 'gansu.webp', '青海': 'qinghai.webp', '宁夏': 'ningxia.webp', '新疆': 'xinjiang.webp'
};
Object.entries(PROVINCE_GROUPS).forEach(([sub, list]) => {
  list.forEach(prov => {
    const id = `cn_${prov}`;
    const en = prov.toUpperCase();
    const img = `${PROVINCE_BASE}${PROVINCE_FILE_MAP[prov] || 'beijing.webp'}${CACHE_V}`;
    addD(id, prov, en, '亚洲', 5, img, getP(prov), 'arrived', true, sub);
  });
});
