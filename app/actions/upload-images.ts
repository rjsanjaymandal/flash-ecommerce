'use server'

import { createClient } from '@/lib/supabase/server'
import sharp from 'sharp'
import { v4 as uuidv4 } from 'uuid'

export type OptimizedImages = {
  thumbnail: string
  mobile: string
  desktop: string
}

/**
 * Standardized Image Upload Utility
 * 
 * Automatically:
 * 1. Converts to WebP
 * 2. Strips Metadata
 * 3. Resizes to predefined breakpoints
 * 4. Uploads to Supabase Storage
 */
export async function uploadOptimizedImage(
    formData: FormData, 
    bucketName: string = 'products',
    options: {
        quality?: number,
        maxWidth?: number,
        generateVariants?: boolean
    } = {}
): Promise<OptimizedImages> {
  const file = formData.get('file') as File
  if (!file) {
    throw new Error('No file provided')
  }

  const {
      quality = 85,
      maxWidth = 1600,
      generateVariants = true
  } = options

  const arrayBuffer = await file.arrayBuffer()
  const buffer = Buffer.from(arrayBuffer)
  const baseUuid = uuidv4()
  
  const supabase = await createClient()
  
  if (!generateVariants) {
      // Single Optimized Upload
      const optimizedBuffer = await sharp(buffer)
          .resize(maxWidth, null, { withoutEnlargement: true })
          .webp({ quality })
          .toBuffer()
      
      const fileName = `${baseUuid}.webp`
      const { error } = await supabase.storage
          .from(bucketName)
          .upload(fileName, optimizedBuffer, {
              contentType: 'image/webp',
              cacheControl: '31536000', // 1 year
              upsert: false
          })

      if (error) throw error

      const { data: { publicUrl } } = supabase.storage
          .from(bucketName)
          .getPublicUrl(fileName)

      return {
          thumbnail: publicUrl,
          mobile: publicUrl,
          desktop: publicUrl
      }
  }

  // Create 3 standard variants
  const [thumbnailBuffer, mobileBuffer, desktopBuffer] = await Promise.all([
    // Thumbnail: 300x300 center-cropped
    sharp(buffer)
      .resize(300, 300, { fit: 'cover', position: 'center' })
      .webp({ quality: 80 })
      .toBuffer(),
      
    // Mobile: 750px width (standard for modern mobile displays)
    sharp(buffer)
      .resize(750, null, { withoutEnlargement: true })
      .webp({ quality: 80 })
      .toBuffer(),

    // Desktop: 1600px width (standard high-res)
    sharp(buffer)
      .resize(1600, null, { withoutEnlargement: true })
      .webp({ quality: 85 })
      .toBuffer()
  ])

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
      .from(bucketName)
      .upload(fileName, upload.buffer, {
        contentType: 'image/webp',
        cacheControl: '31536000',
        upsert: false
      })

    if (error) {
      console.error(`Error uploading ${upload.name}:`, error)
      throw new Error(`Failed to upload ${upload.name} image`)
    }

    const { data: { publicUrl } } = supabase.storage
      .from(bucketName)
      .getPublicUrl(fileName)
      
    urls[upload.name as keyof OptimizedImages] = publicUrl
  }

  return urls as OptimizedImages
}
