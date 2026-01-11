"use client";

import React, { useMemo, useState, useEffect } from "react";
import { motion } from "framer-motion";

export function Snowfall() {
  const [mounted, setMounted] = useState(false);

  const [snowflakes, setSnowflakes] = useState<any[]>([]);

  useEffect(() => {
    setMounted(true);
    const flakes = Array.from({ length: 40 }).map((_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      animationDuration: Math.random() * 10 + 5,
      delay: Math.random() * 5,
      size: Math.random() * 4 + 2,
      opacity: Math.random() * 0.5 + 0.3,
      drift: `${Math.random() * 10 - 5}vw`,
    }));
    setSnowflakes(flakes);
  }, []);

  if (!mounted) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-[1] overflow-hidden">
      {snowflakes.map((flake) => (
        <motion.div
          key={flake.id}
          initial={{ y: -20, opacity: 0 }}
          animate={{
            y: "110vh",
            opacity: [0, flake.opacity, flake.opacity, 0],
            x: ["0vw", flake.drift, "0vw"],
          }}
          transition={{
            duration: flake.animationDuration,
            repeat: Infinity,
            delay: flake.delay,
            ease: "linear",
          }}
          style={{
            position: "absolute",
            left: flake.left,
            width: flake.size,
            height: flake.size,
            backgroundColor: "white",
            borderRadius: "50%",
            filter: "blur(1px)",
          }}
        />
      ))}
    </div>
  );
}
