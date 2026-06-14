"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { apiClient } from "@/lib/api";
import { useAuthStore } from "@/store/authStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface SettingsData {
  _id: string;
  rewardsEnabled: boolean;
  maxCoinRedemptionPercent: number;
  coinExpiryDays: number;
  freeShippingThreshold: number;
  defaultShippingFee: number;
  expressShippingFee: number;
}

export default function AdminSettingsPage() {
  const { accessToken } = useAuthStore();
  const [settings, setSettings] = useState<SettingsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  // Change Password Form State
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [pwdSaving, setPwdSaving] = useState(false);
  const [pwdMessage, setPwdMessage] = useState("");


  const fetchSettings = () => {
    if (!accessToken) return;
    setLoading(true);
    apiClient
      .get<{ success: boolean; data: SettingsData }>("/admin/settings", accessToken)
      .then((res) => setSettings(res.data || null))
      .catch(() => setSettings({
        _id: "",
        rewardsEnabled: true,
        maxCoinRedemptionPercent: 30,
        coinExpiryDays: 365,
        freeShippingThreshold: 2999,
        defaultShippingFee: 99,
        expressShippingFee: 149
      }))
      .finally(() => setLoading(false));
  };

  useEffect(fetchSettings, [accessToken]);

  const update = (key: keyof SettingsData, value: string | number | boolean) => {
    if (!settings) return;
    setSettings({ ...settings, [key]: value });
  };

  const handleSave = async () => {
    if (!accessToken || !settings) return;
    setSaving(true);
    setMessage("");

    try {
      await apiClient.patch("/admin/settings", settings, accessToken);
      setMessage("Settings updated successfully");
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Failed to update settings");
    } finally {
      setSaving(false);
    }
  };

  if (loading || !settings) {
    return <div className="text-charcoal/50">Loading settings...</div>;
  }

  return (
    <div className="animate-in fade-in duration-500 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-serif text-3xl text-charcoal">Platform Settings</h1>
          <p className="text-xs text-charcoal/50 mt-1">Configure global store rules and integrations.</p>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-8 bg-white border border-gray-100 p-6 md:p-10 rounded-2xl shadow-[0_2px_10px_rgba(0,0,0,0.04)]"
      >
        {/* 1. Rewards System */}
        <div>
          <h2 className="text-xl font-serif text-charcoal mb-2">Reward Coins Configuration</h2>
          <p className="text-sm text-charcoal/50 mb-6">Manage how customers earn and spend DEHYDE reward coins.</p>
          
          <div className="space-y-6">
            <div className="flex items-center justify-between py-4 border-b border-gray-100">
              <div>
                <p className="font-medium text-charcoal">Enable Reward System</p>
                <p className="text-xs text-charcoal/50 mt-1">Allow users to earn and spend coins</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" checked={settings.rewardsEnabled} onChange={(e) => update("rewardsEnabled", e.target.checked)} />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500"></div>
              </label>
            </div>

            <div className="grid sm:grid-cols-2 gap-8 py-4 border-b border-gray-100">
              <div>
                <p className="font-medium text-charcoal mb-2">Coin Expiry (Days)</p>
                <p className="text-xs text-charcoal/50 mb-4">How many days until earned coins expire?</p>
                <Input 
                  type="number" 
                  value={settings.coinExpiryDays} 
                  onChange={(e) => update("coinExpiryDays", Number(e.target.value))} 
                  className="bg-white border-gray-200 text-charcoal" 
                />
              </div>
              <div>
                <p className="font-medium text-charcoal mb-2">Max Redemption (%)</p>
                <p className="text-xs text-charcoal/50 mb-4">Maximum cart percentage payable with coins</p>
                <Input 
                  type="number" 
                  value={settings.maxCoinRedemptionPercent} 
                  onChange={(e) => update("maxCoinRedemptionPercent", Number(e.target.value))} 
                  className="bg-white border-gray-200 text-charcoal" 
                  max="100"
                />
              </div>
            </div>
          </div>
        </div>

        {/* 2. Shipping Rates & Limits */}
        <div className="pt-6 border-t border-gray-100">
          <h2 className="text-xl font-serif text-charcoal mb-2">Shipping Rates & Limits</h2>
          <p className="text-sm text-charcoal/50 mb-6">Manage shipping fees and thresholds for customer orders.</p>
          
          <div className="grid sm:grid-cols-2 gap-6">
            <div>
              <p className="font-medium text-charcoal mb-2">Free Shipping Threshold (₹)</p>
              <p className="text-xs text-charcoal/50 mb-4">Minimum order total required to qualify for free delivery.</p>
              <Input 
                type="number" 
                value={settings.freeShippingThreshold} 
                onChange={(e) => update("freeShippingThreshold", Number(e.target.value))} 
                className="bg-white border-gray-200 text-charcoal" 
              />
            </div>
            <div>
              <p className="font-medium text-charcoal mb-2">Standard Shipping Fee (₹)</p>
              <p className="text-xs text-charcoal/50 mb-4">Flat fee charged on orders that do not meet the free shipping threshold.</p>
              <Input 
                type="number" 
                value={settings.defaultShippingFee} 
                onChange={(e) => update("defaultShippingFee", Number(e.target.value))} 
                className="bg-white border-gray-200 text-charcoal" 
              />
            </div>
          </div>
        </div>

        {message && <p className={`text-xs p-3 rounded-md font-medium ${message.includes('success') ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-amber-50 text-amber-700 border border-amber-200'}`}>{message}</p>}
        
        <div className="flex justify-end pt-4">
          <Button onClick={handleSave} className="bg-charcoal text-white hover:bg-black h-12 px-8 text-xs uppercase tracking-widest rounded-xl" disabled={saving}>
            {saving ? "Saving Changes..." : "Save Settings"}
          </Button>
        </div>
      </motion.div>

      {/* Change Password Card */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mt-8 bg-white border border-gray-100 p-6 md:p-10 rounded-2xl shadow-[0_2px_10px_rgba(0,0,0,0.04)]"
      >
        <h2 className="text-xl font-serif text-charcoal mb-2">Security Credentials</h2>
        <p className="text-sm text-charcoal/50 mb-6">Update the password used to access the administrator panel.</p>

        <form onSubmit={async (e) => {
          e.preventDefault();
          if (!accessToken) return;
          if (newPassword !== confirmPassword) {
            setPwdMessage("New passwords do not match.");
            return;
          }
          setPwdSaving(true);
          setPwdMessage("");
          try {
            await apiClient.patch<{ success: boolean; message: string }>("/admin/change-password", { currentPassword, newPassword }, accessToken);
            setPwdMessage("Password updated successfully!");
            setCurrentPassword("");
            setNewPassword("");
            setConfirmPassword("");
          } catch (err) {
            setPwdMessage(err instanceof Error ? err.message : "Failed to change password.");
          } finally {
            setPwdSaving(false);
          }
        }} className="space-y-6">
          <div className="grid sm:grid-cols-3 gap-6">
            <div className="space-y-1.5">
              <label className="text-[10px] uppercase tracking-wider text-charcoal/50 font-medium">Current Password</label>
              <Input
                type="password"
                placeholder="Current Password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
                className="bg-white border-gray-200 text-charcoal"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] uppercase tracking-wider text-charcoal/50 font-medium">New Password</label>
              <Input
                type="password"
                placeholder="New Password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                className="bg-white border-gray-200 text-charcoal"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] uppercase tracking-wider text-charcoal/50 font-medium">Confirm New Password</label>
              <Input
                type="password"
                placeholder="Confirm New Password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="bg-white border-gray-200 text-charcoal"
              />
            </div>
          </div>

          {pwdMessage && (
            <p className={`text-xs p-3 rounded-md font-medium ${pwdMessage.includes('success') ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-amber-50 text-amber-700 border border-amber-200'}`}>
              {pwdMessage}
            </p>
          )}

          <div className="flex justify-end">
            <Button type="submit" className="bg-charcoal text-white hover:bg-black h-12 px-8 text-xs uppercase tracking-widest rounded-xl" disabled={pwdSaving}>
              {pwdSaving ? "Updating Password..." : "Update Password"}
            </Button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

