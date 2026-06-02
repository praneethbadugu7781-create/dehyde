"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useCartStore } from "@/store/cartStore";
import { useAuthStore } from "@/store/authStore";
import { formatPrice } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";

declare global {
  interface Window {
    Razorpay?: new (options: Record<string, unknown>) => { open: () => void };
  }
}

export default function CheckoutPage() {
  const { items, subtotal, coinsToRedeem, couponCode, clearCart } = useCartStore();
  const { accessToken, user } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [address, setAddress] = useState({
    fullName: user?.name || "",
    phone: user?.phone || "",
    line1: "",
    city: "",
    state: "",
    pincode: "",
  });

  const total = subtotal();
  const shipping = total - coinsToRedeem >= 2999 ? 0 : 99;
  const grandTotal = Math.max(0, total - coinsToRedeem + shipping);

  const handlePayment = async () => {
    if (!accessToken) {
      window.location.href = "/account/login?redirect=/checkout";
      return;
    }
    setLoading(true);
    try {
      const orderRes = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"}/orders`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          credentials: "include",
          body: JSON.stringify({
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
          }),
        }
      );
      const data = await orderRes.json();
      if (!data.success) throw new Error(data.message);

      const { razorpayOrderId, amount, key, order } = data.data;
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
            await fetch(
              `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"}/orders/verify-payment`,
              {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${accessToken}`,
                },
                body: JSON.stringify({
                  orderId: order._id,
                  razorpayOrderId: response.razorpay_order_id,
                  razorpayPaymentId: response.razorpay_payment_id,
                  razorpaySignature: response.razorpay_signature,
                }),
              }
            );
            clearCart();
            window.location.href = `/account/orders?success=1`;
          },
          theme: { color: "#1a1a1a" },
        });
        rzp.open();
      };
      document.body.appendChild(script);
    } catch (e) {
      console.error(e);
      alert("Payment could not be initiated. Please try again.");
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
            {(["fullName", "phone", "line1", "city", "state", "pincode"] as const).map((field) => (
              <Input
                key={field}
                placeholder={field.replace(/([A-Z])/g, " $1")}
                value={address[field]}
                onChange={(e) => setAddress({ ...address, [field]: e.target.value })}
              />
            ))}
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
