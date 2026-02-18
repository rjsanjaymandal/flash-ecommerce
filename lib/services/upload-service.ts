'use server'

import cloudinary from '@/lib/cloudinary'

export async function uploadImage(formData: FormData) {
  try {
    const file = formData.get('file') as File
    if (!file) throw new Error('No file provided')

    // Convert File to Buffer
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    // Upload to Cloudinary using a Promise-wrapped stream
    const result = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: 'products',
          resource_type: 'auto',
          // Optional: Add auto-optimization or transformations on upload if needed
          // quality: 'auto',
          // fetch_format: 'auto'
        },
        (error, result) => {
          if (error) reject(error)
          else resolve(result)
        }
      )
      uploadStream.end(buffer)
    }) as any

    return result.secure_url
  } catch (err) {
    console.error('[uploadImage] Cloudinary Upload Failed:', err)
    throw new Error('Image upload service failed. Please check Cloudinary configuration.')
  }
}
