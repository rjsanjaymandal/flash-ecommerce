'use client'

import { useState } from 'react'
import { Star, User, MessageSquare } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { submitReview } from '@/app/actions/review-actions'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

type Review = {
  id: string
  user_name: string
  rating: number
  comment: string
  created_at: string
}

export function ReviewSection({ productId, reviews }: { productId: string, reviews: Review[] }) {
  const [isOpen, setIsOpen] = useState(false)
  
  // Calculate Average
  const averageRating = reviews.length 
    ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1) 
    : '0.0'

  return (
    <div className="py-12 lg:py-16">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 sm:text-3xl">Customer Reviews</h2>

          <div className="mt-2 flex items-center gap-4">
             <div className="flex items-center gap-0.5">
                 {[1, 2, 3, 4, 5].map((s) => (
                    <Star key={s} className={cn("h-5 w-5", s <= Number(averageRating) ? "text-yellow-400 fill-yellow-400" : "text-gray-200 fill-gray-200")} />
                 ))}
             </div>
             <p className="text-gray-600">Based on {reviews.length} reviews</p>
          </div>
        </div>
        
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
             <Button className="rounded-full bg-indigo-600 hover:bg-indigo-700 text-white px-8">Write a Review</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
             <DialogHeader>
                 <DialogTitle>Write a Review</DialogTitle>
             </DialogHeader>
             <ReviewForm productId={productId} onSuccess={() => setIsOpen(false)} />
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 lg:gap-8">
          {reviews.length === 0 ? (
              <div className="col-span-full text-center py-12 bg-gray-50 rounded-lg border border-gray-100 border-dashed">
                <MessageSquare className="h-10 w-10 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 font-medium">No reviews yet. Share your thoughts!</p>
              </div>
          ) : (
              reviews.map((review) => (
                  <article key={review.id} className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm hover:shadow-md transition-shadow">
                      <div className="flex items-center gap-4">
                        <div className="h-10 w-10 rounded-full bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center text-indigo-700 font-bold uppercase shadow-inner">
                             {review.user_name.charAt(0)}
                        </div>
                        <div>
                            <p className="font-semibold text-gray-900">{review.user_name}</p>
                            <p className="text-xs text-gray-500" suppressHydrationWarning>{new Date(review.created_at).toLocaleDateString('en-US')}</p>
                        </div>
                      </div>

                      <div className="mt-4 flex gap-0.5">
                        {[1, 2, 3, 4, 5].map((s) => (
                           <Star key={s} className={cn("h-4 w-4", s <= review.rating ? "text-yellow-400 fill-yellow-400" : "text-gray-200 fill-gray-200")} />
                        ))}
                      </div>

                      <p className="mt-4 text-gray-700 leading-relaxed text-sm">
                        {review.comment}
                      </p>
                  </article>
              ))
          )}
      </div>
    </div>
  )
}

function ReviewForm({ productId, onSuccess }: { productId: string, onSuccess: () => void }) {
    const [rating, setRating] = useState(5)
    
    async function action(formData: FormData) {
        formData.append('productId', productId)
        formData.append('rating', rating.toString())
        
        const res = await submitReview(formData)
        if (res?.error) {
            toast.error(res.error)
        } else {
            toast.success("Review Submitted!")
            onSuccess()
        }
    }

    return (
        <form action={action} className="space-y-4 pt-4">
             <div className="space-y-2">
                 <Label htmlFor="rating-input">Rating</Label>
                 <div className="flex gap-1 text-primary cursor-pointer" role="group" aria-label="Rating selection">
                     <input type="hidden" name="rating" id="rating-input" value={rating} />
                     {[1, 2, 3, 4, 5].map((s) => (
                         <Star 
                            key={s} 
                            onClick={() => setRating(s)}
                            className={cn("h-6 w-6 transition-all hover:scale-110", s <= rating ? "text-yellow-400 fill-yellow-400" : "text-gray-200 fill-gray-200")} 
                         />
                     ))}
                 </div>
             </div>
             
             {/* Name is now auto-fetched from profile */}

             <div className="space-y-2">
                 <Label htmlFor="comment">Review</Label>
                 <Textarea name="comment" id="comment" placeholder="What did you like or dislike?" required />
             </div>
             
             <Button type="submit" className="w-full">Submit</Button>
        </form>
    )
}
