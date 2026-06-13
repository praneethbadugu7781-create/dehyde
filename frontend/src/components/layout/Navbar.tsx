"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Search, ShoppingBag, Heart, Menu, X, User } from "lucide-react";
import { useCartStore } from "@/store/cartStore";
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

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    // Check initial scroll
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  if (pathname?.startsWith("/admin")) {
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
              ? "bg-transparent border-transparent py-6 text-white"
              : "bg-white/90 backdrop-blur-md border-black/5 py-4 text-black"
          )}
        >
          <nav className="mx-auto w-full max-w-[1400px] px-6 md:px-10 flex items-center justify-between">
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
              className="absolute left-1/2 -translate-x-1/2 font-display text-xl md:text-2xl font-bold tracking-[0.25em]"
            >
              DEHYDE
            </Link>

            {/* Right Tools */}
            <div className="flex items-center gap-4 md:gap-6">
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
                    isDarkHeader ? "bg-white text-black" : "bg-black text-white"
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
                    ? "bg-white text-black hover:bg-neutral-200"
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
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] bg-black/95 text-white lg:hidden"
          >
            <div className="flex h-full flex-col p-8">
              <button
                type="button"
                className="self-end p-2 -mr-2 text-white/80 hover:text-white"
                onClick={() => setMenuOpen(false)}
                aria-label="Close menu"
              >
                <X className="h-6 w-6" strokeWidth={1.5} />
              </button>
              <nav className="mt-16 flex flex-col gap-6 text-center">
                {NAV_LINKS.map((link, i) => (
                  <motion.div
                    key={link.href}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                  >
                    <Link
                      href={link.href}
                      onClick={() => setMenuOpen(false)}
                      className={cn(
                        "font-display text-3xl font-medium tracking-wide block py-2",
                        pathname === link.href ? "text-white" : "text-white/60"
                      )}
                    >
                      {link.label}
                    </Link>
                  </motion.div>
                ))}
                
                <hr className="border-white/10 my-4" />
                
                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: NAV_LINKS.length * 0.05 }}
                  className="flex flex-col gap-4 text-center mt-2"
                >
                  <Link
                    href="/account"
                    onClick={() => setMenuOpen(false)}
                    className="text-white/60 hover:text-white text-lg tracking-wide"
                  >
                    My Account
                  </Link>
                  <Link
                    href="/account/wishlist"
                    onClick={() => setMenuOpen(false)}
                    className="text-white/60 hover:text-white text-lg tracking-wide"
                  >
                    Wishlist
                  </Link>
                </motion.div>
              </nav>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <SearchOverlay open={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
}
