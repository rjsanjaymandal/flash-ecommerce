'use client'

import { useState, useOptimistic, useTransition, useEffect } from 'react'
import FlashImage from '@/components/ui/flash-image'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { voteForConcept } from '@/app/actions/vote-for-concept'
import { toast } from 'sonner'
import { CheckCircle2, Rocket, Share2, Timer, Users, Zap } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'

interface ConceptCardProps {
  concept: {
    id: string
    title: string
    description: string
    image_url: string
    vote_count: number
    vote_goal: number
    status: string
  }
  isLoggedIn: boolean
  hasVoted: boolean
}

export function ConceptCard({ concept, isLoggedIn, hasVoted: initiallyVoted }: ConceptCardProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [hasVoted, setHasVoted] = useState(initiallyVoted)
  const [isHovered, setIsHovered] = useState(false)

  const [optimisticVotes, addOptimisticVote] = useOptimistic(
    concept.vote_count,
    (state, _) => state + 1
  )

  const progress = Math.min(Math.round((optimisticVotes / concept.vote_goal) * 100), 100)

  const handleVote = async (e: React.MouseEvent) => {
    e.stopPropagation()
    if (!isLoggedIn) {
      toast.error('Please login to vote')
      router.push('/login?callbackUrl=/lab')
      return
    }

    if (hasVoted) return

    startTransition(async () => {
      // Optimistic update
      addOptimisticVote(null)
      setHasVoted(true)
      
      const result = await voteForConcept(concept.id)
      
      if (result?.error) {
        setHasVoted(false)
        toast.error(result.message || 'Something went wrong')
        if (result.error === 'authentication_required') {
          router.push('/login?callbackUrl=/lab')
        }
      } else {
        toast.success('Vote recorded! We will notify you on progress.', {
            icon: <Zap className="h-4 w-4 text-primary fill-primary" />
        })
      }
    })
  }

  const handleShare = (e: React.MouseEvent) => {
      e.stopPropagation()
      navigator.clipboard.writeText(window.location.origin + '/lab')
      toast.success('Link copied to clipboard')
  }

  return (
    <motion.div
        onHoverStart={() => setIsHovered(true)}
        onHoverEnd={() => setIsHovered(false)}
        whileHover={{ y: -10 }}
        className="h-full"
    >
        <Card 
            className={cn(
                "group h-full flex flex-col overflow-hidden border-border/40 bg-card/40 backdrop-blur-2xl transition-all duration-500",
                "hover:border-primary/40 hover:shadow-[0_20px_60px_-15px_rgba(var(--primary-rgb),0.15)]",
                hasVoted && "border-emerald-500/30 bg-emerald-500/[0.02]"
            )}
        >
            {/* Image Section */}
            <div className="relative aspect-[4/5] w-full overflow-hidden">
                <FlashImage
                    src={concept.image_url || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=1000&auto=format&fit=crop'}
                    alt={concept.title}
                    fill
                    className={cn(
                        "object-cover transition-transform duration-1000 ease-out",
                        isHovered ? "scale-110" : "scale-100"
                    )}
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />
                
                {/* Overlays */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                
                {/* Badges */}
                <div className="absolute left-4 top-4 flex flex-col gap-2">
                    <span className={cn(
                        "rounded-full px-4 py-1.5 text-[10px] font-black uppercase tracking-widest text-white shadow-xl backdrop-blur-md border border-white/20",
                        concept.status === 'voting' ? 'bg-primary/80' : 
                        concept.status === 'approved' ? 'bg-emerald-500/80' : 'bg-purple-600/80'
                    )}>
                        {concept.status}
                    </span>
                    {progress >= 80 && concept.status === 'voting' && (
                         <span className="bg-orange-500/80 rounded-full px-4 py-1.5 text-[10px] font-black uppercase tracking-widest text-white shadow-xl backdrop-blur-md border border-white/20 flex items-center gap-1.5 animate-pulse">
                            <Timer className="h-3 w-3" />
                            Closing Soon
                         </span>
                    )}
                </div>

                {/* Share Button */}
                <button 
                    onClick={handleShare}
                    className="absolute right-4 top-4 p-2.5 rounded-full bg-black/40 border border-white/10 text-white backdrop-blur-md opacity-0 group-hover:opacity-100 transition-all hover:bg-primary hover:border-primary duration-300 transform translate-y-[-10px] group-hover:translate-y-0"
                >
                    <Share2 className="h-4 w-4" />
                </button>

                {/* Quick Stats Overlay (Bottom) */}
                <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between opacity-0 group-hover:opacity-100 transition-all duration-500 transform translate-y-4 group-hover:translate-y-0">
                    <div className="flex items-center gap-1.5 text-white/90 text-sm font-bold">
                        <Users className="h-4 w-4 text-primary" />
                        {optimisticVotes} Backers
                    </div>
                </div>
            </div>
            
            <CardHeader className="space-y-2 md:space-y-3 pb-3 md:pb-4 relative">
                <div className="flex items-center justify-between">
                    <CardTitle className="text-xl md:text-2xl font-black tracking-tight uppercase leading-none">{concept.title}</CardTitle>
                </div>
                <p className="text-sm text-muted-foreground font-medium leading-relaxed line-clamp-2 min-h-[40px]">
                    {concept.description}
                </p>
            </CardHeader>

            <CardContent className="space-y-6 flex-grow">
                {/* Progress Visual */}
                <div className="space-y-3">
                    <div className="flex justify-between items-end">
                        <div className="space-y-1">
                            <p className="text-[10px] uppercase font-black tracking-tighter text-muted-foreground">Community Backing</p>
                            <div className="flex items-baseline gap-1">
                                <span className="text-xl md:text-2xl font-black text-primary leading-none">{progress}%</span>
                                <span className="text-xs font-bold text-muted-foreground uppercase">Goal</span>
                            </div>
                        </div>
                        <div className="text-right">
                             <p className="text-[10px] uppercase font-black tracking-tighter text-muted-foreground text-right">Remaining</p>
                             <p className="text-xs md:text-sm font-bold">{Math.max(0, concept.vote_goal - optimisticVotes)} <span className="text-[10px] opacity-70">Votes</span></p>
                        </div>
                    </div>
                    <div className="h-3 w-full bg-primary/5 rounded-full overflow-hidden border border-primary/10">
                        <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${progress}%` }}
                            transition={{ duration: 1.5, ease: "circOut" }}
                            className={cn(
                                "h-full relative",
                                hasVoted ? "bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.5)]" : "gradient-primary"
                            )}
                        >
                             <div className="absolute inset-0 bg-white/20 animate-pulse" />
                        </motion.div>
                    </div>
                </div>
            </CardContent>

            <CardFooter className="pt-2 pb-6 px-6">
                <Button 
                    className={cn(
                        "w-full h-12 md:h-14 gap-2 md:gap-3 font-black text-[10px] md:text-[12px] uppercase tracking-widest transition-all duration-500 rounded-xl md:rounded-2xl relative overflow-hidden",
                        hasVoted 
                            ? "bg-emerald-500/10 text-emerald-500 border-2 border-emerald-500/20 hover:bg-emerald-500/20" 
                            : "gradient-primary text-white shadow-xl shadow-primary/20 hover:shadow-primary/40 hover:scale-[1.02] active:scale-95 border-0"
                    )}
                    onClick={handleVote}
                    disabled={hasVoted || isPending || concept.status !== 'voting'}
                    variant={hasVoted ? "outline" : "default"}
                    size="lg"
                >
                    <AnimatePresence mode="wait">
                        {hasVoted ? (
                            <motion.div 
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="flex items-center gap-2"
                            >
                                <CheckCircle2 className="h-5 w-5" />
                                Support Confirmed
                            </motion.div>
                        ) : concept.status !== 'voting' ? (
                            <motion.div 
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                            >
                                Goal Reached!
                            </motion.div>
                        ) : (
                            <motion.div 
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="flex items-center gap-2"
                            >
                                <Rocket className={cn("h-5 w-5", isHovered && "animate-bounce")} />
                                Back this Concept
                            </motion.div>
                        )}
                    </AnimatePresence>
                    
                    {/* Glow effect on hover */}
                    {!hasVoted && concept.status === 'voting' && (
                        <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                    )}
                </Button>
            </CardFooter>
        </Card>
    </motion.div>
  )
}
