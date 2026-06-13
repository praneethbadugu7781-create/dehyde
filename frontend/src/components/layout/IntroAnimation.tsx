"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface Particle {
  id: number;
  x: number;
  y: number;
  size: number;
  delay: number;
  duration: number;
  driftX: number;
  driftY: number;
}

export function IntroAnimation() {
  const [isMounted, setIsMounted] = useState(false);
  const [particles, setParticles] = useState<Particle[]>([]);
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

    // Generate cinematic background particles
    const arr = Array.from({ length: 30 }).map((_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 2 + 1,
      delay: Math.random() * -15, // Negative delay so particles start in-motion
      duration: Math.random() * 12 + 12,
      driftX: (Math.random() - 0.5) * 15,
      driftY: (Math.random() - 0.5) * 15 - 15, // Drift upwards
    }));
    setParticles(arr);

    // Set animation sequence timeline
    setPhase("box_appear");

    const timer1 = setTimeout(() => setPhase("box_open"), 1200);
    const timer2 = setTimeout(() => setPhase("clothes_emerge"), 1800);
    const timer3 = setTimeout(() => setPhase("name_spread"), 4200);
    const timer4 = setTimeout(() => setPhase("fade_out"), 5800);
    const timer5 = setTimeout(() => {
      setPhase("completed");
      sessionStorage.setItem("dehyde_intro_played", "true");
      document.body.style.overflow = "";
    }, 6400);

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
      className="fixed inset-0 Bun z-[9999] flex flex-col items-center justify-center bg-[#09090b] text-white select-none pointer-events-none overflow-hidden"
      style={{
        backgroundImage: "radial-gradient(circle at center, #111113 0%, #09090b 100%)",
      }}
    >
      {/* Background Ambient Particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        {particles.map((p) => (
          <motion.div
            key={p.id}
            initial={{ 
              x: `${p.x}vw`, 
              y: `${p.y}vh`, 
              opacity: 0, 
              scale: 0.5 
            }}
            animate={{
              x: [`${p.x}vw`, `${p.x + p.driftX}vw`],
              y: [`${p.y}vh`, `${p.y + p.driftY}vh`],
              opacity: [0, 0.4, 0.4, 0],
              scale: [0.5, 1.2, 1.2, 0.5]
            }}
            transition={{
              duration: p.duration,
              delay: p.delay,
              repeat: Infinity,
              ease: "linear"
            }}
            style={{
              width: `${p.size}px`,
              height: `${p.size}px`,
              borderRadius: "50%",
            }}
            className="absolute bg-white/30 shadow-[0_0_8px_rgba(255,255,255,0.4)]"
          />
        ))}
      </div>

      <div className="relative w-96 h-96 flex items-center justify-center [perspective:1200px] [transform-style:preserve-3d] z-10">
        {/* The 3D Box */}
        {phase !== "name_spread" && phase !== "fade_out" && (
          <motion.div
            initial={{ rotateX: -25, rotateY: -135, scale: 0 }}
            animate={{ 
              rotateX: -25, 
              rotateY: [45, 55, 35, 45],
              scale: 1 
            }}
            transition={{ 
              scale: { duration: 1, ease: "easeOut" },
              rotateY: { repeat: Infinity, duration: 8, ease: "easeInOut" },
              default: { duration: 1.2 }
            }}
            className="relative w-36 h-36 [transform-style:preserve-3d]"
          >
            {/* Front Face */}
            <div 
              style={{ transform: "translateZ(72px)" }}
              className="absolute inset-0 border border-white/40 bg-white/[0.02] shadow-[0_0_15px_rgba(255,255,255,0.03)] backdrop-blur-[1px]"
            />
            {/* Back Face */}
            <div 
              style={{ transform: "rotateY(180deg) translateZ(72px)" }}
              className="absolute inset-0 border border-white/20 bg-white/[0.01]"
            />
            {/* Left Face */}
            <div 
              style={{ transform: "rotateY(-90deg) translateZ(72px)" }}
              className="absolute inset-0 border border-white/25 bg-white/[0.02]"
            />
            {/* Right Face */}
            <div 
              style={{ transform: "rotateY(90deg) translateZ(72px)" }}
              className="absolute inset-0 border border-white/25 bg-white/[0.02]"
            />
            {/* Bottom Face */}
            <div 
              style={{ transform: "rotateX(-90deg) translateZ(72px)" }}
              className="absolute inset-0 border border-white/15 bg-white/[0.01]"
            />
            
            {/* Top Face (Lid) - Pop open & Float off */}
            <motion.div
              initial={{ y: -72, rotateX: 90, opacity: 1 }}
              animate={
                phase === "box_open" || phase === "clothes_emerge"
                  ? { y: -140, rotateX: 35, rotateY: 15, opacity: 0 }
                  : { y: -72, rotateX: 90, opacity: 1 }
              }
              transition={{ type: "spring", stiffness: 80, damping: 15 }}
              style={{ transformStyle: "preserve-3d" }}
              className="absolute inset-0 border border-white/60 bg-white/[0.06] shadow-[0_0_20px_rgba(255,255,255,0.05)]"
            />
          </motion.div>
        )}

        {/* 3D Emerging Clothes (Fly past camera) */}
        <AnimatePresence>
          {phase === "clothes_emerge" && (
            <div className="absolute inset-0 [transform-style:preserve-3d] flex items-center justify-center">
              
              {/* 1. Shirt */}
              <motion.div
                initial={{ z: -20, y: 15, scale: 0.1, opacity: 0, rotateY: 0, rotateX: 0 }}
                animate={{ 
                  z: 450, 
                  y: -180, 
                  scale: 1.5, 
                  opacity: [0, 1, 1, 0],
                  rotateY: 360,
                  rotateX: 15
                }}
                exit={{ opacity: 0 }}
                transition={{
                  duration: 1.6,
                  ease: "easeOut",
                  times: [0, 0.2, 0.7, 1],
                }}
                className="absolute flex flex-col items-center justify-center filter drop-shadow-[0_0_15px_rgba(255,255,255,0.45)]"
              >
                <svg viewBox="0 0 200 200" className="w-24 h-24 stroke-white fill-none" strokeWidth={1.5}>
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
                    transition={{ duration: 0.8, ease: "easeOut" }}
                  />
                  <path d="M 100,90 L 100,145" strokeDasharray="2,4" />
                </svg>
                <span className="text-[10px] uppercase tracking-[0.25em] font-medium text-white/70 mt-2">Shirt</span>
              </motion.div>

              {/* 2. T-Shirt */}
              <motion.div
                initial={{ z: -20, y: 15, scale: 0.1, opacity: 0, rotateY: 0, rotateX: 0 }}
                animate={{ 
                  z: 450, 
                  y: -180, 
                  scale: 1.5, 
                  opacity: [0, 1, 1, 0],
                  rotateY: -360,
                  rotateX: -15
                }}
                exit={{ opacity: 0 }}
                transition={{
                  duration: 1.6,
                  delay: 0.8,
                  ease: "easeOut",
                  times: [0, 0.2, 0.7, 1],
                }}
                className="absolute flex flex-col items-center justify-center filter drop-shadow-[0_0_15px_rgba(255,255,255,0.45)]"
              >
                <svg viewBox="0 0 200 200" className="w-24 h-24 stroke-white fill-none" strokeWidth={1.5}>
                  <motion.path
                    d="M 75,75 C 90,70 110,70 125,75 L 142,92 L 128,103 L 120,97 L 120,145 L 80,145 L 80,97 L 72,103 L 58,92 Z"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                  />
                </svg>
                <span className="text-[10px] uppercase tracking-[0.25em] font-medium text-white/70 mt-2">T-Shirt</span>
              </motion.div>

              {/* 3. Pants */}
              <motion.div
                initial={{ z: -20, y: 15, scale: 0.1, opacity: 0, rotateY: 0, rotateZ: 0 }}
                animate={{ 
                  z: 450, 
                  y: -180, 
                  scale: 1.5, 
                  opacity: [0, 1, 1, 0],
                  rotateY: 180,
                  rotateZ: 10
                }}
                exit={{ opacity: 0 }}
                transition={{
                  duration: 1.6,
                  delay: 1.6,
                  ease: "easeOut",
                  times: [0, 0.2, 0.7, 1],
                }}
                className="absolute flex flex-col items-center justify-center filter drop-shadow-[0_0_15px_rgba(255,255,255,0.45)]"
              >
                <svg viewBox="0 0 200 200" className="w-24 h-24 stroke-white fill-none" strokeWidth={1.5}>
                  <motion.path
                    d="M 75,70 L 125,70 L 128,145 L 108,145 L 100,95 L 92,145 L 72,145 Z"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                  />
                  <path d="M 75,78 L 125,78" />
                </svg>
                <span className="text-[10px] uppercase tracking-[0.25em] font-medium text-white/70 mt-2">Pants</span>
              </motion.div>

            </div>
          )}
        </AnimatePresence>
      </div>

      {/* Cinematic Brand Name Stagger Reveal */}
      {phase === "name_spread" && (
        <div className="absolute inset-0 flex items-center justify-center [perspective:1000px] z-20">
          <motion.div 
            initial="hidden"
            animate="visible"
            variants={{
              visible: {
                transition: {
                  staggerChildren: 0.12
                }
              }
            }}
            className="flex items-center justify-center font-serif text-5xl md:text-7xl font-extralight uppercase text-white select-none text-center"
          >
            {"DEHYDE".split("").map((letter, i) => (
              <motion.span
                key={i}
                variants={{
                  hidden: { 
                    opacity: 0, 
                    y: 60,
                    z: 120,
                    filter: "blur(12px)", 
                    scale: 1.7 
                  },
                  visible: { 
                    opacity: 1, 
                    y: 0,
                    z: 0,
                    filter: "blur(0px)", 
                    scale: 1,
                    transition: {
                      type: "spring",
                      stiffness: 60,
                      damping: 14
                    }
                  }
                }}
                className="mx-[0.18em] md:mx-[0.25em] inline-block"
              >
                {letter}
              </motion.span>
            ))}
          </motion.div>
        </div>
      )}
    </motion.div>
  );
}
