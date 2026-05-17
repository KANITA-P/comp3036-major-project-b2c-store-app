export const CART_STORAGE_KEY = "threadline-cart";
export const CART_UPDATED_EVENT = "threadline-cart-updated";

export type CartLine = {
  id: number;
  name: string;
  description: string;
  price: number;
  image: string;
  stock: number;
  category: string;
  quantity: number;
};

export function readCart() {
  const storedCart = window.localStorage.getItem(CART_STORAGE_KEY);

  if (!storedCart) return [];

  try {
    const parsedCart = JSON.parse(storedCart);

    if (!Array.isArray(parsedCart)) return [];

    return parsedCart.filter(isCartLine);
  } catch {
    window.localStorage.removeItem(CART_STORAGE_KEY);
    return [];
  }
}

export function writeCart(cart: CartLine[]) {
  window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
  window.dispatchEvent(new Event(CART_UPDATED_EVENT));
}

export function getCartCount(cart: CartLine[]) {
  return cart.reduce((total, item) => total + item.quantity, 0);
}

export function getCartTotal(cart: CartLine[]) {
  return cart.reduce((total, item) => total + item.price * item.quantity, 0);
}

function isCartLine(value: unknown): value is CartLine {
  if (!value || typeof value !== "object") return false;

  const item = value as Record<string, unknown>;

  return (
    typeof item.id === "number" &&
    typeof item.name === "string" &&
    typeof item.description === "string" &&
    typeof item.price === "number" &&
    typeof item.image === "string" &&
    typeof item.stock === "number" &&
    typeof item.category === "string" &&
    typeof item.quantity === "number"
  );
}
