import { ScentItem, Destination } from './types';

const fixGitHubUrl = (url: string) => url.replace('github.com', 'raw.githubusercontent.com').replace('/blob/', '/');
const RAW_BASE = 'https://raw.githubusercontent.com/2008zxeric/unio-aroma/main/assets/';
const CACHE_V = '?v=130.0'; 

export const ASSETS = {
  logo: fixGitHubUrl(`${RAW_BASE}brand/logo.svg${CACHE_V}`),
  xhs_link: 'https://xhslink.com/m/AcZDZuYhsVd',
  hero_zen: 'https://images.unsplash.com/photo-1502082553048-f009c37129b9?q=80&w=1920',
  hero_forest: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?q=80&w=1920',
  // 实验室视觉：锁定用户提供的 GitHub banner
  lab_visual: 'https://raw.githubusercontent.com/2008zxeric/unio-aroma/main/assets/brand/banner.webp' + CACHE_V, 
  lavender_field: 'https://images.unsplash.com/photo-1471958680802-1345a694ba6d?q=80&w=1920',
  placeholder: 'https://images.unsplash.com/photo-1540555700478-4be289fbecee?q=80&w=800'
};

export const REGION_VISUALS = {
  // 优化：神州背景图换成更有禅意的自然景观（桂林山水风格）
  china: 'https://images.unsplash.com/photo-1596497062271-0672d5db1639?q=80&w=1200',
  asia: 'https://images.unsplash.com/photo-1528127269322-539801943592?q=80&w=600',
  europe: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?q=80&w=600',
  africa: 'https://images.unsplash.com/photo-1516026672322-bc52d61a55d5?q=80&w=600',
  america: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=600'
};

const RAW_PROD = `${RAW_BASE}products/`;
export const DATABASE: Record<string, ScentItem> = {};

const addP = (cat: 'yuan'|'he'|'jing', group: string, n: string, en: string, folder: string, id: string, customImg?: string) => {
  const filename = en.replace(/\s/g, '%20');
  DATABASE[id] = {
    id, category: cat, subGroup: group, name: n, herb: n, herbEn: en.toUpperCase().trim(),
    region: 'Extreme Origin', status: 'arrived_origin', visited: true, accent: '#D75437',
    hero: customImg || fixGitHubUrl(`${RAW_PROD}${folder}/${filename}.webp${CACHE_V}`),
    shortDesc: cat === 'yuan' ? '极境寻获 / Eric 亲手采集' : '一人一方 / Alice 手工调配', 
    narrative: cat === 'he' ? `“这是 Alice 为你调制的唯一。Eric 跨越万里带回的 ${n} 分子，在实验室中重组为属于你的频率。”` : `“Eric 在极境中感受到了 ${n} 的顽强意志。它是大自然在极端环境下的生存智慧。”`,
    benefits: ['深度平衡', '频率重构', '觉知开启'], 
    usage: '滴于掌心或扩香器中，深度嗅吸。', 
    precautions: '元香全线坚持非工业化生产，高纯度精油请稀释使用。',
    ericDiary: `寻香第十载。我在极境中亲手采集了 ${n}，那一刻的震颤至今难忘。`, 
    aliceDiary: `Eric 采集的这批 ${n} 能量极强。我决定采用一人一方的定制逻辑，保留其原始温度。`,
    aliceLabDiary: `GC/MS 分析验证了其非凡的分子结构。这是我们对抗工业化平庸的最佳证明。`, 
    recommendation: '元香核心馆藏 / 限量手工调配。'
  } as ScentItem;
};

// --- 全量元系列回归 (25) ---
addP('yuan','元 · 肃降 (Metal)','神圣乳香','Sacred Frankincense','metal','yuan_metal_0');
addP('yuan','元 · 肃降 (Metal)','极境薄荷','Peppermint from Peaks','metal','yuan_metal_1');
addP('yuan','元 · 肃降 (Metal)','极境尤加利',' Eucalyptus Glaciale','metal','yuan_metal_2');
addP('yuan','元 · 肃降 (Metal)','极境茶树','Tea Tree Antiseptic','metal','yuan_metal_3');
addP('yuan','元 · 肃降 (Metal)','极境香茅','Citronella Clarissima','metal','yuan_metal_4');
addP('yuan','元 · 生发 (Wood)','老山檀香','Aged Sandalwood','wood','yuan_wood_0');
addP('yuan','元 · 生发 (Wood)','极境丝柏','Misty Cypress','wood','yuan_wood_1');
addP('yuan','元 · 生发 (Wood)','极境雪松','Himalayan Cedar','wood','yuan_wood_2');
addP('yuan','元 · 生发 (Wood)','极境松针','Boreal Pine','wood','yuan_wood_3');
addP('yuan','元 · 生发 (Wood)','神圣花梨木','Sacred Rosewood Isle','wood','yuan_wood_4');
addP('yuan','元 · 润泽 (Water)','极境杜松','Juniper by the Loch','water','yuan_water_0');
addP('yuan','元 · 润泽 (Water)','深根岩兰草','Deep Root Vetiver','water','yuan_water_1');
addP('yuan','元 · 润泽 (Water)','暗夜广藿香','Patchouli Nocturne','water','yuan_water_2');
addP('yuan','元 · 润泽 (Water)','极境没药','Myrrh Secreta','water','yuan_water_3');
addP('yuan','元 · 润泽 (Water)','极境安息香','Benzoin Ambrosia','water','yuan_water_4');
addP('yuan','元 · 释放 (Fire)','大马士革玫瑰','Damask Rose Aureate','fire','yuan_fire_0');
addP('yuan','元 · 释放 (Fire)','极境依兰','Ylang Equatorial','fire','yuan_fire_1');
addP('yuan','元 · 释放 (Fire)','大花茉莉','Jasminum Grandiflorum','fire','yuan_fire_2');
addP('yuan','元 · 释放 (Fire)','日光橙花','Neroli Soleil','fire','yuan_fire_3');
addP('yuan','元 · 释放 (Fire)','极境天竺葵','Geranium Rosé','fire','yuan_fire_4');
addP('yuan','元 · 稳定 (Earth)','佛手柑','Bergamot Alba','earth','yuan_earth_0');
addP('yuan','元 · 稳定 (Earth)','横断生姜','Zingiber Terrae','earth','yuan_earth_1');
addP('yuan','元 · 稳定 (Earth)','极境红橘','Mandarin Jucunda','earth','yuan_earth_2');
addP('yuan','元 · 稳定 (Earth)','极境葡萄柚','Grapefruit Pomona','earth','yuan_earth_3');
addP('yuan','元 · 稳定 (Earth)','极境橡木苔','Oakmoss Taiga','earth','yuan_earth_4');

// --- 全量香系列回归 (15) ---
addP('he','香 · 能量 (Body)','云感霜','cloud velvet','body','he_body_0');
addP('he','香 · 能量 (Body)','晨曦液','Dawn Glow','body','he_body_1');
addP('he','香 · 能量 (Body)','月华油','Moonlight Oil','body','he_body_2');
addP('he','香 · 能量 (Body)','清冽发','Frost Mint','body','he_body_3');
addP('he','香 · 能量 (Body)','润迹膏','Trace Balm','body','he_body_4');
addP('he','香 · 愈合 (Mind)','止语雾','Silent Mist','mind','he_mind_0');
addP('he','香 · 愈合 (Mind)','归处膏','Sanctuary','mind','he_mind_1');
addP('he','香 · 愈合 (Mind)','听泉露','Zen Fountain','mind','he_mind_2');
addP('he','香 · 愈合 (Mind)','微光氛','Glimmer','mind','he_mind_3');
addP('he','香 · 愈合 (Mind)','深吸瓶','Deep Breath','mind','he_mind_4');
addP('he','香 · 觉知 (Soul)','无界油','Boundless','soul','he_soul_0');
addP('he','香 · 觉知 (Soul)','悬浮露','Floating','soul','he_soul_1');
addP('he','香 · 觉知 (Soul)','破晓珠','Daybreak','soul','he_soul_2');
addP('he','香 · 觉知 (Soul)','空寂水','Void Moss','soul','he_soul_3');
addP('he','香 · 共振方 (Soul)','共振方','Resonant','soul','he_soul_4');

// --- 全量境系列回归 (10) ---
addP('jing','境 · 场域之物 (Place)','陶瓷皿','Crackled','place','jing_place_0');
addP('jing','境 · 场域之物 (Place)','芳香链','Necklace ','place','jing_place_1');
addP('jing','境 · 场域之物 (Place)','木核扩','Walnut','place','jing_place_2');
addP('jing','境 · 场域之物 (Place)','蜡烛','candle','place','jing_place_3');
addP('jing','境 · 场域之物 (Place)','存香瓶','Vessel','place','jing_place_4');
addP('jing','境 · 冥想之物 (Meditation)','一柱香','Incense Sticks','Meditation','jing_meditation_0');
addP('jing','境 · 冥想之物 (Meditation)','觉知珠','Rollerball','Meditation','jing_meditation_1');
addP('jing','境 · 冥想之物 (Meditation)','清空石','Gypsum','Meditation','jing_meditation_2');
addP('jing','境 · 冥想之物 (Meditation)','归真座','mountain','Meditation','jing_meditation_3');
addP('jing','境 · 冥想之物 (Meditation)','承露璃','glass','Meditation','jing_meditation_4');

const RAW_DEST = `${RAW_BASE}destinations/`;
const RAW_ALBUM = `${RAW_BASE}Ericalbum/`;
export const DESTINATIONS: Record<string, Destination> = {};

const getAlbumAsset = (country: string, filename: string) => fixGitHubUrl(`${RAW_ALBUM}${country}/${filename}.webp${CACHE_V}`);
const getDestAsset = (name: string) => fixGitHubUrl(`${RAW_DEST}${name.replace(/\s/g, '%20')}.webp${CACHE_V}`);

const addD = (id:string, n:string, en:string, reg:string, c:number, img:string, s:'arrived'|'locked'='arrived', isCN:boolean=false, sub?:string, herbInfo:string='极境原生分子', customPhotos?: string[])=>{
  DESTINATIONS[id] = {
    id, name:n, en: en.trim(), region:reg.trim(), status:s, visitCount:c, scenery:img, emoji:'📍',
    herbDescription: herbInfo, knowledge:'已存入元香寻香库', productIds:[], isChinaProvince:isCN, subRegion:sub ? sub.trim() : undefined,
    ericDiary:`Eric 寻香志：第 ${c} 次来到 ${n}。这是 Alice 特别嘱托的极境，为了寻找那抹独一无二的灵性本草。`, 
    aliceDiary:`实验室档案：Eric 从 ${n} 带回的样本在 GC/MS 分析中表现惊人。一人一方的调配理念将在此升华。`, 
    memoryPhotos: customPhotos || [img, img, img]
  };
};

// --- 全量全球目的地回归 ---
addD('w_thai','泰国','THAILAND','亚洲',40,'https://images.unsplash.com/photo-1528127269322-539801943592?q=80&w=1200','arrived');
addD('w_hk','中国香港','HONG KONG','亚洲',18, getDestAsset('Hongkong'));
addD('w_mac','中国澳门','MACAU','亚洲',2, 'https://images.unsplash.com/photo-1563245372-f21724e3856d');
addD('w_my','马来西亚','MALAYSIA','亚洲',13, getDestAsset('Malaysia'));
addD('w_id','印尼','INDONESIA','亚洲',12, 'https://images.unsplash.com/photo-1537996194471-e657df975ab4');
addD('w_uae','阿联酋','UAE','亚洲',12, 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c');
addD('w_vn','越南','VIETNAM','亚洲',6, 'https://images.unsplash.com/photo-1528127269322-539801943592');
addD('w_kz','哈萨克斯坦','KAZAKHSTAN','亚洲',4, 'https://images.unsplash.com/photo-1542273917363-3b1817f69a2d');
addD('w_india','印度','INDIA','亚洲',3, 'https://images.unsplash.com/photo-1514222134-b57cbb8ce073');
addD('w_japan','日本','JAPAN','亚洲',2, 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e');
addD('w_ir','伊朗','IRAN','亚洲',2, getDestAsset('Iran'));
addD('w_jo','约旦','JORDAN','亚洲',2, 'https://images.unsplash.com/photo-1547234935-80c7145ec969');
addD('w_kr','韩国','SOUTH KORED','亚洲',1, 'https://images.unsplash.com/photo-1517154421773-0529f29ea451');
addD('w_kp','朝鲜','NORTH KOREA','亚洲',1, getDestAsset('North Korea'));
addD('w_kh','柬埔寨','CAMBODIA','亚洲',1, 'https://images.unsplash.com/photo-1500048993953-d23a436266cf');
addD('w_sg','新加坡','SINGAPORE','亚洲',2, getDestAsset('Singapore'));
addD('w_tr','土耳其','TURKEY','欧洲',8,'https://images.unsplash.com/photo-1524231757912-21f4fe3a7200');
addD('w_pl','波兰','POLAND','欧洲',5, getDestAsset('Poland'));
addD('w_fr','法国','FRANCE','欧洲',5,'https://images.unsplash.com/photo-1499002238440-d264edd596ec');
addD('w_de','德国','GERMANY','欧洲',4,'https://images.unsplash.com/photo-1467269204594-9661b134dd2b');
addD('w_it','意大利','ITALY','欧洲',2,'https://images.unsplash.com/photo-1523906834658-6e24ef2386f9');
addD('w_at','奥地利','AUSTRIA','欧洲',2,'https://images.unsplash.com/photo-1527668752968-14dc70a27c95');
addD('w_dk','丹麦','DENMARK','欧洲',2,'https://images.unsplash.com/photo-1513622470522-26c3c8a854bc');
addD('w_hu','匈牙利','HUNGARY','欧洲',2,'https://images.unsplash.com/photo-1516306580123-e6e52b1b7b5f');
addD('w_nl','荷兰','NETHERLANDS','欧洲',1,'https://images.unsplash.com/photo-1468436385273-8abca6dfd8d3');
addD('w_es','西班牙','SPAIN','欧洲',1, getDestAsset('Spain'));
addD('w_mc','摩纳哥','MONACO','欧洲',1, getDestAsset('Monaco'));
addD('w_lu','卢森堡','LUXEMBOURG','欧洲',1, getDestAsset('Luxembourg'));
addD('w_ch','瑞士','SWITZERLAND','欧洲',2,'https://images.unsplash.com/photo-1516306580123-e6e52b1b7b5f');
addD('w_bg','保加利亚','BULGARIA','欧洲',0,'https://images.unsplash.com/photo-1524338198850-8a2ff63aaceb', 'locked');
addD('w_uk','英国','UNITED KINGDOM','欧洲',0,'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad', 'locked');
addD('w_pt','葡萄牙','PORTUGAL','欧洲',0,'https://images.unsplash.com/photo-1555881400-74d7acaacd8b', 'locked');
addD('w_hr','克罗地亚','CROATIA','欧洲',0,'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd', 'locked');
addD('w_gr','希腊','GREECE','欧洲',0,'https://images.unsplash.com/photo-1533105079780-92b9be482077', 'locked');
addD('w_be','比利时','BELGIUM','欧洲',1,'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad');
addD('w_no','挪威','NORWAY','欧洲',0,'https://images.unsplash.com/photo-1516306580123-e6e52b1b7b5f','locked');
addD('w_se','瑞典','SWEDEN','欧洲',0,'https://images.unsplash.com/photo-1513622470522-26c3c8a854bc','locked');
addD('w_za','南非','SOUTH AFRICA','非洲',12,'https://images.unsplash.com/photo-1516026672322-bc52d61a55d5');
addD('w_mg','马达加斯加','MADAGASCAR','非洲',4, getDestAsset('Madagascar'));
addD('w_eg','埃及','EGYPT','非洲',2, getDestAsset('Egypt'));
addD('w_ke','肯尼亚','KENYA','非洲',2, getDestAsset('Kenya'));
addD('w_zw','津巴布韦','ZIMBABWE','非洲',1,'https://images.unsplash.com/photo-1516426122078-c23e76319801');
addD('w_ma','摩洛哥','MOROCCO','非洲',0, 'https://images.unsplash.com/photo-1539020140153-e479b8c22e70', 'locked');
addD('w_br','巴西','BRAZIL','美洲/大洋洲',8,'https://images.unsplash.com/photo-1483728642387-6c3bdd6c93e5');
addD('w_us','美国','USA','美洲/大洋洲',7,'https://images.unsplash.com/photo-1485738422979-f5c462d49f74');
addD('w_ar','阿根廷','ARGENTINA','美洲/大洋洲',5, getDestAsset('Argentina'));
addD('w_mx','墨西哥','MEXICO','美洲/大洋洲',4, getDestAsset('Mexico'));
addD('w_ht','海地','HAITI','美洲/大洋洲',3, getDestAsset('Haiti'));
addD('w_au','澳大利亚','AUSTRALIA','美洲/大洋洲',0,'https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9', 'locked');
addD('w_ant','南极洲','ANTARCTICA','美洲/大洋洲',0,'https://images.unsplash.com/photo-1483168527879-c66136b56105', 'locked');

// --- 全量神州坐标回归 ---
// 优化：四川默认图换成纯净的自然风景（九寨沟风格）
addD('cn_四川','四川','SICHUAN','亚洲',5,'https://images.unsplash.com/photo-1610450919934-23001d0f3134?q=80&w=1200','arrived',true,'西南');
addD('cn_云南','云南','YUNNAN','亚洲',5,'https://images.unsplash.com/photo-1521405924368-64c5b84bec60','arrived',true,'西南');
addD('cn_西藏','西藏','TIBET','亚洲',5,'https://images.unsplash.com/photo-1534067783941-51c9c23ecefd','arrived',true,'西南');
addD('cn_贵州','贵州','GUIZHOU','亚洲',5,'https://images.unsplash.com/photo-1558238792-881c15f98896','arrived',true,'西南');
addD('cn_重庆','重庆','CHONGQING','亚洲',5,'https://images.unsplash.com/photo-1502404733198-44b0559ac643','arrived',true,'西南');
addD('cn_新疆','新疆','XINJIANG','亚洲',5,'https://images.unsplash.com/photo-1542273917363-3b1817f69a2d','arrived',true,'西北');
addD('cn_甘肃','甘肃','GANSU','亚洲',5,'https://images.unsplash.com/photo-1544735716-392fe2489ffa','arrived',true,'西北');
addD('cn_陕西','陕西','SHAANXI','亚洲',5,'https://images.unsplash.com/photo-1546857186-b4d08122d104','arrived',true,'西北');
addD('cn_宁夏','宁夏','NINGXIA','亚洲',5,'https://images.unsplash.com/photo-1542382156909-9ae37b3f56fd','arrived',true,'西北');
addD('cn_青海','青海','QINGHAI','亚洲',5,'https://images.unsplash.com/photo-1534067783941-51c9c23ecefd','arrived',true,'西北');
addD('cn_广东','广东','GUANGDONG','亚洲',5,'https://images.unsplash.com/photo-1540962351504-03099e0a754b','arrived',true,'华南');
addD('cn_福建','福建','FUJIAN','亚洲',5,'https://images.unsplash.com/photo-1546857186-b4d08122d104','arrived',true,'华南');
addD('cn_海南','海南','HAINAN','亚洲',5,'https://images.unsplash.com/photo-1582234033306-03c7e4745856','arrived',true,'华南');
addD('cn_广西','广西','GUANGXI','亚洲',5,'https://images.unsplash.com/photo-1543163521-1bf539c55dd2','arrived',true,'华南');
addD('cn_浙江','浙江','ZHEJIANG','亚洲',5,'https://images.unsplash.com/photo-1555543183-8380302b1156','arrived',true,'华东');
addD('cn_江苏','江苏','JIANGSU','亚洲',5,'https://images.unsplash.com/photo-1542382156909-9ae37b3f56fd','arrived',true,'华东');
addD('cn_上海','上海','SHANGHAI','亚洲',5,'https://images.unsplash.com/photo-1474181487882-5abf3f0ba6c2','arrived',true,'华东');
addD('cn_安徽','安徽','ANHUI','亚洲',5,'https://images.unsplash.com/photo-1554141630-d3923d6a9978','arrived',true,'华东');
addD('cn_山东','山东','SHANDONG','亚洲',5,'https://images.unsplash.com/photo-1551609189-eba71b3a8566','arrived',true,'华东');
addD('cn_江西','江西','JIANGXI','亚洲',5,'https://images.unsplash.com/photo-1533038590840-1cde6b66b721','arrived',true,'华东');
addD('cn_北京','北京','BEIJING','亚洲',5,'https://images.unsplash.com/photo-1508804185872-d7badad00f7d','arrived',true,'华北');
addD('cn_山西','山西','SHANXI','亚洲',5,'https://images.unsplash.com/photo-1547949003-9792a18a2601','arrived',true,'华北');
addD('cn_河北','河北','HEBEI','亚洲',5,'https://images.unsplash.com/photo-1545625032-4114407b7136','arrived',true,'华北');
addD('cn_天津','天津','TIANJIN','亚洲',5,'https://images.unsplash.com/photo-1542031759174-8217dd1119ca','arrived',true,'华北');
addD('cn_内蒙古','内蒙古','INNER MONGOLIA','亚洲',5,'https://images.unsplash.com/photo-1547949003-9792a18a2601','arrived',true,'华北');
addD('cn_湖南','湖南','HUNAN','亚洲',5,'https://images.unsplash.com/photo-1548235212-04533da82d33','arrived',true,'华中');
addD('cn_湖北','湖北','HUBEI','亚洲',5,'https://images.unsplash.com/photo-1547038577-da80abbc4f19','arrived',true,'华中');
addD('cn_河南','河南','HENAN','亚洲',5,'https://images.unsplash.com/photo-1547949003-9792a18a2601','arrived',true,'华中');

export const ASSET_REGISTRY = {
  brand: { logo: ASSETS.logo, xhs_link: ASSETS.xhs_link },
  visual_anchors: { placeholder: ASSETS.placeholder }
};

export const PRODUCT_OVERRIDES: Record<string, string> = {};
