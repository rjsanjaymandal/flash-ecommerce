"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { X, Check } from "lucide-react";
import { useState } from "react";

interface BulkVariantActionsProps {
  selectedCount: number;
  onUpdateCost: (cost: number) => void;
  onUpdateStock: (stock: number) => void;
  onClearSelection: () => void;
}

export function BulkVariantActions({
  selectedCount,
  onUpdateCost,
  onUpdateStock,
  onClearSelection,
}: BulkVariantActionsProps) {
  const [cost, setCost] = useState("");
  const [stock, setStock] = useState("");

  if (selectedCount === 0) return null;

  return (
    <div className="flex items-center space-x-4 p-2 bg-muted/40 rounded-md border animate-in slide-in-from-top-2 overflow-x-auto">
      <div className="flex items-center space-x-2 shrink-0">
        <span className="text-sm font-medium bg-primary/10 text-primary px-2 py-1 rounded-sm">
          {selectedCount} selected
        </span>
        <Button
          variant="ghost"
          size="icon"
          onClick={onClearSelection}
          className="h-6 w-6"
        >
          <X className="h-3 w-3" />
        </Button>
      </div>

      <div className="h-4 w-px bg-border shrink-0" />

      <div className="flex items-center space-x-2 shrink-0">
        <Input
          placeholder="Set Cost"
          value={cost}
          onChange={(e) => setCost(e.target.value)}
          className="h-8 w-24 text-xs"
          type="number"
        />
        <Button
          size="sm"
          variant="secondary"
          disabled={!cost}
          className="h-8 px-2"
          onClick={() => {
            onUpdateCost(Number(cost));
            setCost("");
          }}
        >
          Apply
        </Button>
      </div>

      <div className="flex items-center space-x-2 shrink-0">
        <Input
          placeholder="Set Stock"
          value={stock}
          onChange={(e) => setStock(e.target.value)}
          className="h-8 w-24 text-xs"
          type="number"
        />
        <Button
          size="sm"
          variant="secondary"
          disabled={!stock}
          className="h-8 px-2"
          onClick={() => {
            onUpdateStock(Number(stock));
            setStock("");
          }}
        >
          Apply
        </Button>
      </div>
    </div>
  );
}
