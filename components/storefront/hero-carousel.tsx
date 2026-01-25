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

function BackgroundAtmosphere({ color }: { color: string }) {
  return (
    <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
      <motion.div
        animate={{
          scale: [1, 1.1, 1],
          opacity: [0.1, 0.2, 0.1],
        }}
        transition={{
          duration: 15,
          repeat: Infinity,
          ease: "linear", // Linear is cheaper than easeInOut for repeat
        }}
        className="absolute -top-[20%] -right-[10%] w-[100%] h-[120%] blur-[150px] rounded-full will-change-transform"
        style={{
          background: `radial-gradient(circle, ${color} 0%, transparent 70%)`,
        }}
      />
      <motion.div
        animate={{
          scale: [1.1, 1, 1.1],
          opacity: [0.05, 0.15, 0.05],
        }}
        transition={{
          duration: 18,
          repeat: Infinity,
          ease: "linear",
        }}
        className="absolute -bottom-[20%] -left-[10%] w-[100%] h-[120%] blur-[150px] rounded-full will-change-transform"
        style={{
          background: `radial-gradient(circle, ${color} 0%, transparent 70%)`,
        }}
      />
    </div>
  );
}

function FloatingAccents({ color }: { color: string }) {
  const [mounted, setMounted] = useState(false);
  const [accents, setAccents] = useState<any[]>([]);

  useEffect(() => {
    const generatedAccents = Array.from({ length: 5 }).map((_, i) => ({
      id: i,
      initialY: Math.random() * 1000,
      animY: [Math.random() * 1000, Math.random() * 1000 - 500],
      animX: [Math.random() * 100, Math.random() * 100 - 50],
      duration: 10 + Math.random() * 10,
      left: `${Math.random() * 100}%`,
    }));
    setAccents(generatedAccents);
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="absolute inset-0 z-10 pointer-events-none overflow-hidden hidden lg:block">
      {accents.map((accent) => (
        <motion.div
          key={accent.id}
          initial={{ opacity: 0, y: accent.initialY }}
          animate={{
            opacity: [0, 0.5, 0],
            y: accent.animY,
            x: accent.animX,
          }}
          transition={{
            duration: accent.duration,
            repeat: Infinity,
            ease: "linear",
          }}
          className="absolute w-px h-24 bg-linear-to-b from-transparent via-current to-transparent"
          style={{
            left: accent.left,
            color: color,
            opacity: 0.2,
          }}
        />
      ))}
    </div>
  );
}

function GrainEffect() {
  return (
    <div
      className="absolute inset-0 z-10 pointer-events-none opacity-[0.05] mix-blend-overlay"
      style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
      }}
    />
  );
}

function ScanLine({ color }: { color: string }) {
  return (
    <motion.div
      animate={{
        top: ["-10%", "110%"],
        opacity: [0, 1, 0],
      }}
      transition={{
        duration: 3,
        repeat: Infinity,
        ease: "linear",
      }}
      className="absolute left-0 right-0 h-[2px] z-20 pointer-events-none blur-[1px]"
      style={{
        background: `linear-gradient(90deg, transparent, ${color}, transparent)`,
        boxShadow: `0 0 15px ${color}`,
      }}
    />
  );
}

function ImageIndicator({
  label,
  value,
  className,
  delay = 0,
  hideOnMobile = true,
}: {
  label: string;
  value: string;
  className?: string;
  delay?: number;
  hideOnMobile?: boolean;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 0.5 + delay, duration: 0.5 }}
      className={cn(
        "absolute z-30 flex flex-col items-start gap-1 pointer-events-none",
        hideOnMobile ? "hidden lg:flex" : "flex",
        className,
      )}
    >
      <div className="flex items-center gap-2">
        <div className="w-1.5 h-1.5 rounded-full bg-primary shadow-[0_0_10px_rgba(var(--primary),0.8)]" />
        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40">
          {label}
        </span>
      </div>
      <span className="text-[10px] lg:text-xs font-bold text-white uppercase ml-3.5">
        {value}
      </span>
    </motion.div>
  );
}

function LiveStatsBadge() {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 1, duration: 0.5 }}
      className="absolute top-4 right-4 lg:top-8 lg:right-8 z-30 flex items-center gap-2 border border-white/10 bg-black/40 hover:bg-black/60 backdrop-blur-md px-4 py-2 rounded-2xl shadow-2xl group cursor-help"
    >
      <span className="relative flex h-2 w-2">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
        <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
      </span>
      <span className="text-[10px] font-black text-white uppercase tracking-[0.2em] flex items-center gap-1.5">
        <Flame className="w-3.5 h-3.5 text-orange-500 fill-orange-500 group-hover:animate-bounce" />
        Live // Trending
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
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 1, duration: 0.5 }}
      className="flex flex-wrap items-center gap-4 sm:gap-6 p-3 rounded-2xl bg-secondary/40 border border-border/40 backdrop-blur-md w-fit"
    >
      {specs.map((Spec, i) => (
        <div
          key={i}
          className="flex items-center gap-2 text-foreground font-medium"
        >
          <Spec.icon className="w-3.5 h-3.5 text-primary drop-shadow-[0_0_8px_rgba(var(--primary),0.5)]" />
          <span className="text-[9px] sm:text-[10px] uppercase font-black tracking-widest leading-none">
            {Spec.label}
          </span>
        </div>
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
    null,
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
    currentProduct.id + currentProduct.name,
  );

  return (
    <section
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={handleMouseLeave}
      className="relative w-full h-[110vh] lg:h-[95vh] bg-background overflow-hidden group perspective-2000 cursor-grab active:cursor-grabbing selection:bg-primary selection:text-white"
    >
      <BackgroundAtmosphere color={dynamicGlowColor} />
      <FloatingAccents color={dynamicGlowColor} />
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
          {/* --- CONTENT SECTION (Mobile: Floating Overlap Card / Desktop: Left Column) --- */}
          <div className="relative z-30 w-full h-[45%] lg:h-full lg:w-[50%] order-2 lg:order-1 flex flex-col justify-end lg:justify-center pointer-events-none pb-12 lg:pb-0 -mt-24 lg:mt-0">
            <div className="flex flex-col justify-center px-4 lg:pl-16 lg:pr-12 xl:pl-24 pointer-events-auto">
              {/* Mobile Glass Card */}
              <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="relative w-full bg-black/70 lg:bg-transparent backdrop-blur-3xl lg:backdrop-blur-none p-8 lg:p-0 rounded-[2.5rem] lg:rounded-none border border-white/20 lg:border-none shadow-[0_40px_80px_rgba(0,0,0,0.6)] lg:shadow-none"
              >
                {/* Subtle Gradient Backlight for Mobile Card */}
                <div className="lg:hidden absolute -top-32 -left-32 w-80 h-80 bg-primary/30 blur-[100px] pointer-events-none" />

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

                <div className="overflow-hidden mb-3 lg:mb-6 max-w-full">
                  <motion.div
                    style={{ x: parallaxX, y: parallaxY }}
                    className="relative px-1"
                  >
                    <motion.h1
                      variants={slideUpVariants}
                      className="text-3xl sm:text-5xl lg:text-5xl xl:text-6xl font-black tracking-tighter leading-[0.95] text-white lg:text-foreground uppercase italic break-words hyphens-auto drop-shadow-[0_4px_20px_rgba(0,0,0,0.8)] lg:drop-shadow-none max-w-[20ch] lg:max-w-md"
                    >
                      {currentProduct.name.split(" ").map((word, i) => (
                        <span
                          key={i}
                          className={cn(
                            "inline-block mr-2 lg:mr-3",
                            i % 2 === 1 &&
                              "text-primary lg:text-primary not-italic tracking-normal",
                          )}
                        >
                          {word}
                        </span>
                      ))}
                    </motion.h1>

                    {/* Floating Accent Text for Desktop */}
                    <div className="hidden lg:block absolute -right-12 top-0 rotate-90 origin-left">
                      <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary/40 whitespace-nowrap">
                        Collection 2026 // Future Lab
                      </span>
                    </div>
                  </motion.div>
                </div>

                <motion.p
                  variants={slideUpVariants}
                  className="hidden lg:block text-sm lg:text-lg text-muted-foreground font-medium mb-6 max-w-md"
                  style={{
                    display: "-webkit-box",
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: "vertical",
                    overflow: "hidden",
                  }}
                >
                  {cleanDescription(currentProduct.description || "")}
                </motion.p>

                <div className="flex items-center justify-between lg:justify-start gap-4 mb-6 lg:mb-8">
                  <motion.div variants={slideUpVariants}>
                    <div className="flex items-baseline gap-3">
                      <span className="text-3xl lg:text-6xl font-black text-primary tracking-tight">
                        {formatCurrency(currentProduct.price)}
                      </span>
                      {currentProduct.original_price &&
                        currentProduct.original_price >
                          currentProduct.price && (
                          <span className="text-xl lg:text-3xl text-white/30 line-through decoration-white/20 font-medium">
                            {formatCurrency(currentProduct.original_price)}
                          </span>
                        )}
                    </div>
                  </motion.div>

                  {/* Mobile "Just Dropped" pill - Enhanced */}
                  <motion.div
                    variants={scaleInVariants}
                    className="lg:hidden flex items-center gap-1.5 bg-primary/20 text-primary border border-primary/30 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest shadow-[0_0_20px_rgba(var(--primary),0.3)]"
                  >
                    <Zap className="w-3 h-3 fill-current" />
                    New Drop
                  </motion.div>
                </div>

                <motion.div
                  variants={slideUpVariants}
                  className="flex flex-row items-center gap-3 w-full"
                >
                  {/* Pulsing Buy Now Button */}
                  <motion.div
                    className="flex-1 lg:flex-none"
                    animate={{ scale: [1, 1.02, 1] }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                  >
                    <Button
                      size="lg"
                      className="w-full lg:w-auto h-14 lg:h-16 px-8 rounded-2xl lg:rounded-full text-base font-black uppercase tracking-widest bg-primary text-primary-foreground hover:scale-105 transition-all duration-300 shadow-2xl shadow-primary/40 group/btn"
                      onClick={handleBuyNow}
                      onPointerDown={(e) => e.stopPropagation()}
                    >
                      <ShoppingBag className="mr-2 h-5 w-5 group-hover/btn:rotate-12 transition-transform" />
                      Buy Now
                    </Button>
                  </motion.div>

                  <Button
                    size="lg"
                    variant="outline"
                    className="h-14 lg:h-16 px-4 lg:px-8 rounded-2xl lg:rounded-full text-sm lg:text-base font-bold uppercase tracking-widest border-white/10 text-white lg:text-foreground lg:border-border hover:bg-white/10 lg:hover:bg-secondary transition-all"
                    asChild
                    onPointerDown={(e) => e.stopPropagation()}
                  >
                    <Link href={`/product/${currentProduct.slug}`}>
                      <span className="hidden lg:inline">Details</span>
                      <ArrowRight className="h-5 w-5 lg:ml-2" />
                    </Link>
                  </Button>
                </motion.div>

                {/* Specs - Visible Always for Premium Feel */}
                <div className="flex mt-6 lg:mt-8">
                  <QuickSpecs />
                </div>
              </motion.div>
            </div>
          </div>

          {/* --- IMAGE SECTION (Mobile: Top / Desktop: Right Column) --- */}
          <motion.div
            className="relative w-full h-[60%] lg:h-full lg:w-[50%] order-1 lg:order-2 overflow-hidden z-20"
            style={{ rotateX: 0, rotateY: 0, perspective: 1000 }} // Disabled expensive mouse-tilt for performance
          >
            {/* Dynamic Background Gradient for Right Column */}
            <div
              className="hidden lg:block absolute inset-0 opacity-20 transition-colors duration-1000"
              style={{
                background: `radial-gradient(circle at center, ${dynamicGlowColor} 0%, transparent 70%)`,
              }}
            />

            {/* Mobile Gradients & Vignette */}
            <div className="lg:hidden absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent z-10 opacity-60" />
            <div className="lg:hidden absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-transparent z-10" />

            {currentProduct.main_image_url && (
              <div className="w-full h-full relative flex items-center justify-center p-4 lg:p-0">
                <LiveStatsBadge />

                {/* Immersive Scan & Detail Indicators */}
                <ScanLine color={dynamicGlowColor} />
                <ImageIndicator
                  label="Fabric Code"
                  value="NANO-X2026"
                  className="top-1/4 left-10 hidden lg:flex"
                />
                <ImageIndicator
                  label="Dye Method"
                  value="Digital Sublimation"
                  className="bottom-1/4 right-10 hidden lg:flex"
                  delay={0.2}
                />

                {/* Spotlight Backlight - Stronger on Desktop Right Column */}
                <div
                  className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] blur-[100px] opacity-20 lg:opacity-40 transition-colors duration-1000"
                  style={{ background: dynamicGlowColor }}
                />

                <Link
                  href={`/product/${currentProduct.slug}`}
                  className="relative w-full h-full block lg:rounded-none rounded-[2.5rem] overflow-hidden"
                >
                  <motion.div
                    initial={{ scale: 1.1, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    whileHover={{ scale: 1.05, rotate: 2 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="relative w-full h-full flex items-center justify-center lg:rounded-none rounded-[2.5rem] overflow-hidden"
                  >
                    <FlashImage
                      src={currentProduct.main_image_url}
                      alt={currentProduct.name}
                      fill
                      resizeMode="cover"
                      priority={true}
                      quality={90}
                      className="object-cover object-center z-10 drop-shadow-[0_20px_50px_rgba(0,0,0,0.5)]"
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
            onPointerDown={(e) => e.stopPropagation()}
            className="h-12 w-12 rounded-full border border-white/10 bg-black/20 text-white hover:bg-white/10 hover:border-white/30 backdrop-blur-md"
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            onClick={handleNext}
            onPointerDown={(e) => e.stopPropagation()}
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
              onPointerDown={(e) => e.stopPropagation()}
              className={cn(
                "relative w-14 h-14 rounded-lg overflow-hidden transition-all duration-300",
                idx === currentIndex
                  ? "opacity-100 scale-110"
                  : "opacity-40 hover:opacity-75 grayscale",
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
