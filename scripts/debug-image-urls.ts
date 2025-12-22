
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://gyizmixhmrfwywvafdbi.supabase.co'
const supabaseAnonKey = 'sb_publishable_J7XVC8I7VhmAvUhKH-Qu3A_uBeLMkt8'

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function checkImages() {
  console.log('--- Checking Product Images ---')
  const { data: prods, error } = await supabase
    .from('products')
    .select('id, name, main_image_url')
    .limit(5)

  if (error) {
    console.error('Error fetching products:', error)
    return
  }

  prods.forEach(p => {
    console.log(`Product: ${p.name}`)
    console.log(`Main Image: ${p.main_image_url}`)
    console.log('-------------------')
  })
}

checkImages()
