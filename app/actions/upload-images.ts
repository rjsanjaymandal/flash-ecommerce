'use server'

import cloudinary from "@/lib/cloudinary";

export type OptimizedImages = {
  thumbnail: string;
  mobile: string;
  desktop: string;
};

/**
 * Standardized Image Upload Utility (Cloudinary Version)
 *
 * 1. Uploads original image to Cloudinary
 * 2. Cloudinary handles WebP conversion, stripping metadata, and resizing on-the-fly
 */
export async function uploadOptimizedImage(
  formData: FormData,
  folder: string = "products",
): Promise<OptimizedImages> {
  const file = formData.get("file") as File;
  if (!file) {
    throw new Error("No file provided");
  }

  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  // Upload to Cloudinary using a stream
  const uploadResult = (await new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: folder,
        resource_type: "auto",
        tags: [folder, 'flash-ecommerce'],
        unique_filename: true,
        use_filename: true,
      },
      (error, result) => {
        if (error) reject(error);
        else resolve(result);
      },
    );
    uploadStream.end(buffer);
  })) as any;

  if (!uploadResult || !uploadResult.secure_url) {
    throw new Error("Cloudinary upload failed");
  }

  const publicUrl = uploadResult.secure_url;

  // With Cloudinary, we use the same URL for all variants.
  // The FlashImage component / imageLoader will append transformation parameters dynamically.
  return {
    thumbnail: publicUrl,
    mobile: publicUrl,
    desktop: publicUrl,
  };
}

