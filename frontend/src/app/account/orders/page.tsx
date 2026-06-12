"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useAuthStore } from "@/store/authStore";
import { apiClient } from "@/lib/api";
import { formatPrice } from "@/lib/utils";
import type { Order } from "@/types";

export default function OrdersPage() {
  const { accessToken, user } = useAuthStore();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);

  useEffect(() => {
    if (!accessToken) return;
    setLoading(true);
    apiClient
      .get<{ success: boolean; data: Order[] }>("/orders", accessToken)
      .then((r) => {
        setOrders(r.data);
        if (r.data.length > 0) {
          setExpandedOrderId(r.data[0]._id); // auto expand first order
        }
      })
      .catch(() => setOrders([]))
      .finally(() => setLoading(false));
  }, [accessToken]);

  if (!user) {
    return (
      <div className="luxury-container py-32 text-center">
        <Link href="/account/login" className="text-sm uppercase tracking-editorial underline">
          Sign in to view orders
        </Link>
      </div>
    );
  }

  const getStatusStep = (status: string) => {
    const steps = ["paid", "processing", "shipped", "delivered"];
    return steps.indexOf(status.toLowerCase());
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "delivered":
        return "bg-green-50 text-green-700 border-green-200";
      case "shipped":
        return "bg-blue-50 text-blue-700 border-blue-200";
      case "processing":
        return "bg-amber-50 text-amber-700 border-amber-200";
      case "cancelled":
        return "bg-red-50 text-red-700 border-red-200";
      default:
        return "bg-gray-50 text-gray-700 border-gray-200";
    }
  };

  return (
    <div className="pt-32 pb-section">
      <div className="luxury-container max-w-3xl">
        <Link
          href="/account"
          className="text-[10px] uppercase tracking-editorial text-muted hover:text-charcoal transition-colors"
        >
          ← Account
        </Link>
        <h1 className="editorial-heading mt-6 text-5xl">My Orders</h1>

        {loading ? (
          <p className="text-muted text-sm py-16 text-center">Loading orders...</p>
        ) : orders.length === 0 ? (
          <div className="text-center py-16 border border-dashed border-gray-200 rounded-2xl mt-12">
            <p className="text-sm text-muted">You haven't placed any orders yet.</p>
            <Link
              href="/shop"
              className="inline-block mt-4 text-[10px] uppercase tracking-widest bg-royal text-offwhite px-6 py-3 hover:opacity-90 transition-opacity"
            >
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="mt-12 space-y-6">
            {orders.map((order) => {
              const isExpanded = expandedOrderId === order._id;
              const currentStepIndex = getStatusStep(order.status);
              
              return (
                <div
                  key={order._id}
                  className="border border-gray-100 rounded-2xl overflow-hidden bg-white shadow-[0_2px_10px_rgba(0,0,0,0.02)] transition-all duration-300"
                >
                  {/* Accordion Trigger Header */}
                  <button
                    type="button"
                    onClick={() => setExpandedOrderId(isExpanded ? null : order._id)}
                    className="w-full text-left p-6 flex justify-between items-center hover:bg-gray-50/20 transition-colors"
                  >
                    <div>
                      <div className="flex items-center gap-3">
                        <span className="font-serif text-base text-charcoal font-medium">
                          {order.orderNumber}
                        </span>
                        <span
                          className={`px-2.5 py-0.5 text-[8px] uppercase tracking-widest rounded-md border ${getStatusColor(
                            order.status
                          )}`}
                        >
                          {order.status}
                        </span>
                      </div>
                      <p className="text-xs text-muted mt-1.5">
                        {new Date(order.createdAt).toLocaleDateString("en-US", {
                          month: "short",
                          day: "2-digit",
                          year: "numeric",
                        })}
                      </p>
                    </div>
                    <div className="text-right flex items-center gap-4">
                      <div>
                        <p className="text-sm font-medium text-charcoal">{formatPrice(order.total)}</p>
                        <p className="text-[10px] text-muted mt-0.5">
                          {order.items.reduce((acc, item) => acc + item.quantity, 0)} items
                        </p>
                      </div>
                      <span className={`text-muted transition-transform duration-300 ${isExpanded ? "rotate-180" : ""}`}>
                        ▼
                      </span>
                    </div>
                  </button>

                  {/* Expanded Order Detail View */}
                  {isExpanded && (
                    <div className="border-t border-gray-50 p-6 bg-gray-50/10 space-y-8 animate-in fade-in duration-300">
                      
                      {/* Dynamic Visual Tracking Bar */}
                      {order.status.toLowerCase() !== "cancelled" && order.status.toLowerCase() !== "refunded" && (
                        <div className="py-4">
                          <p className="text-[10px] uppercase tracking-editorial text-muted mb-6">Delivery Progress</p>
                          <div className="relative flex justify-between items-center max-w-xl mx-auto">
                            {/* Connecting Progress Line */}
                            <div className="absolute left-0 right-0 top-1/2 h-[2px] bg-gray-100 -translate-y-1/2 z-0" />
                            <div
                              className="absolute left-0 top-1/2 h-[2px] bg-royal -translate-y-1/2 z-0 transition-all duration-500"
                              style={{
                                width: `${currentStepIndex >= 0 ? (currentStepIndex / 3) * 100 : 0}%`,
                              }}
                            />

                            {/* Tracking Milestones */}
                            {["Paid", "Processing", "Shipped", "Delivered"].map((label, index) => {
                              const isCompleted = index <= currentStepIndex;
                              const isActive = index === currentStepIndex;
                              
                              return (
                                <div key={label} className="relative z-10 flex flex-col items-center">
                                  <div
                                    className={`w-6 h-6 rounded-full border-2 flex items-center justify-center text-[10px] transition-all duration-300 ${
                                      isCompleted
                                        ? "bg-royal border-royal text-offwhite scale-110"
                                        : "bg-white border-gray-200 text-gray-300"
                                    } ${isActive ? "ring-4 ring-royal/10" : ""}`}
                                  >
                                    {isCompleted ? "✓" : index + 1}
                                  </div>
                                  <span
                                    className={`text-[9px] uppercase tracking-widest mt-2 font-medium ${
                                      isCompleted ? "text-royal" : "text-gray-400"
                                    }`}
                                  >
                                    {label}
                                  </span>
                                </div>
                              );
                            })}
                          </div>

                          {/* Tracking Number Callout */}
                          {order.trackingNumber && (
                            <div className="mt-8 text-center bg-white p-3 rounded-lg border border-gray-100 max-w-md mx-auto">
                              <p className="text-xs text-charcoal/80">
                                Tracking Number: <strong className="text-charcoal">{order.trackingNumber}</strong>
                              </p>
                              <p className="text-[10px] text-muted mt-0.5">Shipped via Standard Courier Service</p>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Financial & Shipping Info Summary Grid */}
                      <div className="grid gap-8 md:grid-cols-2 pt-4 border-t border-gray-100">
                        {/* Shipping Address */}
                        <div>
                          <p className="text-[10px] uppercase tracking-editorial text-muted mb-3">Shipping Address</p>
                          <div className="text-xs text-charcoal/80 space-y-1 bg-white p-4 rounded-xl border border-gray-50 shadow-[0_2px_8px_rgba(0,0,0,0.01)]">
                            <p className="font-semibold text-charcoal">{order.shippingAddress.fullName}</p>
                            <p>Phone: {order.shippingAddress.phone}</p>
                            <p className="leading-relaxed mt-1">
                              {order.shippingAddress.line1}
                              {order.shippingAddress.line2 && `, ${order.shippingAddress.line2}`}
                              <br />
                              {order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.pincode}
                            </p>
                          </div>
                        </div>

                        {/* Cost breakdown */}
                        <div>
                          <p className="text-[10px] uppercase tracking-editorial text-muted mb-3">Billing Summary</p>
                          <div className="text-xs text-charcoal/80 space-y-2 bg-white p-4 rounded-xl border border-gray-50 shadow-[0_2px_8px_rgba(0,0,0,0.01)]">
                            <div className="flex justify-between">
                              <span className="text-muted">Subtotal</span>
                              <span>{formatPrice(order.subtotal || order.total - order.shipping)}</span>
                            </div>
                            {order.discount > 0 && (
                              <div className="flex justify-between text-green-600">
                                <span>Coupon Discount</span>
                                <span>-{formatPrice(order.discount)}</span>
                              </div>
                            )}
                            {order.coinDiscount > 0 && (
                              <div className="flex justify-between text-green-600">
                                <span>DEHYDE Coins Redeemed</span>
                                <span>-{formatPrice(order.coinDiscount)}</span>
                              </div>
                            )}
                            <div className="flex justify-between">
                              <span className="text-muted">Shipping Fee</span>
                              <span>{order.shipping > 0 ? formatPrice(order.shipping) : "Free"}</span>
                            </div>
                            <div className="border-t border-gray-50 pt-2 flex justify-between font-serif text-sm text-charcoal font-medium">
                              <span>Total Amount Paid</span>
                              <span>{formatPrice(order.total)}</span>
                            </div>
                            {order.coinsEarned > 0 && (
                              <div className="border-t border-dashed border-gray-100 pt-2 text-[10px] text-green-600 flex justify-between items-center">
                                <span>Coins Credited to Wallet:</span>
                                <span className="font-semibold">+{order.coinsEarned} Coins</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Items List */}
                      <div>
                        <p className="text-[10px] uppercase tracking-editorial text-muted mb-4">Ordered Items</p>
                        <div className="space-y-4">
                          {order.items.map((item, idx) => (
                            <div
                              key={idx}
                              className="flex items-center gap-4 bg-white p-3 rounded-xl border border-gray-50"
                            >
                              <div className="relative aspect-[3/4] w-12 overflow-hidden bg-stone/5 rounded">
                                {item.image ? (
                                  <Image
                                    src={item.image}
                                    alt={item.title}
                                    fill
                                    className="object-cover"
                                    sizes="50px"
                                  />
                                ) : (
                                  <div className="flex h-full items-center justify-center text-[8px] uppercase tracking-editorial text-muted">
                                    D
                                  </div>
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <h4 className="text-xs text-charcoal font-medium truncate">{item.title}</h4>
                                <p className="text-[10px] text-muted mt-1 uppercase tracking-wider">
                                  Size: {item.size} · Color: {item.color}
                                </p>
                              </div>
                              <div className="text-right">
                                <p className="text-xs text-charcoal font-medium">
                                  {formatPrice(item.price)}
                                </p>
                                <p className="text-[10px] text-muted mt-1">Qty: {item.quantity}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
