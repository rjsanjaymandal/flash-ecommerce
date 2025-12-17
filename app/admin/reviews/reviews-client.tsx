'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'
import { deleteReview } from '@/lib/services/review-service'

import { 
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow 
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { 
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu'
import { DataTablePagination } from '@/components/ui/data-table-pagination'
import { 
  Search, MoreHorizontal, Trash2, Star, MessageSquare 
} from 'lucide-react'

export function ReviewsClient({ initialReviews, meta }: { initialReviews: any[], meta: { total: number, page: number, limit: number, totalPages: number } }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [search, setSearch] = useState(searchParams.get('q') || '') 

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
    mutationFn: deleteReview,
    onSuccess: () => {
      toast.success('Review deleted')
      router.refresh()
    },
    onError: (err: any) => toast.error('Delete failed: ' + err.message)
  })

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between px-1">
        <div>
            <h2 className="text-2xl font-bold tracking-tight text-foreground">Reviews</h2>
            <p className="text-sm text-muted-foreground">Monitor and manage customer reviews.</p>
        </div>
      </div>

      <div className="flex items-center gap-3 p-1">
        <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input 
                placeholder="Search reviews..." 
                className="pl-9 h-9" 
                value={search} 
                onChange={(e) => setSearch(e.target.value)}
            />
        </div>
      </div>

      <div className="rounded-lg border bg-card shadow-sm overflow-hidden">
        <Table>
            <TableHeader>
                <TableRow className="bg-muted/50">
                    <TableHead>Product</TableHead>
                    <TableHead>Rating</TableHead>
                    <TableHead>Comment</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {initialReviews.length === 0 ? (
                    <TableRow><TableCell colSpan={5} className="text-center py-12 text-muted-foreground">No reviews found.</TableCell></TableRow>
                ) : (
                    initialReviews.map((review) => (
                        <TableRow key={review.id} className="group hover:bg-muted/5">
                            <TableCell className="font-medium">
                                <div className="flex items-center gap-3">
                                    {review.products?.main_image_url && (
                                        <img src={review.products.main_image_url} alt="" className="h-8 w-8 rounded-md object-cover border" />
                                    )}
                                    <div className="flex flex-col">
                                        <span className="text-sm font-medium">{review.products?.name}</span>
                                        <span className="text-xs text-muted-foreground">by {review.user_name || 'Anonymous'}</span>
                                    </div>
                                </div>
                            </TableCell>
                            <TableCell>
                                <div className="flex items-center gap-1">
                                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                                    <span className="font-medium">{review.rating}</span>
                                </div>
                            </TableCell>
                            <TableCell className="max-w-md">
                                <p className="text-sm line-clamp-2 text-muted-foreground">
                                    {review.comment || <span className="italic opacity-50">No comment</span>}
                                </p>
                            </TableCell>
                            <TableCell>
                                <div className="text-xs text-muted-foreground">
                                    {new Date(review.created_at).toLocaleDateString()}
                                </div>
                            </TableCell>
                            <TableCell className="text-right">
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" size="icon">
                                            <MoreHorizontal className="h-4 w-4" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                        <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={() => deleteMutation.mutate(review.id)}>
                                            <Trash2 className="mr-2 h-4 w-4" />
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
        <div className="border-t p-3 bg-muted/5">
            <DataTablePagination totalItems={meta.total} itemsPerPage={meta.limit} />
        </div>
      </div>
    </div>
  )
}
