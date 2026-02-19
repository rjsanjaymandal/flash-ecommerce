"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Plus,
  MoreHorizontal,
  Trash2,
  FlaskConical,
  CheckCircle2,
  Clock,
  Rocket,
  Image as ImageIcon,
} from "lucide-react";
import { ConceptForm } from "@/components/admin/concept-form";
import {
  deleteConcept,
  updateConceptStatus,
} from "@/app/actions/admin/manage-concepts";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import FlashImage from "@/components/ui/flash-image";

interface Concept {
  id: string;
  title: string;
  description: string;
  image_url: string;
  vote_count: number;
  vote_goal: number;
  status: "voting" | "approved" | "launched";
  created_at: string;
}

export function ConceptsClient({ concepts }: { concepts: Concept[] }) {
  const router = useRouter();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!deleteId) return;
    setIsDeleting(true);
    try {
      const result = await deleteConcept(deleteId);
      if (result.success) {
        toast.success("Concept deleted successfully");
        router.refresh();
      } else {
        toast.error(result.error || "Failed to delete concept");
      }
    } catch {
      toast.error("Failed to fetch concepts");
    } finally {
      setIsDeleting(false);
      setDeleteId(null);
    }
  };

  const handleStatusChange = async (
    id: string,
    status: "voting" | "approved" | "launched",
  ) => {
    const toastId = toast.loading(`Updating status to ${status}...`);
    try {
      const result = await updateConceptStatus(id, status);
      if (result.success) {
        toast.success("Status updated successfully", { id: toastId });
        router.refresh();
      } else {
        toast.error(result.error || "Failed to update status", { id: toastId });
      }
    } catch {
      toast.error("An unexpected error occurred", { id: toastId });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-3xl font-black tracking-tighter uppercase flex items-center gap-3">
            <FlaskConical className="h-8 w-8 text-primary" />
            Future Lab{" "}
            <span className="text-muted-foreground font-light">Management</span>
          </h2>
          <p className="text-muted-foreground">
            Validate demand by managing concept drops and voting goals.
          </p>
        </div>

        <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
          <DialogTrigger asChild>
            <Button className="font-bold gap-2 shadow-lg shadow-primary/20">
              <Plus className="h-5 w-5" />
              New Concept
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Create New Concept</DialogTitle>
              <DialogDescription>
                Add a new experimental product to the Future Lab. Users will be
                able to vote on it instantly.
              </DialogDescription>
            </DialogHeader>
            <ConceptForm onSuccess={() => setIsFormOpen(false)} />
          </DialogContent>
        </Dialog>
      </div>

      <div className="rounded-2xl border bg-card/50 backdrop-blur-md shadow-xl overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50 hover:bg-muted/50">
              <TableHead className="w-[100px] py-5">Mockup</TableHead>
              <TableHead>Concept Details</TableHead>
              <TableHead>Goal Progress</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right pr-6">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {concepts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-64 text-center">
                  <div className="flex flex-col items-center justify-center text-muted-foreground gap-2">
                    <FlaskConical className="h-10 w-10 opacity-20" />
                    <p className="font-medium">No concepts found in the lab.</p>
                    <Button variant="link" onClick={() => setIsFormOpen(true)}>
                      Create your first drop
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              concepts.map((concept) => {
                const progress = Math.min(
                  Math.round((concept.vote_count / concept.vote_goal) * 100),
                  100,
                );

                return (
                  <TableRow
                    key={concept.id}
                    className="group hover:bg-muted/30 transition-colors"
                  >
                    <TableCell className="py-4">
                      {concept.image_url ? (
                        <div className="relative h-16 w-16 overflow-hidden rounded-xl border-2 border-muted shadow-sm group-hover:scale-105 transition-transform">
                          <FlashImage
                            src={concept.image_url}
                            alt={concept.title}
                            fill
                            resizeMode="cover"
                            className="object-cover"
                          />
                        </div>
                      ) : (
                        <div className="h-16 w-16 rounded-xl bg-muted flex items-center justify-center">
                          <ImageIcon className="h-6 w-6 text-muted-foreground opacity-50" />
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="font-bold text-lg leading-tight">
                          {concept.title}
                        </div>
                        <div className="text-sm text-muted-foreground line-clamp-1 max-w-[300px] italic">
                          {concept.description}
                        </div>
                        <div className="flex items-center gap-2 text-[10px] text-muted-foreground uppercase font-bold tracking-widest mt-1">
                          <Clock className="h-3 w-3" />
                          Created{" "}
                          {format(new Date(concept.created_at), "MMM dd, yyyy")}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="w-[200px]">
                      <div className="space-y-2">
                        <div className="flex justify-between text-xs font-bold">
                          <span className="text-primary">{progress}%</span>
                          <span className="text-muted-foreground">
                            {concept.vote_count}/{concept.vote_goal}
                          </span>
                        </div>
                        <Progress value={progress} className="h-1.5" />
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={cn(
                          "uppercase text-[10px] font-black tracking-widest px-2 py-1 rounded-md border-2",
                          concept.status === "voting"
                            ? "text-blue-500 border-blue-500/20 bg-blue-500/5"
                            : concept.status === "approved"
                              ? "text-emerald-500 border-emerald-500/20 bg-emerald-500/5"
                              : "text-purple-500 border-purple-500/20 bg-purple-500/5",
                        )}
                      >
                        {concept.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right pr-6">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 hover:bg-muted"
                          >
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                          <DropdownMenuLabel>Manage Concept</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() =>
                              handleStatusChange(concept.id, "voting")
                            }
                            className="gap-2"
                          >
                            <Clock className="h-4 w-4 text-blue-500" /> Mark as
                            Voting
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() =>
                              handleStatusChange(concept.id, "approved")
                            }
                            className="gap-2"
                          >
                            <CheckCircle2 className="h-4 w-4 text-emerald-500" />{" "}
                            Mark as Approved
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() =>
                              handleStatusChange(concept.id, "launched")
                            }
                            className="gap-2"
                          >
                            <Rocket className="h-4 w-4 text-purple-500" /> Mark
                            as Launched
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-destructive focus:text-destructive gap-2"
                            onClick={() => setDeleteId(concept.id)}
                          >
                            <Trash2 className="h-4 w-4" /> Delete Concept
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      <AlertDialog
        open={!!deleteId}
        onOpenChange={(open) => !open && setDeleteId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              concept drop and all its associated votes from the Future Lab.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={isDeleting}
            >
              {isDeleting ? "Deleting..." : "Confirm Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
