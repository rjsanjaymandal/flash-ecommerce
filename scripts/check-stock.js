
import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing environment variables')
    process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function checkStock() {
    console.log('Fetching Product Stock...')
    
    // Get all products first to map names
    const { data: products } = await supabase.from('products').select('id, name')
    const productMap = Object.fromEntries(products?.map(p => [p.id, p.name]) || [])

    const { data: stock, error } = await supabase
        .from('product_stock')
        .select('*')
        .order('product_id')

    if (error) {
        console.error('Error fetching stock:', error)
        return
    }

    console.log('Stock Inventory:')
    stock.forEach(item => {
        const name = productMap[item.product_id] || item.product_id
        console.log(`[${name}] Size: ${item.size || 'N/A'}, Color: ${item.color || 'N/A'} -> Qty: ${item.quantity}`)
    })
}

checkStock()
