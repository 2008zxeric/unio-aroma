import { supabase } from './supabase';
import { ScentItem, Destination } from './types';

const RAW_BASE = 'https://raw.githubusercontent.com/2008zxeric/unio-aroma/main/assets/';
const ERIC_PHOTO_BASE = `${RAW_BASE}ericphoto/`;
const RAW_DEST = `${RAW_BASE}destinations/`;
const PROVINCE_BASE = `${RAW_BASE}province/`;
const CACHE_V = '?v=1008.67';

// 省份文件名映射（与 constants.tsx 保持一致）
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

// 省份区域分组（与 constants.tsx 保持一致）
const PROVINCE_GROUPS: Record<string, string[]> = {
  '华北': ['北京', '天津', '河北', '山西', '内蒙古'],
  '东北': ['辽宁', '吉林', '黑龙江'],
  '华东': ['上海', '江苏', '浙江', '安徽', '福建', '江西', '山东', '台湾'],
  '华中': ['河南', '湖北', '湖南'],
  '华南': ['广东', '广西', '海南', '香港', '澳门'],
  '西南': ['重庆', '四川', '贵州', '云南', '西藏'],
  '西北': ['陕西', '甘肃', '青海', '宁夏', '新疆']
};

// 神州省份日记（与 constants.tsx 保持一致）
const PROVINCE_JOURNALS: Record<string, string> = {
  '北京': '红墙与古松。干燥的冬日空气里，带着一种历经千载的肃穆与威严，沉静得让人不忍大声呼吸。',
  '天津': '海河边的槐花落满石板路，咸腥水汽混着煎饼馃子的芝麻香。北方港口的市井诗。',
  '河北': '太行山崖柏在风中析出树脂。那是燕赵大地骨子里的刚烈与清苦。',
  '山西': '平遥古城醋坊，酸香穿透百年木梁。晋商的精明，酿在每一滴陈醋里。',
  '内蒙古': '辽阔的草原。草尖的苦味在风中疾走，那是自由的味道，没有任何阻拦，直到天地尽头。',
  '辽宁': '大连海滨，槐花甜香混着海蛎子的腥。',
  '吉林': '长白山天池畔，冷杉与雪松的针叶在寒风中释放清冽。',
  '黑龙江': '北地的针叶林。松针被冻结后的清香，伴随着柴火燃烧的烟火气。',
  '上海': '梧桐絮飘过石库门，咖啡香混着黄浦江水汽。',
  '江苏': '苏州园林，雨打芭蕉的湿气混着茉莉花茶。',
  '浙江': '西湖的龙井。不仅是味觉，那是嗅觉上的青绿山水。',
  '安徽': '黄山云雾茶，松枝熏焙的微烟混着兰花香。',
  '福建': '武夷山岩茶，焙火香中透出矿物质冷感。',
  '江西': '庐山云雾缭绕，茶树与竹林共吐清芬。',
  '山东': '泰山脚下，松涛阵阵，混着煎饼卷大葱的粗犷。',
  '台湾': '阿里山云海，桧木清香混着高山乌龙茶的冷韵。',
  '河南': '洛阳牡丹谢后，泥土中仍残留脂粉甜香。',
  '湖北': '武汉东湖，荷花凋零后莲蓬的微苦混着长江水腥。',
  '湖南': '岳麓山下，湘江水汽裹着辣椒与腊肉的辛香。',
  '广东': '荔枝花开的季节，岭南的空气是甜腻而温润的。',
  '广西': '桂林漓江，晨雾中桂花甜香混着喀斯特岩壁的湿冷。',
  '海南': '黎寨里的沉香烟。海风吹过椰林的咸，与那抹近乎神圣的木质香气。',
  '香港': '霓虹灯与咸水味之间，藏着中药材与旧书页的复杂叠影。',
  '澳门': '大三巴的石阶上，葡式蛋挞焦糖香混着妈阁庙的线香。',
  '重庆': '山城雾都，火锅牛油香穿透层层楼阁。巴渝的江湖气。',
  '四川': '峨眉山的竹林深处，空气湿冷而寂静。苔藓的清苦气息。',
  '贵州': '黔东南苗寨，酸汤鱼的发酵香混着杉木吊脚楼的潮气。',
  '云南': '云雾缭绕的茶山。潮湿的红土、野花的芬芳与古茶树的深邃。',
  '西藏': '冈仁波齐脚下，经幡在风中飞舞。柏木烟雾让灵魂变得轻盈。',
  '陕西': '西安城墙下，石榴花落满青砖。十三朝古都的厚重。',
  '甘肃': '莫高窟外的戈壁。黄沙的干燥气息混合着古老壁画的陈香。',
  '青海': '茶卡盐湖，结晶盐粒在阳光下蒸腾出矿物冷香。',
  '宁夏': '贺兰山下，枸杞晒场飘出微甜药香。',
  '新疆': '赛里木湖的蓝是不讲理的。空气里有冰川融水的冷冽。'
};

// 生成中国省份的 destinations 数据
function generateChinaProvinces(): Record<string, Destination> {
  const provinces: Record<string, Destination> = {};
  
  Object.entries(PROVINCE_GROUPS).forEach(([subRegion, list]) => {
    list.forEach(province => {
      const id = `cn_${province}`;
      const fileName = PROVINCE_FILE_MAP[province] || 'beijing.webp';
      
      // 香港和澳门使用 destinations 目录，其余使用 province 目录
      let sceneryUrl = `${PROVINCE_BASE}${fileName}${CACHE_V}`;
      if (province === '香港' || province === '澳门') {
        sceneryUrl = `${RAW_DEST}${fileName}${CACHE_V}`;
      }
      
      provinces[id] = {
        id,
        name: province,
        en: province,
        region: '亚洲',
        status: 'arrived',
        visitCount: 5,
        scenery: sceneryUrl,
        emoji: '📍',
        herbDescription: '',
        knowledge: PROVINCE_JOURNALS[province] || '',
        productIds: [],
        isChinaProvince: true,
        subRegion,
        ericDiary: PROVINCE_JOURNALS[province] || '',
        aliceDiary: '',
        memoryPhotos: [sceneryUrl, sceneryUrl, sceneryUrl],
      };
    });
  });
  
  return provinces;
}

// 记忆照片前缀映射（3字母缩写 → 文件前缀）
const PHOTO_PREFIX_MAP: Record<string, string> = {
  'w_thai': 'tha', 'w_in': 'inn', 'w_hk': '', 'w_my': 'mal', 'w_id': '',
  'w_uae': 'uae', 'w_vn': 'vie', 'w_jp': '', 'w_phl': '', 'w_ir': '',
  'w_sg': '', 'w_kr': '', 'w_np': '', 'w_tr': 'tur', 'w_kz': '',
  'w_jo': 'jor', 'w_mac': '', 'w_kh': '', 'w_kp': '', 'w_lk': '',
  'w_fr': '', 'w_de': '', 'w_it': '', 'w_uk': '', 'w_is': '',
  'w_es': '', 'w_nl': 'net', 'w_pl': '', 'w_at': '', 'w_dk': '',
  'w_hu': '', 'w_mc': '', 'w_lu': '', 'w_pt': '', 'w_bg': '',
  'w_sa': '', 'w_eg': '', 'w_ke': '', 'w_mg': '', 'w_zw': '',
  'w_mu': '', 'w_ma': '', 'w_us': '', 'w_ca': '', 'w_br': '',
  'w_au': '', 'w_an': '', 'w_mx': '', 'w_ar': '', 'w_ht': '',
  'w_pe': '', 'w_cu': '',
};

// 记忆照片映射（从 constants.tsx 复制，匹配原始数据源）
const MEMORY_PHOTOS_MAP: Record<string, string[]> = {};

// 从 code 推导记忆照片 URL
function getMemoryPhotos(code: string): string[] {
  if (code.startsWith('cn_')) {
    const provName = code.replace('cn_', '');
    const fileName = PROVINCE_FILE_MAP[provName] || 'beijing.webp';
    const baseUrl = (provName === '香港' || provName === '澳门') ? RAW_DEST : PROVINCE_BASE;
    return [
      `${baseUrl}${fileName}${CACHE_V}`,
      `${baseUrl}${fileName}${CACHE_V}`,
      `${baseUrl}${fileName}${CACHE_V}`
    ];
  }
  const prefix = PHOTO_PREFIX_MAP[code] || code.replace('w_', '').toLowerCase().slice(0, 3);
  return [
    `${ERIC_PHOTO_BASE}${prefix}1.webp${CACHE_V}`,
    `${ERIC_PHOTO_BASE}${prefix}2.webp${CACHE_V}`,
    `${ERIC_PHOTO_BASE}${prefix}3.webp${CACHE_V}`
  ];
}

// 根据 category 字段推断图片文件夹
// GitHub 目录: metal, wood, water, fire, earth, body, heart, soul, place, Meditation
function getProductFolder(category: string, series_code: string): string {
  // category 格式如 "元·Metal"、"元·Wood"、"元·Water" 等
  const categoryMap: Record<string, string> = {
    // 元系列
    '元·Metal': 'metal', '元·Wood': 'wood', '元·Water': 'water',
    '元·Fire': 'fire', '元·Earth': 'earth',
    // 和系列
    '和·Body': 'body', '和·Heart': 'heart', '和·Soul': 'soul',
    '和·Mind': 'soul',  // Mind 用 soul 目录
    // 生系列 - 都用 body 目录作为 fallback（hydrosol 目录为空）
    '生·润养': 'body', '生·清净': 'body', '生·舒缓': 'body',
    // 香系列
    '香·凝思之物': 'Meditation', '香·芳香美学': 'place',
    // 净系列
    '净·空间': 'place', '净·冥想': 'Meditation',
  };
  
  const folder = categoryMap[category] || '';
  if (folder) return folder;
  
  // fallback 到 series_code
  const seriesMap: Record<string, string> = {
    'yuan': 'metal',
    'he': 'body',
    'sheng': 'body',
    'xiang': 'place',
    'you': 'body',
  };
  return seriesMap[series_code] || '';
}

// 精确映射：name_en（Supabase）→ GitHub 实际文件名（含大小写/空格差异）
const PRODUCT_IMAGE_MAP: Record<string, string> = {
  // 元·Metal → metal
  'Sacred Frankincense': 'Sacred%20Frankincense.webp',
  'Eucalyptus Glaciale': '%20Eucalyptus%20Glaciale.webp',
  'Tea Tree Antiseptic': 'Tea%20Tree%20Antiseptic.webp',
  'Peppermint from Peaks': 'Peppermint%20from%20Peaks.webp',
  'Citronella Clarissima': 'Citronella%20Clarissima.webp',
  // 元·Wood → wood
  'Aged Sandalwood': 'Aged%20Sandalwood.webp',
  'Misty Cypress': 'Misty%20Cypress.webp',
  'Himalayan Cedar': 'Himalayan%20Cedar.webp',
  'Boreal Pine': 'Boreal%20Pine.webp',
  'Sacred Rosewood Isle': 'Sacred%20Rosewood%20Isle.webp',
  // 元·Water → water
  'Myrrh Secreta': 'Myrrh%20Secreta.webp',
  'Deep Root Vetiver': 'Deep%20Root%20Vetiver.webp',
  'Patchouli Nocturne': 'Patchouli%20Nocturne.webp',
  'Juniper by the Loch': 'Juniper%20by%20the%20Loch.webp',
  'Benzoin Ambrosia': 'Benzoin%20Ambrosia.webp',
  // 元·Fire → fire
  'Damask Rose Aureate': 'Damask%20Rose%20Aureate.webp',
  'Ylang Equatorial': 'Ylang%20Equatorial.webp',
  'Jasminum Grandiflorum': 'Jasminum%20Grandiflorum.webp',
  'Neroli Soleil': 'Neroli%20Soleil.webp',
  'Geranium Rosé': 'Geranium%20Ros%C3%A9.webp',
  // 元·Earth → earth
  'Bergamot Alba': 'Bergamot%20Alba.webp',
  'Zingiber Terrae': 'Zingiber%20Terrae.webp',
  'Mandarin Jucunda': 'Mandarin%20Jucunda.webp',
  'Grapefruit Pomona': 'Grapefruit%20Pomona.webp',
  'Oakmoss Taiga': 'Oakmoss%20Taiga.webp',
  // 和·Body → body
  'Cloud Velvet': 'cloud%20velvet.webp',
  'Dawn Glow': 'Dawn%20Glow.webp',
  'Moonlight Oil': 'Moonlight%20Oil.webp',
  'Frost Mint': 'Frost%20Mint.webp',
  'Trace Balm': 'Trace%20Balm.webp',
  // 香·芳香美学 → place
  'Crackled': 'Crackled.webp',
  'Necklace': 'Necklace%20.webp',
  'Walnut': 'Walnut.webp',
  'Candle': 'candle.webp',
  'Vessel': 'Vessel.webp',
  // 香·凝思之物 → Meditation
  'Incense Sticks': 'Incense%20Sticks.webp',
  'Rollerball': 'Rollerball.webp',
  'Gypsum': 'Gypsum.webp',
  'Mountain': 'mountain.webp',
  'Glass': 'glass.webp',
};

// 将 Supabase 产品数据转换为 ScentItem 格式
function transformProduct(product: any): ScentItem {
  let heroUrl = product.image_url || '';
  
  // 如果数据库没有图片 URL，尝试从 GitHub 抓取
  if (!heroUrl) {
    const folder = getProductFolder(product.category || '', product.series_code || '');
    const nameEn = (product.name_en || '').trim();
    
    if (folder && nameEn) {
      // 优先用精确映射表处理大小写/空格差异
      if (PRODUCT_IMAGE_MAP[nameEn]) {
        heroUrl = `${RAW_BASE}products/${folder}/${PRODUCT_IMAGE_MAP[nameEn]}${CACHE_V}`;
      } else {
        // fallback：用 name_en 直接拼接
        const fileName = nameEn.replace(/ /g, '%20') + '.webp';
        heroUrl = `${RAW_BASE}products/${folder}/${fileName}${CACHE_V}`;
      }
    }
  }
  
  // 如果还是空的，用占位图
  if (!heroUrl) {
    heroUrl = 'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=600&q=80';
  }

  return {
    id: product.code,
    category: product.series_code as any,
    subGroup: product.group_name,
    name: product.name_cn,
    location: product.element,
    region: product.element,
    status: 'arrived' as const,
    visited: true,
    accent: product.alice_lab || '',
    hero: heroUrl,
    herb: product.name_cn,
    herbEn: product.name_en || '',
    price: product.price?.toString(),
    specification: product.specification,
    shortDesc: product.description?.substring(0, 50) || '',
    narrative: product.narrative || product.description || '',
    benefits: (() => {
      const b = product.benefits;
      if (!b) return [];
      if (typeof b === 'string') {
        try { return JSON.parse(b); } catch { return []; }
      }
      return Array.isArray(b) ? b : [];
    })(),
    isPopular: product.is_active,
    emoji: '',
    ericDiary: product.eric_diary || product.narrative || '',
    aliceDiary: product.alice_diary || product.alice_lab || '',
    aliceLabDiary: product.alice_lab || product.alice_diary || '',
    recommendation: product.usage || '',
    usage: product.usage || '',
    precautions: product.precautions || '',
    isPlaceholder: false,
  };
}

// 加载所有产品
export async function loadProducts(): Promise<Record<string, ScentItem>> {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('is_active', true)
    .order('sort_order', { ascending: true });

  if (error) {
    console.error('Error loading products:', error);
    return {};
  }

  const products: Record<string, ScentItem> = {};
  data?.forEach((product) => {
    products[product.code] = transformProduct(product);
  });

  return products;
}

// 加载所有国家/目的地
export async function loadDestinations(): Promise<Record<string, Destination>> {
  const { data, error } = await supabase
    .from('countries')
    .select('*')
    .order('sort_order', { ascending: true });

  if (error) {
    console.error('Error loading destinations:', error);
    return {};
  }

  const destinations: Record<string, Destination> = {};
  
  // 先添加中国省份（静态数据，与 constants.tsx 保持一致）
  const chinaProvinces = generateChinaProvinces();
  Object.assign(destinations, chinaProvinces);
  
  // 再添加 Supabase 里的国家数据
  data?.forEach((country) => {
    // countries 表使用 id (UUID) 作为唯一标识
    const destId = country.id;
    // is_china 列不存在，默认为 false
    const isChina = (country as any).is_china === true;
    // 推导图片 URL（优先用 image_url，否则用 scenery_url）
    let sceneryUrl = country.image_url || country.scenery_url || '';

    destinations[destId] = {
      id: destId,
      name: country.name_cn,
      en: country.name_en || '',
      region: country.region || '',
      status: country.is_active ? 'arrived' : 'locked',
      visitCount: country.visit_count || 0,
      scenery: sceneryUrl,
      emoji: '📍',
      herbDescription: country.description || '',
      knowledge: country.description || '',
      productIds: [],
      isChinaProvince: isChina,
      subRegion: country.sub_region || '',
      ericDiary: country.eric_diary || '',
      aliceDiary: '',
      memoryPhotos: [],
    };
  });

  return destinations;
}
