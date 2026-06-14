"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Minus, Plus, X } from "lucide-react";
import { useCartStore } from "@/store/cartStore";
import { useAuthStore } from "@/store/authStore";
import { formatPrice } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { apiClient } from "@/lib/api";

export default function CartPage() {
  const { items, updateQuantity, removeItem, subtotal, couponCode, setCoupon, coinsToRedeem, setCoins } =
    useCartStore();
  const { accessToken } = useAuthStore();
  const total = subtotal();
  const coinDiscount = coinsToRedeem;

  const [couponInput, setCouponInput] = useState(couponCode || "");
  const [couponDetails, setCouponDetails] = useState<any>(null);
  const [couponError, setCouponError] = useState("");
  const [validatingCoupon, setValidatingCoupon] = useState(false);

  const [availableCoins, setAvailableCoins] = useState<number | null>(null);
  const [showCoinsRedemption, setShowCoinsRedemption] = useState(false);
  const [showAvailableOffers, setShowAvailableOffers] = useState(false);
  const [activeCoupons, setActiveCoupons] = useState<any[]>([]);

  useEffect(() => {
    // Fetch active coupons
    apiClient
      .get<{ success: boolean; data: any[] }>("/coupons/active")
      .then((res) => {
        if (res.success && Array.isArray(res.data)) {
          setActiveCoupons(res.data);
        }
      })
      .catch((err) => console.error("Failed to fetch active coupons", err));
  }, []);

  useEffect(() => {
    if (!accessToken) {
      setAvailableCoins(null);
      return;
    }
    apiClient
      .get<{ success: boolean; data: any }>("/rewards", accessToken)
      .then((res) => setAvailableCoins(res.data?.balance ?? 0))
      .catch(() => setAvailableCoins(0));
  }, [accessToken]);

  useEffect(() => {
    setCouponInput(couponCode || "");
  }, [couponCode]);

  useEffect(() => {
    if (!couponCode) {
      setCouponDetails(null);
      setCouponError("");
      return;
    }

    setValidatingCoupon(true);
    setCouponError("");

    apiClient
      .get<{ success: boolean; data: any }>(`/coupons/validate?code=${couponCode}&subtotal=${total}`)
      .then((res) => {
        if (res.success) {
          setCouponDetails(res.data);
          setCouponError("");
        }
      })
      .catch((err) => {
        setCouponDetails(null);
        setCouponError(err instanceof Error ? err.message : "Invalid coupon code");
      })
      .finally(() => {
        setValidatingCoupon(false);
      });
  }, [couponCode, total]);

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponInput.trim()) {
      setCoupon(null);
      return;
    }
    setCoupon(couponInput.toUpperCase().trim());
  };

  const handleRemoveCoupon = () => {
    setCoupon(null);
    setCouponInput("");
  };

  let couponDiscount = 0;
  if (couponDetails) {
    if (couponDetails.type === "percent") {
      couponDiscount = Math.min((total * couponDetails.value) / 100, couponDetails.maxDiscount ?? Infinity);
    } else {
      couponDiscount = couponDetails.value;
    }
  }

  const totalAfterDiscount = Math.max(0, total - couponDiscount - coinDiscount);
  const shipping = totalAfterDiscount >= 2999 ? 0 : 99;
  const grandTotal = Math.max(0, totalAfterDiscount + shipping);

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
              {/* Coupon Code Input */}
              <div className="space-y-4 pt-2 border-t border-charcoal/5">
                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-editorial text-muted font-bold block">Promo Code</label>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Enter coupon code"
                      value={couponInput}
                      onChange={(e) => setCouponInput(e.target.value)}
                      className="uppercase tracking-widest font-mono text-xs border-charcoal/20"
                      disabled={!!couponDetails || validatingCoupon}
                    />
                    {couponDetails ? (
                      <button
                        type="button"
                        onClick={handleRemoveCoupon}
                        className="bg-red-50 text-red-600 hover:bg-red-100 border border-red-200 px-4 py-2 text-xs uppercase tracking-widest font-semibold transition-colors rounded-lg cursor-pointer"
                      >
                        Remove
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={handleApplyCoupon}
                        disabled={validatingCoupon || !couponInput.trim()}
                        className="bg-charcoal text-offwhite hover:bg-black px-4 py-2 text-xs uppercase tracking-widest font-semibold transition-colors disabled:opacity-40 rounded-lg cursor-pointer min-w-[70px]"
                      >
                        {validatingCoupon ? "..." : "Apply"}
                      </button>
                    )}
                  </div>

                  {couponError && (
                    <p className="text-red-600 text-xs font-semibold mt-1">
                      ❌ {couponError}
                    </p>
                  )}

                  {couponDetails && (
                    <p className="text-green-600 text-xs font-semibold mt-1">
                      ✓ Coupon <span className="font-mono uppercase text-royal font-bold">{couponDetails.code}</span> applied! ({couponDetails.type === "percent" ? `${couponDetails.value}%` : `₹${couponDetails.value}`} OFF)
                    </p>
                  )}
                </div>

                {/* Available Offers section */}
                {activeCoupons.length > 0 && (
                  <div className="pt-2 border-t border-charcoal/5 space-y-2">
                    <div 
                      onClick={() => setShowAvailableOffers(!showAvailableOffers)}
                      className="flex justify-between items-center cursor-pointer select-none group"
                    >
                      <p className="text-[10px] uppercase tracking-editorial text-muted font-bold group-hover:text-charcoal transition-colors">
                        Available Offers
                      </p>
                      <div className="flex items-center gap-1">
                        <span className="text-[10px] font-bold text-muted group-hover:text-charcoal transition-colors uppercase tracking-wider">
                          {showAvailableOffers ? "Hide" : "Show"}
                        </span>
                        <span className={`text-[9px] text-muted transition-transform duration-200 ${showAvailableOffers ? 'rotate-180' : ''}`}>
                          ▼
                        </span>
                      </div>
                    </div>

                    {showAvailableOffers && (
                      <div className="space-y-2 max-h-[200px] overflow-y-auto pr-1 animate-in slide-in-from-top-2 duration-200">
                        {activeCoupons.map((c) => {
                          const isEligible = total >= c.minOrder;
                          const isApplied = couponDetails?.code === c.code;
                          const neededAmount = c.minOrder - total;
                          const discountText = c.type === "percent" ? `${c.value}% OFF` : `₹${c.value} OFF`;
                          const subtext = c.minOrder > 0 ? `on orders above ₹${c.minOrder}` : "on all orders";
                          
                          return (
                            <div
                              key={c.code}
                              className={`p-3 border rounded-xl flex flex-col justify-between gap-2 transition-all ${
                                isApplied
                                  ? "border-green-500 bg-green-50/10"
                                  : isEligible
                                  ? "border-charcoal/15 bg-white hover:border-royal/40"
                                  : "border-charcoal/5 bg-gray-50/50 opacity-80"
                              }`}
                            >
                              <div className="flex justify-between items-start gap-2">
                                <div>
                                  <span className={`font-mono text-[10px] font-bold tracking-widest px-2 py-0.5 rounded border uppercase ${
                                    isApplied
                                      ? "text-green-700 bg-green-100 border-green-200"
                                      : isEligible
                                      ? "text-charcoal bg-stone/5 border-charcoal/15"
                                      : "text-muted bg-stone/5 border-charcoal/5"
                                  }`}>
                                    {c.code}
                                  </span>
                                  <p className="text-xs text-charcoal font-semibold mt-1.5">{discountText}</p>
                                  <p className="text-[10px] text-muted mt-0.5">{subtext}</p>
                                </div>
                                
                                {isApplied ? (
                                  <span className="text-green-600 text-xs font-bold flex items-center gap-0.5">
                                    ✓ Applied
                                  </span>
                                ) : isEligible ? (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setCouponInput(c.code);
                                      setCoupon(c.code);
                                    }}
                                    className="text-royal hover:text-blue-800 text-[10px] uppercase tracking-wider font-bold border border-royal/20 hover:border-royal/50 px-2.5 py-1 rounded transition-all cursor-pointer bg-white"
                                  >
                                    Apply
                                  </button>
                                ) : (
                                  <span className="text-amber-600 text-[9px] font-semibold bg-amber-50 border border-amber-100 px-2 py-1 rounded">
                                    Locked
                                  </span>
                                )}
                              </div>
                              
                              {!isEligible && neededAmount > 0 && (
                                <div className="pt-1 border-t border-charcoal/5 flex flex-col gap-1">
                                  <p className="text-[10px] text-amber-700 font-medium leading-relaxed">
                                    Add ₹{formatPrice(neededAmount).replace("₹", "")} more to unlock this offer
                                  </p>
                                  <div className="w-full bg-charcoal/5 h-1 rounded-full overflow-hidden">
                                    <div
                                      className="bg-amber-500 h-full rounded-full transition-all duration-300"
                                      style={{ width: `${Math.min(100, (total / c.minOrder) * 100)}%` }}
                                    />
                                  </div>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Coins Redemption Section */}
              <div className="pt-4 border-t border-charcoal/5">
                {!accessToken ? (
                  <div className="border border-amber-200 bg-amber-50/10 p-4 rounded-xl space-y-1.5 shadow-sm">
                    <div className="flex items-center gap-2">
                      <span className="inline-block animate-coin-spin-pulse text-sm">🪙</span>
                      <p className="text-xs font-semibold text-amber-900">DEHYDE Coins</p>
                    </div>
                    <p className="text-[11px] text-amber-800/80 leading-relaxed pl-6">
                      <Link href="/account/login?redirect=/cart" className="underline hover:text-royal font-medium">Sign in</Link> to redeem loyalty coins and save up to 30%.
                    </p>
                  </div>
                ) : (
                  <div className="border border-amber-300/80 bg-amber-50/10 p-4 rounded-xl space-y-3 shadow-sm">
                    <div 
                      onClick={() => setShowCoinsRedemption(!showCoinsRedemption)}
                      className="flex justify-between items-center cursor-pointer select-none group"
                    >
                      <div className="flex items-center gap-2">
                        <span className="inline-block animate-coin-spin-pulse text-sm">🪙</span>
                        <span className="text-xs font-semibold text-amber-900 group-hover:text-amber-950 transition-colors">
                          DEHYDE Coins
                        </span>
                        {coinsToRedeem > 0 && (
                          <span className="text-[9px] font-semibold text-green-700 bg-green-100 border border-green-200 px-2 py-0.5 rounded-full ml-1 animate-in fade-in duration-300">
                            Applied -₹{coinsToRedeem}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] font-bold text-amber-700 group-hover:text-amber-800 transition-colors uppercase tracking-wider">
                          {showCoinsRedemption ? "Hide details" : "Redeem / Balance"}
                        </span>
                        <span className={`text-[9px] text-amber-600 transition-transform duration-200 ${showCoinsRedemption ? 'rotate-180' : ''}`}>
                          ▼
                        </span>
                      </div>
                    </div>

                    {showCoinsRedemption && (
                      <div className="pt-2 border-t border-amber-200/40 space-y-3 animate-in slide-in-from-top-2 duration-200">
                        <div className="flex justify-between items-center">
                          <span className="text-[11px] text-amber-800 font-medium">Your loyalty balance:</span>
                          <span className="text-xs font-mono font-bold text-amber-800 bg-amber-200/40 px-2.5 py-0.5 rounded-full border border-amber-300/30">
                            {availableCoins !== null ? `${availableCoins} coins` : "..."}
                          </span>
                        </div>
                        <p className="text-[11px] text-amber-700/80 leading-snug">
                          1 Coin = ₹1. Redeem up to 30% of subtotal (max ₹{Math.floor(total * 0.3)}).
                        </p>
                        {availableCoins !== null && availableCoins > 0 ? (
                          <div className="space-y-2">
                            <div className="flex gap-2">
                              <div className="relative flex-1">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-amber-600/70">₹</span>
                                <input
                                  type="number"
                                  min={0}
                                  max={Math.min(Math.floor(total * 0.3), availableCoins)}
                                  value={coinsToRedeem || ""}
                                  onChange={(e) => {
                                    const maxVal = Math.min(Math.floor(total * 0.3), availableCoins);
                                    let val = Math.max(0, parseInt(e.target.value) || 0);
                                    if (val > maxVal) val = maxVal;
                                    setCoins(val);
                                  }}
                                  placeholder="0"
                                  className="w-full bg-white border border-amber-200/60 pl-6 pr-3 py-2 text-xs rounded-lg focus:outline-none focus:border-amber-400 font-mono text-amber-950"
                                />
                              </div>
                              <button
                                type="button"
                                onClick={() => {
                                  const maxVal = Math.min(Math.floor(total * 0.3), availableCoins);
                                  setCoins(maxVal);
                                }}
                                className="bg-amber-600 hover:bg-amber-700 text-offwhite text-[10px] uppercase tracking-wider font-bold px-3 py-2 rounded-lg transition-colors cursor-pointer shadow-sm"
                              >
                                Redeem Max
                              </button>
                            </div>
                            {coinsToRedeem > 0 && (
                              <p className="text-green-600 text-[10px] font-semibold flex items-center gap-1">
                                ✓ Applied ₹{coinsToRedeem} coin discount
                              </p>
                            )}
                          </div>
                        ) : availableCoins !== null && (
                          <p className="text-[10px] text-amber-600 font-medium">
                            You don't have any coins to redeem yet. Earn coins on your next orders!
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {couponDiscount > 0 && (
                <div className="flex justify-between text-green-600 font-semibold animate-in fade-in duration-300">
                  <span>Promo discount ({couponDetails?.code})</span>
                  <span>-{formatPrice(couponDiscount)}</span>
                </div>
              )}

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
              <div className="flex justify-between border-t border-charcoal/10 pt-4 text-base font-bold">
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
