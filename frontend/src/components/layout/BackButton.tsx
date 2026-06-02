"use client";

import { usePathname, useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";

export function BackButton() {
  const router = useRouter();
  const pathname = usePathname();

  // Hide on homepage and admin routes
  const showButton = pathname !== "/" && !pathname?.startsWith("/admin");

  if (!showButton) return null;

  return (
    <motion.button
      type="button"
      onClick={() => router.back()}
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      className="fixed left-6 top-32 z-40 hidden xl:flex items-center gap-3 group text-[9px] uppercase tracking-widest text-charcoal/40 hover:text-charcoal transition-all duration-300"
      aria-label="Go Back"
    >
      <div className="h-9 w-9 rounded-full border border-gray-100 bg-white flex items-center justify-center shadow-[0_4px_15px_rgba(0,0,0,0.03)] group-hover:border-charcoal/20 group-hover:-translate-x-1 transition-all duration-300">
        <ArrowLeft className="h-4 w-4 text-charcoal" strokeWidth={1.2} />
      </div>
      <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 font-medium">
        Back
      </span>
    </motion.button>
  );
}
