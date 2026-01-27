
import { getProductsSecure } from '@/lib/services/product-service'
import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import path from 'path'

// Load env from .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY! // Use service role for admin access (or anon if RLS permits)

const supabase = createClient(supabaseUrl, supabaseKey)

async function verifyStockSort() {
  console.log('--- Verifying Stock-First Sorting ---')
  
  // Test 1: Default Sort (Newest)
  console.log('\nTest 1: Default Sort (Newest)')
  const { data: defaultData } = await getProductsSecure({ limit: 20 }, supabase)
  checkSort(defaultData, 'Default')

  // Test 2: Price Low to High
  console.log('\nTest 2: Price Low to High')
  const { data: priceData } = await getProductsSecure({ limit: 20, sort: 'price_asc' }, supabase)
  checkSort(priceData, 'Price ASC')

  // Test 3: Random
  console.log('\nTest 3: Random')
  const { data: randomData } = await getProductsSecure({ limit: 20, sort: 'random' }, supabase)
  checkSort(randomData, 'Random')
}

function checkSort(products: any[], label: string) {
    if (!products || products.length === 0) {
        console.log(`[${label}] No products found.`)
        return
    }

    let previousWasOutOfStock = false
    let failureCount = 0

    products.forEach((p, i) => {
        const totalStock = p.product_stock?.reduce((acc: number, s: any) => acc + (s.quantity || 0), 0) || 0
        const inStock = totalStock > 0
        const stockLabel = inStock ? 'IN_STOCK' : 'OUT_OF_STOCK'
        
        // console.log(`[${label}] #${i+1} ${p.name.substring(0, 20)}... - ${stockLabel} (${totalStock})`)

        if (previousWasOutOfStock && inStock) {
            console.error(`[${label}] FAILURE at index ${i}: In-stock item appeared after out-of-stock item.`)
            failureCount++
        }

        if (!inStock) {
            previousWasOutOfStock = true
        }
    })

    if (failureCount === 0) {
        console.log(`[${label}] SUCCESS: Stock sorting is correct.`)
    } else {
        console.log(`[${label}] FAILED: Found ${failureCount} sorting violations.`)
    }
}

verifyStockSort().catch(console.error)
