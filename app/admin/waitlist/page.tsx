import { Suspense } from "react";
import { getWaitlistSummary } from "@/lib/services/waitlist-admin-service";
import { WaitlistTable } from "@/components/admin/waitlist-table";
import { requireAdmin } from "@/lib/auth/utils";
import { Separator } from "@/components/ui/separator";

export const metadata = {
  title: "Waitlist Management | Flash Admin",
};

export const revalidate = 0;

interface PageProps {
  searchParams: Promise<{
    page?: string;
  }>;
}

export default async function AdminWaitlistPage({ searchParams }: PageProps) {
  await requireAdmin();
  const params = await searchParams;
  const page = Number(params.page) || 1;

  const { data, meta } = await getWaitlistSummary(page);

  return (
    <div className="flex-1 space-y-6 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Waitlist</h2>
          <p className="text-muted-foreground">
            Monitor product demand and export email lists.
          </p>
        </div>
      </div>
      <Separator />

      <Suspense fallback={<div>Loading stats...</div>}>
        <WaitlistTable data={data} meta={meta} />
      </Suspense>
    </div>
  );
}
