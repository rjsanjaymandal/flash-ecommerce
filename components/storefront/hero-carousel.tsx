"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  motion,
  AnimatePresence,
  PanInfo,
  useMotionValue,
  useTransform,
  Variants,
} from "framer-motion";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { BrandBadge } from "./brand-badge";
import { BrandGlow } from "./brand-glow";
import FlashImage from "@/components/ui/flash-image";
import {
  ChevronLeft,
  ChevronRight,
  ShoppingBag,
  ArrowRight,
  Zap,
  ShieldCheck,
  Truck,
  Flame,
} from "lucide-react";
import { cn, formatCurrency } from "@/lib/utils";

import { QuickAddDialog } from "@/components/products/quick-add-dialog";

interface HeroProduct {
  id: string;
  name: string;
  description: string;
  price: number;
  main_image_url: string | null;
  slug: string;
  product_stock?: any[];
}

interface HeroCarouselProps {
  products: HeroProduct[];
}

// --- ANIMATION VARIANTS ---

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

const slideUpVariants: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: [0.22, 1, 0.36, 1],
    },
  },
};

const scaleInVariants: Variants = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.5,
      ease: "backOut",
    },
  },
};

// --- UTILS ---

const stringToColor = (str: string) => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  const c = (hash & 0x00ffffff).toString(16).toUpperCase();
  return "#" + "00000".substring(0, 6 - c.length) + c;
};

// --- SUB-COMPONENTS ---

function GrainEffect() {
  return (
    <div
      className="absolute inset-0 z-0 pointer-events-none opacity-[0.03] mix-blend-overlay"
      style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
      }}
    />
  );
}

function LiveStatsBadge() {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 1, duration: 0.5 }}
      className="absolute top-4 right-4 lg:top-8 lg:left-auto lg:right-8 z-30 flex items-center gap-2 bg-black/60 backdrop-blur-md border border-white/10 px-3 py-1.5 rounded-full shadow-2xl"
    >
      <span className="relative flex h-2 w-2">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
        <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
      </span>
      <span className="text-[10px] lg:text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1">
        <Flame className="w-3 h-3 text-red-500 fill-red-500" />
        Trending Now
      </span>
    </motion.div>
  );
}

function QuickSpecs() {
  const specs = [
    { icon: ShieldCheck, label: "Premium" },
    { icon: Zap, label: "New Arrival" },
    { icon: Truck, label: "Fast Ship" },
  ];

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="hidden sm:flex items-center gap-6 p-3 rounded-2xl bg-secondary/40 border border-border/40 backdrop-blur-md w-fit"
    >
      {specs.map((Spec, i) => (
        <motion.div
          key={i}
          variants={slideUpVariants}
          className="flex items-center gap-2 text-foreground font-medium"
        >
          <Spec.icon className="w-4 h-4 text-primary" />
          <span className="text-[10px] uppercase font-bold tracking-widest">
            {Spec.label}
          </span>
        </motion.div>
      ))}
    </motion.div>
  );
}

function ProgressRing({
  radius,
  stroke,
  isActive,
  duration,
}: {
  radius: number;
  stroke: number;
  isActive: boolean;
  duration: number;
}) {
  const normalizedRadius = radius - stroke * 2;
  const circumference = normalizedRadius * 2 * Math.PI;

  return (
    <div className="relative flex items-center justify-center">
      <svg height={radius * 2} width={radius * 2} className="rotate-[-90deg]">
        <circle
          stroke="white"
          strokeOpacity="0.1"
          strokeWidth={stroke}
          fill="transparent"
          r={normalizedRadius}
          cx={radius}
          cy={radius}
        />
        {isActive && (
          <motion.circle
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: 0 }}
            transition={{ duration: duration / 1000, ease: "linear" }}
            stroke="white"
            strokeWidth={stroke}
            strokeDasharray={circumference + " " + circumference}
            strokeLinecap="round"
            fill="transparent"
            r={normalizedRadius}
            cx={radius}
            cy={radius}
          />
        )}
      </svg>
    </div>
  );
}

export function HeroCarousel({ products }: HeroCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isHolding, setIsHolding] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  const containerRef = useRef<HTMLElement>(null);
  const rectRef = useRef<{
    width: number;
    height: number;
    left: number;
    top: number;
  } | null>(null);
  const DURATION = 6000;

  // 3D Tilt Values
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotateX = useTransform(y, [-0.5, 0.5], [3, -3]);
  const rotateY = useTransform(x, [-0.5, 0.5], [-3, 3]);

  // Parallax for Text
  const parallaxX = useTransform(x, [-0.5, 0.5], [-20, 20]);
  const parallaxY = useTransform(y, [-0.5, 0.5], [-20, 20]);

  // Quick Add State
  const [quickAddProduct, setQuickAddProduct] = useState<HeroProduct | null>(
    null
  );
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);

  // Measure dimensions on mount and resize
  useEffect(() => {
    const updateRect = () => {
      if (containerRef.current) {
        const { width, height, left, top } =
          containerRef.current.getBoundingClientRect();
        // Store absolute position relative to document
        rectRef.current = {
          width,
          height,
          left: left + window.scrollX,
          top: top + window.scrollY,
        };
      }
    };

    updateRect();
    window.addEventListener("resize", updateRect);
    // Also update on scroll to catch sticky header shifts if valid,
    // though usually hero is static at top.
    // For now, resize is the main layout changer.

    return () => window.removeEventListener("resize", updateRect);
  }, []);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!rectRef.current) return;

    // Use page coordinates (client + scroll) vs cached absolute position
    // This avoids querying DOM layout in the loop
    const pageX = e.clientX + window.scrollX;
    const pageY = e.clientY + window.scrollY;

    const { left, top, width, height } = rectRef.current;

    const posX = (pageX - left) / width - 0.5;
    const posY = (pageY - top) / height - 0.5;

    x.set(posX);
    y.set(posY);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
    setIsPaused(false);
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
    if (isPaused || isHolding || isQuickAddOpen) return;
    const timer = setTimeout(() => {
      handleNext();
    }, DURATION);
    return () => clearTimeout(timer);
  }, [currentIndex, isPaused, isHolding, isQuickAddOpen, handleNext]);

  const handleTouchStart = () => setIsHolding(true);
  const handleTouchEnd = () => setIsHolding(false);

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

  const dynamicGlowColor = stringToColor(
    currentProduct.id + currentProduct.name
  );

  return (
    <section
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={handleMouseLeave}
      className="relative w-full h-[90vh] lg:h-[95vh] bg-background overflow-hidden group perspective-1000 cursor-grab active:cursor-grabbing selection:bg-primary selection:text-white"
    >
      <GrainEffect />

      <AnimatePresence initial={false} custom={direction} mode="popLayout">
        <motion.div
          key={currentIndex}
          custom={direction}
          initial={{ opacity: 0, x: direction > 0 ? 100 : -100 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{
            x: { type: "spring", stiffness: 300, damping: 30 },
            opacity: { duration: 0.4 },
          }}
          drag="x"
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={0.2}
          onDragEnd={handleDragEnd}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          className="absolute inset-0 flex flex-col lg:flex-row touch-pan-y"
        >
          {/* --- CONTENT SECTION (Mobile: Bottom Sheet / Desktop: Left Column) --- */}
          <div className="relative z-20 w-full h-[35%] lg:h-full lg:w-[50%] order-2 lg:order-1 flex flex-col justify-start lg:justify-center bg-background/80 backdrop-blur-xl border-t border-white/10 lg:bg-background lg:backdrop-blur-none lg:border-none lg:border-r lg:border-border/50 shadow-[0_-10px_40px_rgba(0,0,0,0.2)] lg:shadow-none pointer-events-auto">
            <div className="h-full flex flex-col justify-center px-6 lg:pl-16 lg:pr-12 xl:pl-24 pointer-events-auto lg:pt-32">
              {/* Content Container */}
              <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                style={{ x: parallaxX, y: parallaxY }} // Parallax mainly for desktop feel
                className="relative w-full"
              >
                <motion.div
                  variants={slideUpVariants}
                  className="hidden lg:block"
                >
                  <BrandBadge
                    variant="outline"
                    className="mb-6 border-border/40 bg-secondary/50 text-foreground"
                  >
                    <span className="flex items-center gap-1.5 font-bold tracking-wider">
                      Just Dropped
                    </span>
                  </BrandBadge>
                </motion.div>

                <div className="overflow-hidden mb-2 lg:mb-6">
                  <motion.h1
                    variants={slideUpVariants}
                    className="text-2xl sm:text-5xl lg:text-5xl xl:text-6xl font-black tracking-tighter leading-none text-foreground uppercase italic line-clamp-2"
                  >
                    {currentProduct.name}
                  </motion.h1>
                </div>

                <motion.p
                  variants={slideUpVariants}
                  className="hidden lg:block text-sm lg:text-lg text-muted-foreground font-medium mb-8 max-w-md"
                  style={{
                    display: "-webkit-box",
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: "vertical",
                    overflow: "hidden",
                  }}
                >
                  {cleanDescription(currentProduct.description)}
                </motion.p>

                <div className="flex items-center justify-between lg:justify-start gap-4 mb-4 lg:mb-10">
                  <motion.div variants={slideUpVariants}>
                    <span className="text-2xl lg:text-6xl font-black text-primary tracking-tight">
                      {formatCurrency(currentProduct.price)}
                    </span>
                  </motion.div>

                  {/* Mobile "Just Dropped" pill */}
                  <div className="lg:hidden text-[10px] font-bold uppercase tracking-widest text-muted-foreground border border-border px-2 py-1 rounded-full">
                    New Arrival
                  </div>
                </div>

                <motion.div
                  variants={slideUpVariants}
                  className="flex flex-row items-center gap-3 w-full"
                >
                  <Button
                    size="lg"
                    className="flex-1 lg:flex-none h-12 lg:h-14 px-8 rounded-full text-sm lg:text-base font-bold uppercase tracking-widest bg-primary text-primary-foreground hover:scale-105 transition-all duration-300 shadow-xl shadow-primary/20"
                    onClick={handleBuyNow}
                  >
                    <ShoppingBag className="mr-2 h-4 w-4" />
                    Buy Now
                  </Button>
                  <Button
                    size="lg"
                    variant="outline"
                    className="h-12 lg:h-14 px-4 lg:px-8 rounded-full text-sm lg:text-base font-bold uppercase tracking-widest border-border text-foreground hover:bg-secondary transition-all"
                    asChild
                  >
                    <Link href={`/product/${currentProduct.slug}`}>
                      <span className="hidden lg:inline">View Details</span>
                      <ArrowRight className="h-5 w-5 lg:ml-2" />
                    </Link>
                  </Button>
                </motion.div>

                {/* Specs - Dark text on desktop now */}
                <div className="hidden lg:flex mt-10">
                  <QuickSpecs />
                </div>
              </motion.div>
            </div>
          </div>

          {/* --- IMAGE SECTION (Mobile: Top / Desktop: Right Column) --- */}
          <motion.div
            className="relative w-full h-[65%] lg:h-full lg:w-[50%] order-1 lg:order-2 overflow-hidden z-0"
            style={{ rotateX, rotateY, perspective: 1000 }}
          >
            {/* Dynamic Background Gradient for Right Column */}
            <div
              className="hidden lg:block absolute inset-0 opacity-20 transition-colors duration-1000"
              style={{
                background: `radial-gradient(circle at center, ${dynamicGlowColor} 0%, transparent 70%)`,
              }}
            />

            {/* Mobile Gradients */}
            <div className="lg:hidden absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent z-10 opacity-20" />

            {currentProduct.main_image_url && (
              <div className="w-full h-full relative flex items-center justify-center p-4 lg:p-0">
                <LiveStatsBadge />

                {/* Spotlight Backlight - Stronger on Desktop Right Column */}
                <div
                  className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] blur-[100px] opacity-20 lg:opacity-40 transition-colors duration-1000"
                  style={{ background: dynamicGlowColor }}
                />

                <Link
                  href={`/product/${currentProduct.slug}`}
                  className="relative w-full h-full block"
                >
                  <motion.div
                    initial={{ scale: 1.1, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    whileHover={{ scale: 1.05, rotate: 2 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="relative w-full h-full flex items-center justify-center"
                  >
                    <FlashImage
                      src={currentProduct.main_image_url}
                      alt={currentProduct.name}
                      fill
                      priority={true}
                      quality={90}
                      className="object-contain object-center z-10 drop-shadow-[0_20px_50px_rgba(0,0,0,0.5)]"
                      sizes="(max-width: 768px) 100vw, 60vw"
                    />
                  </motion.div>
                </Link>
              </div>
            )}
          </motion.div>
        </motion.div>
      </AnimatePresence>

      {/* --- CONTROLS --- */}

      {/* Mobile Progress Bar (Top or Bottom? - Let's keep bottom but sleek) */}
      <div className="lg:hidden absolute bottom-0 left-0 right-0 h-1 bg-white/10 z-50">
        <motion.div
          key={currentIndex}
          initial={{ width: "0%" }}
          animate={{ width: isPaused || isHolding ? "auto" : "100%" }}
          transition={{ duration: DURATION / 1000, ease: "linear" }}
          className="h-full bg-white"
        />
      </div>

      {/* Desktop Navigation & Thumbnails */}
      <div className="hidden lg:flex absolute bottom-12 right-12 z-40 items-end gap-6">
        {/* Arrows */}
        <div className="flex gap-2 mb-2">
          <Button
            size="icon"
            variant="ghost"
            onClick={handlePrev}
            className="h-12 w-12 rounded-full border border-white/10 bg-black/20 text-white hover:bg-white/10 hover:border-white/30 backdrop-blur-md"
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            onClick={handleNext}
            className="h-12 w-12 rounded-full border border-white/10 bg-black/20 text-white hover:bg-white/10 hover:border-white/30 backdrop-blur-md"
          >
            <ChevronRight className="h-5 w-5" />
          </Button>
        </div>

        {/* Thumbnails */}
        <div className="flex gap-4 p-2 bg-black/20 backdrop-blur-xl rounded-2xl border border-white/5">
          {products.map((p, idx) => (
            <button
              key={p.id}
              onClick={() => {
                setDirection(idx > currentIndex ? 1 : -1);
                setCurrentIndex(idx);
              }}
              className={cn(
                "relative w-14 h-14 rounded-lg overflow-hidden transition-all duration-300",
                idx === currentIndex
                  ? "opacity-100 scale-110"
                  : "opacity-40 hover:opacity-75 grayscale"
              )}
            >
              {idx === currentIndex && (
                <div className="absolute inset-0 z-20 flex items-center justify-center">
                  <ProgressRing
                    radius={28}
                    stroke={2}
                    isActive={!isPaused && !isHolding}
                    duration={DURATION}
                  />
                </div>
              )}
              {p.main_image_url && (
                <FlashImage
                  src={p.main_image_url}
                  alt={p.name}
                  fill
                  className="object-cover"
                  sizes="56px"
                />
              )}
            </button>
          ))}
        </div>
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
