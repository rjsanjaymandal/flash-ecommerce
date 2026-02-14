"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import FlashImage from "@/components/ui/flash-image";
import { Button } from "@/components/ui/button";
import { Loader2, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();
  const [isLoading, setIsLoading] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);

  // Get redirect URL
  const next = searchParams.get("next") || "/";

  // Check auth state
  useEffect(() => {
    const checkUser = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (session) {
        router.replace(next as any);
      }
    };
    checkUser();
  }, [router, supabase, next]);

  const onGoogleLogin = async () => {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`,
          queryParams: {
            prompt: "select_account",
          },
        },
      });

      if (error) throw error;

      // Since it's a redirect, we set a special state
      setIsRedirecting(true);
    } catch (error: any) {
      console.error("Login Error:", error);
      toast.error(error.message || "Failed to initiate Google login");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex w-full bg-background overflow-hidden">
      {/* Left Side - Image (Desktop Only) */}
      <div className="hidden lg:flex w-1/2 relative bg-black items-center justify-center overflow-hidden border-r border-white/5">
        <div className="absolute inset-0 bg-linear-to-t from-black via-black/20 to-transparent z-10" />
        <FlashImage
          src="https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&q=80&w=2000"
          alt="Fashion Editorial"
          fill
          priority
          resizeMode="cover"
          className="object-cover object-center translate-x-10 scale-110 opacity-60"
        />
        <div className="absolute bottom-20 left-12 z-20 max-w-lg space-y-6">
          <div className="space-y-2">
            <span className="text-primary font-mono text-sm tracking-[0.3em] uppercase">
              Est. 2026
            </span>
            <h1 className="text-7xl font-black text-white leading-none tracking-tighter">
              ACCESS
              <br />
              GRANTED.
            </h1>
          </div>
          <p className="text-white/60 text-lg font-light leading-relaxed max-w-md">
            Identify as you. Shop as you. Be you. <br />
            Experience industrial-grade fashion authentication.
          </p>
          <div className="flex gap-4 pt-4">
            <div className="h-0.5 w-12 bg-primary self-center" />
            <span className="text-white/40 font-mono text-xs uppercase tracking-widest italic">
              Secure Single Login Node
            </span>
          </div>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 relative">
        {/* Background Accents */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-[120px]" />
          <div className="absolute bottom-[-10%] left-[-10%] w-[30%] h-[30%] bg-purple-500/5 rounded-full blur-[100px]" />
        </div>

        <div className="w-full max-w-md space-y-12 relative z-10">
          <div className="text-center space-y-4">
            <Link
              href="/"
              className="inline-block hover:opacity-80 transition-opacity"
            >
              <span className="text-4xl font-black tracking-tighter bg-clip-text text-transparent bg-linear-to-r from-primary via-purple-500 to-pink-500">
                FLASH
              </span>
            </Link>
            <div className="space-y-1">
              <h2 className="text-2xl font-bold tracking-tight uppercase font-mono">
                System Authentication
              </h2>
              <p className="text-muted-foreground text-sm tracking-wide">
                Please continue with your verified Google account
              </p>
            </div>
          </div>

          <div className="space-y-6">
            <Button
              size="lg"
              className="w-full h-16 text-lg font-black uppercase tracking-tight bg-white text-black hover:bg-white/90 border-2 border-transparent hover:border-black/10 transition-all group relative overflow-hidden rounded-none shadow-2xl shadow-primary/10"
              onClick={onGoogleLogin}
              disabled={isLoading}
            >
              <div className="absolute inset-0 bg-linear-to-r from-transparent via-black/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />

              <div className="flex items-center justify-center gap-4 relative z-10 font-mono">
                {isLoading ? (
                  <Loader2 className="h-6 w-6 animate-spin" />
                ) : (
                  <>
                    <svg className="h-6 w-6" viewBox="0 0 24 24">
                      <path
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                        fill="#4285F4"
                      />
                      <path
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                        fill="#34A853"
                      />
                      <path
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                        fill="#FBBC05"
                      />
                      <path
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                        fill="#EA4335"
                      />
                    </svg>
                    <span>Continue with Google</span>
                  </>
                )}
              </div>
              <ArrowRight className="absolute right-6 h-5 w-5 opacity-0 group-hover:opacity-100 group-hover:translate-x-2 transition-all" />
            </Button>

            <div className="flex items-center gap-4 py-4 text-muted-foreground/30">
              <div className="h-px w-full bg-current" />
              <span className="text-[10px] font-mono whitespace-nowrap tracking-[0.4em] uppercase">
                End-to-End Encryption
              </span>
              <div className="h-px w-full bg-current" />
            </div>

            <div className="text-center space-y-4">
              <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest leading-loose max-w-xs mx-auto opacity-60">
                You are entering the FLASH proprietary network. By continuing,
                you agree to our centralized protocol terms and data custody
                agreements.
              </p>
            </div>
          </div>

          {/* Redirect Overlay */}
          <AnimatePresence>
            {isRedirecting && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="absolute inset-0 bg-background/90 backdrop-blur-sm z-50 flex flex-col items-center justify-center space-y-6 text-center"
              >
                <div className="relative">
                  <div className="h-24 w-24 border-2 border-primary/20 rounded-full" />
                  <div className="absolute inset-0 border-t-2 border-primary rounded-full animate-spin" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-bold uppercase font-mono tracking-tighter">
                    Redirecting
                  </h3>
                  <p className="text-muted-foreground text-sm font-mono animate-pulse">
                    Syncing session with Google servers...
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Footer Branding */}
          <div className="pt-20 text-center border-t border-muted/20">
            <p className="text-[9px] font-mono text-muted-foreground/40 uppercase tracking-[0.5em]">
              Operational Status: Stable // Secured Node // 2026
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
