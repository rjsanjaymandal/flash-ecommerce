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
    <div className="py-12 lg:py-24 border-t border-border/40">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
        <div>
          <h2 className="text-3xl font-black tracking-tight text-foreground sm:text-4xl mb-6">Customer Vibes</h2>

          <div className="flex items-center gap-6 bg-muted/30 p-6 rounded-3xl border border-border/50 backdrop-blur-sm">
             <div className="flex flex-col">
                 <span className="text-6xl font-black text-foreground leading-none tracking-tighter">{averageRating}</span>
                 <div className="flex items-center gap-1 mt-3 text-primary">
                     {[1, 2, 3, 4, 5].map((s) => (
                        <Star key={s} className={cn("h-4 w-4", s <= Math.round(Number(averageRating)) ? "fill-current" : "text-muted-foreground/30 fill-muted-foreground/30")} />
                     ))}
                 </div>
                 <p className="text-[10px] font-bold text-muted-foreground mt-2 uppercase tracking-widest">{reviews.length} Verified Reviews</p>
             </div>
             <div className="hidden sm:block h-16 w-px bg-border/60"></div>
             <div className="hidden sm:block text-xs font-medium text-muted-foreground max-w-[200px] leading-relaxed">
                 VERIFIED PURCHASES ONLY.<br/>
                 WE VALUE AUTHENTIC SIGNAL.
             </div>
          </div>
        </div>
        
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
             <Button size="lg" className="rounded-2xl px-8 h-12 font-black uppercase tracking-widest shadow-xl shadow-primary/20 hover:scale-105 transition-transform">Drop a Review</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md rounded-3xl border-border/50 bg-card/95 backdrop-blur-xl">
             <DialogHeader>
                 <DialogTitle className="font-black uppercase tracking-tight text-xl">Review Specs</DialogTitle>
             </DialogHeader>
             <ReviewForm productId={productId} onSuccess={() => setIsOpen(false)} />
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 lg:gap-8">
          {reviews.length === 0 ? (
              <div className="col-span-full text-center py-20 bg-muted/20 rounded-[2rem] border-2 border-dashed border-border/50">
                <MessageSquare className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
                <p className="text-muted-foreground font-bold uppercase tracking-wider text-sm">No signals yet. Be the first to transmit.</p>
              </div>
          ) : (
              reviews.map((review) => (
                  <article key={review.id} className="rounded-[2rem] border border-border/50 bg-card/50 p-8 shadow-sm hover:shadow-lg hover:border-primary/20 transition-all duration-300">
                      <div className="flex items-center gap-4 mb-6">
                        <div className="h-12 w-12 text-white rounded-2xl bg-gradient-to-br from-primary to-indigo-600 flex items-center justify-center font-black text-lg uppercase shadow-lg shadow-primary/20">
                             {review.user_name.charAt(0)}
                        </div>
                        <div>
                            <p className="font-bold text-foreground text-sm uppercase tracking-wide">{review.user_name}</p>
                            <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider" suppressHydrationWarning>{new Date(review.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                        </div>
                      </div>

                      <div className="flex gap-1 mb-4">
                        {[1, 2, 3, 4, 5].map((s) => (
                           <Star key={s} className={cn("h-3 w-3", s <= review.rating ? "text-primary fill-primary" : "text-muted-foreground/20 fill-muted-foreground/20")} />
                        ))}
                      </div>

                      <p className="text-muted-foreground leading-relaxed text-sm font-medium">
                        &quot;{review.comment}&quot;
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
