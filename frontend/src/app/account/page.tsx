"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ShoppingBag, Heart, Coins, MapPin, LogOut, ArrowRight } from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import { useWishlistStore } from "@/store/wishlistStore";
import { apiClient } from "@/lib/api";
import type { Order, Wallet } from "@/types";

export default function AccountPage() {
  const { user, logout, accessToken } = useAuthStore();
  const wishlistIds = useWishlistStore((s) => s.ids);
  
  // Dashboard Stats
  const [ordersCount, setOrdersCount] = useState(0);
  const [coinsBalance, setCoinsBalance] = useState(0);
  const [loadingStats, setLoadingStats] = useState(true);

  useEffect(() => {
    if (!accessToken) return;
    setLoadingStats(true);
    
    // Fetch orders count and wallet balance in parallel
    Promise.all([
      apiClient.get<{ success: boolean; data: Order[] }>("/orders", accessToken)
        .then((res) => setOrdersCount(res.data?.length || 0))
        .catch(() => setOrdersCount(0)),
      apiClient.get<{ success: boolean; data: Wallet }>("/rewards", accessToken)
        .then((res) => setCoinsBalance(res.data?.balance || 0))
        .catch(() => setCoinsBalance(0))
    ]).finally(() => setLoadingStats(false));
  }, [accessToken]);

  if (!user) {
    return (
      <div className="luxury-container py-32 text-center flex flex-col items-center justify-center min-h-[60vh]">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md space-y-6"
        >
          <h1 className="editorial-heading text-4xl md:text-5xl">Your Account</h1>
          <p className="text-sm text-muted leading-relaxed">
            Sign in to manage your orders, check your DEHYDE Coins loyalty balance, and view your wishlist.
          </p>
          <Link
            href="/account/login"
            className="inline-block bg-charcoal text-offwhite text-xs uppercase tracking-widest px-8 py-4 hover:opacity-90 transition-opacity"
          >
            Sign In
          </Link>
        </motion.div>
      </div>
    );
  }

  // Generate initial monogram
  const userInitial = user.name ? user.name.charAt(0).toUpperCase() : "D";

  const DASHBOARD_CARDS = [
    {
      href: "/account/orders",
      label: "My Orders",
      description: "Track shipment progress, view invoices, and order history.",
      icon: ShoppingBag,
      stat: loadingStats ? "..." : `${ordersCount} orders`,
    },
    {
      href: "/account/wishlist",
      label: "Wishlist",
      description: "Manage your saved editorial pieces and wardrobe curation.",
      icon: Heart,
      stat: `${wishlistIds.length} items`,
    },
    {
      href: "/account/wallet",
      label: "DEHYDE Coins",
      description: "Check rewards balance, redeemable codes, and loyalty history.",
      icon: Coins,
      stat: loadingStats ? "..." : `${coinsBalance} coins`,
    },
    {
      href: "/account/addresses",
      label: "Addresses",
      description: "Manage default shipping endpoints and billing details.",
      icon: MapPin,
      stat: `${user.addresses?.length || 0} saved`,
    },
  ];

  return (
    <div className="pt-32 pb-section bg-offwhite/30">
      <div className="luxury-container max-w-4xl">
        
        {/* Profile Card Header */}
        <div className="bg-white border border-gray-100 p-8 md:p-12 rounded-3xl shadow-[0_4px_30px_rgba(0,0,0,0.015)] flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="flex items-center gap-6">
            <div className="h-16 w-16 md:h-20 md:w-20 rounded-full bg-charcoal text-offwhite flex items-center justify-center font-serif text-2xl md:text-3xl font-light shadow-inner">
              {userInitial}
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-editorial text-muted">Customer Account</p>
              <h1 className="font-serif text-3xl md:text-4xl text-charcoal font-medium mt-1">
                Hello, {user.name}
              </h1>
              <p className="text-xs text-muted mt-1.5">{user.email}</p>
            </div>
          </div>
          
          <button
            type="button"
            onClick={logout}
            className="flex items-center gap-2 border border-red-100 text-red-500 hover:bg-red-50/50 hover:border-red-200 px-4 py-2.5 rounded-xl text-[10px] uppercase tracking-widest transition-all duration-300"
          >
            <LogOut className="h-3 w-3" />
            Sign Out
          </button>
        </div>

        {/* Dynamic Stats Grid */}
        <div className="grid grid-cols-3 gap-4 mt-8">
          <div className="bg-white border border-gray-100 p-5 rounded-2xl text-center shadow-[0_2px_15px_rgba(0,0,0,0.01)]">
            <p className="text-[9px] uppercase tracking-widest text-muted">Wallet Balance</p>
            <p className="font-serif text-2xl text-charcoal font-semibold mt-1">
              {loadingStats ? "..." : coinsBalance}
            </p>
            <p className="text-[8px] text-green-600 mt-1 uppercase tracking-wider font-medium">1 Coin = ₹1</p>
          </div>
          <div className="bg-white border border-gray-100 p-5 rounded-2xl text-center shadow-[0_2px_15px_rgba(0,0,0,0.01)]">
            <p className="text-[9px] uppercase tracking-widest text-muted">Wishlisted</p>
            <p className="font-serif text-2xl text-charcoal font-semibold mt-1">
              {wishlistIds.length}
            </p>
            <p className="text-[8px] text-muted mt-1 uppercase tracking-wider">Garments</p>
          </div>
          <div className="bg-white border border-gray-100 p-5 rounded-2xl text-center shadow-[0_2px_15px_rgba(0,0,0,0.01)]">
            <p className="text-[9px] uppercase tracking-widest text-muted">Total Orders</p>
            <p className="font-serif text-2xl text-charcoal font-semibold mt-1">
              {loadingStats ? "..." : ordersCount}
            </p>
            <p className="text-[8px] text-muted mt-1 uppercase tracking-wider">Purchased</p>
          </div>
        </div>

        {/* Dashboard Navigation Grid */}
        <div className="grid gap-6 sm:grid-cols-2 mt-8">
          {DASHBOARD_CARDS.map((card, idx) => {
            const Icon = card.icon;
            
            return (
              <Link
                key={idx}
                href={card.href}
                className="group bg-white border border-gray-100 hover:border-charcoal/20 p-6 md:p-8 rounded-3xl shadow-[0_4px_20px_rgba(0,0,0,0.01)] hover:shadow-[0_10px_30px_rgba(0,0,0,0.03)] hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between min-h-[180px]"
              >
                <div>
                  <div className="flex justify-between items-start">
                    <div className="p-3 bg-gray-50 rounded-2xl group-hover:bg-cream/40 transition-colors duration-300">
                      <Icon className="h-5 w-5 text-charcoal" strokeWidth={1.2} />
                    </div>
                    <span className="text-[9px] uppercase tracking-widest bg-gray-50 border border-gray-100 group-hover:bg-charcoal group-hover:text-offwhite group-hover:border-charcoal transition-all px-2.5 py-0.5 rounded-full font-medium text-charcoal/60">
                      {card.stat}
                    </span>
                  </div>
                  <h3 className="font-serif text-lg text-charcoal font-medium mt-6 group-hover:text-charcoal/80 transition-colors">
                    {card.label}
                  </h3>
                  <p className="text-xs text-muted/80 mt-2 leading-relaxed">
                    {card.description}
                  </p>
                </div>
                <div className="flex items-center gap-1.5 text-[9px] uppercase tracking-widest text-charcoal/40 group-hover:text-charcoal transition-colors mt-6 pt-4 border-t border-gray-50">
                  Manage Details
                  <ArrowRight className="h-3 w-3 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            );
          })}
        </div>

      </div>
    </div>
  );
}
