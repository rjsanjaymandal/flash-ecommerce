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
          className="fixed top-0 left-0 right-0 z-50 bg-black text-white px-4 py-3 shadow-2xl flex items-center justify-between lg:pl-[280px]" // Account for sidebar width
        >
          <div className="container mx-auto max-w-5xl flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <AlertCircle className="h-4 w-4 text-yellow-400" />
              <span className="font-medium text-sm">Unsaved changes</span>
            </div>

            <div className="flex items-center space-x-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={onDiscard}
                disabled={isLoading}
                className="text-white hover:text-white hover:bg-white/10"
              >
                Discard
              </Button>
              <Button
                size="sm"
                onClick={onSave}
                disabled={isLoading}
                className="bg-green-600 hover:bg-green-700 text-white border-none shadow-none"
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
