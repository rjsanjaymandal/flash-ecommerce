'use client'

import { ProductForm, ProductFormData } from '@/components/admin/products/product-form'
import { updateProduct } from '@/lib/services/product-service'
import { slugify } from '@/lib/slugify'
import { useRouter } from 'next/navigation'
import { useTransition } from 'react'
import { toast } from 'sonner'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function EditProductPageClient({ product, stock, categories }: { product: any, stock: any[], categories: any[] }) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  
  // Transform DB data to Form Data
  const initialData: ProductFormData = {
      name: product.name,
      slug: product.slug,
      description: product.description || '',
      price: product.price,
      category_id: product.category_id,
      main_image_url: product.main_image_url || '',
      gallery_image_urls: product.gallery_image_urls || [],
      is_active: product.is_active,
      variants: stock.map((s: any) => ({
          size: s.size,
          color: s.color,
          quantity: s.quantity
      }))
  }

  const handleSubmit = (data: ProductFormData) => {
    startTransition(async () => {
        try {
            await updateProduct(product.id, {
                ...data,
                slug: data.slug || slugify(data.name),
                price: parseFloat(data.price as string)
            })
            toast.success('Product updated successfully')
            router.push('/admin/products')
        } catch (error: any) {
            toast.error('Failed to update product: ' + error.message)
        }
    })
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6 pb-20 animate-in fade-in duration-500">
        <div className="flex items-center gap-4 py-4 border-b">
            <Button variant="ghost" size="icon" onClick={() => router.back()}>
                <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
                <h1 className="text-2xl font-bold tracking-tight">Edit Product</h1>
                <p className="text-sm text-muted-foreground">Update product details and stock.</p>
            </div>
       </div>

        <ProductForm 
            initialData={initialData}
            categories={categories}
            isLoading={isPending}
            onSubmit={handleSubmit}
            onCancel={() => router.back()}
        />
    </div>
  )
}
