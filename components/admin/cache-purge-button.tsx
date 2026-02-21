"use client";

import { useState } from "react";
import { purgeStorefrontCache } from "@/lib/services/product-service";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { toast } from "sonner";
import { RefreshCcw, Loader2, ShieldAlert } from "lucide-react";

export function CachePurgeButton() {
  const [isPurging, setIsPurging] = useState(false);

  const handlePurge = async () => {
    if (
      !confirm(
        "Are you sure? This will force a refresh of all storefront data. This is typically used to fix 'ghost products' or stale content.",
      )
    ) {
      return;
    }

    setIsPurging(true);
    try {
      const result = await purgeStorefrontCache();
      if (result.success) {
        toast.success(
          "Storefront cache purged successfully. The site will now show the latest database state.",
        );
      } else {
        toast.error(result.error || "Failed to purge cache");
      }
    } catch (error) {
      toast.error("An unexpected error occurred while purging cache");
    } finally {
      setIsPurging(false);
    }
  };

  return (
    <Card className="rounded-none border-2 border-amber-900/20 bg-amber-500/5">
      <CardHeader>
        <div className="flex items-center gap-2 mb-1">
          <ShieldAlert className="h-4 w-4 text-amber-600" />
          <CardTitle className="text-sm font-black uppercase tracking-tighter">
            Maintenance & Sync
          </CardTitle>
        </div>
        <CardDescription className="text-xs font-mono uppercase tracking-widest text-amber-900/60 leading-relaxed">
          Force refresh the storefront cache to resolve synchronization issues
          or persistent deleted items.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Button
          variant="outline"
          onClick={handlePurge}
          disabled={isPurging}
          className="w-full rounded-none border-2 border-amber-900/40 font-mono text-[10px] uppercase tracking-[0.2em] h-11 hover:bg-amber-900 hover:text-white transition-all group"
        >
          {isPurging ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <RefreshCcw className="mr-2 h-3 w-3 group-hover:rotate-180 transition-transform duration-500" />
          )}
          Purge Storefront Cache
        </Button>
      </CardContent>
    </Card>
  );
}
