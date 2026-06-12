"use client";

import Image from "next/image";
import Link from "next/link";
import { Minus, Plus, X } from "lucide-react";
import { useCartStore } from "@/store/cartStore";
import { formatPrice } from "@/lib/utils";
import { Input } from "@/components/ui/input";

export default function CartPage() {
  const { items, updateQuantity, removeItem, subtotal, couponCode, setCoupon, coinsToRedeem, setCoins } =
    useCartStore();
  const total = subtotal();
  const coinDiscount = coinsToRedeem;
  const shipping = total - coinDiscount >= 2999 ? 0 : 99;
  const grandTotal = Math.max(0, total - coinDiscount + shipping);

  if (items.length === 0) {
    return (
      <div className="luxury-container flex min-h-[60vh] flex-col items-center justify-center pt-32 pb-section">
        <h1 className="editorial-heading text-4xl">Your bag is empty</h1>
        <p className="mt-4 text-sm text-muted">Discover our latest collection</p>
        <Link
          href="/shop"
          className="mt-8 inline-flex bg-royal px-8 py-4 text-xs uppercase tracking-editorial text-offwhite items-center gap-2 hover:opacity-90 transition-opacity"
        >
          <span>←</span> Continue shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="pt-32 pb-section">
      <div className="luxury-container">
        <Link
          href="/shop"
          className="text-[10px] uppercase tracking-editorial text-muted hover:text-charcoal transition-colors mb-6 inline-flex items-center gap-1"
        >
          <span>←</span> Continue Shopping
        </Link>
        <h1 className="editorial-heading text-5xl">Bag</h1>
        <div className="mt-16 grid gap-16 lg:grid-cols-[1fr_400px]">
          <div className="space-y-12">
            {items.map((item) => (
              <div
                key={`${item.productId}-${item.size}-${item.color}`}
                className="flex gap-6 border-b border-charcoal/10 pb-12"
              >
                <Link href={`/product/${item.slug}`} className="relative h-40 w-32 shrink-0 overflow-hidden bg-stone/5">
                  <Image src={item.image} alt={item.title} fill className="object-cover" />
                </Link>
                <div className="flex flex-1 flex-col justify-between">
                  <div>
                    <Link href={`/product/${item.slug}`} className="text-sm">
                      {item.title}
                    </Link>
                    <p className="mt-1 text-xs text-muted">
                      {item.color} · Size {item.size}
                    </p>
                    {item.rewardCoins > 0 && (
                      <p className="mt-2 text-[10px] uppercase tracking-editorial text-muted">
                        +{item.rewardCoins * item.quantity} coins
                      </p>
                    )}
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 border border-charcoal/20 px-3 py-2">
                      <button
                        type="button"
                        onClick={() =>
                          updateQuantity(item.productId, item.size, item.color, item.quantity - 1)
                        }
                      >
                        <Minus className="h-3 w-3" />
                      </button>
                      <span className="text-xs">{item.quantity}</span>
                      <button
                        type="button"
                        onClick={() =>
                          updateQuantity(item.productId, item.size, item.color, item.quantity + 1)
                        }
                      >
                        <Plus className="h-3 w-3" />
                      </button>
                    </div>
                    <p className="text-sm">{formatPrice(item.price * item.quantity)}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => removeItem(item.productId, item.size, item.color)}
                  className="self-start"
                  aria-label="Remove"
                >
                  <X className="h-4 w-4" strokeWidth={1} />
                </button>
              </div>
            ))}
          </div>

          <aside className="lg:sticky lg:top-32 lg:self-start">
            <p className="text-[10px] uppercase tracking-editorial text-muted">Summary</p>
            <div className="mt-6 space-y-4 text-sm">
              <div className="flex justify-between">
                <span className="text-muted">Subtotal</span>
                <span>{formatPrice(total)}</span>
              </div>
              <Input
                placeholder="Coupon code"
                value={couponCode || ""}
                onChange={(e) => setCoupon(e.target.value || null)}
              />
              <div>
                <label className="text-xs text-muted">Redeem DEHYDE coins (max 30%)</label>
                <Input
                  type="number"
                  min={0}
                  max={Math.floor(total * 0.3)}
                  value={coinsToRedeem || ""}
                  onChange={(e) => setCoins(Number(e.target.value) || 0)}
                  placeholder="0"
                  className="mt-2"
                />
              </div>
              {coinDiscount > 0 && (
                <div className="flex justify-between text-muted">
                  <span>Coin discount</span>
                  <span>-{formatPrice(coinDiscount)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-muted">Shipping</span>
                <span>{shipping === 0 ? "Complimentary" : formatPrice(shipping)}</span>
              </div>
              <div className="flex justify-between border-t border-charcoal/10 pt-4 text-base">
                <span>Total</span>
                <span>{formatPrice(grandTotal)}</span>
              </div>
            </div>
            <Link
              href="/checkout"
              className="mt-8 flex w-full items-center justify-center bg-royal px-8 py-4 text-xs uppercase tracking-editorial text-offwhite hover:bg-blue-800 transition-colors"
            >
              Proceed to checkout
            </Link>
          </aside>
        </div>
      </div>
    </div>
  );
}
