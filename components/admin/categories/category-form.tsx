"use client";

import { useState, useEffect } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { categorySchema, type CategoryData } from "@/lib/validations/category";

export type CategoryFormData = CategoryData;
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { slugify } from "@/lib/slugify";
import { Image as ImageIcon, Loader2, X } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import FlashImage from "@/components/ui/flash-image";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

interface CategoryFormProps {
  initialData?: CategoryData;
  categories: any[];
  isEditing: boolean;
  isLoading: boolean;
  onSubmit: (data: CategoryData) => void;
  onCancel: () => void;
}

export function CategoryForm({
  initialData,
  categories,
  isEditing,
  isLoading,
  onSubmit,
  onCancel,
}: CategoryFormProps) {
  const supabase = createClient();
  const [isUploading, setIsUploading] = useState(false);

  const form = useForm<CategoryData>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: initialData?.name || "",
      slug: initialData?.slug || "",
      description: initialData?.description || "",
      parent_id: initialData?.parent_id || "none",
      image_url: initialData?.image_url || "",
      is_active: initialData?.is_active ?? true,
    },
  });

  // Reset form when initialData changes
  useEffect(() => {
    if (initialData) {
      form.reset(initialData);
    }
  }, [initialData, form]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      // Use the same optimized pipeline as products
      const { uploadOptimizedImage } =
        await import("@/app/actions/upload-images");
      const urls = await uploadOptimizedImage(formData, "category-images");

      form.setValue("image_url", urls.desktop);
      toast.success("Image Optimized & Uploaded");
    } catch (err: any) {
      toast.error("Upload failed: " + err.message);
    } finally {
      setIsUploading(false);
      if (e.target) e.target.value = "";
    }
  };

  const onFormSubmit: SubmitHandler<CategoryData> = (data) => {
    onSubmit(data);
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onFormSubmit)}
        className="space-y-6 pt-4"
      >
        <div className="grid gap-6">
          <FormField
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Category Name</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    placeholder="e.g. Summer Collection"
                    onChange={(e) => {
                      field.onChange(e);
                      if (!isEditing) {
                        form.setValue("slug", slugify(e.target.value));
                      }
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            name="slug"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Slug</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    value={field.value || ""}
                    placeholder="url-friendly-slug"
                    onChange={(e) => field.onChange(slugify(e.target.value))}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            name="parent_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Parent Category</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  value={field.value || "none"}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select parent" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="none">None (Top Level)</SelectItem>
                    {categories.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormItem>
            <FormLabel>Cover Image</FormLabel>
            <div className="flex items-center gap-4 rounded-xl border-2 p-4 border-dashed hover:bg-muted/30 transition-all group">
              {form.watch("image_url") ? (
                <div className="relative h-20 w-20 rounded-lg overflow-hidden border-2 group/img shadow-sm">
                  <FlashImage
                    src={form.watch("image_url")!}
                    className="object-cover"
                    fill
                    resizeMode="cover"
                    alt="Preview"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center">
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      className="h-7 w-7 rounded-full"
                      onClick={() => form.setValue("image_url", "")}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="h-20 w-20 rounded-lg bg-muted flex items-center justify-center border-2 border-border/10">
                  {isUploading ? (
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  ) : (
                    <ImageIcon className="h-8 w-8 text-muted-foreground/30" />
                  )}
                </div>
              )}
              <div className="flex-1">
                <div className="text-sm font-bold uppercase tracking-widest text-muted-foreground mb-2">
                  {isUploading ? "Syncing..." : "Upload Signal Overlay"}
                </div>
                <Input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  disabled={isUploading}
                  className="cursor-pointer file:cursor-pointer file:text-primary file:font-bold file:uppercase file:text-[10px] h-10"
                />
              </div>
            </div>
          </FormItem>

          <FormField
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    value={field.value || ""}
                    placeholder="Brief description for SEO"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            name="is_active"
            render={({ field }) => (
              <FormItem className="flex items-center justify-between rounded-xl border-2 p-4 shadow-sm bg-card hover:border-primary/20 transition-all">
                <div className="space-y-0.5">
                  <FormLabel className="text-sm font-bold uppercase tracking-tighter italic">
                    Active Status
                  </FormLabel>
                  <FormDescription className="text-xs">
                    Toggle visibility across discovery channels.
                  </FormDescription>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
              </FormItem>
            )}
          />
        </div>

        <div className="flex justify-end pt-4 gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            className="rounded-full px-8 font-bold uppercase tracking-widest text-[10px] h-11"
          >
            Abort
          </Button>
          <Button
            type="submit"
            disabled={isLoading || isUploading}
            className="rounded-full px-8 font-bold uppercase tracking-widest text-[10px] h-11 shadow-lg shadow-primary/20"
          >
            {isLoading && <Loader2 className="animate-spin mr-2 h-4 w-4" />}
            {isEditing ? "Sync Changes" : "Initialize Category"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
