import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import fs from 'fs'
dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function debugImages() {
  let output = '--- Product Image Audit ---\n'
  const { data: products, error } = await supabase
    .from('products')
    .select('id, name, main_image_url, gallery_image_urls')
    .limit(100)

  if (error) {
    output += `Error fetching products: ${error.message}\n`
  } else {
    products.forEach(p => {
      output += `Product: ${p.name} (${p.id})\n`
      output += `  Main: ${p.main_image_url}\n`
      if (!p.main_image_url) output += '  ⚠️ MISSING MAIN IMAGE\n'
      else if (!p.main_image_url.startsWith('http')) output += '  ❌ RELATIVE PATH DETECTED\n'
      else if (p.main_image_url.includes(' ')) output += '  ⚠️ UNENCODED SPACE DETECTED\n'

      if (p.gallery_image_urls && Array.isArray(p.gallery_image_urls)) {
          p.gallery_image_urls.forEach((url, i) => {
              output += `  Gallery[${i}]: ${url}\n`
              if (url && url.includes(' ')) output += `  ⚠️ Gallery[${i}] UNENCODED SPACE DETECTED\n`
          })
      }
    })
  }

  fs.writeFileSync('debug_images_output.txt', output, 'utf8')
  console.log('Done mapping images to debug_images_output.txt')
}

debugImages()
