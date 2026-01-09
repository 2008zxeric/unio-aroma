
import { ScentItem, Destination } from './types';

/**
 * 品牌资产注册表 (Media Registry)
 */
export const ASSET_REGISTRY = {
  brand: {
    logo: 'https://raw.githubusercontent.com/2008zxeric/unio-aroma/main/logo.png',
    qr_code: 'https://images.unsplash.com/photo-1557838923-2985c318be48?q=80&w=400',
    hero_home: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=1920', 
    hero_story: 'https://images.unsplash.com/photo-1471922694854-ff1b63b20054?q=80&w=1200',
    fallback: 'https://images.unsplash.com/photo-1493246507139-91e8bef99c02?q=80&w=1200',
    xhs_link: 'https://xhslink.com/m/AcZDZuYhsVd'
  },
  visual_anchors: {
    yuan: 'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?q=80&w=800',
    he: 'https://images.unsplash.com/photo-1601049541289-9b1b7bbbfe19?q=80&w=800',
    vessel: 'https://images.unsplash.com/photo-1544413647-ad342111a43a?q=80&w=800',
    incense: 'https://images.unsplash.com/photo-1505394033323-4241b2213fd3?q=80&w=800',
    space: 'https://images.unsplash.com/photo-1512331283953-199ed3000636?q=80&w=800',
    placeholder: 'https://images.unsplash.com/photo-1540555700478-4be289fbecee?q=80&w=800'
  }
};

/**
 * 产品图片覆盖表 (从实验室导出后粘贴至此)
 */
export const PRODUCT_OVERRIDES: Record<string, string> = {};

export const ASSETS = {
  logo: ASSET_REGISTRY.brand.logo,
  rednote_qr: ASSET_REGISTRY.brand.qr_code,
  hero_zen: ASSET_REGISTRY.brand.hero_home,
  hero_forest: ASSET_REGISTRY.brand.hero_story,
  heroFallback: ASSET_REGISTRY.brand.fallback,
  xhs_link: ASSET_REGISTRY.brand.xhs_link
};

const getPic = (i: number, sig: string) => {
  const ids = ['1464822759023-fed622ff2c3b', '1506744038136-46273834b3fb', '1441974231531-c6227db76b6e', '1499002238440-d264edd596ec', '1530789253388-582c481c54b0', '1519681393784-d120267933ba', '1501785888041-af3ef285b470', '1500530855697-b586d89ba3ee'];
  const id = ids[i % ids.length];
  return `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&q=80&w=1200&sig=${sig}`;
};

export const DATABASE: Record<string, ScentItem> = {};

// 1. 元系列 (Origin)
const YUAN_DEFS = [
  { g: '金 · 肃降', items: ['神圣乳香', '极境薄荷', '极境尤加利', '极境茶树', '极境香茅'] },
  { g: '木 · 生发', items: ['老山檀香', '极境丝柏', '极境雪松', '极境松针', '神圣花梨木'] },
  { g: '水 · 润泽', items: ['极境杜松', '极境岩兰草', '极境广藿香', '极境没药', '极境安息香'] },
  { g: '火 · 释放', items: ['大马士革玫瑰', '极境依兰', '极境茉莉', '极境橙花', '极境天竺葵'] },
  { g: '土 · 稳定', items: ['极境佛手柑', '横断生姜', '极境红橘', '极境葡萄柚', '极境橡木苔'] }
];

YUAN_DEFS.forEach((group, gIdx) => {
  group.items.forEach((name, i) => {
    const id = `y_${gIdx * 5 + i + 1}`;
    DATABASE[id] = {
      id, category: 'yuan', subGroup: group.g, name, herb: name, herbEn: 'PURE ESSENCE',
      region: '全球', status: 'arrived', visited: true, accent: '#D75437',
      hero: PRODUCT_OVERRIDES[id] || ASSET_REGISTRY.visual_anchors.yuan,
      shortDesc: '极境高纯度单方萃取 / 99.9% 纯度',
      narrative: '每一滴液体，都曾是植物为了在极境生存而进化的防御意志。',
      benefits: ['频率修复', '感官平衡'], aliceLabDiary: 'GC-MS 质谱分析显示其烯烃类组分比例处于黄金稳态，极具神经舒缓潜力。',
      recommendation: '直接扩香或调配。', usage: '取1滴于掌心嗅吸。', precautions: '高浓度请勿直涂。'
    };
  });
});

// 2. 和系列 (Harmony)
const HE_DEFS = [
  { g: '身 · 能量', items: [
    { n: '云感 · 玫瑰檀香润肤霜', e: 'Cloud Velvet Body Cream', ing: '奥图玫瑰 / 老山檀香' },
    { n: '晨曦 · 葡萄柚生姜沐浴露', e: 'Dawn Glow Shower Gel', ing: '极境葡萄柚 / 横断生姜' },
    { n: '月华 · 依兰天竺葵身体油', e: 'Moonlight Body Oil', ing: '特级依兰 / 天竺葵' },
    { n: '清冽 · 尤加利薄荷洗发水', e: 'Frost Mint Shampoo', ing: '尤加利 / 椒样薄荷' },
    { n: '润迹 · 丝柏护手精华', e: 'Trace Cypress Hand Balm', ing: '地中海丝柏 / 雪松' }
  ]},
  { g: '心 · 疗愈', items: [
    { n: '止语 · 薰衣草岩兰草枕边喷雾', e: 'Silent Lavender Mist', ing: '高地薰衣草 / 岩兰草' },
    { n: '归处 · 橙花佛手柑舒缓膏', e: 'Neroli Sanctuary Balm', ing: '摩洛哥橙花 / 佛手柑' },
    { n: '听泉 · 洋甘菊广藿香凝露', e: 'Zen Fountain Gel', ing: '罗马洋甘菊 / 广藿香' },
    { n: '微光 · 茉莉红橘淡香氛', e: 'Glimmer Jasmine Mist', ing: '大花茉莉 / 红橘' },
    { n: '深吸 · 杜松子乳香清吸瓶', e: 'Deep Breath Inhaler', ing: '杜松子 / 神圣乳香' }
  ]},
  { g: '灵 · 觉醒', items: [
    { n: '无界 · 没药乳香冥想油', e: 'Boundless Meditation Oil', ing: '索马里没药 / 神圣乳香' },
    { n: '悬浮 · 杜松雪松觉醒露', e: 'Floating Awakening Dew', ing: '喜马拉雅雪松 / 杜松' },
    { n: '破晓 · 香蜂草滚珠精萃', e: 'Daybreak Herbal Elixir', ing: '香蜂草 / 迷迭香' },
    { n: '空寂 · 橡木苔安息香香水', e: 'Void Moss Parfum', ing: '橡木苔 / 安息香' },
    { n: '共振 · 檀香鼠尾草复方', e: 'Resonant Sage Blend', ing: '澳洲檀香 / 快乐鼠尾草' }
  ]}
];

HE_DEFS.forEach((group, gIdx) => {
  group.items.forEach((item, i) => {
    const id = `h_${gIdx * 5 + i + 1}`;
    DATABASE[id] = {
      id, category: 'he', subGroup: group.g, name: item.n, herb: item.n, herbEn: item.e,
      region: '实验室', status: 'arrived', visited: true, accent: '#1C39BB',
      hero: PRODUCT_OVERRIDES[id] || ASSET_REGISTRY.visual_anchors.he,
      shortDesc: `核心成分：${item.ing}`,
      narrative: `基于${group.g.split(' · ')[0]}维度的频率修复，${item.n}旨在打破感官的日常茧房。`,
      benefits: ['身心对齐', '能量修复'], aliceLabDiary: `针对 ${item.ing} 的协同效应进行了微秒级频率微调，显著降低皮质醇水平。`,
      recommendation: '日常护理。', usage: '取适量均匀涂抹或喷洒。', precautions: '避开伤口。'
    };
  });
});

// 3. 境系列 (Sanctuary)
const JING_DEFS = [
  { g: '场 · 净愈', items: [
    { n: '极境 · 冰裂纹手作陶瓷扩香皿', e: 'Crackled Ceramic Diffuser', ing: '景德镇手作 / 高温白釉', img: ASSET_REGISTRY.visual_anchors.vessel },
    { n: '素空 · 天然多孔矿石扩香座', e: 'Void Mineral Stone', ing: '天然火山岩 / 矿石', img: ASSET_REGISTRY.visual_anchors.space },
    { n: '隐迹 · 胡桃木车载扩香器', e: 'Hidden Walnut Car Diffuser', ing: '北美胡桃木 / 黄铜', img: 'https://images.unsplash.com/photo-1544413647-ad342111a43a?q=80&w=800' },
    { n: '流岚 · 磨砂质感扩香机', e: 'Mistflow Ultrasonic Diffuser', ing: '纳米超声波 / 极简白', img: 'https://images.unsplash.com/photo-1512331283953-199ed3000636?q=80&w=800' },
    { n: '归藏 · 铝合金旅行扩香盒', e: 'Alloy Travel Scent Box', iing: '航空铝材 / 精密切削', img: ASSET_REGISTRY.visual_anchors.space }
  ]},
  { g: '意 · 冥想', items: [
    { n: '一炷 · 降真香手工线香', e: 'Zen Sinking Incense', ing: '野生降真香 / 沉香粉', img: ASSET_REGISTRY.visual_anchors.incense },
    { n: '定念 · 黄铜倒流香座', e: 'Gilded Bronze Censer', ing: '实心黄铜 / 手工敲制', img: 'https://images.unsplash.com/photo-1505394033323-4241b2213fd3?q=80&w=800' },
    { n: '观照 · 极简黑檀木插香座', e: 'Insight Minimalist Holder', ing: '黑檀木 / 极简几何', img: 'https://images.unsplash.com/photo-1494438639946-1ebd1d20bf85?q=80&w=800' },
    { n: '止观 · 纯手工植物蜡烛', e: 'Mindful Botanical Candle', ing: '天然大豆蜡 / 植物精油', img: 'https://images.unsplash.com/photo-1512331283953-199ed3000636?q=80&w=800' },
    { n: '息灾 · 手工铜制灭烟铃', e: 'Blessing Candle Snuffer', ing: '手工铜件 / 岁月的光泽', img: ASSET_REGISTRY.visual_anchors.vessel }
  ]}
];

JING_DEFS.forEach((group, gIdx) => {
  group.items.forEach((item, i) => {
    const id = `j_${gIdx * 5 + i + 1}`;
    DATABASE[id] = {
      id, category: 'jing', subGroup: group.g, name: item.n, herb: item.n, herbEn: item.e,
      region: '艺术工坊', status: 'arrived', visited: true, accent: '#D4AF37',
      hero: PRODUCT_OVERRIDES[id] || item.img,
      shortDesc: `材质工艺：${item.ing}`,
      narrative: `重塑场域的物理边界。${item.n}是气味与视觉、触觉的终极和解。`,
      benefits: ['美学修辞', '感官沉浸'], aliceLabDiary: '材质的多孔率与分子的扩散速率呈完美的对数正比。',
      recommendation: '静态陈设。', usage: '配合元或和系列精油使用。', precautions: '手工陶瓷易碎。'
    };
  });
});

export const DESTINATIONS: Record<string, Destination> = {};

/**
 * Eric 真实足迹地图
 */
const ERIC_REAL_MAP = {
  '亚洲': [
    { n: '泰国', c: 40, pIds: ['y_22', 'h_2'] },
    { n: '中国', c: 23, pIds: ['y_2', 'h_1'], isHome: true },
    { n: '中国香港', c: 18, pIds: ['h_10'] },
    { n: '马来西亚', c: 13, pIds: ['y_15'] },
    { n: '印度尼西亚', c: 12, pIds: ['y_13', 'y_14'] },
    { n: '阿联酋', c: 12, pIds: ['y_1', 'y_13'] },
    { n: '越南', c: 6, pIds: ['y_15', 'j_6'] },
    { n: '哈萨克斯坦', c: 4, pIds: ['y_3'] },
    { n: '印度', c: 3, pIds: ['y_7', 'y_19'] },
    { n: '日本', c: 2, pIds: ['y_9', 'j_1'] },
    { n: '伊朗', c: 2, pIds: ['y_16'] },
    { n: '约旦', c: 2, pIds: ['y_1'] },
    { n: '中国澳门', c: 2, pIds: ['h_10'] },
    { n: '新加坡', c: 2, pIds: ['h_5'] },
    { n: '韩国', c: 1, pIds: ['y_10'] },
    { n: '柬埔寨', c: 1, pIds: ['y_22'] },
    { n: '朝鲜', c: 1, pIds: ['y_3'] },
    { n: '斯里兰卡', c: 0, l: true },
    { n: '尼泊尔', c: 0, l: true }
  ],
  '欧洲': [
    { n: '土耳其', c: 8, pIds: ['y_16', 'y_19'] },
    { n: '波兰', c: 5, pIds: ['y_5'] },
    { n: '法国', c: 5, pIds: ['y_16', 'y_18'] },
    { n: '德国', c: 4, pIds: ['h_8'] },
    { n: '意大利', c: 2, pIds: ['y_21'] },
    { n: '奥地利', c: 2, pIds: ['y_5'] },
    { n: '丹麦', c: 2, pIds: ['y_10'] },
    { n: '匈牙利', c: 2, pIds: ['h_6'] },
    { n: '西班牙', c: 1, pIds: ['y_24'] },
    { n: '荷兰', c: 1, pIds: ['y_19'] },
    { n: '摩纳哥', c: 1, pIds: ['h_9'] },
    { n: '卢森堡', c: 1, pIds: ['y_4'] },
    { n: '保加利亚', c: 0, l: true },
    { n: '英国', c: 0, l: true },
    { n: '葡萄牙', c: 0, l: true },
    { n: '希腊', c: 0, l: true }
  ],
  '非洲': [
    { n: '南非', c: 12, pIds: ['y_20', 'h_2'] },
    { n: '肯尼亚', c: 2, pIds: ['y_1'] },
    { n: '埃及', c: 2, pIds: ['y_18'] },
    { n: '津巴布韦', c: 1, pIds: ['y_2'] },
    { n: '马达加斯加', c: 0, l: true },
    { n: '摩洛哥', c: 0, l: true }
  ],
  '美洲/大洋洲': [
    { n: '美国', c: 7, pIds: ['y_2', 'y_24'] },
    { n: '墨西哥', c: 4, pIds: ['y_24'] },
    { n: '巴西', c: 8, pIds: ['y_23', 'y_20'] },
    { n: '海地', c: 0, l: true },
    { n: '阿根廷', c: 0, l: true },
    { n: '澳大利亚', c: 0, l: true }
  ]
};

let globalIdx = 0;
Object.entries(ERIC_REAL_MAP).forEach(([region, list]) => {
  list.forEach((item) => {
    const id = `dest_${globalIdx}`;
    DESTINATIONS[id] = {
      id, name: item.n, en: item.n.toUpperCase(), region, 
      status: item.l ? 'locked' : 'arrived',
      visitCount: item.c,
      scenery: getPic(globalIdx, id),
      emoji: '📍', 
      herbDescription: `${item.n}极境实录`, 
      knowledge: '极境分子图谱已解码。', 
      productIds: item.pIds || [],
      ericDiary: `在 ${item.n} 的第 ${item.c} 次寻香，我感受到了大地深处传来的律动。`,
      aliceDiary: `该坐标样本显示出极其稳定的分子频率。`,
      memoryPhotos: [getPic(globalIdx+10, id+'_m1'), getPic(globalIdx+11, id+'_m2'), getPic(globalIdx+12, id+'_m3')],
    };
    globalIdx++;
  });
});

const CHINA_MAP = {
  '华南': ['广东', '海南', '广西'],
  '华东': ['浙江', '江苏', '安徽'],
  '华北': ['黑龙江', '吉林', '辽宁'],
  '华西': ['四川', '云南', '西藏'],
  '华中': ['湖北', '湖南', '河南']
};

Object.entries(CHINA_MAP).forEach(([sub, list]) => {
  list.forEach((name, i) => {
    const id = `cn_${sub}_${name}`;
    let pIds: string[] = [];
    if (name === '西藏') pIds = ['y_1', 'h_11']; 
    if (name === '云南') pIds = ['y_22', 'h_2']; 
    if (name === '浙江') pIds = ['j_1', 'j_6']; 

    DESTINATIONS[id] = {
      id, name, en: name + ', CHINA', region: '亚洲', status: 'arrived',
      visitCount: 23,
      scenery: getPic(i + 100, id),
      emoji: '📍', herbDescription: '神州极境寻踪', knowledge: '原生分子图谱已解码。', 
      productIds: pIds,
      ericDiary: `在神州 ${name}，气味是写在大地上的家书。`,
      aliceDiary: `神州原生植物的二级代谢物具有独特的抗氧化活性。`,
      memoryPhotos: [getPic(i+110, id+'_m1'), getPic(i+111, id+'_m2'), getPic(i+112, id+'_m3')],
      isChinaProvince: true, subRegion: sub
    };
  });
});
