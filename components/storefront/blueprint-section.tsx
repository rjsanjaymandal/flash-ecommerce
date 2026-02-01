"use client";

import React, { useEffect, useState } from "react";
import FlashImage from "@/components/ui/flash-image";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { ShieldCheck, Ruler, Shirt, Layers } from "lucide-react";
import Link from "next/link";

interface BlueprintSectionProps {
  product?: {
    name: string;
    main_image_url: string | null;
    slug: string;
  } | null;
}

export function BlueprintSection({ product }: BlueprintSectionProps) {
  // Client-side hydration fix for random rotation/position if we were using it,
  // but here we just need to ensure generic image if no product.

  const imageSrc =
    product?.main_image_url ||
    "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?q=80&w=1000&auto=format&fit=crop";

  const productUrl = product?.slug ? `/product/${product.slug}` : "#";

  return (
    <section className="relative py-16 md:py-24 bg-zinc-950 overflow-hidden border-y border-white/5">
      {/* BACKGROUND GRID */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />
      <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-zinc-950 to-transparent pointer-events-none" />
      <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-zinc-950 to-transparent pointer-events-none" />

      <div className="container mx-auto px-4 relative z-10">
        {/* HEADER */}
        <div className="text-center mb-12 md:mb-20">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-7xl font-black tracking-tighter text-white uppercase italic"
          >
            THE{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-b from-white to-white/40">
              BLUEPRINT
            </span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-zinc-500 font-mono text-xs md:text-sm mt-4 tracking-widest uppercase"
          >
            {product?.name || "Heavyweight Edition"}
          </motion.p>
        </div>

        {/* MAIN BLUEPRINT UI - NOW CLICKABLE */}
        <Link
          href={productUrl}
          className="block group cursor-pointer relative max-w-5xl mx-auto md:aspect-[16/9] bg-zinc-900/50 rounded-3xl border border-white/10 backdrop-blur-sm overflow-hidden flex flex-col md:block hover:border-white/30 transition-colors duration-500"
        >
          {/* CROSSHAIRS (Desktop Only) */}
          <div className="hidden md:block absolute top-8 left-8 w-8 h-8 border-l border-t border-white/20 group-hover:border-emerald-500/50 transition-colors duration-500" />
          <div className="hidden md:block absolute top-8 right-8 w-8 h-8 border-r border-t border-white/20 group-hover:border-emerald-500/50 transition-colors duration-500" />
          <div className="hidden md:block absolute bottom-8 left-8 w-8 h-8 border-l border-b border-white/20 group-hover:border-emerald-500/50 transition-colors duration-500" />
          <div className="hidden md:block absolute bottom-8 right-8 w-8 h-8 border-r border-b border-white/20 group-hover:border-emerald-500/50 transition-colors duration-500" />

          {/* PRODUCT IMAGE CENTERING WRAPPER */}
          <div className="relative w-full h-[300px] md:h-auto md:aspect-square md:absolute md:inset-0 flex items-center justify-center p-4 md:p-0 z-20">
            <div className="relative w-full h-full max-w-[250px] md:max-w-[400px] aspect-[3/4] group-hover:scale-105 transition-transform duration-700 ease-out">
              <FlashImage
                src={imageSrc}
                alt="Blueprint Product"
                fill
                className="object-contain drop-shadow-2xl grayscale group-hover:grayscale-0 transition-all duration-500"
              />

              {/* Pulsing Core */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-white/5 rounded-full blur-3xl -z-10 animate-pulse group-hover:bg-emerald-500/10 transition-colors duration-500" />
            </div>
          </div>

          {/* SPECS (Pointers) - Stacked on Mobile, Absolute on Desktop */}
          <div className="grid grid-cols-2 md:grid-cols-1 gap-3 p-4 md:p-0 md:block relative z-30 bg-zinc-950/50 md:bg-transparent">
            <BlueprintPoint
              label="Heavyweight"
              value="270 GSM"
              icon={Layers}
              position="md:top-1/4 md:left-[15%]"
              delay={0.3}
              direction="right"
            />
            <BlueprintPoint
              label="Fit Profile"
              value="Boxy Fit"
              icon={Shirt}
              position="md:bottom-1/3 md:right-[15%]"
              delay={0.5}
              direction="left"
            />
            <BlueprintPoint
              label="Stitching"
              value="Double-Needle"
              icon={Ruler}
              position="md:top-20 md:right-[20%]"
              delay={0.4}
              direction="left"
              className="col-span-2 md:col-span-1"
            />
          </div>

          {/* DECORATIVE LINES (Desktop) */}
          <svg
            className="hidden md:block absolute inset-0 w-full h-full pointer-events-none opacity-20"
            xmlns="http://www.w3.org/2000/svg"
          >
            <line
              x1="50%"
              y1="0"
              x2="50%"
              y2="100%"
              stroke="white"
              strokeDasharray="4 4"
            />
            <line
              x1="0"
              y1="50%"
              x2="100%"
              y2="50%"
              stroke="white"
              strokeDasharray="4 4"
            />
            <circle
              cx="50%"
              cy="50%"
              r="200"
              stroke="white"
              fill="none"
              strokeWidth="0.5"
            />
          </svg>
        </Link>
      </div>
    </section>
  );
}

function BlueprintPoint({
  label,
  value,
  icon: Icon,
  position,
  delay,
  direction,
  className,
}: any) {
  return (
    <motion.div
      initial={{ opacity: 0, x: direction === "left" ? 20 : -20 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      transition={{ delay }}
      className={cn(
        "flex items-center gap-4 w-full md:w-auto md:absolute md:max-w-[200px]",
        position,
        className,
      )}
    >
      {/* Line (Desktop Only) */}
      <div
        className={cn(
          "hidden md:block w-12 h-px bg-white/50",
          direction === "left" ? "order-1" : "order-2",
        )}
      />

      <div
        className={cn(
          "bg-zinc-900/90 backdrop-blur-md border border-white/10 p-3 md:p-4 rounded-xl shadow-xl w-full md:w-auto flex flex-col md:block items-center md:items-start text-center md:text-left justify-center md:justify-start",
          direction === "left" ? "md:order-2" : "md:order-1",
        )}
      >
        <div className="flex items-center gap-2 mb-1 md:mb-2">
          <div className="p-1 rounded-md bg-white/10 text-white hidden md:block">
            <Icon className="w-3.5 h-3.5" />
          </div>
          <span className="text-[10px] uppercase tracking-wider text-zinc-400 font-bold">
            {label}
          </span>
        </div>
        <div className="text-lg md:text-xl font-black text-white uppercase italic tracking-tighter leading-none">
          {value}
        </div>
      </div>
    </motion.div>
  );
}
