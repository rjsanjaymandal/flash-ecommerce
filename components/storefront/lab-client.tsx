"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Beaker, ThumbsUp, Check, Loader2, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { toggleVote } from "@/lib/services/concept-service";
import { toast } from "sonner";
import { useAuth } from "@/context/auth-context";
import { useRouter } from "next/navigation";

interface LabClientProps {
  concepts: any[];
  userVotes: string[]; // List of concept IDs user has voted for
}

export function LabClient({
  concepts: initialConcepts,
  userVotes: initialUserVotes,
}: LabClientProps) {
  const [concepts, setConcepts] = useState(initialConcepts);
  const [userVotes, setUserVotes] = useState<Set<string>>(
    new Set(initialUserVotes)
  );
  const [isLoadingId, setIsLoadingId] = useState<string | null>(null);
  const { user } = useAuth();
  const router = useRouter();

  const handleVote = async (concept: any) => {
    if (!user) {
      toast.error("Please sign in to vote for concepts");
      router.push("/login?next=/lab");
      return;
    }

    setIsLoadingId(concept.id);
    const isVoted = userVotes.has(concept.id);

    // Optimistic Update
    const newVotes = new Set(userVotes);
    if (isVoted) newVotes.delete(concept.id);
    else newVotes.add(concept.id);

    setUserVotes(newVotes);

    setConcepts((prev) =>
      prev.map((c) => {
        if (c.id === concept.id) {
          return { ...c, vote_count: c.vote_count + (isVoted ? -1 : 1) };
        }
        return c;
      })
    );

    try {
      const result = await toggleVote(concept.id);
      if (result && result.error) {
        throw new Error(result.error);
      }
    } catch (error: any) {
      // Revert
      setUserVotes((original) => {
        const reverted = new Set(original);
        if (isVoted) reverted.add(concept.id);
        else reverted.delete(concept.id);
        return reverted;
      });
      setConcepts((prev) =>
        prev.map((c) => {
          if (c.id === concept.id) {
            return { ...c, vote_count: c.vote_count + (isVoted ? 1 : -1) };
          }
          return c;
        })
      );
      toast.error(error.message || "Failed to submit vote");
    } finally {
      setIsLoadingId(null);
    }
  };

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="text-center max-w-2xl mx-auto mb-16 space-y-4">
        <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-indigo-500/10 text-indigo-500 mb-4">
          <Beaker className="h-8 w-8" />
        </div>
        <h1 className="text-4xl md:text-6xl font-black tracking-tighter uppercase">
          Future{" "}
          <span className="text-transparent bg-clip-text bg-linear-to-r from-indigo-500 to-purple-600">
            Lab
          </span>
        </h1>
        <p className="text-lg text-muted-foreground font-medium">
          Vote on our upcoming drops. The most hyped concepts get built.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {concepts.map((concept) => {
          const isVoted = userVotes.has(concept.id);
          const progress = Math.min(
            100,
            (concept.vote_count / concept.vote_goal) * 100
          );

          return (
            <motion.div
              key={concept.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-card border border-border/50 rounded-3xl overflow-hidden group shadow-lg hover:shadow-xl transition-all"
            >
              <div className="aspect-[4/3] bg-muted relative overflow-hidden">
                {concept.image_url ? (
                  <img
                    src={concept.image_url}
                    alt={concept.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-secondary/30">
                    <Beaker className="h-12 w-12 text-muted-foreground/20" />
                  </div>
                )}

                <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/20 to-transparent opacity-60" />

                <div className="absolute bottom-0 left-0 right-0 p-6 pt-12 text-white">
                  <h3 className="text-2xl font-black uppercase tracking-tight mb-2">
                    {concept.title}
                  </h3>
                  <p className="text-sm text-white/80 line-clamp-2">
                    {concept.description}
                  </p>
                </div>
              </div>

              <div className="p-6 space-y-6">
                {/* Progress */}
                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    <span>Hype Level</span>
                    <span>{Math.round(progress)}%</span>
                  </div>
                  <div className="h-2 bg-secondary rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-linear-to-r from-indigo-500 to-purple-600"
                      initial={{ width: 0 }}
                      animate={{ width: `${progress}%` }}
                      transition={{ duration: 1, delay: 0.2 }}
                    />
                  </div>
                  <p className="text-xs text-center text-muted-foreground pt-1">
                    <span className="text-foreground font-bold">
                      {concept.vote_count}
                    </span>{" "}
                    out of {concept.vote_goal} votes needed
                  </p>
                </div>

                <Button
                  className={cn(
                    "w-full h-14 rounded-xl text-lg font-black uppercase tracking-wide transition-all",
                    isVoted
                      ? "bg-green-500 hover:bg-green-600 text-white shadow-green-500/25"
                      : "bg-foreground text-background hover:scale-[1.02] shadow-xl"
                  )}
                  onClick={() => handleVote(concept)}
                  disabled={isLoadingId === concept.id}
                >
                  {isLoadingId === concept.id ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : isVoted ? (
                    <>
                      <Check className="mr-2 h-5 w-5" /> Voted
                    </>
                  ) : (
                    <>
                      <ThumbsUp className="mr-2 h-5 w-5" /> Vote This
                    </>
                  )}
                </Button>
              </div>
            </motion.div>
          );
        })}
      </div>

      {concepts.length === 0 && (
        <div className="text-center py-20 text-muted-foreground">
          <p className="text-xl font-medium">
            All concepts have been built or archived.
          </p>
          <p>Check back soon for new drops!</p>
        </div>
      )}
    </div>
  );
}
