'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { Sparkles, Gift } from 'lucide-react'

export function FestiveBanner() {
  return (
    <motion.div 
      initial={{ height: 0, opacity: 0 }}
      animate={{ height: 'auto', opacity: 1 }}
      className="bg-[#b91c1c] text-white py-2 px-4 relative z-[60] overflow-hidden"
    >
      <div className="mx-auto max-w-7xl flex items-center justify-center gap-4 text-[11px] sm:text-xs font-black uppercase tracking-[0.2em]">
        <motion.div
            animate={{ scale: [1, 1.2, 1], rotate: [0, 10, -10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
        >
            <Gift className="h-4 w-4 text-[#fbbf24]" />
        </motion.div>
        
        <span className="flex items-center gap-2">
            MERRY CHRISTMAS <Sparkles className="h-3 w-3 inline" /> 
            <span className="hidden sm:inline">| USE CODE XMAS10 FOR 10% OFF</span>
        </span>

        <motion.div
            animate={{ scale: [1, 1.2, 1], rotate: [0, -10, 10, 0] }}
            transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
        >
            <Sparkles className="h-4 w-4 text-[#fbbf24]" />
        </motion.div>
        
        {/* Animated Ornaments Background */}
        <div className="absolute top-0 right-10 opacity-20 pointer-events-none">
            <span className="text-2xl animate-bounce inline-block">🎄</span>
        </div>
        <div className="absolute top-0 left-10 opacity-20 pointer-events-none">
            <span className="text-2xl animate-bounce inline-block" style={{ animationDelay: '1s' }}>❄️</span>
        </div>
      </div>
    </motion.div>
  )
}
