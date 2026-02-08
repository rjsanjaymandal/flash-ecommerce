"use client";

import { useFormContext } from "react-hook-form";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";

export function ProductPricing() {
  const { control, watch } = useFormContext();

  const price = watch("price") || 0;
  const cost = watch("cost_price") || 0;

  const margin = price > 0 ? ((price - cost) / price) * 100 : 0;
  const profit = price - cost;

  return (
    <Card className="rounded-none border-2">
      <CardHeader>
        <CardTitle>Pricing</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={control}
            name="price"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Price (`₹`)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="0.00"
                    {...field}
                    onChange={(e) => field.onChange(parseFloat(e.target.value))}
                    className="rounded-none border-foreground/20 focus-visible:ring-0 focus-visible:border-foreground font-mono"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={control}
            name="original_price"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Compare-at Price (Optional)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="0.00"
                    {...field}
                    value={field.value ?? ""}
                    className="rounded-none border-foreground/20 focus-visible:ring-0 focus-visible:border-foreground font-mono"
                    onChange={(e) =>
                      field.onChange(
                        e.target.value ? parseFloat(e.target.value) : null,
                      )
                    }
                  />
                </FormControl>
                <FormDescription>Original MRP</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={control}
            name="cost_price"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Cost per item (Optional)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="0.00"
                    {...field}
                    onChange={(e) => field.onChange(parseFloat(e.target.value))}
                    className="rounded-none border-foreground/20 focus-visible:ring-0 focus-visible:border-foreground font-mono"
                  />
                </FormControl>
                <FormDescription>Customers won&apos;t see this</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="space-y-2 pt-2">
            <div className="text-sm font-medium">Margin</div>
            <div className="text-sm text-muted-foreground flex items-center justify-between border-2 border-black rounded-none p-2 h-10 bg-black text-white font-mono uppercase text-[10px] tracking-widest">
              <span>Margin: {Math.round(margin)}%</span>
              <span
                className={cn(profit < 0 ? "text-red-400" : "text-green-400")}
              >
                ₹{profit.toFixed(2)} Profit
              </span>
            </div>
          </div>
        </div>

        <FormField
          control={control}
          name="is_taxable"
          // Note: Add is_taxable to schema if not present, assume simple for now
          render={({ field }) => (
            <div className="flex items-center space-x-2">
              <Checkbox id="tax" disabled checked />
              <label
                htmlFor="tax"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Charge tax on this product (Default)
              </label>
            </div>
          )}
        />
      </CardContent>
    </Card>
  );
}
