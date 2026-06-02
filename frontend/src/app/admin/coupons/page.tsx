"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { apiClient } from "@/lib/api";
import { useAuthStore } from "@/store/authStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface Coupon {
  _id: string;
  code: string;
  discountType: "percentage" | "fixed";
  discountValue: number;
  minPurchaseAmount: number;
  validUntil: string;
  isActive: boolean;
  maxUses: number;
  currentUses: number;
}

const emptyForm = {
  code: "",
  discountType: "percentage" as const,
  discountValue: "",
  minPurchaseAmount: "",
  validUntil: "",
  maxUses: "",
};

export default function AdminCouponsPage() {
  const { accessToken } = useAuthStore();
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const fetchCoupons = () => {
    if (!accessToken) return;
    setLoading(true);
    apiClient
      .get<{ success: boolean; data: Coupon[] }>("/admin/coupons", accessToken)
      .then((res) => setCoupons(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(fetchCoupons, [accessToken]);

  const update = (key: string, value: string) => setForm((c) => ({ ...c, [key]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!accessToken) return;
    setSaving(true);
    setMessage("");

    try {
      await apiClient.post("/admin/coupons", {
        ...form,
        discountValue: Number(form.discountValue),
        minPurchaseAmount: Number(form.minPurchaseAmount || 0),
        maxUses: Number(form.maxUses || 100),
      }, accessToken);
      setForm(emptyForm);
      setMessage("Coupon created successfully");
      fetchCoupons();
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Failed to create coupon");
    } finally {
      setSaving(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' });
  };

  return (
    <div className="animate-in fade-in duration-500 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-serif text-3xl text-charcoal">Discount Coupons</h1>
          <p className="text-xs text-charcoal/50 mt-1">Manage promotional discount offers.</p>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)]">
        {/* Form */}
        <motion.form
          onSubmit={handleSubmit}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6 bg-white border border-gray-100 p-6 md:p-8 rounded-2xl shadow-[0_2px_10px_rgba(0,0,0,0.04)] h-fit"
        >
          <p className="text-[10px] uppercase tracking-editorial text-charcoal/40 border-b border-gray-100 pb-4">Create New Coupon</p>
          
          <div className="space-y-4">
            <Input className="border-gray-200 text-charcoal placeholder:text-charcoal/40 uppercase" placeholder="Coupon Code (e.g. SUMMER25)" value={form.code} onChange={(e) => update("code", e.target.value.toUpperCase())} required />
            
            <div className="grid grid-cols-2 gap-4">
              <select className="h-10 w-full border-0 border-b border-gray-200 bg-white text-sm outline-none text-charcoal" value={form.discountType} onChange={(e) => update("discountType", e.target.value)} required>
                <option value="percentage">Percentage (%)</option>
                <option value="fixed">Fixed Amount (₹)</option>
              </select>
              <Input className="border-gray-200 text-charcoal placeholder:text-charcoal/40" placeholder="Discount Value" type="number" value={form.discountValue} onChange={(e) => update("discountValue", e.target.value)} required />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Input className="border-gray-200 text-charcoal placeholder:text-charcoal/40" placeholder="Min Purchase (₹)" type="number" value={form.minPurchaseAmount} onChange={(e) => update("minPurchaseAmount", e.target.value)} />
              <Input className="border-gray-200 text-charcoal placeholder:text-charcoal/40" placeholder="Max Uses" type="number" value={form.maxUses} onChange={(e) => update("maxUses", e.target.value)} />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-editorial text-charcoal/40">Valid Until</label>
              <Input className="border-gray-200 text-charcoal bg-transparent" type="date" value={form.validUntil} onChange={(e) => update("validUntil", e.target.value)} required />
            </div>
          </div>

          {message && <p className="text-xs text-amber-600 p-3 bg-amber-50 rounded-md font-medium">{message}</p>}
          <Button type="submit" className="w-full bg-charcoal text-white hover:bg-black h-12 text-xs uppercase tracking-widest mt-4 rounded-xl" disabled={saving}>
            {saving ? "Saving..." : "Create Coupon"}
          </Button>
        </motion.form>

        {/* List */}
        <div className="bg-white border border-gray-100 rounded-2xl shadow-[0_2px_10px_rgba(0,0,0,0.04)] h-fit overflow-hidden">
          <p className="text-[10px] uppercase tracking-editorial text-charcoal/40 border-b border-gray-100 p-6 md:p-8 pb-4">Active Coupons</p>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-charcoal/80">
              <thead className="text-[10px] uppercase tracking-editorial bg-gray-50 border-b border-gray-100 text-charcoal/40">
                <tr>
                  <th className="px-6 py-4 font-normal">Code</th>
                  <th className="px-6 py-4 font-normal">Discount</th>
                  <th className="px-6 py-4 font-normal">Uses</th>
                  <th className="px-6 py-4 font-normal text-right">Expires</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {loading ? (
                  <tr><td colSpan={4} className="px-6 py-8 text-center text-charcoal/40">Loading...</td></tr>
                ) : coupons.length === 0 ? (
                  <tr><td colSpan={4} className="px-6 py-8 text-center text-charcoal/40">No coupons active.</td></tr>
                ) : (
                  coupons.map((c) => (
                    <tr key={c._id} className="hover:bg-gray-50/30 transition-colors">
                      <td className="px-6 py-4 font-medium text-charcoal tracking-widest font-mono">
                        {c.code}
                      </td>
                      <td className="px-6 py-4 font-medium text-charcoal">
                        {c.discountType === 'percentage' ? `${c.discountValue}% OFF` : `₹${c.discountValue} OFF`}
                      </td>
                      <td className="px-6 py-4 text-charcoal/60">
                        {c.currentUses} / {c.maxUses}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span className={`px-2 py-1 text-[9px] uppercase tracking-widest rounded-md border ${new Date(c.validUntil) < new Date() ? 'bg-red-50 text-red-700 border-red-200' : 'bg-green-50 text-green-700 border-green-200'}`}>
                          {formatDate(c.validUntil)}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
