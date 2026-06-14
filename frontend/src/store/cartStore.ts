import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { CartItem } from "@/types";

interface CartState {
  items: CartItem[];
  couponCode: string | null;
  coinsToRedeem: number;
  addItem: (item: CartItem) => void;
  removeItem: (productId: string, size: string, color: string) => void;
  updateQuantity: (productId: string, size: string, color: string, qty: number) => void;
  setCoupon: (code: string | null) => void;
  setCoins: (coins: number) => void;
  clearCart: () => void;
  subtotal: () => number;
  itemCount: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      couponCode: null,
      coinsToRedeem: 0,
      addItem: (item) => {
        const items = get().items;
        const idx = items.findIndex(
          (i) => i.productId === item.productId && i.size === item.size && i.color === item.color
        );
        if (idx >= 0) {
          const next = [...items];
          next[idx].quantity += item.quantity;
          set({ items: next });
        } else {
          set({ items: [...items, item] });
        }
      },
      removeItem: (productId, size, color) =>
        set({
          items: get().items.filter(
            (i) => !(i.productId === productId && i.size === size && i.color === color)
          ),
        }),
      updateQuantity: (productId, size, color, qty) => {
        if (qty < 1) {
          get().removeItem(productId, size, color);
          return;
        }
        set({
          items: get().items.map((i) =>
            i.productId === productId && i.size === size && i.color === color
              ? { ...i, quantity: qty }
              : i
          ),
        });
      },
      setCoupon: (code) => set({ couponCode: code }),
      setCoins: (coins) => set({ coinsToRedeem: coins }),
      clearCart: () => set({ items: [], couponCode: null, coinsToRedeem: 0 }),
      subtotal: () => get().items.reduce((s, i) => s + i.price * i.quantity, 0),
      itemCount: () => get().items.reduce((s, i) => s + i.quantity, 0),
    }),
    {
      name: "dehyde-cart",
      partialize: (state) => ({ items: state.items }),
    }
  )
);
