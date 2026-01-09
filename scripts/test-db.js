
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

async function testConnection() {
  console.log('Testing connection to:', supabaseUrl)
  try {
    const { data, error } = await supabase.from('products').select('count').limit(1).single()
    if (error) {
      console.error('Connection failed:', error)
    } else {
      console.log('Connection successful!', data)
    }
  } catch (err) {
    console.error('Fetch error:', err)
  }
}

testConnection()
