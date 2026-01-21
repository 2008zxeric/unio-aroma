import { ScentItem, Destination, Category } from './types';

const RAW_BASE = 'https://raw.githubusercontent.com/2008zxeric/unio-aroma/main/assets/';
const CACHE_V = '?v=900.35'; 

export const ASSETS = {
  logo: `${RAW_BASE}brand/logo.svg${CACHE_V}`,
  xhs_link: 'https://xhslink.com/m/AcZDZuYhsVd',
  // 首页全景：极境之巅
  hero_zen: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=2560',
  // Eric 寻香人背景
  hero_eric: 'https://images.unsplash.com/photo-1544198365-f5d60b6d8190?q=80&w=1920', 
  // Alice 实验室背景
  hero_alice: 'https://images.unsplash.com/photo-1576086213369-97a306d36557?q=80&w=1920',
  hero_spary: `${RAW_BASE}brand/spary.webp${CACHE_V}`, 
  banner: `${RAW_BASE}brand/banner.webp${CACHE_V}`,
  brand_image: `${RAW_BASE}brand/brand.webp${CACHE_V}`,
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
    shortDesc: cat === 'yuan' ? '极境寻获 / Eric 亲手采集' : (cat === 'he' ? '一人一方 / Alice 手工调配' : '境之感知 / 芳香美学'), 
    narrative: `“廿载寻香。我们在极境中感悟 ${n} 的意志。它是大自然在极端环境下的生存智慧，终将化作你内心的宁静。”`,
    benefits: ['频率重构', '深度平衡', '觉知开启'], 
    usage: '滴于掌心或扩香器中，深度嗅吸。', 
    precautions: '元香 UNIO 坚持非工业化生产，高纯度精油请稀释使用。',
    ericDiary: `这是我廿载寻香的足迹，${n} 分子的震颤至今难忘。`, 
    aliceDiary: `Alice 实验室成功保留了 ${n} 的原始能量频率。`,
    aliceLabDiary: `GC/MS 分析验证了其非凡的分子结构。`, 
    recommendation: '元香 UNIO 限量馆藏。'
  } as ScentItem;
};

const addD = (id:string, n:string, en:string, reg:string, c:number, img:string, pIds: string[] = [], s:'arrived'|'locked'='arrived', isCN:boolean=false, sub?:string, mPhots?: string[]) => {
  DESTINATIONS[id] = {
    id, name:n, en, region:reg, status:s, visitCount:c, scenery:img, emoji:'📍',
    herbDescription: '极境原生分子', knowledge:'已存入元香 UNIO 寻香库', productIds: pIds, isChinaProvince:isCN, subRegion:sub,
    ericDiary:`廿载寻香行历，第 ${c} 次来到 ${n}。在极境中，本草才拥有最强韧的意志。`, 
    aliceDiary:`我们在实验室尝试将其分子结构完整保留，贯彻“一人一方”理念。`, 
    memoryPhotos: mPhots || [img, img, img]
  };
};

// --- [元系列数据] ---
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

// --- [和系列数据] ---
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
  let customImg = undefined;
  if (groupLabel === 'Mind' || groupLabel === 'Soul') {
    customImg = ASSETS.brand_image;
  }
  addP('he', `香 · ${groupLabel}`, name, heEns[i][j], groupLabel.toLowerCase(), `he_${groupLabel.toLowerCase()}_${j}`, customImg);
}));

// --- [境系列数据] ---
const jingNames = [['陶瓷皿', '芳香链', '木核扩', '蜡烛', '存香瓶'], ['一柱香', '觉知珠', '清空石', '归真座', '承露璃']];
const jingEns = [['Crackled', 'Necklace ', 'Walnut', 'candle', 'Vessel'], ['Incense Sticks', 'Rollerball', 'Gypsum', 'mountain', 'glass']];
jingNames[0].forEach((n, j) => addP('jing', '境 · 芳香美学', n, jingEns[0][j], 'place', `jing_place_${j}`));
jingNames[1].forEach((n, j) => addP('jing', '境 · 冥想之物', n, jingEns[1][j], 'Meditation', `jing_meditation_${j}`));

const ALL_IDS = Object.keys(DATABASE);
const getProducts = (seed: string) => ALL_IDS.sort(() => seed.length % 10 - 5).slice(0, 6);

// --- [寻香坐标恢复] ---
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

const euList = [
  ['土耳其', 8, 'TURKEY', 'https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?q=80&w=1200'], 
  ['法国', 5, 'FRANCE', 'https://images.unsplash.com/photo-1499002238440-d264edd596ec?q=80&w=1200'], 
  ['波兰', 5, 'POLAND', `${RAW_DEST}Poland.webp${CACHE_V}`], 
  ['德国', 4, 'GERMANY', 'https://images.unsplash.com/photo-1467269204594-9661b134dd2b?q=80&w=1200'], 
  ['意大利', 2, 'ITALY', 'https://images.unsplash.com/photo-1523906834658-6e24ef2386f9?q=80&w=1200'], 
  ['奥地利', 2, 'AUSTRIA', 'https://images.unsplash.com/photo-1516550893923-42d28e5677af?q=80&w=1200'], 
  ['丹麦', 2, 'DENMARK', 'https://images.unsplash.com/photo-1513622470522-26c3c8a854bc?q=80&w=1200'], 
  ['匈牙利', 2, 'HUNGARY', 'https://images.unsplash.com/photo-1503917988258-f87a78e3c995?q=80&w=1200'], 
  ['西班牙', 1, 'SPAIN', `${RAW_DEST}Spain.webp${CACHE_V}`], 
  ['荷兰', 1, 'NETHERLANDS', 'https://images.unsplash.com/photo-1512470876302-972faa2aa9a4?q=80&w=1200'], 
  ['摩纳哥', 1, 'MONACO', `${RAW_DEST}Monaco.webp${CACHE_V}`], 
  ['卢森堡', 1, 'LUXEMBOURG', `${RAW_DEST}Luxembourg.webp${CACHE_V}`], 
  ['葡萄牙', 1, 'PORTUGAL', `${RAW_DEST}Portugal.webp${CACHE_V}`],
  ['冰岛', 1, 'ICELAND', `${RAW_DEST}Ice%20island.webp${CACHE_V}`],
  ['保加利亚', 1, 'BULGARIA', `${RAW_DEST}Bulgaria.webp${CACHE_V}`], 
  ['英国', 0, 'UK', 'https://images.unsplash.com/photo-1486299267070-83823f5448dd?q=80&w=1200'], 
  ['克罗地亚', 0, 'CROATIA', 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?q=80&w=1200'], 
  ['希腊', 0, 'GREECE', 'https://images.unsplash.com/photo-1503152394-c571994fd383?q=80&w=1200']
];
euList.forEach(([n,c,en,img], i) => addD(`w_eu_${i}`, n as string, en as string, '欧洲', c as number, img as string, (c as number > 0 ? getProducts(n as string) : []), (c as number > 0 ? 'arrived' : 'locked')));

const afList = [
  ['南非', 12, 'SOUTH AFRICA', `${RAW_DEST}South%20africa.webp${CACHE_V}`], 
  ['埃及', 2, 'EGYPT', `${RAW_DEST}Egypt.webp${CACHE_V}`], 
  ['津巴布韦', 1, 'ZIMBABWE', '非洲', 1, `${RAW_DEST}Zimbabwe.webp${CACHE_V}`], 
  ['肯尼亚', 2, 'KENYA', `${RAW_DEST}Kenya.webp${CACHE_V}`], 
  ['津巴布韦', 1, 'ZIMBABWE', '非洲', 1, `${RAW_DEST}Zimbabwe.webp${CACHE_V}`],
  ['马达加斯加', 0, 'MADAGASCAR', `${RAW_DEST}Madagascar.webp${CACHE_V}`],
  ['毛里求斯', 1, 'MAURITIUS', `${RAW_DEST}Mauritius.webp${CACHE_V}`],
  ['摩洛哥', 0, 'MOROCCO', 'https://images.unsplash.com/photo-1489493585363-d69421e0edd3?q=80&w=1200']
];
// Note: afList was slightly malformed in the template, cleaning up:
const cleanAfList = [
  ['南非', 12, 'SOUTH AFRICA', `${RAW_DEST}South%20africa.webp${CACHE_V}`], 
  ['埃及', 2, 'EGYPT', `${RAW_DEST}Egypt.webp${CACHE_V}`], 
  ['津巴布韦', 1, 'ZIMBABWE', `${RAW_DEST}Zimbabwe.webp${CACHE_V}`], 
  ['肯尼亚', 2, 'KENYA', `${RAW_DEST}Kenya.webp${CACHE_V}`], 
  ['马达加斯加', 0, 'MADAGASCAR', `${RAW_DEST}Madagascar.webp${CACHE_V}`],
  ['毛里求斯', 1, 'MAURITIUS', `${RAW_DEST}Mauritius.webp${CACHE_V}`],
  ['摩洛哥', 0, 'MOROCCO', 'https://images.unsplash.com/photo-1489493585363-d69421e0edd3?q=80&w=1200']
];
cleanAfList.forEach(([n,c,en,img], i) => addD(`w_af_${i}`, n as string, en as string, '非洲', c as number, img as string, (c as number > 0 ? getProducts(n as string) : []), (c as number > 0 ? 'arrived' : 'locked')));

const amList = [
  ['美国', 7, 'USA', 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=1200'], 
  ['墨西哥', 4, 'MEXICO', `${RAW_DEST}Mexico.webp${CACHE_V}`], 
  ['巴西', 8, 'BRAZIL', `${RAW_DEST}Brazil.webp${CACHE_V}`], 
  ['阿根廷', 1, 'ARGENTINA', `${RAW_DEST}Argentina.webp${CACHE_V}`], 
  ['海地', 0, 'HAITI', `${RAW_DEST}Haiti.webp${CACHE_V}`],
  ['加拿大', 0, 'CANADA', 'https://images.unsplash.com/photo-1503614472-8c93d56e92ce?q=80&w=1200'],
  ['秘鲁', 0, 'PERU', 'https://images.unsplash.com/photo-1526392060635-9d6019884377?q=80&w=1200'],
  ['澳大利亚', 0, 'AUSTRALIA', 'https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?q=80&w=1200'],
  ['南极洲', 0, 'ANTARCTICA', 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=1200'],
  ['古巴', 0, 'CUBA', 'https://images.unsplash.com/photo-1506461883276-594a12b11cf3?q=80&w=1200']
];
amList.forEach(([n,c,en,img], i) => addD(`w_am_${i}`, n as string, en as string, '美洲/大洋洲', c as number, img as string, (c as number > 0 ? getProducts(n as string) : []), (c as number > 0 ? 'arrived' : 'locked')));

Object.entries({
  '西南': ['四川', '云南', '西藏', '贵州', '重庆'],
  '西北': ['新疆', '甘肃', '陕西', '宁夏', '青海'],
  '华南': ['广东', '福建', '海南', '广西'],
  '华东': ['浙江', '江苏', '上海', '安徽', '江西', '山东', '台湾'],
  '华北': ['北京', '天津', '河北', '山西', '内蒙古'],
  '华中': ['河南', '湖北', '湖南'],
  '东北': ['辽宁', '吉林', '黑龙江']
}).forEach(([sub, list]) => {
  list.forEach((prov) => {
    const visits = Math.floor(Math.random() * 5) + 2; 
    addD(`cn_${prov}`, prov, prov.toUpperCase(), '亚洲', visits, REGION_VISUALS.china, getProducts(prov), 'arrived', true, sub);
  });
});

export const ASSET_REGISTRY = { brand: { logo: ASSETS.logo, xhs_link: ASSETS.xhs_link } };
export const PRODUCT_OVERRIDES: Record<string, string> = {};
