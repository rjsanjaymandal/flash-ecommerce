"use client";

import { useFormContext } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Save, Loader2 } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface ProductHeaderProps {
  isUploading: boolean;
  isLoading: boolean;
  onDiscard: () => void;
}

export function ProductHeader({
  isUploading,
  isLoading,
  onDiscard,
}: ProductHeaderProps) {
  const {
    watch,
    formState: { isDirty },
  } = useFormContext();
  const status = watch("status");

  return (
    <div className="flex items-center justify-between gap-4">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" asChild>
          <Link href="/admin/products">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div className="flex flex-col gap-1">
          <h1 className="text-xl font-bold tracking-tight flex items-center gap-2">
            {isDirty ? "Unsaved Changes" : "Edit Product"}
            <Badge variant={status === "active" ? "default" : "secondary"}>
              {status || "Draft"}
            </Badge>
          </h1>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Button variant="ghost" type="button" onClick={onDiscard}>
          Discard
        </Button>
        <Button type="submit" disabled={isLoading || isUploading}>
          {isLoading || isUploading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Save Product
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
