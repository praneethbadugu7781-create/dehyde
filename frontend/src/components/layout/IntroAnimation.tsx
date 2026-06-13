"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export function IntroAnimation() {
  const [isMounted, setIsMounted] = useState(false);
  const [phase, setPhase] = useState<
    "idle" | "box_appear" | "box_open" | "clothes_emerge" | "name_spread" | "fade_out" | "completed"
  >("idle");

  useEffect(() => {
    setIsMounted(true);
    
    // Check if intro has already been played in this session to prevent nagging users
    const hasPlayed = sessionStorage.getItem("dehyde_intro_played");
    if (hasPlayed === "true") {
      setPhase("completed");
      return;
    }

    // Disable body scrolling during intro animation
    document.body.style.overflow = "hidden";

    // Set animation sequence timeline
    setPhase("box_appear");

    const timer1 = setTimeout(() => setPhase("box_open"), 1000);
    const timer2 = setTimeout(() => setPhase("clothes_emerge"), 1600);
    const timer3 = setTimeout(() => setPhase("name_spread"), 3200);
    const timer4 = setTimeout(() => setPhase("fade_out"), 4600);
    const timer5 = setTimeout(() => {
      setPhase("completed");
      sessionStorage.setItem("dehyde_intro_played", "true");
      document.body.style.overflow = "";
    }, 5200);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      clearTimeout(timer4);
      clearTimeout(timer5);
      document.body.style.overflow = "";
    };
  }, []);

  if (!isMounted || phase === "completed") return null;

  return (
    <motion.div
      initial={{ opacity: 1 }}
      animate={{ opacity: phase === "fade_out" ? 0 : 1 }}
      transition={{ duration: 0.6, ease: "easeInOut" }}
      className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#09090b] text-white select-none pointer-events-none"
    >
      <div className="relative w-64 h-64 flex items-center justify-center">
        {/* The Box */}
        {phase !== "name_spread" && phase !== "fade_out" && (
          <div className="relative w-48 h-48 flex items-center justify-center">
            {/* Box Body outlines */}
            <svg viewBox="0 0 200 200" className="absolute inset-0 w-full h-full stroke-white/80 fill-none" strokeWidth={1.5}>
              <motion.path
                d="M 100,135 L 60,115 L 60,155 L 100,175 L 140,155 L 140,115 Z"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 0.8, ease: "easeInOut" }}
              />
              <motion.path
                d="M 100,135 L 100,175"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 0.8, ease: "easeInOut", delay: 0.2 }}
              />
            </svg>

            {/* Box Lid - Pop open animation */}
            <motion.div
              initial={{ y: 0, rotate: 0, opacity: 1 }}
              animate={
                phase === "box_open" || phase === "clothes_emerge"
                  ? { y: -45, rotate: -20, opacity: 0, scale: 0.9 }
                  : { y: 0, rotate: 0, opacity: 1 }
              }
              transition={{ type: "spring", stiffness: 120, damping: 12 }}
              className="absolute inset-0 w-full h-full"
            >
              <svg viewBox="0 0 200 200" className="w-full h-full stroke-white fill-none" strokeWidth={1.5}>
                <motion.path
                  d="M 100,135 L 60,115 L 100,95 L 140,115 Z"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 0.8, ease: "easeInOut", delay: 0.1 }}
                />
              </svg>
            </motion.div>
          </div>
        )}

        {/* Emerging Clothes */}
        <AnimatePresence>
          {phase === "clothes_emerge" && (
            <div className="absolute inset-0 flex items-center justify-center">
              {/* 1. Shirt */}
              <motion.div
                initial={{ y: 40, scale: 0.4, opacity: 0 }}
                animate={{ y: -70, scale: 1.1, opacity: [0, 1, 1, 0] }}
                exit={{ opacity: 0 }}
                transition={{
                  duration: 1.3,
                  times: [0, 0.2, 0.8, 1],
                  ease: "easeOut",
                }}
                className="absolute flex flex-col items-center"
              >
                <svg viewBox="0 0 200 200" className="w-20 h-20 stroke-white/90 fill-none" strokeWidth={1.5}>
                  <motion.path
                    d="M 85,75 L 100,90 L 115,75"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                  />
                  <motion.path
                    d="M 75,70 L 60,85 L 72,97 L 82,90 L 82,145 L 118,145 L 118,90 L 128,97 L 140,85 L 125,70 Z"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 0.7, ease: "easeOut" }}
                  />
                  <path d="M 100,90 L 100,145" strokeDasharray="2,4" />
                </svg>
                <span className="text-[9px] uppercase tracking-[0.2em] font-medium text-white/50 mt-1">Shirt</span>
              </motion.div>

              {/* 2. T-Shirt */}
              <motion.div
                initial={{ y: 40, scale: 0.4, opacity: 0 }}
                animate={{ y: -70, scale: 1.1, opacity: [0, 1, 1, 0] }}
                exit={{ opacity: 0 }}
                transition={{
                  duration: 1.3,
                  delay: 0.5,
                  times: [0, 0.2, 0.8, 1],
                  ease: "easeOut",
                }}
                className="absolute flex flex-col items-center"
              >
                <svg viewBox="0 0 200 200" className="w-20 h-20 stroke-white/90 fill-none" strokeWidth={1.5}>
                  <motion.path
                    d="M 75,75 C 90,70 110,70 125,75 L 142,92 L 128,103 L 120,97 L 120,145 L 80,145 L 80,97 L 72,103 L 58,92 Z"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 0.7, ease: "easeOut" }}
                  />
                </svg>
                <span className="text-[9px] uppercase tracking-[0.2em] font-medium text-white/50 mt-1">T-Shirt</span>
              </motion.div>

              {/* 3. Pants */}
              <motion.div
                initial={{ y: 40, scale: 0.4, opacity: 0 }}
                animate={{ y: -70, scale: 1.1, opacity: [0, 1, 1, 0] }}
                exit={{ opacity: 0 }}
                transition={{
                  duration: 1.3,
                  delay: 1.0,
                  times: [0, 0.2, 0.8, 1],
                  ease: "easeOut",
                }}
                className="absolute flex flex-col items-center"
              >
                <svg viewBox="0 0 200 200" className="w-20 h-20 stroke-white/90 fill-none" strokeWidth={1.5}>
                  <motion.path
                    d="M 75,70 L 125,70 L 128,145 L 108,145 L 100,95 L 92,145 L 72,145 Z"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 0.7, ease: "easeOut" }}
                  />
                  <path d="M 75,78 L 125,78" />
                </svg>
                <span className="text-[9px] uppercase tracking-[0.2em] font-medium text-white/50 mt-1">Pants</span>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>

      {/* Brand Name Spreading */}
      {phase === "name_spread" && (
        <motion.div
          initial={{ letterSpacing: "0.1em", opacity: 0 }}
          animate={{ letterSpacing: "0.45em", opacity: 1 }}
          transition={{ duration: 1.2, ease: "easeOut" }}
          className="absolute font-serif text-4xl md:text-6xl font-light uppercase text-white select-none text-center"
        >
          DEHYDE
        </motion.div>
      )}
    </motion.div>
  );
}
