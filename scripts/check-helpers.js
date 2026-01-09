
import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

// ... (standard init)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY
const supabase = createClient(supabaseUrl, supabaseKey)

async function checkHelpers() {
  const helpers = ['exec_sql', 'exec', 'run_sql', 'query', 'execute']
  
  for (const helper of helpers) {
      const { data, error } = await supabase.rpc(helper, { sql: 'SELECT 1' })
      // Some might take different args, but error message will tell us "function ... does not exist" 
      // vs "invalid arguments"
      if (error && error.message.includes('does not exist')) {
          console.log(`[${helper}] Does not exist`)
      } else {
          console.log(`[${helper}] POSSIBLE MATCH! Error/Data:`, error || data)
      }
  }
}

checkHelpers()
