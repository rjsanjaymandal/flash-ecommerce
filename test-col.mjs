
import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing Supabase URL or Key")
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function checkColumn() {
  const { data, error } = await supabase
    .from('product_stock')
    .select('price_addon')
    .limit(1)

  if (error) {
    console.error("Error selecting price_addon:", error)
  } else {
    console.log("price_addon column exists and returned:", data)
  }
}

checkColumn()
