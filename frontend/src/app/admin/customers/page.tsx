"use client";

import { useEffect, useState } from "react";
import { apiClient } from "@/lib/api";
import { useAuthStore } from "@/store/authStore";

interface Customer {
  _id: string;
  name: string;
  email: string;
  createdAt: string;
}

export default function AdminCustomersPage() {
  const { accessToken } = useAuthStore();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!accessToken) return;
    setLoading(true);
    apiClient
      .get<{ success: boolean; data: Customer[] }>("/admin/customers", accessToken)
      .then((res) => setCustomers(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [accessToken]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' });
  };

  return (
    <div className="animate-in fade-in duration-500 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-serif text-3xl text-charcoal">Customers Directory</h1>
          <p className="text-xs text-charcoal/50 mt-1">Overview of registered store users.</p>
        </div>
        <div className="bg-white border border-gray-100 text-charcoal text-[10px] uppercase tracking-widest px-4 py-2.5 rounded-xl shadow-sm font-medium">
          Total: {customers.length}
        </div>
      </div>

      <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-[0_2px_10px_rgba(0,0,0,0.04)]">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-charcoal/80">
            <thead className="text-[10px] uppercase tracking-editorial bg-gray-50 border-b border-gray-100 text-charcoal/40">
              <tr>
                <th className="px-6 py-5 font-normal">Customer Name</th>
                <th className="px-6 py-5 font-normal">Email Address</th>
                <th className="px-6 py-5 font-normal">Joined Date</th>
                <th className="px-6 py-5 font-normal text-right">ID</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr><td colSpan={4} className="px-6 py-12 text-center text-charcoal/40">Loading customers...</td></tr>
              ) : customers.length === 0 ? (
                <tr><td colSpan={4} className="px-6 py-12 text-center text-charcoal/40">No customers found.</td></tr>
              ) : (
                customers.map((c) => (
                  <tr key={c._id} className="hover:bg-gray-50/30 transition-colors">
                    <td className="px-6 py-4 font-medium text-charcoal">
                      {c.name}
                    </td>
                    <td className="px-6 py-4">
                      {c.email}
                    </td>
                    <td className="px-6 py-4 text-charcoal/60">
                      {formatDate(c.createdAt)}
                    </td>
                    <td className="px-6 py-4 text-right text-charcoal/30 font-mono text-xs">
                      {c._id}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
