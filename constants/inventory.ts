export interface InventoryProduct {
  id: string;
  name: string;
  enName?: string;
  botanicalName?: string;
  origin?: string;
  method?: string;
  site?: string;
  category: 'essential' | 'hydrosol' | 'base';
  cost1L?: number;
  cost10ml?: number;
  stock: number;
  unit: 'ml' | 'g';
  specifications: {
    size: string;
    cost?: number;
    priceC: number;
    priceB?: number;
  }[];
}

export interface Transaction {
  id: string;
  date: string;
  type: 'purchase' | 'sale';
  productId: string;
  productName: string;
  quantity: number;
  unit: string;
  price: number;
  customerType?: 'B' | 'C';
  note?: string;
  performedBy?: string; // 记录是谁操作的
}

export const INITIAL_ESSENTIAL_OILS: InventoryProduct[] = [
  { id: 'EO1001', name: '薰衣草', enName: 'Lavender', botanicalName: 'Lavandula angustifolia', origin: '法国', method: '蒸馏', site: '花朵', category: 'essential', cost1L: 1200, cost10ml: 12, stock: 50, unit: 'ml', specifications: [{ size: '10ml', cost: 12, priceC: 128 }, { size: '30ml', priceC: 298 }] },
  { id: 'EO1002', name: '茶树', enName: 'Tea Tree', botanicalName: 'Melaleuca alternifolia', origin: '澳洲', method: '蒸馏', site: '叶片', category: 'essential', cost1L: 850, cost10ml: 8.5, stock: 30, unit: 'ml', specifications: [{ size: '10ml', cost: 8.5, priceC: 98 }] },
  { id: 'EO1003', name: '薄荷', enName: 'Peppermint', botanicalName: 'Mentha piperita', origin: '美国', method: '蒸馏', site: '全株', category: 'essential', cost1L: 950, cost10ml: 9.5, stock: 25, unit: 'ml', specifications: [{ size: '10ml', cost: 9.5, priceC: 88 }] }
];

export const INITIAL_HYDROSOLS: InventoryProduct[] = [
  { id: 'HY2001', name: '大马士革玫瑰纯露', enName: 'Rose Otto Hydrosol', origin: '保加利亚', category: 'hydrosol', cost1L: 180, stock: 100, unit: 'ml', specifications: [{ size: '100ml', priceC: 88 }, { size: '250ml', priceC: 188 }] },
  { id: 'HY2002', name: '橙花纯露', enName: 'Neroli Hydrosol', origin: '突尼斯', category: 'hydrosol', cost1L: 220, stock: 80, unit: 'ml', specifications: [{ size: '100ml', priceC: 118 }] }
];

export const INITIAL_BASE_OILS: InventoryProduct[] = [
  { id: 'JC1001', name: '甜杏仁油', enName: 'Almond Oil', origin: '英国', category: 'base', cost1L: 84, stock: 200, unit: 'ml', specifications: [{ size: '100ml', priceC: 68 }] }
];

export const INITIAL_STOCK_DATA = [...INITIAL_ESSENTIAL_OILS, ...INITIAL_HYDROSOLS, ...INITIAL_BASE_OILS];
