"use client";

import * as React from "react";
import { Moon, Sun, Sparkles, Monitor } from "lucide-react";
import { useTheme } from "next-themes";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

export function ModeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const options = [
    { id: "light", label: "Atelier", icon: Sun },
    { id: "dark", label: "Cyber", icon: Moon },
  ];

  return (
    <div className="flex items-center gap-0.5 p-1 bg-secondary/50 backdrop-blur-xl border border-border/40 rounded-full shadow-inner">
      {options.map((option) => {
        const Icon = option.icon;
        const isActive = theme === option.id;

        return (
          <button
            key={option.id}
            onClick={() => setTheme(option.id)}
            className={cn(
              "relative h-8 w-8 rounded-full transition-all flex items-center justify-center group sm:h-9 sm:w-9",
              isActive
                ? "text-primary-foreground"
                : "text-muted-foreground hover:text-foreground hover:bg-white/5",
            )}
            title={option.label}
          >
            {isActive && (
              <motion.div
                layoutId="active-theme-pill"
                className="absolute inset-0 bg-primary rounded-full shadow-md"
                transition={{ type: "spring", bounce: 0.15, duration: 0.5 }}
              />
            )}

            <Icon
              className={cn(
                "h-4 w-4 relative z-10 transition-transform duration-300 sm:h-4.5 sm:w-4.5",
                isActive
                  ? "scale-110 rotate-0"
                  : "group-hover:scale-110 opacity-70",
              )}
            />
          </button>
        );
      })}
    </div>
  );
}
