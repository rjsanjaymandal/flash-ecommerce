'use client'

import { Progress } from "@/components/ui/progress"
import { formatCurrency } from "@/lib/utils"
import { motion, AnimatePresence } from "framer-motion"
import { Truck, Check, PartyPopper } from "lucide-react"

interface FreeShippingBarProps {
    total: number
    threshold?: number
}

export function FreeShippingBar({ total, threshold = 2500 }: FreeShippingBarProps) {
    const progress = Math.min((total / threshold) * 100, 100)
    const remaining = Math.max(threshold - total, 0)
    const isFree = total >= threshold

    return (
        <div className="space-y-3 pb-4">
            <div className="flex items-center justify-between text-xs font-bold uppercase tracking-widest px-1">
                <span className="flex items-center gap-1.5">
                    {isFree ? (
                        <span className="text-emerald-500 flex items-center gap-1">
                            <PartyPopper className="h-3 w-3" />
                            Free Shipping Unlocked!
                        </span>
                    ) : (
                        <span className="text-muted-foreground flex items-center gap-1">
                            <Truck className="h-3 w-3" />
                            {formatCurrency(remaining)} away from free shipping
                        </span>
                    )}
                </span>
                <span className="text-muted-foreground">{Math.round(progress)}%</span>
            </div>
            
            <div className="relative h-2 w-full bg-secondary/50 rounded-full overflow-hidden">
                <motion.div 
                    className="absolute top-0 left-0 h-full bg-linear-to-r from-primary to-indigo-500"
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                />
                {isFree && (
                    <motion.div 
                        className="absolute inset-0 bg-white/30"
                        initial={{ x: "-100%" }}
                        animate={{ x: "100%" }}
                        transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
                    />
                )}
            </div>

            <AnimatePresence>
                {isFree && (
                    <motion.div 
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, height: 0 }}
                        className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 px-3 py-2 rounded-lg text-xs font-bold text-center flex items-center justify-center gap-2"
                    >
                        <Check className="h-3 w-3" />
                         You've qualified for free standard shipping!
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}
