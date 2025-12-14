
import { createClient } from '@/lib/supabase/server'
import { getLinearCategories } from '@/lib/services/category-service'
import EditProductPageClient from '../edit-product-page'
import { notFound } from 'next/navigation'

export const revalidate = 0

export default async function EditProductPage({ params }: { params: { id: string } }) {
  const { id } = await params
  
  const supabase = await createClient()

  // Fetch all needed data on Server
  const [categories, { data: product }, { data: stock }] = await Promise.all([
      getLinearCategories(),
      supabase.from('products').select('*').eq('id', id).single(),
      supabase.from('product_stock').select('*').eq('product_id', id)
  ])

  if (!product) {
      notFound()
  }

  return <EditProductPageClient product={product} stock={stock || []} categories={categories || []} />
}
