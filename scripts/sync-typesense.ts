
import { createClient } from '@supabase/supabase-js'
import Typesense from 'typesense'
import * as dotenv from 'dotenv'

dotenv.config()

// Init Supabase (Service Role needed for full access)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase URL or Service Role Key')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

// Init Typesense
const typesenseUrl = process.env.NEXT_PUBLIC_TYPESENSE_HOST || 'localhost'
const typesensePort = process.env.NEXT_PUBLIC_TYPESENSE_PORT ? parseInt(process.env.NEXT_PUBLIC_TYPESENSE_PORT) : 8108
const typesenseProtocol = process.env.NEXT_PUBLIC_TYPESENSE_PROTOCOL || 'http'
const typesenseApiKey = process.env.TYPESENSE_ADMIN_API_KEY || 'xyz'

const client = new Typesense.Client({
  nodes: [
    {
      host: typesenseUrl,
      port: typesensePort,
      protocol: typesenseProtocol,
    },
  ],
  apiKey: typesenseApiKey,
  connectionTimeoutSeconds: 10,
})

const SCHEMA_NAME = 'products'

async function syncProducts() {
  console.log('🔄 Starting Typesense Sync...')

  // 1. Fetch Products from Supabase
  const { data: products, error } = await supabase
    .from('products')
    .select(`
      id, 
      name, 
      description, 
      price, 
      slug, 
      main_image_url, 
      is_active,
      category_id,
      categories (name)
    `)
    .eq('is_active', true)

  if (error) {
    console.error('❌ Failed to fetch products:', error)
    return
  }

  console.log(`📦 Found ${products.length} active products in Supabase.`)

  // 2. Define Schema
  const schema = {
    name: SCHEMA_NAME,
    fields: [
      { name: 'id', type: 'string' },
      { name: 'name', type: 'string' },
      { name: 'description', type: 'string', optional: true },
      { name: 'price', type: 'float' },
      { name: 'slug', type: 'string' },
      { name: 'image', type: 'string', optional: true },
      { name: 'category', type: 'string', facet: true, optional: true },
    ],
    default_sorting_field: 'price',
  }

  try {
    // 3. Re-create Collection
    // Check if exists, then delete (Sync Strategy: Full Re-index)
    try {
      await client.collections(SCHEMA_NAME).retrieve()
      console.log('🗑️  Deleting existing collection...')
      await client.collections(SCHEMA_NAME).delete()
    } catch (err) {
      // Collection doesn't exist, ignore
    }

    console.log('📝 Creating new collection schema...')
    await client.collections().create(schema as any)

    // 4. Transform Data
    const documents = products.map(p => ({
      id: p.id,
      name: p.name,
      description: p.description || '',
      price: p.price,
      slug: p.slug,
      image: p.main_image_url || '',
      category: (p.categories as any)?.name || 'Uncategorized',
    }))

    // 5. Bulk Import
    console.log('🚀 Indexing documents...')
    const results = await client.collections(SCHEMA_NAME).documents().import(documents, { action: 'create' })
    
    // Check for failed items
    const failedItems = results.filter((r: any) => r.success === false)
    if (failedItems.length > 0) {
      console.warn(`⚠️  ${failedItems.length} documents failed to import.`, failedItems[0])
    } else {
      console.log(`✅ Successfully indexed ${documents.length} products!`)
    }

  } catch (err) {
    console.error('❌ Sync failed:', err)
  }
}

syncProducts()
