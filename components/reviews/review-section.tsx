"use client";

import { useState } from "react";
import { Star, User, MessageSquare, BadgeCheck, Reply } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { submitReview } from "@/app/actions/review-actions";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import FlashImage from "@/components/ui/flash-image";

type Review = {
  id: string;
  user_name: string;
  rating: number;
  comment: string;
  created_at: string;
  is_featured: boolean;
  reply_text: string | null;
  media_urls?: string[];
  is_verified?: boolean;
};

export function ReviewSection({
  productId,
  reviews,
}: {
  productId: string;
  reviews: Review[];
}) {
  const [isOpen, setIsOpen] = useState(false);

  // Calculate Average
  const averageRating = reviews.length
    ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(
        1
      )
    : "0.0";

  // Calculate Rating Distribution
  const ratingCounts = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 } as Record<
    number,
    number
  >;
  reviews.forEach((r) => {
    const rating = Math.round(r.rating);
    if (rating >= 1 && rating <= 5) ratingCounts[rating]++;
  });
  const totalReviews = reviews.length;

  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxImage, setLightboxImage] = useState("");

  return (
    <div className="py-12 lg:py-24 border-t border-border/40">
      <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-12 mb-12">
        <div className="flex-1 space-y-8">
          <div>
            <h2 className="text-3xl font-black tracking-tight text-foreground sm:text-4xl mb-4">
              Customer Vibes
            </h2>
            <p className="text-muted-foreground max-w-lg">
              Real feedback from the community. We value authentic signals.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-8 items-center bg-muted/30 p-8 rounded-[2rem] border border-border/50 backdrop-blur-sm">
            <div className="flex flex-col items-center sm:items-start min-w-[140px]">
              <span className="text-6xl font-black text-foreground leading-none tracking-tighter">
                {averageRating}
              </span>
              <div className="flex items-center gap-1 mt-3 text-primary">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star
                    key={s}
                    className={cn(
                      "h-4 w-4",
                      s <= Math.round(Number(averageRating))
                        ? "fill-current"
                        : "text-muted-foreground/30 fill-muted-foreground/30"
                    )}
                  />
                ))}
              </div>
              <p className="text-[10px] font-bold text-muted-foreground mt-2 uppercase tracking-widest">
                {totalReviews} Verified Reviews
              </p>
            </div>

            {/* Rating Bars */}
            <div className="flex-1 w-full space-y-2">
              {[5, 4, 3, 2, 1].map((star) => {
                const count = ratingCounts[star] || 0;
                const percentage =
                  totalReviews > 0 ? (count / totalReviews) * 100 : 0;
                return (
                  <div key={star} className="flex items-center gap-3 text-xs">
                    <span className="font-bold w-3">{star}</span>
                    <Star className="h-3 w-3 text-foreground/40" />
                    <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary rounded-full"
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                    <span className="w-8 text-right text-muted-foreground font-medium">
                      {count}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="lg:pt-2" suppressHydrationWarning>
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button
                size="lg"
                className="rounded-2xl px-8 h-12 font-black uppercase tracking-widest shadow-xl shadow-primary/20 hover:scale-105 transition-transform w-full sm:w-auto"
              >
                Drop a Review
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md rounded-3xl border-border/50 bg-card/95 backdrop-blur-xl">
              <DialogHeader>
                <DialogTitle className="font-black uppercase tracking-tight text-xl">
                  Review Specs
                </DialogTitle>
                <p className="text-xs text-muted-foreground">
                  Upload a photo & get{" "}
                  <span className="text-primary font-bold">10% OFF</span> your
                  next order.
                </p>
              </DialogHeader>
              <ReviewForm
                productId={productId}
                onSuccess={() => setIsOpen(false)}
              />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 lg:gap-8">
        {reviews.length === 0 ? (
          <div className="col-span-full text-center py-20 bg-muted/20 rounded-[2rem] border-2 border-dashed border-border/50">
            <MessageSquare className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
            <p className="text-muted-foreground font-bold uppercase tracking-wider text-sm">
              No signals yet. Be the first to transmit.
            </p>
          </div>
        ) : (
          reviews.map((review) => (
            <article
              key={review.id}
              className={cn(
                "rounded-[2rem] border bg-card/50 p-8 shadow-sm hover:shadow-lg transition-all duration-300 relative overflow-hidden",
                review.is_featured
                  ? "border-amber-400/30 bg-amber-50/10"
                  : "border-border/50 hover:border-primary/20"
              )}
            >
              {review.is_featured && (
                <div className="absolute top-0 right-0 bg-amber-400 text-amber-950 text-[10px] font-black px-3 py-1 rounded-bl-xl flex items-center gap-1 shadow-sm">
                  <BadgeCheck className="h-3 w-3" /> FEATURED
                </div>
              )}

              <div className="flex items-center gap-4 mb-6">
                <div className="h-12 w-12 text-white rounded-2xl bg-gradient-to-br from-primary to-indigo-600 flex items-center justify-center font-black text-lg uppercase shadow-lg shadow-primary/20">
                  {review.user_name.charAt(0)}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-bold text-foreground text-sm uppercase tracking-wide">
                      {review.user_name}
                    </p>
                    {review.is_verified && (
                      <span className="text-[10px] bg-green-500/10 text-green-600 px-1.5 py-0.5 rounded font-bold uppercase flex items-center gap-0.5 border border-green-500/20">
                        <BadgeCheck className="h-3 w-3" /> Verified
                      </span>
                    )}
                  </div>
                  <p
                    className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider"
                    suppressHydrationWarning
                  >
                    {new Date(review.created_at).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </p>
                </div>
              </div>

              <div className="flex gap-1 mb-4">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star
                    key={s}
                    className={cn(
                      "h-3 w-3",
                      s <= review.rating
                        ? "text-primary fill-primary"
                        : "text-muted-foreground/20 fill-muted-foreground/20"
                    )}
                  />
                ))}
              </div>

              <p className="text-muted-foreground leading-relaxed text-sm font-medium">
                &quot;{review.comment}&quot;
              </p>

              {review.media_urls && review.media_urls.length > 0 && (
                <div className="flex gap-2 mt-4 overflow-x-auto pb-2 scrollbar-hide">
                  {review.media_urls.map((url, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => {
                        setLightboxImage(url);
                        setLightboxOpen(true);
                      }}
                      className="relative shrink-0 h-20 w-20 rounded-lg overflow-hidden border border-border/50 hover:opacity-90 transition-opacity"
                    >
                      <FlashImage
                        src={url}
                        alt={`Review photo ${i + 1}`}
                        fill
                        className="object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}

              {review.reply_text && (
                <div className="mt-6 pl-4 border-l-2 border-primary/30">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="bg-primary/10 p-1.5 rounded-lg">
                      <Reply className="h-3 w-3 text-primary" />
                    </div>
                    <span className="text-xs font-bold text-foreground uppercase tracking-wider">
                      Response from Flash
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {review.reply_text}
                  </p>
                </div>
              )}
            </article>
          ))
        )}
      </div>
      {/* Lightbox */}
      {lightboxOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4 animate-in fade-in"
          onClick={() => setLightboxOpen(false)}
        >
          <div className="relative w-full max-w-4xl h-[90vh]">
            <FlashImage
              src={lightboxImage}
              alt="Full size"
              fill
              className="object-contain"
            />
          </div>
          <button
            className="absolute top-4 right-4 text-white/50 hover:text-white"
            onClick={() => setLightboxOpen(false)}
          >
            <span className="sr-only">Close</span>
            <svg
              className="h-8 w-8"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
      )}
    </div>
  );
}

function ReviewForm({
  productId,
  onSuccess,
}: {
  productId: string;
  onSuccess: () => void;
}) {
  const [rating, setRating] = useState(5);

  async function action(formData: FormData) {
    formData.append("productId", productId);
    formData.append("rating", rating.toString());

    const res = await submitReview(formData);
    if (res?.error) {
      toast.error(res.error);
    } else {
      toast.success(res?.message || "Review submitted for approval!");
      onSuccess();
    }
  }

  return (
    <form action={action} className="space-y-4 pt-4">
      <div className="space-y-2">
        <Label id="rating-label" className="cursor-default">
          Rating
        </Label>
        <div
          className="flex gap-1 text-primary cursor-pointer"
          role="group"
          aria-labelledby="rating-label"
        >
          <input type="hidden" name="rating" value={rating} />
          {[1, 2, 3, 4, 5].map((s) => (
            <Star
              key={s}
              onClick={() => setRating(s)}
              className={cn(
                "h-6 w-6 transition-all hover:scale-110",
                s <= rating
                  ? "text-yellow-400 fill-yellow-400"
                  : "text-gray-200 fill-gray-200"
              )}
            />
          ))}
        </div>
      </div>

      {/* Name is now auto-fetched from profile */}

      <div className="space-y-2">
        <Label htmlFor="comment">Review</Label>
        <Textarea
          name="comment"
          id="comment"
          placeholder="What did you like or dislike?"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="images">Photos (Optional)</Label>
        <Input
          type="file"
          id="images"
          name="images"
          accept="image/*"
          multiple
          className="cursor-pointer file:text-primary file:font-bold"
        />
      </div>

      <Button type="submit" className="w-full">
        Submit
      </Button>
    </form>
  );
}
