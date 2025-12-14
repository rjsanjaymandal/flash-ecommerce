'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { slugify } from '@/lib/slugify'
import { Image as ImageIcon, Loader2, X } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'

export type CategoryFormData = {
    name: string
    slug: string
    description: string
    parent_id: string 
    image_url: string
    is_active: boolean
}

interface CategoryFormProps {
    initialData?: CategoryFormData
    categories: any[]
    isEditing: boolean
    isLoading: boolean
    onSubmit: (data: CategoryFormData) => void
    onCancel: () => void
}

export function CategoryForm({ initialData, categories, isEditing, isLoading, onSubmit, onCancel }: CategoryFormProps) {
    const supabase = createClient()
    const [formData, setFormData] = useState<CategoryFormData>(initialData || {
        name: '',
        slug: '',
        description: '',
        parent_id: 'none',
        image_url: '',
        is_active: true
    })
    
    // Reset form when initialData changes (for editing)
    useEffect(() => {
        if (initialData) {
            setFormData(initialData)
        } else {
            setFormData({
                name: '', slug: '', description: '', parent_id: 'none', image_url: '', is_active: true
            })
        }
    }, [initialData])

    const [isUploading, setIsUploading] = useState(false)
    const [errors, setErrors] = useState<string[]>([])

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        setIsUploading(true)
        try {
            const fileExt = file.name.split('.').pop()
            const fileName = `cat_${Date.now()}_${Math.random()}.${fileExt}`
            const { error } = await supabase.storage.from('category-images').upload(fileName, file)
            if (error) throw error
            
            const { data: { publicUrl } } = supabase.storage.from('category-images').getPublicUrl(fileName)
            setFormData(prev => ({ ...prev, image_url: publicUrl }))
            toast.success('Image Uploaded')
        } catch (err: any) {
            toast.error('Upload failed: ' + err.message)
        } finally {
            setIsUploading(false)
            if (e.target) e.target.value = ''
        }
    }

    const validateAndSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        const newErrors = []
        if (!formData.name) newErrors.push("Category Name is required")
        if (!formData.slug) newErrors.push("Slug is required")
        
        if (newErrors.length > 0) {
            setErrors(newErrors)
            return
        }
        
        setErrors([])
        onSubmit(formData)
    }

    return (
        <form onSubmit={validateAndSubmit} className="space-y-4 pt-4">
             {errors.length > 0 && (
                <Alert variant="destructive">
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>
                        {errors.map((e, i) => <div key={i}>{e}</div>)}
                    </AlertDescription>
                </Alert>
            )}

            <div className="grid gap-4">
                <div className="grid gap-2">
                    <Label htmlFor="name">Name <span className="text-destructive">*</span></Label>
                    <Input 
                        id="name"
                        value={formData.name} 
                        onChange={e => setFormData(prev => ({ 
                            ...prev, 
                            name: e.target.value,
                            slug: isEditing ? prev.slug : slugify(e.target.value) // Auto-slug only on create
                        }))}
                        placeholder="e.g. Summer Collection"
                    />
                </div>
                
                <div className="grid gap-2">
                    <Label htmlFor="slug">Slug <span className="text-destructive">*</span></Label>
                    <Input 
                        id="slug"
                        value={formData.slug} 
                        onChange={e => setFormData(prev => ({ ...prev, slug: slugify(e.target.value) }))} 
                        placeholder="url-friendly-slug"
                    />
                </div>

                <div className="grid gap-2">
                    <Label>Parent Category <span className="text-muted-foreground text-xs">(Optional)</span></Label>
                    <Select 
                        value={formData.parent_id} 
                        onValueChange={(val) => setFormData(prev => ({ ...prev, parent_id: val }))}
                    >
                        <SelectTrigger>
                            <SelectValue placeholder="Select parent" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="none">None (Top Level)</SelectItem>
                            {categories.map(c => (
                                <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <div className="grid gap-2">
                    <Label>Cover Image <span className="text-muted-foreground text-xs">(Optional)</span></Label>
                    <div className="flex items-center gap-4 rounded-lg border p-3 border-dashed hover:bg-muted/50 transition-colors">
                        {formData.image_url ? (
                            <div className="relative h-16 w-16 rounded overflow-hidden border group">
                                <img src={formData.image_url} className="h-full w-full object-cover" alt="Preview"/>
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                    <Button type="button" variant="destructive" size="icon" className="h-6 w-6" onClick={() => setFormData(prev => ({ ...prev, image_url: '' }))}>
                                        <X className="h-3 w-3" />
                                    </Button>
                                </div>
                            </div>
                        ) : (
                            <div className="h-16 w-16 rounded bg-muted flex items-center justify-center">
                                {isUploading ? <Loader2 className="h-6 w-6 animate-spin text-muted-foreground"/> : <ImageIcon className="h-6 w-6 text-muted-foreground" />}
                            </div>
                        )}
                        <div className="flex-1">
                             <div className="text-sm text-muted-foreground mb-1">
                                {isUploading ? 'Uploading...' : 'Click or drop to upload'}
                             </div>
                            <Input 
                                type="file" 
                                accept="image/*" 
                                onChange={handleImageUpload} 
                                disabled={isUploading}
                                className="cursor-pointer file:cursor-pointer file:text-primary"
                            />
                        </div>
                    </div>
                </div>

                <div className="grid gap-2">
                    <Label>Description <span className="text-muted-foreground text-xs">(Optional)</span></Label>
                    <Input 
                        value={formData.description} 
                        onChange={e => setFormData(prev => ({ ...prev, description: e.target.value }))} 
                        placeholder="Brief description for SEO"
                    />
                </div>

                <div className="flex items-center justify-between rounded-lg border p-3 shadow-sm bg-card">
                    <div className="space-y-0.5">
                        <Label>Active Status</Label>
                        <p className="text-xs text-muted-foreground">Show in navigation</p>
                    </div>
                    <Switch 
                        checked={formData.is_active}
                        onCheckedChange={(c) => setFormData(prev => ({ ...prev, is_active: c }))}
                    />
                </div>
            </div>

            <div className="flex justify-end pt-4 gap-2">
                <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
                <Button type="submit" disabled={isLoading || isUploading}>
                    {isLoading && <Loader2 className="animate-spin mr-2 h-4 w-4" />}
                    {isEditing ? 'Save Changes' : 'Create Category'}
                </Button>
            </div>
        </form>
    )
}
