"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { apiClient } from "@/lib/api";
import { useAuthStore } from "@/store/authStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Power, Trash2 } from "lucide-react";

interface Coupon {
  _id: string;
  code: string;
  type: "percent" | "fixed";
  value: number;
  minOrder: number;
  expiresAt: string;
  isActive: boolean;
  usageLimit: number;
  usedCount: number;
}

const emptyForm = {
  code: "",
  type: "percent" as const,
  value: "",
  minOrder: "",
  expiresAt: "",
  usageLimit: "",
};

export default function AdminCouponsPage() {
  const { accessToken } = useAuthStore();
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const handleToggleActive = async (coupon: Coupon) => {
    if (!accessToken) return;
    try {
      await apiClient.patch(`/admin/coupons/${coupon._id}`, {
        isActive: !coupon.isActive
      }, accessToken);
      fetchCoupons();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to toggle coupon status");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this coupon?")) return;
    if (!accessToken) return;
    try {
      await apiClient.delete(`/admin/coupons/${id}`, accessToken);
      fetchCoupons();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to delete coupon");
    }
  };

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
        value: Number(form.value),
        minOrder: Number(form.minOrder || 0),
        usageLimit: Number(form.usageLimit || 100),
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
            <div className="space-y-1">
              <label className="text-[9px] uppercase tracking-editorial text-charcoal/40 font-bold block">Coupon Code</label>
              <Input className="border-gray-200 text-charcoal placeholder:text-charcoal/40 uppercase" placeholder="e.g. SUMMER25" value={form.code} onChange={(e) => update("code", e.target.value.toUpperCase())} required />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[9px] uppercase tracking-editorial text-charcoal/40 font-bold block">Discount Type</label>
                <select className="h-10 w-full border-0 border-b border-gray-200 bg-white text-sm outline-none text-charcoal cursor-pointer" value={form.type} onChange={(e) => update("type", e.target.value)} required>
                  <option value="percent">Percentage (%)</option>
                  <option value="fixed">Fixed Amount (₹)</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-[9px] uppercase tracking-editorial text-charcoal/40 font-bold block">Discount Value</label>
                <Input className="border-gray-200 text-charcoal placeholder:text-charcoal/40" placeholder={form.type === "percent" ? "e.g. 25 (for 25% off)" : "e.g. 500 (for ₹500 off)"} type="number" value={form.value} onChange={(e) => update("value", e.target.value)} required />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[9px] uppercase tracking-editorial text-charcoal/40 font-bold block">Min Purchase (₹)</label>
                <Input className="border-gray-200 text-charcoal placeholder:text-charcoal/40" placeholder="e.g. 999" type="number" value={form.minOrder} onChange={(e) => update("minOrder", e.target.value)} />
              </div>
              <div className="space-y-1">
                <label className="text-[9px] uppercase tracking-editorial text-charcoal/40 font-bold block">Max Uses</label>
                <Input className="border-gray-200 text-charcoal placeholder:text-charcoal/40" placeholder="e.g. 100" type="number" value={form.usageLimit} onChange={(e) => update("usageLimit", e.target.value)} />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-editorial text-charcoal/40 font-bold block">Valid Until</label>
              <Input className="border-gray-200 text-charcoal bg-transparent" type="date" value={form.expiresAt} onChange={(e) => update("expiresAt", e.target.value)} required />
            </div>

            {/* Dynamic discount live preview summary */}
            {form.value && (
              <div className="bg-royal/5 border border-royal/10 text-royal p-4 rounded-xl text-xs space-y-1.5 font-medium animate-in fade-in duration-300">
                <p className="font-semibold uppercase tracking-wider text-[9px] text-royal/60">Live Discount Preview</p>
                <p>
                  This coupon will deduct{" "}
                  <span className="font-bold text-royal">
                    {form.type === "percent" ? `${form.value}%` : `₹${form.value}`}
                  </span>{" "}
                  from the order subtotal.
                </p>
                {form.minOrder && Number(form.minOrder) > 0 && (
                  <p className="text-[11px] text-royal/70">
                    * Only applies to orders of <span className="font-bold">₹{form.minOrder}</span> or more.
                  </p>
                )}
              </div>
            )}
          </div>

          {message && <p className="text-xs text-amber-600 p-3 bg-amber-50 rounded-md font-medium">{message}</p>}
          <Button type="submit" className="w-full bg-royal text-white hover:bg-blue-800 h-12 text-xs uppercase tracking-widest mt-4 rounded-xl" disabled={saving}>
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
                  <th className="px-6 py-4 font-normal">Status</th>
                  <th className="px-6 py-4 font-normal">Uses</th>
                  <th className="px-6 py-4 font-normal">Expires</th>
                  <th className="px-6 py-4 font-normal text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {loading ? (
                  <tr><td colSpan={6} className="px-6 py-8 text-center text-charcoal/40">Loading...</td></tr>
                ) : coupons.length === 0 ? (
                  <tr><td colSpan={6} className="px-6 py-8 text-center text-charcoal/40">No coupons active.</td></tr>
                ) : (
                  coupons.map((c) => (
                    <tr key={c._id} className="hover:bg-gray-50/30 transition-colors">
                      <td className="px-6 py-4 font-medium text-charcoal tracking-widest font-mono">
                        {c.code}
                      </td>
                      <td className="px-6 py-4 font-medium text-charcoal">
                        {c.type === 'percent' ? `${c.value}% OFF` : `₹${c.value} OFF`}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-0.5 text-[9px] uppercase tracking-widest rounded-full font-bold border ${
                          c.isActive 
                            ? 'bg-green-50 text-green-700 border-green-200' 
                            : 'bg-gray-50 text-gray-500 border-gray-200'
                        }`}>
                          {c.isActive ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-charcoal/60">
                        {c.usedCount} / {c.usageLimit}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 text-[9px] uppercase tracking-widest rounded-md border ${c.expiresAt && new Date(c.expiresAt) < new Date() ? 'bg-red-50 text-red-700 border-red-200' : 'bg-green-50 text-green-700 border-green-200'}`}>
                          {c.expiresAt ? formatDate(c.expiresAt) : "Never"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {/* Toggle Active Button */}
                          <button
                            type="button"
                            onClick={() => handleToggleActive(c)}
                            className={`p-2 rounded-lg border transition-all ${
                              c.isActive
                                ? "bg-green-50 text-green-600 border-green-200 hover:bg-green-100"
                                : "bg-gray-100 text-gray-400 border-gray-200 hover:bg-gray-200"
                            }`}
                            title={c.isActive ? "Deactivate Coupon" : "Activate Coupon"}
                          >
                            <Power size={13} strokeWidth={2.5} />
                          </button>

                          {/* Delete Button */}
                          <button
                            type="button"
                            onClick={() => handleDelete(c._id)}
                            className="p-2 rounded-lg border bg-red-50 border-red-100 text-red-600 hover:text-red-700 hover:border-red-200 hover:bg-red-100 transition-all"
                            title="Delete Coupon"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
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
