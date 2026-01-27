"use client";

import { motion } from "framer-motion";

export function ShopHeader() {
  return (
    <div className="flex flex-col items-center text-center gap-0 mb-4 max-w-5xl mx-auto py-0 relative w-full overflow-hidden">
      {/* Dynamic Background Element - Very subtle glow at the extreme top */}
      <motion.div
        animate={{
          scale: [1, 1.15, 1],
          opacity: [0.1, 0.2, 0.1],
          rotate: [0, 5, 0],
        }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-0 left-1/2 -translate-x-1/2 w-80 h-40 bg-primary/10 rounded-full blur-[80px] -z-10"
      />
    </div>
  );
}
