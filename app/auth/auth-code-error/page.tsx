"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { AlertCircle, ArrowLeft, ShieldX } from "lucide-react";
import { motion } from "framer-motion";

export default function AuthCodeErrorPage() {
  const searchParams = useSearchParams();
  const message =
    searchParams.get("message") ||
    "Authentication process failed. Please try again or contact support.";

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full space-y-8 p-12 bg-muted/10 border border-muted/20 relative overflow-hidden"
      >
        {/* Industrial Accent */}
        <div className="absolute top-0 left-0 w-full h-1 bg-red-500/50" />

        <div className="text-center space-y-6">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-500/10 mb-2">
            <ShieldX className="h-8 w-8 text-red-500" />
          </div>

          <div className="space-y-2">
            <h1 className="text-3xl font-black tracking-tighter uppercase font-mono text-red-500">
              Auth Failure
            </h1>
            <p className="text-muted-foreground font-mono text-[10px] tracking-widest uppercase">
              Terminal Access Denied // Error Code 401
            </p>
          </div>

          <div className="bg-black/20 p-6 border border-white/5 rounded-none text-left space-y-2">
            <div className="flex items-start gap-2 text-red-400">
              <AlertCircle className="h-4 w-4 mt-1 shrink-0" />
              <p className="text-sm font-medium leading-relaxed">{message}</p>
            </div>
            <p className="text-[9px] font-mono text-muted-foreground/40 mt-4 leading-normal">
              If this persistent node error continues, verify your Google
              Account permissions or check systemic network status.
            </p>
          </div>

          <div className="pt-4">
            <Button
              asChild
              className="w-full h-12 rounded-none font-bold uppercase tracking-tight bg-white text-black hover:bg-white/90"
            >
              <Link
                href="/login"
                className="flex items-center justify-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Return to Login
              </Link>
            </Button>
          </div>
        </div>

        {/* Footer info */}
        <div className="mt-12 pt-6 border-t border-muted/20 text-center">
          <p className="text-[9px] font-mono text-muted-foreground/30 uppercase tracking-[0.4em]">
            FLASH_SYSTEM_RECOVERY_MODE
          </p>
        </div>
      </motion.div>
    </div>
  );
}
