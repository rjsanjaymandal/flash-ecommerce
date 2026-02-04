import { cn } from "@/lib/utils";
import { Flame } from "lucide-react";
import { useState } from "react";
import dynamic from "next/dynamic";

interface SharedSelectorProps {
  selected: string;
  onSelect: (value: string) => void;
  options: string[];
  isAvailable: (value: string) => boolean;
}

interface SizeSelectorProps extends SharedSelectorProps {
  onOpenSizeGuide: () => void;
}

type ColorSelectorProps = SharedSelectorProps;

// Separate Size Selector
export function ProductSizeSelector({
  options,
  selected,
  onSelect,
  isAvailable,
  onOpenSizeGuide,
}: SizeSelectorProps) {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-baseline border-b border-black mb-4 pb-2">
        <span className="text-xs uppercase tracking-widest font-medium text-black">
          Select Size
        </span>
        <button
          onClick={onOpenSizeGuide}
          className="text-[10px] uppercase tracking-widest text-muted-foreground hover:text-black transition-colors"
        >
          Size Guide
        </button>
      </div>
      <div className="flex flex-wrap gap-2">
        {options.map((size) => {
          const available = isAvailable(size);
          const isSelected = selected === size;

          return (
            <button
              key={size}
              onClick={() => onSelect(size)}
              disabled={!available}
              className={cn(
                "h-10 px-4 text-[11px] uppercase tracking-widest transition-all duration-200 border",
                isSelected
                  ? "border-black text-black font-medium"
                  : "border-transparent text-neutral-500 hover:text-black hover:bg-neutral-50",
                !available &&
                  "opacity-30 cursor-not-allowed text-neutral-300 decoration-neutral-300 line-through",
              )}
            >
              {size}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// Separate Color Selector (Visual Style)
export function ProductColorSelector({
  options,
  selected,
  onSelect,
  isAvailable,
}: ColorSelectorProps) {
  return (
    <div className="space-y-4">
      <span className="text-xs uppercase tracking-widest font-medium text-black/60 block mb-2">
        Variation: <span className="text-black">{selected || "Select"}</span>
      </span>

      <div className="flex flex-wrap gap-3">
        {options.map((color) => {
          // We normally would map color names to images here, for now using text blocks effectively
          // In a real app we'd need color swatches or small images.
          // For now, mimicking the "Visual Thumbnail" with a colored block or just style text.
          // Screenshot shows small images. If we don't have images for colors specifically mapped,
          // we'll stick to a clean text/block selector but style it premium.
          const available = isAvailable(color);
          const isSelected = selected === color;

          return (
            <button
              key={color}
              disabled={!available}
              onClick={() => onSelect(color)}
              className={cn(
                "h-12 w-12 flex items-center justify-center text-[10px] uppercase tracking-tighter border transition-all duration-200",
                isSelected
                  ? "border-black bg-black text-white"
                  : "border-black/10 hover:border-black text-black/80",
                !available &&
                  "opacity-40 cursor-not-allowed line-through diagonal-fractions",
              )}
            >
              {/* Ideally this would be an image */}
              {color.slice(0, 3)}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// Legacy export if needed, or composite for simple usage
interface ProductSelectorsProps {
  sizeOptions: string[];
  colorOptions: string[];
  selectedSize: string;
  selectedColor: string;
  onSelectSize: (size: string) => void;
  onSelectColor: (color: string) => void;
  onOpenSizeGuide: () => void;
  isAvailable: (size: string, color: string) => boolean;
  isSizeAvailable: (size: string) => boolean;
  getStock: (size: string, color: string) => number;
  centered?: boolean;
}

export function ProductSelectors({
  sizeOptions,
  colorOptions,
  selectedSize,
  selectedColor,
  onSelectSize,
  onSelectColor,
  onOpenSizeGuide,
  isAvailable,
  isSizeAvailable,
  //   getStock,
  centered = false,
}: ProductSelectorsProps) {
  // Composite wrapper if used elsewhere
  return (
    <div className={cn("space-y-8", centered ? "text-center" : "")}>
      <div className={centered ? "flex justify-center" : ""}>
        <ProductColorSelector
          options={colorOptions}
          selected={selectedColor}
          onSelect={onSelectColor}
          isAvailable={(c) => true}
        />
      </div>
      <div className={centered ? "flex justify-center" : ""}>
        <ProductSizeSelector
          options={sizeOptions}
          selected={selectedSize}
          onSelect={onSelectSize}
          onOpenSizeGuide={onOpenSizeGuide}
          isAvailable={isSizeAvailable}
        />
      </div>
    </div>
  );
}
