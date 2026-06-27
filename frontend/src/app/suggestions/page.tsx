"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { apiClient } from "@/lib/api";
import { Star } from "lucide-react";

export default function SuggestionsPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [type, setType] = useState<"suggestion" | "feedback">("feedback");
  const [message, setMessage] = useState("");
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
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
        phone,
        type,
        message,
        ...(rating > 0 ? { rating } : {}),
      });
      setSubmitted(true);
    } catch (err: any) {
      setError(err?.message || "Failed to submit. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="pt-32 pb-section min-h-screen bg-[#f8f6f3]/30">
      <div className="luxury-container max-w-2xl">
        <div className="text-center mb-12">
          <p className="text-[10px] uppercase tracking-editorial text-muted mb-3">Shape DEHYDE</p>
          <h1 className="editorial-heading text-4xl md:text-5xl">Suggestions & Feedback</h1>
          <p className="mt-4 text-sm text-muted max-w-md mx-auto leading-relaxed">
            We are constantly refining our fits, fabrics, and customer experience. Share your review, ideas, or feedback directly with our team.
          </p>
        </div>

        <div className="bg-white p-8 md:p-10 rounded-2xl border border-gray-150 shadow-[0_4px_25px_rgba(0,0,0,0.02)]">
          {submitted ? (
            <div className="py-12 text-center space-y-4">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-green-50 text-green-600 border border-green-100 text-xl">
                ✓
              </div>
              <h3 className="font-serif text-2xl text-charcoal">Thank You</h3>
              <p className="text-sm text-muted max-w-sm mx-auto leading-relaxed">
                Your feedback has been submitted! Once approved by our team, it will be featured on our website.
              </p>
              <div className="pt-6">
                <Button onClick={() => {
                  setName("");
                  setEmail("");
                  setPhone("");
                  setMessage("");
                  setRating(0);
                  setType("feedback");
                  setSubmitted(false);
                }} variant="outline" className="text-xs uppercase tracking-widest px-6 py-2">
                  Submit another note
                </Button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Type Selection Tabs */}
              <div>
                <label className="text-[9px] uppercase tracking-widest text-muted block mb-3 font-bold">Feedback Type</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setType("suggestion")}
                    className={`py-3.5 px-4 text-xs uppercase tracking-widest border transition-all rounded-xl font-medium ${
                      type === "suggestion"
                        ? "border-charcoal bg-charcoal text-offwhite shadow-sm"
                        : "border-gray-200 bg-transparent text-charcoal/60 hover:border-charcoal/40"
                    }`}
                  >
                    💡 Suggestion
                  </button>
                  <button
                    type="button"
                    onClick={() => setType("feedback")}
                    className={`py-3.5 px-4 text-xs uppercase tracking-widest border transition-all rounded-xl font-medium ${
                      type === "feedback"
                        ? "border-charcoal bg-charcoal text-offwhite shadow-sm"
                        : "border-gray-200 bg-transparent text-charcoal/60 hover:border-charcoal/40"
                    }`}
                  >
                    💬 Review / Feedback
                  </button>
                </div>
              </div>

              {/* Star Rating */}
              <div>
                <label className="text-[9px] uppercase tracking-widest text-muted block mb-3 font-bold">
                  Your Rating {type === "suggestion" ? "(Optional)" : ""}
                </label>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star === rating ? 0 : star)}
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      className="p-1 transition-transform hover:scale-110"
                    >
                      <Star
                        className={`h-7 w-7 transition-colors ${
                          star <= (hoverRating || rating)
                            ? "fill-amber-400 text-amber-400"
                            : "fill-none text-gray-300"
                        }`}
                      />
                    </button>
                  ))}
                  {rating > 0 && (
                    <span className="ml-3 text-xs text-charcoal/50 self-center font-medium">
                      {rating}/5
                    </span>
                  )}
                </div>
              </div>

              {/* Name */}
              <div className="space-y-1.5">
                <label className="text-[9px] uppercase tracking-widest text-muted block font-bold">Your Name</label>
                <Input
                  placeholder="E.g., Alexander"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={submitting}
                  className="border-gray-200 focus:border-charcoal bg-white rounded-xl h-11"
                />
              </div>

              {/* Email & Phone */}
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[9px] uppercase tracking-widest text-muted block font-bold">Email Address</label>
                  <Input
                    type="email"
                    placeholder="E.g., alex@gmail.com"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={submitting}
                    className="border-gray-200 focus:border-charcoal bg-white rounded-xl h-11"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[9px] uppercase tracking-widest text-muted block font-bold">Phone Number (Optional)</label>
                  <Input
                    type="tel"
                    placeholder="E.g., +91 98765 43210"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    disabled={submitting}
                    className="border-gray-200 focus:border-charcoal bg-white rounded-xl h-11"
                  />
                </div>
              </div>

              {/* Message */}
              <div className="space-y-1.5">
                <label className="text-[9px] uppercase tracking-widest text-muted block font-bold">Message Details</label>
                <textarea
                  placeholder={
                    type === "suggestion"
                      ? "What feature, style, fabric, or option would you like to see?"
                      : "Share your experience with our products — this may be featured on our website!"
                  }
                  rows={6}
                  required
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  disabled={submitting}
                  className="w-full text-sm border border-gray-200 focus:border-charcoal bg-white px-4 py-3 rounded-xl outline-none resize-none transition-colors duration-200"
                />
              </div>

              {error && (
                <p className="text-xs text-red-500 font-medium">{error}</p>
              )}

              <Button type="submit" disabled={submitting} className="w-full py-4 text-xs uppercase tracking-widest rounded-xl font-bold transition-all shadow-md hover:shadow-lg">
                {submitting ? "Submitting..." : "Submit Feedback"}
              </Button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
