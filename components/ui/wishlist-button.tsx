'use client'

import { Heart } from "lucide-react"
import { useOptimistic, startTransition } from "react"
import { cn } from "@/lib/utils"
import { Button } from "./button"
import { toast } from "sonner"

interface WishlistButtonProps {
    initialIsLiked: boolean
    onToggle: () => Promise<{ error?: string, status?: 'added' | 'removed' }>
    className?: string
}

export function WishlistButton({ initialIsLiked, onToggle, className }: WishlistButtonProps) {
    const [optimisticLike, setOptimisticLike] = useOptimistic(
        initialIsLiked,
        (state, newState: boolean) => newState
    )

    const handleToggle = async (e: React.MouseEvent) => {
        e.preventDefault()
        e.stopPropagation()
        
        const nextState = !optimisticLike
        
        // 1. Optimistic Update (Instant)
        startTransition(() => {
            setOptimisticLike(nextState)
        })

        try {
            // 2. Server Action (Background)
            const result = await onToggle()
            if (result.error) {
                // Revert on error? 
                // Alternatively, just show error. For now, we trust the optimistic UI won't fail often.
                toast.error(result.error)
                startTransition(() => {
                    setOptimisticLike(initialIsLiked) // Revert
                })
            }
        } catch (e) {
             toast.error("Failed to update wishlist")
             startTransition(() => {
                setOptimisticLike(initialIsLiked) // Revert
            })
        }
    }

    return (
        <button
            onClick={handleToggle}
            className={cn(
                "group relative flex items-center justify-center transition-all duration-200 hover:scale-110",
                className
            )}
        >
            <Heart 
                className={cn(
                    "h-6 w-6 transition-colors duration-200", 
                    optimisticLike ? "fill-red-500 text-red-500" : "fill-transparent text-foreground group-hover:text-red-500"
                )} 
            />
        </button>
    )
}
