"use client";

import { motion } from "framer-motion";

export function ShopHeader() {
  return (
    <div className="flex flex-col items-center text-center gap-4 mb-16 max-w-4xl mx-auto py-16 relative">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 bg-primary/10 rounded-full blur-[120px] -z-10" />
      <motion.span
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-primary font-black tracking-[0.5em] uppercase text-[10px] bg-primary/5 px-4 py-1.5 rounded-full border border-primary/10 shadow-[0_0_20px_rgba(var(--primary),0.1)]"
      >
        Premium Collection
      </motion.span>

      <motion.h1
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="text-5xl md:text-[8.5rem] font-black tracking-tighter text-foreground leading-[0.8] uppercase italic"
      >
        THE{" "}
        <span className="text-gradient drop-shadow-[0_0_30px_rgba(var(--primary),0.3)]">
          DROPS
        </span>
      </motion.h1>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="text-muted-foreground text-sm md:text-base font-medium tracking-wide max-w-md mt-4"
      >
        Elevated essentials for the modern aesthetic. Curated to define your
        unique identity.
      </motion.p>
    </div>
  );
}
