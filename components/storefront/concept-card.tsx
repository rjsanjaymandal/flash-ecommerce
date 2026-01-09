"use client";

import { motion } from "framer-motion";
import {
  Beaker,
  Check,
  ThumbsUp,
  Loader2,
  Sparkles,
  Flame,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import FlashImage from "@/components/ui/flash-image";

interface ConceptCardProps {
  concept: {
    id: string;
    title: string;
    description: string;
    image_url: string | null;
    vote_count: number;
    vote_goal: number;
    status: string;
  };
  isVoted: boolean;
  onVote: () => void;
  isLoading: boolean;
}

export function ConceptCard({
  concept,
  isVoted,
  onVote,
  isLoading,
}: ConceptCardProps) {
  const progress = Math.min(
    100,
    (concept.vote_count / concept.vote_goal) * 100
  );
  const isFunded = progress >= 100;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      className="group flex flex-col h-full space-y-4"
    >
      {/* Image Section - 3:4 Aspect Ratio */}
      <div className="relative aspect-[3/4] overflow-hidden rounded-2xl bg-secondary/10">
        {concept.image_url ? (
          <FlashImage
            src={concept.image_url}
            alt={concept.title}
            fill
            className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center gap-4 text-muted-foreground/30">
            <Beaker className="h-16 w-16" />
            <span className="text-sm font-black uppercase tracking-widest">
              Concept Art
            </span>
          </div>
        )}

        {/* Status Badge */}
        <div className="absolute top-4 left-4 flex gap-2">
          {isFunded && (
            <div className="px-3 py-1 rounded-full bg-emerald-500 text-white text-[10px] font-black uppercase tracking-widest shadow-lg shadow-emerald-500/20 flex items-center gap-1.5">
              <Sparkles className="h-3 w-3" />
              Greenlit
            </div>
          )}
          {!isFunded && progress > 50 && (
            <div className="px-3 py-1 rounded-full bg-amber-500 text-white text-[10px] font-black uppercase tracking-widest shadow-lg shadow-amber-500/20 flex items-center gap-1.5">
              <Flame className="h-3 w-3" />
              Trending
            </div>
          )}
        </div>
      </div>

      {/* Content Section */}
      <div className="flex-1 space-y-4 flex flex-col">
        <div className="space-y-2">
          <h3 className="text-2xl font-black uppercase tracking-tight text-foreground leading-none">
            {concept.title}
          </h3>
          <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed h-10">
            {concept.description}
          </p>
        </div>

        {/* Progress Bar */}
        <div className="space-y-2 mt-auto">
          <div className="flex justify-between items-end">
            <div className="flex flex-col">
              <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest">
                Backed By
              </span>
              <span className="text-lg font-black tabular-nums">
                {concept.vote_count}
              </span>
            </div>
            <div className="flex flex-col items-end">
              <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest">
                Goal
              </span>
              <span className="text-lg font-black tabular-nums text-muted-foreground">
                {concept.vote_goal}
              </span>
            </div>
          </div>
          <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
            <motion.div
              className={cn(
                "h-full rounded-full transition-all duration-1000",
                isFunded ? "bg-emerald-500" : "bg-primary"
              )}
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <Button
          size="lg"
          className={cn(
            "w-full h-12 rounded-xl text-sm font-black uppercase tracking-widest transition-all duration-300",
            isVoted
              ? "bg-secondary text-foreground hover:bg-secondary/80 border-2 border-primary/20"
              : "gradient-primary text-white shadow-lg shadow-primary/20 hover:scale-[1.02] hover:shadow-primary/30"
          )}
          onClick={onVote}
          disabled={isLoading}
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : isVoted ? (
            <>
              <Check className="mr-2 h-4 w-4" /> Voted
            </>
          ) : (
            <>
              <ThumbsUp className="mr-2 h-4 w-4" /> Support This
            </>
          )}
        </Button>
      </div>
    </motion.div>
  );
}
