import { ScentItem, Destination } from './types';

const fixGitHubUrl = (url: string) => {
  if (!url) return '';
  return url.replace('github.com', 'raw.githubusercontent.com').replace('/blob/', '/');
};

const RAW_BASE = 'https://raw.githubusercontent.com/2008zxeric/unio-aroma/main/assets/';
const CACHE_V = '?v=139.0'; 

export const ASSETS = {
  logo: `${RAW_BASE}brand/logo.svg${CACHE_V}`,
  xhs_link: 'https://xhslink.com/m/AcZDZuYhsVd',
  hero_zen: 'https://images.unsplash.com/photo-1502082553048-f009c37129b9?q=80&w=1920',
  hero_forest: fixGitHubUrl('https://github.com/2008zxeric/unio-aroma/blob/main/assets/brand/banner.webp') + CACHE_V,
  lab_visual: `${RAW_BASE}brand/banner.webp${CACHE_V}`, 
  lavender_field: 'https://images.unsplash.com/photo-1471958680802-1345a694ba6d?q=80&w=1920',
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

export const DATABASE: Record<string, ScentItem> = {};
export const DESTINATIONS: Record<string, Destination> = {};

const addP = (cat: 'yuan'|'he'|'jing', group: string, n: string, en: string, folder: string, id: string, customImg?: string) => {
  const filename = en.replace(/\s/g, '%20');
  DATABASE[id] = {
    id, category: cat, subGroup: group, name: n, herb: n, herbEn: en.toUpperCase().trim(),
    region: 'Extreme Origin', status: 'arrived_origin', visited: true, accent: '#D75437',
    hero: customImg || `${RAW_PROD}${folder}/${filename}.webp${CACHE_V}`,
    shortDesc: cat === 'yuan' ? '极境寻获 / Eric 亲手采集' : '一人一方 / Alice 手工调配', 
    narrative: cat === 'he' ? `“这是 Alice 为你调制的唯一。Eric 跨越万里带回的 ${n} 分子，在实验室中重组为属于你的频率。”` : `“Eric 在极境中感受到了 ${n} 的顽强意志。它是大自然在极端环境下的生存智慧。”`,
    benefits: ['深度平衡', '频率重构', '觉知开启'], 
    usage: '滴于掌心或扩香器中，深度嗅吸。', 
    precautions: '元和 unio 全线坚持非工业化生产，高纯度精油请稀释使用。',
    ericDiary: `寻香第十载。我在极境中亲手采集了 ${n}，那一刻的震颤至今难忘。极境的生存防御智慧，终将化作你内心的宁静。`, 
    aliceDiary: `Eric 采集的这批 ${n} 能量极强。我决定采用一人一方的定制逻辑，保留其原始温度。`,
    aliceLabDiary: `GC/MS 分析验证了其非凡的分子结构。这是我们对抗工业化平庸的最佳证明。`, 
    recommendation: '元和 unio 核心馆藏 / 限量手工调配。'
  } as ScentItem;
};

const addD = (id:string, n:string, en:string, reg:string, c:number, img:string, pIds: string[] = [], s:'arrived'|'locked'='arrived', isCN:boolean=false, sub?:string)=>{
  DESTINATIONS[id] = {
    id, name:n, en: en.trim(), region:reg.trim(), status:s, visitCount:c, scenery:img, emoji:'📍',
    herbDescription: '极境原生分子', knowledge:'已存入元和 unio 寻香库', productIds: pIds, isChinaProvince:isCN, subRegion:sub,
    ericDiary:`Eric 寻香志：第 ${c} 次来到 ${n}。这是寻香的极境，为了寻找那抹独一无二的极境本草。极境的生存防御智慧，终将化作你内心的宁静。`, 
    aliceDiary:`实验室档案：Eric 从 ${n} 带回的样本分子结构极其稳定。我们尝试在“一人一方”的理念下，将其能量完整保留。`, 
    memoryPhotos: [img, img, img]
  };
};

const JING_ALL = ['jing_place_0', 'jing_place_1', 'jing_place_2', 'jing_place_3', 'jing_place_4', 'jing_meditation_0', 'jing_meditation_1', 'jing_meditation_2', 'jing_meditation_3', 'jing_meditation_4'];

// --- 50 款产品核心定义 ---
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
addP('yuan','元 · 润泽 (Water)','极境没药','Myrrh Secreta','water','yuan_water_3');
addP('yuan','元 · 润泽 (Water)','深根岩兰草','Deep Root Vetiver','water','yuan_water_1');
addP('yuan','元 · 润泽 (Water)','暗夜广藿香','Patchouli Nocturne','water','yuan_water_2');
addP('yuan','元 · 润泽 (Water)','极境杜松','Juniper by the Loch','water','yuan_water_0');
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
addP('he','香 · 觉知 (Soul)','共振方','Resonant','soul','he_soul_4');
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

// --- 全球极境 52 个目的地定义 ---
// 亚洲
addD('w_thai','泰国','THAILAND','亚洲',40,'https://images.unsplash.com/photo-1528127269322-539801943592?q=80&w=1200', ['yuan_metal_4', 'he_mind_2', ...JING_ALL]);
addD('w_in','印度','INDIA','亚洲',3,'https://images.unsplash.com/photo-1506461883276-594a12b11cf3?q=80&w=1200', ['yuan_water_1']);
addD('w_hk','中国香港','HONG KONG','亚洲',18, `${RAW_DEST}Hongkong.webp${CACHE_V}`, ['he_body_0', 'he_mind_0', ...JING_ALL]);
addD('w_my','马来西亚','MALAYSIA','亚洲',13, `${RAW_DEST}Malaysia.webp${CACHE_V}`, ['yuan_water_2']);
addD('w_id','印尼','INDONESIA','亚洲',12, 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?q=80&w=1200', ['yuan_water_2']);
addD('w_uae','阿联酋','UAE','亚洲',12, 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?q=80&w=1200', ['yuan_metal_0']);
addD('w_vn','越南','VIETNAM','亚洲',6, 'https://images.unsplash.com/photo-1528127269322-539801943592?q=80&w=1200', ['yuan_water_4']);
addD('w_kz','哈萨克斯坦','KAZAKHSTAN','亚洲',4, 'https://images.unsplash.com/photo-1563245372-f21724e3856d?q=80&w=1200');
addD('w_jp','日本','JAPAN','亚洲',2, 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?q=80&w=1200', ['yuan_wood_0']);
addD('w_ir','伊朗','IRAN','亚洲',2, `${RAW_DEST}Iran.webp${CACHE_V}`);
addD('w_jo','约旦','JORDAN','亚洲',2, 'https://images.unsplash.com/photo-1547038577-da80abbc4f19?q=80&w=1200');
addD('w_mac','中国澳门','MACAU','亚洲',2, 'https://images.unsplash.com/photo-1542031759174-8217dd1119ca?q=80&w=1200');
addD('w_sg','新加坡','SINGAPORE','亚洲',2, `${RAW_DEST}Singapore.webp${CACHE_V}`);
addD('w_kr','韩国','SOUTH KOREA','亚洲',1, 'https://images.unsplash.com/photo-1543158266-0066955047b1?q=80&w=1200');
addD('w_kh','柬埔寨','CAMBODIA','亚洲',1, 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?q=80&w=1200');
addD('w_kp','朝鲜','NORTH KOREA','亚洲',1, `${RAW_DEST}North%20Korea.webp${CACHE_V}`);
addD('w_sl','斯里兰卡','SRI LANKA','亚洲',0, 'https://images.unsplash.com/photo-1542382156909-9ae37b3f56fd?q=80&w=1200', [], 'locked');
addD('w_np','尼泊尔','NEPAL','亚洲',0, 'https://images.unsplash.com/photo-1534067783941-51c9c23ecefd?q=80&w=1200', [], 'locked');

// 欧洲
addD('w_tr','土耳其','TURKEY','欧洲',8, 'https://images.unsplash.com/photo-1523906834658-6e24ef2386f9?q=80&w=1200', ['yuan_fire_0']);
addD('w_fr','法国','FRANCE','欧洲',5, 'https://images.unsplash.com/photo-1499002238440-d264edd596ec?q=80&w=1200', ['yuan_fire_0']);
addD('w_pl','波兰','POLAND','欧洲',5, `${RAW_DEST}Poland.webp${CACHE_V}`);
addD('w_de','德国','GERMANY','欧洲',4, 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?q=80&w=1200');
addD('w_it','意大利','ITALY','欧洲',2, 'https://images.unsplash.com/photo-1523906834658-6e24ef2386f9?q=80&w=1200', ['yuan_earth_0']);
addD('w_at','奥地利','AUSTRIA','欧洲',2, 'https://images.unsplash.com/photo-1510368153435-08e08d132626?q=80&w=1200');
addD('w_dk','丹麦','DENMARK','欧洲',2, 'https://images.unsplash.com/photo-1505322033502-1f4385692e6a?q=80&w=1200');
addD('w_hu','匈牙利','HUNGARY','欧洲',2, 'https://images.unsplash.com/photo-1474181487882-5abf3f0ba6c2?q=80&w=1200');
addD('w_es','西班牙','SPAIN','欧洲',1, `${RAW_DEST}Spain.webp${CACHE_V}`);
addD('w_nl','荷兰','NETHERLANDS','欧洲',1, 'https://images.unsplash.com/photo-1511632765486-a01980e01a18?q=80&w=1200');
addD('w_mc','摩纳哥','MONACO','欧洲',1, `${RAW_DEST}Monaco.webp${CACHE_V}`);
addD('w_lu','卢森堡','LUXEMBOURG','欧洲',1, `${RAW_DEST}Luxembourg.webp${CACHE_V}`);
addD('w_bg','保加利亚','BULGARIA','欧洲',0, 'https://images.unsplash.com/photo-1554141630-d3923d6a9978?q=80&w=1200', [], 'locked');
addD('w_uk','英国','UNITED KINGDOM','欧洲',0, 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?q=80&w=1200', [], 'locked');
addD('w_pt','葡萄牙','PORTUGAL','欧洲',0, 'https://images.unsplash.com/photo-1523906834658-6e24ef2386f9?q=80&w=1200', [], 'locked');
addD('w_hr','克罗地亚','CROATIA','欧洲',0, 'https://images.unsplash.com/photo-1499002238440-d264edd596ec?q=80&w=1200', [], 'locked');
addD('w_gr','希腊','GREECE','欧洲',0, 'https://images.unsplash.com/photo-1533105079780-92b9be482077?q=80&w=1200', [], 'locked');

// 非洲
addD('w_za','南非','SOUTH AFRICA','非洲',12, 'https://images.unsplash.com/photo-1523805081730-614449274055?q=80&w=1200');
addD('w_eg','埃及','EGYPT','非洲',2, `${RAW_DEST}Egypt.webp${CACHE_V}`, ['yuan_fire_2']);
addD('w_ke','肯尼亚','KENYA','非洲',2, `${RAW_DEST}Kenya.webp${CACHE_V}`);
addD('w_zw','津巴布韦','ZIMBABWE','非洲',1, 'https://images.unsplash.com/photo-1516026672322-bc52d61a55d5?q=80&w=1200');
addD('w_mg','马达加斯加','MADAGASCAR','非洲',0, `${RAW_DEST}Madagascar.webp${CACHE_V}`, [], 'locked');
addD('w_ma','摩洛哥','MOROCCO','非洲',0, 'https://images.unsplash.com/photo-1539020140153-e479b8c23e70?q=80&w=1200', [], 'locked');

// 美洲
addD('w_us','美国','UNITED STATES','美洲/大洋洲',7, 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=1200');
addD('w_mx','墨西哥','MEXICO','美洲/大洋洲',4, `${RAW_DEST}Mexico.webp${CACHE_V}`);
addD('w_ht','海地','HAITI','美洲/大洋洲',0, `${RAW_DEST}Haiti.webp${CACHE_V}`, [], 'locked');
addD('w_br','巴西','BRAZIL','美洲/大洋洲',8, 'https://images.unsplash.com/photo-1440615490326-89a7f04ee613?q=80&w=1200');
addD('w_ar','阿根廷','ARGENTINA','美洲/大洋洲',0, `${RAW_DEST}Argentina.webp${CACHE_V}`, [], 'locked');

// 大洋洲
addD('w_au','澳大利亚','AUSTRALIA','美洲/大洋洲',0, 'https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?q=80&w=1200', [], 'locked');

// 南极洲
addD('w_ant','南极洲','ANTARCTICA','美洲/大洋洲',0, 'https://images.unsplash.com/photo-1516738901171-8eb4fc13bd20?q=80&w=1200', [], 'locked');

// --- 中华神州 34 个省级行政区 ---
const CN_REGIONS = {
  '西南': ['四川', '云南', '西藏', '贵州', '重庆'],
  '西北': ['新疆', '甘肃', '陕西', '宁夏', '青海'],
  '华南': ['广东', '福建', '海南', '广西'],
  '华东': ['浙江', '江苏', '上海', '安徽', '江西', '山东', '台湾'],
  '华北': ['北京', '天津', '河北', '山西', '内蒙古'],
  '华中': ['河南', '湖北', '湖南'],
  '东北': ['辽宁', '吉林', '黑龙江']
};

Object.entries(CN_REGIONS).forEach(([sub, list]) => {
  list.forEach(prov => {
    addD(`cn_${prov}`, prov, prov.toUpperCase(), '亚洲', 10, 'https://images.unsplash.com/photo-1508804185872-d7badad00f7d?q=80&w=1200', [], 'arrived', true, sub);
  });
});

export const ASSET_REGISTRY = {
  brand: { logo: ASSETS.logo, xhs_link: ASSETS.xhs_link },
  visual_anchors: { placeholder: ASSETS.placeholder }
};

export const PRODUCT_OVERRIDES: Record<string, string> = {};
