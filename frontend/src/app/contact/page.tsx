"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { apiClient } from "@/lib/api";

export default function ContactPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
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
        message,
        type: "inquiry"
      });
      setSubmitted(true);
    } catch (err: any) {
      setError(err?.message || "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="pt-32 pb-section">
      <div className="luxury-container max-w-4xl grid gap-16 md:grid-cols-2">
        <div>
          <p className="text-[10px] uppercase tracking-editorial text-muted">Get In Touch</p>
          <h1 className="editorial-heading mt-4 text-5xl">Contact Us</h1>
          <p className="mt-6 text-sm text-muted leading-relaxed">
            Have questions about our premium streetwear collections, orders, or reward coins? Contact our customer concierge service.
          </p>

          <div className="mt-10 space-y-6 text-sm text-charcoal/80">
            <div>
              <p className="text-[10px] uppercase tracking-editorial text-muted">Legal Entity</p>
              <p className="mt-1 font-medium text-charcoal">DEHYDE RETAIL PRIVATE LIMITED</p>
            </div>
            
            <div>
              <p className="text-[10px] uppercase tracking-editorial text-muted">Registered Office Address</p>
              <p className="mt-1 leading-relaxed">
                DEHYDE RETAIL PRIVATE LIMITED,<br />
                Door No: 23B-5-16, Ramachandra Rao Pet,<br />
                Gudivada, Andhra Pradesh - 521301, India
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-[10px] uppercase tracking-editorial text-muted">Email Support</p>
                <p className="mt-1 font-medium text-charcoal">
                  <a href="mailto:dehyde333@gmail.com" className="hover:underline">dehyde333@gmail.com</a>
                </p>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-editorial text-muted">Helpline Number</p>
                <p className="mt-1 font-medium text-charcoal">
                  <a href="tel:+916281811294" className="hover:underline">+91 62818 11294</a>
                </p>
              </div>
            </div>

            <div>
              <p className="text-[10px] uppercase tracking-editorial text-muted">Operational Hours</p>
              <p className="mt-1">Monday to Friday: 10:00 AM – 6:00 PM IST</p>
              <p className="text-xs text-muted/60 mt-1">We aim to respond to all inquiries within 24-48 business hours.</p>
            </div>
          </div>
        </div>

        <div className="bg-gray-50/50 p-8 rounded-2xl border border-gray-100 shadow-[0_4px_20px_rgba(0,0,0,0.02)] h-fit">
          <p className="text-[10px] uppercase tracking-editorial text-muted mb-6">Send A Message</p>
          {submitted ? (
            <div className="py-8 text-center space-y-3">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-green-50 text-green-600 border border-green-100">
                ✓
              </div>
              <h3 className="font-serif text-lg text-charcoal">Message Sent</h3>
              <p className="text-xs text-muted">Thank you for writing. Our team will get back to you shortly.</p>
            </div>
          ) : (
            <form className="space-y-6" onSubmit={handleSubmit}>
              <div>
                <label className="text-[9px] uppercase tracking-widest text-muted block mb-1">Name</label>
                <Input
                  placeholder="E.g., Ryan Gosling"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={submitting}
                />
              </div>
              <div>
                <label className="text-[9px] uppercase tracking-widest text-muted block mb-1">Email Address</label>
                <Input
                  type="email"
                  placeholder="E.g., ryan@gmail.com"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={submitting}
                />
              </div>
              <div>
                <label className="text-[9px] uppercase tracking-widest text-muted block mb-1">Message</label>
                <textarea
                  placeholder="How can we assist you today?"
                  rows={5}
                  required
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  disabled={submitting}
                  className="w-full text-sm border-0 border-b border-charcoal/20 bg-transparent py-2 outline-none focus:border-charcoal resize-none transition-colors duration-200"
                />
              </div>

              {error && (
                <p className="text-xs text-red-500 mt-2 font-medium">{error}</p>
              )}

              <Button type="submit" disabled={submitting} className="w-full py-3">
                {submitting ? "Sending..." : "Send message"}
              </Button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

