"use client";

import Image, { ImageProps } from "next/image";
import imageLoader from "@/lib/image-loader";
import { cn } from "@/lib/utils";

interface FlashImageProps extends Omit<ImageProps, "loader"> {
  /**
   * If true, bypasses the custom loader (useful for tiny local SVGs/icons)
   */
  unoptimized?: boolean;
  /**
   * Specific resize mode for Supabase/Unsplash
   * 'cover' = fill container, crop if needed
   * 'contain' = fit inside container, no cropping
   */
  resizeMode?: "cover" | "contain" | "fill";
  /**
   * Optional height hint for the loader
   */
  heightHint?: number;
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
  resizeMode,
  heightHint,
  ...props
}: FlashImageProps) {
  // Determine if it's an external URL
  const isExternal = typeof src === "string" && src.startsWith("http");
  const isUnsplash = typeof src === "string" && src.includes("unsplash.com");

  // Force unoptimized for ALL external images except Unsplash and Supabase to bypass proxy issues
  // This ensures 100% reliability for other third-party hosts
  const isSupabase =
    typeof src === "string" &&
    src.includes("supabase.co/storage/v1/object/public");
  const isCloudinary =
    typeof src === "string" && src.includes("res.cloudinary.com");
  const isPexels = typeof src === "string" && src.includes("images.pexels.com");
  const isRemote = typeof src === "string" && src.includes("images.remote.com");

  const finalUnoptimized =
    unoptimized ||
    (isExternal &&
      !isUnsplash &&
      !isSupabase &&
      !isCloudinary &&
      !isPexels &&
      !isRemote);

  // Manual URL encoding for spaces and special characters to prevent browser parsing errors
  let safeSrc = src;
  if (typeof src === "string" && src.startsWith("http")) {
    try {
      // Only encode part of the URL to avoid breaking the protocol/hostname
      const url = new URL(src);
      url.pathname = url.pathname
        .split("/")
        .map((segment) => encodeURIComponent(decodeURIComponent(segment)))
        .join("/");
      safeSrc = url.toString();
    } catch (e) {
      // Fallback: simple space replacement if URL constructor fails
      safeSrc = src.replace(/ /g, "%20");
    }
  }

  // If explicitly unoptimized or a tiny local asset we don't want to process
  if (finalUnoptimized) {
    // Map resizeMode to CSS classes even for unoptimized images
    const objectFitClass =
      resizeMode === "cover"
        ? "object-cover"
        : resizeMode === "contain"
          ? "object-contain"
          : resizeMode === "fill"
            ? "object-fill"
            : "";

    return (
      <Image
        src={safeSrc}
        alt={alt}
        className={cn("bg-zinc-900/10", objectFitClass, className)}
        unoptimized
        {...props}
      />
    );
  }

  // Determine if we should use the custom loader
  const shouldUseLoader = isUnsplash || isSupabase || isCloudinary;

  // Inject transformation hints into the src URL for the loader to pick up
  let finalSrc = safeSrc;
  if (shouldUseLoader && typeof safeSrc === "string") {
    try {
      const url = new URL(src, "http://n"); // dummy base for relative-looking strings
      if (resizeMode) url.searchParams.set("resize", resizeMode);
      if (heightHint) url.searchParams.set("height", heightHint.toString());

      // If it was a real URL, use the full string, otherwise just the search part
      finalSrc = src.startsWith("http")
        ? url.toString()
        : src.split("?")[0] + url.search;
    } catch (e) {
      // Fallback to original src if URL parsing fails
    }
  }

  // Map resizeMode to CSS classes
  const objectFitClass =
    resizeMode === "cover"
      ? "object-cover"
      : resizeMode === "contain"
        ? "object-contain"
        : resizeMode === "fill"
          ? "object-fill"
          : "";

  return (
    <Image
      loader={shouldUseLoader ? imageLoader : undefined}
      src={finalSrc}
      alt={alt}
      className={cn("bg-zinc-900/10", objectFitClass, className)}
      {...props}
      priority={props.priority}
      fetchPriority={props.priority ? "high" : "auto"}
    />
  );
}
