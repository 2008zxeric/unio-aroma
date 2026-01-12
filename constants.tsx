import { ScentItem, Destination } from './types';

const fixGitHubUrl = (url: string) => url.replace('github.com', 'raw.githubusercontent.com').replace('/blob/', '/');
const RAW_BASE = 'https://raw.githubusercontent.com/2008zxeric/unio-aroma/main/assets/';
const CACHE_V = '?v=110.5'; 

export const ASSETS = {
  logo: fixGitHubUrl(`${RAW_BASE}brand/logo.svg${CACHE_V}`),
  xhs_link: 'https://xhslink.com/m/AcZDZuYhsVd',
  hero_zen: 'https://images.unsplash.com/photo-1502082553048-f009c37129b9?q=80&w=1920',
  hero_forest: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?q=80&w=1200',
  placeholder: 'https://images.unsplash.com/photo-1540555700478-4be289fbecee?q=80&w=800'
};

export const ASSET_REGISTRY = {
  brand: { logo: ASSETS.logo, xhs_link: ASSETS.xhs_link },
  visual_anchors: { placeholder: ASSETS.placeholder }
};

/**
 * 1. 50款馆藏矩阵 (元 25, 香 15, 境 10)
 */
const RAW_PROD = `${RAW_BASE}products/`;
export const DATABASE: Record<string, ScentItem> = {};

const addP = (cat: 'yuan'|'he'|'jing', group: string, n: string, en: string, folder: string, id: string) => {
  const filename = en.replace(/\s/g, '%20');
  DATABASE[id] = {
    id, category: cat, subGroup: group, name: n, herb: n, herbEn: en.toUpperCase(),
    region: 'Extreme Origin', status: 'arrived_origin', visited: true, accent: '#D75437',
    hero: fixGitHubUrl(`${RAW_PROD}${folder}/${filename}.webp${CACHE_V}`),
    shortDesc: '拾载寻香馆藏 / 100% PURE', narrative: `“擷取 ${n} 在極境中的生存意志。”`,
    benefits: ['深度平衡', '频率重构', '觉知开启'], usage: '滴于掌心或扩香器中，深度嗅吸。', precautions: '高纯度精油请稀释使用。',
    ericDiary: `我在极境中亲手采集了 ${n}。`, aliceDiary: `实验室分析显示其成分极其纯净。`,
    aliceLabDiary: `GC/MS 分析显示 ${en} 分子活性极佳。`, recommendation: '元香核心馆藏。'
  };
};

// 元系列 (25) - 五行
const YUAN_G = ['元 · 肃降 (Metal)','元 · 生发 (Wood)','元 · 润泽 (Water)','元 · 释放 (Fire)','元 · 稳定 (Earth)'];
[['神圣乳香','Sacred Frankincense'],['极境薄荷','Peppermint from Peaks'],['极境尤加利','Eucalyptus Glaciale'],['极境茶树','Tea Tree Antiseptic'],['极境香茅','Citronella Clarissima']].forEach((d,i)=>addP('yuan',YUAN_G[0],d[0],d[1],'metal',`yuan_metal_${i}`));
[['老山檀香','Aged Sandalwood'],['极境丝柏','Misty Cypress'],['极境雪松','Himalayan Cedar'],['极境松针','Boreal Pine'],['神圣花梨木','Sacred Rosewood Isle']].forEach((d,i)=>addP('yuan',YUAN_G[1],d[0],d[1],'wood',`yuan_wood_${i}`));
[['极境杜松','Juniper by the Loch'],['深根岩兰草','Deep Root Vetiver'],['暗夜广藿香','Patchouli Nocturne'],['极境没药','Myrrh Secreta'],['极境安息香','Benzoin Ambrosia']].forEach((d,i)=>addP('yuan',YUAN_G[2],d[0],d[1],'water',`yuan_water_${i}`));
[['大马士革玫瑰','Damask Rose Aureate'],['极境依兰','Ylang Equatorial'],['大花茉莉','Jasminum Grandiflorum'],['日光橙花','Neroli Soleil'],['极境天竺葵','Geranium Rose']].forEach((d,i)=>addP('yuan',YUAN_G[3],d[0],d[1],'fire',`yuan_fire_${i}`));
[['佛手柑','Bergamot Alba'],['横断生姜','Zingiber Terrae'],['极境红橘','Mandarin Jucunda'],['极境葡萄柚','Grapefruit Pomona'],['极境橡木苔','Oakmoss Taiga']].forEach((d,i)=>addP('yuan',YUAN_G[4],d[0],d[1],'earth',`yuan_earth_${i}`));

// 香系列 (15) - 身心灵
const HE_G = ['香 · 能量 (Body)','香 · 愈合 (Mind)','香 · 觉知 (Soul)'];
[['云感霜','cloud velvet'],['晨曦液','Dawn Glow'],['月华油','Moonlight Oil'],['清冽发','Frost Mint'],['润迹膏','Trace Balm']].forEach((d,i)=>addP('he',HE_G[0],d[0],d[1],'body',`he_body_${i}`));
[['止语雾','Silent Mist'],['归处膏','Sanctuary'],['听泉露','Zen Fountain'],['微光氛','Glimmer'],['深吸瓶','Deep Breath']].forEach((d,i)=>addP('he',HE_G[1],d[0],d[1],'mind',`he_mind_${i}`));
[['无界油','Boundless'],['悬浮露','Floating'],['破晓珠','Daybreak'],['空寂水','Void Moss'],['共振方','Resonant']].forEach((d,i)=>addP('he',HE_G[2],d[0],d[1],'soul',`he_soul_${i}`));

// 境系列 (10) - 空间
const JING_G = ['境 · 场域之物 (Place)','境 · 冥想之物 (Meditation)'];
[['陶瓷皿','Crackled'],['矿石项','Necklace'],['木核扩','Walnut'],['蜡烛','candle'],['圣境机','Sacred Mist']].forEach((d,i)=>addP('jing',JING_G[0],d[0],d[1],'place',`jing_place_${i}`));
[['一柱香','Incense Sticks'],['觉知珠','Rollerball'],['清空石','Gypsum'],['归真座','mountain'],['承露璃','glass']].forEach((d,i)=>addP('jing',JING_G[1],d[0],d[1],'Meditation',`jing_meditation_${i}`));

/**
 * 2. 全球寻香坐标 (50+ 节点)
 */
export const DESTINATIONS: Record<string, Destination> = {};
const addD = (id:string, n:string, en:string, reg:string, c:number, img:string, s:'arrived'|'locked'='arrived', isCN:boolean=false, sub?:string, herbInfo:string='极境原生分子')=>{
  DESTINATIONS[id] = {
    id, name:n, en, region:reg, status:s, visitCount:c, scenery:img, emoji:'📍',
    herbDescription: herbInfo, knowledge:'已存入元香寻香库', productIds:[], isChinaProvince:isCN, subRegion:sub,
    ericDiary:'此处留下了我的寻香足迹，风中带着生命的坚韧。', aliceDiary:'此处本草活性极佳，分子结构呈现出完美的极境特征。', memoryPhotos:[img,img,img]
  };
};

// 亚洲 - 已探访 (准确次数)
addD('w_thai','泰国','THAILAND','亚洲',40,'https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?q=80&w=1200', 'arrived', false, '', '安息香、罗勒、香茅');
addD('w_india','印度','INDIA','亚洲',3,'https://images.unsplash.com/photo-1514222134-b57cbb8ce073?q=80&w=1200', 'arrived', false, '', '岩兰草、茉莉、檀香');
addD('w_japan','日本','JAPAN','亚洲',2,'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?q=80&w=1200', 'arrived', false, '', '桧木、柚子、扁柏');
addD('w_hk','中国香港','HONG KONG','亚洲',18,'https://images.unsplash.com/photo-1506353301451-4ae50907c3ff?q=80&w=1200', 'arrived', false, '', '芳香贸易与调香中心');
addD('w_my','马来西亚','MALAYSIA','亚洲',13,'https://images.unsplash.com/photo-1528181304800-2f140819898f?q=80&w=1200', 'arrived', false, '', '安息香');
addD('w_id','印尼','INDONESIA','亚洲',12,'https://images.unsplash.com/photo-1537996194471-e657df975ab4?q=80&w=1200', 'arrived', false, '', '广藿香、丁香、肉豆蔻');
addD('w_uae','阿联酋','UAE','亚洲',12,'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?q=80&w=1200', 'arrived', false, '', '没药、乳香');
addD('w_vn','越南','VIETNAM','亚洲',6,'https://images.unsplash.com/photo-1528127269322-539801943592?q=80&w=1200', 'arrived', false, '', '安息香、沉香');
addD('w_kz','哈萨克斯坦','KAZAKHSTAN','亚洲',4,'https://images.unsplash.com/photo-1542273917363-3b1817f69a2d?q=80&w=1200', 'arrived', false, '', '草原特色植物');
addD('w_ir','伊朗','IRAN','亚洲',2,'https://images.unsplash.com/photo-1566416410552-8777730e625a?q=80&w=1200', 'arrived', false, '', '藏红花、玫瑰');
addD('w_jo','约旦','JORDAN','亚洲',2,'https://images.unsplash.com/photo-1547234935-80c7145ec969?q=80&w=1200', 'arrived', false, '', '极境植物');
addD('w_mac','中国澳门','MACAU','亚洲',2,'https://images.unsplash.com/photo-1563245372-f21724e3856d?q=80&w=1200', 'arrived', false, '', '芳香文化节点');
addD('w_sg','新加坡','SINGAPORE','亚洲',2,'https://images.unsplash.com/photo-1525625239513-94c9da7f6a2f?q=80&w=1200', 'arrived', false, '', '芳香枢纽');
addD('w_kr','韩国','SOUTH KOREA','亚洲',1,'https://images.unsplash.com/photo-1517154421773-0529f29ea451?q=80&w=1200', 'arrived', false, '', '松针、竹子');
addD('w_kh','柬埔寨','CAMBODIA','亚洲',1,'https://images.unsplash.com/photo-1500048993953-d23a436266cf?q=80&w=1200', 'arrived', false, '', '香茅、卡南加');
addD('w_kp','朝鲜','NORTH KOREA','亚洲',1,'https://images.unsplash.com/photo-1558981403-c5f91cbba527?q=80&w=1200', 'arrived', false, '', '当地特色本草');

// 亚洲 - 待解锁
addD('w_lk','斯里兰卡','SRI LANKA','亚洲',0,'https://images.unsplash.com/photo-1529154036614-a60975f5c760?q=80&w=1200', 'locked', false, '', '肉桂、柠檬草');
addD('w_np','尼泊尔','NEPAL','亚洲',0,'https://images.unsplash.com/photo-1544735716-392fe2489ffa?q=80&w=1200', 'locked', false, '', '喜马拉雅雪松、穗甘松');

// 欧洲 - 已探访
addD('w_tr','土耳其','TURKEY','欧洲',8,'https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?q=80&w=1200', 'arrived', false, '', '玫瑰、月桂');
addD('w_pl','波兰','POLAND','欧洲',5,'https://images.unsplash.com/photo-1519197924294-119542bf1421?q=80&w=1200', 'arrived', false, '', '特色本草');
addD('w_fr','法国','FRANCE','欧洲',5,'https://images.unsplash.com/photo-1499002238440-d264edd596ec?q=80&w=1200', 'arrived', false, '', '格拉斯玫瑰、茉莉');
addD('w_de','德国','GERMANY','欧洲',4,'https://images.unsplash.com/photo-1467269204594-9661b134dd2b?q=80&w=1200', 'arrived', false, '', '洋甘菊、草药技术');
addD('w_it','意大利','ITALY','欧洲',2,'https://images.unsplash.com/photo-1523906834658-6e24ef2386f9?q=80&w=1200', 'arrived', false, '', '柠檬、迷迭香');
addD('w_at','奥地利','AUSTRIA','欧洲',2,'https://images.unsplash.com/photo-1527668752968-14dc70a27c95?q=80&w=1200', 'arrived', false, '', '当地植物');
addD('w_dk','丹麦','DENMARK','欧洲',2,'https://images.unsplash.com/photo-1513622470522-26c3c8a854bc?q=80&w=1200', 'arrived', false, '', '当地植物');
addD('w_hu','匈牙利','HUNGARY','欧洲',2,'https://images.unsplash.com/photo-1516306580123-e6e52b1b7b5f?q=80&w=1200', 'arrived', false, '', '薰衣草、鼠尾草');
addD('w_es','西班牙','SPAIN','欧洲',1,'https://images.unsplash.com/photo-1509840144521-88830abc04b0?q=80&w=1200', 'arrived', false, '', '苦橙、迷迭香');
addD('w_nl','荷兰','NETHERLANDS','欧洲',1,'https://images.unsplash.com/photo-1468436385273-8abca6dfd8d3?q=80&w=1200', 'arrived', false, '', '花卉贸易中心');
addD('w_mc','摩纳哥','MONACO','欧洲',1,'https://images.unsplash.com/photo-1549421263-60600494452e?q=80&w=1200', 'arrived', false, '', '香水文化窗口');
addD('w_lu','卢森堡','LUXEMBOURG','欧洲',1,'https://images.unsplash.com/photo-1533512336336-663857321689?q=80&w=1200', 'arrived', false, '', '当地植物');

// 欧洲 - 待解锁
addD('w_bg','保加利亚','BULGARIA','欧洲',0,'https://images.unsplash.com/photo-1524338198850-8a2ff63aaceb?q=80&w=1200', 'locked', false, '', '大马士革玫瑰');
addD('w_uk','英国','UNITED KINGDOM','欧洲',0,'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?q=80&w=1200', 'locked', false, '', '现代芳疗发源地');
addD('w_pt','葡萄牙','PORTUGAL','欧洲',0,'https://images.unsplash.com/photo-1555881400-74d7acaacd8b?q=80&w=1200', 'locked', false, '', '岩蔷薇、桉树');
addD('w_hr','克罗地亚','CROATIA','欧洲',0,'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?q=80&w=1200', 'locked', false, '', '薰衣草、鼠尾草');
addD('w_gr','希腊','GREECE','欧洲',0,'https://images.unsplash.com/photo-1533105079780-92b9be482077?q=80&w=1200', 'locked', false, '', '香桃木、橄榄');

// 非洲
addD('w_za','南非','SOUTH AFRICA','非洲',12,'https://images.unsplash.com/photo-1516026672322-bc52d61a55d5?q=80&w=1200', 'arrived', false, '', '天竺葵、布枯');
addD('w_ke','肯尼亚','KENYA','非洲',2,'https://images.unsplash.com/photo-1489392191049-fc10c97e64b6?q=80&w=1200', 'arrived', false, '', '茶油、蜡菊');
addD('w_eg','埃及','EGYPT','非洲',2,'https://images.unsplash.com/photo-1503177119275-0aa32b3a7447?q=80&w=1200', 'arrived', false, '', '茉莉、香草');
addD('w_zw','津巴布韦','ZIMBABWE','非洲',1,'https://images.unsplash.com/photo-1516426122078-c23e76319801?q=80&w=1200', 'arrived', false, '', '当地特色植物');
addD('w_mg','马达加斯加','MADAGASCAR','非洲',0,'https://images.unsplash.com/photo-1505322103502-c629d9509ce7?q=80&w=1200', 'locked', false, '', '伊兰伊兰、香草');
addD('w_ma','摩洛哥','MOROCCO','非洲',0,'https://images.unsplash.com/photo-1539020140153-e479b8c22e70?q=80&w=1200', 'locked', false, '', '玫瑰、雪松');

// 美洲/大洋洲
addD('w_us','美国','USA','美洲/大洋洲',7,'https://images.unsplash.com/photo-1485738422979-f5c462d49f74?q=80&w=1200', 'arrived', false, '', '薄荷、柑橘');
addD('w_mx','墨西哥','MEXICO','美洲/大洋洲',4,'https://images.unsplash.com/photo-1518105779142-d975b22f1b0a?q=80&w=1200', 'arrived', false, '', '莱姆、香草');
addD('w_ht','海地','HAITI','美洲/大洋洲',0,'https://images.unsplash.com/photo-1563819446326-7243c3d55160?q=80&w=1200', 'locked', false, '', '岩兰草产区');
addD('w_br','巴西','BRAZIL','美洲/大洋洲',8,'https://images.unsplash.com/photo-1483728642387-6c3bdd6c93e5?q=80&w=1200', 'arrived', false, '', '甜橙、玫瑰木');
addD('w_ar','阿根廷','ARGENTINA','美洲/大洋洲',0,'https://images.unsplash.com/photo-1513568754117-695027581729?q=80&w=1200', 'locked', false, '', '马黛茶、柠檬');
addD('w_au','澳大利亚','AUSTRALIA','美洲/大洋洲',0,'https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?q=80&w=1200', 'locked', false, '', '茶树、尤加利');

// 南极洲
addD('w_ant','南极洲','ANTARCTICA','南极洲',0,'https://images.unsplash.com/photo-1483168527879-c66136b56105?q=80&w=1200', 'locked', false, '', '冰川极境');

/**
 * 3. 神州 20 省 (强制全解锁，6 大区域)
 */
const CN_P = [
  // 西南 (5+)
  {n:'四川',sub:'西南',img:'https://images.unsplash.com/photo-1523731407965-2430cd12f5e4'},
  {n:'云南',sub:'西南',img:'https://images.unsplash.com/photo-1520263115673-610416f52ab6'},
  {n:'西藏',sub:'西南',img:'https://images.unsplash.com/photo-1534067783941-51c9c23ecefd'},
  {n:'贵州',sub:'西南',img:'https://images.unsplash.com/photo-1558238792-881c15f98896'},
  {n:'重庆',sub:'西南',img:'https://images.unsplash.com/photo-1502404733198-44b0559ac643'},
  // 华南
  {n:'广东',sub:'华南',img:'https://images.unsplash.com/photo-1540962351504-03099e0a754b'},
  {n:'福建',sub:'华南',img:'https://images.unsplash.com/photo-1546857186-b4d08122d104'},
  {n:'海南',sub:'华南',img:'https://images.unsplash.com/photo-1582234033306-03c7e4745856'},
  {n:'广西',sub:'华南',img:'https://images.unsplash.com/photo-1543163521-1bf539c55dd2'},
  // 华东
  {n:'浙江',sub:'华东',img:'https://images.unsplash.com/photo-1555543183-8380302b1156'},
  {n:'江苏',sub:'华东',img:'https://images.unsplash.com/photo-1542382156909-9ae37b3f56fd'},
  {n:'上海',sub:'华东',img:'https://images.unsplash.com/photo-1474181487882-5abf3f0ba6c2'},
  {n:'安徽',sub:'华东',img:'https://images.unsplash.com/photo-1554141630-d3923d6a9978'},
  {n:'山东',sub:'华东',img:'https://images.unsplash.com/photo-1551609189-eba71b3a8566'},
  // 华北
  {n:'北京',sub:'华北',img:'https://images.unsplash.com/photo-1508804185872-d7badad00f7d'},
  {n:'山西',sub:'华北',img:'https://images.unsplash.com/photo-1547949003-9792a18a2601'},
  // 华中
  {n:'湖南',sub:'华中',img:'https://images.unsplash.com/photo-1548235212-04533da82d33'},
  {n:'湖北',sub:'华中',img:'https://images.unsplash.com/photo-1543163521-1bf539c55dd2'},
  // 西北
  {n:'新疆',sub:'西北',img:'https://images.unsplash.com/photo-1542273917363-3b1817f69a2d'},
  {n:'甘肃',sub:'西北',img:'https://images.unsplash.com/photo-1542273917363-3b1817f69a2d'},
  {n:'陕西',sub:'西北',img:'https://images.unsplash.com/photo-1544735716-392fe2489ffa'}
];

CN_P.forEach((p)=>addD(`cn_${p.n}`, p.n, p.n.toUpperCase(), '亚洲', 8, `${p.img}?q=80&w=1200`, 'arrived', true, p.sub, '神州原生分子档案'));

export const PRODUCT_OVERRIDES: Record<string, string> = {};
