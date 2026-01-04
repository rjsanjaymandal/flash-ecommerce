"use client";

import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface BrandGlowProps {
  color?: "primary" | "accent" | "mixed";
  className?: string;
  size?: "sm" | "md" | "lg";
  style?: React.CSSProperties;
}

export function BrandGlow({
  color = "primary",
  className,
  size = "md",
  style,
}: BrandGlowProps) {
  const colors = {
    primary: "bg-primary/10",
    accent: "bg-accent/10",
    mixed: "bg-linear-to-br from-primary/10 to-accent/10",
  };

  const sizes = {
    sm: "w-48 h-48 blur-[80px]",
    md: "w-64 h-64 blur-[120px]",
    lg: "w-96 h-96 blur-[160px]",
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 1.5, ease: "easeOut" }}
      className={cn(
        "absolute rounded-full -z-10 pointer-events-none",
        !style?.background && colors[color],
        sizes[size],
        className
      )}
      style={style}
    />
  );
}
