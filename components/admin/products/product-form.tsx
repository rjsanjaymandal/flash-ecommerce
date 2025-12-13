'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useRouter } from 'next/navigation'
import { Upload, X, Loader2 } from 'lucide-react'

// Options Constants
const SIZE_OPTIONS = ['XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL', 'Oversized']
const COLOR_OPTIONS = ['Black', 'White', 'Pink', 'Purple', 'Cyan', 'Rainbow', 'Grey', 'Other']

export default function ProductForm({ productId }: { productId?: string }) {
  const router = useRouter()
  const supabase = createClient()
  const [isLoading, setIsLoading] = useState(!!productId)
  const [isSaving, setIsSaving] = useState(false)
  const [categories, setCategories] = useState<any[]>([])
  
  // Form State
  const [formData, setFormData] = useState<any>({
    name: '',
    slug: '',
    description: '',
    price: '',
    category_id: '',
    size_options: [],
    color_options: [],
    expression_tags: [], // Using comma separated string for input
    main_image_url: '',
    is_active: true
  })

  // Tag Input State
  const [tagInput, setTagInput] = useState('')

  useEffect(() => {
    const init = async () => {
      // Fetch categories
      const { data: cats } = await supabase.from('categories').select('*').eq('is_active', true)
      if (cats) setCategories(cats)

      if (productId) {
        // Fetch existing product
        const { data: product } = await supabase
            .from('products')
            .select('*')
            .eq('id', productId)
            .single()
        
        if (product) {
            setFormData({
                ...product,
                price: product.price.toString()
            })
            // Initialize tags if needed, they are array in DB
        }
        setIsLoading(false)
      }
    }
    init()
  }, [productId])

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, field: 'main_image_url' | 'gallery') => {
    const file = e.target.files?.[0]
    if (!file) return

    // Limit 2MB
    if (file.size > 2 * 1024 * 1024) {
        alert('File too large (max 2MB)')
        return
    }

    const fileExt = file.name.split('.').pop()
    const fileName = `${Math.random()}.${fileExt}`
    const filePath = `${fileName}`

    setIsSaving(true) 
    const { error: uploadError } = await supabase.storage
        .from('products') 
        .upload(filePath, file)

    if (uploadError) {
        console.error(uploadError)
        alert('Error uploading image.')
        setIsSaving(false)
        return
    }

    const { data: { publicUrl } } = supabase.storage.from('products').getPublicUrl(filePath)
    
    if (field === 'main_image_url') {
        setFormData((prev: any) => ({ ...prev, main_image_url: publicUrl }))
    } else {
        setFormData((prev: any) => ({ 
            ...prev, 
            gallery_image_urls: [...(prev.gallery_image_urls || []), publicUrl] 
        }))
    }
    
    setIsSaving(false)
  }

  const toggleOption = (field: string, value: string) => {
    setFormData((prev: any) => {
      const current = prev[field] || []
      if (current.includes(value)) {
        return { ...prev, [field]: current.filter((item: string) => item !== value) }
      } else {
        return { ...prev, [field]: [...current, value] }
      }
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)

    const payload = {
        ...formData,
        price: parseFloat(formData.price),
        slug: formData.slug || formData.name.toLowerCase().replace(/\s+/g, '-')
    }

    let error
    if (productId) {
        const { error: updateError } = await supabase
            .from('products')
            .update(payload as any)
            .eq('id', productId)
        error = updateError
    } else {
        const { error: insertError } = await supabase
            .from('products')
            .insert([payload] as any)
        error = insertError
    }

    if (error) {
        alert('Error saving product: ' + error.message)
    } else {
        router.push('/admin/products')
        router.refresh()
    }
    setIsSaving(false)
  }

  if (isLoading) return <div>Loading product...</div>

  return (
    <form onSubmit={handleSubmit} className="space-y-8 max-w-2xl">
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Basic Info</h3>
        <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
                <label className="text-sm font-medium">Product Name</label>
                <Input 
                    required 
                    value={formData.name} 
                    onChange={e => setFormData({ ...formData, name: e.target.value })} 
                />
            </div>
            <div className="space-y-2">
                <label className="text-sm font-medium">Slug</label>
                <Input 
                    value={formData.slug} 
                    onChange={e => setFormData({ ...formData, slug: e.target.value })} 
                    placeholder="Auto-generated"
                />
            </div>
            <div className="space-y-2">
                <label className="text-sm font-medium">Price (₹)</label>
                <Input 
                    type="number" 
                    step="0.01" 
                    required 
                    value={formData.price} 
                    onChange={e => setFormData({ ...formData, price: e.target.value })} 
                />
            </div>
            <div className="space-y-2">
                <label className="text-sm font-medium">Category</label>
                <select 
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    value={formData.category_id || ''}
                    onChange={e => setFormData({ ...formData, category_id: e.target.value })}
                    required
                >
                    <option value="">Select Category</option>
                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
            </div>
        </div>
        <div className="space-y-2">
            <label className="text-sm font-medium">Description</label>
            <textarea 
                className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                value={formData.description || ''}
                onChange={e => setFormData({ ...formData, description: e.target.value })}
            />
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-medium">Media</h3>
        
        {/* Main Image */}
        <div className="space-y-2">
            <label className="text-sm font-medium">Main Image</label>
            <div className="border-2 border-dashed border-border rounded-lg p-6 flex flex-col items-center justify-center gap-4 hover:bg-muted/50 transition-colors relative">
                {formData.main_image_url ? (
                    <div className="relative w-full aspect-video md:w-64">
                        <img src={formData.main_image_url} alt="Product" className="object-cover rounded-md w-full h-full" />
                        <button 
                            type="button"
                            onClick={() => setFormData({ ...formData, main_image_url: '' })}
                            className="absolute -top-2 -right-2 bg-destructive text-white rounded-full p-1"
                        >
                            <X className="h-4 w-4" />
                        </button>
                    </div>
                ) : (
                    <>
                        <Upload className="h-8 w-8 text-muted-foreground" />
                        <div className="text-center text-sm text-muted-foreground">
                            <p>Upload Main Image</p>
                            <p className="text-xs">Max 2MB</p>
                        </div>
                    </>
                )}
                <input 
                    type="file" 
                    className="absolute inset-0 opacity-0 cursor-pointer" 
                    accept="image/*"
                    onChange={(e) => handleImageUpload(e, 'main_image_url')}
                    disabled={!!formData.main_image_url}
                />
            </div>
        </div>

        {/* Gallery Images (Basic implementation: upload one by one to append) */}
        <div className="space-y-2">
            <label className="text-sm font-medium">Gallery Images</label>
             <div className="flex flex-wrap gap-4">
                {formData.gallery_image_urls?.map((url: string, idx: number) => (
                    <div key={idx} className="relative w-24 h-24 border rounded-md overflow-hidden">
                        <img src={url} alt="Gallery" className="object-cover w-full h-full" />
                        <button 
                            type="button"
                            onClick={() => setFormData({ ...formData, gallery_image_urls: formData.gallery_image_urls.filter((_: any, i: number) => i !== idx) })}
                            className="absolute top-0 right-0 bg-destructive/80 text-white p-1"
                        >
                            <X className="h-3 w-3" />
                        </button>
                    </div>
                ))}
                 <div className="w-24 h-24 border-2 border-dashed border-border rounded-md flex items-center justify-center relative hover:bg-muted/50">
                    <Upload className="h-6 w-6 text-muted-foreground" />
                    <input 
                        type="file" 
                        className="absolute inset-0 opacity-0 cursor-pointer" 
                        accept="image/*"
                        onChange={(e) => handleImageUpload(e, 'gallery')}
                    />
                 </div>
             </div>
        </div>
      </div>

       <div className="space-y-4">
            <h3 className="text-lg font-medium">Tags & Attributes</h3>
            <div className="space-y-2">
                <label className="text-sm font-medium">Expression Tags</label>
                <div className="flex gap-2">
                    <Input 
                        placeholder="Add tag (e.g. masc, fem, gender-neutral)"
                        value={tagInput}
                        onChange={(e) => setTagInput(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                                e.preventDefault()
                                if (tagInput.trim()) {
                                    toggleOption('expression_tags', tagInput.trim())
                                    setTagInput('')
                                }
                            }
                        }}
                    />
                    <Button 
                        type="button" 
                        onClick={() => {
                             if (tagInput.trim()) {
                                toggleOption('expression_tags', tagInput.trim())
                                setTagInput('')
                            }
                        }}
                    >
                        Add
                    </Button>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                    {formData.expression_tags?.map((tag: string) => (
                        <span key={tag} className="px-2 py-1 bg-secondary text-secondary-foreground rounded-md text-sm flex items-center gap-1">
                            {tag}
                            <button type="button" onClick={() => toggleOption('expression_tags', tag)} className="hover:text-destructive"><X className="h-3 w-3" /></button>
                        </span>
                    ))}
                </div>
            </div>
       </div>

      <div className="space-y-4">
        <h3 className="text-lg font-medium">Options</h3>
        
        <div className="space-y-2">
            <label className="text-sm font-medium">Sizes</label>
            <div className="flex flex-wrap gap-2">
                {SIZE_OPTIONS.map(size => (
                    <button
                        type="button"
                        key={size}
                        onClick={() => toggleOption('size_options', size)}
                        className={`px-3 py-1 text-sm rounded-full border ${formData.size_options?.includes(size) ? 'bg-primary text-primary-foreground border-primary' : 'bg-background hover:bg-muted'}`}
                    >
                        {size}
                    </button>
                ))}
            </div>
        </div>

        <div className="space-y-2">
            <label className="text-sm font-medium">Colors</label>
            <div className="flex flex-wrap gap-2">
                {COLOR_OPTIONS.map(color => (
                    <button
                        type="button"
                        key={color}
                        onClick={() => toggleOption('color_options', color)}
                        className={`px-3 py-1 text-sm rounded-full border ${formData.color_options?.includes(color) ? 'bg-primary text-primary-foreground border-primary' : 'bg-background hover:bg-muted'}`}
                    >
                        {color}
                    </button>
                ))}
            </div>
        </div>
      </div>

      <div className="flex justify-end gap-4 pt-4">
        <Button type="button" variant="ghost" onClick={() => router.back()}>Cancel</Button>
        <Button type="submit" disabled={isSaving}>
            {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {productId ? 'Update Product' : 'Create Product'}
        </Button>
      </div>
    </form>
  )
}
