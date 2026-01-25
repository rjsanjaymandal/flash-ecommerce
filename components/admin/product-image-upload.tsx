"use client";

import { useState } from "react";
import { Upload, Loader2, X, RefreshCw } from "lucide-react";
import FlashImage from "@/components/ui/flash-image";
import { Button } from "@/components/ui/button";
import {
  uploadOptimizedImage,
  type OptimizedImages,
} from "@/app/actions/upload-images";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface ProductImageUploadProps {
  onUploadComplete: (urls: OptimizedImages) => void;
  onRemove: () => void;
  currentImage?: string | null; // Can be a string (URL) or part of OptimizedImages
  className?: string;
}

export function ProductImageUpload({
  onUploadComplete,
  onRemove,
  currentImage,
  className,
}: ProductImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(currentImage || null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const urls = await uploadOptimizedImage(formData);
      setPreview(urls.thumbnail);
      onUploadComplete(urls);
      toast.success("Image optimized & uploaded successfully!");
    } catch (error) {
      console.error("Upload failed:", error);
      toast.error("Failed to upload image. Please try again.");
    } finally {
      setIsUploading(false);
      // Reset input value to allow re-uploading same file if needed
      e.target.value = "";
    }
  };

  const handleRemove = () => {
    setPreview(null);
    onRemove();
  };

  return (
    <div className={cn("space-y-4", className)}>
      <div
        className={cn(
          "relative rounded-xl border-2 border-dashed border-muted-foreground/25 transition-all hover:bg-accent/50",
          isUploading && "opacity-50 pointer-events-none",
          !preview &&
            "h-64 flex flex-col items-center justify-center cursor-pointer",
          preview && "h-64 border-none bg-accent/20",
        )}
      >
        {isUploading ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
            <p className="mt-4 text-sm font-medium text-muted-foreground animate-pulse">
              Optimizing variants...
            </p>
          </div>
        ) : preview ? (
          <div className="relative w-full h-full group overflow-hidden rounded-xl">
            <FlashImage
              src={preview}
              alt="Product Preview"
              fill
              className="object-contain"
              sizes="(max-width: 768px) 100vw, 400px"
            />

            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-10 w-10 p-0 rounded-full bg-black/40 text-red-500 hover:text-red-400 hover:bg-black/60"
                onClick={handleRemove}
              >
                <X className="h-5 w-5" />
              </Button>
              <div className="relative">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-10 w-10 p-0 rounded-full bg-black/40 text-white hover:bg-black/60 pointer-events-none"
                >
                  <RefreshCw className="h-5 w-5" />
                </Button>
              </div>
            </div>

            <div className="absolute bottom-3 right-3 px-2 py-1 bg-black/60 text-white text-[10px] font-bold uppercase rounded-full backdrop-blur-sm">
              Optimized
            </div>
          </div>
        ) : (
          <label className="flex flex-col items-center justify-center w-full h-full cursor-pointer">
            <div className="p-4 rounded-full bg-accent text-accent-foreground mb-4 group-hover:scale-110 transition-transform">
              <Upload className="h-6 w-6" />
            </div>
            <p className="text-sm font-medium">Click to upload image</p>
            <p className="text-xs text-muted-foreground mt-2 text-center max-w-[200px]">
              We&apos;ll automatically generate thumbnail, mobile, and desktop
              variants.
            </p>
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
            />
          </label>
        )}
      </div>
    </div>
  );
}
