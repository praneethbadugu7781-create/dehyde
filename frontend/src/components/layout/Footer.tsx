"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

export function Footer() {
  const pathname = usePathname();
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  if (pathname?.startsWith("/admin")) {
    return null;
  }

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setSubscribed(true);
      setEmail("");
    }
  };

  return (
    <footer className="bg-black text-white border-t border-white/10 py-16 md:py-20 font-sans">
      <div className="mx-auto w-full max-w-[1400px] px-6 md:px-10">
        <div className="grid gap-12 lg:grid-cols-12">
          {/* Column 1: Newsletter Signup (Left, wide) */}
          <div className="lg:col-span-4 flex flex-col justify-between">
            <div>
              <h4 className="font-display text-xl font-bold uppercase tracking-[0.1em] text-white">
                Subscribe to our newsletter
              </h4>
              <p className="mt-3 text-xs text-white/50 leading-relaxed max-w-sm">
                Get early access to collection drops, editorial news, and exclusive promotional pricing.
              </p>
              {subscribed ? (
                <p className="mt-6 text-xs text-white font-medium">
                  Thank you! You have successfully subscribed to our newsletter.
                </p>
              ) : (
                <form onSubmit={handleSubscribe} className="mt-6 flex max-w-sm border-b border-white/30 focus-within:border-white transition-colors py-1.5">
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Your email address"
                    className="w-full bg-transparent text-xs text-white placeholder-white/40 focus:outline-none"
                  />
                  <button
                    type="submit"
                    className="text-[11px] uppercase tracking-wider font-semibold text-white/80 hover:text-white transition-colors"
                  >
                    Subscribe
                  </button>
                </form>
              )}
            </div>
            
            <p className="mt-8 text-[10px] text-white/30 uppercase tracking-[0.15em] hidden lg:block">
              © {new Date().getFullYear()} DEHYDE. All rights reserved.
            </p>
          </div>

          {/* Column 2: Brand Description & CTA */}
          <div className="lg:col-span-4 flex flex-col justify-between border-t lg:border-t-0 lg:border-x border-white/10 pt-10 lg:pt-0 lg:px-8">
            <div>
              <p className="font-display text-xl font-bold tracking-[0.25em] text-white">
                DEHYDE
              </p>
              <p className="mt-4 text-xs text-white/60 leading-relaxed">
                DEHYDE: Premium modern clothing label merging urban utility with high-end minimalist aesthetics. Resilient silhouettes crafted for everyday modern living.
              </p>
            </div>
            <div className="mt-6">
              <Link
                href="/contact"
                className="inline-flex items-center justify-center text-[11px] uppercase tracking-wider font-semibold rounded-full border border-white/20 bg-transparent text-white px-5 py-2.5 hover:bg-white hover:text-black transition-all duration-300"
              >
                Contact DEHYDE
              </Link>
            </div>
          </div>

          {/* Columns 3, 4, 5: Quick Links, Follow us, Get in Touch (Right) */}
          <div className="lg:col-span-4 grid grid-cols-2 md:grid-cols-3 gap-8 border-t lg:border-t-0 border-white/10 pt-10 lg:pt-0">
            {/* Quick Links */}
            <div>
              <h5 className="text-[10px] uppercase tracking-[0.2em] text-white/40 font-semibold mb-5">
                Quick Links
              </h5>
              <ul className="space-y-3 text-xs">
                <li>
                  <Link href="/" className="text-white/60 hover:text-white transition-colors">
                    Home
                  </Link>
                </li>
                <li>
                  <Link href="/about" className="text-white/60 hover:text-white transition-colors">
                    About
                  </Link>
                </li>
                <li>
                  <Link href="/shop" className="text-white/60 hover:text-white transition-colors">
                    Shop
                  </Link>
                </li>

                <li>
                  <Link href="/contact" className="text-white/60 hover:text-white transition-colors">
                    Contact
                  </Link>
                </li>
              </ul>
            </div>

            {/* Follow Us */}
            <div>
              <h5 className="text-[10px] uppercase tracking-[0.2em] text-white/40 font-semibold mb-5">
                Follow us
              </h5>
              <ul className="space-y-3 text-xs">
                <li>
                  <a href="https://instagram.com" target="_blank" rel="noreferrer" className="text-white/60 hover:text-white transition-colors">
                    Instagram
                  </a>
                </li>
                <li>
                  <a href="https://dribbble.com" target="_blank" rel="noreferrer" className="text-white/60 hover:text-white transition-colors">
                    Dribbble
                  </a>
                </li>
                <li>
                  <a href="https://facebook.com" target="_blank" rel="noreferrer" className="text-white/60 hover:text-white transition-colors">
                    Facebook
                  </a>
                </li>
                <li>
                  <a href="https://twitter.com" target="_blank" rel="noreferrer" className="text-white/60 hover:text-white transition-colors">
                    Twitter
                  </a>
                </li>
                <li>
                  <a href="https://youtube.com" target="_blank" rel="noreferrer" className="text-white/60 hover:text-white transition-colors">
                    Youtube
                  </a>
                </li>
              </ul>
            </div>

            {/* Get In Touch */}
            <div className="col-span-2 md:col-span-1">
              <h5 className="text-[10px] uppercase tracking-[0.2em] text-white/40 font-semibold mb-5">
                Get in touch
              </h5>
              <ul className="space-y-3 text-xs text-white/60">
                <li className="break-all">support@dehyde.in</li>
                <li>+91 62818 11294</li>
                <li>Eluru, Andhra Pradesh, India</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Mobile footer copy */}
        <div className="mt-12 pt-8 border-t border-white/10 text-[10px] text-white/30 uppercase tracking-[0.15em] flex flex-col md:flex-row justify-between gap-4 lg:hidden">
          <span>© {new Date().getFullYear()} DEHYDE. All rights reserved.</span>
          <span>Crafted with intention</span>
        </div>
      </div>
    </footer>
  );
}
