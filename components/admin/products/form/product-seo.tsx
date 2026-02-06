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
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function ProductSEO() {
  const { control, watch } = useFormContext();
  const title = watch("seo_title") || watch("name") || "Product Title";
  const description =
    watch("seo_description") ||
    watch("description")?.replace(/<[^>]*>?/gm, "") ||
    "Product Description";
  const slug = watch("slug") || "product-handle";

  // Truncate for preview
  const previewTitle =
    title.length > 60 ? title.substring(0, 57) + "..." : title;
  const previewDesc =
    description.length > 160
      ? description.substring(0, 157) + "..."
      : description;
  const previewUrl = `https://store.com/products/${slug}`;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Search Engine Listing</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <div className="text-sm font-medium text-muted-foreground">
            Preview
          </div>
          <div className="p-4 rounded-md border bg-card">
            <div className="text-sm text-blue-800 dark:text-blue-400 font-medium mb-0.5 hover:underline cursor-pointer">
              {previewTitle}
            </div>
            <div className="text-xs text-green-700 dark:text-green-500 mb-1">
              {previewUrl}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              {previewDesc}
            </div>
          </div>
        </div>

        <FormField
          control={control}
          name="seo_title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Page Title (Optional)</FormLabel>
              <FormControl>
                <Input placeholder="" {...field} />
              </FormControl>
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Standard is 70 chars</span>
                <span
                  className={field.value?.length > 70 ? "text-destructive" : ""}
                >
                  {field.value?.length || 0}/70
                </span>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="seo_description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Meta Description (Optional)</FormLabel>
              <FormControl>
                <Textarea className="min-h-[80px]" placeholder="" {...field} />
              </FormControl>
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Standard is 320 chars</span>
                <span
                  className={
                    field.value?.length > 320 ? "text-destructive" : ""
                  }
                >
                  {field.value?.length || 0}/320
                </span>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />
      </CardContent>
    </Card>
  );
}
