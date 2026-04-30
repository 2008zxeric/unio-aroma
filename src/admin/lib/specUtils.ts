// ============================================
// 📐 规格工具 — 进销存统一规格体系
// 所有出入库操作共享同一套规则
// ============================================

/** 入库规格（元/和/生系列 — ml） */
export const INBOUND_SIZES_ML = ['5ml', '10ml', '15ml', '30ml', '50ml', '100ml', '500ml', '1000ml'];

/** 入库规格（香系列 — 个/件/套） */
export const INBOUND_SIZES_PIECE = ['1个', '1件', '1套', '5个', '10件'];

/** 销售规格（元/和/生） */
export const SALES_SIZES_ML = ['5ml', '10ml', '15ml', '30ml', '50ml', '100ml'];

/** 销售规格（香系列） */
export const SALES_SIZES_PIECE = ['1个', '1件', '1套'];

/** 判断子分类是否为香系列 */
export function isJingCategory(category: string): boolean {
  return category === 'aesthetic' || category === 'meditation';
}

/** 判断系列代码是否为香系列 */
export function isJingSeries(seriesCode: string): boolean {
  return seriesCode === 'jing';
}

/** 判断产品是否为 piece 单位（香系列） */
export function isPieceUnit(seriesCode?: string | null, category?: string | null): boolean {
  return isJingSeries(seriesCode || '') || isJingCategory(category || '');
}

/** 从 size_label 解析出 volume_ml 数值 */
export function parseSizeToMl(sizeStr: string): number {
  if (!sizeStr || sizeStr.includes('个') || sizeStr.includes('件') || sizeStr.includes('套')) return 0;
  const match = sizeStr.match(/(\d+)/);
  return match ? parseInt(match[1]) : 0;
}

/** 获取产品的单位标签 */
export function getUnitLabel(category?: string | null): string {
  return isJingCategory(category || '') ? '件' : 'ml';
}

// ---- 构建规格数据对象 ----

export interface SpecInfo {
  /** 规格标签（如 "30ml"、"1个"） */
  sizeLabel: string;
  /** 单位类型 */
  unitType: 'ml' | 'piece';
  /** 容量数值（piece 为 0） */
  volumeMl: number;
}

/**
 * 从规格标签解析规格信息
 * @param sizeLabel 如 "30ml"、"1个"
 * @param isPiece 是否为 piece 单位
 */
export function parseSpecInfo(sizeLabel: string, isPiece: boolean): SpecInfo {
  return {
    sizeLabel,
    unitType: isPiece ? 'piece' : 'ml',
    volumeMl: isPiece ? 0 : parseSizeToMl(sizeLabel),
  };
}

/**
 * 从产品和规格标签生成采购记录字段
 */
export function buildPurchaseRecord(
  productId: string,
  purchaseDate: string,
  sizeLabel: string,
  unitCost: number,
  supplierCode?: string | null,
  seriesCode?: string | null,
  category?: string | null,
) {
  const isPiece = isPieceUnit(seriesCode, category);
  const { unitType, volumeMl } = parseSpecInfo(sizeLabel, isPiece);
  return {
    product_id: productId,
    purchase_date: purchaseDate,
    volume_ml: volumeMl,
    unit_cost: unitCost,
    supplier_code: supplierCode || null,
    size_label: sizeLabel,
    unit_type: unitType,
  };
}

/**
 * 从产品和规格标签生成销售记录字段
 */
export function buildSalesRecord(
  productId: string,
  saleDate: string,
  sizeLabel: string,
  totalAmount: number,
  seriesCode?: string | null,
  category?: string | null,
) {
  const isPiece = isPieceUnit(seriesCode, category);
  const { unitType, volumeMl } = parseSpecInfo(sizeLabel, isPiece);
  const salePrice = volumeMl > 0 ? totalAmount / volumeMl : totalAmount;
  return {
    product_id: productId,
    sale_date: saleDate,
    volume_ml: volumeMl,
    sale_price: salePrice,
    total_amount: totalAmount,
    size_label: sizeLabel,
    unit_type: unitType,
  };
}

/**
 * 根据产品获取参考售价（用于自动填入）
 */
export function getReferencePrice(
  product: any,
  sizeLabel: string,
  isPiece: boolean,
): number {
  if (isPiece) return Number(product.price_piece) || 0;
  const ml = parseSizeToMl(sizeLabel);
  const priceKey = `price_${ml}ml`;
  return Number(product[priceKey]) || 0;
}
