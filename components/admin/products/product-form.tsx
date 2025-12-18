'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Loader2, Save, X, Plus, Image as ImageIcon, Trash2 } from 'lucide-react'
import { uploadImage } from '@/lib/services/upload-service'
import { slugify } from '@/lib/slugify'
import { toast } from 'sonner'
import { useForm, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { productSchema, ProductFormValues } from '@/lib/validations/product'
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { ProductImageUpload } from '@/components/admin/product-image-upload'
import { cn } from '@/lib/utils'

import { Category } from '@/types/store-types'

const SIZE_OPTIONS = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'Oversized']
const COLOR_OPTIONS = ['Black', 'White', 'Navy', 'Beige', 'Red', 'Green', 'Blue', 'Pink', 'Grey', 'Yellow', 'Purple']

interface ProductFormProps {
    initialData?: ProductFormValues & { id?: string }
    categories: Category[]
    isLoading: boolean
    onSubmit: (data: ProductFormValues) => void
    onCancel: () => void
}

export function ProductForm({ initialData, categories, isLoading, onSubmit, onCancel }: ProductFormProps) {
    const [activeTab, setActiveTab] = useState("details")
    const [isUploading, setIsUploading] = useState(false)

    // Form Initialization
    const form = useForm<ProductFormValues>({
        resolver: zodResolver(productSchema) as any,
        defaultValues: initialData || {
            name: '',
            slug: '',
            description: '',
            price: 0,
            category_id: '',
            main_image_url: '',
            gallery_image_urls: [],
            is_active: true,
            images: undefined,
            variants: []
        }
    })

    const { fields, append, remove, update } = useFieldArray({
        control: form.control,
        name: "variants"
    })

    // Auto-generate slug watching name
    const { watch, setValue } = form
    const name = watch("name")
    const slug = watch("slug")

    useEffect(() => {
        if (!initialData && name && (!slug || slug === slugify(name.slice(0, -1)))) {
            setValue("slug", slugify(name))
        }
    }, [name, initialData, setValue, slug])

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
                setValue('main_image_url', publicUrl, { shouldValidate: true })
            } else {
                const currentGallery = form.getValues('gallery_image_urls') || []
                setValue('gallery_image_urls', [...currentGallery, publicUrl])
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
        const currentGallery = form.getValues('gallery_image_urls')
        setValue('gallery_image_urls', currentGallery.filter((_, i) => i !== idx))
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 animate-in fade-in slide-in-from-bottom-5 duration-500">
                
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="details">Details</TabsTrigger>
                        <TabsTrigger value="media">Media</TabsTrigger>
                        <TabsTrigger value="variants">Variants ({fields.length})</TabsTrigger>
                    </TabsList>

                    {/* -- TAB: DETAILS -- */}
                    <TabsContent value="details" className="space-y-4 mt-4">
                        <Card>
                            <CardContent className="space-y-4 pt-6">
                                <FormField
                                    control={form.control}
                                    name="name"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Product Name <span className="text-destructive">*</span></FormLabel>
                                            <FormControl><Input placeholder="e.g. Essential Tee" {...field} /></FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                
                                <FormField
                                    control={form.control}
                                    name="slug"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Slug <span className="text-destructive">*</span></FormLabel>
                                            <FormControl>
                                                <div className="flex">
                                                     <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-input bg-muted text-muted-foreground text-sm">/product/</span>
                                                    <Input {...field} className="rounded-l-none font-mono text-sm" placeholder="essential-tee" />
                                                </div>
                                            </FormControl>
                                            <FormDescription>Unique ID for the product URL.</FormDescription>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                
                                <div className="grid grid-cols-2 gap-4">
                                    <FormField
                                        control={form.control}
                                        name="price"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Price ($) <span className="text-destructive">*</span></FormLabel>
                                                <FormControl><Input type="number" step="0.01" {...field} /></FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="category_id"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Category <span className="text-destructive">*</span></FormLabel>
                                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                    <FormControl>
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Select..." />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        {categories.map(c => (
                                                            <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                <FormField
                                    control={form.control}
                                    name="description"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Description</FormLabel>
                                            <FormControl><Textarea className="min-h-[100px]" {...field} /></FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="is_active"
                                    render={({ field }) => (
                                        <FormItem className="flex items-center justify-between rounded-lg border p-3 bg-muted/20">
                                            <div className="space-y-0.5">
                                                <FormLabel>Active Status</FormLabel>
                                                <FormDescription>Visible to customers</FormDescription>
                                            </div>
                                            <FormControl>
                                                <Switch checked={field.value} onCheckedChange={field.onChange} />
                                            </FormControl>
                                        </FormItem>
                                    )}
                                />
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* -- TAB: MEDIA -- */}
                    <TabsContent value="media" className="space-y-4 mt-4">
                        <Card>
                             <CardContent className="space-y-6 pt-6">
                                <div className="space-y-2">
                                    <FormLabel>Main Image</FormLabel>
                                    <FormLabel>Main Image (Optimized)</FormLabel>
                                    <div className="flex flex-col gap-4">
                                        <ProductImageUpload 
                                            currentImage={form.watch('images')?.thumbnail || form.watch('main_image_url')} 
                                            onUploadComplete={(urls) => {
                                                setValue('images', urls)
                                                setValue('main_image_url', urls.desktop) // Fallback for legacy
                                                toast.success('Optimized images saved')
                                            }}
                                            onRemove={() => {
                                                setValue('images', undefined)
                                                setValue('main_image_url', '')
                                            }}
                                        />
                                        
                                        {/* Hidden fallback input for form validation if needed, though handled by component state usually */}
                                    </div>
                                    <div className="text-[0.8rem] text-muted-foreground">
                                        <FormField name="main_image_url" render={() => <FormMessage />} />
                                    </div>
                                </div>

                                 <div className="space-y-2">
                                    <FormLabel>Gallery Images</FormLabel>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                        {watch('gallery_image_urls')?.map((url, idx) => (
                                            <div key={idx} className="relative aspect-square rounded-md overflow-hidden border group">
                                                <img src={url} className="h-full w-full object-cover" alt="Gallery" />
                                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                    <Button type="button" variant="destructive" size="icon" className="h-6 w-6" onClick={() => removeGalleryImage(idx)}>
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
                                    <Button type="button" size="sm" variant="outline" onClick={() => append({ size: 'M', color: 'Black', quantity: 0 })}>
                                        <Plus className="mr-2 h-4 w-4"/> Add Variant
                                    </Button>
                                </div>
                                
                                {fields.length === 0 ? (
                                    <div className="text-center py-8 text-muted-foreground border rounded-lg bg-muted/10">No variants added.</div>
                                ) : (
                                    <div className="space-y-2">
                                        <div className="grid grid-cols-12 gap-2 text-xs font-semibold text-muted-foreground px-2">
                                            <div className="col-span-4">Size</div>
                                            <div className="col-span-4">Color</div>
                                            <div className="col-span-3">Qty</div>
                                            <div className="col-span-1"></div>
                                        </div>
                                        {fields.map((field, idx) => (
                                            <div key={field.id} className="grid grid-cols-12 gap-2 items-center">
                                                <div className="col-span-4">
                                                    <FormField
                                                        control={form.control}
                                                        name={`variants.${idx}.size`}
                                                        render={({ field }) => (
                                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                                <SelectTrigger className="h-8"><SelectValue /></SelectTrigger>
                                                                <SelectContent>
                                                                    {SIZE_OPTIONS.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                                                                </SelectContent>
                                                            </Select>
                                                        )}
                                                    />
                                                </div>
                                                <div className="col-span-4">
                                                    <FormField
                                                        control={form.control}
                                                        name={`variants.${idx}.color`}
                                                        render={({ field }) => (
                                                            <Select 
                                                                defaultValue={COLOR_OPTIONS.includes(field.value) ? field.value : 'Custom'}
                                                                onValueChange={(val) => {
                                                                    if (val !== 'Custom') {
                                                                        field.onChange(val)
                                                                    }
                                                                }}
                                                            >
                                                                <SelectTrigger className="h-8 text-xs">
                                                                    <SelectValue placeholder={field.value} />
                                                                </SelectTrigger>
                                                                <SelectContent>
                                                                     <SelectItem value="Custom" className="font-semibold text-primary focus:text-primary">
                                                                        {COLOR_OPTIONS.includes(field.value) ? '✨ Custom Color' : field.value || 'Custom'}
                                                                     </SelectItem>
                                                                    {COLOR_OPTIONS.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                                                                </SelectContent>
                                                            </Select>
                                                        )}
                                                    />
                                                    {/* If simple select isn't enough for custom, we can enhance later. For now, kept simple. */}
                                                </div>
                                                <div className="col-span-3">
                                                    <FormField
                                                        control={form.control}
                                                        name={`variants.${idx}.quantity`}
                                                        render={({ field }) => (
                                                             <Input 
                                                                type="number" className="h-9" 
                                                                {...field}
                                                                onChange={e => field.onChange(Number(e.target.value))}
                                                            />
                                                        )}
                                                    />
                                                </div>
                                                <div className="col-span-1 text-right">
                                                    <Button type="button" size="icon" variant="ghost" className="h-8 w-8 text-destructive" onClick={() => remove(idx)}>
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
                    <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>Cancel</Button>
                    <Button type="submit" disabled={isLoading || isUploading}>
                        {isLoading ? <Loader2 className="animate-spin mr-2 h-4 w-4"/> : <Save className="mr-2 h-4 w-4"/>}
                        Save Product
                    </Button>
                </div>
            </form>
        </Form>
    )
}
