"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuthStore } from "@/store/authStore";
import { apiClient } from "@/lib/api";

declare global {
  interface Window {
    google?: any;
  }
}

// Decode Google JWT securely in vanilla JS
const decodeJwt = (token: string) => {
  try {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error("Failed to decode JWT:", error);
    return null;
  }
};

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const setAuth = useAuthStore((s) => s.setAuth);
  
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [name, setName] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [isNewUser, setIsNewUser] = useState(false);
  const [devOtp, setDevOtp] = useState("");
  const [googlePayload, setGooglePayload] = useState<{
    email: string;
    name: string;
    googleId: string;
    avatar?: string;
  } | null>(null);
  
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const redirect = searchParams.get("redirect") || "/account";

  // Dynamic Google GIS integration
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    document.body.appendChild(script);

    script.onload = () => {
      if (window.google) {
        window.google.accounts.id.initialize({
          client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "25622336753-mflvqi8mbdvdh0g9tjnfeihr6h88u4lq.apps.googleusercontent.com",
          callback: handleGoogleCredentialResponse,
        });
        window.google.accounts.id.renderButton(
          document.getElementById("google-signin-btn"),
          { theme: "outline", size: "large", width: "100%", text: "continue_with" }
        );
      }
    };

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const handleGoogleCredentialResponse = async (response: any) => {
    setLoading(true);
    setError("");
    try {
      const payload = decodeJwt(response.credential);
      if (!payload) throw new Error("Could not parse Google credentials");

      const payloadData = {
        email: payload.email,
        name: payload.name || "",
        googleId: payload.sub,
        avatar: payload.picture,
      };

      const res = await apiClient.post<{
        success: boolean;
        otpRequired?: boolean;
        isNewUser: boolean;
        devOtp?: string;
        message: string;
        data?: { accessToken: string; user: { id: string; role: string } };
      }>("/auth/google", payloadData);

      if (res.otpRequired) {
        setGooglePayload(payloadData);
        setEmail(payloadData.email);
        setName(payloadData.name);
        setIsNewUser(res.isNewUser);
        setOtpSent(true);
        if (res.devOtp) {
          setDevOtp(res.devOtp);
        }
        setSuccessMsg("Verification code sent to your Google email.");
      } else if (res.data?.accessToken) {
        const me = await apiClient.get<{ success: boolean; data: unknown }>(
          "/auth/me",
          res.data.accessToken
        );
        setAuth(res.data.accessToken, me.data as Parameters<typeof setAuth>[1]);
        router.push(redirect);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Google login failed");
    } finally {
      setLoading(false);
    }
  };

  // Requesting OTP
  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    setError("");
    setSuccessMsg("");
    try {
      const res = await apiClient.post<{
        success: boolean;
        isNewUser: boolean;
        devOtp?: string;
        message: string;
      }>("/auth/otp/request-email", { email });
      
      setOtpSent(true);
      setIsNewUser(res.isNewUser);
      if (res.devOtp) {
        setDevOtp(res.devOtp);
      }
      setSuccessMsg("Verification code sent to your email.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send OTP");
    } finally {
      setLoading(false);
    }
  };

  // Verifying OTP
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !otp) return;
    if (isNewUser && !name) {
      setError("Please enter your name to complete signup.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      let accessToken = "";
      if (googlePayload) {
        const res = await apiClient.post<{
          success: boolean;
          data: { accessToken: string; user: { id: string; role: string } };
        }>("/auth/google", {
          ...googlePayload,
          otp,
          name: isNewUser ? name : googlePayload.name,
        });
        accessToken = res.data.accessToken;
      } else {
        const res = await apiClient.post<{
          success: boolean;
          data: { accessToken: string; user: { id: string; role: string } };
        }>("/auth/otp/verify-email", { email, otp, name });
        accessToken = res.data.accessToken;
      }

      const me = await apiClient.get<{ success: boolean; data: unknown }>(
        "/auth/me",
        accessToken
      );
      setAuth(accessToken, me.data as Parameters<typeof setAuth>[1]);
      router.push(redirect);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Invalid code. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="luxury-container flex min-h-[80vh] items-center justify-center py-32">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-sm">
        <h1 className="editorial-heading text-4xl">Sign in</h1>
        <p className="mt-3 text-xs text-muted">Cinematic streetwear and custom orders await.</p>

        {/* Dynamic OTP Forms */}
        <AnimatePresence mode="wait">
          {!otpSent ? (
            <motion.form
              key="request-form"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onSubmit={handleRequestOtp}
              className="mt-8 space-y-6"
            >
              <div>
                <label className="text-[9px] uppercase tracking-widest text-muted block mb-1">Email Address</label>
                <Input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>

              {error && <p className="text-xs text-red-600">{error}</p>}
              
              <Button type="submit" className="w-full py-3" disabled={loading}>
                {loading ? "Sending..." : "Send OTP"}
              </Button>
            </motion.form>
          ) : (
            <motion.form
              key="verify-form"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onSubmit={handleVerifyOtp}
              className="mt-8 space-y-6"
            >
              <div className="bg-gray-50/50 p-4 rounded-xl border border-gray-100 flex justify-between items-center text-xs">
                <span className="text-muted truncate mr-4">OTP sent to: <strong>{email}</strong></span>
                <button
                  type="button"
                  onClick={() => {
                    setOtpSent(false);
                    setError("");
                    setDevOtp("");
                    setGooglePayload(null);
                  }}
                  className="text-charcoal uppercase tracking-widest text-[9px] hover:underline whitespace-nowrap"
                >
                  Change
                </button>
              </div>

              {isNewUser && (
                <div>
                  <label className="text-[9px] uppercase tracking-widest text-muted block mb-1">Full Name (New Customer)</label>
                  <Input
                    placeholder="Enter your name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    disabled={loading}
                  />
                </div>
              )}

              <div>
                <label className="text-[9px] uppercase tracking-widest text-muted block mb-1">One-Time Code (OTP)</label>
                <Input
                  placeholder="Enter 6-digit code"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  maxLength={6}
                  required
                  disabled={loading}
                />
              </div>

              {devOtp && (
                <div className="bg-amber-50 border border-amber-100 rounded-xl p-3 text-[10px] text-amber-800">
                  Development Mode: Use verification code <strong>{devOtp}</strong>
                </div>
              )}

              {error && <p className="text-xs text-red-600">{error}</p>}
              {successMsg && <p className="text-xs text-green-600">{successMsg}</p>}

              <div className="space-y-3">
                <Button type="submit" className="w-full py-3" disabled={loading}>
                  {loading ? "Verifying..." : "Verify & Sign In"}
                </Button>
                <button
                  type="button"
                  onClick={handleRequestOtp}
                  disabled={loading}
                  className="w-full text-center text-[10px] uppercase tracking-widest text-muted hover:text-charcoal py-2"
                >
                  Resend Code
                </button>
              </div>
            </motion.form>
          )}
        </AnimatePresence>

        {/* Separator */}
        <div className="relative my-8 flex items-center justify-center">
          <div className="absolute inset-x-0 h-[1px] bg-charcoal/10" />
          <span className="relative z-10 bg-offwhite px-4 text-[9px] uppercase tracking-widest text-muted">Or</span>
        </div>

        {/* Google Buttons Section */}
        <div className="space-y-4">
          <div id="google-signin-btn" className="w-full overflow-hidden" />
        </div>
      </motion.div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="luxury-container py-32 text-center">Loading...</div>}>
      <LoginForm />
    </Suspense>
  );
}
