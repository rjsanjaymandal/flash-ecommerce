import { Suspense } from "react";
import { getWaitlistEmails } from "@/lib/services/waitlist-admin-service";
import { WaitlistExportClient } from "./waitlist-export-client";
import { requireAdmin } from "@/lib/auth/utils";
import { Separator } from "@/components/ui/separator";
import { createClient } from "@/lib/supabase/server";

export const revalidate = 0;

interface PageProps {
  params: Promise<{
    productId: string;
  }>;
}

export default async function AdminWaitlistDetailPage({ params }: PageProps) {
  await requireAdmin();
  const { productId } = await params;

  // Fetch product name for header
  const supabase = await createClient();
  const { data: product } = await supabase
    .from("products")
    .select("name")
    .eq("id", productId)
    .single();

  const emails = await getWaitlistEmails(productId);

  return (
    <div className="flex-1 space-y-6 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">
            Waitlist: {product?.name || "Product"}
          </h2>
          <p className="text-muted-foreground">
            {emails.length} customers waiting.
          </p>
        </div>
      </div>
      <Separator />

      <Suspense fallback={<div>Loading data...</div>}>
        <WaitlistExportClient
          data={emails}
          productName={product?.name || "waitlist-export"}
        />
      </Suspense>
    </div>
  );
}
