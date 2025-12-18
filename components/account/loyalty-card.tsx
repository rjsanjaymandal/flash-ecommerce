'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Award, Zap } from 'lucide-react'
import { Progress } from '@/components/ui/progress'

interface LoyaltyCardProps {
    points: number
}

import { motion } from 'framer-motion'
import { BrandBadge } from '@/components/storefront/brand-badge'

export function LoyaltyCard({ points }: LoyaltyCardProps) {
    // 100 points to next tier (example)
    const nextTier = 1000
    const progress = Math.min((points / nextTier) * 100, 100)

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
        >
            <Card className="bg-zinc-950 text-white border-0 overflow-hidden relative rounded-4xl md:rounded-4xl shadow-2xl group/card">
                <div className="absolute top-0 right-0 p-40 bg-primary/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2 group-hover:bg-primary/20 transition-colors duration-1000" />
                <div className="absolute bottom-0 left-0 p-24 bg-indigo-600/5 rounded-full blur-[80px] translate-y-1/2 -translate-x-1/2" />
                
                <CardHeader className="relative z-10 pb-0 p-5 md:p-6">
                    <div className="flex items-center justify-between">
                        <CardTitle className="flex items-center gap-2 text-xs md:text-sm font-black uppercase tracking-widest text-white/50">
                            <Award className="h-3 w-3 md:h-4 md:w-4 text-primary" />
                            Flash Rewards
                        </CardTitle>
                        <BrandBadge variant="outline" className="text-[8px] md:text-[9px] border-white/20 text-white/80">Active tier</BrandBadge>
                    </div>
                </CardHeader>
                
                <CardContent className="relative z-10 space-y-5 md:space-y-6 pt-4 md:pt-6 p-5 md:p-6">
                    <div className="flex flex-col xs:flex-row xs:items-end justify-between gap-4">
                        <div>
                            <h3 className="text-4xl md:text-5xl font-black italic tracking-tighter text-gradient leading-none">{points}</h3>
                            <p className="text-white/40 text-[9px] md:text-[10px] font-black uppercase tracking-widest mt-1 md:mt-2">Available Credits</p>
                        </div>
                        <div className="text-left xs:text-right pb-1">
                            <span className="text-xl md:text-2xl font-black italic tracking-tighter text-white/90 leading-none">SILVER</span>
                            <p className="text-white/40 text-[9px] md:text-[10px] font-black uppercase tracking-widest mt-0.5 md:mt-1">Status Level</p>
                        </div>
                    </div>
                    
                    <div className="space-y-1.5 md:space-y-2">
                        <div className="flex justify-between text-[9px] md:text-[10px] font-black uppercase tracking-widest text-white/60">
                            <span className="text-primary italic">Silver Member</span>
                            <span>{nextTier - points} pts to Gold</span>
                        </div>
                        <div className="relative h-2 md:h-2.5 w-full bg-white/10 rounded-full overflow-hidden border border-white/5">
                            <motion.div 
                                initial={{ width: 0 }}
                                animate={{ width: `${progress}%` }}
                                transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
                                className="absolute top-0 left-0 h-full bg-linear-to-r from-primary to-indigo-500 rounded-full shadow-[0_0_10px_rgba(var(--primary),0.5)]"
                            />
                        </div>
                    </div>
                    
                    <div className="bg-white/5 border border-white/5 p-2.5 md:p-3 rounded-2xl flex items-center gap-2.5 md:gap-3">
                        <div className="h-7 w-7 md:h-8 md:w-8 bg-primary/20 rounded-full flex items-center justify-center shrink-0">
                            <Zap className="h-3.5 w-3.5 md:h-4 md:w-4 text-yellow-300" />
                        </div>
                        <p className="text-[9px] md:text-[10px] text-white/60 font-medium leading-tight">
                            Earn <span className="text-white font-bold">1 point</span> for every <span className="text-white font-bold">₹100</span> spent.
                            <br className="hidden xs:block" />
                            <span className="opacity-50 block xs:inline mt-0.5 xs:mt-0">Next scan reward available tomorrow.</span>
                        </p>
                    </div>
                </CardContent>
            </Card>
        </motion.div>
    )
}
