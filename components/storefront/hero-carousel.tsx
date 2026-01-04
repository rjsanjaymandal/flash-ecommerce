"use client";

import { useState, useEffect, useRef } from "react";
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
  Gift,
  Zap,
  ShieldCheck,
  Truck,
  Flame,
} from "lucide-react";
import { cn, formatCurrency } from "@/lib/utils";
import { useCartStore } from "@/store/use-cart-store";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useRealTimeStock } from "@/hooks/use-real-time-stock";

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

import { QuickAddDialog } from "@/components/products/quick-add-dialog";

// Text Reveal Variant
const glitchVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: "circOut",
    },
  },
};

// Generate a deterministic color from string (for dynamic glow)
const stringToColor = (str: string) => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  const c = (hash & 0x00ffffff).toString(16).toUpperCase();
  return "#" + "00000".substring(0, 6 - c.length) + c;
};

// Stats Badge Component
function LiveStatsBadge() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="absolute top-6 right-6 lg:right-auto lg:left-6 z-20 flex items-center gap-2 bg-black/40 backdrop-blur-md border border-white/10 px-3 py-1.5 rounded-full"
    >
      <span className="relative flex h-2 w-2">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
        <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
      </span>
      <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1">
        <Flame className="w-3 h-3 text-red-500 fill-red-500" />
        Selling Fast
      </span>
    </motion.div>
  );
}

// Quick Specs Component
function QuickSpecs() {
  const specs = [
    { icon: ShieldCheck, label: "Premium" },
    { icon: Zap, label: "New Arrival" },
    { icon: Truck, label: "Fast Ship" },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.8 }}
      className="hidden sm:flex items-center gap-6 mt-8 p-4 rounded-2xl bg-white/5 border border-white/5 backdrop-blur-sm w-fit"
    >
      {specs.map((Spec, i) => (
        <div
          key={i}
          className="flex items-center gap-2 text-muted-foreground/80"
        >
          <Spec.icon className="w-4 h-4" />
          <span className="text-xs font-medium uppercase tracking-wider">
            {Spec.label}
          </span>
        </div>
      ))}
    </motion.div>
  );
}

// Internal Progress Ring Component
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
          strokeOpacity="0.2"
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
  const [isHolding, setIsHolding] = useState(false); // Mobile hold state
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLElement>(null);
  const router = useRouter();

  const DURATION = 6000;

  // 3D Tilt Values
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotateX = useTransform(y, [-0.5, 0.5], [5, -5]);
  const rotateY = useTransform(x, [-0.5, 0.5], [-5, 5]);

  // Quick Add State
  const [quickAddProduct, setQuickAddProduct] = useState<HeroProduct | null>(
    null
  );
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);

  // Mouse Parallax & Tilt Logic
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!containerRef.current) return;
    const { left, top, width, height } =
      containerRef.current.getBoundingClientRect();
    const posX = (e.clientX - left) / width - 0.5;
    const posY = (e.clientY - top) / height - 0.5;
    setMousePosition({ x: posX, y: posY });
    x.set(posX);
    y.set(posY);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
    setMousePosition({ x: 0, y: 0 });
    setIsPaused(false);
  };

  // Efficient Auto-scroll using setTimeout instead of setInterval state loop
  useEffect(() => {
    if (isPaused || isHolding || isQuickAddOpen) return;

    const timer = setTimeout(() => {
      handleNext();
    }, DURATION);

    return () => clearTimeout(timer);
  }, [currentIndex, isPaused, isHolding, isQuickAddOpen]);

  // Touch Handlers for "Hold to Pause"
  const handleTouchStart = () => setIsHolding(true);
  const handleTouchEnd = () => setIsHolding(false);

  const handleNext = () => {
    setDirection(1);
    setCurrentIndex((prev) => (prev + 1) % products.length);
  };

  const handlePrev = () => {
    setDirection(-1);
    setCurrentIndex((prev) => (prev - 1 + products.length) % products.length);
  };

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
    setIsPaused(true); // Explicitly pause
  };

  const cleanDescription = (html: string) => {
    if (!html) return "";
    return html
      .replace(/<[^>]*>?/gm, "")
      .replace(/&amp;/g, "&")
      .trim();
  };

  const calculateGlowColor = () => {
    if (!currentProduct) return "#ffffff";
    return stringToColor(currentProduct.id + currentProduct.name);
  };
  const dynamicGlowColor = calculateGlowColor();

  return (
    <section
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={handleMouseLeave}
      className="relative w-full h-[85vh] lg:h-[90vh] bg-background overflow-hidden group perspective-1000 cursor-grab active:cursor-grabbing selection:bg-primary selection:text-white"
    >
      <AnimatePresence initial={false} custom={direction} mode="popLayout">
        <motion.div
          key={currentIndex}
          custom={direction}
          initial={{
            x: direction > 0 ? "100%" : "-100%",
            opacity: 0,
            filter: "blur(10px)",
          }}
          animate={{ x: 0, opacity: 1, filter: "blur(0px)" }}
          exit={{
            x: direction > 0 ? "-20%" : "20%",
            opacity: 0,
            filter: "blur(10px)",
            transition: { duration: 0.5 },
          }}
          transition={{
            x: { type: "spring", stiffness: 200, damping: 25 },
            opacity: { duration: 0.4 },
          }}
          drag="x"
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={1}
          onDragEnd={handleDragEnd}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          className="absolute inset-0 flex flex-col lg:flex-row touch-pan-y"
        >
          {/* TEXT SECTION */}
          <div className="relative z-20 w-full lg:w-[45%] h-full flex flex-col justify-end lg:justify-center px-6 pb-32 pt-12 lg:py-12 lg:px-16 xl:px-20 bg-transparent lg:bg-none pointer-events-none lg:pointer-events-auto">
            {/* Mobile Gradient Overlay for Readability */}
            <div className="absolute inset-x-0 bottom-0 h-[70vh] bg-gradient-to-t from-background via-background/60 to-transparent lg:hidden -z-10" />

            <BrandGlow
              className="top-1/2 left-0 -translate-y-1/2 opacity-20 transition-colors duration-1000"
              style={{
                background: `radial-gradient(circle, ${dynamicGlowColor}33 0%, transparent 70%)`,
              }}
              size="lg"
            />

            <motion.div
              className="space-y-3 lg:space-y-6 relative max-w-xl pointer-events-auto"
              animate={{
                x: mousePosition.x * 20,
                y: mousePosition.y * 20,
              }}
              transition={{ type: "spring", stiffness: 50, damping: 20 }}
            >
              <div className="overflow-hidden">
                <motion.div
                  initial={{ y: "100%" }}
                  animate={{ y: 0 }}
                  transition={{
                    delay: 0.1,
                    duration: 0.6,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                >
                  <BrandBadge
                    variant="primary"
                    className="mb-3 lg:mb-4 shadow-lg shadow-primary/20"
                  >
                    <span className="flex items-center gap-1.5">
                      JUST DROPPED
                    </span>
                  </BrandBadge>
                </motion.div>
              </div>

              <div className="overflow-hidden">
                <motion.h1
                  key={currentProduct.name}
                  variants={glitchVariants}
                  initial="hidden"
                  animate="visible"
                  className="text-5xl lg:text-7xl font-black tracking-tighter leading-[0.9] text-foreground uppercase italic line-clamp-2 lg:line-clamp-3 drop-shadow-lg lg:drop-shadow-none"
                  style={{ textShadow: `0 0 30px ${dynamicGlowColor}44` }}
                >
                  {currentProduct.name}
                </motion.h1>
              </div>

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4, duration: 0.8 }}
                className="text-sm lg:text-lg text-muted-foreground font-medium line-clamp-2 leading-relaxed"
              >
                {cleanDescription(currentProduct.description)}
              </motion.p>

              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5, duration: 0.4 }}
                className="flex items-baseline gap-4"
              >
                <span className="text-4xl lg:text-5xl font-black text-primary drop-shadow-md">
                  {formatCurrency(currentProduct.price)}
                </span>
              </motion.div>

              <div className="flex flex-row items-center gap-3 pt-4">
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.6 }}
                  className="w-full sm:w-auto"
                >
                  <Button
                    size="lg"
                    className="w-full sm:w-auto h-14 sm:h-16 px-6 sm:px-10 rounded-2xl text-base sm:text-lg font-black uppercase tracking-widest gradient-primary shadow-2xl shadow-primary/30 hover:scale-105 active:scale-95 transition-all duration-300 relative overflow-hidden group/btn"
                    onClick={handleBuyNow}
                  >
                    <span className="absolute inset-0 bg-white/20 translate-y-full group-hover/btn:translate-y-0 transition-transform duration-300" />
                    <ShoppingBag className="mr-2 sm:mr-3 h-5 w-5" />
                    Buy Now
                  </Button>
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.7 }}
                  className="hidden sm:block"
                >
                  <Button
                    size="lg"
                    variant="outline"
                    className="flex-1 sm:flex-none h-14 sm:h-16 px-6 sm:px-10 rounded-2xl text-base sm:text-lg font-black uppercase tracking-widest border-2 hover:bg-secondary transition-all bg-background/50 backdrop-blur-md"
                    asChild
                  >
                    <Link
                      href={`/product/${currentProduct.slug}`}
                      className="flex items-center justify-center gap-2"
                    >
                      Details <ArrowRight className="h-5 w-5" />
                    </Link>
                  </Button>
                </motion.div>
              </div>

              {/* Quick Specs Micro-Grid (New) */}
              <QuickSpecs />
            </motion.div>
          </div>

          {/* IMAGE SECTION */}
          <motion.div
            className="absolute inset-0 lg:relative w-full lg:w-[55%] h-full overflow-hidden z-0"
            style={{ rotateX, rotateY, perspective: 1000 }}
          >
            {currentProduct.main_image_url ? (
              <div className="w-full h-full relative flex items-center justify-center">
                {/* Live Stats Badge (New) */}
                <LiveStatsBadge />

                {/* CLEANER SPOTLIGHT EFFECT (Replaces heavy blur) */}
                {/* 1. Large soft ambient glow */}
                <div
                  className="absolute inset-0 opacity-20 transition-colors duration-1000"
                  style={{
                    background: `radial-gradient(circle at center, ${dynamicGlowColor}, transparent 70%)`,
                  }}
                />

                {/* 2. Spotlight behind image */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-[80%] bg-white/5 blur-3xl rounded-full" />

                <Link
                  href={`/product/${currentProduct.slug}`}
                  className="relative w-full h-full block"
                >
                  <motion.div
                    initial={{ scale: 1.1, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.8 }}
                    className="relative w-full h-full p-4 lg:p-0"
                  >
                    <FlashImage
                      src={currentProduct.main_image_url}
                      alt={currentProduct.name}
                      fill
                      priority={true}
                      quality={90}
                      className="object-contain object-center z-10 drop-shadow-2xl"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 1400px"
                    />
                  </motion.div>
                </Link>
              </div>
            ) : null}
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent lg:hidden z-20" />
            <div className="hidden lg:block absolute inset-0 bg-gradient-to-r from-background via-transparent to-transparent opacity-80 z-20" />
          </motion.div>
        </motion.div>
      </AnimatePresence>

      {/* Mobile Progress Bar */}
      <div className="lg:hidden absolute bottom-0 left-0 right-0 h-1 bg-white/10 z-50">
        <motion.div
          key={currentIndex}
          initial={{ width: "0%" }}
          animate={{ width: isPaused || isHolding ? "auto" : "100%" }}
          transition={{ duration: DURATION / 1000, ease: "linear" }}
          className="h-full bg-primary"
          style={{
            backgroundColor: isHolding ? dynamicGlowColor : undefined,
          }}
        />
      </div>

      {/* Desktop Thumbnails */}
      <div className="hidden lg:flex absolute bottom-12 right-12 z-40 gap-4">
        {products.map((p, idx) => (
          <button
            key={p.id}
            onClick={() => {
              setDirection(idx > currentIndex ? 1 : -1);
              setCurrentIndex(idx);
            }}
            className={cn(
              "relative w-16 h-16 rounded-xl overflow-hidden border-2 transition-all duration-300 group/thumb",
              idx === currentIndex
                ? "border-primary shadow-lg shadow-primary/40 scale-110"
                : "border-white/20 opacity-70 hover:opacity-100"
            )}
          >
            {idx === currentIndex && (
              <div className="absolute inset-0 z-10 bg-black/20 backdrop-blur-[1px] flex items-center justify-center">
                <ProgressRing
                  radius={28}
                  stroke={3}
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
                sizes="64px"
              />
            )}
          </button>
        ))}
      </div>

      {/* Navigation Arrows */}
      <div className="hidden lg:flex absolute bottom-12 left-1/2 -translate-x-1/2 gap-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-50">
        <Button
          size="icon"
          variant="outline"
          className="rounded-full h-12 w-12 border-2 bg-background/50 hover:bg-background"
          onClick={handlePrev}
        >
          <ChevronLeft className="h-6 w-6" />
        </Button>
        <Button
          size="icon"
          variant="outline"
          className="rounded-full h-12 w-12 border-2 bg-background/50 hover:bg-background"
          onClick={handleNext}
        >
          <ChevronRight className="h-6 w-6" />
        </Button>
      </div>

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
