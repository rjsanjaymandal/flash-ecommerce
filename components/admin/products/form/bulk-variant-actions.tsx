"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { X, Check, Trash2 } from "lucide-react";
import { useState } from "react";

interface BulkVariantActionsProps {
  selectedCount: number;
  onUpdateCost: (cost: number) => void;
  onUpdateStock: (stock: number) => void;
  onDelete: () => void;
  onClearSelection: () => void;
}

export function BulkVariantActions({
  selectedCount,
  onUpdateCost,
  onUpdateStock,
  onDelete,
  onClearSelection,
}: BulkVariantActionsProps) {
  const [cost, setCost] = useState("");
  const [stock, setStock] = useState("");

  if (selectedCount === 0) return null;

  return (
    <div className="flex items-center space-x-4 p-2 bg-zinc-900 text-white rounded-none border-2 border-zinc-900 animate-in slide-in-from-top-2 overflow-x-auto shadow-xl">
      <div className="flex items-center space-x-2 shrink-0">
        <span className="text-[10px] font-mono uppercase tracking-widest bg-white/10 text-white px-2 py-1 rounded-none">
          {selectedCount} selected
        </span>
        <Button
          variant="ghost"
          size="icon"
          onClick={onClearSelection}
          className="h-6 w-6 rounded-none hover:bg-white/10 text-white"
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
          className="h-8 w-24 text-[10px] rounded-none border-white/20 bg-white/5 text-white font-mono"
          type="number"
        />
        <Button
          size="sm"
          variant="outline"
          disabled={!cost}
          className="h-8 px-4 rounded-none border-white/20 hover:bg-white hover:text-black font-mono text-[10px] uppercase tracking-tighter"
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
          className="h-8 w-24 text-[10px] rounded-none border-white/20 bg-white/5 text-white font-mono"
          type="number"
        />
        <Button
          size="sm"
          variant="outline"
          disabled={!stock}
          className="h-8 px-4 rounded-none border-white/20 hover:bg-white hover:text-black font-mono text-[10px] uppercase tracking-tighter"
          onClick={() => {
            onUpdateStock(Number(stock));
            setStock("");
          }}
        >
          Apply
        </Button>
      </div>

      <div className="h-4 w-px bg-white/10 shrink-0" />

      <Button
        size="sm"
        variant="destructive"
        onClick={onDelete}
        className="h-8 px-4 rounded-none font-mono text-[10px] uppercase tracking-widest flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white border-none"
      >
        <Trash2 className="h-3 w-3" />
        Delete Selected
      </Button>
    </div>
  );
}
