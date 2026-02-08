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
import dynamic from "next/dynamic";
import { slugify } from "@/lib/slugify";
import { useEffect } from "react";

const RichTextEditor = dynamic(
  () =>
    import("@/components/admin/products/rich-text-editor").then(
      (mod) => mod.RichTextEditor,
    ),
  {
    ssr: false,
    loading: () => (
      <div className="h-[200px] w-full bg-muted/20 animate-pulse rounded-md" />
    ),
  },
);

export function ProductBasicInfo() {
  const { control, watch, setValue, getValues } = useFormContext();
  const name = watch("name");
  const slug = watch("slug");

  // Auto-generate slug
  useEffect(() => {
    if (name) {
      const currentSlug = getValues("slug");
      const expectedSlug = slugify(name);
      if (
        !currentSlug ||
        currentSlug === slugify(name.slice(0, -1)) ||
        currentSlug === ""
      ) {
        setValue("slug", expectedSlug, { shouldValidate: true });
      }
    }
  }, [name, setValue, getValues]);

  return (
    <Card className="rounded-none border-2">
      <CardHeader>
        <CardTitle>Product Details</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <FormField
          control={control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title</FormLabel>
              <FormControl>
                <Input
                  placeholder="e.g. Classic White Tee"
                  {...field}
                  className="rounded-none border-foreground/20 focus-visible:ring-0 focus-visible:border-foreground"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="slug"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Slug (Optional - auto generated)</FormLabel>
              <FormControl>
                <Input
                  placeholder="classic-white-tee"
                  {...field}
                  className="rounded-none border-foreground/20 focus-visible:ring-0 focus-visible:border-foreground font-mono text-xs"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description (Optional)</FormLabel>
              <FormControl>
                <RichTextEditor
                  value={field.value || ""}
                  onChange={field.onChange}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </CardContent>
    </Card>
  );
}
