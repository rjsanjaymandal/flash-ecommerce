"use client";

import type { ImageLoaderProps } from "next/image";

/**
 * FLASH Image Loader - Bug-free & Professional
 * Handles Cloudinary, Unsplash, Supabase, and local fallbacks.
 */
export default function myImageLoader({
  src,
  width,
  quality = 75,
}: ImageLoaderProps) {
  // 1. Skip optimization for local assets, data URLs, or empty strings
  if (!src || src.startsWith("data:") || src.startsWith("/")) {
    return src;
  }

  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  
  // Use professional quality/format defaults
  const transformations = [
    `w_${width}`,
    `q_${quality === 75 ? "auto" : quality}`,
    "f_auto",
    "dpr_auto",
  ].join(",");

  try {
    const url = new URL(src);
    const hostname = url.hostname;

    // 2. Optimized Cloudinary Native Handling
    if (hostname.includes("res.cloudinary.com") && cloudName) {
      const pathSegments = url.pathname.split("/");
      const uploadIndex = pathSegments.indexOf("upload");

      if (uploadIndex !== -1) {
        const publicId = pathSegments.slice(uploadIndex + 1).join("/");
        
        // Handle resize mode hints from URL search params
        let resizeTransform = "c_limit";
        const internalResize = url.searchParams.get("resize");
        if (internalResize === "cover") {
          resizeTransform = "c_fill,g_auto";
        } else if (internalResize === "contain") {
          resizeTransform = "c_pad,b_auto";
        }

        return `https://res.cloudinary.com/${cloudName}/image/upload/${transformations},${resizeTransform}/${publicId}`;
      }
    }

    // 3. Fallback: Proxy everything else through Cloudinary 'fetch'
    // This allows us to optimize Unsplash, Supabase, and other external sources for free
    if (cloudName) {
      const encodedUrl = encodeURIComponent(src);
      return `https://res.cloudinary.com/${cloudName}/image/fetch/${transformations},c_limit/${encodedUrl}`;
    }

    // 4. Ultimate Fallback (if cloudName missing)
    return src;
  } catch (error) {
    // If URL parsing fails, return original src
    return src;
  }
}
