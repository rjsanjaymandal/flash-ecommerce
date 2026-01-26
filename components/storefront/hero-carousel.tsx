"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence, PanInfo } from "framer-motion";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import FlashImage from "@/components/ui/flash-image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn, formatCurrency } from "@/lib/utils";

import { QuickAddDialog } from "@/components/products/quick-add-dialog";

export interface HeroProduct {
  id: string;
  name: string;
  description: string | null;
  price: number;
  original_price?: number | null;
  main_image_url: string | null;
  slug: string;
  product_stock?: any[];
  color_options?: string[] | null;
  size_options?: string[] | null;
}

interface HeroCarouselProps {
  products: HeroProduct[];
}

function DashIndicators({
  count,
  current,
  onChange,
  duration,
  isActive,
}: {
  count: number;
  current: number;
  onChange: (i: number) => void;
  duration: number;
  isActive: boolean;
}) {
  return (
    <div className="flex gap-2.5">
      {Array.from({ length: count }).map((_, i) => (
        <button
          key={i}
          onClick={() => onChange(i)}
          className="relative h-1 w-8 lg:w-12 bg-white/20 rounded-full overflow-hidden transition-all duration-300"
        >
          {i === current && (
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: isActive ? "0%" : "-100%" }}
              transition={{ duration: duration / 1000, ease: "linear" }}
              className="absolute inset-0 bg-white"
            />
          )}
          {i < current && <div className="absolute inset-0 bg-white" />}
        </button>
      ))}
    </div>
  );
}

export function HeroCarousel({ products }: HeroCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const containerRef = useRef<HTMLElement>(null);
  const DURATION = 6000;

  // Quick Add State
  const [quickAddProduct, setQuickAddProduct] = useState<HeroProduct | null>(
    null,
  );
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);

  const getTagline = (product: HeroProduct) => {
    const taglines = [
      "Level Up Your Aesthetic",
      "Limited Edition Drop",
      "The Future of Streetwear",
      "Engineered for Performance",
      "High Volume Style",
      "Bold. Unfiltered. Authentic.",
      "Summer Collection 2025",
    ];
    const hash = (str: string) => {
      let h = 0;
      for (let i = 0; i < str.length; i++)
        h = (Math.imul(31, h) + str.charCodeAt(i)) | 0;
      return Math.abs(h);
    };
    return taglines[hash(product.id) % taglines.length];
  };

  const handleNext = React.useCallback(() => {
    setDirection(1);
    setCurrentIndex((prev) => (prev + 1) % products.length);
  }, [products.length]);

  const handlePrev = React.useCallback(() => {
    setDirection(-1);
    setCurrentIndex((prev) => (prev - 1 + products.length) % products.length);
  }, [products.length]);

  useEffect(() => {
    if (isPaused || isQuickAddOpen) return;
    const timer = setTimeout(() => {
      handleNext();
    }, DURATION);
    return () => clearTimeout(timer);
  }, [currentIndex, isPaused, isQuickAddOpen, handleNext]);

  // Swipe Handling
  const SWIPE_THRESHOLD = 50;
  const handleDragEnd = (event: any, info: PanInfo) => {
    if (info.offset.x < -SWIPE_THRESHOLD) {
      handleNext();
    } else if (info.offset.x > SWIPE_THRESHOLD) {
      handlePrev();
    }
  };

  if (!products || products.length === 0) {
    return (
      <section className="relative w-full h-[85vh] lg:h-[90vh] bg-background overflow-hidden animate-pulse">
        <div className="absolute inset-x-0 bottom-0 top-0 bg-zinc-100 lg:w-[55%] lg:right-0 lg:left-auto" />
      </section>
    );
  }

  const currentProduct = products[currentIndex];
  if (!currentProduct) return null;

  const handleBuyNow = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setQuickAddProduct(currentProduct);
    setIsQuickAddOpen(true);
    setIsPaused(true);
  };

  const cleanDescription = (html: string) => {
    if (!html) return "";
    return html
      .replace(/<[^>]*>?/gm, "")
      .replace(/&amp;/g, "&")
      .trim();
  };

  return (
    <section
      ref={containerRef}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      className="relative w-full h-[70vh] lg:h-[80vh] bg-zinc-100 dark:bg-zinc-900 overflow-hidden"
    >
      <AnimatePresence initial={false} custom={direction}>
        <motion.div
          key={currentIndex}
          custom={direction}
          initial={{ x: direction > 0 ? "100%" : "-100%", opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: direction > 0 ? "-100%" : "100%", opacity: 0 }}
          transition={{
            x: { type: "spring", stiffness: 300, damping: 30 },
            opacity: { duration: 0.3 },
          }}
          drag="x"
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={0.4}
          onDragEnd={handleDragEnd}
          className="absolute inset-0 w-full h-full cursor-grab active:cursor-grabbing"
        >
          {/* IMAGE LAYER */}
          <div className="absolute inset-0 w-full h-full">
            {currentProduct.main_image_url && (
              <FlashImage
                src={currentProduct.main_image_url}
                alt={currentProduct.name}
                fill
                className="object-cover lg:object-contain bg-zinc-50 dark:bg-zinc-950"
                priority={true}
              />
            )}

            {/* Gradient Overlay for Text Readability */}
            <div className="absolute inset-x-0 bottom-0 h-2/3 bg-linear-to-t from-black/60 lg:from-black/40 to-transparent z-10" />
            <div className="hidden lg:block absolute inset-y-0 left-0 w-1/3 bg-linear-to-r from-black/20 to-transparent z-10" />
          </div>

          {/* CONTENT LAYER */}
          <div className="relative z-20 h-full w-full container mx-auto px-6 lg:px-12 flex flex-col justify-end lg:justify-center pb-16 lg:pb-0">
            <div className="max-w-2xl text-white">
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="mb-4"
              >
                <span className="inline-block bg-primary px-3 py-1 rounded text-[10px] font-black uppercase tracking-widest shadow-lg">
                  New Arrival
                </span>
              </motion.div>

              <div className="min-h-[90px] lg:min-h-[160px] flex flex-col justify-end mb-6">
                <motion.h1
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  className="text-4xl lg:text-7xl xl:text-8xl font-black uppercase italic tracking-tighter leading-[0.85] line-clamp-2 drop-shadow-2xl"
                >
                  {currentProduct.name}
                </motion.h1>
              </div>

              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="flex items-center gap-4 mb-10"
              >
                <div className="h-px w-8 lg:w-16 bg-white/40" />
                <span className="text-sm lg:text-xl text-white/90 font-bold tracking-[0.2em] uppercase whitespace-nowrap overflow-hidden text-ellipsis max-w-[250px] lg:max-w-none">
                  {getTagline(currentProduct)}
                </span>
                <div className="h-px w-8 lg:w-16 bg-white/40" />
              </motion.div>

              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="flex flex-col lg:flex-row lg:items-center gap-6"
              >
                <div className="flex flex-col">
                  <div className="flex items-baseline gap-3">
                    <span className="text-4xl lg:text-6xl font-black">
                      {formatCurrency(currentProduct.price)}
                    </span>
                    {currentProduct.original_price &&
                      currentProduct.original_price > currentProduct.price && (
                        <span className="text-white/40 line-through text-lg lg:text-2xl font-medium">
                          {formatCurrency(currentProduct.original_price)}
                        </span>
                      )}
                  </div>
                  <span className="text-[10px] lg:text-xs font-black uppercase tracking-[0.3em] text-white/50 mt-1">
                    Tax Inclusive // Fast Shipping
                  </span>
                </div>

                <Button
                  size="lg"
                  className="h-16 lg:h-20 px-10 lg:px-16 rounded-full text-lg font-black uppercase tracking-widest bg-white text-black hover:bg-white/90 active:scale-95 transition-all shadow-[0_20px_50px_rgba(0,0,0,0.5)]"
                  onClick={handleBuyNow}
                >
                  Shop the Drop
                </Button>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* NAVIGATION CONTROLS */}
      <div className="absolute inset-x-0 bottom-8 z-30 flex flex-col items-center gap-4">
        <DashIndicators
          count={products.length}
          current={currentIndex}
          onChange={(i) => {
            setDirection(i > currentIndex ? 1 : -1);
            setCurrentIndex(i);
          }}
          duration={DURATION}
          isActive={!isPaused}
        />
      </div>

      {/* DESKTOP ARROWS */}
      <div className="hidden lg:flex absolute inset-y-0 inset-x-4 items-center justify-between z-30 pointer-events-none">
        <Button
          size="icon"
          variant="ghost"
          onClick={handlePrev}
          className="h-14 w-14 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md text-white pointer-events-auto border border-white/10"
        >
          <ChevronLeft className="h-6 w-6" />
        </Button>
        <Button
          size="icon"
          variant="ghost"
          onClick={handleNext}
          className="h-14 w-14 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md text-white pointer-events-auto border border-white/10"
        >
          <ChevronRight className="h-6 w-6" />
        </Button>
      </div>

      {/* Quick Add Dialog */}
      {quickAddProduct && (
        <QuickAddDialog
          product={quickAddProduct}
          open={isQuickAddOpen}
          onOpenChange={(open) => {
            setIsQuickAddOpen(open);
            if (!open) setIsPaused(false);
          }}
          buyNowMode={true}
        />
      )}
    </section>
  );
}
