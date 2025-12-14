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
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
           <h1 className="text-3xl font-black tracking-tight">Categories</h1>
           <p className="text-muted-foreground">Organize your products into catalog sections.</p>
        </div>
        <Button onClick={handleOpenCreate} className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/20">
            <Plus className="mr-2 h-4 w-4" />
            Add Category
        </Button>
      </div>

      <div className="flex items-center gap-4 rounded-xl bg-card p-4 border shadow-sm">
         <div className="relative flex-1">
             <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
             <Input 
                 placeholder="Search categories..." 
                 className="pl-9 h-10 bg-background/50 focus-visible:ring-1 border-input/60" 
                 value={search} 
                 onChange={(e) => setSearch(e.target.value)}
             />
         </div>
      </div>

      <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50 hover:bg-muted/50">
              <TableHead>Category Name</TableHead>
              <TableHead>Overview</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
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
                        <TableRow key={category.id} className="group hover:bg-muted/30 transition-colors">
                            <TableCell className="font-medium p-4">
                                <div className="flex items-center gap-3" style={{ paddingLeft: `${(category.depth + 1) * 12}px` }}>
                                    {category.depth > 0 && <CornerDownRight className="h-4 w-4 text-muted-foreground/50 mr-[-8px]" />}
                                    
                                    <div className={cn("h-10 w-10 rounded-lg overflow-hidden border bg-muted flex items-center justify-center shrink-0 shadow-sm", category.depth === 0 ? "ring-2 ring-background shadow-md" : "")}>
                                        {category.image_url ? (
                                            <img src={category.image_url} className="w-full h-full object-cover" alt="" />
                                        ) : (
                                            <ImageIcon className="h-4 w-4 text-muted-foreground" />
                                        )}
                                    </div>
                                    <div>
                                        <div className={cn("font-semibold", category.depth === 0 ? "text-base" : "text-sm text-muted-foreground")}>{category.name}</div>
                                    </div>
                                </div>
                            </TableCell>
                            <TableCell className="font-mono text-xs text-muted-foreground">
                                <span className="bg-muted px-2 py-1 rounded text-[10px] uppercase tracking-wider">{category.slug}</span>
                            </TableCell>
                            <TableCell>
                                <Badge variant={category.is_active ? "outline" : "secondary"} className={cn("rounded-md", category.is_active ? "border-green-200 text-green-700 bg-green-500/10" : "")}>
                                    {category.is_active ? 'Active' : 'Inactive'}
                                </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                                <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Button variant="ghost" size="icon" onClick={() => handleOpenEdit(category)}>
                                        <Pencil className="h-4 w-4 text-muted-foreground hover:text-foreground" />
                                    </Button>
                                    <Button variant="ghost" size="icon" className="text-destructive/70 hover:text-destructive hover:bg-destructive/10" onClick={() => setDeleteId(category.id)}>
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
