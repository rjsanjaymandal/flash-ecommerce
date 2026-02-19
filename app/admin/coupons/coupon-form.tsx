"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import {
  Coupon,
  CouponFormValues,
  couponSchema,
} from "@/lib/services/admin-coupon-service";
import { createCoupon, updateCoupon } from "@/app/actions/coupon-actions";

interface CouponFormProps {
  initialData?: Coupon;
  onSuccess: () => void;
}

export function CouponForm({ initialData, onSuccess }: CouponFormProps) {
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<CouponFormValues>({
    resolver: zodResolver(couponSchema),
    defaultValues: {
      code: initialData?.code || "",
      discount_type: initialData?.discount_type || "percentage",
      value: initialData?.value || 0,
      min_order_amount: initialData?.min_order_amount || 0,
      max_uses: initialData?.max_uses || null,
      expires_at: initialData?.expires_at
        ? initialData.expires_at.split("T")[0]
        : "", // Format for date input
      active: initialData?.active ?? true,
    },
  });

  const onSubmit = async (data: CouponFormValues) => {
    setIsLoading(true);
    try {
      // Ensure date is ISO if present
      const payload = {
        ...data,
        expires_at: data.expires_at
          ? new Date(data.expires_at).toISOString()
          : null,
      };

      if (initialData) {
        // Update
        const res = await updateCoupon(initialData.id, payload);
        if (res.error) {
          toast.error(res.error);
        } else {
          toast.success("Coupon updated successfully");
          onSuccess();
        }
      } else {
        // Create
        const res = await createCoupon(payload);
        if (res.error) {
          toast.error(res.error);
        } else {
          toast.success("Coupon created successfully");
          onSuccess();
        }
      }
    } catch (error) {
      console.error(error);
      toast.error("Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="code"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Coupon Code</FormLabel>
              <FormControl>
                <Input
                  placeholder="SUMMER2026"
                  {...field}
                  onChange={(e) =>
                    field.onChange(
                      e.target.value.toUpperCase().replace(/[^A-Z0-9_-]/g, ""),
                    )
                  }
                  className="font-mono uppercase"
                />
              </FormControl>
              <FormDescription>
                Unique code for customers to enter.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="discount_type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Type</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="percentage">Percentage (%)</SelectItem>
                    <SelectItem value="fixed">Fixed Amount (₹)</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="value"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Value</FormLabel>
                <FormControl>
                  <Input type="number" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="min_order_amount"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Min Order (₹)</FormLabel>
                <FormControl>
                  <Input type="number" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="max_uses"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Usage Limit</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="Unlimited"
                    {...field}
                    value={field.value || ""}
                  />
                </FormControl>
                <FormDescription>Leave empty for unlimited.</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="expires_at"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Expiration Date</FormLabel>
              <FormControl>
                <Input
                  type="date"
                  {...field}
                  value={field.value || ""}
                  min={new Date().toISOString().split("T")[0]}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="active"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel className="text-base">Active Status</FormLabel>
                <FormDescription>
                  Disabling will make this coupon invalid immediately.
                </FormDescription>
              </div>
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-2 pt-4">
          {/* Dialog Close is handled by parent, but we can add a cancel helper if needed, 
               though standard dialog usually has X or click outside. 
               We just need the Submit button here. */}
          <Button
            type="submit"
            disabled={isLoading}
            className="w-full sm:w-auto"
          >
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {initialData ? "Update Coupon" : "Create Coupon"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
