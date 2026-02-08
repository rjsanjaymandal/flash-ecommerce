"use client";

import { useFormContext } from "react-hook-form";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";

export function ProductInventory() {
  const { control, watch } = useFormContext();
  const trackQuantity = watch("track_quantity");

  return (
    <Card className="rounded-none border-2">
      <CardHeader>
        <CardTitle>Inventory</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 gap-4">
          <FormField
            control={control}
            name="sku"
            render={({ field }) => (
              <FormItem>
                <FormLabel>SKU (Stock Keeping Unit) - Optional</FormLabel>
                <FormControl>
                  <Input
                    placeholder=""
                    {...field}
                    className="rounded-none border-foreground/20 focus-visible:ring-0 focus-visible:border-foreground font-mono"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={control}
          name="track_quantity"
          render={({ field }) => (
            <div className="flex items-center space-x-2">
              <Checkbox
                id="track_quantity"
                checked={field.value}
                onCheckedChange={field.onChange}
              />
              <label
                htmlFor="track_quantity"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Track quantity
              </label>
            </div>
          )}
        />

        {trackQuantity && (
          <div className="pt-2">
            <div className="text-[10px] uppercase font-mono tracking-widest text-muted-foreground p-3 border-2 border-dashed border-muted-foreground/20 rounded-none">
              Quantity for standard items is managed here. If you add variants
              (Size/Color), quantity will be tracked per variant.
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
