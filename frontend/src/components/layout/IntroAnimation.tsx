"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";

export function IntroAnimation() {
  const [isMounted, setIsMounted] = useState(false);
  const [phase, setPhase] = useState<"idle" | "appear" | "split" | "exit" | "completed">("idle");
  const [targetWidth, setTargetWidth] = useState(0);

  useEffect(() => {
    setIsMounted(true);
    
    // Check if intro has already played in this session
    const hasPlayed = sessionStorage.getItem("dehyde_intro_played");
    if (hasPlayed === "true") {
      setPhase("completed");
      return;
    }

    // Disable body scrolling during intro animation
    document.body.style.overflow = "hidden";

    // Set animation sequence timeline
    setPhase("appear");
    
    // 1. Text splits and reveals campaign image in the middle
    const timer1 = setTimeout(() => setPhase("split"), 1200);
    
    // 2. Preloader curtain slides up to reveal homepage
    const timer2 = setTimeout(() => setPhase("exit"), 3200);
    
    // 3. Animation completes, restore scroll
    const timer3 = setTimeout(() => {
      setPhase("completed");
      sessionStorage.setItem("dehyde_intro_played", "true");
      document.body.style.overflow = "";
    }, 4000);

    // Calculate responsive target width for the middle image container
    const handleResize = () => {
      const w = window.innerWidth;
      if (w < 640) setTargetWidth(110); // Mobile
      else if (w < 768) setTargetWidth(150); // Small tablet
      else if (w < 1024) setTargetWidth(190); // Large tablet / Medium screen
      else setTargetWidth(240); // Desktop / Large screen
    };

    handleResize();
    window.addEventListener("resize", handleResize);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      window.removeEventListener("resize", handleResize);
      document.body.style.overflow = "";
    };
  }, []);

  if (!isMounted || phase === "completed") return null;

  return (
    <motion.div
      initial={{ y: 0 }}
      animate={{ y: phase === "exit" ? "-100%" : 0 }}
      transition={{ duration: 0.8, ease: [0.76, 0, 0.24, 1] }}
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-[#09090b] text-white select-none overflow-hidden"
      style={{
        backgroundImage: "radial-gradient(circle at center, #111113 0%, #09090b 100%)",
      }}
    >
      <div className="flex items-center justify-center font-sans font-extrabold tracking-tighter text-6xl sm:text-7xl md:text-8xl lg:text-9xl uppercase">
        {/* Left: DEH (Solid Text) */}
        <motion.span
          initial={{ y: 60, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, ease: [0.215, 0.61, 0.355, 1] }}
          className="inline-block text-white"
        >
          DEH
        </motion.span>

        {/* Center: Campaign Image Reveal */}
        <motion.div
          initial={{ width: 0, opacity: 0 }}
          animate={
            phase === "split" || phase === "exit"
              ? { width: targetWidth, opacity: 1 }
              : { width: 0, opacity: 0 }
          }
          transition={{
            width: { type: "spring", stiffness: 75, damping: 14 },
            opacity: { duration: 0.3 }
          }}
          className="overflow-hidden h-[80px] sm:h-[110px] md:h-[140px] lg:h-[180px] flex-shrink-0 flex items-center justify-center"
        >
          <motion.div
            initial={{ scale: 1.3, rotate: -3 }}
            animate={
              phase === "split" || phase === "exit"
                ? { scale: 1, rotate: 0 }
                : { scale: 1.3, rotate: -3 }
            }
            transition={{ duration: 1.2, ease: [0.215, 0.61, 0.355, 1] }}
            className="h-full px-2 sm:px-3 md:px-4"
          >
            <img
              src="/campaign_streetwear.png"
              alt="DEHYDE Streetwear"
              className="h-full w-auto object-cover rounded-xl sm:rounded-2xl border border-white/20 shadow-2xl"
            />
          </motion.div>
        </motion.div>

        {/* Right: YDE (Outlined Text) */}
        <motion.span
          initial={{ y: 60, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, ease: [0.215, 0.61, 0.355, 1] }}
          className="inline-block text-transparent"
          style={{ WebkitTextStroke: "2px rgba(255, 255, 255, 0.95)" }}
        >
          YDE
        </motion.span>
      </div>
    </motion.div>
  );
}
