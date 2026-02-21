"use client";

import { useFormContext, useFieldArray } from "react-hook-form";
import { FormLabel } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Trash2, Plus } from "lucide-react";
import { VariantGenerator } from "@/components/admin/products/variant-generator";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { BulkVariantActions } from "./bulk-variant-actions";
import { Checkbox } from "@/components/ui/checkbox";

interface ProductVariantsProps {
  colorOptions: string[];
}

export function ProductVariants({ colorOptions }: ProductVariantsProps) {
  const { control, register, watch, setValue, getValues } = useFormContext();
  const [hasVariants, setHasVariants] = useState(false);
  const [selectedIndices, setSelectedIndices] = useState<number[]>([]);

  const { fields, append, remove, replace } = useFieldArray({
    control,
    name: "variants",
  });

  const variants = watch("variants");

  // Sync internal state with form data on mount
  useEffect(() => {
    const currentVariants = getValues("variants") || [];
    const isMulti =
      currentVariants.length > 1 ||
      (currentVariants.length === 1 &&
        (currentVariants[0].size !== "Standard" ||
          currentVariants[0].color !== "Standard" ||
          currentVariants[0].fit !== "Regular"));
    setHasVariants(isMulti);
  }, [getValues]);

  const handleToggleVariants = (checked: boolean) => {
    setHasVariants(checked);
    const current = getValues("variants");

    if (checked) {
      // Switching to multi-mode
      if (!current || current.length === 0) {
        replace([
          {
            size: "Standard",
            color: "Standard",
            fit: "Regular",
            quantity: 0,
            price_addon: 0,
            cost_price: 0,
          },
        ]);
      } else if (current.length === 1 && current[0].size === "Standard") {
        toast.info("Variant mode enabled. Add options now.");
      }
    } else {
      // Switching to simple mode
      if (current.length > 1) {
        if (
          confirm(
            "This will remove all variants and keep only the first one. Continue?",
          )
        ) {
          const first = current[0];
          replace([
            { ...first, size: "Standard", color: "Standard", fit: "Regular" },
          ]);
        } else {
          setHasVariants(true); // revert
          return;
        }
      } else if (current.length === 1) {
        const first = current[0];
        replace([
          { ...first, size: "Standard", color: "Standard", fit: "Regular" },
        ]);
      }
    }
  };

  const handleGenerate = (newVariants: any[]) => {
    // Merge with existing or replace? Usually generate appends or replaces.
    // Let's append if there are existing non-standard variants, but safeguard duplicates?
    // For simplicity, just append for now, or replace if only standard exists.
    const current = getValues("variants");
    const isStandardOnly =
      current.length === 1 &&
      current[0].size === "Standard" &&
      current[0].color === "Standard";

    if (isStandardOnly) {
      replace(newVariants);
    } else {
      append(newVariants);
    }
    toast.success(`Generated ${newVariants.length} variants`);
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIndices(fields.map((_, i) => i));
    } else {
      setSelectedIndices([]);
    }
  };

  const handleSelectRow = (index: number, checked: boolean) => {
    if (checked) {
      setSelectedIndices((prev) => [...prev, index]);
    } else {
      setSelectedIndices((prev) => prev.filter((i) => i !== index));
    }
  };

  const handleBulkDelete = () => {
    if (
      confirm(
        `Are you sure you want to delete ${selectedIndices.length} variants?`,
      )
    ) {
      // Sort indices in descending order to avoid shift issues during removal
      const sorted = [...selectedIndices].sort((a, b) => b - a);
      sorted.forEach((index) => remove(index));
      setSelectedIndices([]);
      toast.success("Variants deleted");
    }
  };

  const updateSelected = (field: "quantity" | "cost_price", value: number) => {
    selectedIndices.forEach((index) => {
      setValue(`variants.${index}.${field}`, value, { shouldDirty: true });
    });
    toast.success(`Updated ${selectedIndices.length} variants`);
    setSelectedIndices([]);
  };

  return (
    <Card className="rounded-none border-2">
      <CardHeader>
        <CardTitle>Variants</CardTitle>
        <CardDescription>
          Manage size, color, and fit variations for this product.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center space-x-2 border-2 border-black p-4 rounded-none bg-muted/5">
          <Switch
            id="has-variants"
            checked={hasVariants}
            onCheckedChange={handleToggleVariants}
          />
          <div className="space-y-1">
            <FormLabel htmlFor="has-variants" className="text-base">
              This product has options, like size or color
            </FormLabel>
          </div>
        </div>

        {hasVariants && (
          <div className="space-y-4 animate-in fade-in slide-in-from-top-2">
            <div className="flex justify-between items-center">
              <div className="text-sm font-medium">Variant Options</div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-2"
                  onClick={() =>
                    append({
                      size: "Standard",
                      color: "Standard",
                      fit: "Regular",
                      quantity: 0,
                      cost_price: 0,
                    })
                  }
                  type="button"
                >
                  <Plus className="w-4 h-4" />
                  Add Variant
                </Button>
                <VariantGenerator
                  onGenerate={handleGenerate}
                  existingVariants={variants}
                  colorOptions={colorOptions}
                />
              </div>
            </div>

            <BulkVariantActions
              selectedCount={selectedIndices.length}
              onUpdateCost={(c) => updateSelected("cost_price", c)}
              onUpdateStock={(s) => updateSelected("quantity", s)}
              onDelete={handleBulkDelete}
              onClearSelection={() => setSelectedIndices([])}
            />

            <div className="rounded-none border-2 border-black overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[40px]">
                      <Checkbox
                        checked={
                          fields.length > 0 &&
                          selectedIndices.length === fields.length
                        }
                        onCheckedChange={(c) => handleSelectAll(!!c)}
                      />
                    </TableHead>
                    <TableHead>Variant</TableHead>
                    <TableHead>Cost</TableHead>
                    <TableHead>SKU</TableHead>
                    <TableHead>Stock</TableHead>
                    <TableHead className="w-[50px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {fields.map((field, index) => {
                    // Dynamic Label
                    const v = variants[index] || {};
                    // Construct label avoiding "Standard"/"Regular" noise
                    const parts = [];
                    if (v.size !== "Standard") parts.push(v.size);
                    if (v.color !== "Standard") parts.push(v.color);
                    if (v.fit !== "Regular") parts.push(v.fit);
                    const label =
                      parts.length > 0 ? parts.join(" / ") : "Default Variant";

                    return (
                      <TableRow
                        key={field.id}
                        className={
                          selectedIndices.includes(index) ? "bg-muted/50" : ""
                        }
                      >
                        <TableCell>
                          <Checkbox
                            checked={selectedIndices.includes(index)}
                            onCheckedChange={(c) => handleSelectRow(index, !!c)}
                          />
                        </TableCell>
                        <TableCell className="font-medium">
                          {label}
                          <div className="text-xs text-muted-foreground hidden">
                            {/* Hidden inputs to keep values registered */}
                            <input
                              type="hidden"
                              {...register(`variants.${index}.size`)}
                            />
                            <input
                              type="hidden"
                              {...register(`variants.${index}.color`)}
                            />
                            <input
                              type="hidden"
                              {...register(`variants.${index}.fit`)}
                            />
                          </div>
                        </TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            className="w-24 h-8 rounded-none border-foreground/20 font-mono text-xs"
                            placeholder="0"
                            {...register(`variants.${index}.cost_price`, {
                              valueAsNumber: true,
                            })}
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            className="w-32 h-8 rounded-none border-foreground/20 font-mono text-xs"
                            placeholder="SKU"
                            {...register(`variants.${index}.sku`)}
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            className="w-20 h-8 rounded-none border-foreground/20 font-mono text-xs"
                            {...register(`variants.${index}.quantity`, {
                              valueAsNumber: true,
                            })}
                          />
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => remove(index)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
