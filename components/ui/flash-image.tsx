"use client";

import Image, { ImageProps } from "next/image";
import imageLoader from "@/lib/image-loader";
import { cn } from "@/lib/utils";

interface FlashImageProps extends Omit<ImageProps, "loader"> {
  /**
   * If true, bypasses the custom loader (useful for tiny local SVGs/icons)
   */
  unoptimized?: boolean;
}

/**
 * FLASH Optimized Image Component
 *
 * Automatically applies the project's global image loader for
 * Supabase, Unsplash, and local assets. Ensures consistency across
 * all devices and avoids Next.js configuration issues.
 */
export default function FlashImage({
  src,
  alt,
  className,
  unoptimized = false,
  ...props
}: FlashImageProps) {
  // If explicitly unoptimized or a tiny local asset we don't want to process
  if (unoptimized) {
    return (
      <Image src={src} alt={alt} className={className} unoptimized {...props} />
    );
  }

  // Determine if we should use the custom loader
  const shouldUseLoader =
    typeof src === "string" &&
    (src.startsWith("http") ||
      src.includes("supabase.co") ||
      src.includes("unsplash.com"));

  return (
    <Image
      loader={shouldUseLoader ? imageLoader : undefined}
      src={src}
      alt={alt}
      className={cn("bg-zinc-900/10", className)}
      {...props}
    />
  );
}
