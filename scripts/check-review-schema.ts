
import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseKey)

async function checkSchema() {
  const { data, error } = await supabase
    .from('reviews')
    .select('*')
    .limit(1)

  if (error) {
    console.error('Error fetching reviews:', error)
  } else {
    console.log('Reviews table check (Select * limit 1):', data)
  }
}

checkSchema()
