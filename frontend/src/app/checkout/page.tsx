"use client";

import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { useCartStore } from "@/store/cartStore";
import { useAuthStore } from "@/store/authStore";
import { formatPrice } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import Image from "next/image";
import { apiClient } from "@/lib/api";
import { gsap } from "gsap";

declare global {
  interface Window {
    Razorpay?: new (options: Record<string, unknown>) => { open: () => void };
  }
}

export default function CheckoutPage() {
  const { items, subtotal, coinsToRedeem, couponCode, clearCart, setCoupon, setCoins } = useCartStore();
  const { accessToken, user } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [shippingMethod, setShippingMethod] = useState<"standard" | "express">("standard");

  const buttonRef = useRef<HTMLButtonElement>(null);
  const [isAnimating, setIsAnimating] = useState(false);

  const startTruckAnimation = (onComplete: () => void) => {
    const button = buttonRef.current;
    if (!button) return;

    const box = button.querySelector(".box");
    const truck = button.querySelector(".truck");
    if (!box || !truck) return;

    button.classList.add("animation");

    gsap.to(button, {
      "--box-s": 1,
      "--box-o": 1,
      duration: 0.3,
      delay: 0.5,
    });

    gsap.to(box, {
      x: 0,
      duration: 0.4,
      delay: 0.7,
    });

    gsap.to(button, {
      "--hx": -5,
      "--bx": 50,
      duration: 0.18,
      delay: 0.92,
    });

    gsap.to(box, {
      y: 0,
      duration: 0.1,
      delay: 1.15,
    });

    gsap.set(button, {
      "--truck-y": 0,
      "--truck-y-n": -26,
    });

    gsap.to(button, {
      "--truck-y": 1,
      "--truck-y-n": -25,
      duration: 0.2,
      delay: 1.25,
      onComplete() {
        gsap
          .timeline({
            onComplete() {
              button.classList.add("done");
              setTimeout(onComplete, 300); // Small buffer before proceeding
            },
          })
          .to(truck, {
            x: 0,
            duration: 0.4,
          })
          .to(truck, {
            x: 40,
            duration: 1,
          })
          .to(truck, {
            x: 20,
            duration: 0.6,
          })
          .to(truck, {
            x: 96,
            duration: 0.4,
          });

        gsap.to(button, {
          "--progress": 1,
          duration: 2.4,
          ease: "power2.in",
        });
      },
    });
  };

  const resetTruckAnimation = () => {
    const button = buttonRef.current;
    if (!button) return;
    const box = button.querySelector(".box");
    const truck = button.querySelector(".truck");
    if (!box || !truck) return;

    button.classList.remove("animation", "done");
    gsap.set(truck, {
      x: 4,
    });
    gsap.set(button, {
      "--progress": 0,
      "--hx": 0,
      "--bx": 0,
      "--box-s": 0.5,
      "--box-o": 0,
      "--truck-y": 0,
      "--truck-y-n": -26,
    });
    gsap.set(box, {
      x: -24,
      y: -6,
    });
    setIsAnimating(false);
  };
  const [shippingRules, setShippingRules] = useState({
    freeShippingThreshold: 2999,
    defaultShippingFee: 99,
    expressShippingFee: 149
  });

  useEffect(() => {
    apiClient
      .get<{ success: boolean; data: { freeShippingThreshold: number; defaultShippingFee: number; expressShippingFee: number } }>("/settings/public")
      .then((res) => {
        if (res.success && res.data) {
          setShippingRules({
            freeShippingThreshold: res.data.freeShippingThreshold,
            defaultShippingFee: res.data.defaultShippingFee,
            expressShippingFee: res.data.expressShippingFee
          });
        }
      })
      .catch((err) => console.error("Failed to fetch public shipping rules in checkout", err));
  }, []);
  const [shippingDetails, setShippingDetails] = useState<any>(null);
  const [loadingEstimate, setLoadingEstimate] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<"razorpay" | "cod">("razorpay");
  const [address, setAddress] = useState({
    fullName: user?.name || "",
    phone: user?.phone || "",
    line1: "",
    city: "",
    state: "",
    pincode: "",
  });

  const [couponInput, setCouponInput] = useState(couponCode || "");
  const [couponDetails, setCouponDetails] = useState<any>(null);
  const [couponError, setCouponError] = useState("");
  const [validatingCoupon, setValidatingCoupon] = useState(false);

  const [availableCoins, setAvailableCoins] = useState<number | null>(null);
  const [showCoinsRedemption, setShowCoinsRedemption] = useState(false);
  const [showAvailableOffers, setShowAvailableOffers] = useState(false);
  const [activeCoupons, setActiveCoupons] = useState<any[]>([]);

  const total = subtotal();

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

  const totalAfterDiscount = Math.max(0, total - couponDiscount - coinsToRedeem);
  
  let shipping = totalAfterDiscount >= shippingRules.freeShippingThreshold ? 0 : shippingRules.defaultShippingFee;
  
  if (shippingDetails) {
    if (shippingMethod === "express") {
      shipping = shippingRules.expressShippingFee;
    } else {
      shipping = totalAfterDiscount >= shippingRules.freeShippingThreshold ? 0 : shippingRules.defaultShippingFee;
    }
  }

  const codFee = paymentMethod === "cod" ? 150 : 0;
  const grandTotal = Math.max(0, totalAfterDiscount + shipping + codFee);

  const isAddressComplete =
    address.fullName.trim() !== "" &&
    address.phone.trim() !== "" &&
    address.line1.trim() !== "" &&
    address.pincode.trim() !== "" &&
    address.city.trim() !== "" &&
    address.state.trim() !== "";

  const fetchEstimation = async (pin: string, currentAddress = address) => {
    setLoadingEstimate(true);
    try {
      const res = await apiClient.post<any>("/settings/estimate", {
        pincode: pin,
        subtotal: totalAfterDiscount,
      });
      if (res.success && res.data) {
        setShippingDetails(res.data);
        setAddress({
          ...currentAddress,
          city: res.data.city,
          state: res.data.state,
        });
        if (shippingMethod === "express" && !res.data.express.isAvailable) {
          setShippingMethod("standard");
        }
        if (!res.data.isCodAvailable) {
          setPaymentMethod("razorpay");
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingEstimate(false);
    }
  };

  useEffect(() => {
    const savedPincode = localStorage.getItem("hyde_checked_pincode");
    if (savedPincode) {
      const initialAddress = { ...address, pincode: savedPincode };
      setAddress(initialAddress);
      fetchEstimation(savedPincode, initialAddress);
    }
  }, []);

  const handleAddressChange = (field: keyof typeof address, value: string) => {
    const updated = { ...address, [field]: value };
    setAddress(updated);
    if (field === "pincode" && value.length === 6 && /^\d{6}$/.test(value)) {
      fetchEstimation(value, updated);
    }
  };

  const handlePayment = async () => {
    if (!accessToken) {
      window.location.href = "/account/login?redirect=/checkout";
      return;
    }
    if (!isAddressComplete) {
      alert("Please fill in all shipping address fields.");
      return;
    }
    if (loading || isAnimating) return;

    setLoading(true);
    setIsAnimating(true);

    let apiResponse: any = null;
    let apiError: any = null;
    let apiCompleted = false;

    // Start API call concurrently
    apiClient
      .post<any>(
        "/orders",
        {
          items: items.map((i) => ({
            productId: i.productId,
            size: i.size,
            color: i.color,
            quantity: i.quantity,
            image: i.image,
          })),
          shippingAddress: address,
          couponCode,
          coinsToRedeem,
          shippingMethod,
          paymentMethod,
        },
        accessToken
      )
      .then((res) => {
        apiResponse = res;
        apiCompleted = true;
      })
      .catch((err) => {
        apiError = err;
        apiCompleted = true;
      });

    // Start the truck animation
    startTruckAnimation(() => {
      const checkAndProceed = () => {
        if (apiCompleted) {
          setLoading(false);
          setIsAnimating(false);

          if (apiError) {
            alert(apiError.message || "Payment could not be initiated. Please try again.");
            resetTruckAnimation();
            return;
          }

          if (!apiResponse.success) {
            alert(apiResponse.message || "Failed to create order");
            resetTruckAnimation();
            return;
          }

          if (paymentMethod === "cod") {
            clearCart();
            window.location.href = `/account/orders?success=1`;
            return;
          }

          const { razorpayOrderId, amount, key, order } = apiResponse.data;
          if (amount === 0) {
            clearCart();
            window.location.href = `/account/orders/${order._id}?success=1`;
            return;
          }

          const script = document.createElement("script");
          script.src = "https://checkout.razorpay.com/v1/checkout.js";
          script.onload = () => {
            try {
              const rzp = new window.Razorpay!({
                key: key || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
                amount,
                currency: "INR",
                name: "DEHYDE",
                description: order.orderNumber,
                order_id: razorpayOrderId,
                handler: async (response: {
                  razorpay_order_id: string;
                  razorpay_payment_id: string;
                  razorpay_signature: string;
                }) => {
                  try {
                    await apiClient.post(
                      "/orders/verify-payment",
                      {
                        orderId: order._id,
                        razorpayOrderId: response.razorpay_order_id,
                        razorpayPaymentId: response.razorpay_payment_id,
                        razorpaySignature: response.razorpay_signature,
                      },
                      accessToken
                    );
                    clearCart();
                    window.location.href = `/account/orders?success=1`;
                  } catch (verifyErr) {
                    console.error("Payment verification error:", verifyErr);
                    alert("Payment verification failed. Please contact support.");
                    resetTruckAnimation();
                  }
                },
                modal: {
                  ondismiss: () => {
                    resetTruckAnimation();
                    // Cancel order if user closed the payment modal
                    apiClient
                      .post(`/orders/${order._id}/cancel`, {}, accessToken)
                      .catch((err) => console.error("Error cancelling order on dismiss", err));
                  },
                },
                theme: { color: "#1a1a1a" },
              });
              rzp.open();
            } catch (err) {
              console.error("Razorpay init error:", err);
              apiClient
                .post(`/orders/${order._id}/cancel`, {}, accessToken)
                .catch((err) => console.error("Error cancelling order on init failure", err));
              resetTruckAnimation();
              alert("Failed to initialize Razorpay checkout.");
            }
          };
          script.onerror = () => {
            apiClient
              .post(`/orders/${order._id}/cancel`, {}, accessToken)
              .catch((err) => console.error("Error cancelling order on load failure", err));
            resetTruckAnimation();
            alert("Failed to load Razorpay SDK. Please check your network connection.");
          };
          document.body.appendChild(script);
        } else {
          // Check again in 200ms
          setTimeout(checkAndProceed, 200);
        }
      };
      checkAndProceed();
    });
  };

  if (items.length === 0) {
    return (
      <motion.div className="luxury-container pt-32 text-center">
        <p>Your bag is empty.</p>
        <Button asChild className="mt-4">
          <Link href="/shop">Shop now</Link>
        </Button>
      </motion.div>
    );
  }

  return (
    <div className="pt-32 pb-section">
      <div className="luxury-container max-w-6xl">
        <h1 className="editorial-heading text-5xl">Checkout</h1>
        <div className="mt-12 grid gap-8 lg:grid-cols-[1.2fr_1fr] items-start">
          {/* Left Column: Shipping Address Form inside Card */}
          <div className="bg-white border border-gray-150 p-6 sm:p-8 rounded-2xl shadow-[0_4px_25px_rgba(0,0,0,0.015)] h-fit space-y-6">
            <p className="font-serif text-lg text-charcoal border-b border-charcoal/10 pb-4">Shipping Address</p>
            
            <div className="space-y-5">
              {/* Full Name */}
              <div className="space-y-1.5">
                <label className="text-[9px] uppercase tracking-widest text-charcoal/60 font-bold block">Full Name</label>
                <Input
                  placeholder="E.g., Badugu Praneeth"
                  value={address.fullName}
                  onChange={(e) => handleAddressChange("fullName", e.target.value)}
                  className="bg-white border border-gray-200 focus:border-charcoal focus:ring-1 focus:ring-charcoal px-4 rounded-xl h-11"
                />
              </div>

              {/* Phone */}
              <div className="space-y-1.5">
                <label className="text-[9px] uppercase tracking-widest text-charcoal/60 font-bold block">Phone Number</label>
                <Input
                  type="tel"
                  placeholder="E.g., +91 98765 43210"
                  value={address.phone}
                  onChange={(e) => handleAddressChange("phone", e.target.value)}
                  className="bg-white border border-gray-200 focus:border-charcoal focus:ring-1 focus:ring-charcoal px-4 rounded-xl h-11"
                />
              </div>

              {/* Address Line 1 */}
              <div className="space-y-1.5">
                <label className="text-[9px] uppercase tracking-widest text-charcoal/60 font-bold block">Address Line 1</label>
                <Input
                  placeholder="E.g., Door No, Street Name"
                  value={address.line1}
                  onChange={(e) => handleAddressChange("line1", e.target.value)}
                  className="bg-white border border-gray-200 focus:border-charcoal focus:ring-1 focus:ring-charcoal px-4 rounded-xl h-11"
                />
              </div>

              {/* Pincode, City, State Grid */}
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[9px] uppercase tracking-widest text-charcoal/60 font-bold block">Pincode</label>
                  <Input
                    placeholder="6-digit PIN"
                    maxLength={6}
                    value={address.pincode}
                    onChange={(e) => handleAddressChange("pincode", e.target.value)}
                    className="bg-white border border-gray-200 focus:border-charcoal focus:ring-1 focus:ring-charcoal px-4 rounded-xl h-11 text-center font-mono tracking-widest"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[9px] uppercase tracking-widest text-charcoal/60 font-bold block">City</label>
                  <Input
                    placeholder="City"
                    value={address.city}
                    onChange={(e) => handleAddressChange("city", e.target.value)}
                    disabled={loadingEstimate}
                    className="bg-white border border-gray-200 focus:border-charcoal focus:ring-1 focus:ring-charcoal px-4 rounded-xl h-11 disabled:bg-gray-50"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[9px] uppercase tracking-widest text-charcoal/60 font-bold block">State</label>
                  <Input
                    placeholder="State"
                    value={address.state}
                    onChange={(e) => handleAddressChange("state", e.target.value)}
                    disabled={loadingEstimate}
                    className="bg-white border border-gray-200 focus:border-charcoal focus:ring-1 focus:ring-charcoal px-4 rounded-xl h-11 disabled:bg-gray-50"
                  />
                </div>
              </div>
            </div>

            {/* Shipping details */}
            {shippingDetails && (
              <div className="mt-8 space-y-4 border-t border-charcoal/10 pt-6">
                <p className="text-[10px] uppercase tracking-editorial text-muted mb-2">Shipping Details</p>
                <div className="p-4 border border-charcoal/10 rounded-lg flex justify-between items-center bg-cream/10">
                  <div>
                    <p className="font-semibold text-xs text-charcoal uppercase tracking-wider">Standard Shipping</p>
                    <p className="text-muted text-[11px] mt-1">Est: {shippingDetails.standard.dateString}</p>
                    <p className="text-[10px] text-muted/80 mt-1">via {shippingDetails.standard.courier}</p>
                  </div>
                  <p className="font-semibold text-xs text-charcoal">
                    {(totalAfterDiscount >= shippingRules.freeShippingThreshold ? 0 : shippingRules.defaultShippingFee) === 0 ? "FREE" : `₹${totalAfterDiscount >= shippingRules.freeShippingThreshold ? 0 : shippingRules.defaultShippingFee}`}
                  </p>
                </div>
                
                {/* COD Warning */}
                {!shippingDetails.isCodAvailable && (
                  <p className="text-amber-600 text-xs font-medium bg-amber-50 border border-amber-200 p-3 rounded-md mt-4">
                    ⚠️ Cash on Delivery (COD) is not available for this remote pincode ({address.pincode}). Only prepaid options are enabled.
                  </p>
                )}

                {/* Payment Method Selection */}
                <div className="mt-8 space-y-4 border-t border-charcoal/10 pt-6">
                  <p className="text-[10px] uppercase tracking-editorial text-muted mb-2">Payment Method</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Razorpay Option */}
                    <div
                      onClick={() => setPaymentMethod("razorpay")}
                      className={`p-4 border rounded-xl cursor-pointer transition-all flex flex-col justify-between ${
                        paymentMethod === "razorpay"
                          ? "border-royal bg-blue-50/10 shadow-[0_2px_10px_rgba(29,78,216,0.05)]"
                          : "border-gray-200 hover:border-gray-300 bg-white"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-xs text-charcoal uppercase tracking-wider">Pay Online</span>
                        <div className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${
                          paymentMethod === "razorpay" ? "border-royal text-royal" : "border-gray-300"
                        }`}>
                          {paymentMethod === "razorpay" && <div className="w-2 h-2 rounded-full bg-royal" />}
                        </div>
                      </div>
                      <p className="text-muted text-[11px] mt-2 leading-relaxed">
                        Pay securely using Cards, UPI, Netbanking, or Wallets via Razorpay.
                      </p>
                    </div>

                    {/* Cash on Delivery Option */}
                    <div
                      onClick={() => {
                        if (shippingDetails && !shippingDetails.isCodAvailable) return;
                        setPaymentMethod("cod");
                      }}
                      className={`p-4 border rounded-xl flex flex-col justify-between ${
                        shippingDetails && !shippingDetails.isCodAvailable
                          ? "opacity-50 cursor-not-allowed border-gray-150 bg-gray-50/50"
                          : "cursor-pointer transition-all"
                      } ${
                        paymentMethod === "cod"
                          ? "border-royal bg-blue-50/10 shadow-[0_2px_10px_rgba(29,78,216,0.05)]"
                          : (shippingDetails && !shippingDetails.isCodAvailable ? "" : "border-gray-200 hover:border-gray-300 bg-white")
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-xs text-charcoal uppercase tracking-wider">Cash on Delivery</span>
                          <span className="text-[9px] font-bold text-royal bg-blue-100/60 px-1.5 py-0.5 rounded-md">
                            +₹150
                          </span>
                        </div>
                        <div className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${
                          paymentMethod === "cod" ? "border-royal text-royal" : "border-gray-300"
                        }`}>
                          {paymentMethod === "cod" && <div className="w-2 h-2 rounded-full bg-royal" />}
                        </div>
                      </div>
                      <p className="text-muted text-[11px] mt-2 leading-relaxed">
                        Pay cash when your order is delivered to your doorstep.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Order Summary inside Card */}
          <aside className="lg:sticky lg:top-32 lg:self-start bg-white border border-gray-150 p-6 sm:p-8 rounded-2xl shadow-[0_4px_25px_rgba(0,0,0,0.015)] space-y-6">
            <p className="font-serif text-lg text-charcoal border-b border-charcoal/10 pb-4">Order Summary</p>
            
            {/* Items List in Order Summary */}
            <div className="space-y-4 max-h-[220px] overflow-y-auto pr-1 border-b border-charcoal/10 pb-4 scrollbar-thin">
              {items.map((item) => (
                <div key={`${item.productId}-${item.size}-${item.color}`} className="flex gap-3 items-center">
                  <div className="relative w-12 h-16 bg-stone/5 rounded overflow-hidden flex-shrink-0 border border-black/5">
                    {item.image ? (
                      <Image
                        src={item.image}
                        alt={item.title}
                        fill
                        className="object-cover"
                        sizes="48px"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-[8px] font-bold text-neutral-400">
                        DEHYDE
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-charcoal truncate">{item.title}</p>
                    <p className="text-[10px] text-muted mt-0.5">
                      Size: <span className="font-medium text-charcoal">{item.size}</span> &middot; Color: <span className="font-medium text-charcoal">{item.color}</span>
                    </p>
                    <p className="text-[10px] text-muted mt-0.5">Qty: {item.quantity}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-semibold text-charcoal">
                      {formatPrice(item.price * item.quantity)}
                    </span>
                  </div>
                </div>
              ))}
            </div>

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
                      <div className="space-y-2 max-h-[160px] overflow-y-auto pr-1 animate-in slide-in-from-top-2 duration-200">
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
                      <Link href="/account/login?redirect=/checkout" className="underline hover:text-royal font-medium">Sign in</Link> to redeem loyalty coins and save up to 70%.
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
                          1 Coin = ₹1. Redeem up to 70% of subtotal (max ₹{Math.floor(total * 0.7)}).
                        </p>
                        {availableCoins !== null && availableCoins > 0 ? (
                          <div className="space-y-2">
                            <div className="flex gap-2">
                              <div className="relative flex-1">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-amber-600/70">₹</span>
                                <input
                                  type="number"
                                  min={0}
                                  max={Math.min(Math.floor(total * 0.7), availableCoins)}
                                  value={coinsToRedeem || ""}
                                  onChange={(e) => {
                                    const maxVal = Math.min(Math.floor(total * 0.7), availableCoins);
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
                                  const maxVal = Math.min(Math.floor(total * 0.7), availableCoins);
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
                <div className="flex justify-between text-green-600 font-semibold">
                  <span>Promo discount ({couponDetails?.code})</span>
                  <span>-{formatPrice(couponDiscount)}</span>
                </div>
              )}

              {coinsToRedeem > 0 && (
                <div className="flex justify-between text-muted">
                  <span>Coin discount</span>
                  <span>-{formatPrice(coinsToRedeem)}</span>
                </div>
              )}

              <div className="flex justify-between">
                <span className="text-muted">Shipping</span>
                <span>{shipping === 0 ? "FREE" : formatPrice(shipping)}</span>
              </div>

              {paymentMethod === "cod" && (
                <div className="flex justify-between text-royal font-semibold">
                  <span>COD Charge</span>
                  <span>{formatPrice(150)}</span>
                </div>
              )}
              
              <div className="flex justify-between border-t border-charcoal/10 pt-4 text-base font-bold">
                <span>Total</span>
                <span>{formatPrice(grandTotal)}</span>
              </div>
            </div>

            <p className="mt-4 text-xs text-muted">
              {items.length} item(s) shipping to {address.city || "destination"}
            </p>
            <div className="mt-8 flex justify-center w-full">
              {!isAddressComplete ? (
                <Button 
                  className="w-full" 
                  disabled
                >
                  Enter shipping details
                </Button>
              ) : (
                <button
                  ref={buttonRef}
                  onClick={handlePayment}
                  disabled={loading || isAnimating}
                  className="truck-button"
                >
                  <span className="default">{paymentMethod === "cod" ? "Place Order (COD)" : "Pay with Razorpay"}</span>
                  <span className="success">
                    Order Placed
                    <svg viewBox="0 0 12 10">
                      <polyline points="1.5 6 4.5 9 10.5 1"></polyline>
                    </svg>
                  </span>
                  <div className="truck">
                    <div className="wheel"></div>
                    <div className="back"></div>
                    <div className="front"></div>
                    <div className="box"></div>
                  </div>
                </button>
              )}
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
