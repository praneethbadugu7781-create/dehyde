"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { LayoutDashboard, Package, ShoppingCart, Users, Ticket, Star, Truck, ArrowLeft, LogOut, MessageSquare, Tag } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { apiClient } from "@/lib/api";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, logout, accessToken, setAuth } = useAuthStore();
  const pathname = usePathname();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  // Login form state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState("");

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    setLoginLoading(true);
    setLoginError("");
    try {
      const res = await apiClient.post<{
        success: boolean;
        data: { accessToken: string; user: { id: string; role: string } };
      }>("/auth/login", { email, password });

      if (res.data.user.role !== "admin") {
        throw new Error("Access denied. Administrator role is required.");
      }

      const meRes = await apiClient.get<{ success: boolean; data: any }>(
        "/auth/me",
        res.data.accessToken
      );

      setAuth(res.data.accessToken, meRes.data);
    } catch (err) {
      setLoginError(err instanceof Error ? err.message : "Invalid email or password.");
    } finally {
      setLoginLoading(false);
    }
  };

  useEffect(() => {
    setMounted(true);
  }, []);

  // Show a blank loading shell or spinner until hydrated to prevent hydration mismatch
  if (!mounted) {
    return (
      <div className="min-h-screen bg-[#f8f6f3] flex items-center justify-center">
        <span className="font-serif text-lg animate-pulse">Loading DEHYDE Admin...</span>
      </div>
    );
  }

  if (!accessToken || user?.role !== "admin") {
    return (
      <div className="min-h-screen bg-[#f8f6f3] flex items-center justify-center p-6 text-charcoal relative">
        <Link href="/shop" className="absolute top-8 left-8 flex items-center gap-2 text-xs uppercase tracking-widest hover:text-black font-semibold text-charcoal/60">
          <ArrowLeft size={16} />
          Back to Store
        </Link>

        <div className="w-full max-w-md bg-white border border-gray-150 p-8 md:p-10 rounded-2xl shadow-[0_4px_25px_rgba(0,0,0,0.03)]">
          <div className="text-center mb-8 flex flex-col items-center">
            <div className="h-12 w-auto mb-4 flex items-center justify-center">
              <Image
                src="/logo.png"
                alt="DEHYDE Logo"
                width={150}
                height={40}
                className="h-full w-auto object-contain"
                priority
              />
            </div>
            <p className="text-[10px] uppercase tracking-widest text-charcoal/40 font-bold">Administrator Portal</p>
          </div>

          <form onSubmit={handleLoginSubmit} className="space-y-6">
            <div className="space-y-1.5">
              <label className="text-[9px] uppercase tracking-widest text-charcoal/50 font-bold block">Email Address</label>
              <Input
                type="email"
                placeholder="admin@dehyde.in"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loginLoading}
                className="border-gray-200 focus:border-charcoal bg-white text-charcoal rounded-xl h-11"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[9px] uppercase tracking-widest text-charcoal/50 font-bold block">Password</label>
              <Input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loginLoading}
                className="border-gray-200 focus:border-charcoal bg-white text-charcoal rounded-xl h-11"
              />
            </div>

            {loginError && (
              <p className="text-xs text-red-600 bg-red-50 border border-red-100 rounded-xl p-3.5 font-medium text-left">
                {loginError}
              </p>
            )}

            <Button
              type="submit"
              disabled={loginLoading}
              className="w-full bg-royal text-white hover:bg-blue-800 h-12 text-xs uppercase tracking-widest rounded-xl font-bold transition-all shadow-md hover:shadow-lg"
            >
              {loginLoading ? "Authenticating..." : "Sign In to Panel"}
            </Button>
          </form>
        </div>
      </div>
    );
  }

  const navLinks = [
    { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
    { name: "Products", href: "/admin/products", icon: Package },
    { name: "Orders", href: "/admin/orders", icon: ShoppingCart },
    { name: "Customers", href: "/admin/customers", icon: Users },
    { name: "Banners", href: "/admin/banners", icon: Star },
    { name: "Coupons", href: "/admin/coupons", icon: Ticket },
    { name: "Offers", href: "/admin/offers", icon: Tag },
    { name: "Suggestions", href: "/admin/suggestions", icon: MessageSquare },
    { name: "Settings", href: "/admin/settings", icon: Truck },
  ];

  return (
    <div className="min-h-screen bg-[#f8f6f3] text-[#333] flex font-sans">
      {/* Sidebar */}
      <aside className="w-64 bg-royal text-offwhite flex-shrink-0 flex flex-col fixed inset-y-0 left-0 z-20">
        <div className="p-6 flex items-center gap-3">
          <div className="h-9 w-auto flex items-center">
            <Image
              src="/logo.png"
              alt="DEHYDE Logo"
              width={120}
              height={32}
              className="h-full w-auto object-contain brightness-0 invert"
              priority
            />
          </div>
          <span className="bg-white/20 text-white text-[10px] px-2 py-0.5 rounded-sm uppercase tracking-wider ml-auto">Admin</span>
        </div>

        <nav className="flex-1 overflow-y-auto py-4 flex flex-col gap-1 px-4 mt-4">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.name}
                href={link.href}
                className={`flex items-center gap-4 px-4 py-3 text-sm transition-all rounded-xl ${
                  isActive
                    ? "bg-white/10 text-white font-medium"
                    : "text-offwhite/70 hover:bg-white/5 hover:text-white"
                }`}
              >
                <Icon size={18} strokeWidth={isActive ? 2.5 : 2} />
                <span>{link.name}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-white/10 space-y-1">
          <Link href="/shop" className="flex items-center gap-4 px-4 py-3 text-sm text-offwhite/70 hover:text-white hover:bg-white/5 rounded-xl transition-all">
            <ArrowLeft size={18} />
            <span>Back to Store</span>
          </Link>
          <button onClick={logout} className="w-full flex items-center gap-4 px-4 py-3 text-sm text-red-400 hover:text-red-300 hover:bg-red-400/10 rounded-xl transition-all">
            <LogOut size={18} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col ml-64 min-h-screen">
        {/* Top Header */}
        <header className="h-16 bg-white flex items-center justify-between px-8 shadow-sm z-10 sticky top-0">
          <div className="text-[11px] font-bold tracking-widest text-charcoal/50 uppercase">Admin Panel</div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-charcoal/60">{user.email}</span>
            <div className="w-8 h-8 rounded-full bg-royal text-white flex items-center justify-center text-xs font-medium">
              {user.email?.[0].toUpperCase()}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-x-hidden p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
