import {
  getActiveConcepts,
  getUserVotes,
} from "@/lib/services/concept-service";
import { LabClient } from "@/components/storefront/lab-client";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Future Lab | Flash",
  description: "Vote on upcoming concepts. Shape the future of fashion.",
};

export default async function FutureLabPage() {
  const concepts = await getActiveConcepts();
  const userVotes = await getUserVotes();

  return (
    <div className="min-h-screen bg-background">
      <LabClient concepts={concepts || []} userVotes={userVotes || []} />
    </div>
  );
}
