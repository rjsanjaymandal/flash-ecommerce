"use client";

import Image, { ImageProps } from "next/image";
import { useState } from "react";
import imageLoader from "@/lib/image-loader";
import { cn } from "@/lib/utils";

interface FlashImageProps extends Omit<ImageProps, "loader"> {
  /**
   * If true, bypasses the custom loader (useful for tiny local SVGs/icons)
   */
  unoptimized?: boolean;
  /**
   * Specific resize mode hint for the loader
   * 'cover' = fill container, crop if needed
   * 'contain' = fit inside container, no cropping
   */
  resizeMode?: "cover" | "contain" | "fill";
  /**
   * Optional placeholder strategy
   */
  fallbackSrc?: string;
}

/**
 * FLASH Optimized Image Component - Bug-free & Professional
 *
 * Automatically applies the project's global image loader for
 * Supabase, Unsplash, and Cloudinary. Includes robust error recovery.
 */
export default function FlashImage({
  src,
  alt,
  className,
  unoptimized = false,
  resizeMode = "cover",
  fallbackSrc = "/placeholder.svg",
  ...props
}: FlashImageProps) {
  const [error, setError] = useState(false);

  // 1. Host Detection (Domain Based)
  let isGooglePhotos = false;
  let isUnsplash = false;
  let isSupabase = false;
  let isCloudinary = false;

  if (typeof src === "string" && src.startsWith("http")) {
    try {
      const url = new URL(src);
      const host = url.hostname;
      isGooglePhotos =
        host.includes("googleusercontent.com") ||
        host.includes("photos.google.com");
      isUnsplash = host.includes("unsplash.com");
      isSupabase =
        host.includes("supabase.co") &&
        url.pathname.includes("/storage/v1/object/public");
      isCloudinary = host.includes("res.cloudinary.com");
    } catch (e) {
      // Not a valid URL, treat as generic or fallback
    }
  }

  // 2. Unoptimization & Recovery Logic
  const finalUnoptimized =
    unoptimized || isGooglePhotos || error || typeof src !== "string";
  const finalSrc = error || typeof src !== "string" ? fallbackSrc : src;

  // 3. Manual URL Encoding (Hardened)
  let safeSrc = finalSrc;
  if (
    typeof finalSrc === "string" &&
    finalSrc.startsWith("http") &&
    finalSrc.includes(" ")
  ) {
    try {
      const url = new URL(finalSrc);
      url.pathname = url.pathname
        .split("/")
        .map((segment) => encodeURIComponent(decodeURIComponent(segment)))
        .join("/");
      safeSrc = url.toString();
    } catch (e) {
      safeSrc = finalSrc.replace(/ /g, "%20");
    }
  }

  // 4. Styles
  const objectFitClass =
    resizeMode === "cover"
      ? "object-cover"
      : resizeMode === "contain"
        ? "object-contain"
        : resizeMode === "fill"
          ? "object-fill"
          : "";

  const baseClass = cn(
    "bg-zinc-900/10 transition-opacity duration-300",
    objectFitClass,
    className,
  );

  // 5. Rendering
  const shouldUseLoader =
    !finalUnoptimized && (isUnsplash || isSupabase || isCloudinary);

  // Append resize hint to URL for the loader if needed
  let loaderSrc = safeSrc;
  if (
    shouldUseLoader &&
    resizeMode &&
    typeof safeSrc === "string" &&
    !safeSrc.includes("resize=")
  ) {
    try {
      const url = new URL(safeSrc);
      url.searchParams.set("resize", resizeMode);
      loaderSrc = url.toString();
    } catch (e) {
      // Fallback
    }
  }

  return (
    <Image
      loader={shouldUseLoader ? imageLoader : undefined}
      src={loaderSrc}
      alt={alt || "Product Image"}
      className={baseClass}
      unoptimized={finalUnoptimized}
      onError={() => {
        console.warn(
          `[FlashImage] Failed to load optimized image: ${src}. Falling back.`,
        );
        setError(true);
      }}
      {...props}
    />
  );
}
