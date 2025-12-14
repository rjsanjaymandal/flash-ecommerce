'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { ProductForm, ProductFormData } from './product-form-new'
import { Loader2, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { slugify } from '@/lib/slugify'

export default function ProductEditor({ productId }: { productId?: string }) {
  const router = useRouter()
  const supabase = createClient()
  const queryClient = useQueryClient()

  // 1. Fetch Data
  const { data: initialData, isLoading: isLoadingData } = useQuery({
    queryKey: ['product', productId],
    queryFn: async () => {
       const [
         { data: categories },
         { data: product },
         { data: stock }
       ] = await Promise.all([
           supabase.from('categories').select('*').eq('is_active', true),
           productId ? supabase.from('products').select('*').eq('id', productId).single() : { data: null },
           productId ? supabase.from('product_stock').select('*').eq('product_id', productId) : { data: [] }
       ])
       
       return { categories: categories || [], product, stock: stock || [] }
    },
  })

  // 2. Map Initial Data
  const existingProduct: ProductFormData | undefined = initialData?.product ? {
      name: initialData.product.name,
      slug: initialData.product.slug,
      description: initialData.product.description || '',
      price: initialData.product.price,
      category_id: initialData.product.category_id,
      main_image_url: initialData.product.main_image_url || '',
      gallery_image_urls: initialData.product.gallery_image_urls || [],
      is_active: initialData.product.is_active,
      variants: initialData.stock?.map((s: any) => ({
          size: s.size, color: s.color, quantity: s.quantity
      })) || []
  } : undefined

  // 3. Mutation
  const saveMutation = useMutation({
      mutationFn: async (data: ProductFormData) => {
          const productPayload = {
              name: data.name,
              slug: data.slug || slugify(data.name),
              description: data.description,
              price: parseFloat(data.price as string),
              category_id: data.category_id,
              main_image_url: data.main_image_url,
              gallery_image_urls: data.gallery_image_urls,
              is_active: data.is_active
          }

          let savedProductId = productId
          
          if (productId) {
              const { error } = await (supabase.from('products') as any).update(productPayload).eq('id', productId)
              if (error) throw error
          } else {
              const { data: newProd, error } = await (supabase.from('products') as any).insert([productPayload]).select().single()
              if (error) throw error
              savedProductId = (newProd as any).id
          }

          // Sync Stock
          if (savedProductId) {
              await (supabase.from('product_stock') as any).delete().eq('product_id', savedProductId)
              
              const stockPayload = data.variants.map(v => ({
                  product_id: savedProductId,
                  size: v.size,
                  color: v.color,
                  quantity: v.quantity
              }))
              
              if (stockPayload.length > 0) {
                  const { error: stockError } = await (supabase.from('product_stock') as any).insert(stockPayload)
                  if (stockError) throw stockError
              }
          }
      },
      onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ['product', productId] })
          queryClient.invalidateQueries({ queryKey: ['admin-products'] }) 
          toast.success(productId ? 'Product updated' : 'Product created')
          router.push('/admin/products')
      },
      onError: (err: any) => {
          toast.error('Failed to save: ' + err.message)
      }
  })

  if (isLoadingData) return <div className="flex h-96 items-center justify-center text-muted-foreground"><Loader2 className="animate-spin mr-2"/> Loading...</div>

  return (
    <div className="mx-auto max-w-5xl space-y-6 pb-20">
       <div className="flex items-center gap-4 py-4 border-b">
            <Button variant="ghost" size="icon" onClick={() => router.back()}>
                <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
                <h1 className="text-2xl font-bold tracking-tight">{productId ? 'Edit Product' : 'New Product'}</h1>
            </div>
       </div>
       
       <ProductForm 
            initialData={existingProduct}
            categories={initialData?.categories || []}
            isLoading={saveMutation.isPending}
            onSubmit={saveMutation.mutate}
            onCancel={() => router.back()}
       />
    </div>
  )
}
