'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { format } from 'date-fns'
import { useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { deleteReview, toggleReviewFeature, replyToReview, approveReview } from '@/lib/services/review-service'
import { 
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle 
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

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
  Search, MoreHorizontal, Trash2, Star, MessageSquare, BadgeCheck, Reply, ZoomIn, CheckCircle, XCircle 
} from 'lucide-react'

export function ReviewsClient({ initialReviews, meta }: { initialReviews: any[], meta: { total: number, page: number, limit: number, totalPages: number } }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  
  const [isMounted, setIsMounted] = useState(false)
  const [search, setSearch] = useState(searchParams.get('q') || '') 
  const [replyOpen, setReplyOpen] = useState(false)
  const [selectedReview, setSelectedReview] = useState<any>(null)
  const [replyText, setReplyText] = useState('')
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [lightboxImage, setLightboxImage] = useState('') 

  useEffect(() => {
    setIsMounted(true)
  }, [])
  
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

  const [reviews, setReviews] = useState(initialReviews)

  useEffect(() => {
    setReviews(initialReviews)
  }, [initialReviews])

  const deleteMutation = useMutation({
    mutationFn: deleteReview,
    onSuccess: (_, id) => {
      toast.success('Review deleted')
      setReviews(prev => prev.filter(r => r.id !== id))
      router.refresh()
    },
  })

  if (!isMounted) {
      return null
  }

  // Handlers
  const handleReplyClick = (review: any) => {
      setSelectedReview(review)
      setReplyText(review.reply_text || '')
      setReplyOpen(true)
  }

  const handleReplySubmit = async () => {
      if (!selectedReview) return
      try {
          // Optimistic Update
          setReviews(prev => prev.map(r => r.id === selectedReview.id ? { ...r, reply_text: replyText } : r))
          setReplyOpen(false)
          
          await replyToReview(selectedReview.id, replyText)
          toast.success('Reply saved')
          router.refresh()
      } catch (err: any) {
          toast.error('Failed to save reply')
          router.refresh() // Revert on failure
      }
  }

  const handleToggleFeature = async (review: any) => {
      try {
          const newState = !review.is_featured
          setReviews(prev => prev.map(r => r.id === review.id ? { ...r, is_featured: newState } : r))
          
          await toggleReviewFeature(review.id, newState)
          toast.success(newState ? 'Marked as Featured' : 'Removed from Featured')
          router.refresh()
      } catch (err: any) {
          toast.error('Failed to update')
          router.refresh()
      }
  }

  const handleApprove = async (review: any) => {
      try {
          const newState = !review.is_approved
          setReviews(prev => prev.map(r => r.id === review.id ? { ...r, is_approved: newState } : r))
          
          await approveReview(review.id, newState)
          toast.success(newState ? 'Review approved' : 'Review unapproved')
          router.refresh()
      } catch (err: any) {
          toast.error('Failed to update')
          router.refresh()
      }
  }

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
                {reviews.length === 0 ? (
                    <TableRow><TableCell colSpan={5} className="text-center py-12 text-muted-foreground">No reviews found.</TableCell></TableRow>
                ) : (
                    reviews.map((review) => (
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
                            <TableCell className="max-w-md relative">
                                <p className="text-sm line-clamp-2 text-muted-foreground mb-1">
                                    {review.comment || <span className="italic opacity-50">No comment</span>}
                                </p>
                                {review.reply_text && (
                                    <div className="text-xs bg-muted p-2 rounded-md border-l-2 border-primary mt-1">
                                        <span className="font-bold text-primary mr-1">Reply:</span>
                                        {review.reply_text}
                                    </div>
                                )}
                                {review.media_urls && review.media_urls.length > 0 && (
                                    <div className="flex gap-1 mt-2">
                                        {review.media_urls.map((url: string, i: number) => (
                                            <div key={i} className="relative group/image w-fit cursor-zoom-in" onClick={() => { setLightboxImage(url); setLightboxOpen(true) }}>
                                                <img src={url} alt={`Review ${i}`} className="h-10 w-10 rounded-md object-cover border" />
                                            </div>
                                        ))}
                                    </div>
                                )}
                                {review.products?.gallery_image_urls?.[0] && ( 
                                   <div className="mt-2 text-xs text-muted-foreground">Product: <img src={review.products.gallery_image_urls[0]} alt="Product" className="inline h-6 w-6 rounded ml-1" /></div>
                                )}
                            </TableCell>
                            <TableCell>
                                <div className="space-y-1">
                                    <div className="text-xs text-muted-foreground">
                                        {format(new Date(review.created_at), 'MMM dd, yyyy')}
                                    </div>
                                    <div className="flex gap-1 flex-wrap">
                                        <Badge variant={review.is_approved ? "default" : "secondary"} className={cn("text-[10px] font-bold px-1.5 py-0 h-5", !review.is_approved && "bg-yellow-100 text-yellow-800 border-yellow-200")}>
                                            {review.is_approved ? 'APPROVED' : 'PENDING'}
                                        </Badge>
                                        {review.is_featured && (
                                            <Badge variant="secondary" className="bg-amber-100 text-amber-700 hover:bg-amber-100 border-amber-200 text-[10px] font-bold px-1.5 py-0 h-5">
                                                <BadgeCheck className="h-3 w-3 mr-1 fill-amber-500 text-white" />
                                                FEATURED
                                            </Badge>
                                        )}
                                    </div>
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
                                        <DropdownMenuItem onClick={() => handleApprove(review)}>
                                            {review.is_approved ? <XCircle className="mr-2 h-4 w-4 text-red-500" /> : <CheckCircle className="mr-2 h-4 w-4 text-green-500" />}
                                            {review.is_approved ? 'Reject (Unapprove)' : 'Approve Review'}
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => handleToggleFeature(review)}>
                                            <BadgeCheck className="mr-2 h-4 w-4" />
                                            {review.is_featured ? 'Unfeature' : 'Feature Review'}
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => handleReplyClick(review)}>
                                            <Reply className="mr-2 h-4 w-4" />
                                            {review.reply_text ? 'Edit Reply' : 'Reply'}
                                        </DropdownMenuItem>
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

      <Dialog open={replyOpen} onOpenChange={setReplyOpen}>
          <DialogContent>
              <DialogHeader>
                  <DialogTitle>Reply to {selectedReview?.user_name || 'Customer'}</DialogTitle>
                  <DialogDescription>
                      This reply will be publicly visible on the product page.
                  </DialogDescription>
              </DialogHeader>
              <div className="space-y-2 py-2">
                  <Label>Your Reply</Label>
                  <Textarea 
                    value={replyText} 
                    onChange={(e) => setReplyText(e.target.value)} 
                    placeholder="Thank you for your feedback! We're glad you liked it."
                    rows={4}
                  />
              </div>
              <DialogFooter>
                  <Button variant="outline" onClick={() => setReplyOpen(false)}>Cancel</Button>
                  <Button onClick={handleReplySubmit}>Post Reply</Button>
              </DialogFooter>
          </DialogContent>
      </Dialog>

      {/* Lightbox */}
      {lightboxOpen && (
          <div className="fixed inset-0 z-100 bg-black/90 flex items-center justify-center p-4 animate-in fade-in" onClick={() => setLightboxOpen(false)}>
              <img src={lightboxImage} alt="Full size" className="max-w-full max-h-[90vh] rounded-lg shadow-2xl object-contain" />
              <button 
                className="absolute top-4 right-4 text-white/50 hover:text-white"
                onClick={() => setLightboxOpen(false)}
              >
                  <span className="sr-only">Close</span>
                  <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
          </div>
      )}
    </div>
  )
}
