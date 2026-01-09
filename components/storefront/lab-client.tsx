"use client";

import { useState, useEffect } from "react";
import { Beaker } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { toggleVote } from "@/lib/services/concept-service";
import { toast } from "sonner";
import { useAuth } from "@/context/auth-context";
import { useRouter } from "next/navigation";
import { ConceptCard } from "./concept-card";

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
  const supabase = createClient();

  useEffect(() => {
    const channel = supabase
      .channel("active-concepts")
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "concepts",
        },
        (payload) => {
          const updatedConcept = payload.new;
          setConcepts((prev) =>
            prev.map((c) =>
              c.id === updatedConcept.id ? { ...c, ...updatedConcept } : c
            )
          );
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

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
      toast.success(isVoted ? "Vote removed" : "Vote counted!");
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
    <div className="container mx-auto px-4 py-8 md:py-16">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto mb-12 md:mb-20 space-y-6">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary border border-primary/20 mb-2">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
          </span>
          <span className="text-[10px] font-black uppercase tracking-widest">
            Phase 1: Concept Extraction
          </span>
        </div>
        <h1 className="text-5xl md:text-8xl font-black tracking-tighter uppercase leading-[0.85]">
          Future
          <br />
          <span className="text-transparent bg-clip-text bg-linear-to-b from-primary to-purple-600">
            Laboratory
          </span>
        </h1>
        <p className="text-lg md:text-xl text-muted-foreground font-medium max-w-xl mx-auto leading-relaxed">
          Help us decode the next wave of fashion. Your votes determine which
          prototypes hit the production line.
        </p>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-10">
        {concepts.map((concept) => (
          <ConceptCard
            key={concept.id}
            concept={concept}
            isVoted={userVotes.has(concept.id)}
            onVote={() => handleVote(concept)}
            isLoading={isLoadingId === concept.id}
          />
        ))}
      </div>

      {concepts.length === 0 && (
        <div className="flex flex-col items-center justify-center py-32 text-center text-muted-foreground border-2 border-dashed border-border/50 rounded-3xl bg-secondary/20">
          <Beaker className="h-16 w-16 mb-6 opacity-20" />
          <h3 className="text-2xl font-black uppercase italic mb-2">
            Lab is Quiet
          </h3>
          <p className="max-w-md mx-auto">
            All current experiments have concluded. Our designers are mixing new
            formulas. Check back soon.
          </p>
        </div>
      )}
    </div>
  );
}
