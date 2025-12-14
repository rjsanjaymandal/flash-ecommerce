'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Database } from '@/types/supabase'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Modal } from '@/components/ui/modal'
import { Plus, Pencil, Trash2, Image as ImageIcon, Search, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Badge } from '@/components/ui/badge'
import { CategoryForm, CategoryFormData } from '@/components/admin/categories/category-form'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

type Category = Database['public']['Tables']['categories']['Row']

export default function CategoriesPage() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  
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
    mutationFn: async (values: CategoryFormData & { id?: string }) => {
        const payload = {
            name: values.name,
            slug: values.slug,
            description: values.description,
            parent_id: values.parent_id === 'none' ? null : values.parent_id, 
            image_url: values.image_url,
            is_active: values.is_active
        }

        if (values.id) {
            const { error } = await (supabase.from('categories') as any).update(payload).eq('id', values.id)
            if (error) throw error
        } else {
            const { error } = await (supabase.from('categories') as any).insert([payload])
            if (error) throw error
        }
    },
    onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['categories'] })
        setIsModalOpen(false)
        toast.success(editingCategory ? 'Category updated' : 'Category created')
    },
    onError: (err: any) => {
        console.error('Mutation Failed:', err)
        toast.error(err.message || 'Operation failed')
    }
  })

  const deleteMutation = useMutation({
      mutationFn: async (id: string) => {
          const { error } = await (supabase.from('categories') as any).delete().eq('id', id)
          if (error) throw error
      },
      onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ['categories'] })
          setDeleteId(null)
          toast.success('Category deleted')
      },
      onError: (err: any) => {
          toast.error('Delete failed: ' + err.message)
      }
  })

  // Handlers
  const handleOpenCreate = () => {
      setEditingCategory(null)
      setIsModalOpen(true)
  }

  const handleOpenEdit = (category: Category) => {
      setEditingCategory(category)
      setIsModalOpen(true)
  }

  const handleFormSubmit = (data: CategoryFormData) => {
      mutation.mutate({ ...data, id: editingCategory?.id })
  }

  // Filter
  const filteredCategories = categories.filter(c => 
      c.name.toLowerCase().includes(search.toLowerCase())
  )
  
  // Valid parents for the form (exclude self if editing)
  const validParents = categories.filter(c => c.id !== editingCategory?.id)

  // Map for form initial data
  const initialData: CategoryFormData | undefined = editingCategory ? {
      name: editingCategory.name,
      slug: editingCategory.slug,
      description: editingCategory.description || '',
      parent_id: editingCategory.parent_id || 'none',
      image_url: editingCategory.image_url || '',
      is_active: editingCategory.is_active ?? true
  } : undefined

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
           <h1 className="text-3xl font-bold tracking-tight">Categories</h1>
           <p className="text-muted-foreground">Organize your products into catalog sections.</p>
        </div>
        <Button onClick={handleOpenCreate} className="bg-primary text-primary-foreground hover:bg-primary/90">
            <Plus className="mr-2 h-4 w-4" />
            Add Category
        </Button>
      </div>

      <div className="flex items-center gap-4 rounded-lg bg-card p-4 border shadow-sm">
         <div className="relative flex-1">
             <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
             <Input 
                 placeholder="Search categories..." 
                 className="pl-9 bg-background" 
                 value={search} 
                 onChange={(e) => setSearch(e.target.value)}
             />
         </div>
      </div>

      <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50 hover:bg-muted/50">
              <TableHead>Display</TableHead>
              <TableHead>Slug</TableHead>
              <TableHead>Parent Category</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
                <TableRow><TableCell colSpan={5} className="text-center py-16 text-muted-foreground"><Loader2 className="animate-spin inline mr-2"/> Loading categories...</TableCell></TableRow>
            ) : filteredCategories.length === 0 ? (
                <TableRow><TableCell colSpan={5} className="text-center py-16 text-muted-foreground">No categories found.</TableCell></TableRow>
            ) : (
                filteredCategories.map((category) => {
                    const parent = categories.find(c => c.id === category.parent_id)
                    return (
                        <TableRow key={category.id} className="group hover:bg-muted/30 transition-colors">
                            <TableCell className="font-medium">
                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 rounded-lg overflow-hidden border bg-muted flex items-center justify-center">
                                        {category.image_url ? (
                                            <img src={category.image_url} className="w-full h-full object-cover" alt="" />
                                        ) : (
                                            <ImageIcon className="h-4 w-4 text-muted-foreground" />
                                        )}
                                    </div>
                                    <div>
                                        <div className="font-semibold">{category.name}</div>
                                        <div className="text-xs text-muted-foreground truncate max-w-[200px]">{category.description}</div>
                                    </div>
                                </div>
                            </TableCell>
                            <TableCell className="font-mono text-xs text-muted-foreground">/{category.slug}</TableCell>
                            <TableCell>
                                {parent ? (
                                    <Badge variant="outline" className="font-normal">{parent.name}</Badge>
                                ) : (
                                    <span className="text-muted-foreground text-sm italic">Top Level</span>
                                )}
                            </TableCell>
                            <TableCell>
                                <Badge variant={category.is_active ? "default" : "secondary"}>
                                    {category.is_active ? 'Active' : 'Inactive'}
                                </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                                <div className="flex items-center justify-end gap-2">
                                    <Button variant="ghost" size="icon" onClick={() => handleOpenEdit(category)}>
                                        <Pencil className="h-4 w-4" />
                                    </Button>
                                    <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive hover:bg-destructive/10" onClick={() => setDeleteId(category.id)}>
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
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
         <CategoryForm 
            initialData={initialData}
            categories={validParents}
            isEditing={!!editingCategory}
            isLoading={mutation.isPending}
            onSubmit={handleFormSubmit}
            onCancel={() => setIsModalOpen(false)}
         />
      </Modal>

      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
            <AlertDialogHeader>
                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete the category and remove it from our servers.
                </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction 
                    onClick={() => deleteId && deleteMutation.mutate(deleteId)}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    disabled={deleteMutation.isPending}
                >
                    {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
                </AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
