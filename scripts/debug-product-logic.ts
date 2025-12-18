
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://gyizmixhmrfwywvafdbi.supabase.co'
const supabaseAnonKey = 'sb_publishable_J7XVC8I7VhmAvUhKH-Qu3A_uBeLMkt8'

const supabase = createClient(supabaseUrl, supabaseAnonKey)

interface Stock {
  size: string
  color: string
  quantity: number
}

interface Product {
  id: string
  name: string
  size_options?: string[]
  color_options?: string[]
  product_stock?: Stock[]
}

async function debugLogic() {
  console.log('--- Simulating ProductDetailClient Logic ---')
  
  // 1. Fetch Product
  const { data: products } = await supabase
    .from('products')
    .select('*, product_stock(*)')
    .ilike('slug', '%cream-hoodie%')
    .limit(1)

  if (!products || products.length === 0) {
      console.log('❌ Product not found')
      return
  }
  const product = products[0] as unknown as Product // Cast for script simplicity
  console.log(`Product: ${product.name} (ID: ${product.id})`)

  // 2. Replicate Logic
  const STANDARD_SIZES = ['S', 'M', 'L', 'XL', 'XXL']

  const sizeOptions = product.size_options?.length 
      ? product.size_options 
      : (product.product_stock?.length ? Array.from(new Set(product.product_stock.map(s => s.size))).sort() : STANDARD_SIZES)

  const colorOptions = product.color_options?.length 
      ? product.color_options 
      : Array.from(new Set(product.product_stock?.map(s => s.color) || ['Standard'])).sort() 

  console.log('\n--- Options Logic ---')
  console.log('DB size_options:', product.size_options)
  console.log('Calculated sizeOptions:', sizeOptions)
  console.log('Calculated colorOptions:', colorOptions)

  // 3. Build Map
  const stockMap: Record<string, number> = {}
  product.product_stock?.forEach((item) => {
      const key = `${item.size}-${item.color}`
      stockMap[key] = item.quantity
  })
  
  console.log('\n--- Stock Map Keys ---')
  Object.keys(stockMap).forEach(k => console.log(`'${k}' -> ${stockMap[k]}`))

  // 4. Test Availability
  console.log('\n--- Availability Check ---')
  sizeOptions.forEach((size: string) => {
      colorOptions.forEach((color: string) => {
          const key = `${size}-${color}`
          const qty = stockMap[key] || 0
          const available = qty > 0
          console.log(`[${available ? '✅' : '❌'}] Checking '${size}'-'${color}' -> Key: '${key}', Qty: ${qty}`)
      })
  })
}

debugLogic()
