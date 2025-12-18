'use client'

import { ProductForm } from '@/components/admin/products/product-form'
import { ProductFormValues } from '@/lib/validations/product'
import { createProduct } from '@/lib/services/product-service'
import { slugify } from '@/lib/slugify'
import { useRouter } from 'next/navigation'
import { useTransition } from 'react'
import { toast } from 'sonner'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Category } from '@/types/store-types'

export default function CreateProductPageClient({ categories }: { categories: Category[] }) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  const handleSubmit = (data: ProductFormValues) => {
    startTransition(async () => {
        try {
            await createProduct({
                ...data,
                slug: data.slug || slugify(data.name),
                price: data.price // Already a number from Zod
            })
            toast.success('Product created successfully')
            router.push('/admin/products')
        } catch (error: any) {
            toast.error('Failed to create product: ' + error.message)
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
                <h1 className="text-2xl font-bold tracking-tight">Add New Product</h1>
                <p className="text-sm text-muted-foreground">Create a new item in your inventory.</p>
            </div>
       </div>

        <ProductForm 
            categories={categories}
            isLoading={isPending}
            onSubmit={handleSubmit}
            onCancel={() => router.back()}
        />
    </div>
  )
}
