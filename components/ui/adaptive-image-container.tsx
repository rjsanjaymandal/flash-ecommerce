"use client";

import { useImageColor } from "@/hooks/use-image-color";
import { cn } from "@/lib/utils";
import { motion, HTMLMotionProps } from "framer-motion";

interface AdaptiveImageContainerProps extends HTMLMotionProps<"div"> {
  imageUrl: string;
  children: React.ReactNode;
}

export function AdaptiveImageContainer({
  imageUrl,
  children,
  className,
  ...props
}: AdaptiveImageContainerProps) {
  const bgColor = useImageColor(imageUrl);

  return (
    <motion.div
      className={cn("w-full h-full", className)}
      style={{ backgroundColor: bgColor || "#F5F5F5" }}
      initial={{ backgroundColor: "#F5F5F5" }}
      animate={{ backgroundColor: bgColor || "#F5F5F5" }}
      transition={{ duration: 0.7 }}
      {...props}
    >
      {children}
    </motion.div>
  );
}
