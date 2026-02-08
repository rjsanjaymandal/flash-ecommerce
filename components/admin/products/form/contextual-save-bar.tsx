"use client";

import { useFormContext } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Save, Loader2, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";

interface ContextualSaveBarProps {
  onSave: () => void;
  onDiscard: () => void;
  isLoading: boolean;
}

export function ContextualSaveBar({
  onSave,
  onDiscard,
  isLoading,
}: ContextualSaveBarProps) {
  const {
    formState: { isDirty },
  } = useFormContext();
  const [show, setShow] = useState(false);

  // Debounce the showing to prevent flickering on initial load
  useEffect(() => {
    if (isDirty) {
      setShow(true);
    } else {
      setShow(false);
    }
  }, [isDirty]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -100, opacity: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="fixed top-0 left-0 right-0 z-50 bg-black text-white px-4 py-3 shadow-2xl flex items-center justify-between lg:pl-[280px] border-b border-white/10" // Account for sidebar width
        >
          <div className="container mx-auto max-w-5xl flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <AlertCircle className="h-4 w-4 text-yellow-400" />
              <span className="font-mono text-[10px] uppercase tracking-tighter">
                Unsaved changes detected
              </span>
            </div>

            <div className="flex items-center space-x-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={onDiscard}
                disabled={isLoading}
                className="text-white hover:text-white hover:bg-white/10 rounded-none uppercase text-[10px] font-bold tracking-widest"
              >
                Discard
              </Button>
              <Button
                size="sm"
                onClick={onSave}
                disabled={isLoading}
                className="bg-white hover:bg-neutral-200 text-black border-none shadow-none rounded-none uppercase text-[10px] font-bold tracking-widest px-6"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving
                  </>
                ) : (
                  <>Save</>
                )}
              </Button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
