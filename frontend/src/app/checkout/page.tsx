"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useCartStore } from "@/store/cartStore";
import { useAuthStore } from "@/store/authStore";
import { formatPrice } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { apiClient } from "@/lib/api";

declare global {
  interface Window {
    Razorpay?: new (options: Record<string, unknown>) => { open: () => void };
  }
}

export default function CheckoutPage() {
  const { items, subtotal, coinsToRedeem, couponCode, clearCart } = useCartStore();
  const { accessToken, user } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [shippingMethod, setShippingMethod] = useState<"standard" | "express">("standard");
  const [shippingDetails, setShippingDetails] = useState<any>(null);
  const [loadingEstimate, setLoadingEstimate] = useState(false);
  const [address, setAddress] = useState({
    fullName: user?.name || "",
    phone: user?.phone || "",
    line1: "",
    city: "",
    state: "",
    pincode: "",
  });

  const total = subtotal();
  let shipping = total - coinsToRedeem >= 2999 ? 0 : 99;
  
  if (shippingDetails) {
    if (shippingMethod === "express") {
      shipping = shippingDetails.express.price;
    } else {
      shipping = shippingDetails.standard.price;
    }
  }

  const grandTotal = Math.max(0, total - coinsToRedeem + shipping);

  const fetchEstimation = async (pin: string, currentAddress = address) => {
    setLoadingEstimate(true);
    try {
      const res = await apiClient.post<any>("/settings/estimate", {
        pincode: pin,
        subtotal: total - coinsToRedeem,
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
    setLoading(true);
    try {
      const res = await apiClient.post<any>(
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
        },
        accessToken
      );

      if (!res.success) throw new Error(res.message);

      const { razorpayOrderId, amount, key, order } = res.data;
      if (amount === 0) {
        clearCart();
        window.location.href = `/account/orders/${order._id}?success=1`;
        return;
      }

      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => {
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
            }
          },
          theme: { color: "#1a1a1a" },
        });
        rzp.open();
      };
      document.body.appendChild(script);
    } catch (e: any) {
      console.error(e);
      alert(e.message || "Payment could not be initiated. Please try again.");
    } finally {
      setLoading(false);
    }
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
      <div className="luxury-container max-w-4xl">
        <h1 className="editorial-heading text-5xl">Checkout</h1>
        <div className="mt-16 grid gap-16 lg:grid-cols-2">
          <div className="space-y-6">
            <p className="text-[10px] uppercase tracking-editorial text-muted">Shipping address</p>
            {(["fullName", "phone", "line1", "pincode", "city", "state"] as const).map((field) => (
              <Input
                key={field}
                placeholder={field.replace(/([A-Z])/g, " $1")}
                value={address[field]}
                onChange={(e) => handleAddressChange(field, e.target.value)}
                disabled={(field === "city" || field === "state") && loadingEstimate}
              />
            ))}

            {/* Shipping Speed Selection */}
            {shippingDetails && (
              <div className="mt-8 space-y-4 border-t border-charcoal/10 pt-6">
                <p className="text-[10px] uppercase tracking-editorial text-muted mb-2">Shipping Speed</p>
                <div className="grid grid-cols-2 gap-4">
                  {/* Standard Card */}
                  <label className={`p-4 border rounded-lg cursor-pointer flex flex-col justify-between transition-all ${
                    shippingMethod === "standard" ? "border-charcoal bg-cream/10" : "border-charcoal/10 hover:border-charcoal/30"
                  }`}>
                    <input
                      type="radio"
                      name="shippingMethod"
                      value="standard"
                      checked={shippingMethod === "standard"}
                      onChange={() => setShippingMethod("standard")}
                      className="sr-only"
                    />
                    <div>
                      <p className="font-semibold text-xs text-charcoal uppercase tracking-wider">Standard Delivery</p>
                      <p className="text-muted text-[11px] mt-1">Est: {shippingDetails.standard.dateString}</p>
                      <p className="text-[10px] text-muted/80 mt-1">via {shippingDetails.standard.courier}</p>
                    </div>
                    <p className="font-semibold text-xs mt-3 text-charcoal">
                      {shippingDetails.standard.price === 0 ? "FREE" : `₹${shippingDetails.standard.price}`}
                    </p>
                  </label>

                  {/* Express Card */}
                  {shippingDetails.express.isAvailable ? (
                    <label className={`p-4 border rounded-lg cursor-pointer flex flex-col justify-between transition-all ${
                      shippingMethod === "express" ? "border-charcoal bg-cream/10" : "border-charcoal/10 hover:border-charcoal/30"
                    }`}>
                      <input
                        type="radio"
                        name="shippingMethod"
                        value="express"
                        checked={shippingMethod === "express"}
                        onChange={() => setShippingMethod("express")}
                        className="sr-only"
                      />
                      <div>
                        <p className="font-semibold text-xs text-charcoal uppercase tracking-wider flex items-center gap-1">
                          Express Speed
                          <span className="bg-charcoal text-offwhite text-[8px] px-1 py-0.2 rounded font-normal uppercase scale-90">Fast</span>
                        </p>
                        <p className="text-muted text-[11px] mt-1">Est: {shippingDetails.express.dateString}</p>
                        <p className="text-[10px] text-muted/80 mt-1">via {shippingDetails.express.courier}</p>
                      </div>
                      <p className="font-semibold text-xs mt-3 text-charcoal">
                        ₹{shippingDetails.express.price}
                      </p>
                    </label>
                  ) : (
                    <div className="p-4 border border-dashed border-charcoal/10 rounded-lg flex flex-col justify-center items-center text-center bg-stone/5">
                      <p className="font-semibold text-xs text-muted uppercase tracking-wider">Express Delivery</p>
                      <p className="text-muted text-[10px] mt-2 leading-relaxed">Unavailable for this region</p>
                    </div>
                  )}
                </div>
                
                {/* COD Warning */}
                {!shippingDetails.isCodAvailable && (
                  <p className="text-amber-600 text-xs font-medium bg-amber-50 border border-amber-200 p-3 rounded-md mt-4">
                    ⚠️ Cash on Delivery (COD) is not available for this remote pincode ({address.pincode}). Only prepaid options are enabled.
                  </p>
                )}
              </div>
            )}
          </div>
          <aside>
            <p className="text-[10px] uppercase tracking-editorial text-muted">Order total</p>
            <p className="mt-4 text-3xl font-serif">{formatPrice(grandTotal)}</p>
            <p className="mt-2 text-xs text-muted">
              {items.length} item(s) · Coins applied: {coinsToRedeem}
            </p>
            <Button className="mt-8 w-full" onClick={handlePayment} disabled={loading}>
              {loading ? "Processing..." : "Pay with Razorpay"}
            </Button>
          </aside>
        </div>
      </div>
    </div>
  );
}
