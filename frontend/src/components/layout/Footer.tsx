"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const FOOTER_LINKS = {
  Shop: [
    { href: "/shop", label: "All Products" },
    { href: "/shop?category=oversized-tees", label: "Oversized Tees" },
    { href: "/shop?category=streetwear", label: "Streetwear" },
  ],
  Company: [
    { href: "/about", label: "About" },
    { href: "/contact", label: "Contact" },
  ],
  Support: [
    { href: "/shipping", label: "Shipping" },
    { href: "/refund", label: "Returns" },
    { href: "/privacy", label: "Privacy" },
    { href: "/terms", label: "Terms" },
  ],
};

export function Footer() {
  const pathname = usePathname();

  if (pathname?.startsWith("/admin")) {
    return null;
  }

  return (
    <footer className="border-t border-charcoal/10 bg-charcoal text-offwhite">
      <div className="luxury-container py-section">
        <div className="grid gap-16 md:grid-cols-2 lg:grid-cols-5">
          <div className="lg:col-span-2">
            <p className="font-serif text-3xl tracking-[0.3em]">DEHYDE</p>
            <p className="mt-6 max-w-sm text-sm leading-relaxed text-offwhite/60">
              Premium menswear streetwear from India. Editorial silhouettes, cinematic craft, restrained luxury.
            </p>
            <p className="mt-8 text-[10px] uppercase tracking-editorial text-offwhite/40">
              Eluru · Andhra Pradesh · India
            </p>
          </div>
          {Object.entries(FOOTER_LINKS).map(([title, links]) => (
            <div key={title}>
              <p className="text-[10px] uppercase tracking-editorial text-offwhite/40">{title}</p>
              <ul className="mt-6 space-y-3">
                {links.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href} className="text-sm text-offwhite/70 transition-opacity hover:opacity-100">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-20 flex flex-col justify-between gap-4 border-t border-offwhite/10 pt-8 text-[10px] uppercase tracking-editorial text-offwhite/40 md:flex-row">
          <span>© {new Date().getFullYear()} DEHYDE. All rights reserved.</span>
          <span>Crafted with intention</span>
        </div>
      </div>
    </footer>
  );
}
