'use client'
// Force recompile


import { useState, useMemo } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Database } from '@/types/supabase'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Modal } from '@/components/ui/modal'
import { Plus, Pencil, Trash2, Image as ImageIcon, Search, Loader2, ChevronRight, CornerDownRight } from 'lucide-react'
import { toast } from 'sonner'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Badge } from '@/components/ui/badge'
import { CategoryForm, CategoryFormData } from '@/components/admin/categories/category-form'
import { Category, updateCategory, createCategory, deleteCategory } from '@/lib/services/category-service'
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

// Helper for DFS Flattening (O(n))
function flattenCategoryTree(nodes: Category[], depth = 0, result: (Category & { depth: number })[] = []) {
    for (const node of nodes) {
        result.push({ ...node, depth })
        if (node.children && node.children.length > 0) {
            flattenCategoryTree(node.children, depth + 1, result)
        }
    }
    return result
}

export default function CategoriesPage() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  
  const supabase = createClient()
  const queryClient = useQueryClient()

  // 1. Fetch Categories via Service logic adapted for client
  const { data: categories = [], isLoading } = useQuery<Category[]>({
    queryKey: ['categories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('created_at', { ascending: false }) // Initial Sort
      if (error) throw error
      
      // DSA: Client-Side Tree Construction O(n)
      const map = new Map<string, Category & { children: Category[] }>()
      const roots: (Category & { children: Category[] })[] = []
      
      data.forEach(c => map.set(c.id, { ...c, children: [] }))
      data.forEach(c => {
          const node = map.get(c.id)!
          if (c.parent_id && map.has(c.parent_id)) {
              map.get(c.parent_id)!.children.push(node)
          } else {
              roots.push(node)
          }
      })
      
      return roots as any
    }
  })

  // Memoize the Flattened Tree for Rendering (O(n))
  const tableData = useMemo(() => {
      if (!categories) return []
      let roots = categories as (Category & { children: Category[] })[]
      
      if (search) {
          return [] 
      }
      
      return flattenCategoryTree(roots)
  }, [categories, search])

    const { data: flatCategories = [], isLoading: isFlatLoading } = useQuery<Category[]>({
        queryKey: ['categories-flat'],
        queryFn: async () => {
            const { data, error } = await supabase.from('categories').select('*').order('name')
            if (error) throw error
            return data
        }
    })

    const displayCategories = useMemo(() => {
        if (!flatCategories) return []
        
        // 1. Filter
        const filtered = flatCategories.filter(c => c.name.toLowerCase().includes(search.toLowerCase()))
        
        // 2. If searching, return flat filtered list
        if (search) return filtered.map(c => ({...c, depth: 0}))

        // 3. If not searching, Build Tree & Flatten (DSA)
        const map = new Map<string, Category & { children: any[] }>()
        const roots: any[] = []
        
        // Init Map
        flatCategories.forEach(c => map.set(c.id, { ...c, children: [] }))
        
        // Build Tree
        flatCategories.forEach(c => {
             const node = map.get(c.id)!
             if (c.parent_id && map.has(c.parent_id)) {
                 map.get(c.parent_id)!.children.push(node)
             } else {
                 roots.push(node)
             }
        })

        // Sort Roots & Children by name
        const sortByName = (a: any, b: any) => a.name.localeCompare(b.name)
        roots.sort(sortByName)
        map.forEach(node => node.children.sort(sortByName))

        return flattenCategoryTree(roots)

    }, [flatCategories, search])


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
            await updateCategory(values.id, payload)
        } else {
            await createCategory(payload)
        }
    },
    onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['categories-flat'] })
        setIsModalOpen(false)
        console.log('Success toast triggered')
        toast.success(editingCategory ? 'Category updated' : 'Category created')
    },
    onError: (err: any) => {
        console.error('Mutation Failed:', err)
        toast.error(err.message || 'Operation failed')
    }
  })

  const deleteMutation = useMutation({
      mutationFn: async (id: string) => {
          await deleteCategory(id)
      },
      onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ['categories-flat'] })
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

  // Filter valid parents (prevent cyclic dependency in form)
  // For the form, we can just pass the flat list (minus self and children).
  const validParents = useMemo(() => {
      if (!editingCategory) return flatCategories
      // Simple prevent self-parenting
      return flatCategories.filter(c => c.id !== editingCategory.id)
  }, [flatCategories, editingCategory])

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
              <TableHead>Category Name (Hierarchy)</TableHead>
              <TableHead>Slug</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isFlatLoading ? (
                <TableRow><TableCell colSpan={4} className="text-center py-16 text-muted-foreground"><Loader2 className="animate-spin inline mr-2"/> Loading categories...</TableCell></TableRow>
            ) : displayCategories.length === 0 ? (
                <TableRow><TableCell colSpan={4} className="text-center py-16 text-muted-foreground">No categories found.</TableCell></TableRow>
            ) : (
                displayCategories.map((category) => {
                    return (
                        <TableRow key={category.id} className="group hover:bg-muted/30 transition-colors">
                            <TableCell className="font-medium">
                                <div className="flex items-center gap-3" style={{ paddingLeft: `${category.depth * 24}px` }}>
                                    {category.depth > 0 && <CornerDownRight className="h-4 w-4 text-muted-foreground/50 mr-[-8px]" />}
                                    
                                    <div className="h-10 w-10 rounded-lg overflow-hidden border bg-muted flex items-center justify-center shrink-0">
                                        {category.image_url ? (
                                            <img src={category.image_url} className="w-full h-full object-cover" alt="" />
                                        ) : (
                                            <ImageIcon className="h-4 w-4 text-muted-foreground" />
                                        )}
                                    </div>
                                    <div>
                                        <div className="font-semibold">{category.name}</div>
                                        {category.description && <div className="text-xs text-muted-foreground truncate max-w-[200px]">{category.description}</div>}
                                    </div>
                                </div>
                            </TableCell>
                            <TableCell className="font-mono text-xs text-muted-foreground">/{category.slug}</TableCell>
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
