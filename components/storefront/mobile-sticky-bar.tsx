'use client'

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { motion, AnimatePresence } from "framer-motion"
import { Plus, Clock } from "lucide-react"

interface MobileStickyBarProps {
    isVisible: boolean
    price: string
    isOutOfStock: boolean
    isOnWaitlist: boolean
    disabled: boolean
    onAddToCart: () => void
    onBuyNow: () => void
    onPreOrder: () => void
}

export function MobileStickyBar({ 
    isVisible, 
    price, 
    isOutOfStock, 
    isOnWaitlist, 
    disabled,
    onAddToCart, 
    onBuyNow,
    onPreOrder 
}: MobileStickyBarProps) {
    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div 
                    initial={{ y: 100 }}
                    animate={{ y: 0 }}
                    exit={{ y: 100 }}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    className="fixed bottom-0 left-0 right-0 z-50 p-4 bg-background/80 backdrop-blur-xl border-t border-border/50 lg:hidden shadow-[0_-5px_20px_-5px_rgba(0,0,0,0.1)]"
                >
                    <div className="flex flex-col gap-3">
                        <div className="flex items-center justify-between px-1">
                             <div className="flex flex-col">
                                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Total Price</p>
                                <p className="text-xl font-black italic tracking-tighter">{price}</p>
                            </div>
                            <div className="text-[10px] font-bold text-muted-foreground uppercase bg-muted px-2 py-1 rounded-md">
                                {isOutOfStock ? 'Coming Soon' : 'In Stock'}
                            </div>
                        </div>

                        <div className="flex gap-3">
                            <Button 
                                size="lg" 
                                variant="outline"
                                className={cn(
                                    "flex-1 h-12 text-[10px] font-black uppercase tracking-[0.2em] rounded-xl border-2 transition-all",
                                    isOutOfStock 
                                        ? "bg-amber-400 border-amber-400 text-amber-950 hover:bg-amber-500" 
                                        : "border-foreground/10 hover:border-foreground/20"
                                )}
                                disabled={disabled}
                                onClick={isOutOfStock ? onPreOrder : onAddToCart}
                            >
                                 {isOutOfStock ? (
                                    <span className="flex items-center gap-2">
                                        <Clock className="h-4 w-4" />
                                        {isOnWaitlist ? "Joined" : "Waitlist"}
                                    </span>
                                ) : (
                                    <span className="flex items-center gap-2">
                                        <Plus className="h-4 w-4" />
                                        Bag
                                    </span>
                                )}
                            </Button>

                            {!isOutOfStock && (
                                <Button 
                                    size="lg" 
                                    className="flex-[1.5] h-12 text-[10px] font-black uppercase tracking-[0.2em] rounded-xl gradient-primary shadow-lg shadow-primary/20 active:scale-95 transition-all"
                                    disabled={disabled}
                                    onClick={onBuyNow}
                                >
                                    Buy Now
                                </Button>
                            )}
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    )
}
