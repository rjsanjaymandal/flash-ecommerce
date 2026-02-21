"use client";

import { useFormContext } from "react-hook-form";
import { FormField, FormItem, FormMessage } from "@/components/ui/form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ProductImageUpload } from "@/components/admin/product-image-upload";
import { DraggableMediaGrid } from "./draggable-media-grid";
import { useState } from "react";
import { uploadImage } from "@/lib/services/upload-service";
import { toast } from "sonner";
import { Link2, Plus, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

export function ProductMedia() {
  const { control, setValue, getValues, watch } = useFormContext();
  const [isUploading, setIsUploading] = useState(false);
  const [urlInput, setUrlInput] = useState("");
  const [isAddingUrl, setIsAddingUrl] = useState(false);

  const handleMultipleUploads = async (files: File[]) => {
    try {
      setIsUploading(true);
      const uploadPromises = files.map(async (file) => {
        const formData = new FormData();
        formData.append("file", file);
        try {
          return await uploadImage(formData);
        } catch (err) {
          console.error("Upload failed for file:", file.name, err);
          return null;
        }
      });

      const results = await Promise.all(uploadPromises);
      const successfulUrls = results.filter((url): url is string => !!url);

      if (successfulUrls.length === 0) {
        toast.error("All uploads failed");
        return;
      }

      const currentGallery = getValues("gallery_image_urls") || [];
      const updatedGallery = [...currentGallery, ...successfulUrls];

      setValue("gallery_image_urls", updatedGallery, { shouldDirty: true });

      if (!getValues("main_image_url") && updatedGallery.length > 0) {
        setValue("main_image_url", updatedGallery[0], { shouldDirty: true });
      }

      if (successfulUrls.length < files.length) {
        toast.warning(
          `Uploaded ${successfulUrls.length} of ${files.length} images.`,
        );
      } else {
        toast.success(`${successfulUrls.length} images uploaded`);
      }
    } catch (error) {
      toast.error("Failed to process uploads");
    } finally {
      setIsUploading(false);
    }
  };

  const handleAddUrl = () => {
    if (!urlInput) return;

    // Basic URL Validation
    try {
      if (!urlInput.startsWith("http")) throw new Error("Invalid protocol");
      new URL(urlInput);
    } catch (_) {
      toast.error("Invalid URL format. Please provide a full HTTP/HTTPS link.");
      return;
    }

    const currentGallery = getValues("gallery_image_urls") || [];
    const newGallery = [...currentGallery, urlInput];
    setValue("gallery_image_urls", newGallery, { shouldDirty: true });

    // Sync main if not set
    if (!getValues("main_image_url")) {
      setValue("main_image_url", urlInput, { shouldDirty: true });
    }

    setUrlInput("");
    setIsAddingUrl(false);
    toast.success("Image added from URL");
  };

  return (
    <Card className="rounded-none border-2">
      <CardHeader>
        <CardTitle>Media</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Gallery & Media Management */}
        <FormField
          control={control}
          name="gallery_image_urls"
          render={({ field }) => (
            <FormItem>
              <div className="flex justify-between items-center mb-4">
                <div className="space-y-1">
                  <div className="text-sm font-bold uppercase tracking-widest font-mono">
                    Product Gallery
                  </div>
                  <p className="text-[10px] text-muted-foreground font-mono uppercase">
                    Drag to reorder. The first image is the primary storefront
                    visual.
                  </p>
                </div>

                <div className="flex gap-2">
                  <Popover open={isAddingUrl} onOpenChange={setIsAddingUrl}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8 rounded-none border-2 border-black font-mono text-[10px] uppercase tracking-widest gap-2"
                      >
                        <Link2 className="h-3 w-3" />
                        URL
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent
                      className="w-80 rounded-none border-2 border-black p-4 shadow-2xl"
                      align="end"
                    >
                      <div className="space-y-4">
                        <div className="space-y-1">
                          <h4 className="font-mono font-black text-xs uppercase">
                            Add from URL
                          </h4>
                          <p className="text-[10px] text-muted-foreground font-mono uppercase">
                            Paste a public image link below.
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <Input
                            placeholder="https://..."
                            value={urlInput}
                            onChange={(e) => setUrlInput(e.target.value)}
                            className="h-8 text-xs font-mono rounded-none border-foreground/20"
                          />
                          <Button
                            size="sm"
                            onClick={handleAddUrl}
                            className="h-8 rounded-none font-bold text-[10px] uppercase"
                          >
                            Add
                          </Button>
                        </div>
                      </div>
                    </PopoverContent>
                  </Popover>

                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 rounded-none border-2 border-black font-mono text-[10px] uppercase tracking-widest gap-2 relative overflow-hidden group"
                    asChild
                  >
                    <label className="cursor-pointer">
                      {isUploading ? (
                        <Loader2 className="h-3 w-3 animate-spin" />
                      ) : (
                        <Plus className="h-3 w-3" />
                      )}
                      Upload
                      <input
                        type="file"
                        className="hidden"
                        accept="image/*"
                        multiple
                        onChange={(e) => {
                          if (e.target.files) {
                            handleMultipleUploads(Array.from(e.target.files));
                          }
                        }}
                      />
                    </label>
                  </Button>
                </div>
              </div>

              <div className="p-4 border-2 border-black bg-muted/5 min-h-[200px] rounded-none">
                <DraggableMediaGrid
                  urls={field.value || []}
                  mainImageUrl={watch("main_image_url")}
                  onUpdate={(newUrls) => {
                    field.onChange(newUrls);
                    // Automatically sync first image as main
                    if (newUrls.length > 0) {
                      setValue("main_image_url", newUrls[0], {
                        shouldDirty: true,
                      });
                    }
                  }}
                  onSetMain={(url) => {
                    setValue("main_image_url", url, { shouldDirty: true });
                  }}
                />

                {(field.value || []).length === 0 && !isUploading && (
                  <div className="h-32 flex flex-col items-center justify-center border-2 border-dashed border-muted-foreground/20 text-muted-foreground">
                    <p className="text-[10px] font-mono uppercase tracking-widest">
                      No media added yet
                    </p>
                  </div>
                )}

                {isUploading && (
                  <div className="mt-4 flex items-center justify-center gap-2 text-xs font-mono uppercase text-muted-foreground animate-pulse">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Processing uploads...
                  </div>
                )}
              </div>
              <FormMessage />
            </FormItem>
          )}
        />
      </CardContent>
    </Card>
  );
}
