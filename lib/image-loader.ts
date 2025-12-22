'use client'

import type { ImageLoaderProps } from 'next/image'

export default function myImageLoader({ src, width, quality }: ImageLoaderProps) {
  // 1. Handle Supabase Storage Images
  // Transform: .../storage/v1/object/public/... -> .../storage/v1/render/image/public/...
  if (src.includes('supabase.co/storage/v1/object/public')) {
    const newSrc = src.replace('/object/public', '/render/image/public')
    return `${newSrc}?width=${width}&quality=${quality || 75}`
  }

  // 2. Handle Unsplash Images
  if (src.includes('unsplash.com')) {
    // Unsplash uses '&' or '?' depending on existing params, but standard unmodified unsplash links often have ?auto=format
    // We'll safe-append.
    const separator = src.includes('?') ? '&' : '?'
    return `${src}${separator}w=${width}&q=${quality || 75}&auto=format`
  }

  // 3. Fallback for Local or Other Images
  // If the src starts with '/', it's a local asset. 
  // We can just return it. Next.js optimization won't run on it with a custom loader 
  // unless we use a service, but for static assets like logos, this is fine.
  if (src.startsWith('/')) {
    return src
  }
  
  // 4. Default fallback
  return `${src}?width=${width}`
}
