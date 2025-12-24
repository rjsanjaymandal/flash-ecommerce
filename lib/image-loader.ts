import type { ImageLoaderProps } from 'next/image'

export default function myImageLoader({ src, width, quality }: ImageLoaderProps) {
  // 1. Handle Supabase Storage Images
  // Transform: .../storage/v1/object/public/bucket/file.webp -> .../storage/v1/render/image/public/bucket/file.webp
  if (src.includes('supabase.co/storage/v1/object/public')) {
    const newSrc = src.replace('/object/public', '/render/image/public')
    return `${newSrc}?width=${width}&quality=${quality || 75}`
  }

  // 2. Handle Unsplash Images
  if (src.includes('unsplash.com')) {
    const url = new URL(src)
    url.searchParams.set('w', width.toString())
    url.searchParams.set('q', (quality || 75).toString())
    url.searchParams.set('auto', 'format')
    return url.toString()
  }

  // 3. Keep local images as-is
  if (src.startsWith('/')) {
    return src
  }
  
  return src
}
