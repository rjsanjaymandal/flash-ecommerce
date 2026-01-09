import { getCoupons } from "@/lib/services/coupon-service";
import { CouponsClient } from "./coupons-client";

export const revalidate = 0;

export default async function CouponsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; q?: string }>;
}) {
  const params = await searchParams;
  const page = Number(params.page) || 1;
  const search = params.q || "";

  const { data: coupons, meta } = await getCoupons(page, 10, search);

  return <CouponsClient initialCoupons={coupons as any} meta={meta} />;
}
