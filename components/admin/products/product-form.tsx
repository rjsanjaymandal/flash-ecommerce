'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useRouter } from 'next/navigation'
import { Upload, X, Loader2, Plus, Trash2 } from 'lucide-react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

const SIZE_OPTIONS = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'Oversized']
const COLOR_OPTIONS = ['Black', 'White', 'Pink', 'Purple', 'Blue', 'Grey', 'Red', 'Green']

type Variant = {
    id?: string
    size: string
    color: string
    quantity: number
}

export default function ProductForm({ productId }: { productId?: string }) {
  const router = useRouter()
  const supabase = createClient()
  const queryClient = useQueryClient()
  
  // Local state for complex form parts
  const [variants, setVariants] = useState<Variant[]>([])
  const [formData, setFormData] = useState<any>({
    name: '', slug: '', description: '', price: '', category_id: '',
    main_image_url: '', gallery_image_urls: [], is_active: true
  })

  // 1. Fetch Data (Product + Categories + Variants)
  const { data: initialData, isLoading: isLoadingData } = useQuery<any>({
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
       
       return { categories, product, stock }
    },
    enabled: true // Always run, even if new (just fetches categories)
  })

  // Hydrate form on load
  useEffect(() => {
      if (initialData?.product && initialData.product.data) {
          setFormData({
              ...initialData.product.data,
              price: initialData.product.data.price // keep as string/number
          })
      }
      if (initialData?.stock && initialData.stock.data) {
          setVariants(initialData.stock.data)
      }
  }, [initialData])

  // 2. Mutations
  const saveMutation = useMutation({
      mutationFn: async () => {
          // A. Save Product
          const productPayload = {
              name: formData.name,
              slug: formData.slug || formData.name.toLowerCase().replace(/\s+/g, '-'),
              description: formData.description,
              price: parseFloat(formData.price),
              category_id: formData.category_id,
              main_image_url: formData.main_image_url,
              gallery_image_urls: formData.gallery_image_urls,
              is_active: formData.is_active
              // We don't save size_options array anymore, inferred from stock
          }

          let savedProductId = productId
          
          if (productId) {
              const { error } = await (supabase.from('products') as any).update(productPayload as any).eq('id', productId)
              if (error) throw error
          } else {
              const { data, error } = await (supabase.from('products') as any).insert([productPayload as any]).select().single()
              if (error) throw error
              savedProductId = (data as any).id
          }

          // B. Save Variants (Stock)
          // Strategy: Delete all existing stock for this product and re-insert (easiest for full sync)
          // Or upsert. Let's try Delete + Insert for simplicity/correctness with limited logic.
          if (savedProductId) {
              await (supabase.from('product_stock') as any).delete().eq('product_id', savedProductId)
              
              const stockPayload = variants.map(v => ({
                  product_id: savedProductId,
                  size: v.size,
                  color: v.color,
                  quantity: v.quantity
              }))
              
              if (stockPayload.length > 0) {
                  const { error: stockError } = await (supabase.from('product_stock') as any).insert(stockPayload as any)
                  if (stockError) throw stockError
              }
          }
      },
      onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ['product', productId] })
          queryClient.invalidateQueries({ queryKey: ['admin-products'] })
          alert('Product saved successfully!')
          router.push('/admin/products')
      },
      onError: (err) => alert('Error saving: ' + err.message)
  })

  // Helper: Image Upload
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, field: 'main_image_url' | 'gallery') => {
    const file = e.target.files?.[0]
    if (!file) return
    
    // Upload logic ... (simplified for this refactor, reusing existing if possible but writing clean here)
    const fileName = `${Math.random()}-${file.name}`
    const { error } = await supabase.storage.from('products').upload(fileName, file)
    if (error) {
        alert('Upload failed')
        return
    }
    const { data: { publicUrl } } = supabase.storage.from('products').getPublicUrl(fileName)

    if (field === 'main_image_url') {
        setFormData((prev: any) => ({ ...prev, main_image_url: publicUrl }))
    } else {
        setFormData((prev: any) => ({ ...prev, gallery_image_urls: [...(prev.gallery_image_urls || []), publicUrl] }))
    }
  }

  // Helper: Variant Logic
  const addVariant = () => {
      setVariants([...variants, { size: 'M', color: 'Black', quantity: 0 }])
  }
  
  const updateVariant = (index: number, field: keyof Variant, value: any) => {
      const newVariants = [...variants]
      newVariants[index] = { ...newVariants[index], [field]: value }
      setVariants(newVariants)
  }

  const removeVariant = (index: number) => {
      setVariants(variants.filter((_, i) => i !== index))
  }

  if (isLoadingData) return <div>Loading...</div>

  return (
    <div className="max-w-4xl space-y-8 pb-20">
      <div className="grid gap-8 md:grid-cols-2">
          {/* LEFT COL: Basic Info */}
          <div className="space-y-6">
             <div className="rounded-lg border p-4 bg-card">
                 <h3 className="font-medium mb-4">Basic Details</h3>
                 <div className="space-y-4">
                     <div>
                         <label className="text-sm font-medium">Product Name</label>
                         <Input value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
                     </div>
                     <div>
                         <label className="text-sm font-medium">Price (₹)</label>
                         <Input type="number" value={formData.price} onChange={e => setFormData({ ...formData, price: e.target.value })} />
                     </div>
                     <div>
                         <label className="text-sm font-medium">Category</label>
                         <select 
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3"
                            value={formData.category_id}
                            onChange={e => setFormData({ ...formData, category_id: e.target.value })}
                        >
                            <option value="">Select...</option>
                            {initialData?.categories?.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
                         </select>
                     </div>
                     <div>
                         <label className="text-sm font-medium">Description</label>
                         <textarea 
                            className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                            value={formData.description} 
                            onChange={e => setFormData({ ...formData, description: e.target.value })} 
                        />
                     </div>
                 </div>
             </div>

             <div className="rounded-lg border p-4 bg-card">
                 <h3 className="font-medium mb-4">Images</h3>
                 <div className="space-y-4">
                     <div>
                         <label className="text-sm block mb-2">Main Image</label>
                         <div className="flex gap-4 items-center">
                             {formData.main_image_url && <img src={formData.main_image_url} className="h-20 w-20 rounded object-cover border" />}
                             <Input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, 'main_image_url')} />
                         </div>
                     </div>
                 </div>
             </div>
          </div>

          {/* RIGHT COL: Variants */}
          <div className="space-y-6">
              <div className="rounded-lg border p-4 bg-card min-h-[500px]">
                  <div className="flex items-center justify-between mb-4">
                      <h3 className="font-medium">Variants & Stock</h3>
                      <Button size="sm" onClick={addVariant} type="button"><Plus className="h-4 w-4 mr-2"/> Add Variant</Button>
                  </div>
                  
                  <div className="space-y-3">
                      {variants.length === 0 && <p className="text-sm text-muted-foreground text-center py-10">No variants added. Product will be listed as 'Out of Stock'.</p>}
                      
                      {variants.map((variant, idx) => (
                          <div key={idx} className="flex gap-2 items-end p-3 border rounded-md bg-background">
                              <div className="flex-1">
                                  <label className="text-xs mb-1 block">Size</label>
                                  <select 
                                    className="h-8 w-full rounded-md border text-sm"
                                    value={variant.size}
                                    onChange={(e) => updateVariant(idx, 'size', e.target.value)}
                                  >
                                      {SIZE_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                                  </select>
                              </div>
                              <div className="flex-1">
                                  <label className="text-xs mb-1 block">Color</label>
                                  <select 
                                    className="h-8 w-full rounded-md border text-sm"
                                    value={variant.color}
                                    onChange={(e) => updateVariant(idx, 'color', e.target.value)}
                                  >
                                      {COLOR_OPTIONS.map(c => <option key={c} value={c}>{c}</option>)}
                                  </select>
                              </div>
                              <div className="w-24">
                                  <label className="text-xs mb-1 block">Stock</label>
                                  <Input 
                                    type="number" 
                                    className="h-8" 
                                    value={variant.quantity} 
                                    onChange={(e) => updateVariant(idx, 'quantity', parseInt(e.target.value))}
                                  />
                              </div>
                              <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => removeVariant(idx)}>
                                  <Trash2 className="h-4 w-4" />
                              </Button>
                          </div>
                      ))}
                  </div>
              </div>
          </div>
      </div>

      <div className="flex justify-end gap-4 border-t pt-4">
          <Button variant="ghost" onClick={() => router.back()}>Cancel</Button>
          <Button onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending}>
              {saveMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Product
          </Button>
      </div>
    </div>
  )
}
