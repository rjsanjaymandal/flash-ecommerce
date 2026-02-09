"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Wand2, Plus, Check, X } from "lucide-react";
import { toast } from "sonner";

interface VariantGeneratorProps {
  onGenerate: (
    variants: {
      size: string;
      color: string;
      fit: string;
      quantity: number;
      cost_price: number;
    }[],
  ) => void;
  existingVariants: { size: string; color: string; fit: string }[];
  colorOptions: string[];
  colorMap?: Record<string, string>;
}

const SIZE_OPTIONS = ["XS", "S", "M", "L", "XL", "XXL", "Oversized"];
const FIT_OPTIONS = ["Regular", "Oversized", "Fitted"];

export function VariantGenerator({
  onGenerate,
  existingVariants,
  colorOptions,
  colorMap,
}: VariantGeneratorProps) {
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [selectedFits, setSelectedFits] = useState<string[]>([]);

  const [useSize, setUseSize] = useState(false);
  const [useColor, setUseColor] = useState(false);
  const [useFit, setUseFit] = useState(false);

  const [isOpen, setIsOpen] = useState(false);

  // Defaults for generation
  const [defCost, setDefCost] = useState<number>(0);
  const [defQty, setDefQty] = useState<number>(0);

  const toggleSize = (size: string) => {
    setSelectedSizes((prev) =>
      prev.includes(size) ? prev.filter((s) => s !== size) : [...prev, size],
    );
  };

  const toggleColor = (color: string) => {
    setSelectedColors((prev) =>
      prev.includes(color) ? prev.filter((c) => c !== color) : [...prev, color],
    );
  };

  const toggleFit = (fit: string) => {
    setSelectedFits((prev) =>
      prev.includes(fit) ? prev.filter((f) => f !== fit) : [...prev, fit],
    );
  };

  const handleGenerate = () => {
    // Determine dimensions to use
    const finalSizes =
      useSize && selectedSizes.length > 0 ? selectedSizes : ["Standard"];
    const finalColors =
      useColor && selectedColors.length > 0 ? selectedColors : ["Standard"];
    const finalFits =
      useFit && selectedFits.length > 0 ? selectedFits : ["Regular"];

    if (useSize && selectedSizes.length === 0) {
      toast.error("Please select at least one size or disable Size option");
      return;
    }
    if (useColor && selectedColors.length === 0) {
      toast.error("Please select at least one color or disable Color option");
      return;
    }
    if (useFit && selectedFits.length === 0) {
      toast.error("Please select at least one fit or disable Fit option");
      return;
    }

    if (!useSize && !useColor && !useFit) {
      toast.error("Please enable at least one option to generate variants");
      return;
    }

    const newVariants: any[] = [];
    finalSizes.forEach((size) => {
      finalColors.forEach((color) => {
        finalFits.forEach((fit) => {
          // Only add if it doesn't already exist
          const alreadyExists = existingVariants.some(
            (v) => v.size === size && v.color === color && v.fit === fit,
          );
          if (!alreadyExists) {
            newVariants.push({
              size,
              color,
              fit,
              quantity: defQty,
              cost_price: defCost,
            });
          }
        });
      });
    });

    if (newVariants.length === 0) {
      toast.info("All selected combinations already exist");
    } else {
      onGenerate(newVariants);
      toast.success(`Generated ${newVariants.length} new variants`);
      setSelectedSizes([]);
      setSelectedColors([]);
      setSelectedFits([]);
      setDefCost(0);
      setDefQty(0);
      setIsOpen(false);
    }
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Wand2 className="h-4 w-4" />
          Bulk Generate
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-[450px] p-0 rounded-none border-2 border-black shadow-2xl"
        align="end"
      >
        <div className="flex flex-col h-[500px]">
          <div className="p-4 border-b-2 border-black bg-muted/30">
            <h4 className="font-mono font-black text-xs uppercase tracking-widest">
              Variant Configuration
            </h4>
            <p className="text-[10px] text-muted-foreground font-mono uppercase tracking-tighter mt-1">
              Select dimensions to combine.
            </p>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-6">
            {/* Options Selector */}
            <div className="flex gap-4 p-3 bg-slate-800 text-white rounded-none border-2 border-slate-900 font-mono">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="use-size"
                  checked={useSize}
                  onCheckedChange={(c) => setUseSize(!!c)}
                />
                <Label
                  htmlFor="use-size"
                  className="text-xs font-bold uppercase tracking-wider cursor-pointer"
                >
                  Size
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="use-color"
                  checked={useColor}
                  onCheckedChange={(c) => setUseColor(!!c)}
                />
                <Label
                  htmlFor="use-color"
                  className="text-xs font-bold uppercase tracking-wider cursor-pointer"
                >
                  Color
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="use-fit"
                  checked={useFit}
                  onCheckedChange={(c) => setUseFit(!!c)}
                />
                <Label
                  htmlFor="use-fit"
                  className="text-xs font-bold uppercase tracking-wider cursor-pointer"
                >
                  Fit
                </Label>
              </div>
            </div>

            {useSize && (
              <div className="space-y-2 animate-in slide-in-from-left-2 duration-200">
                <Label className="text-[10px] uppercase tracking-widest font-black text-muted-foreground">
                  Select Sizes
                </Label>
                <div className="flex flex-wrap gap-2">
                  {SIZE_OPTIONS.map((size) => (
                    <button
                      key={size}
                      type="button"
                      onClick={() => toggleSize(size)}
                      className={`px-3 py-1.5 text-[10px] font-mono font-black uppercase rounded-none border-2 transition-all ${
                        selectedSizes.includes(size)
                          ? "bg-black text-white border-black"
                          : "bg-background border-foreground/10 hover:border-black"
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {useColor && (
              <div className="space-y-2 animate-in slide-in-from-left-2 duration-200">
                <Label className="text-[10px] uppercase tracking-widest font-black text-muted-foreground">
                  Select Colors
                </Label>
                <div className="grid grid-cols-2 gap-2">
                  {colorOptions.map((color) => (
                    <div
                      key={color}
                      className="flex items-center space-x-2 p-2 rounded-none border-2 border-foreground/10 hover:border-black cursor-pointer transition-colors"
                      onClick={() => toggleColor(color)}
                    >
                      <Checkbox
                        id={`color-${color}`}
                        checked={selectedColors.includes(color)}
                        onCheckedChange={() => {}} // Handled by div click
                      />
                      <label
                        htmlFor={`color-${color}`}
                        className="text-[10px] font-bold leading-none flex items-center gap-2 cursor-pointer"
                      >
                        <div
                          className="h-3 w-3 rounded-full border border-muted-foreground/30 shadow-sm"
                          style={{
                            backgroundColor:
                              colorMap?.[color] || color.toLowerCase(),
                          }}
                        />
                        {color}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {useFit && (
              <div className="space-y-2 animate-in slide-in-from-left-2 duration-200">
                <Label className="text-[10px] uppercase tracking-widest font-black text-muted-foreground">
                  Select Fits
                </Label>
                <div className="flex flex-wrap gap-2">
                  {FIT_OPTIONS.map((fit) => (
                    <button
                      key={fit}
                      type="button"
                      onClick={() => toggleFit(fit)}
                      className={`px-3 py-1.5 text-[10px] font-mono font-black uppercase rounded-none border-2 transition-all ${
                        selectedFits.includes(fit)
                          ? "bg-black text-white border-black"
                          : "bg-background border-foreground/10 hover:border-black"
                      }`}
                    >
                      {fit}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="pt-4 border-t-2 border-black space-y-4">
              <Label className="text-[10px] font-mono uppercase tracking-widest font-black text-black">
                Generation Defaults
              </Label>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-[9px] uppercase font-black font-mono text-muted-foreground">
                    Cost
                  </Label>
                  <Input
                    type="number"
                    value={defCost}
                    onChange={(e) => {
                      const val = parseFloat(e.target.value);
                      setDefCost(isNaN(val) ? 0 : val);
                    }}
                    className="h-8 text-xs font-mono font-bold rounded-none border-foreground/20"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-[9px] uppercase font-black font-mono text-muted-foreground">
                    Stock
                  </Label>
                  <Input
                    type="number"
                    value={defQty}
                    onChange={(e) => {
                      const val = parseInt(e.target.value);
                      setDefQty(isNaN(val) ? 0 : val);
                    }}
                    className="h-8 text-xs font-mono font-bold rounded-none border-foreground/20"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="p-4 border-t flex justify-between items-center bg-muted/10">
            <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-widest">
              Total:{" "}
              {(useSize ? selectedSizes.length || 1 : 1) *
                (useColor ? selectedColors.length || 1 : 1) *
                (useFit ? selectedFits.length || 1 : 1)}{" "}
              variants
            </p>
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsOpen(false)}
              >
                Cancel
              </Button>
              <Button size="sm" onClick={handleGenerate} className="font-bold">
                Generate
              </Button>
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
