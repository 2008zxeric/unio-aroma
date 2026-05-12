/**
 * UNIO AROMA 前台购物车 — localStorage 存储 + 类型定义
 * 
 * 购物车数据存 localStorage (key: 'unio_cart')
 * 不要求用户登录
 */

export interface CartItem {
  product_id: string;
  product_name: string;
  product_code: string;
  image_url?: string;
  series_code?: string;
  size: string;          // 规格：5ml / 10ml / 30ml 等
  quantity: number;
  unit_price: number;    // 售价
  base_cost?: number;    // 底价（从 inventory 或产品 total_cost 算）
}

const CART_KEY = 'unio_cart';

export function getCart(): CartItem[] {
  try {
    const raw = localStorage.getItem(CART_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as CartItem[];
  } catch {
    return [];
  }
}

export function saveCart(items: CartItem[]): void {
  localStorage.setItem(CART_KEY, JSON.stringify(items));
}

export function addToCart(item: CartItem): CartItem[] {
  const cart = getCart();
  const existing = cart.find(
    c => c.product_id === item.product_id && c.size === item.size
  );
  if (existing) {
    existing.quantity += item.quantity;
  } else {
    cart.push(item);
  }
  saveCart(cart);
  return cart;
}

export function updateCartItemQuantity(productId: string, size: string, quantity: number): CartItem[] {
  const cart = getCart();
  const idx = cart.findIndex(c => c.product_id === productId && c.size === size);
  if (idx >= 0) {
    if (quantity <= 0) {
      cart.splice(idx, 1);
    } else {
      cart[idx].quantity = quantity;
    }
  }
  saveCart(cart);
  return cart;
}

export function removeCartItem(productId: string, size: string): CartItem[] {
  return updateCartItemQuantity(productId, size, 0);
}

export function clearCart(): void {
  localStorage.removeItem(CART_KEY);
}

export function getCartCount(): number {
  return getCart().reduce((sum, item) => sum + item.quantity, 0);
}

export function getCartTotal(): number {
  return getCart().reduce((sum, item) => sum + item.unit_price * item.quantity, 0);
}
