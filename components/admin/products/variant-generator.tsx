"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
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
      quantity: number;
      price_addon: number;
    }[],
  ) => void;
  existingVariants: { size: string; color: string }[];
  colorOptions: string[];
  colorMap?: Record<string, string>;
}

const SIZE_OPTIONS = ["XS", "S", "M", "L", "XL", "XXL", "Oversized"];

export function VariantGenerator({
  onGenerate,
  existingVariants,
  colorOptions,
  colorMap,
}: VariantGeneratorProps) {
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [isOpen, setIsOpen] = useState(false);

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

  const handleGenerate = () => {
    if (selectedSizes.length === 0 || selectedColors.length === 0) {
      toast.error("Please select at least one size and one color");
      return;
    }

    const newVariants: any[] = [];
    selectedSizes.forEach((size) => {
      selectedColors.forEach((color) => {
        // Only add if it doesn't already exist
        const alreadyExists = existingVariants.some(
          (v) => v.size === size && v.color === color,
        );
        if (!alreadyExists) {
          newVariants.push({
            size,
            color,
            quantity: 0,
            price_addon: 0,
          });
        }
      });
    });

    if (newVariants.length === 0) {
      toast.info("All selected combinations already exist");
    } else {
      onGenerate(newVariants);
      toast.success(`Generated ${newVariants.length} new variants`);
      setSelectedSizes([]);
      setSelectedColors([]);
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
      <PopoverContent className="w-[400px] p-4" align="end">
        <div className="space-y-6">
          <div className="space-y-2">
            <h4 className="font-medium leading-none">Bulk Variant Generator</h4>
            <p className="text-sm text-muted-foreground">
              Select sizes and colors to create all combinations.
            </p>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-xs uppercase tracking-widest font-bold">
                Sizes
              </Label>
              <div className="flex flex-wrap gap-2">
                {SIZE_OPTIONS.map((size) => (
                  <button
                    key={size}
                    type="button"
                    onClick={() => toggleSize(size)}
                    className={`px-3 py-1 text-xs rounded-full border transition-all ${
                      selectedSizes.includes(size)
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-background hover:bg-muted"
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-xs uppercase tracking-widest font-bold">
                Colors
              </Label>
              <div className="grid grid-cols-3 gap-2">
                {colorOptions.map((color) => (
                  <div key={color} className="flex items-center space-x-2">
                    <Checkbox
                      id={`color-${color}`}
                      checked={selectedColors.includes(color)}
                      onCheckedChange={() => toggleColor(color)}
                    />
                    <label
                      htmlFor={`color-${color}`}
                      className="text-xs font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex items-center gap-2 cursor-pointer"
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
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button variant="ghost" size="sm" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
            <Button size="sm" onClick={handleGenerate}>
              Add {selectedSizes.length * selectedColors.length} Variants
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
