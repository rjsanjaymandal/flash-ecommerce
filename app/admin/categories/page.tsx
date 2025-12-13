'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Database } from '@/types/supabase'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Modal } from '@/components/ui/modal'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import { cn } from '@/lib/utils'

type Category = Database['public']['Tables']['categories']['Row']

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  
  // Form State
  const [formData, setFormData] = useState({ name: '', slug: '', description: '' })
  const supabase = createClient()

  const fetchCategories = async () => {
    setIsLoading(true)
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (data) setCategories(data)
    setIsLoading(false)
  }

  useEffect(() => {
    fetchCategories()
  }, [])

  const handleOpenModal = (category?: Category) => {
    if (category) {
      setEditingCategory(category)
      setFormData({
        name: category.name,
        slug: category.slug,
        description: category.description || ''
      })
    } else {
      setEditingCategory(null)
      setFormData({ name: '', slug: '', description: '' })
    }
    setIsModalOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
        if (editingCategory) {
            const { error } = await supabase
              .from('categories')
              .update({
                  name: formData.name,
                  slug: formData.slug,
                  description: formData.description
              })
              .eq('id', editingCategory.id)
            if (error) throw error
        } else {
            const { error } = await supabase
              .from('categories')
              .insert([{
                  name: formData.name,
                  slug: formData.slug || formData.name.toLowerCase().replace(/\s+/g, '-'),
                  description: formData.description
              }] as any)
            if (error) throw error
        }
        
        setIsModalOpen(false)
        fetchCategories()
    } catch (error) {
        alert('Error saving category')
        console.error(error)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to deactivate this category?')) return

    const { error } = await supabase
      .from('categories')
      .update({ is_active: false })
      .eq('id', id)
    
    if (error) {
        alert('Error deleting category')
    } else {
        fetchCategories()
    }
  }

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
              <TableHead>Description</TableHead>
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
                categories.map((category) => (
                <TableRow key={category.id} className={!category.is_active ? 'opacity-50' : ''}>
                    <TableCell className="font-medium">{category.name}</TableCell>
                    <TableCell>{category.slug}</TableCell>
                    <TableCell>{category.description}</TableCell>
                    <TableCell>
                        <span className={cn("inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ring-1 ring-inset", category.is_active ? "bg-green-50 text-green-700 ring-green-600/20" : "bg-red-50 text-red-700 ring-red-600/20")}>
                            {category.is_active ? 'Active' : 'Inactive'}
                        </span>
                    </TableCell>
                    <TableCell className="text-right space-x-2">
                        <Button variant="ghost" size="icon" onClick={() => handleOpenModal(category)}>
                            <Pencil className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="text-destructive" onClick={() => handleDelete(category.id)}>
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    </TableCell>
                </TableRow>
                ))
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
                    onChange={e => {
                        const name = e.target.value
                        setFormData(prev => ({ 
                            ...prev, 
                            name, 
                            slug: editingCategory ? prev.slug : name.toLowerCase().replace(/\s+/g, '-') 
                        }))
                    }} 
                    required 
                    placeholder="e.g. Hoodies"
                />
            </div>
            <div className="space-y-2">
                <label className="text-sm font-medium">Slug</label>
                <Input 
                    value={formData.slug} 
                    onChange={e => setFormData(prev => ({ ...prev, slug: e.target.value }))} 
                    required 
                    placeholder="hoodies"
                />
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
                <Button type="submit">
                    {editingCategory ? 'Save Changes' : 'Create Category'}
                </Button>
            </div>
        </form>
      </Modal>
    </div>
  )
}
