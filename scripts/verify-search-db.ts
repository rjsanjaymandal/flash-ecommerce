
import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import path from 'path'

// Load env from .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing env vars')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)


import fs from 'fs'

function log(msg: string) {
    console.log(msg)
    fs.appendFileSync('verification_result.txt', msg + '\n')
}

// ... existing code ...
async function test() {
  fs.writeFileSync('verification_result.txt', '') // Clear file
  log("--- Verifying Search ---")
  const q = "kangaroo"
  
  // 1. Check if ANY product has "kangaroo" in description
  const { data: all, error: err1 } = await supabase
    .from('products')
    .select('id, name, description')
    .ilike('description', `%${q}%`)
  
  if (err1) log("Error checking description: " + JSON.stringify(err1))
  else log(`Found ${all?.length} products with 'kangaroo' in description via ilike.`)
  if (all?.length) log("Sample: " + all[0].name)

  // 2. Check OR query
  log("\n--- Testing OR Query ---")
  const { data: orResult, error: err2 } = await supabase
    .from('products')
    .select('id, name')
    .or(`name.ilike.%${q}%,description.ilike.%${q}%`)
  
  if (err2) log("Error checking OR: " + JSON.stringify(err2))
  else log(`Found ${orResult?.length} products via OR query.`)

  // 3. Inspect the 'Lavender Hoodie' description explicitly
  const { data: lavender } = await supabase
    .from('products')
    .select('id, name, description')
    .ilike('name', '%Lavender%')
    .single()
  
  if (lavender) {
      log("\n--- Lavender Hoodie ---")
      log("Name: " + lavender.name)
      log("Description Snippet: " + (lavender.description?.substring(0, 50) || 'NULL'))
      log("Contains 'kangaroo'? " + (lavender.description?.toLowerCase().includes('kangaroo')))
  }
}

test()

