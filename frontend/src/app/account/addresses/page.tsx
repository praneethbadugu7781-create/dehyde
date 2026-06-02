"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuthStore } from "@/store/authStore";
import { apiClient } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { Address, User } from "@/types";

export default function AddressesPage() {
  const { accessToken, user, setAuth } = useAuthStore();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Form State
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<Omit<Address, "_id">>({
    label: "Home",
    fullName: "",
    phone: "",
    line1: "",
    line2: "",
    city: "",
    state: "",
    pincode: "",
    isDefault: false,
  });

  const fetchProfile = () => {
    if (!accessToken) return;
    setLoading(true);
    apiClient
      .get<{ success: boolean; data: User }>("/auth/me", accessToken)
      .then((res) => {
        setAddresses(res.data.addresses || []);
        // Also keep store synced
        setAuth(accessToken, res.data);
      })
      .catch((err) => {
        console.error(err);
      })
      .finally(() => setLoading(false));
  };

  useEffect(fetchProfile, [accessToken]);

  const handleEditClick = (addr: Address) => {
    setEditingId(addr._id || null);
    setForm({
      label: addr.label || "Home",
      fullName: addr.fullName || "",
      phone: addr.phone || "",
      line1: addr.line1 || "",
      line2: addr.line2 || "",
      city: addr.city || "",
      state: addr.state || "",
      pincode: addr.pincode || "",
      isDefault: !!addr.isDefault,
    });
    setShowForm(true);
  };

  const handleAddNewClick = () => {
    setEditingId(null);
    setForm({
      label: "Home",
      fullName: "",
      phone: "",
      line1: "",
      line2: "",
      city: "",
      state: "",
      pincode: "",
      isDefault: addresses.length === 0, // default if first address
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!accessToken || !confirm("Are you sure you want to delete this address?")) return;
    try {
      const res = await apiClient.delete<{ success: boolean; data: Address[] }>(
        `/auth/addresses/${id}`,
        accessToken
      );
      setAddresses(res.data);
      fetchProfile(); // reload store
    } catch (error) {
      console.error(error);
      alert("Failed to delete address");
    }
  };

  const handleSetDefault = async (addr: Address) => {
    if (!accessToken || !addr._id) return;
    try {
      const res = await apiClient.patch<{ success: boolean; data: Address[] }>(
        `/auth/addresses/${addr._id}`,
        { ...addr, isDefault: true },
        accessToken
      );
      setAddresses(res.data);
      fetchProfile();
    } catch (error) {
      console.error(error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!accessToken) return;

    try {
      if (editingId) {
        // Edit mode
        const res = await apiClient.patch<{ success: boolean; data: Address[] }>(
          `/auth/addresses/${editingId}`,
          form,
          accessToken
        );
        setAddresses(res.data);
      } else {
        // Add mode
        const res = await apiClient.post<{ success: boolean; data: Address[] }>(
          "/auth/addresses",
          form,
          accessToken
        );
        setAddresses(res.data);
      }
      setShowForm(false);
      fetchProfile();
    } catch (error) {
      console.error(error);
      alert("Failed to save address");
    }
  };

  if (!user) {
    return (
      <div className="luxury-container py-32 text-center">
        <Link href="/account/login" className="text-sm uppercase tracking-editorial underline">
          Sign in to view saved addresses
        </Link>
      </div>
    );
  }

  return (
    <div className="pt-32 pb-section">
      <div className="luxury-container max-w-2xl">
        <Link href="/account" className="text-[10px] uppercase tracking-editorial text-muted hover:text-charcoal transition-colors">
          ← Account
        </Link>
        <div className="flex justify-between items-center mt-6">
          <h1 className="editorial-heading text-5xl">Addresses</h1>
          {!showForm && (
            <Button onClick={handleAddNewClick} variant="outline" className="text-[9px] uppercase tracking-widest h-10 px-4">
              Add New
            </Button>
          )}
        </div>

        {showForm ? (
          <form onSubmit={handleSubmit} className="mt-12 space-y-6 bg-gray-50/50 p-8 rounded-2xl border border-gray-100 shadow-[0_4px_20px_rgba(0,0,0,0.02)]">
            <h2 className="font-serif text-xl text-charcoal">{editingId ? "Edit Address" : "Add New Address"}</h2>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[9px] uppercase tracking-widest text-muted block mb-1">Address Label</label>
                <select
                  value={form.label}
                  onChange={(e) => setForm({ ...form, label: e.target.value })}
                  className="w-full bg-white border border-gray-200 text-charcoal text-xs rounded-md px-3 py-2 outline-none"
                >
                  <option value="Home">Home</option>
                  <option value="Office">Office</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div>
                <label className="text-[9px] uppercase tracking-widest text-muted block mb-1">Full Name</label>
                <Input
                  value={form.fullName}
                  onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                  placeholder="Recipient Name"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[9px] uppercase tracking-widest text-muted block mb-1">Contact Phone</label>
                <Input
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  placeholder="Mobile/Phone Number"
                  required
                />
              </div>
              <div>
                <label className="text-[9px] uppercase tracking-widest text-muted block mb-1">Pincode</label>
                <Input
                  value={form.pincode}
                  onChange={(e) => setForm({ ...form, pincode: e.target.value })}
                  placeholder="6-digit pincode"
                  required
                />
              </div>
            </div>

            <div>
              <label className="text-[9px] uppercase tracking-widest text-muted block mb-1">Address Line 1</label>
              <Input
                value={form.line1}
                onChange={(e) => setForm({ ...form, line1: e.target.value })}
                placeholder="House No, Apartment, Street name"
                required
              />
            </div>

            <div>
              <label className="text-[9px] uppercase tracking-widest text-muted block mb-1">Address Line 2 (Optional)</label>
              <Input
                value={form.line2}
                onChange={(e) => setForm({ ...form, line2: e.target.value })}
                placeholder="Landmark, Locality"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[9px] uppercase tracking-widest text-muted block mb-1">City</label>
                <Input
                  value={form.city}
                  onChange={(e) => setForm({ ...form, city: e.target.value })}
                  placeholder="E.g., Mumbai"
                  required
                />
              </div>
              <div>
                <label className="text-[9px] uppercase tracking-widest text-muted block mb-1">State</label>
                <Input
                  value={form.state}
                  onChange={(e) => setForm({ ...form, state: e.target.value })}
                  placeholder="E.g., Maharashtra"
                  required
                />
              </div>
            </div>

            <div className="flex items-center gap-2 py-2">
              <input
                type="checkbox"
                id="isDefault"
                checked={form.isDefault}
                onChange={(e) => setForm({ ...form, isDefault: e.target.checked })}
                className="rounded border-gray-300 text-charcoal focus:ring-charcoal"
              />
              <label htmlFor="isDefault" className="text-xs text-charcoal/80 cursor-pointer select-none">
                Set as default shipping address
              </label>
            </div>

            <div className="flex gap-4">
              <Button type="submit" className="flex-1">Save Address</Button>
              <Button type="button" variant="outline" className="flex-1" onClick={() => setShowForm(false)}>
                Cancel
              </Button>
            </div>
          </form>
        ) : (
          <div className="mt-12 space-y-6">
            {loading ? (
              <p className="text-muted text-sm py-12 text-center">Loading saved addresses...</p>
            ) : addresses.length === 0 ? (
              <div className="text-center py-16 border border-dashed border-gray-200 rounded-2xl">
                <p className="text-sm text-muted">No saved addresses found.</p>
                <Button onClick={handleAddNewClick} variant="outline" className="text-[9px] uppercase tracking-widest mt-4 h-9">
                  Add your first address
                </Button>
              </div>
            ) : (
              addresses.map((addr) => (
                <div key={addr._id} className="border border-gray-100 p-6 rounded-2xl bg-white shadow-[0_2px_10px_rgba(0,0,0,0.02)] flex justify-between items-start gap-4">
                  <div className="space-y-2 text-sm text-charcoal/80">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-charcoal text-xs uppercase tracking-wider bg-gray-50 border border-gray-100 px-2 py-0.5 rounded">
                        {addr.label}
                      </span>
                      {addr.isDefault && (
                        <span className="text-[8px] font-bold text-white uppercase bg-charcoal px-2 py-0.5 rounded tracking-widest">
                          Default
                        </span>
                      )}
                    </div>
                    <p className="font-medium text-charcoal mt-2">{addr.fullName}</p>
                    <p className="text-xs text-muted">Phone: {addr.phone}</p>
                    <p className="leading-relaxed mt-1 text-xs">
                      {addr.line1}
                      {addr.line2 && `, ${addr.line2}`}
                      <br />
                      {addr.city}, {addr.state} - {addr.pincode}
                    </p>
                  </div>
                  <div className="flex flex-col gap-2 text-right">
                    {!addr.isDefault && (
                      <button
                        onClick={() => handleSetDefault(addr)}
                        className="text-[9px] uppercase tracking-widest text-muted hover:text-charcoal transition-colors"
                      >
                        Set Default
                      </button>
                    )}
                    <button
                      onClick={() => handleEditClick(addr)}
                      className="text-[9px] uppercase tracking-widest text-muted hover:text-charcoal transition-colors"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => addr._id && handleDelete(addr._id)}
                      className="text-[9px] uppercase tracking-widest text-red-500 hover:text-red-700 transition-colors"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
