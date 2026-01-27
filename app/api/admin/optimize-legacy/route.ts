import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import sharp from 'sharp'
import { v4 as uuidv4 } from 'uuid'

// Function to download image from URL to Buffer
async function downloadImage(url: string): Promise<Buffer> {
  const response = await fetch(url)
  if (!response.ok) throw new Error(`Failed to download image: ${response.statusText}`)
  const arrayBuffer = await response.arrayBuffer()
  return Buffer.from(arrayBuffer)
}

export async function POST(req: Request) {
  const supabase = await createClient()
  
  // 0. Security Check: Verify Admin
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (profile?.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }
  
  // 1. Fetch products needing optimization (where images is null/empty but has main_image_url)
  // Note: We use raw query or filter in JS since JSONB null checks can be tricky in simple SDK
  const { data: products, error } = await supabase
    .from('products')
    .select('*')
    .not('main_image_url', 'is', null)
  
  if (error || !products) {
    return NextResponse.json({ error: error?.message || 'No products found' }, { status: 500 })
  }

  // Filter for ones that lack the new 'images' structure
  const legacyProducts = products.filter((p) => {
    const images = (p as any).images
    // Check if images is empty or missing required keys
    return !images || !images.thumbnail || !images.desktop || Object.keys(images).length === 0
  })

  // Limit batch size to avoid timeout
  const BATCH_SIZE = 5 // Process 5 at a time for safety
  const productsToProcess = legacyProducts.slice(0, BATCH_SIZE)
  const results = []

  for (const product of productsToProcess) {
    try {
      if (!product.main_image_url) continue

      console.log(`Processing product: ${product.name} (${product.id})`)
      const buffer = await downloadImage(product.main_image_url)
      const baseUuid = uuidv4()

      // Generate Variants
      const [thumbnailBuffer, mobileBuffer, desktopBuffer] = await Promise.all([
        sharp(buffer).resize(200, 200, { fit: 'cover' }).webp({ quality: 80 }).toBuffer(),
        sharp(buffer).resize(600, null, { withoutEnlargement: true }).webp({ quality: 80 }).toBuffer(),
        sharp(buffer).resize(1200, null, { withoutEnlargement: true }).webp({ quality: 85 }).toBuffer()
      ])

      // Upload Variants
      const uploads = [
        { name: 'thumbnail', buffer: thumbnailBuffer },
        { name: 'mobile', buffer: mobileBuffer },
        { name: 'desktop', buffer: desktopBuffer }
      ]

      const urls: Record<string, string> = {}

      for (const upload of uploads) {
        const fileName = `${baseUuid}-${upload.name}.webp`
        const { error: uploadError } = await supabase.storage
          .from('products')
          .upload(fileName, upload.buffer, {
             contentType: 'image/webp',
             cacheControl: '3600',
             upsert: false
          })
        
        if (uploadError) throw uploadError

        const { data: { publicUrl } } = supabase.storage
            .from('products')
            .getPublicUrl(fileName)
        
        urls[upload.name] = publicUrl
      }

      // Update Database
      const { error: updateError } = await supabase
        .from('products')
        .update({ 
            images: urls,
            // We can optionally keep the desktop URL as the main_image_url to ensure high-res fallback
            main_image_url: urls.desktop 
        })
        .eq('id', product.id)

      if (updateError) throw updateError

      results.push({ id: product.id, status: 'success', name: product.name })

    } catch (err: any) {
      console.error(`Failed to process product ${product.id}:`, err)
      results.push({ id: product.id, status: 'error', error: err.message })
    }
  }

  return NextResponse.json({
    processed_count: results.length,
    remaining_count: legacyProducts.length - results.length,
    results
  })
}
