"use client";

import dynamic from "next/dynamic";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Loader2, Save, X, Plus, Trash2, ArrowLeft } from "lucide-react";
import { uploadImage } from "@/lib/services/upload-service";
import { slugify } from "@/lib/slugify";
import { toast } from "sonner";
import NextImage from "next/image";
import imageLoader from "@/lib/image-loader";
import {
  useForm,
  useFieldArray,
  SubmitHandler,
  UseFormReturn,
} from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { productSchema, ProductFormValues } from "@/lib/validations/product";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { ProductImageUpload } from "@/components/admin/product-image-upload";
import { cn } from "@/lib/utils";
import FlashImage from "@/components/ui/flash-image";
import { Category } from "@/types/store-types";
const RichTextEditor = dynamic(
  () =>
    import("@/components/admin/products/rich-text-editor").then(
      (mod) => mod.RichTextEditor,
    ),
  {
    ssr: false,
    loading: () => (
      <div className="h-[200px] w-full rounded-md border border-input bg-muted/20 animate-pulse flex items-center justify-center text-muted-foreground text-sm">
        Loading Editor...
      </div>
    ),
  },
);

const SIZE_OPTIONS = ["XS", "S", "M", "L", "XL", "XXL", "Oversized"];
const COLOR_OPTIONS = [
  "Black",
  "White",
  "Navy",
  "Beige",
  "Red",
  "Green",
  "Blue",
  "Pink",
  "Grey",
  "Yellow",
  "Purple",
];

interface ProductFormProps {
  initialData?: ProductFormValues & { id?: string };
  categories: Category[];
  isLoading: boolean;
  onSubmit: (data: ProductFormValues) => void;
  onCancel: () => void;
}

export function ProductForm({
  initialData,
  categories,
  isLoading,
  onSubmit,
  onCancel,
}: ProductFormProps) {
  const [isUploading, setIsUploading] = useState(false);

  // Form Initialization
  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: "",
      slug: "",
      description: "",
      price: 0,
      original_price: null,
      category_id: "",
      main_image_url: "",
      gallery_image_urls: [],
      expression_tags: [],
      is_active: true,
      images: undefined,
      variants: [],
    },
  });

  const { reset, handleSubmit, control } = form;

  // Handle initialData changes (e.g. when navigating between products in admin)
  useEffect(() => {
    if (initialData) {
      const { id, ...formData } = initialData;
      // Ensure we only pass fields that exist in ProductFormValues
      reset(formData as ProductFormValues);
    }
  }, [initialData, reset]);

  // Handle Submit with explicit typing for SubmitHandler
  const onFormSubmit: SubmitHandler<ProductFormValues> = (data) => {
    onSubmit(data);
  };

  const { fields, append, remove } = useFieldArray({
    control,
    name: "variants",
  });

  // Auto-generate slug watching name
  const { watch, setValue } = form;
  const name = watch("name");
  const slug = watch("slug");

  useEffect(() => {
    // Auto-generate slug if it's empty or was auto-generated from a previous name
    if (!initialData && name) {
      const currentSlug = form.getValues("slug");
      const expectedSlug = slugify(name);

      // Only update if current slug is empty or "looks like" it was auto-generated
      if (!currentSlug || currentSlug === slugify(name.slice(0, -1))) {
        setValue("slug", expectedSlug, { shouldValidate: true });
      }
    }
  }, [name, initialData, setValue]);

  // -- Handlers --
  const handleImageUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    type: "main" | "gallery",
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const publicUrl = await uploadImage(formData);

      if (type === "main") {
        setValue("main_image_url", publicUrl, { shouldValidate: true });
        toast.success("Main image uploaded");
      } else {
        const currentGallery = form.getValues("gallery_image_urls") || [];
        setValue("gallery_image_urls", [...currentGallery, publicUrl], {
          shouldValidate: true,
        });
        toast.success("Gallery image added");
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error";
      toast.error("Upload failed: " + message);
    } finally {
      setIsUploading(false);
      if (e.target) e.target.value = "";
    }
  };

  const removeGalleryImage = (idx: number) => {
    const currentGallery = form.getValues("gallery_image_urls");
    setValue(
      "gallery_image_urls",
      currentGallery.filter((_, i) => i !== idx),
    );
  };

  return (
    <Form {...form}>
      <form
        onSubmit={handleSubmit(onFormSubmit)}
        className="space-y-8 animate-in fade-in slide-in-from-bottom-5 duration-500 pb-20"
      >
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* LEFT COLUMN: Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* 1. General Info */}
            <Card>
              <CardHeader>
                <CardTitle>Product Details</CardTitle>
                <CardDescription>
                  Basic information about your product.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Product Name</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. Essential Tee" {...field} />
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
                      <FormLabel>Slug</FormLabel>
                      <FormControl>
                        <div className="flex">
                          <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-input bg-muted text-muted-foreground text-sm">
                            /product/
                          </span>
                          <Input
                            {...field}
                            className="rounded-l-none font-mono text-sm"
                            placeholder="essential-tee"
                          />
                        </div>
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <RichTextEditor
                          value={field.value || ""}
                          onChange={field.onChange}
                          placeholder="Describe your product..."
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* 2. Media */}
            <Card>
              <CardHeader>
                <CardTitle>Media Gallery</CardTitle>
                <CardDescription>
                  High-quality images for the storefront.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <FormLabel>Main Image</FormLabel>
                  <div className="flex flex-col gap-4">
                    <ProductImageUpload
                      currentImage={
                        form.watch("images")?.thumbnail ||
                        form.watch("main_image_url")
                      }
                      onUploadComplete={(urls) => {
                        setValue("images", urls);
                        setValue("main_image_url", urls.desktop);
                        toast.success("Optimized images saved");
                      }}
                      onRemove={() => {
                        setValue("images", undefined);
                        setValue("main_image_url", "");
                      }}
                    />
                    <FormField
                      name="main_image_url"
                      render={() => <FormMessage />}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <FormLabel>Gallery Images</FormLabel>
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-4">
                    {watch("gallery_image_urls")?.map((url, idx) => (
                      <div
                        key={idx}
                        className="relative aspect-square rounded-md overflow-hidden border group"
                      >
                        <FlashImage
                          src={url}
                          className="object-cover"
                          alt="Gallery"
                          fill
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <Button
                            type="button"
                            variant="destructive"
                            size="icon"
                            className="h-6 w-6"
                            onClick={() => removeGalleryImage(idx)}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    ))}
                    <div
                      className="aspect-square rounded-md border-2 border-dashed flex items-center justify-center hover:bg-muted/20 cursor-pointer transition-colors"
                      onClick={() =>
                        document.getElementById("gallery-upload")?.click()
                      }
                    >
                      {isUploading ? (
                        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                      ) : (
                        <Plus className="h-6 w-6 text-muted-foreground" />
                      )}
                      <Input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        id="gallery-upload"
                        onChange={(e) => handleImageUpload(e, "gallery")}
                        disabled={isUploading}
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 3. Variants */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div>
                  <CardTitle>Variants & Stock</CardTitle>
                  <CardDescription>
                    Manage available sizes and colors.
                  </CardDescription>
                </div>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() =>
                    append({ size: "M", color: "Black", quantity: 0 })
                  }
                >
                  <Plus className="mr-2 h-4 w-4" /> Add Variant
                </Button>
              </CardHeader>
              <CardContent>
                {fields.length === 0 ? (
                  <div className="text-center py-10 text-muted-foreground border-2 border-dashed rounded-lg">
                    No variants added yet. Click &quot;Add Variant&quot; to
                    start.
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Size</TableHead>
                        <TableHead>Color</TableHead>
                        <TableHead className="w-[100px]">Quantity</TableHead>
                        <TableHead className="w-[50px]"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {fields.map((field, idx) => (
                        <TableRow key={field.id}>
                          <TableCell>
                            <FormField
                              control={control}
                              name={`variants.${idx}.size`}
                              render={({ field }) => (
                                <Select
                                  onValueChange={field.onChange}
                                  value={field.value}
                                >
                                  <SelectTrigger className="h-8">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent className="bg-popover text-popover-foreground border shadow-md relative z-[100]">
                                    {SIZE_OPTIONS.map((s) => (
                                      <SelectItem
                                        key={s}
                                        value={s}
                                        className="cursor-pointer bg-white dark:bg-neutral-950 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                                      >
                                        {s}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              )}
                            />
                          </TableCell>
                          <TableCell>
                            <FormField
                              control={control}
                              name={`variants.${idx}.color`}
                              render={({ field }) => {
                                const isCustom = !COLOR_OPTIONS.includes(
                                  field.value,
                                );
                                return isCustom ? (
                                  <div className="flex gap-2">
                                    <Input
                                      {...field}
                                      placeholder="Color Name"
                                      className="h-8 text-xs"
                                      autoFocus
                                    />
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="icon"
                                      className="h-8 w-8 shrink-0 hover:text-destructive"
                                      onClick={() => field.onChange("Black")}
                                    >
                                      <X className="h-4 w-4" />
                                    </Button>
                                  </div>
                                ) : (
                                  <Select
                                    value={field.value}
                                    onValueChange={(val) =>
                                      val === "CUSTOM_TRIGGER"
                                        ? field.onChange("")
                                        : field.onChange(val)
                                    }
                                  >
                                    <SelectTrigger className="h-8 text-xs w-full">
                                      <div className="flex items-center gap-2">
                                        {field.value &&
                                          COLOR_OPTIONS.includes(
                                            field.value,
                                          ) && (
                                            <div
                                              className="h-3 w-3 rounded-full border border-muted-foreground/20 shadow-sm"
                                              style={{
                                                backgroundColor:
                                                  field.value.toLowerCase(),
                                              }}
                                            />
                                          )}
                                        <SelectValue
                                          placeholder={field.value}
                                        />
                                      </div>
                                    </SelectTrigger>
                                    <SelectContent className="bg-popover text-popover-foreground border shadow-md relative z-[100]">
                                      {COLOR_OPTIONS.map((c) => (
                                        <SelectItem
                                          key={c}
                                          value={c}
                                          className="cursor-pointer bg-popover hover:bg-accent focus:bg-accent focus:text-accent-foreground"
                                        >
                                          <div className="flex items-center gap-2">
                                            <div
                                              className="h-3 w-3 rounded-full border border-muted-foreground/20 shadow-sm"
                                              style={{
                                                backgroundColor:
                                                  c.toLowerCase(),
                                              }}
                                            />
                                            {c}
                                          </div>
                                        </SelectItem>
                                      ))}
                                      <SelectItem
                                        value="CUSTOM_TRIGGER"
                                        className="font-semibold text-primary focus:text-primary focus:bg-primary/5 border-t mt-1 cursor-pointer bg-popover"
                                      >
                                        <div className="flex items-center gap-2">
                                          <Plus className="h-3 w-3" />
                                          Custom Color...
                                        </div>
                                      </SelectItem>
                                    </SelectContent>
                                  </Select>
                                );
                              }}
                            />
                          </TableCell>
                          <TableCell>
                            <FormField
                              control={control}
                              name={`variants.${idx}.quantity`}
                              render={({ field }) => (
                                <Input
                                  type="number"
                                  className="h-8"
                                  {...field}
                                  onChange={(e) =>
                                    field.onChange(
                                      e.target.value === ""
                                        ? 0
                                        : Number(e.target.value),
                                    )
                                  }
                                />
                              )}
                            />
                          </TableCell>
                          <TableCell>
                            <Button
                              type="button"
                              size="icon"
                              variant="ghost"
                              className="h-8 w-8 text-muted-foreground hover:text-destructive"
                              onClick={() => remove(idx)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </div>

          {/* RIGHT COLUMN: Sidebar */}
          <div className="space-y-6">
            {/* Status */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">Status</CardTitle>
              </CardHeader>
              <CardContent>
                <FormField
                  control={control}
                  name="is_active"
                  render={({ field }) => (
                    <div className="flex items-center justify-between rounded-lg border p-3 shadow-sm">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Active</FormLabel>
                        <FormDescription>Store visibility.</FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </div>
                  )}
                />
              </CardContent>
            </Card>

            {/* Organization */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">
                  Organization
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={control}
                  name="price"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Price (₹)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          {...field}
                          onChange={(e) =>
                            field.onChange(
                              e.target.value === ""
                                ? 0
                                : Number(e.target.value),
                            )
                          }
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
                      <FormLabel>Original Price (MRP) (₹)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          placeholder="Optional MRP"
                          value={field.value || ""}
                          onChange={(e) =>
                            field.onChange(
                              e.target.value === ""
                                ? null
                                : Number(e.target.value),
                            )
                          }
                        />
                      </FormControl>
                      <FormDescription>
                        Shown with a strikethrough if greater than sale price.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={control}
                  name="category_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select..." />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="bg-popover text-popover-foreground border shadow-md relative z-[100]">
                          {categories.map((c) => (
                            <SelectItem
                              key={c.id}
                              value={c.id}
                              className="cursor-pointer bg-white dark:bg-neutral-950 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                            >
                              {c.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Actions (Sticky for Mobile) */}
            <div className="sticky bottom-6 flex flex-col gap-2">
              <Button
                type="submit"
                size="lg"
                className="w-full"
                disabled={isLoading || isUploading}
              >
                {isLoading ? (
                  <Loader2 className="animate-spin mr-2 h-4 w-4" />
                ) : (
                  <Save className="mr-2 h-4 w-4" />
                )}
                Save Changes
              </Button>
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={onCancel}
                disabled={isLoading}
              >
                Discard Changes
              </Button>
            </div>
          </div>
        </div>
      </form>
    </Form>
  );
}
