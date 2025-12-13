'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Database } from '@/types/supabase'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Modal } from '@/components/ui/modal'
import { Plus, Pencil, Trash2, Power } from 'lucide-react'
import { cn } from '@/lib/utils'
import { slugify } from '@/lib/slugify'
import { toast } from 'sonner'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

type Category = Database['public']['Tables']['categories']['Row']

export default function CategoriesPage() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  
  // Form State
  const [formData, setFormData] = useState({ 
      name: '', 
      slug: '', 
      description: '', 
      parent_id: '', 
      image_url: '' 
  })
  const [isUploading, setIsUploading] = useState(false)
  
  const supabase = createClient()
  const queryClient = useQueryClient()

  // 1. Fetch Categories
  const { data: categories = [], isLoading } = useQuery<Category[]>({
    queryKey: ['categories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('created_at', { ascending: false })
      if (error) throw error
      return data
    }
  })

  // 2. Mutations
  const mutation = useMutation({
    mutationFn: async (values: typeof formData & { id?: string }) => {
        // Validate slug uniqueness if new or changed
        const { count } = await supabase
            .from('categories')
            .select('*', { count: 'exact', head: true })
            .eq('slug', values.slug)
            .neq('id', values.id || '') // Exclude self if editing
        
        if (count && count > 0) {
            throw new Error('Category with this slug already exists.')
        }

        const payload = {
            name: values.name,
            slug: values.slug,
            description: values.description,
            parent_id: values.parent_id || null, // Handle empty string as null
            image_url: values.image_url
        }

        if (values.id) {
            const { error } = await (supabase.from('categories') as any).update(payload as any).eq('id', values.id)
            if (error) throw error
        } else {
            const { error } = await supabase.from('categories').insert([payload] as any)
            if (error) throw error
        }
    },
    onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['categories'] })
        setIsModalOpen(false)
        toast.success(editingCategory ? 'Category updated' : 'Category created')
    },
    onError: (err) => {
        toast.error(err.message)
    }
  })

  const toggleStatusMutation = useMutation({
      mutationFn: async ({ id, isActive }: { id: string, isActive: boolean }) => {
          const { error } = await (supabase
            .from('categories') as any)
            .update({ is_active: isActive })
            .eq('id', id)
          if (error) throw error
      },
      onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ['categories'] })
          toast.success('Status updated')
      },
      onError: (err) => toast.error('Failed to update status')
  })

  // Handlers
  const handleOpenModal = (category?: Category) => {
    if (category) {
      setEditingCategory(category)
      setFormData({
        name: category.name,
        slug: category.slug,
        description: category.description || '',
        parent_id: category.parent_id || '',
        image_url: category.image_url || ''
      })
    } else {
      setEditingCategory(null)
      setFormData({ name: '', slug: '', description: '', parent_id: '', image_url: '' })
    }
    setIsModalOpen(true)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    mutation.mutate({ ...formData, id: editingCategory?.id })
  }

  // Auto-slugify
  const handleNameChange = (name: string) => {
      setFormData(prev => ({
          ...prev,
          name,
          slug: editingCategory ? prev.slug : slugify(name)
      }))
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (!file) return

      setIsUploading(true)
      const fileName = `cat_${Date.now()}_${slugify(file.name)}`
      
      try {
          const { error } = await supabase.storage.from('category-images').upload(fileName, file)
          if (error) throw error
          
          const { data: { publicUrl } } = supabase.storage.from('category-images').getPublicUrl(fileName)
          setFormData(prev => ({ ...prev, image_url: publicUrl }))
      } catch (err: any) {
          toast.error('Upload failed: ' + err.message)
      } finally {
          setIsUploading(false)
      }
  }

  // Filter categories for valid parents (exclude self and nulls, prevent basic cycles)
  const validParents = categories.filter(c => c.id !== editingCategory?.id)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Categories</h1>
        <Button onClick={() => handleOpenModal()}>
          <Plus className="mr-2 h-4 w-4" />
          Add Category
        </Button>
      </div>

      <div className="rounded-md border border-border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Slug</TableHead>
              <TableHead>Parent</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
                <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">Loading...</TableCell>
                </TableRow>
            ) : categories.length === 0 ? (
                <TableRow>
                     <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">No categories found.</TableCell>
                </TableRow>
            ) : (
                categories.map((category) => {
                    const parent = categories.find(c => c.id === category.parent_id)
                    return (
                        <TableRow key={category.id} className={!category.is_active ? 'opacity-50' : ''}>
                            <TableCell className="font-medium">
                                <div className="flex items-center gap-2">
                                    {category.image_url && <img src={category.image_url} className="w-8 h-8 rounded-full object-cover border" alt="" />}
                                    {category.name}
                                </div>
                            </TableCell>
                            <TableCell className="font-mono text-xs">{category.slug}</TableCell>
                            <TableCell className="text-muted-foreground text-sm">{parent?.name || '-'}</TableCell>
                            <TableCell>
                                <button 
                                    onClick={() => toggleStatusMutation.mutate({ id: category.id, isActive: !category.is_active })}
                                    className={cn("inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ring-1 ring-inset transition-colors", 
                                        category.is_active 
                                        ? "bg-green-50 text-green-700 ring-green-600/20 hover:bg-green-100" 
                                        : "bg-red-50 text-red-700 ring-red-600/20 hover:bg-red-100"
                                    )}>
                                    {category.is_active ? 'Active' : 'Inactive'}
                                </button>
                            </TableCell>
                            <TableCell className="text-right space-x-2">
                                <Button variant="ghost" size="icon" onClick={() => handleOpenModal(category)}>
                                    <Pencil className="h-4 w-4" />
                                </Button>
                            </TableCell>
                        </TableRow>
                    )
                })
            )}
          </TableBody>
        </Table>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingCategory ? 'Edit Category' : 'New Category'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
                <label className="text-sm font-medium">Name</label>
                <Input 
                    value={formData.name} 
                    onChange={e => handleNameChange(e.target.value)} 
                    required 
                    placeholder="e.g. Hoodies"
                />
            </div>
            
            <div className="space-y-2">
                <label className="text-sm font-medium">Slug</label>
                <Input 
                    value={formData.slug} 
                    onChange={e => setFormData(prev => ({ ...prev, slug: slugify(e.target.value) }))} 
                    required 
                    placeholder="hoodies"
                />
            </div>

            <div className="space-y-2">
                <label className="text-sm font-medium">Parent Category</label>
                <select 
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    value={formData.parent_id}
                    onChange={e => setFormData(prev => ({ ...prev, parent_id: e.target.value }))}
                >
                    <option value="">None (Top Level)</option>
                    {validParents.map(c => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                </select>
            </div>

            <div className="space-y-2">
                <label className="text-sm font-medium">Image</label>
                <div className="flex gap-4 items-center">
                    {formData.image_url && <img src={formData.image_url} className="w-16 h-16 rounded object-cover border" alt="Preview" />}
                    <Input 
                        type="file" 
                        accept="image/*" 
                        onChange={handleImageUpload} 
                        disabled={isUploading}
                    />
                </div>
                {isUploading && <p className="text-xs text-muted-foreground">Uploading...</p>}
            </div>

            <div className="space-y-2">
                <label className="text-sm font-medium">Description</label>
                <Input 
                    value={formData.description} 
                    onChange={e => setFormData(prev => ({ ...prev, description: e.target.value }))} 
                    placeholder="Optional description"
                />
            </div>

            <div className="flex justify-end pt-4">
                <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)} className="mr-2">Cancel</Button>
                <Button type="submit" disabled={mutation.isPending || isUploading}>
                    {mutation.isPending && <span className="animate-spin mr-2">⏳</span>}
                    {editingCategory ? 'Save Changes' : 'Create Category'}
                </Button>
            </div>
        </form>
      </Modal>
    </div>
  )
}
