"use client";

import { useState } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import {
  addColorAction,
  updateColorAction,
  deleteColorAction,
} from "@/app/actions/color-actions";
import { ProductColor } from "@/lib/services/color-service";

interface ColorsClientProps {
  initialColors: ProductColor[];
}

export default function ColorsClient({ initialColors }: ColorsClientProps) {
  const [colors, setColors] = useState<ProductColor[]>(initialColors);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [editingColor, setEditingColor] = useState<ProductColor | null>(null);

  // Form states
  const [name, setName] = useState("");
  const [hexCode, setHexCode] = useState("#000000");

  const handleOpenAdd = () => {
    setEditingColor(null);
    setName("");
    setHexCode("#000000");
    setIsOpen(true);
  };

  const handleOpenEdit = (color: ProductColor) => {
    setEditingColor(color);
    setName(color.name);
    setHexCode(color.hex_code);
    setIsOpen(true);
  };

  const handleSubmit = async () => {
    if (!name || !hexCode) {
      toast.error("Please fill in all fields");
      return;
    }

    setIsLoading(true);
    try {
      if (editingColor) {
        const result = await updateColorAction(editingColor.id, name, hexCode);
        if (result.error || !result.data) {
          toast.error(result.error || "Failed to update color");
        } else {
          const updatedColor = result.data as ProductColor;
          setColors(
            colors.map((c) => (c.id === editingColor.id ? updatedColor : c)),
          );
          toast.success("Color updated successfully");
          setIsOpen(false);
        }
      } else {
        const result = await addColorAction(name, hexCode);
        if (result.error || !result.data) {
          toast.error(result.error || "Failed to add color");
        } else {
          const newColor = result.data as ProductColor;
          setColors(
            [...colors, newColor].sort((a, b) => a.name.localeCompare(b.name)),
          );
          toast.success("Color added successfully");
          setIsOpen(false);
        }
      }
    } catch {
      toast.error("Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this color?")) return;

    try {
      const result = await deleteColorAction(id);
      if (result.error) {
        toast.error(result.error);
      } else {
        setColors(colors.filter((c) => c.id !== id));
        toast.success("Color deleted successfully");
      }
    } catch {
      toast.error("Failed to delete color");
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={handleOpenAdd} className="gap-2">
          <Plus className="h-4 w-4" /> Add Color
        </Button>
      </div>

      <div className="rounded-md border border-slate-700/50 bg-slate-900/50 overflow-hidden">
        <Table>
          <TableHeader className="bg-slate-800/50">
            <TableRow className="hover:bg-transparent border-slate-700">
              <TableHead className="w-[100px] text-slate-300">Swatch</TableHead>
              <TableHead className="text-slate-300">Name</TableHead>
              <TableHead className="text-slate-300">Hex Code</TableHead>
              <TableHead className="text-right text-slate-300">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {colors.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={4}
                  className="h-24 text-center text-muted-foreground"
                >
                  No colors found.
                </TableCell>
              </TableRow>
            ) : (
              colors.map((color) => (
                <TableRow
                  key={color.id}
                  className="hover:bg-slate-800/30 border-slate-800"
                >
                  <TableCell>
                    <div
                      className="h-8 w-8 rounded-full border border-slate-700 ring-2 ring-slate-900 ring-offset-1"
                      style={{ backgroundColor: color.hex_code }}
                    />
                  </TableCell>
                  <TableCell className="font-medium text-slate-200">
                    {color.name}
                  </TableCell>
                  <TableCell className="font-mono text-xs text-slate-400 capitalize">
                    {color.hex_code}
                  </TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleOpenEdit(color)}
                      className="hover:bg-slate-700/50 text-slate-400 hover:text-white"
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(color.id)}
                      className="hover:bg-red-500/10 text-slate-400 hover:text-red-500"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-[425px] bg-slate-900 border-slate-800">
          <DialogHeader>
            <DialogTitle className="text-white">
              {editingColor ? "Edit Color" : "Add New Color"}
            </DialogTitle>
            <DialogDescription className="text-slate-400">
              Set the name and hex code for the color variant.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right text-slate-300">
                Name
              </Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="col-span-3 bg-slate-950 border-slate-800 text-white"
                placeholder="e.g. Navy Blue"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="hex" className="text-right text-slate-300">
                Hex Code
              </Label>
              <div className="col-span-3 flex gap-2">
                <Input
                  id="hex"
                  type="text"
                  value={hexCode}
                  onChange={(e) => setHexCode(e.target.value)}
                  className="bg-slate-950 border-slate-800 text-white flex-1"
                  placeholder="#000000"
                />
                <div
                  className="h-10 w-10 shrink-0 rounded border border-slate-800"
                  style={{ backgroundColor: hexCode }}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              type="submit"
              onClick={handleSubmit}
              disabled={isLoading}
              className="bg-indigo-600 hover:bg-indigo-500 text-white"
            >
              {isLoading ? "Saving..." : "Save Color"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
