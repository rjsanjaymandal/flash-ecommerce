
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://gyizmixhmrfwywvafdbi.supabase.co'
const supabaseAnonKey = 'sb_publishable_J7XVC8I7VhmAvUhKH-Qu3A_uBeLMkt8'

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function dumpCategories() {
  console.log('--- Dumping Categories ---')
  const { data: cats, error } = await supabase
    .from('categories')
    .select('id, name, slug, parent_id, is_active')
    .order('parent_id', { nullsFirst: true })
    .order('name')
  
  if (error) {
      console.error(error) 
      return
  }

  console.table(cats)
}

dumpCategories()
