'use server'

import { createClient } from '@/lib/supabase/server'
import sharp from 'sharp'
import { v4 as uuidv4 } from 'uuid'

export type OptimizedImages = {
  thumbnail: string
  mobile: string
  desktop: string
}

export async function uploadOptimizedImage(formData: FormData): Promise<OptimizedImages> {
  const file = formData.get('file') as File
  if (!file) {
    throw new Error('No file provided')
  }

  const arrayBuffer = await file.arrayBuffer()
  const buffer = Buffer.from(arrayBuffer)
  const baseUuid = uuidv4()
  
  // Create 3 variants
  const [thumbnailBuffer, mobileBuffer, desktopBuffer] = await Promise.all([
    // Thumbnail: 200x200 cover
    sharp(buffer)
      .resize(200, 200, { fit: 'cover' })
      .webp({ quality: 80 })
      .toBuffer(),
      
    // Mobile: 600px width
    sharp(buffer)
      .resize(600, null, { withoutEnlargement: true })
      .webp({ quality: 80 })
      .toBuffer(),

    // Desktop: 1200px width
    sharp(buffer)
      .resize(1200, null, { withoutEnlargement: true })
      .webp({ quality: 85 })
      .toBuffer()
  ])

  const supabase = await createClient()
  
  // Upload all 3
  const uploads = [
    { name: 'thumbnail', buffer: thumbnailBuffer },
    { name: 'mobile', buffer: mobileBuffer },
    { name: 'desktop', buffer: desktopBuffer }
  ]

  const urls: Partial<OptimizedImages> = {}

  for (const upload of uploads) {
    const fileName = `${baseUuid}-${upload.name}.webp`
    const { error } = await supabase.storage
      .from('products')
      .upload(fileName, upload.buffer, {
        contentType: 'image/webp',
        cacheControl: '3600',
        upsert: false
      })

    if (error) {
      console.error(`Error uploading ${upload.name}:`, error)
      throw new Error(`Failed to upload ${upload.name} image`)
    }

    const { data: { publicUrl } } = supabase.storage
      .from('products')
      .getPublicUrl(fileName)
      
    urls[upload.name as keyof OptimizedImages] = publicUrl
  }

  return urls as OptimizedImages
}
