
export interface InventoryProduct {
  id: string;
  name: string;
  enName?: string;
  botanicalName?: string;
  origin?: string;
  method?: string;
  site?: string;
  supplierCode?: string;
  category: 'base' | 'essential' | 'hydrosol';
  
  // 3ml
  cost3ml?: number;
  priceB3ml?: number;
  priceC3ml?: number;
  
  // 5ml
  cost5ml?: number;
  priceB5ml?: number;
  priceC5ml?: number;
  
  // 100ml
  cost100ml?: number;
  priceB100ml?: number;
  priceC100ml?: number;
  
  // 500ml
  cost500ml?: number;
  priceB500ml?: number;
  priceC500ml?: number;
  
  // 1000ml
  cost1000ml?: number;
  priceB1000ml?: number;
  priceC1000ml?: number;

  cost10ml?: number; // Legacy/Additional
  cost1L?: number;   // Legacy/Additional
  
  priceB?: number;
  priceC?: number;
  stock: number; // in ml
  unit: string;
  specifications?: {
    size: string;
    cost?: number;
    priceB?: number;
    priceC?: number;
  }[];
}

export interface Transaction {
  id: string;
  date: string;
  type: 'purchase' | 'sale';
  productId: string;
  productName: string;
  amount: number; // quantity
  unit: string;
  price: number; // total price for this transaction
  customerType?: 'B' | 'C';
  note?: string;
  shippingStatus?: 'pending' | 'shipped' | 'delivered';
  performedBy?: string;
}

export const INITIAL_BASE_OILS: InventoryProduct[] = [
  { id: 'JC1001', name: '甜杏仁油', enName: 'Almond Oil', botanicalName: 'Prunus amygdalus var. dulcis', origin: '英国', method: '冷压榨', site: '果仁', category: 'base', cost1L: 84, cost10ml: 0.84, stock: 0, unit: 'ml', specifications: [{ size: '10ml', cost: 0.84, priceC: 38 }, { size: '15ml', priceC: 52 }] },
  { id: 'JC1002', name: '酪梨油', enName: 'Avocado Oil', botanicalName: 'Persea americana', origin: '英国', method: '冷压榨', site: '果肉', category: 'base', cost1L: 181, cost10ml: 1.81, stock: 0, unit: 'ml', specifications: [{ size: '10ml', cost: 1.81, priceC: 68 }, { size: '15ml', priceC: 98 }] },
  { id: 'JC1003', name: '葡萄籽油', enName: 'Grapeseed Oil', botanicalName: 'Vitis vinifera', origin: '英国', method: '冷压榨', site: '籽', category: 'base', cost1L: 99, cost10ml: 0.99, stock: 0, unit: 'ml', specifications: [{ size: '10ml', cost: 0.99, priceC: 45 }, { size: '15ml', priceC: 65 }] },
  { id: 'JC1004', name: '小麦胚芽油', enName: 'Wheatgerm Oil', botanicalName: 'Triticum vulgare', origin: '英国', method: '冷压榨', site: '胚芽', category: 'base', cost1L: 135, cost10ml: 1.35, stock: 0, unit: 'ml', specifications: [{ size: '10ml', cost: 1.35, priceC: 58 }, { size: '15ml', priceC: 85 }] },
  { id: 'JC1005', name: '纯橄榄油', enName: 'Olive oil', botanicalName: 'Olea europaea', origin: '英国', method: '冷压榨', site: '果', category: 'base', cost1L: 115, cost10ml: 1.15, stock: 0, unit: 'ml', specifications: [{ size: '10ml', cost: 1.15, priceC: 52 }, { size: '15ml', priceC: 75 }] },
  { id: 'JC1006', name: '金色荷荷巴油', enName: 'Jojoba Oil', botanicalName: 'Simmondsia chinensis', origin: '西班牙', method: '冷压榨', site: '籽', category: 'base', cost1L: 263, cost10ml: 2.63, stock: 0, unit: 'ml', specifications: [{ size: '10ml', cost: 2.63, priceC: 98 }, { size: '15ml', priceC: 142 }] },
  { id: 'JC1007', name: '透明荷荷巴油', enName: 'Jojoba Oil', botanicalName: 'Simmondsia chinensis', origin: '西班牙', method: '冷压榨', site: '籽', category: 'base', cost1L: 263, cost10ml: 2.63, stock: 0, unit: 'ml', specifications: [{ size: '10ml', cost: 2.63, priceC: 98 }, { size: '15ml', priceC: 142 }] },
  { id: 'JC1008', name: '葵花籽油', enName: 'Sunflower Oil', botanicalName: 'Helianthus annuus', origin: '英国', method: '冷压榨', site: '籽', category: 'base', cost1L: 90, cost10ml: 0.9, stock: 0, unit: 'ml', specifications: [{ size: '10ml', cost: 0.9, priceC: 42 }, { size: '15ml', priceC: 60 }] },
  { id: 'JC1010', name: '榛果油', enName: 'Hazelnut Oil', botanicalName: 'Corylus avellana', origin: '英国', method: '冷压榨', site: '果', category: 'base', cost1L: 104, cost10ml: 1.04, stock: 0, unit: 'ml', specifications: [{ size: '10ml', cost: 1.04, priceC: 48 }, { size: '15ml', priceC: 70 }] },
  { id: 'JC1011', name: '月见草油', enName: 'Evening Primrose oil', botanicalName: 'Oenothera biennis', origin: '英国', method: '冷压榨', site: '籽', category: 'base', cost1L: 184, cost10ml: 1.84, stock: 0, unit: 'ml', specifications: [{ size: '10ml', cost: 1.84, priceC: 78 }, { size: '15ml', priceC: 115 }] },
  { id: 'JC1012', name: '玫瑰果油', enName: 'Rose hip seed oil', botanicalName: 'Rosa rubiginosa', origin: '英国', method: '冷压榨', site: '果', category: 'base', cost1L: 356, cost10ml: 3.56, stock: 0, unit: 'ml', specifications: [{ size: '10ml', cost: 3.56, priceC: 158 }, { size: '15ml', priceC: 228 }] },
  { id: 'JC1014', name: '山茶籽油', enName: 'Camellia oil', botanicalName: 'Camellia japonica', origin: '中国', method: '冷压榨', site: '籽', category: 'base', cost1L: 98, cost10ml: 0.98, stock: 0, unit: 'ml', specifications: [{ size: '10ml', cost: 0.98, priceC: 45 }, { size: '15ml', priceC: 65 }] },
  { id: 'JC1015', name: '芝麻油', enName: 'Sesame oil', botanicalName: 'Sesamum indicum', origin: '印度', method: '冷压榨', site: '籽', category: 'base', cost1L: 90, cost10ml: 0.9, stock: 0, unit: 'ml', specifications: [{ size: '10ml', cost: 0.9, priceC: 42 }, { size: '15ml', priceC: 60 }] },
  { id: 'JC1016', name: '椰子油', enName: 'Coconut oil', botanicalName: 'Cocos nucifera', origin: '菲律宾', method: '冷压榨', site: '果肉', category: 'base', cost1L: 62, cost10ml: 0.62, stock: 0, unit: 'ml', specifications: [{ size: '10ml', cost: 0.62, priceC: 32 }, { size: '15ml', priceC: 46 }] },
  { id: 'JC1016A', name: '椰子油(印尼)', enName: 'Coconut oil', botanicalName: 'Cocos nucifera', origin: '印尼', method: '冷压榨', site: '果肉', category: 'base', cost1L: 104, cost10ml: 1.04, stock: 0, unit: 'ml', specifications: [{ size: '10ml', cost: 1.04, priceC: 48 }, { size: '15ml', priceC: 70 }] },
  { id: 'JC1017', name: '坚果油', enName: 'Macadamia oil', botanicalName: 'Macadamia ternifolia', origin: '澳洲', method: '冷压榨', site: '果', category: 'base', cost1L: 155, cost10ml: 1.55, stock: 0, unit: 'ml', specifications: [{ size: '10ml', cost: 1.55, priceC: 68 }, { size: '15ml', priceC: 98 }] },
  { id: 'JC1018', name: '琉璃苣油', enName: 'Borage oil', botanicalName: 'Borago officinalis', origin: '英国', method: '冷压榨', site: '籽', category: 'base', cost1L: 449, cost10ml: 4.49, stock: 0, unit: 'ml', specifications: [{ size: '10ml', cost: 4.49, priceC: 198 }, { size: '15ml', priceC: 288 }] },
  { id: 'JC1019', name: '圣约翰草油', enName: "St. John's Wort oil", botanicalName: 'Hypericum perforatum', origin: '澳洲', method: '橄榄油浸泡', site: '花朵', category: 'base', cost1L: 356, cost10ml: 3.56, stock: 0, unit: 'ml', specifications: [{ size: '10ml', cost: 3.56, priceC: 168 }, { size: '15ml', priceC: 245 }] },
  { id: 'JC1020', name: '核桃油', enName: 'Walnut oil', botanicalName: 'Juglans regia', origin: '澳洲', method: '冷压榨', site: '果仁', category: 'base', cost1L: 123, cost10ml: 1.23, stock: 0, unit: 'ml', specifications: [{ size: '10ml', cost: 1.23, priceC: 58 }, { size: '15ml', priceC: 85 }] },
  { id: 'JC1021', name: '金盏花油', enName: 'Calendula oil', botanicalName: 'Calendula officinalis', origin: '印度', method: '橄榄油浸泡', site: '花朵', category: 'base', cost1L: 363, cost10ml: 3.63, stock: 0, unit: 'ml', specifications: [{ size: '10ml', cost: 3.63, priceC: 168 }, { size: '15ml', priceC: 245 }] },
  { id: 'JC1023', name: '乳木果油', enName: 'Shea Butter', botanicalName: 'Butyrospermum parkii', origin: '非洲', method: '冷压榨', site: '果', category: 'base', cost1L: 131, cost10ml: 1.31, stock: 0, unit: 'ml', specifications: [{ size: '10ml', cost: 1.31, priceC: 58 }, { size: '15ml', priceC: 85 }] },
  { id: 'JC1024', name: '亚麻籽油', enName: 'Linseed oil', botanicalName: 'Linum usitatissimum', origin: '尼泊尔', method: '冷压榨', site: '籽', category: 'base', cost1L: 116, cost10ml: 1.16, stock: 0, unit: 'ml', specifications: [{ size: '10ml', cost: 1.16, priceC: 52 }, { size: '15ml', priceC: 75 }] },
  { id: 'JC1026', name: '沙棘果油', enName: 'Sea buckthorn oil', botanicalName: 'Hippophae rhamnoides', origin: '尼泊尔', method: '冷压榨', site: '果', category: 'base', cost1L: 310, cost10ml: 3.1, stock: 0, unit: 'ml', specifications: [{ size: '10ml', cost: 3.1, priceC: 138 }, { size: '15ml', priceC: 200 }] },
  { id: 'JC1027', name: '石榴籽油', enName: 'Pomegranate seed oil', botanicalName: 'Punica granatum', origin: '尼泊尔', method: '冷压榨', site: '籽', category: 'base', cost1L: 426, cost10ml: 4.26, stock: 0, unit: 'ml', specifications: [{ size: '10ml', cost: 4.26, priceC: 188 }, { size: '15ml', priceC: 275 }] },
  { id: 'JC1028', name: '琼崖海棠油', enName: 'Tamanu oil', botanicalName: 'Calophyllum inophyllum', origin: '美国', method: '冷压榨', site: '果仁', category: 'base', cost1L: 779, cost10ml: 7.79, stock: 0, unit: 'ml', specifications: [{ size: '10ml', cost: 7.79, priceC: 348 }, { size: '15ml', priceC: 508 }] },
  { id: 'JC1030', name: '杏桃仁油', enName: 'Apricot Kernel Oil', botanicalName: 'Prunus armeniaca', origin: '澳洲', method: '冷压榨', site: '籽', category: 'base', cost1L: 118, cost10ml: 1.18, stock: 0, unit: 'ml', specifications: [{ size: '10ml', cost: 1.18, priceC: 52 }, { size: '15ml', priceC: 75 }] },
  { id: 'JC1031', name: '芦荟油', enName: 'Aloe Oil', botanicalName: 'Aloe barbadensis', origin: '台湾', method: '浸泡油', site: '芦荟叶', category: 'base', cost1L: 121, cost10ml: 1.21, stock: 0, unit: 'ml', specifications: [{ size: '10ml', cost: 1.21, priceC: 55 }, { size: '15ml', priceC: 80 }] },
  { id: 'JC1032', name: '白池花籽油', enName: 'Meadowfoam seed oil', botanicalName: 'Limnanthes alba', origin: '美国', method: '冷压榨', site: '花籽', category: 'base', cost1L: 409, cost10ml: 4.09, stock: 0, unit: 'ml', specifications: [{ size: '10ml', cost: 4.09, priceC: 188 }, { size: '15ml', priceC: 275 }] },
  { id: 'JC1033', name: '分馏椰子油', enName: 'Coconut oil', botanicalName: 'Cocos nucifera', origin: '中国', method: '冷压榨分馏', site: '果肉', category: 'base', cost1L: 139, cost10ml: 1.39, stock: 0, unit: 'ml', specifications: [{ size: '10ml', cost: 1.39, priceC: 62 }, { size: '15ml', priceC: 90 }] },
  { id: 'JC1034', name: '仙人掌籽油', enName: 'Prickly Pear Seed Oil', botanicalName: 'Opuntia ficus-indica', origin: '摩洛哥', method: '冷压榨', site: '仙人掌籽', category: 'base', cost1L: 6100, cost10ml: 61, stock: 0, unit: 'ml', specifications: [{ size: '10ml', cost: 61, priceC: 880 }, { size: '15ml', priceC: 1320 }] },
  { id: 'JC1035', name: '山金车油', enName: 'Arnica Infused Oil', botanicalName: 'Arnica montana', origin: '英国', method: '葵花籽油浸泡', site: '花', category: 'base', cost1L: 540, cost10ml: 5.4, stock: 0, unit: 'ml', specifications: [{ size: '10ml', cost: 5.4, priceC: 238 }, { size: '15ml', priceC: 345 }] },
];

export const INITIAL_ESSENTIAL_OILS: InventoryProduct[] = [
  { id: 'y1', name: '大马士革玫瑰(双有机)', enName: 'Rose Otto', botanicalName: 'Rosa damascena mill.', origin: '保加利亚', method: '蒸馏 / 花', category: 'essential', cost100ml: 10005, priceB: 15800, stock: 0, unit: 'ml', specifications: [{ size: '2ml', cost: 550, priceB: 858, priceC: 1558 }] },
  { id: 'y2', name: '大马士革玫瑰(有机)', enName: 'Rose Otto', botanicalName: 'Rosa damascena mill.', origin: '保加利亚', method: '蒸馏 / 花', category: 'essential', cost100ml: 9800, priceB: 13800, stock: 0, unit: 'ml', specifications: [{ size: '5ml', cost: 580, priceB: 780, priceC: 1358 }] },
  { id: 'y3', name: '大花茉莉净油(原精)', enName: 'Jasmine absolute', botanicalName: 'Jasminum officinale', origin: '印度', method: '溶剂 / 花', category: 'essential', cost100ml: 5314.2, priceB: 8580, stock: 0, unit: 'ml', specifications: [{ size: '2ml', cost: 280, priceB: 458, priceC: 858 }] },
  { id: 'y4', name: '玫瑰天竺葵', enName: 'Geranium rosat', botanicalName: 'Pelargonium roseum', origin: '法国', method: '蒸馏 / 花与叶', category: 'essential', cost100ml: 575, priceB: 958, stock: 0, unit: 'ml', specifications: [{ size: '5ml', cost: 75, priceB: 128, priceC: 258 }] },
  { id: 'y5', name: '天竺葵/香叶油', enName: 'Geranium', botanicalName: 'P. graveolens', origin: '埃及', method: '蒸馏 / 花与叶', category: 'essential', cost100ml: 402.3, priceB: 658, stock: 0, unit: 'ml', specifications: [{ size: '5ml', cost: 60, priceB: 98, priceC: 158 }] },
  { id: 'y6', name: '天竺葵/香叶油(有机)', enName: 'Geranium (ORG)', botanicalName: 'P. graveolens', origin: '埃及', method: '蒸馏 / 花与叶', category: 'essential', cost100ml: 536.3, priceB: 858, stock: 0, unit: 'ml', specifications: [{ size: '5ml', cost: 70, priceB: 118, priceC: 188 }] },
  { id: 'y7', name: '波旁天竺葵', enName: 'Geranium Bourbon', botanicalName: 'P. asperum', origin: '法国', method: '蒸馏 / 花与叶', category: 'essential', cost100ml: 249.8, priceB: 458, stock: 0, unit: 'ml', specifications: [{ size: '5ml', cost: 53, priceB: 88, priceC: 158 }] },
  { id: 'y8', name: '真薰衣草 (有机)', enName: 'Lavender provence', botanicalName: 'L. angustifolia', origin: '法国', method: '蒸馏 / 花与枝', category: 'essential', cost100ml: 368.8, priceB: 558, stock: 0, unit: 'ml', specifications: [{ size: '5ml', cost: 60, priceB: 98, priceC: 188 }] },
  { id: 'y9', name: '真薰衣草 (高地)', enName: 'Lavender french', botanicalName: 'L. angustifolia', origin: '法国', method: '蒸馏 / 花与枝', category: 'essential', cost100ml: 251, priceB: 458, stock: 0, unit: 'ml', specifications: [{ size: '5ml', cost: 55, priceB: 88, priceC: 158 }] },
  { id: 'y10', name: '桉油醇迷迭香', enName: 'Rosemary', botanicalName: 'R. officinalis', origin: '南非', method: '蒸馏 / 全株', category: 'essential', cost100ml: 120.8, priceB: 258, stock: 0, unit: 'ml', specifications: [{ size: '5ml', cost: 40, priceB: 68, priceC: 128 }] },
  { id: 'y11', name: '完全依兰依兰 (有机)', enName: 'Ylang ylang', botanicalName: 'Cananga odorata', origin: '马达加斯加', method: '蒸馏 / 花', category: 'essential', cost100ml: 487.5, priceB: 758, stock: 0, unit: 'ml', specifications: [{ size: '5ml', cost: 70, priceB: 118, priceC: 218 }] },
  { id: 'y12', name: '特级依兰依兰 (有机)', enName: 'Ylang ylang (ORG)', botanicalName: 'Cananga odorata', origin: '马达加斯加', method: '蒸馏 / 花', category: 'essential', cost100ml: 514.8, priceB: 858, stock: 0, unit: 'ml', specifications: [{ size: '5ml', cost: 79, priceB: 128, priceC: 258 }] },
  { id: 'y13', name: '依兰依兰-III段', enName: 'Ylang ylang iii', botanicalName: 'Cananga odorata', origin: '马达加斯加', method: '蒸馏 / 花', category: 'essential', cost100ml: 295.1, priceB: 458, stock: 0, unit: 'ml', specifications: [{ size: '5ml', cost: 66, priceB: 98, priceC: 158 }] },
  { id: 'y14', name: '依兰依兰-I段', enName: 'Ylang ylang i', botanicalName: 'Cananga odorata', origin: '马达加斯加', method: '蒸馏 / 花', category: 'essential', cost100ml: 572.5, priceB: 958, stock: 0, unit: 'ml', specifications: [{ size: '5ml', cost: 113, priceB: 168, priceC: 358 }] },
  { id: 'y15', name: '蓝胶尤加利', enName: 'Eucalyptus Blue', botanicalName: 'E. globulus', origin: '澳洲', method: '蒸馏 / 叶', category: 'essential', cost100ml: 97.8, priceB: 158, stock: 0, unit: 'ml', specifications: [{ size: '5ml', cost: 30, priceB: 58, priceC: 88 }] },
  { id: 'y16', name: '澳洲茶树', enName: 'Tea tree', botanicalName: 'M. alternifolia', origin: '澳洲', method: '蒸馏 / 叶', category: 'essential', cost100ml: 122.2, priceB: 258, stock: 0, unit: 'ml', specifications: [{ size: '5ml', cost: 35, priceB: 58, priceC: 98 }] },
  { id: 'y17', name: '澳洲茶树 (有机)', enName: 'Tea tree (ORG)', botanicalName: 'M. alternifolia', origin: '澳洲', method: '蒸馏 / 叶', category: 'essential', cost100ml: 236.3, priceB: 458, stock: 0, unit: 'ml', specifications: [{ size: '5ml', cost: 70, priceB: 118, priceC: 188 }] },
  { id: 'y18', name: '芳枸叶', enName: 'Fragonia', botanicalName: 'Agonis fragrans', origin: '澳洲', method: '蒸馏 / 叶', category: 'essential', cost100ml: 1221.9, priceB: 1980, stock: 0, unit: 'ml', specifications: [{ size: '5ml', cost: 85, priceB: 158, priceC: 358 }] },
  { id: 'y19', name: '甜橙', enName: 'Orange sweet', botanicalName: 'C. sinensis', origin: '意大利', method: '压榨 / 果皮', category: 'essential', cost100ml: 65, priceB: 158, stock: 0, unit: 'ml', specifications: [{ size: '5ml', cost: 30, priceB: 58, priceC: 88 }] },
  { id: 'y20', name: '甜橙 (有机)', enName: 'Orange sweet', botanicalName: 'C. sinensis', origin: '墨西哥', method: '压榨 / 果皮', category: 'essential', cost100ml: 161.3, priceB: 288, stock: 0, unit: 'ml', specifications: [{ size: '5ml', cost: 50, priceB: 88, priceC: 158 }] },
  { id: 'y21', name: '柠檬 (有机)', enName: 'Lemon', botanicalName: 'Citrus limon', origin: '意大利', method: '压榨 / 果皮', category: 'essential', cost100ml: 240.3, priceB: 458, stock: 0, unit: 'ml', specifications: [{ size: '5ml', cost: 49, priceB: 88, priceC: 158 }] },
  { id: 'y22', name: '柠檬', enName: 'Lemon', botanicalName: 'Citrus limonum', origin: '意大利', method: '压榨 / 果皮', category: 'essential', cost100ml: 94.5, priceB: 188, stock: 0, unit: 'ml', specifications: [{ size: '5ml', cost: 35, priceB: 58, priceC: 98 }] },
  { id: 'y23', name: '佛手柑', enName: 'Bergamot', botanicalName: 'C. bergamia', origin: '意大利', method: '压榨 / 果皮', category: 'essential', cost100ml: 120.2, priceB: 258, stock: 0, unit: 'ml', specifications: [{ size: '5ml', cost: 50, priceB: 88, priceC: 158 }] },
  { id: 'y24', name: '粉红葡萄柚', enName: 'Grapefruit (rose)', botanicalName: 'Citrus paradisi', origin: '南非', method: '压榨 / 果皮', category: 'essential', cost100ml: 142.4, priceB: 258, stock: 0, unit: 'ml', specifications: [{ size: '5ml', cost: 45, priceB: 78, priceC: 138 }] },
  { id: 'y25', name: '椒样薄荷', enName: 'Peppermint', botanicalName: 'Mentha piperita', origin: '中国', method: '蒸馏 / 全株', category: 'essential', cost100ml: 97.2, priceB: 158, stock: 0, unit: 'ml', specifications: [{ size: '5ml', cost: 40, priceB: 68, priceC: 98 }] },
  { id: 'y26', name: '欧薄荷', enName: 'Peppermint', botanicalName: 'Mentha piperita', origin: '美国', method: '蒸馏 / 全株', category: 'essential', cost100ml: 138.9, priceB: 258, stock: 0, unit: 'ml', specifications: [{ size: '5ml', cost: 58, priceB: 98, priceC: 158 }] },
  { id: 'y27', name: '欧薄荷 (有机)', enName: 'Peppermint', botanicalName: 'Mentha piperita', origin: '印度', method: '蒸馏 / 全株', category: 'essential', cost100ml: 298.8, priceB: 558, stock: 0, unit: 'ml', specifications: [{ size: '5ml', cost: 78, priceB: 128, priceC: 228 }] },
  { id: 'y28', name: '绿薄荷', enName: 'Spearmint', botanicalName: 'Mentha spicata', origin: '美国', method: '蒸馏 / 全株', category: 'essential', cost100ml: 106.7, priceB: 188, stock: 0, unit: 'ml', specifications: [{ size: '5ml', cost: 40, priceB: 68, priceC: 118 }] },
  { id: 'y29', name: '清凉薄荷', enName: 'Cornmint', botanicalName: 'Mentha arvensis', origin: '尼泊尔', method: '蒸馏 / 全株', category: 'essential', cost100ml: 107.3, priceB: 188, stock: 0, unit: 'ml', specifications: [{ size: '5ml', cost: 55, priceB: 88, priceC: 128 }] },
  { id: 'y30', name: '苦橙叶', enName: 'Petitgrain', botanicalName: 'Citrus aurantium', origin: '巴拉圭', method: '蒸馏 / 叶', category: 'essential', cost100ml: 243, priceB: 458, stock: 0, unit: 'ml', specifications: [{ size: '5ml', cost: 45, priceB: 78, priceC: 158 }] },
  { id: 'y31', name: '橙花 (Neroli)', enName: 'Neroli', botanicalName: 'C. aurantium', origin: '意大利', method: '蒸馏 / 花', category: 'essential', cost100ml: 4571.3, priceB: 6580, stock: 0, unit: 'ml', specifications: [{ size: '3ml', cost: 192, priceB: 358, priceC: 658 }] },
  { id: 'y32', name: '橙花(印度)', enName: 'Neroli', botanicalName: 'Citrus aurantium', origin: '印度', method: '蒸馏 / 花', category: 'essential', cost100ml: 987.5, priceB: 1580, stock: 0, unit: 'ml', specifications: [{ size: '3ml', cost: 86, priceB: 138, priceC: 258 }] },
  { id: 'y33', name: '意大利永久花', enName: 'Helichrysum', botanicalName: 'Helichrysum italicum', origin: '克罗地亚', method: '蒸馏 / 花', category: 'essential', cost100ml: 3795, priceB: 5580, stock: 0, unit: 'ml', specifications: [{ size: '3ml', cost: 230, priceB: 358, priceC: 658 }] },
  { id: 'y34', name: '意大利永久花(有机)', enName: 'Helichrysum (ORG)', botanicalName: 'Helichrysum italicum', origin: '法国', method: '蒸馏 / 花', category: 'essential', cost100ml: 6497.5, priceB: 9800, stock: 0, unit: 'ml', specifications: [{ size: '3ml', cost: 320, priceB: 558, priceC: 958 }] },
  { id: 'y35', name: '罗马洋甘菊', enName: 'Chamomile Roman', botanicalName: 'Anthemis nobilis', origin: '英国', method: '蒸馏 / 花', category: 'essential', cost100ml: 1538.8, priceB: 2580, stock: 0, unit: 'ml', specifications: [{ size: '5ml', cost: 219, priceB: 358, priceC: 558 }] },
  { id: 'y36', name: '德国洋甘菊', enName: 'Chamomile German', botanicalName: 'Matricaria chamomilla', origin: '尼泊尔', method: '蒸馏 / 花', category: 'essential', cost100ml: 1548.8, priceB: 2580, stock: 0, unit: 'ml', specifications: [{ size: '5ml', cost: 205, priceB: 358, priceC: 558 }] },
  { id: 'y37', name: '德国洋甘菊(有机)', enName: 'Chamomile (ORG)', botanicalName: 'Matricaria chamomilla', origin: '保加利亚', method: '蒸馏 / 花', category: 'essential', cost100ml: 2219.5, priceB: 3580, stock: 0, unit: 'ml', specifications: [{ size: '5ml', cost: 299, priceB: 458, priceC: 688 }] },
  { id: 'y38', name: '东印度檀香', enName: 'Sandalwood White', botanicalName: 'Santalum album', origin: '印度', method: '蒸馏 / 木质', category: 'essential', cost100ml: 5474, priceB: 8580, stock: 0, unit: 'ml', specifications: [{ size: '3ml', cost: 390, priceB: 588, priceC: 1258 }] },
  { id: 'y39', name: '东印度檀香(ISO级)', enName: 'Sandalwood White', botanicalName: 'Santalum album', origin: '印度', method: '蒸馏 / 树芯', category: 'essential', cost100ml: 8349, priceB: 12580, stock: 0, unit: 'ml', specifications: [{ size: '2ml', cost: 480, priceB: 758, priceC: 1580 }] },
  { id: 'y40', name: '印尼檀香', enName: 'Sandalwood', botanicalName: 'Sandalwood', origin: '印尼', method: '蒸馏 / 木质', category: 'essential', cost100ml: 580, priceB: 5800, stock: 0, unit: 'ml', specifications: [{ size: '5ml', cost: 80, priceB: 280, priceC: 558 }] },
  { id: 'y41', name: '澳洲檀香', enName: 'Sandalwood', botanicalName: 'Sandalwood', origin: '澳州', method: '蒸馏 / 木质', category: 'essential', cost100ml: 3800, priceB: 5800, stock: 0, unit: 'ml', specifications: [{ size: '5ml', cost: 580, priceB: 980, priceC: 1280 }] },
  { id: 'y42', name: '广藿香', enName: 'Patchouli', botanicalName: 'Pogostemon cablin', origin: '印尼', method: '蒸馏 / 叶', category: 'essential', cost100ml: 243, priceB: 458, stock: 0, unit: 'ml', specifications: [{ size: '5ml', cost: 53, priceB: 88, priceC: 158 }] },
  { id: 'y43', name: '岩兰草', enName: 'Vetiver', botanicalName: 'V. zizanoides', origin: '印尼', method: '蒸馏 / 根', category: 'essential', cost100ml: 295, priceB: 488, stock: 0, unit: 'ml', specifications: [{ size: '5ml', cost: 69, priceB: 118, priceC: 188 }] },
  { id: 'y44', name: '丝柏', enName: 'Cypress', botanicalName: 'C. sempervirens', origin: '西班牙', method: '蒸馏 / 叶果', category: 'essential', cost100ml: 183.6, priceB: 358, stock: 0, unit: 'ml', specifications: [{ size: '5ml', cost: 65, priceB: 98, priceC: 158 }] },
  { id: 'y45', name: '没药', enName: 'Myrrh', botanicalName: 'Commiphora myrrha', origin: '索马里', method: '蒸馏 / 树脂', category: 'essential', cost100ml: 1556.3, priceB: 2580, stock: 0, unit: 'ml', specifications: [{ size: '5ml', cost: 125, priceB: 198, priceC: 358 }] },
  { id: 'y46', name: '乳香(全成分)', enName: 'Frankincense', botanicalName: 'Boswellia carterii', origin: '埃塞俄比亚', method: '超临界CO2', category: 'essential', cost100ml: 252.5, priceB: 458, stock: 0, unit: 'ml', specifications: [{ size: '5ml', cost: 81, priceB: 128, priceC: 188 }] },
  { id: 'y47', name: '乳香', enName: 'Frankincense', botanicalName: 'Boswellia carterii', origin: '索马里', method: '蒸馏 / 树脂', category: 'essential', cost100ml: 725, priceB: 1250, stock: 0, unit: 'ml', specifications: [{ size: '5ml', cost: 125, priceB: 198, priceC: 358 }] },
  { id: 'y48', name: '百里酚百里香', enName: 'Thyme CT Thymol', botanicalName: 'Thymus Thymol', origin: '西班牙', method: '蒸馏 / 全株', category: 'essential', cost100ml: 273.8, priceB: 458, stock: 0, unit: 'ml', specifications: [{ size: '5ml', cost: 97, priceB: 158, priceC: 228 }] },
  { id: 'y49', name: '丁香花蕾', enName: 'Clove bud', botanicalName: 'S. aromaticum', origin: '马达加斯加', method: '蒸馏 / 花苞', category: 'essential', cost100ml: 209.3, priceB: 388, stock: 0, unit: 'ml', specifications: [{ size: '5ml', cost: 57, priceB: 88, priceC: 158 }] },
  { id: 'y50', name: '黑胡椒', enName: 'Black pepper', botanicalName: 'Piper nigrum L.', origin: '印度', method: '蒸馏 / 果实', category: 'essential', cost100ml: 237.6, priceB: 458, stock: 0, unit: 'ml', specifications: [{ size: '5ml', cost: 60, priceB: 98, priceC: 158 }] },
  { id: 'y51', name: '生姜', enName: 'Ginger', botanicalName: 'Zingiber officinale', origin: '马达加斯加', method: '蒸馏 / 根茎', category: 'essential', cost100ml: 250.4, priceB: 458, stock: 0, unit: 'ml', specifications: [{ size: '5ml', cost: 58, priceB: 98, priceC: 158 }] },
  { id: 'y52', name: '姜黄', enName: 'Curcuma', botanicalName: 'Curcuma longa L.', origin: '马达加斯加', method: '蒸馏 / 根部', category: 'essential', cost100ml: 387.5, priceB: 658, stock: 0, unit: 'ml', specifications: [{ size: '5ml', cost: 80, priceB: 128, priceC: 188 }] },
  { id: 'y53', name: '快乐鼠尾草(有机)', enName: 'Clary sage', botanicalName: 'Salvia sclarea', origin: '南非', method: '蒸馏 / 全株', category: 'essential', cost100ml: 395, priceB: 658, stock: 0, unit: 'ml', specifications: [{ size: '5ml', cost: 106, priceB: 168, priceC: 258 }] },
  { id: 'y54', name: '快乐鼠尾草', enName: 'Clary sage', botanicalName: 'Salvia sclarea', origin: '东欧', method: '蒸馏 / 全株', category: 'essential', cost100ml: 402.5, priceB: 658, stock: 0, unit: 'ml', specifications: [{ size: '5ml', cost: 55, priceB: 98, priceC: 188 }] },
  { id: 'y55', name: '柠檬草', enName: 'Lemongrass', botanicalName: 'C. flexuosus', origin: '尼泊尔', method: '蒸馏 / 全株', category: 'essential', cost100ml: 93.8, priceB: 188, stock: 0, unit: 'ml', specifications: [{ size: '5ml', cost: 49, priceB: 78, priceC: 128 }] },
  { id: 'y56', name: '柠檬草/柠檬香茅油', enName: 'Lemongrass', botanicalName: 'Cymbopogon citratus', origin: '马来西亚', method: '蒸馏 / 全株', category: 'essential', cost100ml: 79.7, priceB: 158, stock: 0, unit: 'ml', specifications: [{ size: '5ml', cost: 49, priceB: 78, priceC: 118 }] },
  { id: 'y57', name: '野生香蜂草油', enName: 'Melissa type', botanicalName: 'Melissa Officinalis', origin: '法国', method: '蒸馏 / 全株', category: 'essential', cost100ml: 1637.5, priceB: 2580, stock: 0, unit: 'ml', specifications: [{ size: '3ml', cost: 299, priceB: 458, priceC: 788 }] },
  { id: 'y58', name: '香蜂草油(有机)', enName: 'Melissa (ORG)', botanicalName: 'Melissa Officinalis', origin: '法国', method: '蒸馏 / 全株', category: 'essential', cost100ml: 6780.4, priceB: 9800, stock: 0, unit: 'ml', specifications: [{ size: '3ml', cost: 385, priceB: 588, priceC: 1258 }] },
  { id: 'y59', name: '大西洋雪松油', enName: 'Cedarwood Atlas', botanicalName: 'Cedrus atlantica manetti', origin: '摩洛哥', method: '蒸馏 / 针叶', category: 'essential', cost100ml: 120.2, priceB: 258, stock: 0, unit: 'ml', specifications: [{ size: '5ml', cost: 55, priceB: 88, priceC: 158 }] },
  { id: 'y60', name: '月桂油', enName: 'Bay', botanicalName: 'Lanrus nobilis', origin: '牙买加', method: '蒸馏 / 叶', category: 'essential', cost100ml: 457.5, priceB: 758, stock: 0, unit: 'ml', specifications: [{ size: '5ml', cost: 85, priceB: 138, priceC: 258 }] },
  { id: 'y61', name: '桂皮油', enName: 'Cinnamon Bark', botanicalName: 'Cinnamomum cassia', origin: '马达加斯加', method: '蒸馏 / 树皮', category: 'essential', cost100ml: 860, priceB: 1580, stock: 0, unit: 'ml', specifications: [{ size: '5ml', cost: 70, priceB: 128, priceC: 258 }] },
  { id: 'y62', name: '安息香净油', enName: 'Benzoin', botanicalName: 'Styrax benzoin', origin: '印尼', method: '溶剂萃取 / 树脂', category: 'essential', cost100ml: 172.4, priceB: 358, stock: 0, unit: 'ml', specifications: [{ size: '5ml', cost: 67, priceB: 98, priceC: 158 }] },
  { id: 'y63', name: '罗勒', enName: 'Basil', botanicalName: 'Ocimum basilicum', origin: '印度 / 埃及', method: '蒸馏 / 叶片与花顶', category: 'essential', cost100ml: 172, stock: 0, unit: 'ml' },
  { id: 'y64', name: '胡萝卜籽', enName: 'Carrot Seed', botanicalName: 'Daucus carota', origin: '法国 / 匈牙利', method: '蒸馏 / 干燥种子', category: 'essential', specifications: [{ size: '5ml', cost: 52 }], stock: 0, unit: 'ml' },
  { id: 'y65', name: '马鞭草酮迷迭香', enName: 'Rosemary Verbenone', botanicalName: 'Rosmarinus officinalis ct. verbenone', origin: '法国', method: '蒸馏 / 开花全株', category: 'essential', stock: 0, unit: 'ml' },
  { id: 'y66', name: '西洋蓍草', enName: 'Yarrow', botanicalName: 'Achillea millefolium', origin: '保加利亚 / 匈牙利', method: '蒸馏 / 花朵与叶片', category: 'essential', specifications: [{ size: '5ml', cost: 127 }], stock: 0, unit: 'ml' },
];

export const INITIAL_HYDROSOLS: InventoryProduct[] = [
  { id: 'cl1', name: '大马士革玫瑰纯露', category: 'hydrosol', cost1L: 90, priceB: 158, stock: 0, unit: 'ml', specifications: [{ size: '250ml', priceB: 158, priceC: 316 }] },
  { id: 'cl2', name: '橙花纯露', category: 'hydrosol', cost1L: 97, priceB: 188, stock: 0, unit: 'ml', specifications: [{ size: '250ml', priceB: 188, priceC: 376 }] },
  { id: 'cl3', name: '澳洲檀香纯露', category: 'hydrosol', cost1L: 134, priceB: 258, stock: 0, unit: 'ml', specifications: [{ size: '250ml', priceB: 258, priceC: 516 }] },
  { id: 'cl4', name: '芬芳茶树(芳枸叶)', category: 'hydrosol', cost1L: 134, priceB: 258, stock: 0, unit: 'ml', specifications: [{ size: '250ml', priceB: 258, priceC: 516 }] },
  { id: 'cl5', name: '有机澳洲茶树纯露', category: 'hydrosol', cost1L: 136, priceB: 258, stock: 0, unit: 'ml', specifications: [{ size: '250ml', priceB: 258, priceC: 516 }] },
  { id: 'cl6', name: '沼泽茶树/惹娜玫瑰', category: 'hydrosol', cost1L: 133, priceB: 258, stock: 0, unit: 'ml', specifications: [{ size: '250ml', priceB: 258, priceC: 516 }] },
  { id: 'cl7', name: '柠檬茶树纯露', category: 'hydrosol', cost1L: 136, priceB: 258, stock: 0, unit: 'ml', specifications: [{ size: '250ml', priceB: 258, priceC: 516 }] },
  { id: 'cl8', name: '有机薰衣草纯露', category: 'hydrosol', cost1L: 94, priceB: 158, stock: 0, unit: 'ml', specifications: [{ size: '250ml', priceB: 158, priceC: 316 }] },
  { id: 'cl9', name: '有机大马士革红玫瑰', category: 'hydrosol', cost1L: 136, priceB: 258, stock: 0, unit: 'ml', specifications: [{ size: '250ml', priceB: 258, priceC: 516 }] },
  { id: 'cl10', name: '有机天竺葵纯露', category: 'hydrosol', cost1L: 103, priceB: 188, stock: 0, unit: 'ml', specifications: [{ size: '250ml', priceB: 188, priceC: 376 }] },
  { id: 'cl11', name: '有机大马士革白玫瑰', category: 'hydrosol', cost1L: 150, priceB: 288, stock: 0, unit: 'ml', specifications: [{ size: '250ml', priceB: 288, priceC: 576 }] },
  { id: 'cl12', name: '桉油醇迷迭香纯露', category: 'hydrosol', cost1L: 99, priceB: 158, stock: 0, unit: 'ml', specifications: [{ size: '250ml', priceB: 158, priceC: 316 }] },
  { id: 'cl13', name: '格拉斯玫瑰纯露', category: 'hydrosol', cost1L: 99, priceB: 188, stock: 0, unit: 'ml', specifications: [{ size: '250ml', priceB: 188, priceC: 376 }] },
  { id: 'cl14', name: '小花茉莉纯露', category: 'hydrosol', cost1L: 109, priceB: 188, stock: 0, unit: 'ml', specifications: [{ size: '250ml', priceB: 188, priceC: 376 }] },
  { id: 'cl15', name: '桂花纯露 (金桂)', category: 'hydrosol', cost1L: 109, priceB: 188, stock: 0, unit: 'ml', specifications: [{ size: '250ml', priceB: 188, priceC: 376 }] },
  { id: 'cl16', name: '有机德国洋甘菊', category: 'hydrosol', cost1L: 111, priceB: 258, stock: 0, unit: 'ml', specifications: [{ size: '250ml', priceB: 258, priceC: 516 }] },
  { id: 'cl17', name: '有机意大利永久花', category: 'hydrosol', cost1L: 106, priceB: 258, stock: 0, unit: 'ml', specifications: [{ size: '250ml', priceB: 258, priceC: 516 }] },
  { id: 'cl18', name: '马鞭草酮迷迭香', category: 'hydrosol', cost1L: 76, priceB: 138, stock: 0, unit: 'ml', specifications: [{ size: '250ml', priceB: 138, priceC: 276 }] },
  { id: 'cl19', name: '有机罗马洋甘菊', category: 'hydrosol', cost1L: 102, priceB: 188, stock: 0, unit: 'ml', specifications: [{ size: '250ml', priceB: 188, priceC: 376 }] },
  { id: 'cl20', name: '索马里乳香纯露', category: 'hydrosol', cost1L: 82, priceB: 138, stock: 0, unit: 'ml', specifications: [{ size: '250ml', priceB: 138, priceC: 276 }] },
];

export const INITIAL_STOCK_DATA = [
  { name: '葡萄柚', amount: 90, unit: 'ml', cost: 230 },
  { name: '柠檬', amount: 10, unit: 'ml', cost: 20 },
  { name: '薰衣草', amount: 10, unit: 'ml', cost: 30 },
  { name: '玫瑰（一级）', amount: 10, unit: 'ml', cost: 800 },
  { name: '玫瑰（越南）', amount: 5, unit: 'ml', cost: 300 },
  { name: '洋甘菊', amount: 5, unit: 'ml', cost: 400 },
  { name: '檀香-印尼', amount: 90, unit: 'ml', cost: 580 },
  { name: '檀香-首批', amount: 5, unit: 'ml', cost: 0 },
  { name: '茶树', amount: 10, unit: 'ml', cost: 0 },
];

