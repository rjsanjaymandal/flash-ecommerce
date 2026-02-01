"use client";

import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html lang="en">
      <body className="bg-zinc-950 text-white flex flex-col items-center justify-center min-h-screen p-4 font-mono selection:bg-emerald-500/30">
        <div className="w-full max-w-md p-8 border border-white/10 bg-zinc-900/50 backdrop-blur-xl rounded-2xl shadow-2xl relative overflow-hidden">
          {/* Decorative Elements */}
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-500 via-orange-500 to-red-500 opacity-80" />
          <div className="absolute -left-20 -top-20 w-40 h-40 bg-red-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 text-center">
            <h2 className="text-3xl font-black mb-2 text-red-500 tracking-tighter uppercase italic">
              CRITICAL FAILURE
            </h2>
            <div className="h-px w-full bg-gradient-to-r from-transparent via-white/10 to-transparent my-4" />
            <p className="mb-8 text-zinc-400 text-sm leading-relaxed">
              System diagnostics indicate a catastrophic error in the
              application rendering engine.
            </p>

            <button
              onClick={() => reset()}
              className="group relative px-8 py-3 bg-white text-black font-bold uppercase tracking-widest text-xs hover:bg-zinc-200 transition-all active:scale-95 w-full"
            >
              <span className="relative z-10">Reboot System</span>
              <div className="absolute inset-0 bg-emerald-400 opacity-0 group-hover:opacity-10 transition-opacity" />
            </button>
          </div>
        </div>

        <div className="mt-8 text-[10px] text-zinc-600 uppercase tracking-widest">
          Error Code:{" "}
          <span className="text-zinc-500">
            {error.digest || "UNKNOWN_FATAL"}
          </span>
        </div>
      </body>
    </html>
  );
}
