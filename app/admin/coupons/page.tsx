import { Suspense } from "react";
import { getAdminCoupons } from "@/lib/services/admin-coupon-service";
import { CouponListClient } from "./coupon-list-client";
import { requireAdmin } from "@/lib/auth/utils";
import { Separator } from "@/components/ui/separator";

export const metadata = {
  title: "Coupon Management | Flash Admin",
};

export const revalidate = 0; // Ensure fresh data on every load

interface PageProps {
  searchParams: Promise<{
    page?: string;
    search?: string;
  }>;
}

export default async function AdminCouponsPage({ searchParams }: PageProps) {
  // Ensure only admins can access
  await requireAdmin();

  const params = await searchParams;
  const page = Number(params.page) || 1;
  const search = params.search || "";
  const limit = 10;

  const { coupons, totalPages, totalCount } = await getAdminCoupons({
    page,
    limit,
    search,
  });

  return (
    <div className="flex-1 space-y-6 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Coupons</h2>
          <p className="text-muted-foreground">
            Manage discount codes and promotions.
          </p>
        </div>
      </div>
      <Separator />

      <Suspense fallback={<div>Loading coupons...</div>}>
        <CouponListClient
          initialCoupons={coupons}
          totalPages={totalPages}
          totalCount={totalCount}
        />
      </Suspense>
    </div>
  );
}
