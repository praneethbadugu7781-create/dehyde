"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Search, ShoppingBag, Heart, Menu, X, User } from "lucide-react";
import { useCartStore } from "@/store/cartStore";
import { useAuthStore } from "@/store/authStore";
import { apiClient } from "@/lib/api";
import { cn } from "@/lib/utils";
import { SearchOverlay } from "./SearchOverlay";
import { AnnouncementBar } from "./AnnouncementBar";

const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/shop", label: "Shop" },
  { href: "/contact", label: "Contact" },
];

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const cartCount = useCartStore((s) => s.itemCount());
  const pathname = usePathname();

  const { accessToken } = useAuthStore();
  const [coinsBalance, setCoinsBalance] = useState<number | null>(null);

  useEffect(() => {
    if (!accessToken) {
      setCoinsBalance(null);
      return;
    }
    apiClient
      .get<{ success: boolean; data: { balance: number } }>("/rewards", accessToken)
      .then((res) => {
        if (res.success && res.data) {
          setCoinsBalance(res.data.balance);
        }
      })
      .catch((err) => {
        console.error("Failed to fetch wallet in navbar", err);
      });
  }, [accessToken]);

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    // Check initial scroll
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  if (pathname?.startsWith("/admin") || pathname === "/account/login") {
    return null;
  }

  const isHome = pathname === "/";
  // On home page, use dark styling at the top, light styling on scroll.
  // On other pages, always use light styling.
  const isDarkHeader = isHome && !scrolled;

  return (
    <>
      <div className="fixed inset-x-0 top-0 z-50 flex flex-col w-full">
        {/* Scrolling Announcement Bar */}
        <AnnouncementBar />

        {/* Navigation Bar */}
        <header
          className={cn(
            "w-full transition-all duration-500 ease-luxury border-b",
            isDarkHeader
              ? "bg-royal border-transparent py-3 text-white"
              : "bg-white/90 backdrop-blur-md border-royal/10 py-2.5 text-royal"
          )}
        >
          <nav className="relative mx-auto w-full max-w-[1400px] px-4 md:px-10 flex items-center justify-between">
            {/* Mobile Menu Button */}
            <button
              type="button"
              className="lg:hidden p-1 -ml-1 transition-colors"
              onClick={() => setMenuOpen(true)}
              aria-label="Open menu"
            >
              <Menu className="h-5 w-5" strokeWidth={1.5} />
            </button>

            {/* Left/Middle Nav Links (Desktop) */}
            <div className="hidden lg:flex items-center gap-8">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "text-[12px] uppercase tracking-[0.15em] font-medium transition-colors hover:opacity-100",
                    pathname === link.href ? "opacity-100 font-semibold" : "opacity-70"
                  )}
                >
                  {link.label}
                </Link>
              ))}
            </div>

            {/* Center Logo */}
            <Link
              href="/"
              className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center h-7 md:h-10 z-10"
            >
              <Image
                src="/logo.png"
                alt="DEHYDE Logo"
                width={150}
                height={40}
                className="h-full w-auto object-contain transition-all duration-300"
                style={isDarkHeader ? { filter: "brightness(0) invert(1)" } : undefined}
                priority
              />
            </Link>

            {/* Right Tools */}
            <div className="flex items-center gap-3 md:gap-6">
              <button
                type="button"
                onClick={() => setSearchOpen(true)}
                className="p-1 hover:opacity-75 transition-opacity"
                aria-label="Search"
              >
                <Search className="h-[18px] w-[18px]" strokeWidth={1.5} />
              </button>
              
              <Link
                href="/account/wishlist"
                className="hidden sm:block p-1 hover:opacity-75 transition-opacity"
                aria-label="Wishlist"
              >
                <Heart className="h-[18px] w-[18px]" strokeWidth={1.5} />
              </Link>

              {/* Animated Coins Rewards Widget */}
              <div className="relative group flex items-center">
                <Link
                  href={accessToken ? "/account/wallet" : "/account"}
                  className="flex items-center gap-1.5 p-1 rounded-full hover:bg-royal/5 transition-colors"
                  aria-label="Rewards Wallet"
                >
                  <div className="relative h-[20px] w-[20px] flex-shrink-0 animate-coin-spin-pulse">
                    {/* SVG Gold Coin */}
                    <svg className="h-full w-full text-amber-500 fill-amber-400 drop-shadow-[0_0_5px_rgba(245,158,11,0.6)]" viewBox="0 0 24 24" fill="currentColor">
                      <circle cx="12" cy="12" r="10" stroke="#d97706" strokeWidth="1.5" />
                      <circle cx="12" cy="12" r="7" stroke="#d97706" strokeWidth="1" strokeDasharray="2 1" />
                      <text x="12" y="15.5" fontFamily="serif" fontWeight="bold" fontSize="10" textAnchor="middle" fill="#78350f">D</text>
                    </svg>
                    {/* Pulsing ring indicator */}
                    <span className="absolute -inset-0.5 rounded-full border border-amber-400/30 animate-ping opacity-60 pointer-events-none" />
                  </div>
                  
                  {/* Coin Text display */}
                  <span className="hidden md:inline-flex text-[10px] uppercase tracking-[0.15em] font-bold text-amber-600 dark:text-amber-400 select-none">
                    {accessToken ? (
                      `${coinsBalance !== null ? coinsBalance : "..."} Coins`
                    ) : (
                      "Rewards"
                    )}
                  </span>
                </Link>

                {/* Premium Tooltip/Dropdown Menu on Hover */}
                <div className="absolute right-[-40px] md:right-0 top-full mt-2 w-72 bg-white border border-gray-100 rounded-2xl shadow-[0_10px_30px_rgba(0,0,0,0.08)] p-5 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 transform translate-y-2 group-hover:translate-y-0 z-50 text-left pointer-events-auto">
                  <div className="flex items-center gap-3 border-b border-gray-100 pb-3">
                    <div className="h-9 w-9 bg-amber-50 rounded-full flex items-center justify-center border border-amber-100">
                      <svg className="h-5 w-5 text-amber-600 fill-amber-500" viewBox="0 0 24 24" fill="currentColor">
                        <circle cx="12" cy="12" r="10" stroke="#d97706" strokeWidth="1.5" />
                        <circle cx="12" cy="12" r="7" stroke="#d97706" strokeWidth="1" strokeDasharray="2 1" />
                        <text x="12" y="15.5" fontFamily="serif" fontWeight="bold" fontSize="10" textAnchor="middle" fill="#78350f">D</text>
                      </svg>
                    </div>
                    <div>
                      <p className="text-xs font-bold text-charcoal uppercase tracking-wider">
                        DEHYDE Rewards
                      </p>
                      <p className="text-[10px] text-muted">
                        Earn & redeem coins on orders
                      </p>
                    </div>
                  </div>

                  <div className="py-4 space-y-2">
                    <div className="flex justify-between items-baseline">
                      <span className="text-[11px] text-muted font-medium">Your Coins:</span>
                      <span className="font-mono font-bold text-lg text-charcoal">
                        {accessToken ? (coinsBalance !== null ? coinsBalance : "...") : "0"} Coins
                      </span>
                    </div>
                    <p className="text-[11px] text-muted leading-relaxed">
                      {accessToken 
                        ? `Equivalent to ₹${coinsBalance !== null ? coinsBalance : 0} cash value. You can redeem these to get up to 70% off your purchase at checkout!` 
                        : "Join DEHYDE Rewards and receive up to 70% off your purchases. Earn 1 coin for every ₹1 spent."
                      }
                    </p>
                  </div>

                  <div className="border-t border-gray-100 pt-3">
                    <Link
                      href={accessToken ? "/account/wallet" : "/account"}
                      className="w-full inline-flex items-center justify-center text-[9px] uppercase tracking-widest font-extrabold bg-royal text-white hover:bg-blue-800 py-2.5 rounded-lg transition-colors"
                    >
                      {accessToken ? "Manage Coins Wallet" : "Get Started Now"}
                    </Link>
                  </div>
                </div>
              </div>
              
              <Link
                href="/account"
                className="hidden sm:block p-1 hover:opacity-75 transition-opacity"
                aria-label="Account"
              >
                <User className="h-[18px] w-[18px]" strokeWidth={1.5} />
              </Link>
              
              <Link
                id="nav-cart-btn"
                href="/cart"
                className="relative p-1 hover:opacity-75 transition-opacity inline-block"
                aria-label="Cart"
              >
                <ShoppingBag className="h-[18px] w-[18px]" strokeWidth={1.5} />
                {cartCount > 0 && (
                  <span className={cn(
                    "absolute -right-1.5 -top-1.5 flex h-4 w-4 items-center justify-center rounded-full text-[9px] font-bold",
                    isDarkHeader ? "bg-white text-royal" : "bg-royal text-white"
                  )}>
                    {cartCount}
                  </span>
                )}
              </Link>

              {/* Shop All Items Button (Pill shape) */}
              <Link
                href="/shop"
                className={cn(
                  "hidden md:inline-flex items-center justify-center text-[11px] uppercase tracking-wider font-semibold rounded-full px-5 py-2.5 transition-all duration-300",
                  isDarkHeader
                    ? "bg-white text-royal hover:bg-neutral-200"
                    : "bg-royal text-white hover:bg-blue-800"
                )}
              >
                Shop all items
              </Link>
            </div>
          </nav>
        </header>
      </div>

      {/* Mobile Drawer Overlay */}
      <AnimatePresence>
        {menuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMenuOpen(false)}
              className="fixed inset-0 z-[60] bg-royal/20 backdrop-blur-sm lg:hidden"
            />

            {/* Drawer Content */}
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "tween", duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              className="fixed inset-y-0 left-0 z-[65] w-[85%] max-w-[360px] bg-white text-royal shadow-2xl flex flex-col lg:hidden border-r border-royal/10"
            >
              {/* Drawer Header */}
              <div className="flex items-center justify-between p-5 border-b border-royal/10">
                <Link href="/" onClick={() => setMenuOpen(false)} className="flex items-center h-7">
                  <Image
                    src="/logo.png"
                    alt="DEHYDE Logo"
                    width={110}
                    height={30}
                    className="h-full w-auto object-contain"
                    priority
                  />
                </Link>
                <button
                  type="button"
                  className="p-1.5 rounded-full hover:bg-royal/5 text-royal transition-colors"
                  onClick={() => setMenuOpen(false)}
                  aria-label="Close menu"
                >
                  <X className="h-5 w-5" strokeWidth={1.5} />
                </button>
              </div>

              {/* Drawer Links */}
              <div className="flex-1 overflow-y-auto px-6 py-6 flex flex-col justify-between">
                <div className="flex flex-col gap-1">
                  {NAV_LINKS.map((link, i) => {
                    const isActive = pathname === link.href;
                    return (
                      <motion.div
                        key={link.href}
                        initial={{ opacity: 0, x: -15 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.04 }}
                      >
                        <Link
                          href={link.href}
                          onClick={() => setMenuOpen(false)}
                          className={cn(
                            "group flex items-center justify-between py-3.5 border-b border-royal/5 font-display text-[20px] tracking-wide font-medium transition-all duration-300",
                            isActive ? "text-royal font-bold pl-2" : "text-royal/60 hover:text-royal hover:pl-2"
                          )}
                        >
                          <span>{link.label}</span>
                          <span className={cn(
                            "text-xs transition-all duration-300",
                            isActive ? "translate-x-0 opacity-100" : "-translate-x-2 opacity-0 group-hover:translate-x-0 group-hover:opacity-100"
                          )}>
                            →
                          </span>
                        </Link>
                      </motion.div>
                    );
                  })}

                  <div className="h-px bg-royal/10 my-4" />

                  {/* Secondary Account Links */}
                  <div className="flex flex-col gap-1.5">
                    <motion.div
                      initial={{ opacity: 0, x: -15 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: NAV_LINKS.length * 0.04 }}
                    >
                      <Link
                        href="/account"
                        onClick={() => setMenuOpen(false)}
                        className="flex items-center gap-3 py-2.5 text-royal/70 hover:text-royal text-xs font-bold uppercase tracking-wider transition-colors"
                      >
                        <User className="h-4 w-4" strokeWidth={1.5} />
                        My Account
                      </Link>
                    </motion.div>
                    <motion.div
                      initial={{ opacity: 0, x: -15 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: (NAV_LINKS.length + 1) * 0.04 }}
                    >
                      <Link
                        href="/account/wishlist"
                        onClick={() => setMenuOpen(false)}
                        className="flex items-center gap-3 py-2.5 text-royal/70 hover:text-royal text-xs font-bold uppercase tracking-wider transition-colors"
                      >
                        <Heart className="h-4 w-4" strokeWidth={1.5} />
                        Wishlist
                      </Link>
                    </motion.div>

                    {/* Premium Coins Widget in Menu */}
                    <motion.div
                      initial={{ opacity: 0, x: -15 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: (NAV_LINKS.length + 2) * 0.04 }}
                    >
                      <Link
                        href={accessToken ? "/account/wallet" : "/account"}
                        onClick={() => setMenuOpen(false)}
                        className="flex items-center justify-between py-3 px-4 bg-amber-50/80 hover:bg-amber-100/60 border border-amber-200/40 rounded-xl transition-all duration-300 mt-4 group"
                      >
                        <div className="flex items-center gap-2">
                          <div className="h-5.5 w-5.5 rounded-full bg-amber-500 flex items-center justify-center border border-amber-600 shadow-inner flex-shrink-0 animate-coin-spin-pulse">
                            <svg className="h-3.5 w-3.5 text-white fill-current" viewBox="0 0 24 24">
                              <circle cx="12" cy="12" r="10" stroke="#d97706" strokeWidth="1.5" />
                              <circle cx="12" cy="12" r="7" stroke="#d97706" strokeWidth="1" strokeDasharray="2 1" />
                              <text x="12" y="15.5" fontFamily="serif" fontWeight="bold" fontSize="10" textAnchor="middle" fill="#78350f">D</text>
                            </svg>
                          </div>
                          <span className="text-amber-800 text-[10px] font-extrabold uppercase tracking-wider">
                            {accessToken ? `${coinsBalance !== null ? coinsBalance : "0"} Coins` : "DEHYDE Rewards"}
                          </span>
                        </div>
                        <span className="text-amber-700 text-xs font-bold group-hover:translate-x-1 transition-transform">→</span>
                      </Link>
                    </motion.div>
                  </div>
                </div>

                {/* Footer Brand Info */}
                <div className="mt-8 pt-6 border-t border-royal/10 text-center">
                  <p className="text-[9px] uppercase tracking-widest font-bold text-royal/40 mb-2">
                    Premium Menswear
                  </p>
                  <p className="text-xs text-royal/70 font-serif leading-relaxed px-2">
                    At DeHyde, we create trendy, premium-quality menswear at affordable prices. Designed for young individuals who value style, comfort, and quality.
                  </p>
                  <p className="text-[9px] text-royal/40 mt-3 font-mono">
                    support@dehyde.in
                  </p>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <SearchOverlay open={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
}
