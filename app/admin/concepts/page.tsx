import { getConcepts } from "@/lib/services/concept-service";
import { ConceptsClient } from "@/components/admin/concepts/concepts-client";

export default async function ConceptsPage() {
  const concepts = await getConcepts();

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <ConceptsClient initialConcepts={concepts || []} />
    </div>
  );
}
