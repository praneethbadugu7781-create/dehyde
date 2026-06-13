"use client";

import { Suspense, useEffect, useState, useRef } from "react";
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

const boxVariants = {
  idle: {
    x: 0,
    rotate: 0,
    scale: 1,
    opacity: 1,
    transition: { duration: 0.3, ease: "easeInOut" }
  },
  success: ({ index, isMobile }: { index: number; isMobile: boolean }) => {
    const D = isMobile ? 52 : 60; // center-to-center distance
    const offsets = [
      2.5 * D,
      1.5 * D,
      0.5 * D,
      -0.5 * D,
      -1.5 * D,
      -2.5 * D
    ];
    const rotations = [0, -6, 6, -10, 10, -12]; 
    const delay = 1.0; 
    
    if (index === 0) {
      return {
        x: [0, offsets[0], offsets[0], offsets[0]], 
        rotate: [0, 12, 0, 0], 
        scale: [1, 0.95, 1.15, 1], 
        backgroundColor: ["#ffffff", "#ffffff", "#1a56db", "#1a56db"], // Fades to royal blue
        borderColor: ["#e5e7eb", "#e5e7eb", "#1a56db", "#1a56db"],
        borderRadius: ["12px", "12px", "50%", "50%"],
        zIndex: 10,
        transition: {
          duration: 0.9,
          times: [0, 0.33, 0.66, 1], 
          delay: delay,
          ease: [0.25, 1, 0.5, 1] 
        }
      };
    }
    return {
      x: [0, offsets[index], offsets[index], offsets[index]],
      rotate: [0, rotations[index], rotations[index], rotations[index]], 
      scale: [1, 0.85, 0, 0], 
      opacity: [1, 1, 0, 0], 
      zIndex: 5 - index,
      transition: {
        duration: 0.9,
        times: [0, 0.32, 0.33, 1],
        delay: delay,
        ease: "easeInOut"
      }
    };
  }
};

const textVariants = {
  idle: { 
    color: "#0a0a0a",
    backgroundColor: "#ffffff"
  },
  success: { 
    color: "rgba(255, 255, 255, 0)", 
    backgroundColor: "rgba(255, 255, 255, 0)", 
    transition: { delay: 1.0, duration: 0.2 } 
  }
};

const gradientVariants = {
  idle: { opacity: 0 },
  success: {
    opacity: [0, 1, 1, 0],
    transition: {
      duration: 1.3,
      times: [0, 0.08, 0.77, 1],
      ease: "easeInOut"
    }
  }
};

const tickContainerVariants = {
  idle: { opacity: 0, scale: 0.5, x: "-50%", y: "-50%" },
  success: { 
    opacity: 1, 
    scale: 1,
    x: "-50%", 
    y: "-50%",
    transition: { 
      delay: 1.35, 
      duration: 0.5, 
      type: "spring", 
      stiffness: 250,
      damping: 20
    }
  }
};

const tickPathVariants = {
  idle: { pathLength: 0 },
  success: { 
    pathLength: 1,
    transition: { delay: 1.4, duration: 0.4, ease: "easeOut" }
  }
};

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const setAuth = useAuthStore((s) => s.setAuth);
  
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [otpArray, setOtpArray] = useState(["", "", "", "", "", ""]);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const inputRefs = [
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
  ];
  const [status, setStatus] = useState<"idle" | "success">("idle");
  const [showVerifiedText, setShowVerifiedText] = useState(false);
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
  const handleVerifyOtp = async (e?: React.FormEvent, directOtp?: string) => {
    if (e) e.preventDefault();
    const finalOtp = directOtp || otp;
    if (!email || !finalOtp) return;
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
          otp: finalOtp,
          name: isNewUser ? name : googlePayload.name,
        });
        accessToken = res.data.accessToken;
      } else {
        const res = await apiClient.post<{
          success: boolean;
          data: { accessToken: string; user: { id: string; role: string } };
        }>("/auth/otp/verify-email", { email, otp: finalOtp, name });
        accessToken = res.data.accessToken;
      }

      // If verification succeeds:
      setStatus('success'); // Trigger Framer Motion animation status

      // Wait for the animation to play fully (about 2.4 seconds) before setting auth state and redirecting
      setTimeout(async () => {
        try {
          const me = await apiClient.get<{ success: boolean; data: unknown }>(
            "/auth/me",
            accessToken
          );
          setAuth(accessToken, me.data as Parameters<typeof setAuth>[1]);
          router.push(redirect);
        } catch (fetchMeErr) {
          setError("Failed to retrieve profile. Please login again.");
          setLoading(false);
        }
      }, 2400);

    } catch (err) {
      setError(err instanceof Error ? err.message : "Invalid code. Please try again.");
      setLoading(false);
      // Reset otp boxes if verification fails so they can retry
      setOtpArray(["", "", "", "", "", ""]);
      setOtp("");
      if (inputRefs[0].current) {
        inputRefs[0].current.focus();
      }
    }
  };

  // Input Handlers
  const handleChange = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    if (status !== 'idle' || loading) return;
    const value = e.target.value;
    if (isNaN(value as any)) return;

    const newOtp = [...otpArray];
    newOtp[index] = value.substring(value.length - 1);
    setOtpArray(newOtp);
    setOtp(newOtp.join(""));

    if (value && index < 5) {
      inputRefs[index + 1].current?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (status !== 'idle' || loading) return;
    if (e.key === 'Backspace' && !otpArray[index] && index > 0) {
      inputRefs[index - 1].current?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLDivElement>) => {
    if (status !== 'idle' || loading) return;
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').slice(0, 6).split('');
    if (pastedData.some(char => isNaN(char as any))) return;

    const newOtp = [...otpArray];
    pastedData.forEach((char, index) => {
      if (index < 6) newOtp[index] = char;
    });
    setOtpArray(newOtp);
    setOtp(newOtp.join(""));

    const nextEmptyIndex = pastedData.length < 6 ? pastedData.length : 5;
    inputRefs[nextEmptyIndex].current?.focus();
  };

  // Effects for auto-submit and text delay
  useEffect(() => {
    const isComplete = otpArray.every(digit => digit !== '');
    if (isComplete && otpSent && !loading && status === 'idle') {
      handleVerifyOtp(undefined, otpArray.join(""));
    }
  }, [otpArray, otpSent]);

  useEffect(() => {
    if (status === 'success') {
      const textTimer = setTimeout(() => {
        setShowVerifiedText(true);
      }, 1500);
      return () => clearTimeout(textTimer);
    }
  }, [status]);

  return (
    <div className="luxury-container flex min-h-[80vh] items-center justify-center py-32">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-sm">
        <AnimatePresence mode="wait">
          <motion.div
            key={showVerifiedText ? 'verified' : 'unverified'}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
          >
            <h1 className="editorial-heading text-4xl">
              {showVerifiedText ? 'Verified successfully' : 'Sign in'}
            </h1>
            <p className="mt-3 text-xs text-muted">
              {showVerifiedText ? 'Welcome to DEHYDE!' : 'Cinematic streetwear and custom orders await.'}
            </p>
          </motion.div>
        </AnimatePresence>

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
              onSubmit={(e) => handleVerifyOtp(e)}
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
                    setOtpArray(["", "", "", "", "", ""]);
                    setStatus('idle');
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

              <div className="space-y-4">
                <label className="text-[9px] uppercase tracking-widest text-muted block mb-1 text-center font-semibold tracking-editorial">One-Time Code (OTP)</label>
                <div className="flex justify-center gap-3 relative min-h-[64px] items-center" onPaste={handlePaste}>
                  {otpArray.map((digit, index) => (
                    <motion.div
                      key={index}
                      className="relative z-10 w-10 h-12 md:w-12 md:h-14 rounded-xl overflow-hidden p-[2px] flex items-center justify-center bg-charcoal/10 focus-within:bg-royal"
                      custom={{ index, isMobile }}
                      variants={boxVariants}
                      initial="idle"
                      animate={status}
                    >
                      {/* Rotating gradient border effect */}
                      {status === 'success' && (
                        <motion.div 
                          className="absolute inset-[-150%] bg-[conic-gradient(from_0deg,transparent_0%,transparent_55%,rgba(26,86,219,0.15)_70%,#1a56db_92%,#60a5fa_100%)] animate-[spin_1s_linear_infinite]"
                          variants={gradientVariants}
                          initial="idle"
                          animate={status}
                        />
                      )}

                      <motion.input
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        ref={inputRefs[index]}
                        value={digit}
                        onChange={(e) => handleChange(index, e)}
                        onKeyDown={(e) => handleKeyDown(index, e)}
                        readOnly={status !== 'idle' || loading}
                        className="w-full h-full text-center font-mono text-xl font-bold rounded-[10px] focus:outline-none transition-all disabled:opacity-50 text-charcoal shadow-sm z-10"
                        variants={textVariants}
                        initial="idle"
                        animate={status}
                      />

                      {index === 0 && (
                        <motion.svg
                          viewBox="0 0 24 24"
                          fill="none"
                          className="absolute top-1/2 left-1/2 w-6 h-6 z-20 pointer-events-none"
                          variants={tickContainerVariants}
                          initial="idle"
                          animate={status}
                        >
                          <motion.path
                            d="M5 13l4 4L19 7"
                            stroke="#ffffff"
                            strokeWidth="3.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            variants={tickPathVariants}
                          />
                        </motion.svg>
                      )}
                    </motion.div>
                  ))}
                </div>
              </div>

              {devOtp && (
                <div className="bg-amber-50 border border-amber-100 rounded-xl p-3 text-[10px] text-amber-800">
                  Development Mode: Use verification code <strong>{devOtp}</strong>
                </div>
              )}

              {error && <p className="text-xs text-red-600">{error}</p>}
              {successMsg && <p className="text-xs text-green-600">{successMsg}</p>}

              <div className="space-y-3">
                <Button type="submit" className="w-full py-3" disabled={loading || status === 'success'}>
                  {status === 'success' ? "Verified" : loading ? "Verifying..." : "Verify & Sign In"}
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
