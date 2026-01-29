
import { ScentItem, Destination, Category } from './types';

const RAW_BASE = 'https://raw.githubusercontent.com/2008zxeric/unio-aroma/main/assets/';
const PROVINCE_BASE = `${RAW_BASE}province/`;
const CACHE_V = '?v=1006.55'; 

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

/**
 * ============================================================
 * 🌿 ERIC'S EXTREME JOURNALS / 寻香行历日记库
 * 全量补完，包含全球 51 坐标及神州 34 坐标
 * ============================================================
 */
const ERIC_JOURNAL: Record<string, string> = {
  // --- 重点产品日记 ---
  '神圣乳香': '树脂结晶的那一刻，大地停止了呼吸。我们在多法尔山脉捕捉到的，是本草在极端干旱中凝结的生存意志。',
  '老山檀香': '三十载春秋化作一段心材，α-檀香醇的深度超出了实验室的预期，那是时间沉降后的尊严。',
  '大马士革玫瑰': '三千公斤花瓣萃取的一公斤，是清晨五点谷地里尚未蒸发的灵魂，系情绪疗愈的黄金标准。',
  '巅峰薄荷': '左旋薄荷酮的纯净，在吸入后的第三分钟达到峰值，像极了在阿尔卑斯之巅的一次深呼吸。',

  // --- 全球坐标日记 (51个全量) ---
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
  'w_kz': '草原尽头，哈萨克牧民的毡房飘出马奶酒与干草的暖香。那是游牧民族流动的故乡。',
  'w_jo': '佩特拉古城的砂岩缝隙间，风带来乳香与沙漠鼠尾草的辛凉。石头也会呼吸。',
  'w_mac': '大三巴的石阶上，葡式蛋挞焦糖香混着妈阁庙的线香。东西方在此交换一缕魂魄。',
  'w_kh': '吴哥窟的晨雾中，湿热空气裹着莲花与腐叶的气息。神庙在呼吸，千年未停。',
  'w_kp': '平壤的冬日，松针与煤烟构成沉默的底调。香气在此成为一种隐秘的抵抗。',
  'w_lk': '康提佛牙寺外，肉桂树皮在阳光下裂开。斯里兰卡的甜，是大地献给佛陀的供品。',
  'w_fr': '格拉斯的晨曦。我在茉莉花田里行走，呼吸着香水工业最原始的母语，每一片花瓣都是一段历史。',
  'w_de': '黑森林深处，冷杉树脂滴落的声音清晰可闻。那是德国灵魂里深藏的、理性的幽暗芬芳。',
  'w_it': '托斯卡纳的橄榄园，果实在石磨下迸裂出青绿苦香。意大利的浪漫，从不回避生命的粗粝。',
  'w_uk': '康沃尔海岸，海盐、石楠花与旧羊毛毯的气息缠绕。英伦的忧郁，带着潮湿的温柔。',
  'w_is': '冰与火的交界。空气干净到凛冽，带着火山岩矿物质和万年冰川融水的冷感，纯粹得近乎残忍。',
  'w_es': '安达卢西亚的橙花盛开，甜香漫过摩尔式庭院。西班牙的热情，藏在每一缕夜风里。',
  'w_nl': '阿姆斯特丹运河边，郁金香茎秆折断时的青汁味，混着老书店的纸霉。理性国度里的感性裂缝。',
  'w_pl': '克拉科夫老城，苹果派烤箱飘出肉桂暖香。东欧的苦难，被日常的甜味轻轻覆盖。',
  'w_at': '萨尔茨堡山麓，阿尔卑斯草甸的干花香随风而下。莫扎特的音符，或许就藏在这气息里。',
  'w_dk': '哥本哈根冬日，肉桂卷与桦木燃烧的烟交织。北欧的“hygge”，是嗅觉上的围炉取暖。',
  'w_hu': '布达佩斯温泉浴场，硫磺水汽氤氲。千年罗马遗迹的呼吸，带着地心深处的暖意。',
  'w_mc': '摩纳哥悬崖花园，晚香玉在夜色中释放浓烈甜香。微型王国的奢靡，全写在空气里。',
  'w_lu': '卢森堡峡谷，湿润苔藓覆盖古老堡垒。小国的宁静，是欧洲心脏最柔软的跳动。',
  'w_pt': '里斯本海边，鳕鱼干咸腥混着橙花香。航海时代的冒险精神，仍在风中飘荡。',
  'w_bg': '玫瑰谷的五月，整片山谷蒸腾着粉红香气。保加利亚的浪漫，是大地慷慨的馈赠。',
  'w_sa': '南非的好望角。咸腥的海风撕碎了野花的芬芳，那是大地的终点，也是嗅觉冒险的起点。',
  'w_eg': '尼罗河畔的没药。这里的空气干燥而古老，那是法老时代留下的、关于永恒的秘密。',
  'w_ke': '马赛马拉草原，雨后泥土蒸腾出野性腥甜。那是生命与死亡共舞的原始气息。',
  'w_mg': '马达加斯加的森林。香草的甜美混合着潮湿的腐殖土，这是大自然未经调教的野性诱惑。',
  'w_zw': '维多利亚瀑布水雾弥漫，热带蕨类与湿岩的清冷扑面而来。非洲之心在此跳动。',
  'w_mu': '毛里求斯甘蔗田焚烧后的焦甜，混着海风与依兰依兰。印度洋的蜜糖陷阱。',
  'w_ma': '撒哈拉边缘，阿甘树坚果烘烤出坚果香。柏柏尔女人的手掌，揉捏着沙漠的黄金。',
  'w_us': '新墨西哥沙漠，鼠尾草燃烧的烟驱散邪灵。美洲原住民的智慧，在风中低语。',
  'w_ca': '落基山脉雪松林，冷冽空气刺穿肺腑。加拿大的辽阔，是寂静的木质回响。',
  'w_br': '亚马逊的丛林。每一次呼吸都是绿色的，那是亿万个生命在潮湿中疯狂竞争、爆发、腐烂再重生的交响。',
  'w_au': '北领地乌鲁鲁巨岩，桉树精油在热浪中挥发。澳洲内陆的呼吸，带着药性的清醒。',
  'w_an': '在零度的极点，嗅觉几乎停滞。那是一种金属般的、臭氧充盈的纯净，让灵魂在空白中战栗。',
  'w_mx': '墨西哥亡灵节，万寿菊铺满街道。浓烈花香是对死亡最盛大的欢迎。',
  'w_ar': '巴塔哥尼亚荒原，风卷起干草与羊膻味。南美尽头的孤独，粗粝却自由。',
  'w_ht': '海地伏都教仪式，朗姆酒、辣椒与熏香混合成迷幻气息。神灵在此附体。',
  'w_pe': '马丘比丘云雾缭绕，古柯叶的微苦混着安第斯山冷空气。印加帝国的呼吸仍未停歇。',
  'w_cu': '哈瓦那老城，雪茄烟草醇厚如绸缎，混着海盐与殖民建筑的霉味。时间在此发酵。',

  // --- 神州坐标日记 (34个全量) ---
  'cn_北京': '红墙与古松。干燥的冬日空气里，带着一种历经千载的肃穆与威严，沉静得让人不忍大声呼吸。',
  'cn_天津': '海河边的槐花落满石板路，咸腥水汽混着煎饼馃子的芝麻香。北方港口的市井诗。',
  'cn_河北': '太行山崖柏在风中析出树脂。那是燕赵大地骨子里的刚烈与清苦。',
  'cn_山西': '平遥古城醋坊，酸香穿透百年木梁。晋商的精明，酿在每一滴陈醋里。',
  'cn_内蒙古': '辽阔的草原。草尖的苦味在风中疾走，那是自由的味道，没有任何阻拦，直到天地尽头。',
  'cn_辽宁': '大连海滨，槐花甜香混着海蛎子的腥。东北的柔情，藏在海风转弯处。',
  'cn_吉林': '长白山天池畔，冷杉与雪松的针叶在寒风中释放清冽。东北亚的肺叶在此呼吸。',
  'cn_黑龙江': '北地的针叶林。松针被冻结后的清香，伴随着柴火燃烧的烟火气，那是极境中最坚韧的温暖。',
  'cn_上海': '梧桐絮飘过石库门，咖啡香混着黄浦江水汽。东方巴黎的精致，藏在每一寸呼吸里。',
  'cn_江苏': '苏州园林，雨打芭蕉的湿气混着茉莉花茶。江南的婉约，是嗅觉上的水墨画。',
  'cn_浙江': '西湖的龙井。不仅是味觉，那是嗅觉上的青绿山水，在茶烟缭绕中，时间慢了下来。',
  'cn_安徽': '黄山云雾茶，松枝熏焙的微烟混着兰花香。徽州文人的清高，全在这一缕气韵中。',
  'cn_福建': '武夷山岩茶，焙火香中透出矿物质冷感。闽北的山魂，藏在每一片茶叶褶皱里。',
  'cn_江西': '庐山云雾缭绕，茶树与竹林共吐清芬。陶渊明的桃花源，或许就在这一片湿气中。',
  'cn_山东': '泰山脚下，松涛阵阵，混着煎饼卷大葱的粗犷。齐鲁大地的豪迈，直抵鼻腔。',
  'cn_河南': '洛阳牡丹谢后，泥土中仍残留脂粉甜香。中原的厚重，是千年花事沉淀的余韵。',
  'cn_湖北': '武汉东湖，荷花凋零后莲蓬的微苦混着长江水腥。荆楚的浪漫，带着江湖的野性。',
  'cn_湖南': '岳麓山下，橘子洲头，湘江水汽裹着辣椒与腊肉的辛香。湖南人的火辣，从呼吸开始。',
  'cn_广东': '荔枝花开的季节，岭南的空气是甜腻而温润的。那是属于南方的、极其丰盛而优雅的生命力。',
  'cn_广西': '桂林漓江，晨雾中桂花甜香混着喀斯特岩壁的湿冷。山水甲天下，香亦如此。',
  'cn_海南': '黎寨里的沉香烟。海风吹过椰林的咸，与那抹近乎神圣的木质香气，构成了海岛的灵魂。',
  'cn_重庆': '山城雾都，火锅牛油香穿透层层楼阁。巴渝的江湖气，在每一口呼吸里沸腾。',
  'cn_四川': '峨眉山的竹林深处，空气湿冷而寂静。苔藓的清苦气息，仿佛带我回到了千万年前的清晨。',
  'cn_贵州': '黔东南苗寨，酸汤鱼的发酵香混着杉木吊脚楼的潮气。山地民族的生存智慧，在气味中传承。',
  'cn_云南': '云雾缭绕的茶山。潮湿的红土、野花的芬芳与古茶树的深邃，交织成一幅原始的能量图景。',
  'cn_西藏': '冈仁波齐脚下，经幡在风中飞舞。在这里，呼吸是沉重的，但柏木烟雾让灵魂变得轻盈。',
  'cn_陕西': '西安城墙下，石榴花落满青砖。十三朝古都的厚重，混着黄土高原的干燥尘香。',
  'cn_甘肃': '莫高窟外的戈壁。黄沙的干燥气息混合着古老壁画的陈香，那是风沙无法掩埋的文明记忆。',
  'cn_青海': '茶卡盐湖，结晶盐粒在阳光下蒸腾出矿物冷香。天空之镜的呼吸，纯净得令人窒息。',
  'cn_宁夏': '贺兰山下，枸杞晒场飘出微甜药香。塞上江南的丰饶，藏在每一粒红果中。',
  'cn_新疆': '赛里木湖的蓝是不讲理的。空气里有冰川融水的冷冽，那是大自然从未被人类惊扰过的初吻。',
  'cn_香港': '霓虹灯与咸水味之间，藏着中药材与旧书页的复杂叠影。它是水泥森林里脉动的、带有烟火气的芳香心脏。',
  'cn_澳门': '大三巴的石阶上，葡式蛋挞焦糖香混着妈阁庙的线香。东西方在此交换一缕魂魄。',
  'cn_台湾': '阿里山云海，桧木清香混着高山乌龙茶的冷韵。宝岛的灵秀，全在这一呼一吸之间。',
};

const ERIC_FALLBACKS = [
  "在极境中，我意识到大地的呼吸比人类的言语更具力量。",
  "每一滴精油都是大地的眼泪，封存了本草在极限环境下的生存意志。",
  "溯源的意义不在于终点，而在于那份与原始自然不期而遇的震颤。"
];

/**
 * ============================================================
 * 💧 ALICE'S LAB DIARY / 实验室分析日记
 * ============================================================
 */
const ALICE_LAB_DIARY: Record<string, string> = {
  // 元系列
  '神圣乳香': '树脂结晶率＞12%，冷压蒸馏保留α-蒎烯活性，冥想时使用可降低皮质醇17%。',
  '野性香茅': '高柠檬醛含量（38%），天然驱蚊效力达DEET的82%，敏感肌需稀释使用。',
  '冰川尤加利': '1,8-桉叶素占比76%，呼吸道清透力强，儿童使用建议浓度≤1%。',
  '原野茶树': '萜品烯-4-醇≥42%，抗菌谱广，点涂痘痘24h内红肿减退明显。',
  '巅峰薄荷': '左旋薄荷酮纯度91%，提神醒脑峰值在吸入后3分钟，建议避免晚间使用。',
  '老山檀香': '心材醇沉≥30年，α-檀香醇含量突破55%，情绪安抚效果可持续2小时以上。',
  '神圣花梨木': '氧化后木质甜香更显，搭配玫瑰可提升愉悦感37%（通过fMRI脑成像验证）。',
  '烟雨丝柏': '高倍浓缩单宁，收敛微血管效果显著，尤其适合油性头皮的深层护理。',
  '喜马雪松': '倍半萜含量丰富，助眠香氛中加入3滴，入睡速度平均提升22%。',
  '北地松针': '富含α-蒎烯，森林浴效应明显，办公场景扩香可显著提升专注力。',
  '秘境没药': '树脂黏稠度极高，修复屏障受损肌肤，临床测试7天TEWL值下降29%。',
  '深根岩兰草': '根系精油沉降力强，焦虑状态下使用可观察到HRV（心率变异性）提升15%。',
  '暗夜广藿香': '陈化后土质香更圆润，抗真菌活性强，对特定菌株抑制率达91%。',
  '琥珀安息香': '天然苯甲酸酯带来香草甜韵，舒缓干咳反射效果显著，儿童呼吸道友好。',
  '湖畔杜松': '利尿作用显著，复配葡萄柚用于身体按摩，受试者水肿腿围日均下降0.8cm。',
  '大马士革玫瑰': '3,000kg花瓣仅萃取1kg精油，芳樟醇+香茅醇协同，系情绪疗愈的黄金标准。',
  '日光橙花': '苦橙花蜡保留完整，抗敏修红效果优于普通橙花3.2倍，适合脆弱肌。',
  '大花茉莉': '坚持夜间手工采摘保证吲哚含量，微量吸入即可激活大脑多巴胺分泌。',
  '赤道依兰': '分级蒸馏提取“Extra”段，降血压效果在芳香疗法记录中位列前三。',
  '晨露天竺葵': '玫瑰香气的科学平替，有效平衡皮脂分泌，油痘肌日常护理首选。',
  '横断生姜': '姜烯酚活性极高，暖宫热敷配方的核心，经期不适缓解率达84%。',
  '佛手柑': '经过FCF脱呋喃处理，光敏性＜0.3%，白天使用无光敏性晒伤风险。',
  '喜悦红橘': 'd-柠檬烯占比高达95%，提振心情的同时能显著促进淋巴循环。',
  '苔原橡木苔': '绝对油非溶剂萃取，呈现森林地表原始气息，定香力长达8小时。',
  '晨曦葡萄柚': '低毒性高挥发，晨间扩香可提升代谢率12%（基于实验室动物模型）。',

  // 香系列
  '云感霜': '植物角鲨烷载体+5%极境复方精油，24h保湿力达87%，敏肌测试0刺激。',
  '晨曦液': '微分子喷雾技术，3秒渗透角质层，妆前使用可提升持妆力约2.1小时。',
  '月华油': '基底选用顶级冷榨荷荷巴，延展性极佳，按摩后完全吸收无油膜残留感。',
  '清冽发': '薄荷+茶树靶向作用于毛囊环境，临床观察4周头皮屑减少63%。',
  '润迹膏': '蜂蜡封护技术，局部修护皲裂口，在高原低氧干燥区实测修护力极强。',
  '止语雾': '雪松+岩兰草深度复方，办公空间喷洒3下，心率恢复平静均值仅需90秒。',
  '归处膏': '滚珠设计精准点涂太阳穴，通勤族主观头痛缓解率达91%。',
  '听泉露': '全水相基底易挥发，冥想开场时使用，受试者α脑波增幅明显（约23%）。',
  '微光氛': '柑橘+依兰协同提亮情绪，阴雨天使用后主观幸福感评分提升35%。',
  '深吸瓶': '便携式吸入器，呼吸急促时按压鼻翼使用，副交感神经激活速度加快。',
  '无界油': '含0.5%玫瑰+1%老山檀香，高阶情绪整合配方，显著提升静心深度。',
  '悬浮露': '纯露+微量精油，用于能量场清理，空间负离子浓度在喷洒后短暂上升。',
  '破晓珠': '红橘+葡萄柚瞬间唤醒嗅觉，晨起滚动手腕脉搏处，清醒速度显著加快。',
  '空寂水': '橡木苔+广藿香营造“空山新雨”感，焦虑自评量表（SAS）评分下降28%。',
  '共振方': '馆藏定制级复方，建议配合特定呼吸频率使用，实现身心同步共振。'
};

const CATEGORY_NARRATIVES: Record<Category, (n: string) => string> = {
  yuan: (n) => `“在 ${n} 的分子震颤中，找回生命在极限环境下的抗争记忆。”`,
  he: (n) => `“${n} 是 Alice 实验室关于身心频率重构的解法，让焦虑归于一息。”`,
  jing: (n) => `“器物是芳香的骨骼，${n} 让嗅觉在空间中有了诗性的栖居。”`
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

const addP = (cat: 'yuan'|'he'|'jing', group: string, n: string, en: string, folder: string, id: string, price: string, spec: string, override?: string) => {
  let heroUrl = override && override.startsWith('http') ? override : `${RAW_PROD}${folder}/${encodeURIComponent(override || `${en.trim()}.webp`)}${CACHE_V}`;
  DATABASE[id] = {
    id, category: cat, subGroup: group, name: n, herb: n, herbEn: en.toUpperCase().trim(),
    region: 'Extreme Origin', status: 'arrived_origin', visited: true, accent: '#D75437',
    price, specification: spec, hero: heroUrl,
    shortDesc: cat === 'yuan' ? '溯源单方' : (cat === 'he' ? '科学重构' : '芳香美学'), 
    narrative: ERIC_JOURNAL[n] || CATEGORY_NARRATIVES[cat](n),
    benefits: ['意识重构', '深度频率校准', '内在秩序恢复'],
    usage: '取三滴精油于掌心，温热后由鼻息深处缓慢引入。',
    precautions: 'UNIO 馆藏坚持高纯度。建议在专业指导下使用。',
    ericDiary: ERIC_JOURNAL[n] || `在 ${n} 的微光里，我找到了生命的顽强。`, 
    aliceDiary: `我们在实验室对 ${n} 进行冷压提纯，封存其原生信号。`,
    aliceLabDiary: ALICE_LAB_DIARY[n] || `GC/MS 质谱分析揭示了 ${n} 非凡的化学结构。`, 
    recommendation: '元香 UNIO 限量馆藏。仅为 1% 的觉知灵魂保留。'
  } as ScentItem;
};

const addD = (id:string, n:string, en:string, reg:string, c:number, img:string, pIds: string[] = [], s:'arrived'|'locked'='arrived', isCN:boolean=false, sub?:string) => {
  const hash = id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const fallback = ERIC_FALLBACKS[hash % ERIC_FALLBACKS.length];
  let diary = ERIC_JOURNAL[id] || ERIC_JOURNAL[`cn_${n}`] || ERIC_JOURNAL[n] || `在 ${n}，${fallback}`;
  
  DESTINATIONS[id] = {
    id, name:n, en, region:reg, status:s, visitCount:c, scenery:img, emoji:'📍',
    herbDescription: '极境原生分子档案', knowledge:'已存入 UNIO 核心库', productIds: pIds, isChinaProvince:isCN, subRegion:sub,
    ericDiary: diary, aliceDiary: `我们在实验室对 ${n} 的生态样本进行了分段提取。`, memoryPhotos: [img, img, img]
  };
};

// --- [产品库初始化] ---
const yuanData = [
  { group: 'Metal金', folder: 'metal', items: [['神圣乳香', 'Sacred Frankincense', '248', '10ml'], ['野性香茅', 'Citronella Clarissima', '248', '10ml'], ['冰川尤加利', 'Eucalyptus Glaciale', '98', '10ml'], ['原野茶树', 'Tea Tree Antiseptic', '98', '10ml'], ['巅峰薄荷', 'Peppermint from Peaks', '68', '10ml']] },
  { group: 'Wood木', folder: 'wood', items: [['老山檀香', 'Aged Sandalwood', '1,180', '10ml'], ['神圣花梨木', 'Sacred Rosewood Isle', '158', '10ml'], ['烟雨丝柏', 'Misty Cypress', '128', '10ml'], ['喜马雪松', 'Himalayan Cedar', '108', '10ml'], ['北地松针', 'Boreal Pine', '98', '10ml']] },
  { group: 'Water水', folder: 'water', items: [['秘境没药', 'Myrrh Secreta', '298', '10ml'], ['深根岩兰草', 'Deep Root Vetiver', '158', '10ml'], ['暗夜广藿香', 'Patchouli Nocturne', '158', '10ml'], ['琥珀安息香', 'Benzoin Ambrosia', '108', '10ml'], ['湖畔杜松', 'Juniper by the Loch', '98', '10ml']] },
  { group: 'Fire火', folder: 'fire', items: [['大马士革玫瑰', 'Damask Rose Aureate', '2,680', '10ml'], ['日光橙花', 'Neroli Soleil', '108', '10ml'], ['大花茉莉', 'Jasminum Grandiflorum', '108', '10ml'], ['赤道依兰', 'Ylang Equatorial', '180', '10ml'], ['晨露天竺葵', 'Geranium Rosé', '98', '10ml']] },
  { group: 'Earth土', folder: 'earth', items: [['横断生姜', 'Zingiber Terrae', '158', '10ml'], ['佛手柑', 'Bergamot Alba', '108', '10ml'], ['喜悦红橘', 'Mandarin Jucunda', '108', '10ml'], ['苔原橡木苔', 'Oakmoss Taiga', '108', '10ml'], ['晨曦葡萄柚', 'Grapefruit Pomona', '68', '10ml']] }
];
yuanData.forEach(g => g.items.forEach((item, j) => addP('yuan', `元 · ${g.group}`, item[0], item[1], g.folder, `yuan_${g.folder}_${j}`, item[2], item[3], item[4])));

const heData = [
  { group: 'Body身体', folder: 'body', items: [['云感霜', 'CLOUD VELVET', '268', '50ml'], ['晨曦液', 'DAWN GLOW', '228', '100ml'], ['月华油', 'MOONLIGHT OIL', '298', '30ml'], ['清冽发', 'FROST MINT', '198', '60ml'], ['润迹膏', 'TRACE BALM', '168', '15ml']] },
  { group: 'Mind心智', folder: 'heart', items: [['止语雾', 'SILENT MIST', '188', '100ml'], ['归处膏', 'SANCTUARY', '158', '10ml'], ['听泉露', 'ZEN FOUNTAIN', '248', '30ml'], ['微光氛', 'GLIMMER', '228', '30ml'], ['深吸瓶', 'DEEP BREATH', '138', '10ml']] },
  { group: 'Soul灵魂', folder: 'soul', items: [['无界油', 'BOUNDLESS', '328', '30ml'], ['悬浮露', 'FLOATING', '208', '100ml'], ['破晓珠', 'DAYBREAK', '148', '10ml'], ['空寂水', 'VOID MOSS', '198', '100ml'], ['共振方', 'RESONANCE FORMULA', '368', '30ml']] }
];
heData.forEach(g => g.items.forEach((item, j) => addP('he', `香 · ${g.group}`, item[0], item[1], g.folder, `he_${g.folder}_${j}`, item[2], item[3], item[4])));

const getProducts = (s: string) => Object.keys(DATABASE).slice(0, 3);

// --- [全球 51 坐标初始化] ---
addD('w_thai','泰国','THAILAND','亚洲',40,'https://images.unsplash.com/photo-1528127269322-539801943592?q=80&w=1200');
addD('w_in','印度','INDIA','亚洲',3,'https://images.unsplash.com/photo-1506461883276-594a12b11cf3?q=80&w=1200');
addD('w_hk','中国香港','HONG KONG','亚洲',18,`${RAW_DEST}Hongkong.webp${CACHE_V}`);
addD('w_my','马来西亚','MALAYSIA','亚洲',13,`${RAW_DEST}Malaysia.webp${CACHE_V}`);
addD('w_id','印度尼西亚','INDONESIA','亚洲',12,'https://images.unsplash.com/photo-1537996194471-e657df975ab4?q=80&w=1200');
addD('w_uae','阿联酋','UAE','亚洲',12,'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?q=80&w=1200');
addD('w_vn','越南','VIETNAM','亚洲',6,'https://images.unsplash.com/photo-1528127269322-539801943592?q=80&w=600');
addD('w_jp','日本','JAPAN','亚洲',2,'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?q=80&w=1200');
addD('w_ir','伊朗','IRAN','亚洲',2,`${RAW_DEST}Iran.webp${CACHE_V}`);
addD('w_sg','新加坡','SINGAPORE','亚洲',2,`${RAW_DEST}Singapore.webp${CACHE_V}`);
addD('w_kr','韩国','SOUTH KOREA','亚洲',1,'https://images.unsplash.com/photo-1517154421773-0529f29ea451?q=80&w=1200');
addD('w_np','尼泊尔','NEPAL','亚洲',2,'https://images.unsplash.com/photo-1544735716-392fe2489ffa?q=80&w=1200');
addD('w_tr','土耳其','TURKEY','亚洲',8,'https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?q=80&w=1200');
addD('w_kz','哈萨克斯坦','KAZAKHSTAN','亚洲',4,'https://images.unsplash.com/photo-1563245372-f21724e3856d?q=80&w=1200');
addD('w_jo','约旦','JORDAN','亚洲',2,'https://images.unsplash.com/photo-1547234935-80c7145ec969?q=80&w=1200');
addD('w_mac','中国澳门','MACAU','亚洲',2,`${RAW_DEST}Macao.webp${CACHE_V}`);
addD('w_kh','柬埔寨','CAMBODIA','亚洲',1,`${RAW_DEST}Cambodia.webp${CACHE_V}`);
addD('w_kp','朝鲜','NORTH KOREA','亚洲',1,`${RAW_DEST}North%20Korea.webp${CACHE_V}`);
addD('w_lk','斯里兰卡','SRI LANKA','亚洲',2,'https://images.unsplash.com/photo-1546708973-b339540b5162?q=80&w=1200');
addD('w_fr','法国','FRANCE','欧洲',5,'https://images.unsplash.com/photo-1499002238440-d264edd596ec?q=80&w=1200');
addD('w_de','德国','GERMANY','欧洲',4,'https://images.unsplash.com/photo-1467269204594-9661b134dd2b?q=80&w=1200');
addD('w_it','意大利','ITALY','欧洲',2,'https://images.unsplash.com/photo-1523906834658-6e24ef2386f9?q=80&w=1200');
addD('w_uk','英国','UK','欧洲',0,'https://images.unsplash.com/photo-1486299267070-83823f5448dd?q=80&w=1200', [], 'locked');
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
addD('w_sa','南非','SOUTH AFRICA','非洲',12,`${RAW_DEST}South%20africa.webp${CACHE_V}`);
addD('w_eg','埃及','EGYPT','非洲',2,`${RAW_DEST}Egypt.webp${CACHE_V}`);
addD('w_ke','肯尼亚','KENYA','非洲',2,`${RAW_DEST}Kenya.webp${CACHE_V}`);
addD('w_mg','马达加斯加','MADAGASCAR','非洲',0,`${RAW_DEST}Madagascar.webp${CACHE_V}`, [], 'locked');
addD('w_zw','津巴布韦','ZIMBABWE','非洲',1,`${RAW_DEST}Zimbabwe.webp${CACHE_V}`);
addD('w_mu','毛里求斯','MAURITIUS','非洲',1,`${RAW_DEST}Mauritius.webp${CACHE_V}`);
addD('w_ma','摩洛哥','MOROCCO','非洲',0,'https://images.unsplash.com/photo-1489493585363-d69421e0edd3?q=80&w=1200', [], 'locked');
addD('w_us','美国','USA','美洲/大洋洲',7,'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=1200');
addD('w_ca','加拿大','CANADA','美洲/大洋洲',0,'https://images.unsplash.com/photo-1503614472-8c93d56e92ce?q=80&w=1200', [], 'locked');
addD('w_br','巴西','BRAZIL','美洲/大洋洲',8,`${RAW_DEST}Brazil.webp${CACHE_V}`);
addD('w_au','澳大利亚','AUSTRALIA','美洲/大洋洲',0,'https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?q=80&w=1200', [], 'locked');
addD('w_an','南极洲','ANTARCTICA','美洲/大洋洲',0,'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=1200', [], 'locked');
addD('w_mx','墨西哥','MEXICO','美洲/大洋洲',4,`${RAW_DEST}Mexico.webp${CACHE_V}`);
addD('w_ar','阿根廷','ARGENTINA','美洲/大洋洲',1,`${RAW_DEST}Argentina.webp${CACHE_V}`);
addD('w_ht','海地','HAITI','美洲/大洋洲',0,`${RAW_DEST}Haiti.webp${CACHE_V}`, [], 'locked');
addD('w_pe','秘鲁','PERU','美洲/大洋洲',0,'https://images.unsplash.com/photo-1526392060635-9d6019884377?q=80&w=1200', [], 'locked');
addD('w_cu','古巴','CUBA','美洲/大洋洲',0,'https://images.unsplash.com/photo-1506461883276-594a12b11cf3?q=80&w=1200', [], 'locked');

// --- [神州 34 坐标全覆盖] ---
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
  '广东': 'guangdong.webp', '广西': 'guangxi.webp', '海南': 'hainan.webp', '香港': 'hongkong.webp', '澳门': 'macao.webp',
  '重庆': 'chongqing.webp', '四川': 'sichuan.webp', '贵州': 'guizhou.webp', '云南': 'yunnan.webp', '西藏': 'xizang.webp',
  '陕西': 'shannxi.webp', '甘肃': 'gansu.webp', '青海': 'qinghai.webp', '宁夏': 'ningxia.webp', '新疆': 'xinjiang.webp'
};

Object.entries(PROVINCE_GROUPS).forEach(([sub, list]) => {
  list.forEach(prov => {
    const id = `cn_${prov}`;
    const en = prov.toUpperCase();
    const img = `${PROVINCE_BASE}${PROVINCE_FILE_MAP[prov] || 'beijing.webp'}${CACHE_V}`;
    addD(id, prov, en, '亚洲', 5, img, getProducts(prov), 'arrived', true, sub);
  });
});
