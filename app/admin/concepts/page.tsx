import { createClient } from '@/lib/supabase/server'
import { ConceptsClient } from './concepts-client'

export const metadata = {
  title: 'Manage concepts | Admin | Flash Ecommerce',
}

export const dynamic = 'force-dynamic'

export default async function ConceptsAdminPage() {
  const supabase = await createClient()

  const { data: concepts, error } = await supabase
    .from('concepts')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching concepts:', error.message)
  }

  return <ConceptsClient concepts={concepts || []} />
}
