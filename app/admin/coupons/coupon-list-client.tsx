"use client";

import { useState } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  MoreHorizontal,
  Plus,
  Search,
  Loader2,
  Ticket,
  Calendar,
  AlertCircle,
} from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Coupon } from "@/lib/services/admin-coupon-service";
import { deleteCoupon, updateCoupon } from "@/app/actions/coupon-actions";
import { toast } from "sonner";
import { CouponForm } from "./coupon-form";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface CouponListClientProps {
  initialCoupons: Coupon[];
  totalPages: number;
  totalCount: number;
}

export function CouponListClient({
  initialCoupons,
  totalPages,
  totalCount,
}: CouponListClientProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState(
    searchParams.get("search") || "",
  );
  const [selectedCoupon, setSelectedCoupon] = useState<Coupon | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);

  // Debounced Search Handler
  const handleSearch = (term: string) => {
    setSearchTerm(term);
    const params = new URLSearchParams(searchParams);
    if (term) {
      params.set("search", term);
    } else {
      params.delete("search");
    }
    params.set("page", "1"); // Reset to page 1 on search
    router.push(`${pathname}?${params.toString()}`);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this coupon?")) return;

    setIsLoading(true);
    try {
      const res = await deleteCoupon(id);
      if (res.error) {
        toast.error(res.error);
      } else {
        toast.success("Coupon deleted successfully");
        router.refresh();
      }
    } catch (error) {
      toast.error("An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleActive = async (coupon: Coupon) => {
    setIsLoading(true);
    try {
      // We only need to send the fields required by UpdateCoupon,
      // but the service takes the FormValues.
      // We can construct a partial update logic or just send the full object if compatible.
      // For simplicity/safety, let's map it correctly.
      const res = await updateCoupon(coupon.id, {
        code: coupon.code,
        discount_type: coupon.discount_type,
        value: coupon.value,
        active: !coupon.active, // Toggle
        min_order_amount: coupon.min_order_amount || 0,
        max_uses: coupon.max_uses,
        expires_at: coupon.expires_at,
      });

      if (res.error) {
        toast.error(res.error);
      } else {
        toast.success(`Coupon ${!coupon.active ? "activated" : "deactivated"}`);
        router.refresh();
      }
    } catch (error) {
      toast.error("Failed to toggle status");
    } finally {
      setIsLoading(false);
    }
  };

  const openEdit = (coupon: Coupon) => {
    setSelectedCoupon(coupon);
    setIsFormOpen(true);
  };

  const openCreate = () => {
    setSelectedCoupon(null);
    setIsFormOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search coupons..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
          />
        </div>
        <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
          <Button onClick={openCreate} className="w-full sm:w-auto gap-2">
            <Plus className="h-4 w-4" /> Create Coupon
          </Button>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>
                {selectedCoupon ? "Edit Coupon" : "Create New Coupon"}
              </DialogTitle>
              <DialogDescription>
                {selectedCoupon
                  ? "Update the details of this discount code."
                  : "Create a new discount code for your customers."}
              </DialogDescription>
            </DialogHeader>
            <CouponForm
              initialData={selectedCoupon || undefined}
              onSuccess={() => {
                setIsFormOpen(false);
                router.refresh();
              }}
            />
          </DialogContent>
        </Dialog>
      </div>

      <div className="rounded-md border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Code</TableHead>
              <TableHead>Discount</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Usage</TableHead>
              <TableHead>Expires</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {initialCoupons.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="h-24 text-center text-muted-foreground"
                >
                  No coupons found.
                </TableCell>
              </TableRow>
            ) : (
              initialCoupons.map((coupon) => (
                <TableRow key={coupon.id}>
                  <TableCell className="font-medium font-mono text-base">
                    {coupon.code}
                  </TableCell>
                  <TableCell>
                    <div className="font-bold">
                      {coupon.discount_type === "percentage"
                        ? `${coupon.value}% OFF`
                        : `${formatCurrency(coupon.value)} OFF`}
                    </div>
                    {coupon.min_order_amount && coupon.min_order_amount > 0 && (
                      <div className="text-xs text-muted-foreground">
                        Min: {formatCurrency(coupon.min_order_amount)}
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={coupon.active ? "default" : "secondary"}
                      className={
                        coupon.active
                          ? "bg-green-500/10 text-green-500 hover:bg-green-500/20 shadow-none border-green-500/20"
                          : ""
                      }
                    >
                      {coupon.active ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1 text-sm">
                      <Ticket className="h-3 w-3 text-muted-foreground" />
                      <span>{coupon.used_count || 0}</span>
                      {coupon.max_uses && (
                        <span className="text-muted-foreground">
                          / {coupon.max_uses}
                        </span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    {coupon.expires_at ? (
                      <div className="flex items-center gap-1 text-sm">
                        <Calendar className="h-3 w-3 text-muted-foreground" />
                        {new Date(coupon.expires_at) < new Date() ? (
                          <span className="text-destructive font-bold">
                            Expired
                          </span>
                        ) : (
                          formatDate(coupon.expires_at)
                        )}
                      </div>
                    ) : (
                      <span className="text-muted-foreground text-xs">
                        Never
                      </span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Open menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem
                          onClick={() =>
                            navigator.clipboard.writeText(coupon.code)
                          }
                        >
                          Copy Code
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => openEdit(coupon)}>
                          Edit Details
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleToggleActive(coupon)}
                        >
                          {coupon.active ? "Deactivate" : "Activate"}
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-destructive focus:text-destructive"
                          onClick={() => handleDelete(coupon.id)}
                        >
                          Delete Coupon
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
