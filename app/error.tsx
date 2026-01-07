"use client";

import { useEffect, useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { AlertCircle, RotateCcw, Bug } from "lucide-react";
import { reportError } from "./actions/system";
import { toast } from "sonner";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const [isPending, startTransition] = useTransition();
  const [refId, setRefId] = useState<string | null>(null);

  useEffect(() => {
    // Log the error to console
    console.error("Global Application Error:", error);
  }, [error]);

  const handleReport = () => {
    startTransition(async () => {
      const res = await reportError(
        error.message,
        "GLOBAL_ERROR_BOUNDARY",
        error.stack
      );
      if (res.success) {
        setRefId(res.referenceId!);
        toast.success("Error report submitted");
      } else {
        toast.error("Failed to submit report");
      }
    });
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] px-4 text-center">
      <div className="h-24 w-24 rounded-full bg-destructive/10 flex items-center justify-center mb-6 animate-in zoom-in-50 duration-500">
        <AlertCircle className="h-10 w-10 text-destructive" />
      </div>

      <h2 className="text-3xl font-black uppercase tracking-tighter mb-3">
        Something went wrong!
      </h2>
      <p className="text-muted-foreground max-w-md mb-8">
        We encountered an unexpected error.
        {refId && (
          <span className="block mt-2 font-mono text-xs bg-muted p-1 rounded">
            Ref: {refId}
          </span>
        )}
      </p>

      <div className="flex gap-4 flex-wrap justify-center">
        <Button
          onClick={() => reset()}
          size="lg"
          className="gap-2 rounded-full font-bold uppercase tracking-widest shadow-lg hover:scale-105 transition-transform"
        >
          <RotateCcw className="h-4 w-4" />
          Try Again
        </Button>

        {!refId ? (
          <Button
            variant="secondary"
            size="lg"
            onClick={handleReport}
            disabled={isPending}
            className="gap-2 rounded-full font-bold uppercase tracking-widest"
          >
            <Bug className="h-4 w-4" />
            {isPending ? "Sending..." : "Report Issue"}
          </Button>
        ) : (
          <Button
            variant="outline"
            size="lg"
            className="rounded-full font-bold uppercase tracking-widest"
            onClick={() => (window.location.href = "/")}
          >
            Go Home
          </Button>
        )}
      </div>
    </div>
  );
}
