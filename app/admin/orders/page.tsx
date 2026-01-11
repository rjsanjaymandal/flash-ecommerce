import { getOrders } from "@/lib/services/order-service";
import { OrdersClient } from "./orders-client";

export const revalidate = 0;

export default async function OrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; q?: string; status?: string }>;
}) {
  const params = await searchParams;
  const page = Number(params.page) || 1;
  const search = params.q || "";
  const status = params.status || "all";

  const { data: orders, meta } = await getOrders({
    page,
    search,
    status,
    limit: 10,
  });

  return (
    <OrdersClient
      initialOrders={orders}
      meta={meta}
      status={status as string}
    />
  );
}
