
import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import path from 'path'

// Load env from .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing environment variables in .env.local')
  console.error('Need NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function verify() {
  console.log('🔍 Connecting to Supabase...')
  console.log(`URL: ${supabaseUrl}`)

  let success = true

  // 1. Verify RPC: get_waitlist_summary
  try {
    const { error } = await supabase.rpc('get_waitlist_summary', { page: 1, page_limit: 1 })
    if (error) {
      if (error.code === 'PGRST202' || error.message.includes('Could not find the function')) {
        console.error('❌ RPC [get_waitlist_summary] NOT FOUND. Migration 20260202180000_waitlist_analytics.sql likely not applied.')
        success = false
      } else {
        console.warn(`⚠️ RPC [get_waitlist_summary] exists but returned error: ${error.message}`)
      }
    } else {
      console.log('✅ RPC [get_waitlist_summary] Confirmed.')
    }
  } catch (err: any) {
     console.error('❌ Exception checking RPC:', err.message)
     success = false
  }

  // 2. Verify RPC: finalize_payment_v5
  try {
    // Calling with nulls/empty to just check function signature existence
    const { error } = await supabase.rpc('finalize_payment_v5', {
        p_order_id: '00000000-0000-0000-0000-000000000000',
        p_payment_id: 'test',
        p_amount_paid_paise: 0,
        p_method: 'PREPAID'
    })
    
    if (error) {
      // We expect "Order not found" (P0002) or similar logic error, which implies function exists.
      // If code is PGRST202 (function not found), then it's missing.
      if (error.code === 'PGRST202' || error.message.includes('Could not find the function')) {
         console.error('❌ RPC [finalize_payment_v5] NOT FOUND. Migration 20260202173000_update_payment_engine.sql likely not applied.')
         success = false
      } else {
         console.log('✅ RPC [finalize_payment_v5] Confirmed (Logic error received, meaning function exists).')
      }
    } else {
      console.log('✅ RPC [finalize_payment_v5] Confirmed.')
    }
  } catch (err: any) {
      console.error('❌ Exception checking Payment RPC:', err.message)
      success = false
  }

  // 3. Verify Table: blog_posts
  try {
    const { count, error } = await supabase.from('blog_posts').select('*', { count: 'exact', head: true })
    if (error) {
       if (error.code === '42P01') { 
          console.error('❌ Table [blog_posts] NOT FOUND. Migration 20260202120000_seed_seo_blogs.sql likely not applied.')
          success = false
       } else {
          console.error(`❌ Table [blog_posts] Error: ${error.message}`)
          success = false
       }
    } else {
       console.log(`✅ Table [blog_posts] Confirmed. Count: ${count}`)
       if (!count || count < 3) {
           console.warn('⚠️ [blog_posts] exists but seems to have fewer than 3 posts. Seed data might be missing.')
       }
    }
  } catch (err: any) {
     console.error('❌ Exception checking Blog Table:', err.message)
     success = false
  }

  // 4. Verify Table: admin_audit_logs
  try {
    const { error } = await supabase.from('admin_audit_logs').select('id').limit(1)
    if (error) {
      if (error.code === '42P01') { // undefined_table
         console.error('❌ Table [admin_audit_logs] NOT FOUND. Migration 20260108181000_audit_logging.sql likely not applied.')
         success = false
      } else {
         console.warn(`⚠️ Table [admin_audit_logs] access error: ${error.message} (Might be RLS or generic)`)
      }
    } else {
      console.log('✅ Table [admin_audit_logs] Confirmed.')
    }
  } catch (err: any) {
    console.error('❌ Exception checking Table:', err.message)
    success = false
  }

  if (success) {
    console.log('\n🎉 ALL MIGRATIONS VERIFIED SUCCESSFULLY.')
  } else {
    console.log('\n🚫 MIGRATION VERIFICATION FAILED.')
    process.exit(1)
  }
}

verify()
