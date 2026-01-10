"use client";

import { useEffect, useState } from "react";
import { AlertCircle, Timer } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export function PaymentTimer() {
  const [timeLeft, setTimeLeft] = useState(15 * 60); // 15 minutes in seconds
  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    // Only run on client to avoid hydration mismatch on initial render with dynamic time
    // But for a static 15m start it's fine.
    // Ideally we should persist this start time in localStorage to handle refreshes.

    // Check localStorage
    const savedStart = localStorage.getItem("checkout_timer_start");
    let startTime = savedStart ? parseInt(savedStart) : Date.now();

    if (!savedStart) {
      localStorage.setItem("checkout_timer_start", startTime.toString());
    }

    const interval = setInterval(() => {
      const now = Date.now();
      const elapsed = Math.floor((now - startTime) / 1000);
      const remaining = 15 * 60 - elapsed;

      if (remaining <= 0) {
        setTimeLeft(0);
        setIsExpired(true);
        clearInterval(interval);
      } else {
        setTimeLeft(remaining);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  return (
    <div className="mb-6">
      <AnimatePresence>
        {!isExpired ? (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-3 bg-indigo-50 dark:bg-indigo-950/30 text-indigo-700 dark:text-indigo-300 p-3 rounded-xl border border-indigo-100 dark:border-indigo-900/50"
          >
            <div className="h-8 w-8 rounded-full bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center shrink-0">
              <Timer className="h-4 w-4 animate-pulse" />
            </div>
            <div className="flex-1">
              <p className="text-xs font-bold uppercase tracking-wide opacity-70">
                Stock Reserved For
              </p>
              <p className="font-mono text-lg leading-none font-bold tabular-nums">
                {String(minutes).padStart(2, "0")}:
                {String(seconds).padStart(2, "0")}
              </p>
            </div>
            <div className="text-right text-xs max-w-[120px] hidden sm:block">
              Complete payment before timer expires.
            </div>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex items-center gap-3 bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-300 p-3 rounded-xl border border-red-100 dark:border-red-900/50"
          >
            <div className="h-8 w-8 rounded-full bg-red-100 dark:bg-red-900/50 flex items-center justify-center shrink-0">
              <AlertCircle className="h-4 w-4" />
            </div>
            <div className="flex-1">
              <p className="font-bold text-sm">Reservation Expired</p>
              <p className="text-xs opacity-90">
                Items in your cart may be sold to others.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
