'use server'

import { createAdminClient } from '@/lib/supabase/admin'

export async function uploadImage(formData: FormData) {
  const file = formData.get('file') as File
  const bucket = 'products'

  if (!file) {
      throw new Error('No file provided')
  }

  const supabase = createAdminClient()
  const fileExt = file.name.split('.').pop()
  const fileName = `prod_${Date.now()}_${Math.random()}.${fileExt}`

  // Convert File to ArrayBuffer for upload
  const arrayBuffer = await file.arrayBuffer()
  const buffer = Buffer.from(arrayBuffer)

  const { error } = await supabase.storage
      .from(bucket)
      .upload(fileName, buffer, {
          contentType: file.type,
          upsert: false
      })

  if (error) {
      console.error('Upload Error:', error)
      throw new Error('Upload failed: ' + error.message)
  }

  const { data: { publicUrl } } = supabase.storage
      .from(bucket)
      .getPublicUrl(fileName)

  return publicUrl
}
