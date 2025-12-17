'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Award, Zap } from 'lucide-react'
import { Progress } from '@/components/ui/progress'

interface LoyaltyCardProps {
    points: number
}

export function LoyaltyCard({ points }: LoyaltyCardProps) {
    // 100 points to next tier (example)
    const nextTier = 1000
    const progress = Math.min((points / nextTier) * 100, 100)

    return (
        <Card className="bg-linear-to-br from-indigo-600 to-purple-600 text-white border-0 overflow-hidden relative">
            <div className="absolute top-0 right-0 p-32 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
            
            <CardHeader className="relative z-10 pb-2">
                <CardTitle className="flex items-center gap-2 text-lg font-medium text-white/90">
                    <Award className="h-5 w-5" />
                    Flash Rewards
                </CardTitle>
            </CardHeader>
            <CardContent className="relative z-10 space-y-4">
                <div className="mt-2">
                    <h3 className="text-4xl font-black">{points}</h3>
                    <p className="text-white/70 text-sm">Available Points</p>
                </div>
                
                <div className="space-y-2">
                    <div className="flex justify-between text-xs font-medium text-white/80">
                        <span>Silver Member</span>
                        <span>{nextTier - points} to Gold</span>
                    </div>
                    <Progress value={progress} className="h-2 bg-black/20" />
                </div>
                
                <div className="pt-2 flex items-center gap-2 text-xs text-white/60 bg-white/10 p-2 rounded-lg">
                    <Zap className="h-4 w-4 text-yellow-300" />
                    <span>Earn 1 point for every ₹100 spent</span>
                </div>
            </CardContent>
        </Card>
    )
}
