"use client";

import { motion } from "framer-motion";

export default function Template({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{
        type: "spring",
        stiffness: 100,
        damping: 20,
        duration: 0.6,
      }}
    >
      {children}
    </motion.div>
  );
}
