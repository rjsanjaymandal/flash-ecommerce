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

export async function deleteImage(url: string) {
  try {
    if (!url.includes('cloudinary.com')) return { success: false, error: 'Not a Cloudinary URL' }

    // Extract public_id from Cloudinary URL
    // Format: https://res.cloudinary.com/cloud_name/image/upload/v12345/folder/id.jpg
    const parts = url.split('/')
    const lastPart = parts[parts.length - 1]
    const folder = parts[parts.length - 2]
    const publicIdWithExtension = `${folder}/${lastPart}`
    const publicId = publicIdWithExtension.split('.')[0]

    const result = await cloudinary.uploader.destroy(publicId)
    return { success: result.result === 'ok' }
  } catch (err) {
    console.error('[deleteImage] Cloudinary Deletion Failed:', err)
    return { success: false, error: (err as Error).message }
  }
}
