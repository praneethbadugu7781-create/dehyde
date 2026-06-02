"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
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
                Eluru, Andhra Pradesh - 534002, India
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-[10px] uppercase tracking-editorial text-muted">Email Support</p>
                <p className="mt-1 font-medium text-charcoal">
                  <a href="mailto:support@dehyde.in" className="hover:underline">support@dehyde.in</a>
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
                <Input placeholder="E.g., Ryan Gosling" required />
              </div>
              <div>
                <label className="text-[9px] uppercase tracking-widest text-muted block mb-1">Email Address</label>
                <Input type="email" placeholder="E.g., ryan@dehyde.in" required />
              </div>
              <div>
                <label className="text-[9px] uppercase tracking-widest text-muted block mb-1">Message</label>
                <textarea
                  placeholder="How can we assist you today?"
                  rows={5}
                  required
                  className="w-full text-sm border-0 border-b border-charcoal/20 bg-transparent py-2 outline-none focus:border-charcoal resize-none transition-colors duration-200"
                />
              </div>
              <Button type="submit" className="w-full py-3">Send message</Button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
