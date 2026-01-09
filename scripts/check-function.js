
import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing env vars')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function checkFunction() {
  console.log('Checking reserve_stock function definition...')
  
  const { data, error } = await supabase.rpc('reserve_stock', { p_order_id: '00000000-0000-0000-0000-000000000000' })
  
  if (error) {
      console.log("RPC Call Error (Expected for dummy ID):", error.message)
      // If the error is "function ... does not exist", then migration failed.
      // If it is "Insufficient stock...", then function exists.
  } else {
      console.log("RPC Call Success (Unexpected for dummy ID):", data)
  }

  // Also try to query pg_proc if we have permissions (likely not with service role via API, but RPC is good proxy)
}

checkFunction()
