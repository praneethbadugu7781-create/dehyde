"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { apiClient } from "@/lib/api";

function SuggestionsSection() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [type, setType] = useState<"suggestion" | "feedback">("suggestion");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !message) return;
    setSubmitting(true);
    setError("");
    try {
      await apiClient.post("/feedback", {
        name,
        email,
        type,
        message,
      });
      setSubmitted(true);
    } catch (err: any) {
      setError(err?.message || "Failed to submit. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="py-16 bg-[#f8f6f3]/50 border-t border-black/5 font-sans text-charcoal">
      <div className="mx-auto w-full max-w-[1400px] px-6 md:px-10">
        <div className="grid gap-10 lg:grid-cols-12 items-center">
          {/* Text Info */}
          <div className="lg:col-span-5">
            <p className="text-[10px] uppercase tracking-[0.2em] text-royal font-bold">
              Shape DEHYDE
            </p>
            <h3 className="font-serif text-3xl text-charcoal mt-2 tracking-tight">
              Suggestions & Feedback
            </h3>
            <p className="mt-4 text-xs md:text-sm text-neutral-500 leading-relaxed font-light max-w-md">
              We are constantly refining our fits, fabrics, and customer experience. Share your concepts, ideas, or feedback directly with our design and operations team. We read every single note.
            </p>
          </div>

          {/* Form */}
          <div className="lg:col-span-7 bg-white p-6 md:p-8 rounded-2xl border border-gray-150 shadow-[0_4px_25px_rgba(0,0,0,0.015)]">
            {submitted ? (
              <div className="py-8 text-center space-y-3">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-green-50 text-green-600 border border-green-100 text-lg">
                  ✓
                </div>
                <h4 className="font-serif text-xl text-charcoal">Note Submitted</h4>
                <p className="text-xs text-muted max-w-sm mx-auto leading-relaxed">
                  Your ideas have been recorded. Our team reviews all suggestions weekly to guide future collection drops.
                </p>
                <div className="pt-4">
                  <Button 
                    type="button"
                    onClick={() => {
                      setName("");
                      setEmail("");
                      setMessage("");
                      setType("suggestion");
                      setSubmitted(false);
                    }} 
                    variant="outline" 
                    className="text-[10px] uppercase tracking-widest px-5 py-2 border-gray-200 text-charcoal hover:bg-gray-50 bg-white"
                  >
                    Submit another note
                  </Button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Type Selection */}
                <div className="flex gap-4 border-b border-gray-100 pb-3">
                  <button
                    type="button"
                    onClick={() => setType("suggestion")}
                    className={`text-[10px] uppercase tracking-wider font-extrabold pb-2 relative transition-all ${
                      type === "suggestion" ? "text-royal after:absolute after:bottom-0 after:left-0 after:w-full after:h-0.5 after:bg-royal" : "text-neutral-400"
                    }`}
                  >
                    💡 Suggestion
                  </button>
                  <button
                    type="button"
                    onClick={() => setType("feedback")}
                    className={`text-[10px] uppercase tracking-wider font-extrabold pb-2 relative transition-all ${
                      type === "feedback" ? "text-royal after:absolute after:bottom-0 after:left-0 after:w-full after:h-0.5 after:bg-royal" : "text-neutral-400"
                    }`}
                  >
                    💬 General Feedback
                  </button>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  {/* Name */}
                  <div className="space-y-1">
                    <label className="text-[9px] uppercase tracking-widest text-neutral-400 font-bold block">Name</label>
                    <Input
                      placeholder="Your name"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      disabled={submitting}
                      className="border-gray-200 focus:border-royal bg-white rounded-xl h-10 text-xs text-charcoal placeholder:text-neutral-300"
                    />
                  </div>

                  {/* Email */}
                  <div className="space-y-1">
                    <label className="text-[9px] uppercase tracking-widest text-neutral-400 font-bold block">Email</label>
                    <Input
                      type="email"
                      placeholder="Your email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      disabled={submitting}
                      className="border-gray-200 focus:border-royal bg-white rounded-xl h-10 text-xs text-charcoal placeholder:text-neutral-300"
                    />
                  </div>
                </div>

                {/* Message */}
                <div className="space-y-1">
                  <label className="text-[9px] uppercase tracking-widest text-neutral-400 font-bold block">Message</label>
                  <textarea
                    placeholder={
                      type === "suggestion"
                        ? "What feature, style, fabric, or option would you like to see?"
                        : "Tell us about your experience with our product or website."
                    }
                    rows={3}
                    required
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    disabled={submitting}
                    className="w-full text-xs border border-gray-200 focus:border-royal bg-white px-3 py-2 rounded-xl outline-none resize-none text-charcoal placeholder:text-neutral-300 focus:ring-1 focus:ring-royal transition-all duration-200"
                  />
                </div>

                {error && (
                  <p className="text-xs text-red-500 font-medium">{error}</p>
                )}

                <Button 
                  type="submit" 
                  disabled={submitting} 
                  className="w-full py-3 text-[10px] uppercase tracking-widest bg-royal text-white hover:bg-blue-800 rounded-xl font-bold transition-all shadow-sm"
                >
                  {submitting ? "Submitting..." : "Submit to Design Team"}
                </Button>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

export function Footer() {
  const pathname = usePathname();
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  if (pathname?.startsWith("/admin") || pathname === "/account/login") {
    return null;
  }

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setSubscribed(true);
      setEmail("");
    }
  };

  const showSuggestions = pathname !== "/suggestions";

  return (
    <>
      {showSuggestions && <SuggestionsSection />}
      <footer className="bg-gradient-to-b from-[#0d1b3e] to-[#071026] text-white border-t border-royal/20 py-16 md:py-20 font-sans">
        <div className="mx-auto w-full max-w-[1400px] px-6 md:px-10">
          <div className="grid gap-12 lg:grid-cols-12">
            {/* Column 1: Newsletter Signup (Left, wide) */}
            <div className="lg:col-span-4 flex flex-col justify-between">
              <div>
                <h4 className="font-display text-xl font-bold uppercase tracking-[0.1em] text-white">
                  Subscribe to our newsletter
                </h4>
                <p className="mt-3 text-xs text-blue-100/60 leading-relaxed max-w-sm">
                  Get early access to collection drops, editorial news, and exclusive promotional pricing.
                </p>
                {subscribed ? (
                  <p className="mt-6 text-xs text-white font-medium">
                    Thank you! You have successfully subscribed to our newsletter.
                  </p>
                ) : (
                  <form onSubmit={handleSubscribe} className="mt-6 flex max-w-sm border-b border-royal/30 focus-within:border-royal transition-colors py-1.5">
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Your email address"
                      className="w-full bg-transparent text-xs text-white placeholder-white/35 focus:outline-none"
                    />
                    <button
                      type="submit"
                      className="text-[11px] uppercase tracking-wider font-extrabold text-royal hover:text-white transition-colors"
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
                <p className="mt-4 text-xs text-blue-100/60 leading-relaxed">
                  DEHYDE: Premium modern clothing label merging urban utility with high-end minimalist aesthetics. Resilient silhouettes crafted for everyday modern living.
                </p>
              </div>
              <div className="mt-6">
                <Link
                  href="/contact"
                  className="inline-flex items-center justify-center text-[10px] uppercase tracking-wider font-extrabold rounded-full border border-royal/30 bg-transparent text-white px-6 py-3 hover:bg-royal hover:border-royal transition-all duration-300 transform hover:-translate-y-0.5 shadow-sm"
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
                    <Link href="/" className="text-blue-100/60 hover:text-royal transition-all duration-300 hover:pl-1 block">
                      Home
                    </Link>
                  </li>
                  <li>
                    <Link href="/about" className="text-blue-100/60 hover:text-royal transition-all duration-300 hover:pl-1 block">
                      About
                    </Link>
                  </li>
                  <li>
                    <Link href="/shop" className="text-blue-100/60 hover:text-royal transition-all duration-300 hover:pl-1 block">
                      Shop
                    </Link>
                  </li>
                  <li>
                    <Link href="/contact" className="text-blue-100/60 hover:text-royal transition-all duration-300 hover:pl-1 block">
                      Contact
                    </Link>
                  </li>
                  <li>
                    <Link href="/suggestions" className="text-blue-100/60 hover:text-royal transition-all duration-300 hover:pl-1 block">
                      Suggestions & Feedback
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
                    <a href="https://instagram.com" target="_blank" rel="noreferrer" className="text-blue-100/60 hover:text-royal transition-all duration-300 hover:pl-1 block">
                      Instagram
                    </a>
                  </li>
                  <li>
                    <a href="https://dribbble.com" target="_blank" rel="noreferrer" className="text-blue-100/60 hover:text-royal transition-all duration-300 hover:pl-1 block">
                      Dribbble
                    </a>
                  </li>
                  <li>
                    <a href="https://facebook.com" target="_blank" rel="noreferrer" className="text-blue-100/60 hover:text-royal transition-all duration-300 hover:pl-1 block">
                      Facebook
                    </a>
                  </li>
                  <li>
                    <a href="https://twitter.com" target="_blank" rel="noreferrer" className="text-blue-100/60 hover:text-royal transition-all duration-300 hover:pl-1 block">
                      Twitter
                    </a>
                  </li>
                  <li>
                    <a href="https://youtube.com" target="_blank" rel="noreferrer" className="text-blue-100/60 hover:text-royal transition-all duration-300 hover:pl-1 block">
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
                <ul className="space-y-3 text-xs text-blue-100/60">
                  <li className="break-all">dehyde333@gmail.com</li>
                  <li>+91 62818 11294</li>
                  <li>Gudivada, Andhra Pradesh, India</li>
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
    </>
  );
}
