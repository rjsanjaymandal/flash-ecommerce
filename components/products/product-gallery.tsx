"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import FlashImage from "@/components/ui/flash-image";
import { AdaptiveImageContainer } from "@/components/ui/adaptive-image-container";
import { ChevronLeft, ChevronRight } from "lucide-react";

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
  const [activeIndex, setActiveIndex] = useState(0);

  // Ensure mainImage is in the list if not already
  const allImages = Array.from(new Set([mainImage, ...images])).filter(Boolean);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const scrollLeft = e.currentTarget.scrollLeft;
    const width = e.currentTarget.clientWidth;
    // 2-up index tracking (w-1/2 items)
    const newIndex = Math.round(scrollLeft / (width / 2));
    // We update activeIndex but we want to know the *first visible* index mostly for dots
    // The screenshot shows a strip of thumbnails, so we track which ones are in view.
    if (newIndex !== activeIndex) {
      setActiveIndex(newIndex);
    }
  };

  const scrollContainer = (direction: "left" | "right") => {
    const container = document.getElementById("gallery-container");
    if (container) {
      const width = container.clientWidth;
      const scrollAmount = width / 2; // Scroll by one image width (50%)
      container.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  return (
    <div className="relative w-full">
      {/* Desktop: Dual-Pane Hero (Two-Up) with Floating Controls */}
      <div className="hidden lg:flex w-full h-[85vh] relative group">
        <div
          id="gallery-container"
          className="flex w-full h-full overflow-x-auto snap-x snap-mandatory scrollbar-hide"
          onScroll={handleScroll}
        >
          {allImages.map((img, i) => (
            <AdaptiveImageContainer
              key={i}
              imageUrl={img}
              className="snap-start shrink-0 w-1/2 h-full flex items-center justify-center p-12 border-r border-black/5 last:border-0"
            >
              <div className="relative w-full h-full max-h-[85vh]">
                <FlashImage
                  src={img}
                  alt={`${name} view ${i + 1}`}
                  fill
                  className="object-contain mix-blend-multiply [mask-image:radial-gradient(circle,black_85%,transparent_100%)]"
                  priority={i < 2} // Prioritize first two
                  sizes="50vw"
                />
              </div>
            </AdaptiveImageContainer>
          ))}
        </div>

        {/* Floating Control Deck (Bottom Right) */}
        <div className="absolute bottom-8 right-8 z-30 flex items-center gap-4">
          {/* Thumbnail Strip */}
          <div className="flex items-center gap-2 bg-white/80 backdrop-blur-md p-2 rounded-sm shadow-sm border border-black/5">
            {allImages.map((img, i) => (
              <button
                key={i}
                onClick={() => {
                  const container =
                    document.getElementById("gallery-container");
                  if (container) {
                    const width = container.clientWidth;
                    container.scrollTo({
                      left: i * (width / 2),
                      behavior: "smooth",
                    });
                  }
                }}
                className={cn(
                  "relative w-10 h-12 overflow-hidden transition-all duration-300 border",
                  // Simple active logic range
                  i === activeIndex || i === activeIndex + 1
                    ? "border-black opacity-100 ring-1 ring-black"
                    : "border-transparent opacity-50 hover:opacity-100 hover:border-black/20",
                )}
              >
                <FlashImage
                  src={img}
                  alt={`Thumb ${i}`}
                  fill
                  className="object-cover"
                  sizes="40px"
                />
              </button>
            ))}
          </div>

          {/* Navigation Arrows */}
          <div className="flex items-center gap-1 bg-white/80 backdrop-blur-md p-1 rounded-sm shadow-sm border border-black/5 h-[66px]">
            {" "}
            {/* Match height approx */}
            <button
              onClick={() => scrollContainer("left")}
              className="w-8 h-full flex items-center justify-center hover:bg-black/5 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <div className="w-[1px] h-8 bg-black/10" />
            <button
              onClick={() => scrollContainer("right")}
              className="w-8 h-full flex items-center justify-center hover:bg-black/5 transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile: Swipeable Carousel (Full Width - 1 Up) */}
      <div className="lg:hidden w-full h-[60vh] relative group">
        <div
          className="flex w-full h-full overflow-x-auto snap-x snap-mandatory scrollbar-hide items-center"
          onScroll={(e) => {
            const scrollLeft = e.currentTarget.scrollLeft;
            const width = e.currentTarget.clientWidth;
            const newIndex = Math.round(scrollLeft / width);
            setActiveIndex(newIndex);
          }}
        >
          {allImages.map((img, i) => (
            <AdaptiveImageContainer
              key={i}
              imageUrl={img}
              className="snap-center shrink-0 w-full h-full flex items-center justify-center p-6"
            >
              <div className="relative w-full h-full max-h-[60vh]">
                <FlashImage
                  src={img}
                  alt={`${name} view ${i + 1}`}
                  fill
                  className="object-contain mix-blend-multiply [mask-image:radial-gradient(circle,black_85%,transparent_100%)]"
                  priority={i === 0}
                  sizes="100vw"
                />
              </div>
            </AdaptiveImageContainer>
          ))}
        </div>

        {/* Minimal Dots Indicator */}
        <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2 z-10 pointer-events-none">
          {allImages.map((_, i) => (
            <div
              key={i}
              className={cn(
                "w-1.5 h-1.5 rounded-full transition-all duration-300 shadow-sm",
                i === activeIndex ? "bg-black scale-110" : "bg-black/20",
              )}
            />
          ))}
        </div>

        {/* Count Badge */}
        <div className="absolute top-4 right-4 bg-black/5 text-black/60 text-[9px] px-2 py-1 rounded-sm font-medium tracking-widest uppercase">
          {activeIndex + 1} / {allImages.length}
        </div>
      </div>
    </div>
  );
}
