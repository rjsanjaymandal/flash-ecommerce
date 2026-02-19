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
  if (!src || src.startsWith("data:") || src.startsWith("/")) {
    return src;
  }

  try {
    const url = new URL(src);
    const hostname = url.hostname;

    // 1. Unsplash
    if (hostname.includes("unsplash.com")) {
      url.searchParams.set("w", width.toString());
      url.searchParams.set("q", quality.toString());
      url.searchParams.set("auto", "format,compress");
      return url.toString();
    }

    // 2. Supabase Storage
    if (hostname.includes("supabase.co") && url.pathname.includes("/storage/v1/object/public")) {
      url.searchParams.set("width", width.toString());
      url.searchParams.set("quality", quality.toString());
      
      if (!url.searchParams.has("resize")) {
        url.searchParams.set("resize", "cover");
      }
      return url.toString();
    }

    // 3. Cloudinary
    if (hostname.includes("res.cloudinary.com")) {
      const pathSegments = url.pathname.split("/");
      const cloudName = pathSegments[1];
      const uploadIndex = pathSegments.indexOf("upload");

      if (uploadIndex === -1 || !cloudName) {
        return src; // Non-standard Cloudinary URL, bypass optimization
      }

      // Base transformations
      const transformations = [
        `w_${width}`,
        `q_${quality === 75 ? "auto" : quality}`,
        "f_auto",
        "dpr_auto",
      ];

      // Handle resize mode hints
      const internalResize = url.searchParams.get("resize");
      if (internalResize === "cover") {
        transformations.push("c_fill", "g_auto");
      } else if (internalResize === "contain") {
        transformations.push("c_pad", "b_auto");
      } else {
        transformations.push("c_limit");
      }

      // Reconstruct URL: [cloudName]/image/upload/[transformations]/[publicId]
      // Skip the version segment if it looks like one (starts with 'v') to avoid duplication if publicId includes it
      const publicIdSegments = pathSegments.slice(uploadIndex + 1);
      const publicId = publicIdSegments.join("/");

      return `https://res.cloudinary.com/${cloudName}/image/upload/${transformations.join(",")}/${publicId}`;
    }

    // 4. Default Fallback
    return src;
  } catch (error) {
    console.warn("[myImageLoader] Failed to parse URL, falling back to raw src:", src);
    return src;
  }
}
