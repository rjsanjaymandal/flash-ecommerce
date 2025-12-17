'use client'
// Force recompile logic


import { useState, useMemo } from 'react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Modal } from '@/components/ui/modal'
import { Plus, Pencil, Trash2, Image as ImageIcon, Search, Loader2, CornerDownRight } from 'lucide-react'
import { toast } from 'sonner'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Badge } from '@/components/ui/badge'
import { CategoryForm, CategoryFormData } from '@/components/admin/categories/category-form'
import { Category, updateCategory, createCategory, deleteCategory, getLinearCategories } from '@/lib/services/category-service'
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
import { cn } from '@/lib/utils'

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
  
  const queryClient = useQueryClient()

  // 1. Fetch Categories via Server Action (Robust & Secure)
  const { data: flatCategories = [], isLoading } = useQuery<Category[]>({
    queryKey: ['categories'],
    queryFn: async () => await getLinearCategories(),
    staleTime: 1000 * 60 * 5 // Cache for 5 minutes
  })

  // 2. Client-Side Sort, Filter & Tree Construction (Optimized)
  const displayCategories = useMemo(() => {
        if (!flatCategories) return []
        
        // A. Filter first (O(n))
        const filtered = flatCategories.filter(c => c.name.toLowerCase().includes(search.toLowerCase()))
        
        // B. If searching active, return flat list (Tree structure is confusing during search)
        if (search) return filtered.map(c => ({...c, depth: 0}))

        // C. Build Tree (O(n))
        const map = new Map<string, Category & { children: any[] }>()
        const roots: any[] = []
        
        // Init Map
        filtered.forEach(c => map.set(c.id, { ...c, children: [] }))
        
        // Link Children
        filtered.forEach(c => {
             const node = map.get(c.id)!
             if (c.parent_id && map.has(c.parent_id)) {
                 map.get(c.parent_id)!.children.push(node)
             } else {
                 roots.push(node)
             }
        })

        // Sort Roots & Children by name (Alpha sort)
        const sortByName = (a: any, b: any) => a.name.localeCompare(b.name)
        roots.sort(sortByName)
        map.forEach(node => node.children.sort(sortByName))

        // Flatten to renderable list with depth
        return flattenCategoryTree(roots)

  }, [flatCategories, search])


  // 3. Mutations
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
        queryClient.invalidateQueries({ queryKey: ['categories'] })
        setIsModalOpen(false)
        toast.success(editingCategory ? 'Category updated' : 'Category created')
    },
    onError: (err: any) => {
        toast.error('Operation failed: ' + err.message)
    }
  })

  const deleteMutation = useMutation({
      mutationFn: async (id: string) => {
          await deleteCategory(id)
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

  // Valid Parents for Form (No cycles)
  const validParents = useMemo(() => {
      if (!editingCategory) return flatCategories
      return flatCategories.filter(c => c.id !== editingCategory.id)
  }, [flatCategories, editingCategory])

  // Form Initial Data
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
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between px-1">
        <div>
           <h1 className="text-2xl font-bold tracking-tight text-foreground">Categories</h1>
           <p className="text-sm text-muted-foreground">Organize your products into catalog sections.</p>
        </div>
        <Button onClick={handleOpenCreate} className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg h-9 text-sm font-medium shadow-sm">
            <Plus className="mr-2 h-4 w-4" />
            Add Category
        </Button>
      </div>

      <div className="flex items-center gap-4 p-1">
         <div className="relative flex-1 max-w-sm">
             <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
             <Input 
                 placeholder="Search categories..." 
                 className="pl-9 h-9 bg-background focus-visible:ring-offset-0 focus-visible:ring-1 border-input" 
                 value={search} 
                 onChange={(e) => setSearch(e.target.value)}
             />
         </div>
      </div>

      <div className="rounded-lg border bg-card shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/5 hover:bg-muted/5 border-b">
              <TableHead className="py-3 pl-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground w-[400px]">Category Name</TableHead>
              <TableHead className="py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Slug</TableHead>
              <TableHead className="py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Status</TableHead>
              <TableHead className="text-right py-3 pr-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
                <TableRow><TableCell colSpan={4} className="text-center py-24 text-muted-foreground"><Loader2 className="animate-spin inline mr-2 mb-1"/> Loading categories...</TableCell></TableRow>
            ) : displayCategories.length === 0 ? (
                <TableRow><TableCell colSpan={4} className="text-center py-24 text-muted-foreground">No categories found.</TableCell></TableRow>
            ) : (
                displayCategories.map((category) => {
                    return (
                        <TableRow key={category.id} className="group hover:bg-muted/50 transition-colors border-b last:border-0 text-sm">
                            <TableCell className="font-medium p-3 pl-4">
                                <div className="flex items-center gap-3" style={{ paddingLeft: `${(category.depth) * 20}px` }}>
                                    {category.depth > 0 && <CornerDownRight className="h-4 w-4 text-muted-foreground/40 mr-[-8px]" />}
                                    
                                    <div className={cn("h-9 w-9 rounded-md overflow-hidden border bg-muted flex items-center justify-center shrink-0 shadow-sm", category.depth === 0 ? "ring-1 ring-border" : "")}>
                                        {category.image_url ? (
                                            <img src={category.image_url} className="w-full h-full object-cover" alt="" />
                                        ) : (
                                            <ImageIcon className="h-4 w-4 text-muted-foreground/50" />
                                        )}
                                    </div>
                                    <div className="flex flex-col">
                                        <span className={cn("text-sm", category.depth === 0 ? "font-semibold text-foreground" : "text-muted-foreground")}>{category.name}</span>
                                    </div>
                                </div>
                            </TableCell>
                            <TableCell className="font-mono text-xs text-muted-foreground">
                                <span className="bg-muted px-2 py-0.5 rounded text-[10px] text-muted-foreground border">{category.slug}</span>
                            </TableCell>
                            <TableCell>
                                <Badge variant={category.is_active ? "outline" : "secondary"} className={cn("rounded-md px-2 py-0.5 font-normal text-xs", category.is_active ? "border-emerald-200 text-emerald-700 bg-emerald-50" : "bg-slate-100 text-slate-500")}>
                                    {category.is_active ? 'Active' : 'Hidden'}
                                </Badge>
                            </TableCell>
                            <TableCell className="text-right pr-4">
                                <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary" onClick={() => handleOpenEdit(category)}>
                                        <Pencil className="h-3.5 w-3.5" />
                                    </Button>
                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground/70 hover:text-destructive hover:bg-destructive/10" onClick={() => setDeleteId(category.id)}>
                                        <Trash2 className="h-3.5 w-3.5" />
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
                <AlertDialogTitle>Delete Category?</AlertDialogTitle>
                <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete the category.
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
