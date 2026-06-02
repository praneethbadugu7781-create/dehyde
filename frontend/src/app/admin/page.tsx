"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { useAuthStore } from "@/store/authStore";
import { apiClient } from "@/lib/api";
import { formatPrice } from "@/lib/utils";

interface Dashboard {
  totalOrders: number;
  totalRevenue: number;
  totalProducts: number;
  totalCustomers: number;
  recentOrders: { orderNumber: string; total: number; status: string; user?: { name: string } }[];
  lowStock: { title: string; stock: number }[];
}

export default function AdminPage() {
  const { accessToken, user } = useAuthStore();
  const [data, setData] = useState<Dashboard | null>(null);

  useEffect(() => {
    if (!accessToken || user?.role !== "admin") return;
    apiClient
      .get<{ success: boolean; data: Dashboard }>("/admin/dashboard", accessToken)
      .then((r) => setData(r.data))
      .catch(console.error);
  }, [accessToken, user]);

  return (
    <div className="animate-in fade-in duration-500 max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="font-serif text-4xl text-[#333] mb-2">Dashboard</h1>
        <p className="text-sm text-[#777]">Welcome back! Here's what's happening with your store.</p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        {[
          { label: "Total Revenue", value: formatPrice(data?.totalRevenue || 0), icon: "₹", color: "bg-red-50 text-red-600" },
          { label: "Total Orders", value: data?.totalOrders ?? 0, icon: "🛒", color: "bg-green-50 text-green-600" },
          { label: "Total Products", value: data?.totalProducts ?? 0, icon: "📦", color: "bg-blue-50 text-blue-600" },
          { label: "Customers", value: data?.totalCustomers ?? 0, icon: "👥", color: "bg-purple-50 text-purple-600" },
        ].map((stat) => (
          <div key={stat.label} className="bg-white p-6 rounded-2xl shadow-[0_2px_10px_rgba(0,0,0,0.04)] flex flex-col justify-between relative overflow-hidden">
            <div className="flex justify-between items-start mb-6">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg ${stat.color}`}>
                {stat.icon}
              </div>
              <div className="flex items-center gap-1 text-green-500 text-xs font-medium">
                <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>
                Live
              </div>
            </div>
            <div>
              <p className="font-serif text-3xl font-medium text-[#222]">{stat.value}</p>
              <p className="text-sm text-[#777] mt-1">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid gap-8 lg:grid-cols-[1.5fr_1fr]">
        <div className="bg-white p-8 rounded-2xl shadow-[0_2px_10px_rgba(0,0,0,0.04)]">
          <h2 className="font-serif text-xl text-[#222] mb-6">Recent Orders</h2>
          <ul className="space-y-0">
            {(data?.recentOrders || []).map((o) => (
              <li key={o.orderNumber} className="flex justify-between items-center border-b border-gray-100 py-4 text-sm last:border-0">
                <div className="flex flex-col">
                  <span className="font-medium text-[#222]">{o.orderNumber}</span>
                  <span className="text-xs text-[#777] mt-1">{o.user?.name || "Guest"}</span>
                </div>
                <div className="flex flex-col items-end">
                  <span className="font-medium text-[#222]">{formatPrice(o.total)}</span>
                  <span className={`text-[10px] uppercase tracking-wider mt-1 px-2 py-0.5 rounded-md font-medium ${o.status === 'delivered' ? 'bg-green-50 text-green-600' : 'bg-gray-100 text-gray-600'}`}>{o.status}</span>
                </div>
              </li>
            ))}
            {(!data?.recentOrders || data.recentOrders.length === 0) && (
              <li className="py-8 text-center text-sm text-gray-400">No recent orders</li>
            )}
          </ul>
        </div>
        
        <div className="bg-white p-8 rounded-2xl shadow-[0_2px_10px_rgba(0,0,0,0.04)]">
          <h2 className="font-serif text-xl text-[#222] mb-6">Low Stock Alerts</h2>
          <ul className="space-y-0">
            {(data?.lowStock || []).map((p) => (
              <li key={p.title} className="flex justify-between items-center border-b border-gray-100 py-4 text-sm last:border-0">
                <span className="text-[#333] truncate pr-4 font-medium">{p.title}</span>
                <span className="text-amber-600 font-medium whitespace-nowrap px-3 py-1 bg-amber-50 rounded-md text-xs">
                  {p.stock} left
                </span>
              </li>
            ))}
            {(!data?.lowStock || data.lowStock.length === 0) && (
              <li className="py-8 text-center text-sm text-gray-400">All products are well stocked</li>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
}

