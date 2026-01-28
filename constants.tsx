
import { ScentItem, Destination, Category } from './types';

const RAW_BASE = 'https://raw.githubusercontent.com/2008zxeric/unio-aroma/main/assets/';
const PROVINCE_BASE = `${RAW_BASE}province/`;
// 增加版本号后缀，强制 CDN 刷新 GitHub 原始资源
const CACHE_V = '?v=1002.20'; 

export const ASSETS = {
  logo: `${RAW_BASE}brand/logo.svg${CACHE_V}`,
  xhs_link: 'https://xhslink.com/m/AcZDZuYhsVd',
  hero_zen: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=2560',
  hero_eric: 'https://images.unsplash.com/photo-1544198365-f5d60b6d8190?q=80&w=1920', 
  hero_alice: 'https://images.unsplash.com/photo-1576086213369-97a306d36557?q=80&w=1920',
  hero_spary: `${RAW_BASE}brand/spary.webp${CACHE_V}`, 
  banner: `${RAW_BASE}brand/banner.webp${CACHE_V}`,
  brand_image: `${RAW_BASE}brand/brand.webp${CACHE_V}`,
  packaging_sample: `${RAW_BASE}brand/see.webp${CACHE_V}`,
  placeholder: 'https://images.unsplash.com/photo-1540555700478-4be289fbecee?q=80&w=800'
};

export const ASSET_REGISTRY = { brand: ASSETS };
export const PRODUCT_OVERRIDES: Record<string, string> = {};

export const REGION_VISUALS = {
  china: `${PROVINCE_BASE}beijing.webp${CACHE_V}`,
  asia: 'https://images.unsplash.com/photo-1528127269322-539801943592?q=80&w=600',
  europe: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?q=80&w=600',
  africa: 'https://images.unsplash.com/photo-1516026672322-bc52d61a55d5?q=80&w=600',
  america: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=600'
};

// 精准省级影像文件名映射
const PROVINCE_FILE_MAP: Record<string, string> = {
  '安徽': 'anhui.webp', '北京': 'beijing.webp', '重庆': 'chongqing.webp', '福建': 'fujian.webp',
  '甘肃': 'gansu.webp', '广东': 'guangdong.webp', '广西': 'guangxi.webp', '贵州': 'guizhou.webp',
  '海南': 'hainan.webp', '河北': 'hebei.webp', '河南': 'henan.webp', '湖北': 'hubei.webp',
  '湖南': 'hunan.webp', '江西': 'jiangxi.webp', '内蒙古': 'neimenggu.webp', '宁夏': 'ningxia.webp',
  '青海': 'qinghai.webp', '山东': 'shandong.webp', '上海': 'shanghai.webp', '陕西': 'shannxi.webp',
  '山西': 'shanxi.webp', '四川': 'sichuan.webp', '台湾': 'taiwan.webp', '天津': 'tianjin.webp',
  '新疆': 'xinjiang.webp', '西藏': 'xizang.webp', '云南': 'yunnan.webp', '浙江': 'zhejiang.webp',
  '江苏': 'jiangsu.webp', '辽宁': 'liaoning.webp', '吉林': 'jilin.webp', '黑龙江': 'heilongjiang.webp'
};

const RAW_PROD = `${RAW_BASE}products/`;
const RAW_DEST = `${RAW_BASE}destinations/`;
const RAW_ALBUM = `${RAW_BASE}Ericalbum/`;

export const DATABASE: Record<string, ScentItem> = {};
export const DESTINATIONS: Record<string, Destination> = {};

const addP = (cat: 'yuan'|'he'|'jing', group: string, n: string, en: string, folder: string, id: string, price: string, spec: string, filenameOverride?: string) => {
  let heroUrl = "";
  if (filenameOverride && (filenameOverride.startsWith('http') || filenameOverride.startsWith('https'))) {
    heroUrl = filenameOverride;
  } else {
    const filename = filenameOverride || `${en.trim()}.webp`;
    heroUrl = `${RAW_PROD}${folder}/${encodeURIComponent(filename)}${CACHE_V}`;
  }
  DATABASE[id] = {
    id, category: cat, subGroup: group, name: n, herb: n, herbEn: en.toUpperCase().trim(),
    region: 'Extreme Origin', status: 'arrived_origin', visited: true, accent: '#D75437',
    price, specification: spec, hero: heroUrl,
    shortDesc: cat === 'yuan' ? '极境溯源 / 单方生存原力' : (cat === 'he' ? '一人一方 / 科学频率重构' : '境之感知 / 极简芳香美学'), 
    narrative: `“在 ${n} 分子的震颤中，我听见了生命在极限环境下的抗争。”`,
    benefits: ['意识重构', '深度频率校准', '内在秩序恢复'],
    usage: '取三滴精油于掌心，合十温热，闭目由鼻息深处缓慢引入意识核心，感受分子频率的精准对位。',
    precautions: 'UNIO 馆藏坚持高纯度提取。敏感肤质请在实验室建议下稀释使用。',
    ericDiary: `见证了 ${n} 在极端重压下迸发的顽强。`, 
    aliceDiary: `低温气相萃取完整封存了 ${n} 的分子几何结构。`,
    aliceLabDiary: `GC/MS 质谱分析揭示了 ${n} 非凡的化学序位。`, 
    recommendation: '元香 UNIO 限量馆藏。仅为 1% 的觉知灵魂保留。'
  } as ScentItem;
};

const addD = (id:string, n:string, en:string, reg:string, c:number, img:string, pIds: string[] = [], s:'arrived'|'locked'='arrived', isCN:boolean=false, sub?:string, mPhots?: string[], eDiary?: string, aDiary?: string) => {
  DESTINATIONS[id] = {
    id, name:n, en, region:reg, status:s, visitCount:c, scenery:img, emoji:'📍',
    herbDescription: '极境原生分子档案', knowledge:'已存入元香 UNIO 核心频率库', productIds: pIds, isChinaProvince:isCN, subRegion:sub,
    ericDiary: eDiary || `第 ${c} 次踏上 ${n}。`, 
    aliceDiary: aDiary || `我们在实验室尝试将其分子结构完整保留。`, 
    memoryPhotos: mPhots || [img, img, img]
  };
};

// --- [元系列] ---
const yuanData = [
  { group: 'Metal', folder: 'metal', items: [['神圣乳香', 'Sacred Frankincense', '248', '10ml'], ['极境香茅', 'Citronella Clarissima', '248', '10ml'], ['极境尤加利', 'Eucalyptus Glaciale', '98', '10ml', ' Eucalyptus Glaciale.webp'], ['极境茶树', 'Tea Tree Antiseptic', '98', '10ml'], ['极境薄荷', 'Peppermint from Peaks', '68', '10ml']] },
  { group: 'Wood', folder: 'wood', items: [['老山檀香', 'Aged Sandalwood', '1,180', '10ml'], ['神圣花梨木', 'Sacred Rosewood Isle', '158', '10ml'], ['极境丝柏', 'Misty Cypress', '128', '10ml'], ['极境雪松', 'Himalayan Cedar', '108', '10ml'], ['极境松针', 'Boreal Pine', '98', '10ml']] },
  { group: 'Water', folder: 'water', items: [['极境没药', 'Myrrh Secreta', '298', '10ml'], ['深根岩兰草', 'Deep Root Vetiver', '158', '10ml'], ['暗夜广藿香', 'Patchouli Nocturne', '158', '10ml'], ['极境安息香', 'Benzoin Ambrosia', '108', '10ml'], ['极境杜松', 'Juniper by the Loch', '98', '10ml']] },
  { group: 'Fire', folder: 'fire', items: [['大马士革玫瑰', 'Damask Rose Aureate', '2,680', '10ml'], ['日光橙花', 'Neroli Soleil', '108', '10ml'], ['大花茉莉', 'Jasminum Grandiflorum', '108', '10ml'], ['极境依兰', 'Ylang Equatorial', '180', '10ml'], ['极境天竺葵', 'Geranium Rosé', '98', '10ml']] },
  { group: 'Earth', folder: 'earth', items: [['横断生姜', 'Zingiber Terrae', '158', '10ml'], ['佛手柑', 'Bergamot Alba', '108', '10ml'], ['极境红橘', 'Mandarin Jucunda', '108', '10ml'], ['极境橡木苔', 'Oakmoss Taiga', '108', '10ml'], ['极境葡萄柚', 'Grapefruit Pomona', '68', '10ml']] }
];
yuanData.forEach((g) => g.items.forEach((item, j) => addP('yuan', `元 · ${g.group}`, item[0], item[1], g.folder, `yuan_${g.folder}_${j}`, item[2], item[3], item[4])));

// --- [香系列] ---
const heData = [
  { group: 'Body身体', folder: 'body', items: [['云感霜', 'CLOUD VELVET', '268', '50ml', 'cloud velvet.webp'], ['晨曦液', 'DAWN GLOW', '228', '100ml', 'Dawn Glow.webp'], ['月华油', 'MOONLIGHT OIL', '298', '30ml', 'Moonlight Oil.webp'], ['清冽发', 'FROST MINT', '198', '60ml', 'Frost Mint.webp'], ['润迹膏', 'TRACE BALM', '168', '15ml', 'Trace Balm.webp']] },
  { group: 'Mind心智', folder: 'heart', items: [['止语雾', 'SILENT MIST', '188', '100ml', ASSETS.hero_spary], ['归处膏', 'SANCTUARY', '158', '10ml', ASSETS.hero_spary], ['听泉露', 'ZEN FOUNTAIN', '248', '30ml', ASSETS.hero_spary], ['微光氛', 'GLIMMER', '228', '30ml', ASSETS.hero_spary], ['深吸瓶', 'DEEP BREATH', '138', '10ml', ASSETS.hero_spary]] },
  { group: 'Soul灵魂', folder: 'soul', items: [['无界油', 'BOUNDLESS', '328', '30ml', ASSETS.hero_spary], ['悬浮露', 'FLOATING', '208', '100ml', ASSETS.hero_spary], ['破晓珠', 'DAYBREAK', '148', '10ml', ASSETS.hero_spary], ['空寂水', 'VOID MOSS', '198', '100ml', ASSETS.hero_spary], ['共振方', 'RESONANCE FORMULA', '368', '30ml', ASSETS.hero_spary]] }
];
heData.forEach((g) => g.items.forEach((item, j) => addP('he', `香 · ${g.group}`, item[0], item[1], g.folder, `he_${g.folder}_${j}`, item[2], item[3], item[4])));

// --- [境系列] ---
const jingDataA = [['裂纹瓷香承', 'THE CRACKLED VESSEL', '298', '手工/限量', 'Crackled.webp'], ['闻香颈饰', 'AROMA PENDANT', '368', '含扩香芯', 'Necklace .webp'], ['黑胡桃扩香木', 'WALNUT DIFFUSER WOOD', '198', '北美黑胡桃', 'Walnut.webp'], ['氛围香氛烛', 'ATMOSPHERE CANDLE', '228', '200g', 'candle.webp'], ['紫晶典藏瓶', 'VIOLET GLASS APOTHECARY', '158', 'Miron紫晶', 'Vessel.webp']];
const jingDataM = [['天然草本线香', 'NATURAL HERBAL INCENSE', '128', '30支/管', 'Incense Sticks.webp'], ['随行滚珠瓶', 'TRAVEL ROLLER BOTTLE', '88', '10ml', 'Rollerball.webp'], ['旷野扩香石', 'RAW DIFFUSER STONE', '168', '天然原石感', 'Gypsum.webp'], ['归真座', 'THE MOUNTAIN BASE', '258', '陶/石复合', 'mountain.webp'], ['承露玻璃罩', 'HANDBLOWN GLASS CLOCHE', '328', '手工吹制', 'glass.webp']];
jingDataA.forEach((item, j) => addP('jing', '境 · 芳香美学', item[0], item[1], 'place', `jing_place_${j}`, item[2], item[3], item[4]));
jingDataM.forEach((item, j) => addP('jing', '境 · 凝思之物', item[0], item[1], 'Meditation', `jing_meditation_${j}`, item[2], item[3], item[4]));

const getProducts = (seed: string) => Object.keys(DATABASE).sort(() => seed.length % 10 - 5).slice(0, 6);

// --- [全球目的地坐标：全量保留 51 个] ---
// 亚洲 (18)
addD('w_thai','泰国','THAILAND','亚洲',40,'https://images.unsplash.com/photo-1528127269322-539801943592?q=80&w=1200', getProducts('th'), 'arrived', false, undefined, [`${RAW_ALBUM}Thailand/th1.webp${CACHE_V}`,`${RAW_ALBUM}Thailand/th2.webp${CACHE_V}`,`${RAW_ALBUM}Thailand/th3.webp${CACHE_V}`]);
addD('w_in','印度','INDIA','亚洲',3,'https://images.unsplash.com/photo-1506461883276-594a12b11cf3?q=80&w=1200', getProducts('in'));
addD('w_hk','中国香港','HONG KONG','亚洲',18,`${RAW_DEST}Hongkong.webp${CACHE_V}`, getProducts('hk'));
addD('w_my','马来西亚','MALAYSIA','亚洲',13,`${RAW_DEST}Malaysia.webp${CACHE_V}`, getProducts('my'));
addD('w_id','印度尼西亚','INDONESIA','亚洲',12,'https://images.unsplash.com/photo-1537996194471-e657df975ab4?q=80&w=1200', getProducts('id'));
addD('w_uae','阿联酋','UAE','亚洲',12,'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?q=80&w=1200', getProducts('uae'));
addD('w_vn','越南','VIETNAM','亚洲',6,'https://images.unsplash.com/photo-1528127269322-539801943592?q=80&w=600', getProducts('vn'));
addD('w_kz','哈萨克斯坦','KAZAKHSTAN','亚洲',4,'https://images.unsplash.com/photo-1563245372-f21724e3856d?q=80&w=1200', getProducts('kz'));
addD('w_jp','日本','JAPAN','亚洲',2,'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?q=80&w=1200', getProducts('jp'));
addD('w_ir','伊朗','IRAN','亚洲',2,`${RAW_DEST}Iran.webp${CACHE_V}`, getProducts('ir'));
addD('w_jo','约旦','JORDAN','亚洲',2,'https://images.unsplash.com/photo-1547234935-80c7145ec969?q=80&w=1200', getProducts('jo'));
addD('w_mac','中国澳门','MACAU','亚洲',2,`${RAW_DEST}Macao.webp${CACHE_V}`, getProducts('mac'));
addD('w_sg','新加坡','SINGAPORE','亚洲',2,`${RAW_DEST}Singapore.webp${CACHE_V}`, getProducts('sg'));
addD('w_kr','韩国','SOUTH KOREA','亚洲',1,'https://images.unsplash.com/photo-1517154421773-0529f29ea451?q=80&w=1200', getProducts('kr'));
addD('w_kh','柬埔寨','CAMBODIA','亚洲',1,`${RAW_DEST}Cambodia.webp${CACHE_V}`, getProducts('kh'));
addD('w_kp','朝鲜','NORTH KOREA','亚洲',1,`${RAW_DEST}North%20Korea.webp${CACHE_V}`, getProducts('kp'));
addD('w_lk','斯里兰卡','SRI LANKA','亚洲',2,'https://images.unsplash.com/photo-1546708973-b339540b5162?q=80&w=1200', getProducts('lk'));
addD('w_np','尼泊尔','NEPAL','亚洲',2,'https://images.unsplash.com/photo-1544735716-392fe2489ffa?q=80&w=1200', getProducts('np'));
// 欧洲 (16)
addD('w_tr','土耳其','TURKEY','欧洲',8,'https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?q=80&w=1200', getProducts('tr'));
addD('w_fr','法国','FRANCE','欧洲',5,'https://images.unsplash.com/photo-1499002238440-d264edd596ec?q=80&w=1200', getProducts('fr'));
addD('w_pl','波兰','POLAND','欧洲',5,`${RAW_DEST}Poland.webp${CACHE_V}`, getProducts('pl'));
addD('w_de','德国','GERMANY','欧洲',4,'https://images.unsplash.com/photo-1467269204594-9661b134dd2b?q=80&w=1200', getProducts('de'));
addD('w_it','意大利','ITALY','欧洲',2,'https://images.unsplash.com/photo-1523906834658-6e24ef2386f9?q=80&w=1200', getProducts('it'));
addD('w_at','奥地利','AUSTRIA','欧洲',2,'https://images.unsplash.com/photo-1516550893923-42d28e5677af?q=80&w=1200', getProducts('at'));
addD('w_dk','丹麦','DENMARK','欧洲',2,'https://images.unsplash.com/photo-1513622470522-26c3c8a854bc?q=80&w=1200', getProducts('dk'));
addD('w_hu','匈牙利','HUNGARY','欧洲',2,'https://images.unsplash.com/photo-1503917988258-f87a78e3c995?q=80&w=1200', getProducts('hu'));
addD('w_es','西班牙','SPAIN','欧洲',1,`${RAW_DEST}Spain.webp${CACHE_V}`, getProducts('es'));
addD('w_nl','荷兰','NETHERLANDS','欧洲',1,'https://images.unsplash.com/photo-1512470876302-972faa2aa9a4?q=80&w=1200', getProducts('nl'));
addD('w_mc','摩纳哥','MONACO','欧洲',1,`${RAW_DEST}Monaco.webp${CACHE_V}`, getProducts('mc'));
addD('w_lu','卢森堡','LUXEMBOURG','欧洲',1,`${RAW_DEST}Luxembourg.webp${CACHE_V}`, getProducts('lu'));
addD('w_pt','葡萄牙','PORTUGAL','欧洲',1,`${RAW_DEST}Portugal.webp${CACHE_V}`, getProducts('pt'));
addD('w_is','冰岛','ICELAND','欧洲',1,`${RAW_DEST}Ice%20island.webp${CACHE_V}`, getProducts('is'));
addD('w_bg','保加利亚','BULGARIA','欧洲',1,`${RAW_DEST}Bulgaria.webp${CACHE_V}`, getProducts('bg'));
addD('w_uk','英国','UK','欧洲',0,'https://images.unsplash.com/photo-1486299267070-83823f5448dd?q=80&w=1200', [], 'locked');
// 非洲 (7)
addD('w_sa','南非','SOUTH AFRICA','非洲',12,`${RAW_DEST}South%20africa.webp${CACHE_V}`, getProducts('sa'));
addD('w_zw','津巴布韦','ZIMBABWE','非洲',1,`${RAW_DEST}Zimbabwe.webp${CACHE_V}`, getProducts('zw'));
addD('w_eg','埃及','EGYPT','非洲',2,`${RAW_DEST}Egypt.webp${CACHE_V}`, getProducts('eg'));
addD('w_ke','肯尼亚','KENYA','非洲',2,`${RAW_DEST}Kenya.webp${CACHE_V}`, getProducts('ke'));
addD('w_mu','毛里求斯','MAURITIUS','非洲',1,`${RAW_DEST}Mauritius.webp${CACHE_V}`, getProducts('mu'));
addD('w_mg','马达加斯加','MADAGASCAR','非洲',0,`${RAW_DEST}Madagascar.webp${CACHE_V}`, [], 'locked');
addD('w_ma','摩洛哥','MOROCCO','非洲',0,'https://images.unsplash.com/photo-1489493585363-d69421e0edd3?q=80&w=1200', [], 'locked');
// 美洲/大洋洲 (10)
addD('w_us','美国','USA','美洲/大洋洲',7,'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=1200', getProducts('us'));
addD('w_mx','墨西哥','MEXICO','美洲/大洋洲',4,`${RAW_DEST}Mexico.webp${CACHE_V}`, getProducts('mx'));
addD('w_br','巴西','BRAZIL','美洲/大洋洲',8,`${RAW_DEST}Brazil.webp${CACHE_V}`, getProducts('br'));
addD('w_ar','阿根廷','ARGENTINA','美洲/大洋洲',1,`${RAW_DEST}Argentina.webp${CACHE_V}`, getProducts('ar'));
addD('w_ht','海地','HAITI','美洲/大洋洲',0,`${RAW_DEST}Haiti.webp${CACHE_V}`, [], 'locked');
addD('w_ca','加拿大','CANADA','美洲/大洋洲',0,'https://images.unsplash.com/photo-1503614472-8c93d56e92ce?q=80&w=1200', [], 'locked');
addD('w_pe','秘鲁','PERU','美洲/大洋洲',0,'https://images.unsplash.com/photo-1526392060635-9d6019884377?q=80&w=1200', [], 'locked');
addD('w_au','澳大利亚','AUSTRALIA','美洲/大洋洲',0,'https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?q=80&w=1200', [], 'locked');
addD('w_an','南极洲','ANTARCTICA','美洲/大洋洲',0,'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=1200', [], 'locked');
addD('w_cu','古巴','CUBA','美洲/大洋洲',0,'https://images.unsplash.com/photo-1506461883276-594a12b11cf3?q=80&w=1200', [], 'locked');

// --- [中华神州：34 坐标全量激活] ---
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
    const filename = PROVINCE_FILE_MAP[prov] || 'beijing.webp';
    const scenery = `${PROVINCE_BASE}${filename}${CACHE_V}`;
    addD(`cn_${prov}`, prov, prov.toUpperCase(), '亚洲', 5, scenery, getProducts(prov), 'arrived', true, sub);
  });
});
