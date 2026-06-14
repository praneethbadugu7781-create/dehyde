"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { useAuthStore } from "@/store/authStore";
import { apiClient } from "@/lib/api";
import type { Wallet } from "@/types";

export default function WalletPage() {
  const { accessToken, user } = useAuthStore();
  const [wallet, setWallet] = useState<Wallet | null>(null);

  useEffect(() => {
    if (!accessToken) return;
    apiClient
      .get<{ success: boolean; data: Wallet }>("/rewards", accessToken)
      .then((r) => setWallet(r.data))
      .catch(() => setWallet({ balance: 0, totalEarned: 0, totalRedeemed: 0, history: [] }));
  }, [accessToken]);

  if (!user) {
    return (
      <div className="luxury-container py-32 text-center">
        <Link href="/account/login">Sign in to view wallet</Link>
      </div>
    );
  }

  return (
    <div className="pt-32 pb-section">
      <div className="luxury-container max-w-2xl">
        <Link href="/account" className="text-[10px] uppercase tracking-editorial text-muted">
          ← Account
        </Link>
        <h1 className="editorial-heading mt-6 text-5xl">DEHYDE Rewards</h1>
        <p className="mt-4 text-sm text-muted">1 coin = ₹1 · Redeem up to 30% on orders</p>

        {/* How it works card */}
        <div className="mt-8 bg-amber-50/15 border border-amber-200/40 p-6 rounded-xl space-y-4">
          <p className="text-[10px] uppercase tracking-wider text-amber-800 font-bold">How DEHYDE Rewards Work</p>
          <div className="grid sm:grid-cols-3 gap-6 text-xs text-charcoal/80">
            <div className="space-y-1">
              <p className="font-bold text-charcoal">1. Earn Coins</p>
              <p className="text-muted leading-relaxed">Receive coins automatically on every purchase you make.</p>
            </div>
            <div className="space-y-1">
              <p className="font-bold text-charcoal">2. Cash Value</p>
              <p className="text-muted leading-relaxed">1 DEHYDE Coin is always worth exactly ₹1 in savings.</p>
            </div>
            <div className="space-y-1">
              <p className="font-bold text-charcoal">3. Save Big</p>
              <p className="text-muted leading-relaxed">Redeem your coins at checkout to pay for up to 30% of your order.</p>
            </div>
          </div>
        </div>

        <motion.div className="mt-10 border border-charcoal/10 p-10">
          <p className="text-[10px] uppercase tracking-editorial text-muted">Available balance</p>
          <p className="editorial-heading mt-2 text-6xl">{wallet?.balance ?? 0}</p>
          <div className="mt-8 flex gap-8 text-sm text-muted">
            <div>
              <p className="text-[10px] uppercase tracking-editorial">Earned</p>
              <p className="mt-1 text-charcoal">{wallet?.totalEarned ?? 0}</p>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-editorial">Redeemed</p>
              <p className="mt-1 text-charcoal">{wallet?.totalRedeemed ?? 0}</p>
            </div>
          </div>
        </motion.div>

        <div className="mt-12">
          <p className="text-[10px] uppercase tracking-editorial text-muted">History</p>
          <ul className="mt-6 space-y-4">
            {(wallet?.history || []).slice(0, 20).map((h, i) => (
              <li key={i} className="flex justify-between border-b border-charcoal/5 py-4 text-sm">
                <span>{h.description}</span>
                <span className={h.type === "earn" ? "text-charcoal" : "text-muted"}>
                  {h.type === "earn" ? "+" : "-"}
                  {h.amount}
                </span>
              </li>
            ))}
            {!wallet?.history?.length && (
              <li className="py-8 text-sm text-muted">No transactions yet</li>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
}
