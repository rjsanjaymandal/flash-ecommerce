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
    onPreOrder: () => void
}

export function MobileStickyBar({ 
    isVisible, 
    price, 
    isOutOfStock, 
    isOnWaitlist, 
    disabled,
    onAddToCart, 
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
                    <div className="flex items-center gap-4">
                        <div className="flex-1">
                            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Total</p>
                            <p className="text-xl font-black italic tracking-tighter">{price}</p>
                        </div>
                        <Button 
                            size="lg" 
                            className={cn(
                                "flex-[2] h-12 text-xs font-black uppercase tracking-[0.2em] rounded-xl shadow-xl",
                                isOutOfStock 
                                    ? "bg-amber-400 text-amber-950 hover:bg-amber-500" 
                                    : "gradient-primary hover:scale-[1.02] active:scale-95"
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
                                    Add to Bag
                                </span>
                            )}
                        </Button>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    )
}
