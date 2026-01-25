"use client";

import type { ImageLoaderProps } from 'next/image'

export default function myImageLoader({ src, width, quality }: ImageLoaderProps) {
  // Handle Unsplash images
  if (src.includes('unsplash.com')) {
    const url = new URL(src)
    url.searchParams.set('w', width.toString())
    url.searchParams.set('q', (quality || 75).toString())
    url.searchParams.set('auto', 'format,compress')
    return url.toString()
  }

  // Handle Supabase Storage images
  // Example: https://gyizmixhmrfwywvafdbi.supabase.co/storage/v1/object/public/products/image.jpg
  if (src.includes('supabase.co/storage/v1/object/public')) {
    const url = new URL(src)
    
    // Supabase specific transformation params
    // Documentation: https://supabase.com/docs/guides/storage/serving/image-transformations
    url.searchParams.set('width', width.toString())
    url.searchParams.set('quality', (quality || 75).toString())
    
    // Extract resize mode from internal hints if present
    const internalResize = url.searchParams.get('resize')
    if (internalResize) {
      url.searchParams.set('resize', internalResize)
    } else {
      url.searchParams.set('resize', 'cover') // Default to cover
    }

    return url.toString()
  }
  
  return src
}
