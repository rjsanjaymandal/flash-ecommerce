
import pg from 'pg'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const { Client } = pg

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const connectionString = 'postgresql://postgres:Sam@#2+3#@db.gyizmixhmrfwywvafdbi.supabase.co:5432/postgres'

const client = new Client({
  connectionString,
  ssl: { rejectUnauthorized: false } // Required for Supabase in many environments
})

async function applyMigration() {
  try {
    console.log('Connecting to database...')
    await client.connect()
    console.log('Connected.')

    const migrationPath = path.resolve(__dirname, '../supabase/migrations/20260109000000_fix_reserve_stock.sql')
    console.log('Reading migration file:', migrationPath)
    
    const sql = fs.readFileSync(migrationPath, 'utf8')

    console.log('Executing SQL...')
    await client.query(sql)
    
    console.log('Migration applied successfully!')
  } catch (err) {
    console.error('Migration failed:', err)
  } finally {
    await client.end()
  }
}

applyMigration()
