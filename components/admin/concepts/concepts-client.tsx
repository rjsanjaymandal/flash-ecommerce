"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Search, Vote, Trash2, Edit } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ConceptDialog } from "./concept-dialog";
import { deleteConcept } from "@/lib/services/concept-service";
import { toast } from "sonner";
import { format } from "date-fns";
import FlashImage from "@/components/ui/flash-image";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export function ConceptsClient({
  initialConcepts,
}: {
  initialConcepts: any[];
}) {
  const [concepts, setConcepts] = useState(initialConcepts);
  const [search, setSearch] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingConcept, setEditingConcept] = useState<any>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Filter logic
  const filteredConcepts = concepts.filter(
    (c) =>
      c.title.toLowerCase().includes(search.toLowerCase()) ||
      c.description?.toLowerCase().includes(search.toLowerCase()),
  );

  const handleDelete = async () => {
    if (!deletingId) return;
    try {
      await deleteConcept(deletingId);
      setConcepts(concepts.filter((c) => c.id !== deletingId));
      toast.success("Concept deleted");
    } catch {
      toast.error("Failed to delete concept");
    } finally {
      setDeletingId(null);
    }
  };

  const openEdit = (concept: any) => {
    setEditingConcept(concept);
    setIsDialogOpen(true);
  };

  const openNew = () => {
    setEditingConcept(null);
    setIsDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Future Lab</h1>
          <p className="text-muted-foreground">
            Manage product concepts and voting.
          </p>
        </div>
        <Button onClick={openNew} className="gap-2">
          <Plus className="h-4 w-4" />
          New Concept
        </Button>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search concepts..."
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredConcepts.map((concept) => (
          <Card key={concept.id} className="group overflow-hidden">
            <div className="aspect-video w-full bg-muted relative overflow-hidden">
              {concept.image_url ? (
                <FlashImage
                  src={concept.image_url}
                  alt={concept.title}
                  fill
                  className="object-cover transition-transform group-hover:scale-105"
                />
              ) : (
                <div className="flex items-center justify-center h-full text-muted-foreground/20">
                  <Vote className="h-12 w-12" />
                </div>
              )}
              <div className="absolute top-2 right-2 flex gap-2">
                <Badge
                  variant="secondary"
                  className="bg-background/80 backdrop-blur-sm"
                >
                  {concept.status}
                </Badge>
              </div>
            </div>
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <CardTitle className="text-lg line-clamp-1">
                  {concept.title}
                </CardTitle>
              </div>
              <p className="text-xs text-muted-foreground">
                Created {format(new Date(concept.created_at), "MMM d, yyyy")}
              </p>
            </CardHeader>
            <CardContent className="pb-2">
              <div className="flex-1 space-y-1 p-2 rounded-lg bg-muted/30 min-h-10">
                {concept.description || "No description provided."}
              </div>
              <div className="mt-4 flex items-center gap-2">
                <div className="h-2 flex-1 bg-secondary rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary transition-all duration-500"
                    style={{
                      width: `${Math.min(100, (concept.vote_count / concept.vote_goal) * 100)}%`,
                    }}
                  />
                </div>
                <span className="text-xs font-medium w-12 text-right">
                  {concept.vote_count}/{concept.vote_goal}
                </span>
              </div>
            </CardContent>
            <CardFooter className="flex justify-end gap-2 pt-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => openEdit(concept)}
              >
                <Edit className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="text-destructive hover:text-destructive hover:bg-destructive/10"
                onClick={() => setDeletingId(concept.id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      <ConceptDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        concept={editingConcept}
        onSuccess={() => {
          /* Ideally refetch or optimistic update handled by parent/props */
        }}
      />

      <AlertDialog
        open={!!deletingId}
        onOpenChange={(open) => !open && setDeletingId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete &quot;
              {concepts.find((c) => c.id === deletingId)?.title}&quot; and all
              its votes.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
