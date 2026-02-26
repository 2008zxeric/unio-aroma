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
  // --- 全球极境单方核心 ---
  '神圣乳香': '树脂结晶的那一刻，大地停止了呼吸。我们在多法尔山脉捕捉到的，是本草在极端干旱中凝结的生存意志。',
  '老山檀香': '三十载春秋化作一段心材，α-檀香醇的深度超出了实验室的预期，那是时间沉降后的尊严。',
  '大马士革玫瑰': '三千公斤花瓣萃取的一公斤，是清晨五点谷地里尚未蒸发的灵魂，系情绪疗愈的黄金标准。',
  '极境薄荷': '在阿尔卑斯的冷冽风中，我撕碎一片薄荷叶，那股直冲眉心的凉意，彻底洗礼了灵魂。',
  
  // --- 全球坐标日记 (World Archive) ---
  'w_thai': '清迈的雨季，空气里写满了湿热的柠檬草气息。在古刹的香火中，我找到了嗅觉上的某种安宁。',
  'w_in': '迈索尔的尘土里都浸透了檀香。在这里，香气不是奢侈品，而是镌刻在万物骨骼里的祷告。',
  'w_hk': '霓虹灯与咸水味之间，藏着中药材与旧书页的复杂叠影。它是水泥森林里脉动的、带有烟火气的芳香心脏。',
  'w_my': '槟城的老街巷，潮湿木门后飘出肉桂与豆蔻的暖意。那是南洋厨房里永不冷却的乡愁。',
  'w_id': '巴厘岛的清晨，供品中鲜花与椰子油混合成神圣的甜香。神明与凡人共享同一缕呼吸。',
  'w_uae': '迪拜的夜晚被乌木烟雾包裹。那是沙漠特有的厚重，仿佛能将滚烫的往事悉数压进沙丘。',
  'w_vn': '河内的巷弄深处，咖啡炭火焦香混着九层塔的青涩。这是市井生活最鲜活的嗅觉注脚。',
  'w_jp': '京都的苔藓。在细雨中，我闻到了泥土、湿木头和时间的灰尘，那是极致克制的侘寂。',
  'w_ir': '设拉子的玫瑰园，花瓣蒸馏成露。空气中浮动着波斯诗人的叹息——甜蜜而忧伤。',
  'w_sg': '热带雨林与混凝土共生。香兰叶的绿意穿透空调冷气，在钢铁丛林里悄然发芽。',
  'w_kr': '济州岛的海风裹挟着柑橘皮的微苦。火山岩土壤孕育的香气，带着倔强的生命力。',
  'w_np': '加德满都的杜巴广场，乳香与酥油灯交织。每一次呼吸，都是对喜马拉雅神性的低语。',
  'w_tr': '卡帕多奇亚的洞穴教堂，干燥空气中残留着没药与蜂蜡。千年信仰在此凝结成香。',
  'w_kz': '草原尽头，哈萨克牧民的毡房飘出马奶酒与干草的暖香。',
  'w_jo': '佩特拉古城的砂岩缝隙间，风带来乳香与沙漠鼠尾草的辛凉。石头也会呼吸。',
  'w_mac': '大三巴的石阶上，葡式蛋挞焦糖香混着妈阁庙的线香。',
  'w_kh': '吴哥窟的晨雾中，湿热空气裹着莲花与腐叶的气息。',
  'w_kp': '平壤的冬日，松针与煤烟构成沉默的底调。',
  'w_lk': '康提佛牙寺外，肉桂树皮在阳光下裂开。斯里兰卡的甜，是大地献给佛陀的供品。',
  'w_fr': '格拉斯的晨曦。我在茉莉花田里行走，呼吸着香水工业最原始的母语。',
  'w_de': '黑森林深处，冷杉树脂滴落的声音清晰可闻。',
  'w_it': '托斯卡纳的橄榄园，果实在石磨下迸裂出青绿苦香。',
  'w_uk': '康沃尔海岸，海盐、石楠花与旧羊毛毯的气息缠绕。',
  'w_is': '冰与火的交界。空气干净到凛冽，带着火山岩矿物质和万年冰川融水的冷感。',
  'w_es': '安达卢西亚的橙花盛开，甜香漫过摩尔式庭院。',
  'w_nl': '阿姆斯特丹运河边，郁金香茎秆折断时的青汁味，混着老书店的纸霉。',
  'w_pl': '克拉科夫老城，苹果派烤箱飘出肉桂暖香。',
  'w_at': '萨尔茨堡山麓，阿尔卑斯草甸的干花香随风而下。',
  'w_dk': '哥本哈根冬日，肉桂卷与桦木燃烧的烟交织。',
  'w_hu': '布达佩斯温泉浴场，硫磺水汽氤氲。',
  'w_mc': '摩纳哥悬崖花园，晚香玉在夜色中释放浓烈甜香。',
  'w_lu': '卢森堡峡谷，湿润苔藓覆盖古老堡垒。',
  'w_pt': '里斯本海边，鳕鱼干咸腥混着橙花香。',
  'w_bg': '玫瑰谷的五月，整片山谷蒸腾着粉红香气。',
  'w_sa': '南非的好望角。咸腥的海风撕碎了野花的芬芳。',
  'w_eg': '尼罗河畔的没药。这里的空气干燥而古老。',
  'w_ke': '肯尼亚的基础设施虽简陋，但马赛马拉草原的雨后泥土蒸腾出原始的生命力。',
  'w_mg': '马达加斯加的森林。香草的甜美混合着潮湿的腐殖土。',
  'w_zw': '维多利亚瀑布水雾弥漫，热带蕨类与湿岩的清冷扑面而来。',
  'w_mu': '毛里求斯甘蔗田焚烧后的焦甜，混着海风与依兰依兰。',
  'w_ma': '撒哈拉边缘，阿甘树坚果烘烤出坚果香。',
  'w_us': '新墨西哥沙漠，鼠尾草燃烧的烟驱散邪灵。',
  'w_ca': '落基山脉雪松林，冷冽空气刺穿肺腑。',
  'w_br': '亚马逊的丛林。每一次呼吸都是绿色的。',
  'w_au': '北领地乌鲁鲁巨岩，桉树精油在热浪中挥发。',
  'w_an': '在零度的极点，嗅觉几乎停滞。那是一种金属般的、臭氧充盈的纯净。',
  'w_mx': '墨西哥亡灵节，万寿菊铺满街道。',
  'w_ar': '巴塔哥尼亚荒原，风卷起干草与羊膻味。',
  'w_ht': '海地伏都教仪式，朗姆酒、辣椒与熏香混合成迷幻气息。',
  'w_pe': '马丘比丘云雾缭绕，古柯叶的微苦混着安第斯山冷空气。',
  'w_cu': '哈瓦那老城，雪茄烟草醇厚如绸缎。',
  'w_phl': '马尼拉的午后，浓郁的依兰依兰花香在湿润的海风中发酵。那是属于热带岛屿的慵懒与奔放。',

  // --- 神州坐标日记 (China Archive) ---
  'cn_北京': '红墙与古松。干燥的冬日空气里，带着一种历经千载的肃穆与威严，沉静得让人不忍大声呼吸。',
  'cn_天津': '海河边的槐花落满石板路，咸腥水汽混着煎饼馃子的芝麻香。北方港口的市井诗。',
  'cn_河北': '太行山崖柏在风中析出树脂。那是燕赵大地骨子里的刚烈与清苦。',
  'cn_山西': '平遥古城醋坊，酸香穿透百年木梁。晋商的精明，酿在每一滴陈醋里里。',
  'cn_内蒙古': '辽阔的草原。草尖的苦味在风中疾走，那是自由的味道，没有任何阻拦，直到天地尽头。',
  'cn_辽宁': '大连海滨，槐花甜香混着海蛎子的腥。',
  'cn_吉林': '长白山天池畔，冷杉与雪松的针叶在寒风中释放清冽。',
  'cn_黑龙江': '北地的针叶林。松针被冻结后的清香，伴随着柴火燃烧的烟火气。',
  'cn_上海': '梧桐絮飘过石库门，咖啡香混着黄浦江水汽。',
  'cn_江苏': '苏州园林，雨打芭蕉的湿气混着茉莉花茶。',
  'cn_浙江': '西湖的龙井。不仅是味觉，那是嗅觉上的青绿山水。',
  'cn_安徽': '黄山云雾茶，松枝熏焙的微烟混着兰花香。',
  'cn_福建': '武夷山岩茶，焙火香中透出矿物质冷感。',
  'cn_江西': '庐山云雾缭绕，茶树与竹林共吐清芬。',
  'cn_山东': '泰山脚下，松涛阵阵，混着煎饼卷大葱的粗犷。',
  'cn_河南': '洛阳牡丹谢后，泥土中仍残留脂粉甜香。',
  'cn_湖北': '武汉东湖，荷花凋零后莲蓬的微苦混着长江水腥。',
  'cn_湖南': '岳麓山下，湘江水汽裹着辣椒与腊肉的辛香。',
  'cn_广东': '荔枝花开的季节，岭南的空气是甜腻而温润的。',
  'cn_广西': '桂林漓江，晨雾中桂花甜香混着喀斯特岩壁的湿冷。',
  'cn_海南': '黎寨里的沉香烟。海风吹过椰林的咸，与那抹近乎神圣的木质香气。',
  'cn_重庆': '山城雾都，火锅牛油香穿透层层楼阁。巴渝的江湖气。',
  'cn_四川': '峨眉山的竹林深处，空气湿冷而寂静。苔藓的清苦气息。',
  'cn_贵州': '黔东南苗寨，酸汤鱼的发酵香混着杉木吊脚楼的潮气。',
  'cn_云南': '云雾缭绕的茶山。潮湿的红土、野花的芬芳与古茶树的深邃。',
  'cn_西藏': '冈仁波齐脚下，经幡在风中飞舞。柏木烟雾让灵魂变得轻盈。',
  'cn_陕西': '西安城墙下，石榴花落满青砖。十三朝古都的厚重。',
  'cn_甘肃': '莫高窟外的戈壁。黄沙的干燥气息混合着古老壁画的陈香。',
  'cn_青海': '茶卡盐湖，结晶盐粒在阳光下蒸腾出矿物冷香。',
  'cn_宁夏': '贺兰山下，枸杞晒场飘出微甜药香。',
  'cn_新疆': '赛里木湖的蓝是不讲理的。空气里有冰川融水的冷冽。',
  'cn_香港': '霓虹灯与咸水味之间，藏着中药材与旧书页的复杂叠影。',
  'cn_澳门': '大三巴的石阶上，葡式蛋挞焦糖香混着妈阁庙的线香。',
  'cn_台湾': '阿里山云海，桧木清香混着高山乌龙茶的冷韵。',
};

const ALICE_LAB_DIARY: Record<string, string> = {
  // 元系列 · 极境单方
  '神圣乳香': '树脂结晶率＞12%，冷压蒸馏保留α-蒎烯活性，冥想时使用可降低皮质醇17%。',
  '极境香茅': '高柠檬醛含量（38%），天然驱蚊效力达DEET的82%，敏感肌需稀释使用。',
  '极境尤加利': '1,8-桉叶素占比76%，呼吸道清透力强，儿童使用建议浓度≤1%。',
  '极境茶树': '萜品烯-4-醇≥42%，抗菌谱广，点涂痘痘24h内红肿减退明显。',
  '极境薄荷': '左旋薄荷酮纯度91%，提神醒脑峰值在吸入后3分钟，建议避免晚间使用。',
  '老山檀香': '心材醇沉≥30年，α-檀香醇含量突破55%，情绪安抚效果可持续2小时以上。',
  '神圣花梨木': '氧化后木质甜香更显，搭配玫瑰可提升愉悦感37%（通过fMRI脑成像验证）。',
  '极境丝柏': '高倍浓缩单宁，收敛微血管效果显著，尤其适合油性头皮的深层护理。',
  '极境雪松': '倍半萜含量丰富，助眠香氛中加入3滴，入睡速度平均提升22%。',
  '极境松针': '富含α-蒎烯，森林浴效应明显，办公场景扩香可显著提升专注力。',
  '极境没药': '树脂黏稠度极高，修复屏障受损肌肤，临床测试7天TEWL值下降29%。',
  '深根岩兰草': '根系精油沉降力强，焦虑状态下使用可观察到HRV（心率变异性）提升15%。',
  '暗夜广藿香': '陈化后土质香更圆润，抗真菌活性强，对特定菌株抑制率达91%。',
  '极境安息香': '天然苯甲酸酯带来香草甜韵，舒缓干咳反射效果显著，儿童呼吸道友好。',
  '极境杜松': '利尿作用显著，复配葡萄柚用于身体按摩，受试者水肿腿围日均下降0.8cm。',
  '大马士革玫瑰': '3,000kg花瓣仅萃取1kg精油，芳樟醇+香茅醇协同，系情绪疗愈的黄金标准。',
  '日光橙花': '苦橙花蜡保留完整，抗敏修红效果优于普通橙花3.2倍，适合脆弱肌。',
  '大花茉莉': '坚持夜间手工采摘保证吲哚含量，微量吸入即可激活大脑多巴胺分泌。',
  '极境依兰': '分级蒸馏提取“Extra”段，降血压效果在芳香疗法记录中位列前三。',
  '极境天竺葵': '玫瑰香气的科学平替，有效平衡皮脂分泌，油痘肌日常护理首选。',
  '横断生姜': '姜烯酚活性极高，暖宫热敷配方的核心，经期不适缓解率达84%。',
  '佛手柑': '经过FCF脱呋喃处理，光敏性＜0.3%，白天使用无光敏性晒伤风险。',
  '极境红橘': 'd-柠檬烯占比高达95%，提振心情的同时能显著促进淋巴循环。',
  '极境橡木苔': '绝对油非溶剂萃取，呈现森林地表原始气息，定香力长达8小时。',
  '极境葡萄柚': '低毒性高挥发，晨间扩香可提升代谢率12%（基于实验室动物模型）。',

  // 和系列 · 复方疗愈
  '云感霜': '植物角鲨烷载体+5%极境复方精油，24h保湿力达87%，敏肌测试0刺激。',
  '晨曦液': '微分子喷雾技术，3秒渗透角质层，妆前使用可提升持妆力约2.1小时。',
  '月华油': '基底选用顶级冷榨荷荷巴，延展性极佳，按摩后完全吸收无油膜残留感。',
  '清冽发': '薄荷+茶树靶向作用于毛囊环境，临床观察4周头皮屑减少63%。',
  '润迹膏': '蜂蜡封护技术，局部修护粲裂口，在高原低氧干燥区实测修护力极强。',
  '止语雾': '雪松+岩兰草深度复方，办公空间喷洒3下，心率恢复平静均值仅需90秒。',
  '归处膏': '滚珠设计精准点涂太阳穴，通勤族主观头痛缓解率达91%。',
  '听泉露': '全水相基底易挥发，冥想开场时使用，受试者α脑波增幅明显（约23%）。',
  '微光氛': '柑橘+依兰协同提亮情绪，阴雨天使用后主观幸福感评分提升35%。',
  '深吸瓶': '便携式吸入器，呼吸急促时按压鼻翼使用，副交感神经激活速度加快。',
  '无界油': '含0.5%玫瑰+1%老山檀香，高阶情绪整合配方，显著提升静心深度。',
  '悬浮露': '纯露+微量精油，用于能量场清理，空间负离子浓度在喷洒后短暂上升。',
  '破晓珠': '红橘+葡萄柚瞬间唤醒嗅觉，晨起滚动手腕脉搏处，清醒速度显著加快。',
  '空寂水': '橡木苔+广藿香营造“空山新雨”感，焦虑自评量表（SAS）评分下降28%。',
  '共振方': '馆藏定制级复方，建议配合特定呼吸频率使用，实现身心同步共振。',

  // 香系列 · 空间美学
  '扩香石': '扩香石多孔结构有利于精油缓慢均匀挥发，适用于3-5平米私人静谧空间。',
  '精油烛': '采用天然大豆蜡基底，无烟燃烧，精油负载量高达12%，营造深层沉浸感。'
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
    shortDesc: cat === 'yuan' ? '元 · 单方 / 极境生存原力' : (cat === 'he' ? '和 · 复方 / 科学频率重构' : '香 · 空间 / 极简芳香美学'), 
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

const addD = (id:string, n:string, en:string, reg:string, c:number, img:string, pIds: string[] = [], s:'arrived'|'locked'='arrived', isCN:boolean=false, sub?:string, customPrefix?:string) => {
  const diary = ERIC_JOURNAL[id] || ERIC_JOURNAL[`cn_${n}`] || ERIC_JOURNAL[n] || `第 ${c} 次踏上 ${n}。这里的空气中弥漫着一种坚韧的静谧。`;
  const prefix = customPrefix || en.toLowerCase().replace(/[^a-z]/g, '').slice(0, 3);
  const memoryPhotos = [
    `${ERIC_PHOTO_BASE}${prefix}1.webp${CACHE_V}`,
    `${ERIC_PHOTO_BASE}${prefix}2.webp${CACHE_V}`,
    `${ERIC_PHOTO_BASE}${prefix}3.webp${CACHE_V}`
  ];

  // 优化：只要 visitCount > 0，状态即为 'arrived'
  const finalStatus = (c > 0 || s === 'arrived') ? 'arrived' : 'locked';

  DESTINATIONS[id] = {
    id, name:n, en, region:reg, status:finalStatus, visitCount:c, scenery:img, emoji:'📍',
    herbDescription: '极境原生分子档案', knowledge:'已存入 UNIO 核心库频率库', productIds: pIds, isChinaProvince:isCN, subRegion:sub,
    ericDiary: diary, aliceDiary: `我们在实验室对 ${n} 的生态样本进行了分段提取。`, 
    memoryPhotos: memoryPhotos 
  };
};

// ============================================================
// 🏛️ 全量产品矩阵 (50款)
// ============================================================
const yuanData = [
  { group: 'Metal金', folder: 'metal', items: [
    ['神圣乳香', 'Sacred Frankincense', '248', '10ml'], 
    ['极境香茅', 'Citronella Clarissima', '248', '10ml'], 
    ['极境尤加利', 'Eucalyptus Glaciale', '98', '10ml', ' Eucalyptus Glaciale.webp'],
    ['极境茶树', 'Tea Tree Antiseptic', '98', '10ml'], 
    ['极境薄荷', 'Peppermint from Peaks', '68', '10ml']
  ] },
  { group: 'Wood木', folder: 'wood', items: [['老山檀香', 'Aged Sandalwood', '1180', '10ml'],['极境丝柏', 'Misty Cypress', '128', '10ml'],['极境雪松', 'Himalayan Cedar', '108', '10ml'],['极境松针', 'Boreal Pine', '98', '10ml'],['神圣花梨木', 'Sacred Rosewood Isle', '158', '10ml']] },
  { group: 'Water水', folder: 'water', items: [['极境没药', 'Myrrh Secreta', '298', '10ml'],['深根岩兰草', 'Deep Root Vetiver', '158', '10ml'],['暗夜广藿香', 'Patchouli Nocturne', '158', '10ml'],['极境杜松', 'Juniper by the Loch', '98', '10ml'],['极境安息香', 'Benzoin Ambrosia', '108', '10ml']] },
  { group: 'Fire火', folder: 'fire', items: [
    ['大马士革玫瑰', 'Damask Rose Aureate', '2680', '10ml'],
    ['极境依兰', 'Ylang Equatorial', '180', '10ml'],
    ['大花茉莉', 'Jasminum Grandiflorum', '108', '10ml'],
    ['日光橙花', 'Neroli Soleil', '108', '10ml'],
    ['极境天竺葵', 'Geranium Rosé', '98', '10ml', 'Geranium%20Rose%CC%81.webp']
  ] },
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
  addP('he', `和 · ${g.group}`, item[0], item[1], g.folder, `he_${i}_${j}`, item[2], item[3], customImg);
}));

const jingData = [
  { group: '芳香美学', folder: 'place', items: [['扩香石', 'Crackled', '388', 'Set', 'Crackled.webp'],['芳香链', 'Necklace ', '368', 'Piece', 'Necklace .webp'],['木核扩', 'Walnut', '198', 'Piece', 'Walnut.webp'],['精油烛', 'candle', '228', '200g', 'candle.webp'],['雾露器', 'Vessel', '158', 'Piece', 'Vessel.webp']] },
  { group: '凝思之物', folder: 'Meditation', items: [['一柱香', 'Incense Sticks', '128', '30pcs', 'Incense Sticks.webp'],['觉知珠', 'Rollerball', '88', '10ml', 'Rollerball.webp'],['清空石', 'Gypsum', '168', 'Piece', 'Gypsum.webp'],['归真座', 'mountain', '258', 'Piece', 'mountain.webp'],['承露璃', 'glass', '328', 'Piece', 'glass.webp']] }
];
jingData.forEach((g, i) => g.items.forEach((item, j) => addP('jing', `香 · ${g.group}`, item[0], item[1], g.folder, `jing_${i}_${j}`, item[2], item[3], item[4])));

const getP = (s: string) => Object.keys(DATABASE).slice(0, 3);

// --- 亚洲 (20) ---
addD('w_thai','泰国','THAILAND','亚洲',40,'https://images.unsplash.com/photo-1528127269322-539801943592?q=80&w=1200');
addD('w_in','印度','INDIA','亚洲',3,'https://images.unsplash.com/photo-1506461883276-594a12b11cf3?q=80&w=1200', [], 'arrived', false, undefined, 'inn');
addD('w_hk','中国香港','HONG KONG','亚洲',18,`${RAW_DEST}Hongkong.webp${CACHE_V}`);
addD('w_my','马来西亚','MALAYSIA','亚洲',13,`${RAW_DEST}Malaysia.webp${CACHE_V}`);
addD('w_id','印尼','INDONESIA','亚洲',12,'https://images.unsplash.com/photo-1537996194471-e657df975ab4?q=80&w=1200');
addD('w_uae','阿联酋','UAE','亚洲',12,'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?q=80&w=1200');
addD('w_vn','越南','VIETNAM','亚洲',6,'https://images.unsplash.com/photo-1528127269322-539801943592?q=80&w=600');
addD('w_jp','日本','JAPAN','亚洲',2,'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?q=80&w=1200');
addD('w_phl','菲律宾','PHILIPPINES','亚洲',12,'https://images.unsplash.com/photo-1518509562904-e7ef99cdcc86?q=80&w=1200');
addD('w_ir','伊朗','IRAN','亚洲',2,`${RAW_DEST}Iran.webp${CACHE_V}`);
addD('w_sg','新加坡','SINGAPORE','亚洲',2,`${RAW_DEST}Singapore.webp${CACHE_V}`);
addD('w_kr','韩国','SOUTH KOREA','亚洲',1,'https://images.unsplash.com/photo-1517154421773-0529f29ea451?q=80&w=1200');
addD('w_np','尼泊尔','NEPAL','亚洲',2,'https://images.unsplash.com/photo-1544735716-392fe2489ffa?q=80&w=1200');
addD('w_tr','土耳其','TURKEY','亚洲',8,'https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?q=80&w=1200');
addD('w_kz','哈萨克斯坦','KAZAKHSTAN','亚洲',4,`${RAW_DEST}kazakhstan.webp${CACHE_V}`);
addD('w_jo','约旦','JORDAN','亚洲',2,'https://images.unsplash.com/photo-1547234935-80c7145ec969?q=80&w=1200');
addD('w_mac','中国澳门','MACAU','亚洲',2,`${RAW_DEST}Macau.webp${CACHE_V}`);
addD('w_kh','柬埔寨','CAMBODIA','亚洲',1,`${RAW_DEST}Cambodia.webp${CACHE_V}`);
addD('w_kp','朝鲜','NORTH KOREA','亚洲',1,`${RAW_DEST}North%20Korea.webp${CACHE_V}`);
addD('w_lk','斯里兰卡','SRI LANKA','亚洲',2,'https://images.unsplash.com/photo-1546708973-b339540b5162?q=80&w=1200');

// --- 欧洲 (14) ---
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

// --- 非洲 (8) ---
addD('w_sa','南非','SOUTH AFRICA','非洲',12,`${RAW_DEST}South%20africa.webp${CACHE_V}`);
addD('w_eg','埃及','EGYPT','非洲',2,`${RAW_DEST}Egypt.webp${CACHE_V}`);
addD('w_ke','肯尼亚','KENYA','非洲',2,`${RAW_DEST}Kenya.webp${CACHE_V}`);
addD('w_mg','马达加斯加','MADAGASCAR', '非洲', 3, `${RAW_DEST}Madagascar.webp${CACHE_V}`);
addD('w_zw','津巴布韦','ZIMBABWE','非洲',1,`${RAW_DEST}Zimbabwe.webp${CACHE_V}`);
addD('w_mu','毛里求斯','MAURITIUS','非洲',1,`${RAW_DEST}Mauritius.webp${CACHE_V}`);
addD('w_ma','摩洛哥','MOROCCO','非洲',2,'https://images.unsplash.com/photo-1489493585363-d69421e0edd3?q=80&w=1200');

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
// 恢复古巴图片链接
addD('w_cu','古巴','CUBA','美洲/大洋洲',1,`${RAW_DEST}cuba.webp${CACHE_V}`);

// --- 神州 (34) ---
const PROVINCE_GROUPS: Record<string, string[]> = {
  '华北': ['北京', '天津', '河北', '山西', '内蒙古'],
  '东北': ['辽宁', '吉林', '黑龙江'],
  '华东': ['上海', '江苏', '浙江', '安徽', '福建', '江西', '山东', '台湾'],
  '华中': ['河南', '湖北', '湖南'],
  '华南': ['广东', '广西', '海南', '香港', '澳门'],
  '西南': ['重庆', '四川', '贵州', '云南', '西藏'],
  '西北': ['陕西', '甘肃', '青海', '宁夏', '新疆']
};
const PROVINCE_FILE_MAP: Record<string, string> = {
  '北京': 'beijing.webp', '天津': 'tianjin.webp', '河北': 'hebei.webp', '山西': 'shanxi.webp', '内蒙古': 'neimenggu.webp',
  '辽宁': 'liaoning.webp', '吉林': 'jilin.webp', '黑龙江': 'heilongjiang.webp',
  '上海': 'shanghai.webp', '江苏': 'jiangsu.webp', '浙江': 'zhejiang.webp', '安徽': 'anhui.webp', '福建': 'fujian.webp', '江西': 'jiangxi.webp', '山东': 'shandong.webp', '台湾': 'taiwan.webp',
  '河南': 'henan.webp', '湖北': 'hubei.webp', '湖南': 'hunan.webp',
  '广东': 'guangdong.webp', '广西': 'guangxi.webp', '海南': 'hainan.webp', 
  '香港': 'Hongkong.webp', '澳门': 'Macau.webp',
  '重庆': 'chongqing.webp', '四川': 'sichuan.webp', '贵州': 'guizhou.webp', '云南': 'yunnan.webp', '西藏': 'xizang.webp',
  '陕西': 'shannxi.webp', '甘肃': 'gansu.webp', '青海': 'qinghai.webp', '宁夏': 'ningxia.webp', '新疆': 'xinjiang.webp'
};
Object.entries(PROVINCE_GROUPS).forEach(([sub, list]) => {
  list.forEach(prov => {
    const id = `cn_${prov}`;
    const en = prov.toUpperCase();
    
    // 香港和澳门使用 destinations 目录下的图片，其余使用 province 目录
    let img = `${PROVINCE_BASE}${PROVINCE_FILE_MAP[prov] || 'beijing.webp'}${CACHE_V}`;
    if (prov === '香港' || prov === '澳门') {
      img = `${RAW_DEST}${PROVINCE_FILE_MAP[prov]}${CACHE_V}`;
    }
    
    addD(id, prov, en, '亚洲', 5, img, getP(prov), 'arrived', true, sub);
  });
});
