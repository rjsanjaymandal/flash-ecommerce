'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Loader2, Save, X, Plus, Image as ImageIcon, Trash2 } from 'lucide-react'
import { uploadImage } from '@/lib/services/upload-service'
import { slugify } from '@/lib/slugify'
import { toast } from 'sonner'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'

const SIZE_OPTIONS = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'Oversized']
const COLOR_OPTIONS = ['Black', 'White', 'Navy', 'Beige', 'Red', 'Green', 'Blue', 'Pink', 'Grey', 'Yellow', 'Purple']

type Variant = {
    id?: string
    size: string
    color: string
    quantity: number
}

export type ProductFormData = {
    name: string
    slug: string
    description: string
    price: string | number
    category_id: string
    main_image_url: string
    gallery_image_urls: string[]
    is_active: boolean
    variants: Variant[]
}

interface ProductFormProps {
    initialData?: ProductFormData
    categories: any[]
    isLoading: boolean
    onSubmit: (data: ProductFormData) => void
    onCancel: () => void
}

export function ProductForm({ initialData, categories, isLoading, onSubmit, onCancel }: ProductFormProps) {
    const [activeTab, setActiveTab] = useState("details")
    const [formData, setFormData] = useState<ProductFormData>(initialData || {
        name: '', slug: '', description: '', price: '', category_id: '',
        main_image_url: '', gallery_image_urls: [], is_active: true,
        variants: []
    })
    const [errors, setErrors] = useState<string[]>([])
    const [isUploading, setIsUploading] = useState(false)

    // Reset when initialData arrives (e.g. async fetch)
    useEffect(() => {
        if (initialData) setFormData(initialData)
    }, [initialData])

    // -- Handlers --

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'main' | 'gallery') => {
        const file = e.target.files?.[0]
        if (!file) return

        setIsUploading(true)
        try {
            const formData = new FormData()
            formData.append('file', file)
            
            const publicUrl = await uploadImage(formData)
            
            if (type === 'main') {
                setFormData(prev => ({ ...prev, main_image_url: publicUrl }))
            } else {
                setFormData(prev => ({ ...prev, gallery_image_urls: [...prev.gallery_image_urls, publicUrl] }))
            }
            toast.success('Image uploaded')
        } catch (err: any) {
            toast.error('Upload failed: ' + err.message)
        } finally {
            setIsUploading(false)
            if (e.target) e.target.value = ''
        }
    }

    const removeGalleryImage = (idx: number) => {
        setFormData(prev => ({
            ...prev,
            gallery_image_urls: prev.gallery_image_urls.filter((_, i) => i !== idx)
        }))
    }

    // Variants
    const addVariant = () => {
        setFormData(prev => ({
            ...prev,
            variants: [...prev.variants, { size: 'M', color: 'Black', quantity: 0 }]
        }))
    }

    const updateVariant = (idx: number, field: keyof Variant, value: any) => {
        const newVariants = [...formData.variants]
        newVariants[idx] = { ...newVariants[idx], [field]: value }
        setFormData(prev => ({ ...prev, variants: newVariants }))
    }

    const removeVariant = (idx: number) => {
        setFormData(prev => ({
            ...prev,
            variants: prev.variants.filter((_, i) => i !== idx)
        }))
    }

    // Submit
    const validateAndSubmit = () => {
        const newErrors = []
        if (!formData.name) newErrors.push("Product Name is required")
        if (!formData.slug) newErrors.push("Product Slug is required")
        if (!formData.price || Number(formData.price) <= 0) newErrors.push("Valid Price is required")
        if (!formData.category_id) newErrors.push("Category is required")

        if (newErrors.length > 0) {
            setErrors(newErrors)
            toast.error("Please fix validation errors")
            return
        }
        setErrors([])
        onSubmit(formData)
    }

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-5 duration-500">
            {errors.length > 0 && (
                <Alert variant="destructive">
                    <AlertTitle>Validation Error</AlertTitle>
                    <AlertDescription>
                        {errors.map((e, i) => <div key={i}>• {e}</div>)}
                    </AlertDescription>
                </Alert>
            )}

            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="details">Details</TabsTrigger>
                    <TabsTrigger value="media">Media</TabsTrigger>
                    <TabsTrigger value="variants">Variants ({formData.variants.length})</TabsTrigger>
                </TabsList>

                {/* -- TAB: DETAILS -- */}
                <TabsContent value="details" className="space-y-4 mt-4">
                    <Card>
                        <CardContent className="space-y-4 pt-6">
                            <div className="grid gap-2">
                                <Label>Product Name <span className="text-destructive">*</span></Label>
                                <Input 
                                    value={formData.name} 
                                    onChange={e => {
                                        const name = e.target.value
                                        // Auto-generate slug if it's empty or matches the old likely-slug
                                        const currentSlugFromOldName = slugify(formData.name)
                                        const isAutoSlug = formData.slug === '' || formData.slug === currentSlugFromOldName
                                        
                                        setFormData(prev => ({ 
                                            ...prev, 
                                            name, 
                                            slug: isAutoSlug ? slugify(name) : prev.slug 
                                        })) 
                                    }} 
                                    placeholder="e.g. Essential Tee"
                                />
                            </div>
                            
                            <div className="grid gap-2">
                                <Label>Slug (URL) <span className="text-destructive">*</span></Label>
                                <div className="flex">
                                    <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-input bg-muted text-muted-foreground text-sm">
                                        /product/
                                    </span>
                                    <Input 
                                        value={formData.slug} 
                                        onChange={e => setFormData({ ...formData, slug: slugify(e.target.value) })} 
                                        placeholder="essential-tee"
                                        className="rounded-l-none font-mono text-sm"
                                    />
                                </div>
                                <p className="text-[10px] text-muted-foreground">Unique ID for the product URL.</p>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4">
                                <div className="grid gap-2">
                                    <Label>Price ($) <span className="text-destructive">*</span></Label>
                                    <Input 
                                        type="number" step="0.01" 
                                        value={formData.price} 
                                        onChange={e => setFormData({ ...formData, price: e.target.value })} 
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label>Category <span className="text-destructive">*</span></Label>
                                    <Select 
                                        value={formData.category_id} 
                                        onValueChange={(val) => setFormData({ ...formData, category_id: val })}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select..." />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {categories.map(c => (
                                                <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="grid gap-2">
                                <Label>Description</Label>
                                <Textarea 
                                    className="min-h-[100px]"
                                    value={formData.description} 
                                    onChange={e => setFormData({ ...formData, description: e.target.value })} 
                                />
                            </div>

                            <div className="flex items-center justify-between rounded-lg border p-3 bg-muted/20">
                                <div className="space-y-0.5">
                                    <Label>Active Status</Label>
                                    <p className="text-xs text-muted-foreground">Visible to customers</p>
                                </div>
                                <Switch 
                                    checked={formData.is_active} 
                                    onCheckedChange={c => setFormData({ ...formData, is_active: c })} 
                                />
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* -- TAB: MEDIA -- */}
                <TabsContent value="media" className="space-y-4 mt-4">
                    <Card>
                         <CardContent className="space-y-6 pt-6">
                            <div className="space-y-2">
                                <Label>Main Image</Label>
                                <div className="border-2 border-dashed rounded-lg p-4 flex flex-col items-center justify-center min-h-[200px] bg-muted/10 hover:bg-muted/20 transition-colors">
                                    {formData.main_image_url ? (
                                        <div className="relative h-48 w-full max-w-xs group">
                                            <img src={formData.main_image_url} className="h-full w-full object-cover rounded-md shadow-sm" alt="Main" />
                                            <Button 
                                                variant="destructive" size="icon" className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                                                onClick={() => setFormData({ ...formData, main_image_url: '' })}
                                            >
                                                <X className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    ) : (
                                        <div className="text-center">
                                            {isUploading ? <Loader2 className="h-8 w-8 animate-spin mx-auto text-muted-foreground"/> : <ImageIcon className="h-8 w-8 mx-auto text-muted-foreground mb-2"/>}
                                            <div className="text-sm text-muted-foreground">Click to upload main image</div>
                                            <Input 
                                                type="file" accept="image/*" className="hidden" id="main-upload"
                                                onChange={(e) => handleImageUpload(e, 'main')}
                                                disabled={isUploading}
                                            />
                                            <Button variant="outline" size="sm" className="mt-2" onClick={() => document.getElementById('main-upload')?.click()}>
                                                Select File
                                            </Button>
                                        </div>
                                    )}
                                </div>
                            </div>

                             <div className="space-y-2">
                                <Label>Gallery Images</Label>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    {formData.gallery_image_urls.map((url, idx) => (
                                        <div key={idx} className="relative aspect-square rounded-md overflow-hidden border group">
                                            <img src={url} className="h-full w-full object-cover" alt="Gallery" />
                                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                <Button variant="destructive" size="icon" className="h-6 w-6" onClick={() => removeGalleryImage(idx)}>
                                                    <X className="h-3 w-3" />
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                    <div className="aspect-square rounded-md border-2 border-dashed flex items-center justify-center hover:bg-muted/20 cursor-pointer" onClick={() => document.getElementById('gallery-upload')?.click()}>
                                        {isUploading ? <Loader2 className="h-6 w-6 animate-spin text-muted-foreground"/> : <Plus className="h-6 w-6 text-muted-foreground"/>}
                                        <Input 
                                            type="file" accept="image/*" className="hidden" id="gallery-upload"
                                            onChange={(e) => handleImageUpload(e, 'gallery')}
                                            disabled={isUploading}
                                        />
                                    </div>
                                </div>
                            </div>
                         </CardContent>
                    </Card>
                </TabsContent>

                {/* -- TAB: VARIANTS -- */}
                <TabsContent value="variants" className="space-y-4 mt-4">
                    <Card>
                        <CardContent className="space-y-4 pt-6">
                            <div className="flex justify-between items-center">
                                <p className="text-sm text-muted-foreground">Manage stock for different variations.</p>
                                <Button size="sm" variant="outline" onClick={addVariant}><Plus className="mr-2 h-4 w-4"/> Add Variant</Button>
                            </div>
                            
                            {formData.variants.length === 0 ? (
                                <div className="text-center py-8 text-muted-foreground border rounded-lg bg-muted/10">No variants added.</div>
                            ) : (
                                <div className="space-y-2">
                                    <div className="grid grid-cols-12 gap-2 text-xs font-semibold text-muted-foreground px-2">
                                        <div className="col-span-4">Size</div>
                                        <div className="col-span-4">Color</div>
                                        <div className="col-span-3">Qty</div>
                                        <div className="col-span-1"></div>
                                    </div>
                                    {formData.variants.map((v, idx) => (
                                        <div key={idx} className="grid grid-cols-12 gap-2 items-center">
                                            <div className="col-span-4">
                                                <Select value={v.size} onValueChange={val => updateVariant(idx, 'size', val)}>
                                                    <SelectTrigger className="h-8"><SelectValue /></SelectTrigger>
                                                    <SelectContent>
                                                        {SIZE_OPTIONS.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            <div className="col-span-4">
                                            <div className="col-span-4">
                                                {/* Color Logic: Toggle between Select and Custom Input to save space */}
                                                {(() => {
                                                    const isCustom = !COLOR_OPTIONS.includes(v.color)
                                                    
                                                    if (isCustom) {
                                                        // Render Input Mode
                                                        return (
                                                            <div className="flex gap-1 items-center animate-in fade-in zoom-in-95 duration-200">
                                                                <Input 
                                                                    className="h-8 px-2 text-xs" 
                                                                    placeholder="Type color..."
                                                                    value={v.color}
                                                                    onChange={(e) => updateVariant(idx, 'color', e.target.value)}
                                                                />
                                                                <Button 
                                                                    size="icon" variant="ghost" className="h-8 w-8 shrink-0 text-muted-foreground hover:text-foreground"
                                                                    onClick={() => updateVariant(idx, 'color', 'Black')} // Reset to default on switch back
                                                                    title="Choose from list"
                                                                >
                                                                    <X className="h-3 w-3" />
                                                                </Button>
                                                            </div>
                                                        )
                                                    }

                                                    // Render Select Mode
                                                    return (
                                                        <Select 
                                                            value={v.color} 
                                                            onValueChange={val => {
                                                                if (val === 'Custom') {
                                                                    updateVariant(idx, 'color', '') // Clear to enter custom
                                                                } else {
                                                                    updateVariant(idx, 'color', val)
                                                                }
                                                            }}
                                                        >
                                                            <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                                                            <SelectContent>
                                                                <SelectItem value="Custom" className="font-semibold text-primary focus:text-primary">✨ Custom Color</SelectItem>
                                                                {COLOR_OPTIONS.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                                                            </SelectContent>
                                                        </Select>
                                                    )
                                                })()}
                                            </div>
                                            </div>
                                            <div className="col-span-3">
                                                <Input 
                                                    type="number" className="h-9" 
                                                    value={v.quantity} 
                                                    onChange={e => updateVariant(idx, 'quantity', Number(e.target.value))} 
                                                />
                                            </div>
                                            <div className="col-span-1 text-right">
                                                <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive" onClick={() => removeVariant(idx)}>
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>

            <div className="flex justify-end gap-3 sticky bottom-0 bg-background/95 backdrop-blur p-4 border-t z-10">
                <Button variant="outline" onClick={onCancel} disabled={isLoading}>Cancel</Button>
                <Button onClick={validateAndSubmit} disabled={isLoading || isUploading}>
                    {isLoading ? <Loader2 className="animate-spin mr-2 h-4 w-4"/> : <Save className="mr-2 h-4 w-4"/>}
                    Save Product
                </Button>
            </div>
        </div>
    )
}
