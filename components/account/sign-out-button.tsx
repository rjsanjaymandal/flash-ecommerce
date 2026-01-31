"use client";

import { useAuth } from "@/context/auth-context";
import { Button } from "@/components/ui/button";
import { LogOut, Loader2 } from "lucide-react";
import { useState } from "react";

export function SignOutButton() {
  const { signOut } = useAuth();
  const [loading, setLoading] = useState(false);

  const handleSignOut = async () => {
    try {
      setLoading(true);
      await signOut();
    } catch (error) {
      console.error("Sign out handling failed", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      onClick={handleSignOut}
      disabled={loading}
      variant="outline"
      className="md:h-14 h-12 rounded-full px-6 md:px-10 uppercase tracking-widest text-[10px] md:text-xs font-black shadow-xl shrink-0 bg-red-500/5 hover:bg-red-500/10 text-red-500 border-red-500/20 hover:border-red-500/40 transition-all gap-2"
    >
      {loading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <LogOut className="h-4 w-4" />
      )}
      {loading ? "TERMINATING..." : "TERMINATE SESSION"}
    </Button>
  );
}
