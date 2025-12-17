'use client'

import { useState, useEffect } from 'react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Search, Loader2, Trash2, MoreHorizontal, Package, MessageSquare } from 'lucide-react'
import Link from 'next/link'
import { Input } from '@/components/ui/input'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'
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
import { deleteReview } from '@/lib/services/review-service'
import { cn } from '@/lib/utils'
import { useRouter, useSearchParams } from 'next/navigation'
import { DataTablePagination } from '@/components/ui/data-table-pagination'
import { Star } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

export function ReviewsClient({ initialReviews, meta }: { initialReviews: any[], meta: any }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [search, setSearch] = useState(searchParams.get('q') || '')
  const [deleteId, setDeleteId] = useState<string | null>(null)

  // Debounce Search
  useEffect(() => {
    const handler = setTimeout(() => {
        const params = new URLSearchParams(searchParams.toString())
        if (search) {
            params.set('q', search)
            params.set('page', '1')
        } else {
            params.delete('q')
        }
        router.replace(`?${params.toString()}`)
    }, 500)
    return () => clearTimeout(handler)
  }, [search, router, searchParams])

  const deleteMutation = useMutation({
      mutationFn: async (id: string) => {
          await deleteReview(id)
      },
      onSuccess: () => {
          setDeleteId(null)
          toast.success('Review deleted')
          router.refresh()
      },
      onError: (err: any) => {
          toast.error('Deletion failed: ' + err.message)
      }
  })

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between px-1">
        <div>
            <h2 className="text-2xl font-bold tracking-tight text-foreground">Reviews</h2>
            <p className="text-sm text-muted-foreground">Monitor and manage customer feedback.</p>
        </div>
      </div>

      <div className="flex items-center gap-3 p-1">
        <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input 
                placeholder="Search reviews..." 
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
              <TableHead className="w-[200px] py-3 pl-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Product</TableHead>
              <TableHead className="w-[150px] py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Reviewer</TableHead>
              <TableHead className="w-[100px] py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Rating</TableHead>
              <TableHead className="py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Comment</TableHead>
              <TableHead className="w-[100px] py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Date</TableHead>
              <TableHead className="w-[50px] text-right py-3 pr-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {initialReviews.length === 0 ? (
                <TableRow><TableCell colSpan={6} className="text-center py-24 text-muted-foreground">No reviews found.</TableCell></TableRow>
            ) : (
                initialReviews.map((review: any) => (
                    <TableRow key={review.id} className="group hover:bg-muted/50 transition-colors border-b last:border-0 text-sm align-top">
                        <TableCell className="pl-4 py-4">
                            <div className="flex items-center gap-3">
                                {review.products?.main_image_url ? (
                                    <img src={review.products.main_image_url} alt="" className="h-10 w-10 rounded-md object-cover border" />
                                ) : (
                                    <div className="h-10 w-10 rounded-md bg-muted flex items-center justify-center border"><Package className="h-4 w-4 opacity-50"/></div>
                                )}
                                <span className="font-medium line-clamp-2 text-xs leading-normal">{review.products?.name || 'Unknown Product'}</span>
                            </div>
                        </TableCell>
                        <TableCell className="py-4">
                            <div className="flex items-center gap-2">
                                <Avatar className="h-6 w-6">
                                    <AvatarFallback className="text-[10px] bg-primary/10 text-primary">{review.user_name?.substring(0,2).toUpperCase() || 'U'}</AvatarFallback>
                                </Avatar>
                                <div className="flex flex-col">
                                    <span className="font-medium text-xs">{review.user_name}</span>
                                    {/* <span className="text-[10px] text-muted-foreground">{review.profiles?.email}</span> */}
                                </div>
                            </div>
                        </TableCell>
                        <TableCell className="py-4">
                             <div className="flex gap-0.5" aria-label={`${review.rating} stars`}>
                                {[1, 2, 3, 4, 5].map((s) => (
                                    <Star key={s} className={cn("h-3 w-3", s <= review.rating ? "text-amber-400 fill-amber-400" : "text-gray-200 fill-gray-200")} />
                                ))}
                            </div>
                        </TableCell>
                        <TableCell className="py-4">
                            <p className="text-muted-foreground text-xs leading-relaxed line-clamp-2" title={review.comment}>{review.comment}</p>
                        </TableCell>
                        <TableCell className="py-4 whitespace-nowrap text-muted-foreground text-xs" suppressHydrationWarning>
                             {new Date(review.created_at).toLocaleDateString('en-US')}
                        </TableCell>
                        <TableCell className="py-4 text-right pr-4">
                             <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-foreground">
                                        <MoreHorizontal className="h-3.5 w-3.5" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    <DropdownMenuItem 
                                        className="text-destructive focus:text-destructive cursor-pointer text-xs"
                                        onClick={() => setDeleteId(review.id)}
                                    >
                                        <Trash2 className="mr-2 h-3.5 w-3.5" />
                                        Delete Review
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </TableCell>
                    </TableRow>
                ))
            )}
          </TableBody>
        </Table>

         {/* Pagination Controls */}
         <div className="border-t p-3 bg-muted/5">
            <DataTablePagination totalItems={meta.total} itemsPerPage={meta.limit} />
        </div>
      </div>

       <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
            <AlertDialogHeader>
                <AlertDialogTitle>Delete Review?</AlertDialogTitle>
                <AlertDialogDescription>
                    This will permanently delete this review. This action cannot be undone.
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
