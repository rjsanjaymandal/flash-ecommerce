
import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import path from 'path'
import fs from 'fs'

// Load env from .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY // Use service role for admin access

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing env vars: NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function fetchLogs() {
  console.log('Fetching system logs...')
  
  const { data, error } = await supabase
    .from('system_logs')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(50)

  if (error) {
    console.error('Error fetching logs:', error)
    return
  }

  if (!data || data.length === 0) {
    console.log('No system logs found.')
    return
  }

  console.log(`Found ${data.length} logs.`)
  
  const logContent = data.map(log => {
    return `[${log.created_at}] [${log.severity}] [${log.component}]: ${log.message}\n${JSON.stringify(log.metadata)}\n-------------------`
  }).join('\n')

  fs.writeFileSync('diagnostic_logs.txt', logContent)
  console.log('Logs written to diagnostic_logs.txt')
  
  // Print the last 5 logs to console for immediate visibility
  data.slice(0, 5).forEach(log => {
      console.log(`[${log.severity}] ${log.message}`)
  })
}

fetchLogs().catch(console.error)
