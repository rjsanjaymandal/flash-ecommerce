"use client";

import { useFormContext } from "react-hook-form";
import { FormField, FormItem, FormMessage } from "@/components/ui/form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ProductImageUpload } from "@/components/admin/product-image-upload";
import { DraggableMediaGrid } from "./draggable-media-grid";
import { useState } from "react";
import { uploadImage } from "@/lib/services/upload-service";
import { toast } from "sonner";

export function ProductMedia() {
  const { control, setValue, getValues } = useFormContext();
  const [isUploading, setIsUploading] = useState(false);

  const handleImageUpload = async (file: File) => {
    try {
      setIsUploading(true);
      const formData = new FormData();
      formData.append("file", file);

      const url = await uploadImage(formData);
      const currentGallery = getValues("gallery_image_urls") || [];
      const newGallery = [...currentGallery, url];

      setValue("gallery_image_urls", newGallery, { shouldDirty: true });

      // Separate bucket for main image logic if needed, but for now assuming first is main if not set
      if (!getValues("main_image_url")) {
        setValue("main_image_url", url);
      }

      toast.success("Image uploaded");
    } catch (error) {
      toast.error("Failed to upload image");
    } finally {
      setIsUploading(false);
    }
  };

  const handleMainImageUpload = async (file: File) => {
    // similar logic but for specific main image
    try {
      setIsUploading(true);
      const formData = new FormData();
      formData.append("file", file);
      const url = await uploadImage(formData);
      setValue("main_image_url", url, { shouldDirty: true });
      toast.success("Main image uploaded");
    } catch (error) {
      toast.error("Failed to upload image");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Media</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Main Image */}
        <FormField
          control={control}
          name="main_image_url"
          render={({ field }) => (
            <FormItem>
              <div className="mb-2 text-sm font-medium">Main Product Image</div>
              <ProductImageUpload
                currentImage={field.value}
                onUploadComplete={(urls) => {
                  // Use desktop url as main, or fallback
                  const url = urls.desktop || urls.mobile || urls.thumbnail;
                  field.onChange(url);
                  // Also update images object if needed, but schema uses main_image_url flat string primarily
                  // If we want to store object: setValue('images', urls)
                }}
                onRemove={() => field.onChange("")}
              />
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Gallery */}
        <FormField
          control={control}
          name="gallery_image_urls"
          render={({ field }) => (
            <FormItem>
              <div className="mb-2 text-sm font-medium">Gallery (Optional)</div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <DraggableMediaGrid
                  urls={field.value || []}
                  mainImageUrl={getValues("main_image_url")}
                  onUpdate={(newUrls) => field.onChange(newUrls)}
                  onSetMain={(url) => {
                    setValue("main_image_url", url, { shouldDirty: true });
                  }}
                />
                <label className="flex flex-col items-center justify-center aspect-square rounded-md border-2 border-dashed border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/10 cursor-pointer transition-colors">
                  <span className="text-xs text-muted-foreground font-medium text-center p-2">
                    {isUploading ? "Uploading..." : "+ Add Media"}
                  </span>
                  <input
                    type="file"
                    className="hidden"
                    accept="image/*"
                    multiple
                    onChange={(e) => {
                      if (e.target.files) {
                        Array.from(e.target.files).forEach(handleImageUpload);
                      }
                    }}
                  />
                </label>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />
      </CardContent>
    </Card>
  );
}
