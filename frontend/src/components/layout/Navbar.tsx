"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Search, ShoppingBag, Heart, Menu, X, User } from "lucide-react";
import { useCartStore } from "@/store/cartStore";
import { cn } from "@/lib/utils";
import { SearchOverlay } from "./SearchOverlay";

const NAV_LINKS = [
  { href: "/shop", label: "Shop" },
  { href: "/shop?category=oversized-tees", label: "Collections" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const cartCount = useCartStore((s) => s.itemCount());
  const pathname = usePathname();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  if (pathname?.startsWith("/admin")) {
    return null;
  }

  return (
    <>
      <header
        className={cn(
          "fixed inset-x-0 top-0 z-50 transition-all duration-700 ease-luxury",
          scrolled ? "bg-offwhite/80 py-4 backdrop-blur-md" : "bg-transparent py-6"
        )}
      >
        <nav className="luxury-container flex items-center justify-between">
          <button
            type="button"
            className="lg:hidden"
            onClick={() => setMenuOpen(true)}
            aria-label="Open menu"
          >
            <Menu className="h-5 w-5" strokeWidth={1} />
          </button>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="hidden flex-1 items-center gap-10 lg:flex"
          >
            {NAV_LINKS.slice(0, 2).map((link) => (
              <Link key={link.href} href={link.href} className="link-underline text-[11px] uppercase tracking-editorial text-charcoal/80">
                {link.label}
              </Link>
            ))}
          </motion.div>

          <Link href="/" className="absolute left-1/2 -translate-x-1/2 font-serif text-2xl tracking-[0.35em] text-charcoal md:text-3xl">
            DEHYDE
          </Link>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-1 items-center justify-end gap-5 md:gap-7"
          >
            <div className="hidden items-center gap-10 lg:flex">
              {NAV_LINKS.slice(2).map((link) => (
                <Link key={link.href} href={link.href} className="link-underline text-[11px] uppercase tracking-editorial text-charcoal/80">
                  {link.label}
                </Link>
              ))}
            </div>
            <button type="button" onClick={() => setSearchOpen(true)} aria-label="Search">
              <Search className="h-[18px] w-[18px]" strokeWidth={1} />
            </button>
            <Link href="/account/wishlist" aria-label="Wishlist">
              <Heart className="h-[18px] w-[18px]" strokeWidth={1} />
            </Link>
            <Link href="/account" aria-label="Account">
              <User className="h-[18px] w-[18px]" strokeWidth={1} />
            </Link>
            <Link href="/cart" className="relative" aria-label="Cart">
              <ShoppingBag className="h-[18px] w-[18px]" strokeWidth={1} />
              {cartCount > 0 && (
                <span className="absolute -right-2 -top-2 flex h-4 w-4 items-center justify-center bg-charcoal text-[9px] text-offwhite">
                  {cartCount}
                </span>
              )}
            </Link>
          </motion.div>
        </nav>
      </header>

      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] bg-charcoal text-offwhite lg:hidden"
          >
            <div className="luxury-container flex h-full flex-col py-8">
              <button type="button" className="self-end" onClick={() => setMenuOpen(false)} aria-label="Close menu">
                <X className="h-6 w-6" strokeWidth={1} />
              </button>
              <nav className="mt-20 flex flex-col gap-8">
                {NAV_LINKS.map((link, i) => (
                  <motion.div
                    key={link.href}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.08 }}
                  >
                    <Link
                      href={link.href}
                      onClick={() => setMenuOpen(false)}
                      className="font-serif text-4xl"
                    >
                      {link.label}
                    </Link>
                  </motion.div>
                ))}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: NAV_LINKS.length * 0.08 }}
                >
                  <Link
                    href="/account"
                    onClick={() => setMenuOpen(false)}
                    className="font-serif text-4xl text-muted/60"
                  >
                    My Account
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
