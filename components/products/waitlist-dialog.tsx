"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface WaitlistDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (email: string) => Promise<void>;
  isSubmitting: boolean;
  initialEmail?: string;
}

export function WaitlistDialog({
  open,
  onOpenChange,
  onSubmit,
  isSubmitting,
  initialEmail = "",
}: WaitlistDialogProps) {
  const [email, setEmail] = useState(initialEmail);

  // Update email state if initialEmail changes (e.g. loaded from localStorage later)
  useEffect(() => {
    if (initialEmail) setEmail(initialEmail);
  }, [initialEmail]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Allow empty email (Anonymous join)
    await onSubmit(email);
    // Don't clear email if they provided it, so they remember. If empty, keep empty.
    if (!email) setEmail("");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md rounded-none border-foreground/10 bg-background">
        <DialogHeader className="space-y-4">
          <DialogTitle className="text-2xl font-serif text-center">
            Join the list
          </DialogTitle>
          <DialogDescription className="text-[10px] uppercase tracking-[0.3em] text-center text-muted-foreground">
            Enter your email to be notified when this item is available.
            <br />
            <span className="opacity-70 mt-2 block">
              You can also join anonymously.
            </span>
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-8 py-6">
          <div className="space-y-4">
            <Label
              htmlFor="email"
              className="text-[10px] uppercase tracking-[0.2em] font-medium text-foreground/60"
            >
              Email (Optional)
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="EMAIL ADDRESS"
              className="rounded-none border-foreground/10 bg-transparent focus:border-foreground/30 transition-colors text-[11px] tracking-widest h-12"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full h-12 bg-foreground text-background rounded-none text-[10px] uppercase tracking-[0.3em] font-medium hover:opacity-90 transition-opacity"
            >
              {isSubmitting ? "Joining..." : "Notify Me"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
