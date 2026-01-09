"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { createConcept, updateConcept } from "@/lib/services/concept-service";
import { Loader2 } from "lucide-react";

type Concept = {
  id: string;
  title: string;
  description: string;
  image_url: string;
  status: "voting" | "approved" | "launched";
  vote_goal: number;
};

interface ConceptDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  concept?: Concept | null;
  onSuccess?: () => void;
}

export function ConceptDialog({
  open,
  onOpenChange,
  concept,
  onSuccess,
}: ConceptDialogProps) {
  const [isLoading, setIsLoading] = useState(false);

  // Form State
  // In a real app, use React Hook Form + Zod. For speed here, manual state.
  const [title, setTitle] = useState(concept?.title || "");
  const [description, setDescription] = useState(concept?.description || "");
  const [imageUrl, setImageUrl] = useState(concept?.image_url || "");
  const [status, setStatus] = useState<string>(concept?.status || "voting");
  const [voteGoal, setVoteGoal] = useState(
    concept?.vote_goal?.toString() || "50"
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const data: any = {
        title,
        description,
        image_url: imageUrl,
        status: status,
        vote_goal: parseInt(voteGoal) || 50,
      };

      if (concept) {
        await updateConcept(concept.id, data);
        toast.success("Concept updated");
      } else {
        await createConcept(data);
        toast.success("Concept created");
      }
      onOpenChange(false);
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error(error);
      toast.error("Failed to save concept");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{concept ? "Edit Concept" : "New Concept"}</DialogTitle>
          <DialogDescription>
            {concept
              ? "Modify the details of an existing concept."
              : "Add a new idea to the Future Lab."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              placeholder="e.g. Cyberpunk Jacket"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Short pitch..."
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="image">Image URL</Label>
            <Input
              id="image"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="https://..."
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="status">Status</Label>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="voting">Voting</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="launched">Launched</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="goal">Vote Goal</Label>
              <Input
                id="goal"
                type="number"
                value={voteGoal}
                onChange={(e) => setVoteGoal(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Changes
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
