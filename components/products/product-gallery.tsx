"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import FlashImage from "@/components/ui/flash-image";

interface ProductGalleryProps {
  images: string[];
  name: string;
  mainImage: string;
}

export function ProductGallery({
  images,
  name,
  mainImage,
}: ProductGalleryProps) {
  const [activeImage, setActiveImage] = useState(mainImage);
  const [activeIndex, setActiveIndex] = useState(0);

  // Ensure mainImage is in the list if not already
  const allImages = Array.from(new Set([mainImage, ...images])).filter(Boolean);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const scrollLeft = e.currentTarget.scrollLeft;
    const width = e.currentTarget.clientWidth;
    const newIndex = Math.round(scrollLeft / width);
    if (newIndex !== activeIndex) {
      setActiveIndex(newIndex);
      setActiveImage(allImages[newIndex]);
    }
  };

  return (
    <div className="relative">
      {/* Desktop: Mosaic Grid */}
      <div className="hidden lg:grid grid-cols-12 gap-4 lg:sticky lg:top-28">
        {/* Thumbnails Column */}
        <div className="col-span-2 flex flex-col gap-3 h-[600px] overflow-y-auto pr-1 scrollbar-hide">
          {allImages.map((img, i) => (
            <button
              key={i}
              onClick={() => setActiveImage(img)}
              className={cn(
                "aspect-[3/4] rounded-lg overflow-hidden border transition-all duration-300 relative group",
                activeImage === img
                  ? "ring-2 ring-primary border-transparent opacity-100 scale-100"
                  : "border-transparent opacity-60 hover:opacity-100 scale-95 hover:scale-100",
              )}
            >
              <div className="relative w-full h-full">
                <FlashImage
                  src={img}
                  alt={`View ${i + 1}`}
                  fill
                  className="object-cover"
                  sizes="100px"
                />
              </div>
              {activeImage === img && (
                <div className="absolute inset-0 bg-primary/10" />
              )}
            </button>
          ))}
        </div>

        {/* Main Image */}
        <div className="col-span-10">
          <div className="aspect-[3/4] w-full overflow-hidden rounded-2xl bg-muted/20 border border-border/50 shadow-sm relative group cursor-zoom-in">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeImage}
                initial={{ opacity: 0, scale: 1.05 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
                className="h-full w-full relative"
              >
                <FlashImage
                  src={activeImage}
                  alt={name}
                  fill
                  priority
                  className="object-cover transition-all duration-500 scale-100 group-hover:scale-105"
                  sizes="(max-width: 1024px) 100vw, 600px"
                />
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Mobile: Full Width Swipeable Carousel */}
      <div className="lg:hidden w-full relative group">
        <div
          className="flex overflow-x-auto snap-x snap-mandatory scrollbar-hide"
          onScroll={handleScroll}
        >
          {allImages.map((img, i) => (
            <div
              key={i}
              className="snap-center shrink-0 w-full aspect-[4/5] relative bg-neutral-100"
            >
              <FlashImage
                src={img}
                alt={`${name} view ${i + 1}`}
                fill
                className="object-cover"
                priority={i === 0}
                sizes="100vw"
              />
            </div>
          ))}
        </div>

        {/* Minimal Dots Indicator */}
        <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2 z-10 pointer-events-none">
          {allImages.map((_, i) => (
            <div
              key={i}
              className={cn(
                "w-1.5 h-1.5 rounded-full transition-all duration-300 shadow-sm",
                i === activeIndex ? "bg-white scale-110" : "bg-white/40",
              )}
            />
          ))}
        </div>

        {/* Count Badge (Subtle) */}
        <div className="absolute top-4 right-4 bg-black/40 text-white text-[9px] px-2 py-1 rounded-sm backdrop-blur-sm font-medium tracking-widest uppercase">
          {allImages.indexOf(activeImage) + 1 || 1} / {allImages.length}
        </div>
      </div>
    </div>
  );
}
