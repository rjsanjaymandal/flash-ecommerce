"use client";

import { useEffect, useState } from "react";
import { FlaskConical, Info, Sparkles, TrendingUp, Users } from "lucide-react";
import { ConceptCard } from "@/components/lab/concept-card";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";

interface LabClientViewProps {
  concepts: any[];
  user: any;
  userVotes: string[];
}

export function LabClientView({
  concepts,
  user,
  userVotes,
}: LabClientViewProps) {
  const [mounted, setMounted] = useState(false);
  const [currentConcepts, setCurrentConcepts] = useState(concepts);

  useEffect(() => {
    setMounted(true);
    setCurrentConcepts(concepts);
  }, [concepts]);

  useEffect(() => {
    if (!mounted) return;

    const supabase = createClient();

    // Subscribe to all changes on the concepts table
    const channel = supabase
      .channel("lab-concepts-realtime")
      .on(
        "postgres_changes",
        {
          event: "*", // Listen to all events (INSERT, UPDATE, DELETE)
          schema: "public",
          table: "concepts",
        },
        (payload) => {
          console.log("Realtime update received:", payload);

          if (payload.eventType === "UPDATE") {
            setCurrentConcepts((prev) =>
              prev.map((c) =>
                c.id === payload.new.id ? { ...c, ...payload.new } : c
              )
            );
          } else if (payload.eventType === "INSERT") {
            setCurrentConcepts((prev) => [payload.new, ...prev]);
          } else if (payload.eventType === "DELETE") {
            setCurrentConcepts((prev) =>
              prev.filter((c) => c.id !== payload.old.id)
            );
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [mounted]);

  if (!mounted)
    return (
      <div className="min-h-screen bg-background" /> // Simple placeholder for hydration
    );

  return (
    <div className="min-h-screen bg-background selection:bg-primary selection:text-white overflow-hidden">
      {/* Background Orbs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.1, 0.15, 0.1],
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-primary/20 rounded-full blur-[120px]"
        />
        <motion.div
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.1, 0.2, 0.1],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 2,
          }}
          className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-indigo-500/20 rounded-full blur-[120px]"
        />
      </div>

      <div className="container mx-auto px-4 py-16 md:py-28 relative z-10 max-w-7xl">
        {/* Hero section */}
        <div className="relative mb-32 flex flex-col items-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center gap-4 mb-8"
          >
            <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] font-black uppercase tracking-[0.25em]">
              <Sparkles className="h-3.5 w-3.5" />
              Vibe Evolution Lab
            </div>
            <div className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest text-emerald-500">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              Live Updates Active
            </div>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="text-5xl sm:text-7xl md:text-9xl font-black tracking-tighter uppercase text-center leading-[0.8] mb-6 md:mb-10"
          >
            <span className="block mb-1 md:mb-2">Future</span>
            <span className="block italic text-gradient">Drop</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="max-w-xl text-center text-sm md:text-xl text-muted-foreground leading-relaxed mb-10 md:mb-16 font-medium px-4"
          >
            Don&apos;t just follow the trend.{" "}
            <span className="text-foreground font-bold underline decoration-primary/30 underline-offset-8">
              Direct it.
            </span>{" "}
            We prototype, you decide.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="w-full max-w-2xl mx-auto px-4"
          >
            <button
              onClick={() =>
                document
                  .getElementById("concepts-grid")
                  ?.scrollIntoView({ behavior: "smooth" })
              }
              className="w-full md:w-auto px-8 py-4 rounded-full bg-primary text-white font-black uppercase text-xs tracking-widest shadow-xl shadow-primary/20 animate-bounce"
            >
              Start Voting
            </button>
          </motion.div>
        </div>

        {/* Concepts Grid with Staggered children */}
        <motion.div
          id="concepts-grid"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-12 lg:gap-16 mb-32"
          variants={{
            hidden: { opacity: 0 },
            show: {
              opacity: 1,
              transition: {
                staggerChildren: 0.15,
              },
            },
          }}
          initial="hidden"
          animate="show"
        >
          {currentConcepts.map((concept) => (
            <motion.div
              key={concept.id}
              variants={{
                hidden: { opacity: 0, y: 40 },
                show: {
                  opacity: 1,
                  y: 0,
                  transition: { duration: 0.8, ease: "easeOut" },
                },
              }}
            >
              <ConceptCard
                concept={concept}
                isLoggedIn={!!user}
                hasVoted={userVotes.includes(concept.id)}
              />
            </motion.div>
          ))}
        </motion.div>

        {currentConcepts.length === 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center py-40 text-center space-y-8 border-2 border-dashed rounded-[4rem] border-primary/10 bg-primary/5 backdrop-blur-xl mb-32"
          >
            <div className="relative">
              <div className="absolute inset-0 bg-primary/20 blur-2xl rounded-full" />
              <div className="relative p-6 rounded-3xl bg-card border border-border shadow-2xl">
                <FlaskConical className="h-16 w-16 text-primary animate-pulse" />
              </div>
            </div>
            <div className="space-y-3">
              <h3 className="text-4xl font-black tracking-tight uppercase">
                Innovating Behind the Scenes
              </h3>
              <p className="text-muted-foreground max-w-md mx-auto text-lg">
                Our design team is pushing boundaries. Check back soon for the
                next wave of experimental drops.
              </p>
            </div>
            <div className="flex gap-4">
              <button className="px-8 py-3 rounded-full bg-primary text-white font-black uppercase text-xs tracking-widest shadow-xl shadow-primary/20">
                Follow Drops
              </button>
            </div>
          </motion.div>
        )}

        {/* Community Stats Section (Moved Bottom) */}
        <div className="mb-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-black uppercase tracking-tighter mb-4">
              Community Pulse
            </h2>
            <div className="h-1 w-20 bg-primary mx-auto rounded-full" />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 w-full"
          >
            <StatCard
              icon={Users}
              label="Total Backers"
              value={currentConcepts.reduce((acc, c) => acc + c.vote_count, 0)}
            />
            <StatCard
              icon={TrendingUp}
              label="Active Concepts"
              value={currentConcepts.length}
            />
            <StatCard
              icon={FlaskConical}
              label="Production Ready"
              value={
                currentConcepts.filter((c) => c.status !== "voting").length
              }
              color="emerald"
            />
            <StatCard
              icon={Sparkles}
              label="Success Rate"
              value={`${Math.round((currentConcepts.filter((c) => c.status !== "voting").length / Math.max(1, currentConcepts.length)) * 100)}%`}
            />
          </motion.div>
        </div>

        {/* Informational Bento Section */}
        <div className="mt-24 md:mt-40 grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
          <div className="lg:col-span-2 p-8 md:p-12 rounded-[2.5rem] md:rounded-[3.5rem] bg-zinc-900 text-white relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-primary/10 rounded-full blur-[100px] -mr-48 -mt-48 transition-all group-hover:bg-primary/20 duration-1000" />
            <div className="relative z-10">
              <h3 className="text-3xl md:text-5xl font-black tracking-tighter uppercase mb-6 md:mb-8 leading-tight">
                Demand-Driven
                <br />
                <span className="text-primary italic">Craftsmanship</span>
              </h3>
              <p className="max-w-xl text-zinc-400 text-base md:text-lg font-medium leading-relaxed mb-8 md:mb-10">
                We&apos;re throwing away the old playbook. No more static
                collections. We prototype, you evaluate. If the community backs
                a concept, it earns its place in our factory. 100% transparency,
                zero waste.
              </p>
              <div className="flex flex-wrap gap-8">
                <div className="flex flex-col">
                  <span className="text-2xl font-black text-white">48h</span>
                  <span className="text-[10px] uppercase font-bold text-zinc-500 tracking-widest mt-1">
                    Prototype Speed
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-2xl font-black text-white">100%</span>
                  <span className="text-[10px] uppercase font-bold text-zinc-500 tracking-widest mt-1">
                    Community Approved
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-2xl font-black text-white">Eco</span>
                  <span className="text-[10px] uppercase font-bold text-zinc-500 tracking-widest mt-1">
                    Conscious Loop
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="p-8 md:p-12 rounded-[2.5rem] md:rounded-[3.5rem] bg-card border border-border flex flex-col justify-between group overflow-hidden relative min-h-[300px] md:min-h-auto">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
            <div className="relative z-10">
              <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mb-8">
                <Info className="h-7 w-7" />
              </div>
              <h4 className="text-2xl font-black tracking-tight uppercase mb-4">
                Current Status
              </h4>
              <p className="text-muted-foreground font-medium mb-8">
                Next major concept drop scheduled for early Q1 2026. Stay tuned
                for &quot;Neon Pulse&quot; collection.
              </p>
            </div>
            <button className="relative z-10 w-full py-4 rounded-2xl border-2 border-border font-black text-[10px] uppercase tracking-widest transition-all hover:bg-primary hover:text-white hover:border-primary">
              Get Notifications
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  color = "primary",
}: {
  icon: any;
  label: string;
  value: any;
  color?: string;
}) {
  return (
    <div className="flex flex-col items-center p-4 md:p-6 rounded-[2rem] md:rounded-[2.5rem] bg-card/40 border border-border/50 backdrop-blur-xl transition-all hover:border-primary/40 hover:shadow-2xl hover:shadow-primary/5 group relative overflow-hidden text-center">
      <div
        className={cn(
          "h-10 w-10 md:h-14 md:w-14 rounded-xl md:rounded-2xl flex items-center justify-center mb-3 md:mb-5 group-hover:scale-110 transition-transform duration-500",
          color === "primary"
            ? "bg-primary/10 text-primary"
            : "bg-emerald-500/10 text-emerald-500"
        )}
      >
        <Icon className="h-5 w-5 md:h-7 md:w-7" />
      </div>
      <span className="text-xl md:text-3xl font-black tracking-tighter leading-none">
        {value}
      </span>
      <span className="text-[9px] md:text-[10px] uppercase font-bold text-muted-foreground tracking-widest mt-1 md:mt-2">
        {label}
      </span>

      {/* Subtle glow */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
    </div>
  );
}
