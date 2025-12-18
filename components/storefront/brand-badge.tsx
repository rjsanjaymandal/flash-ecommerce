'use client'

import { cn } from '@/lib/utils'
import { motion, HTMLMotionProps } from 'framer-motion'

interface BrandBadgeProps extends HTMLMotionProps<'span'> {
    variant?: 'primary' | 'outline' | 'glass' | 'accent'
    className?: string
    children: React.ReactNode
}

export function BrandBadge({ 
    variant = 'primary', 
    className, 
    children, 
    ...props 
}: BrandBadgeProps) {
    const variants = {
        primary: "bg-primary/10 text-primary border-primary/20",
        outline: "bg-transparent text-primary border-primary/50",
        glass: "bg-white/10 backdrop-blur-md text-white border-white/20",
        accent: "bg-accent/10 text-accent border-accent/20"
    }

    return (
        <motion.span 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className={cn(
                "inline-block px-3 py-1 rounded-full border text-[10px] font-black uppercase tracking-[0.2em] shadow-sm",
                variants[variant],
                className
            )}
            {...props}
        >
            {children}
        </motion.span>
    )
}
