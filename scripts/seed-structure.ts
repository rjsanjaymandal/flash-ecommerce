
import { createClient } from '@supabase/supabase-js'
import { slugify } from '../lib/slugify'

const supabaseUrl = 'https://gyizmixhmrfwywvafdbi.supabase.co'
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd5aXptaXhobXJmd3l3dmFmZGJpIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NTUyNDU5NywiZXhwIjoyMDgxMTAwNTk3fQ.0yGPlIhXnZi2RYSH36fmVDgK_hxVKd_5l5RaX1RDjrM' // Service Key to bypass RLS if needed, though Anon works too

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function seedStructure() {
  console.log('--- Structuring Categories ---')

  // 1. Create or Find "Clothing"
  let clothingId
  const { data: existing } = await supabase.from('categories').select('id').eq('slug', 'clothing').single()
  
  if (existing) {
      console.log('Clothing category already exists.')
      clothingId = existing.id
  } else {
      console.log('Creating "Clothing" category...')
      const { data, error } = await supabase.from('categories').insert({
          name: 'Clothing',
          slug: 'clothing',
          is_active: true,
          parent_id: null
      }).select().single()
      
      if (error) { console.error(error); return }
      clothingId = data.id
      console.log('Created Clothing:', clothingId)
  }

  // 2. Move Hoodies, T-Shirts, Sweatshirts under Clothing
  const children = ['hoodies', 't-shirts', 'sweatshirts']
  
  // Note: slug might be 't-shirts-', 't-shirts- ' based on previous dump ['t shirts ']
  // Let's fetch all and match loosely
  const { data: allCats } = await supabase.from('categories').select('*')
  
  if (!allCats) return

  for (const cat of allCats) {
      const name = cat.name.toLowerCase().trim()
      if (children.some(c => name.includes(c.replace('-', ' ')))) {
          console.log(`Moving ${cat.name} to Clothing...`)
          await supabase.from('categories').update({ parent_id: clothingId }).eq('id', cat.id)
      }
  }

  // 3. Create or Find "Accessories"
  let accessoriesId
  const { data: existingAcc } = await supabase.from('categories').select('id').eq('slug', 'accessories').single()
  
  if (!existingAcc) {
       console.log('Creating "Accessories" category...')
       await supabase.from('categories').insert({
          name: 'Accessories',
          slug: 'accessories',
          is_active: true,
          parent_id: null
      })
  } else {
      console.log('Accessories category already exists.')
  }

  console.log('✅ Structure Fixed.')
}

seedStructure()
