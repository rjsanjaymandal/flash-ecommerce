import { MetadataRoute } from 'next'
import { createClient } from '@/lib/supabase/server'

export const revalidate = 86400 // Daily

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = await createClient()
  const baseUrl = 'https://flashhfashion.in'

  // Fetch all products
  const { data: products } = await supabase
    .from('products')
    .select('id, slug, updated_at')

  const productUrls = (products || []).map((product) => ({
    url: `${baseUrl}/product/${product.slug}`,
    lastModified: new Date(product.updated_at),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }))

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    ...productUrls,
  ]
}
