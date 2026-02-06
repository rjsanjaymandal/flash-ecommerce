import { cn } from "@/lib/utils";
import { Plus } from "lucide-react";
import { getColorHex } from "@/lib/colors";
import { motion } from "framer-motion";

interface SharedSelectorProps {
  selected: string;
  onSelect: (value: string) => void;
  options: string[];
  isAvailable: (value: string) => boolean;
}

interface SizeSelectorProps extends SharedSelectorProps {
  onOpenSizeGuide: () => void;
}

interface ColorSelectorProps extends SharedSelectorProps {
  customColorMap?: Record<string, string>;
}

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
        <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-black">
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
                "h-10 px-4 text-[11px] uppercase tracking-widest transition-all duration-300 border relative group",
                isSelected
                  ? "border-black text-black font-bold bg-black/3"
                  : "border-transparent text-neutral-500 hover:text-black hover:bg-neutral-50",
                !available &&
                  "opacity-30 cursor-not-allowed text-neutral-300 decoration-neutral-300 line-through",
              )}
            >
              {size}
              {isSelected && (
                <motion.div
                  layoutId="activeSize"
                  className="absolute bottom-0 left-0 right-0 h-[2px] bg-black"
                />
              )}
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
  customColorMap,
}: ColorSelectorProps) {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-baseline border-b border-border mb-4 pb-2">
        <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-black/60">
          Color: <span className="text-black">{selected || "Select"}</span>
        </span>
      </div>

      <div className="flex flex-wrap gap-4">
        {options.map((color) => {
          const available = isAvailable(color);
          const isSelected = selected === color;
          const hex = getColorHex(color, customColorMap);
          return (
            <div key={color} className="relative group">
              <button
                disabled={!available}
                onClick={() => onSelect(color)}
                className={cn(
                  "h-12 w-12 rounded-full border-2 transition-all duration-500 ease-out flex items-center justify-center relative overflow-hidden",
                  isSelected
                    ? "border-black scale-110 shadow-lg"
                    : "border-transparent hover:border-black/20 hover:scale-105",
                  !available && "opacity-30 cursor-not-allowed grayscale",
                )}
                title={color}
              >
                <div
                  className="w-full h-full rounded-full transition-transform duration-500 group-hover:scale-110"
                  style={{
                    backgroundColor: hex,
                    boxShadow:
                      hex.toLowerCase() === "#ffffff"
                        ? "inset 0 0 0 1px rgba(0,0,0,0.1)"
                        : "none",
                  }}
                />
                {isSelected && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div
                      className={cn(
                        "w-1.5 h-1.5 rounded-full",
                        hex.toLowerCase() === "#ffffff"
                          ? "bg-black"
                          : "bg-white",
                      )}
                    />
                  </div>
                )}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// Separate Fit Selector
export function ProductFitSelector({
  options,
  selected,
  onSelect,
  isAvailable,
}: SharedSelectorProps) {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-baseline border-b border-black mb-4 pb-2">
        <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-black">
          Select Fit
        </span>
      </div>
      <div className="flex flex-wrap gap-2">
        {options.map((fit) => {
          const available = isAvailable(fit);
          const isSelected = selected === fit;

          return (
            <button
              key={fit}
              onClick={() => onSelect(fit)}
              disabled={!available}
              className={cn(
                "h-10 px-4 text-[11px] uppercase tracking-widest transition-all duration-300 border relative group",
                isSelected
                  ? "border-black text-black font-bold bg-black/[0.03]"
                  : "border-transparent text-neutral-500 hover:text-black hover:bg-neutral-50",
                !available &&
                  "opacity-30 cursor-not-allowed text-neutral-300 decoration-neutral-300 line-through",
              )}
            >
              {fit}
              {isSelected && (
                <motion.div
                  layoutId="activeFit"
                  className="absolute bottom-0 left-0 right-0 h-[2px] bg-black"
                />
              )}
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
  fitOptions?: string[];
  selectedSize: string;
  selectedColor: string;
  selectedFit?: string;
  onSelectSize: (size: string) => void;
  onSelectColor: (color: string) => void;
  onSelectFit?: (fit: string) => void;
  onOpenSizeGuide: () => void;
  isAvailable: (size: string, color: string, fit?: string) => boolean;
  isSizeAvailable: (size: string) => boolean;
  isFitAvailable?: (fit: string) => boolean;
  getStock: (size: string, color: string, fit: string) => number;
  centered?: boolean;
}

export function ProductSelectors({
  sizeOptions,
  colorOptions,
  fitOptions = [],
  selectedSize,
  selectedColor,
  selectedFit,
  onSelectSize,
  onSelectColor,
  onSelectFit,
  onOpenSizeGuide,
  isAvailable,
  isSizeAvailable,
  isFitAvailable,
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

      {fitOptions.length > 0 && onSelectFit && (
        <div className={centered ? "flex justify-center" : ""}>
          <ProductFitSelector
            options={fitOptions}
            selected={selectedFit || ""}
            onSelect={onSelectFit}
            isAvailable={isFitAvailable || ((f) => true)}
          />
        </div>
      )}

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
