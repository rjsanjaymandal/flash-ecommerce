"use client";

import { useState, useEffect } from "react";
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
  Plus,
  Pencil,
  Search,
  MoreHorizontal,
  ArrowUpDown,
  Loader2,
  Package,
  Trash2,
  CheckCircle,
  XCircle,
  AlertTriangle,
  RefreshCw,
  Users,
  Clock,
  Sparkles,
  Layers,
} from "lucide-react";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  bulkDeleteProducts,
  bulkUpdateProductStatus,
  bulkUpdateProductCategory,
  toggleProductCarousel,
} from "@/lib/services/product-service";
import { deleteProductAction } from "@/app/actions/admin/delete-product";
import { getWaitlistUsers } from "@/app/actions/admin-preorder";
import { formatCurrency, calculateDiscount, cn } from "@/lib/utils";
import { useRouter } from "next/navigation";

import { DataTablePagination } from "@/components/ui/data-table-pagination";
import { Checkbox } from "@/components/ui/checkbox";
import { ProductFilters } from "@/components/admin/products/product-filters";
import { Download } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useProductSearch } from "@/hooks/use-product-search";
import { useProductSelection } from "@/hooks/use-product-selection";

interface AdminProduct {
  id: string;
  name: string;
  price: number;
  original_price?: number | null;
  main_image_url: string | null;
  slug: string | null;
  is_active: boolean;
  status?: "active" | "draft" | "archived" | null;
  created_at: string;
  category_id?: string;
  categories?: {
    name: string;
  } | null;
  product_stock?: {
    id: string;
    size: string;
    color: string;
    quantity: number;
  }[];
  is_carousel_featured: boolean;
  preorder_count?: number;
  total_stock?: number;
}

interface WaitlistUser {
  user_id: string;
  email: string;
  created_at: string;
  profiles?: {
    name: string | null;
  };
}

export function ProductsClient({
  initialProducts,
  meta,
}: {
  initialProducts: AdminProduct[];
  meta: { total: number; page: number; limit: number; totalPages: number };
}) {
  const router = useRouter();
  const { selectedIds, toggleSelect, toggleSelectAll, setSelectedIds } =
    useProductSelection();
  const [searchQuery, setSearchQuery] = useState("");
  // Use hook for client-side fuzzy search on the INITIAL products (current page)
  const { search } = useProductSearch({ products: initialProducts });
  const filteredProducts = search(searchQuery);

  const [deleteId, setDeleteId] = useState<string | null>(null);

  // Bulk Selection State
  // const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set()); // Replaced by useProductSelection
  const [isBulkDeleting, setIsBulkDeleting] = useState(false);

  // Waitlist Modal State
  const [waitlistProduct, setWaitlistProduct] = useState<AdminProduct | null>(
    null,
  );
  const [waitlistUsers, setWaitlistUsers] = useState<WaitlistUser[]>([]);
  const [isWaitlistLoading, setIsWaitlistLoading] = useState(false);

  // Clear selection on page change or search
  useEffect(() => {
    setSelectedIds(new Set());
  }, [meta.page, searchQuery, setSelectedIds]);

  // NOTE: Server-side search logic removed/disabled in favor of client-side fuzzy search request.
  // If you wanted HYBRID (Client first, then Server), we'd keep this.
  // For now, we are isolating the "Fuzzy Search" requirement to be purely client-side on the loaded data.
  /*
  useEffect(() => {
    const handler = setTimeout(() => {
        const params = new URLSearchParams(searchParams.toString())
        if (search) {
            params.set('q', search)
            params.set('page', '1') // Reset to page 1 on search
        } else {
            params.delete('q')
        }
        router.replace(`?${params.toString()}`)
    }, 500)
    return () => clearTimeout(handler)
  }, [search, router, searchParams])
  */

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const result = await deleteProductAction(id);
      if (result.error) throw new Error(result.error);
      return result;
    },
    onSuccess: (data) => {
      setDeleteId(null);
      toast.success(data.message || "Product deleted successfully");
      router.refresh();
    },
    onError: (err) => {
      const message = err instanceof Error ? err.message : "Unknown error";
      toast.error("Deletion failed: " + message);
    },
  });

  // Bulk Actions
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const allIds = initialProducts.map((p) => p.id);
      toggleSelectAll(allIds);
    } else {
      setSelectedIds(new Set());
    }
  };

  const handleSelectOne = (id: string, checked: boolean) => {
    toggleSelect(id, checked);
  };

  const handleBulkDelete = async () => {
    setIsBulkDeleting(true);
    try {
      await bulkDeleteProducts(Array.from(selectedIds));
      toast.success(`${selectedIds.size} products deleted`);
      setSelectedIds(new Set());
      router.refresh();
    } catch {
      toast.error("Bulk deletion failed");
    } finally {
      setIsBulkDeleting(false);
    }
  };

  const handleBulkStatus = async (status: "active" | "draft" | "archived") => {
    try {
      await bulkUpdateProductStatus(Array.from(selectedIds), status);
      toast.success(`${selectedIds.size} products updated to ${status}`);
      setSelectedIds(new Set());
      router.refresh();
    } catch {
      toast.error("Bulk update failed");
    }
  };

  const handleBulkCategory = async (categoryId: string) => {
    try {
      await bulkUpdateProductCategory(Array.from(selectedIds), categoryId);
      toast.success(`${selectedIds.size} products re-categorized`);
      setSelectedIds(new Set());
      router.refresh();
    } catch {
      toast.error("Bulk category update failed");
    }
  };

  const handleToggleCarousel = async (product: AdminProduct) => {
    const newStatus = !product.is_carousel_featured;
    const toastId = toast.loading(
      newStatus ? "Adding to Carousel..." : "Removing from Carousel...",
    );
    try {
      await toggleProductCarousel(product.id, newStatus);
      toast.success(
        newStatus
          ? "Product featured in Carousel"
          : "Product removed from Carousel",
        { id: toastId },
      );
      router.refresh();
    } catch {
      toast.error("An error occurred");
    }
  };

  const handleViewWaitlist = async (product: AdminProduct) => {
    setWaitlistProduct(product);
    setIsWaitlistLoading(true);
    setWaitlistUsers([]);
    try {
      const res = await getWaitlistUsers(product.id);
      if (res.error) {
        toast.error(res.error);
      } else {
        setWaitlistUsers(res.data || []);
      }
    } catch {
      toast.error("Failed to load waitlist");
    } finally {
      setIsWaitlistLoading(false);
    }
  };

  // Helper to calculate total stock
  const getStockStatus = (product: AdminProduct) => {
    const total =
      product.total_stock ??
      (product.product_stock?.reduce(
        (acc: number, curr) => acc + (curr.quantity || 0),
        0,
      ) ||
        0);

    if (total === 0)
      return {
        label: "Out of Stock",
        variant: "destructive" as const,
        count: 0,
      };
    if (total < 10)
      return {
        label: "Low Stock",
        variant: "secondary" as const,
        count: total,
        className:
          "bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100",
      };
    return {
      label: "In Stock",
      variant: "outline" as const,
      count: total,
      className:
        "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100",
    };
  };
  // Calculate items with total stock < 10
  const lowStockProducts = initialProducts.filter((p) => {
    const total =
      p.total_stock ??
      (p.product_stock?.reduce(
        (acc: number, curr) => acc + (curr.quantity || 0),
        0,
      ) ||
        0);
    return total < 10 && total > 0;
  });

  const outOfStockProducts = initialProducts.filter((p) => {
    const total =
      p.total_stock ??
      (p.product_stock?.reduce(
        (acc: number, curr) => acc + (curr.quantity || 0),
        0,
      ) ||
        0);
    return total === 0;
  });

  // ... existing code ...

  const handleExportCSV = () => {
    const headers = ["ID", "Name", "Price", "Stock", "Status", "Waitlist"];
    const rows = initialProducts.map((p) => [
      p.id,
      `"${p.name.replace(/"/g, '""')}"`, // Escape quotes
      p.price,
      p.total_stock ??
        (p.product_stock?.reduce((acc, s) => acc + s.quantity, 0) || 0),
      p.status || (p.is_active ? "active" : "draft"),
      p.preorder_count || 0,
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map((r) => r.join(",")),
    ].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute(
      "download",
      `products_export_${new Date().toISOString().split("T")[0]}.csv`,
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Extract unique categories for filter
  const categories = Array.from(
    new Set(
      initialProducts.map((p) =>
        JSON.stringify({ id: p.category_id, name: p.categories?.name }),
      ),
    ),
  )
    .map((s) => JSON.parse(s))
    .filter((c) => c.id);

  return (
    <div className="space-y-6 relative">
      {(lowStockProducts.length > 0 || outOfStockProducts.length > 0) && (
        <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded-r-lg mb-6 flex items-start gap-3 shadow-sm animate-in fade-in slide-in-from-left-2">
          <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="flex-1">
            <h3 className="text-sm font-black uppercase tracking-tight text-amber-900">
              Inventory Intelligence
            </h3>
            <p className="text-xs text-amber-700 mt-1 font-medium italic">
              {lowStockProducts.length > 0 &&
                `${lowStockProducts.length} items are running low on stock. `}
              {outOfStockProducts.length > 0 &&
                `${outOfStockProducts.length} items are completely out of stock.`}
              Consider resting soon to avoid missing sales.
            </p>
          </div>
          <Button
            size="sm"
            variant="ghost"
            className="h-7 text-xs font-black uppercase tracking-widest text-amber-900 hover:bg-amber-100"
            asChild
          >
            <Link href="?status=low">Restock Now</Link>
          </Button>
        </div>
      )}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between px-1">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-foreground">
            Products
          </h2>
          <p className="text-sm text-muted-foreground">
            Manage your clothing inventory and stock levels.
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            className="h-9 gap-2"
            onClick={handleExportCSV}
          >
            <Download className="h-4 w-4" />
            Export CSV
          </Button>
          <Button
            asChild
            className="bg-primary text-primary-foreground shadow-sm hover:bg-primary/90 rounded-lg h-9 text-sm font-medium"
          >
            <Link href="/admin/products/new">
              <Plus className="mr-2 h-4 w-4" />
              Add Product
            </Link>
          </Button>
        </div>
      </div>

      <div className="flex items-center gap-3 p-1">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search loaded products..."
            className="pl-9 h-9 bg-background focus-visible:ring-offset-0 focus-visible:ring-1 border-input"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <ProductFilters categories={categories} />

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              className="gap-2 h-9 text-xs font-medium text-muted-foreground hover:text-foreground"
            >
              <ArrowUpDown className="h-3.5 w-3.5" />
              Sort
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Sort By</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => router.push("?sort=newest")}>
              Newest
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => router.push("?sort=trending")}>
              Trending
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => router.push("?sort=waitlist_desc")}
            >
              Most Anticipated (Waitlist)
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => router.push("?sort=price_asc")}>
              Price: Low to High
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => router.push("?sort=price_desc")}>
              Price: High to Low
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <Button
          variant="ghost"
          className="gap-2 h-9 text-xs font-medium text-muted-foreground hover:text-primary border border-dashed"
          onClick={async () => {
            const toastId = toast.loading("Optimizing legacy images...");
            try {
              const res = await fetch("/api/admin/optimize-legacy", {
                method: "POST",
              });
              const data = await res.json();
              if (!res.ok) throw new Error(data.error);
              toast.success(
                `Processed ${data.processed_count} images. ${data.remaining_count} remaining.`,
                { id: toastId },
              );
              router.refresh();
            } catch (err) {
              const message =
                err instanceof Error ? err.message : "Unknown error";
              toast.error("Optimization failed: " + message, {
                id: toastId,
              });
            }
          }}
        >
          <RefreshCw className="h-3.5 w-3.5" />
          Optimize Images
        </Button>
      </div>

      {/* Floating Action Bar */}
      {selectedIds.size > 0 && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 flex items-center gap-4 bg-background border border-border p-2 px-6 rounded-full shadow-2xl animate-in fade-in slide-in-from-bottom-4">
          <div className="text-sm font-medium flex items-center gap-2 border-r pr-4 mr-2">
            <CheckCircle className="h-4 w-4 text-emerald-500" />
            <span className="tabular-nums font-bold">{selectedIds.size}</span>
            <span className="text-muted-foreground hidden sm:inline">
              Selected
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              className="h-8 text-xs border-dashed gap-1 hover:border-primary/50"
              onClick={() => handleBulkStatus("active")}
            >
              <div className="h-2 w-2 rounded-full bg-emerald-500" />
              Active
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="h-8 text-xs border-dashed gap-1 hover:border-primary/50"
              onClick={() => handleBulkStatus("draft")}
            >
              <div className="h-2 w-2 rounded-full bg-slate-400" />
              Draft
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="h-8 text-xs border-dashed gap-1 hover:border-primary/50 text-amber-600 hover:text-amber-700"
              onClick={() => handleBulkStatus("archived")}
            >
              <div className="h-2 w-2 rounded-full bg-amber-500" />
              Archive
            </Button>
            <div className="w-px h-4 bg-border mx-1" />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  size="sm"
                  variant="outline"
                  className="h-8 text-xs border-dashed gap-1 hover:border-primary/50"
                >
                  <Layers className="h-3 w-3" />
                  Category
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="center" className="w-48">
                <DropdownMenuLabel className="text-[10px] uppercase font-bold">
                  Assign Category
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                {categories.map((cat) => (
                  <DropdownMenuItem
                    key={cat.id}
                    onClick={() => handleBulkCategory(cat.id)}
                    className="text-xs"
                  >
                    {cat.name}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
            <div className="w-px h-4 bg-border mx-1" />
            <Button
              size="sm"
              variant="destructive"
              className="h-8 text-xs gap-1 shadow-sm"
              onClick={handleBulkDelete}
              disabled={isBulkDeleting}
            >
              {isBulkDeleting ? (
                <Loader2 className="h-3 w-3 animate-spin" />
              ) : (
                <Trash2 className="h-3 w-3" />
              )}
              Delete ({selectedIds.size})
            </Button>
            <Button
              size="icon"
              variant="ghost"
              className="h-8 w-8 ml-1 rounded-full text-muted-foreground hover:bg-muted"
              onClick={() => setSelectedIds(new Set())}
            >
              <XCircle className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/30 hover:bg-muted/30 border-b border-border/50">
              <TableHead className="w-[40px] px-4">
                <Checkbox
                  checked={
                    initialProducts.length > 0 &&
                    selectedIds.size === initialProducts.length
                  }
                  onCheckedChange={(checked) =>
                    handleSelectAll(checked as boolean)
                  }
                  aria-label="Select all"
                />
              </TableHead>
              <TableHead className="w-[80px] py-4 pl-0">Image</TableHead>
              <TableHead className="py-4">
                <div className="flex items-center gap-2 cursor-pointer hover:text-primary transition-colors text-xs font-bold uppercase tracking-wider text-muted-foreground/80">
                  Name <ArrowUpDown className="h-3 w-3" />
                </div>
              </TableHead>
              <TableHead className="py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground/80">
                Category
              </TableHead>
              <TableHead className="py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground/80">
                Stock
              </TableHead>
              <TableHead className="py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground/80 text-center">
                Carousel
              </TableHead>
              <TableHead className="py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground/80">
                Price
              </TableHead>
              <TableHead className="py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground/80">
                Waitlist
              </TableHead>
              <TableHead className="py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground/80">
                Status
              </TableHead>
              <TableHead className="py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground/80">
                <div
                  className="flex items-center gap-2 cursor-pointer hover:text-primary transition-colors"
                  onClick={() => router.push(`?sort=newest`)}
                >
                  {/* Note: Simply sorting by newest/created for now as detailed asc/desc toggle requires URL state mgmt complexity. Defaulting to a quick 'Newest' sort trigger for UX */}
                  Created <ArrowUpDown className="h-3 w-3" />
                </div>
              </TableHead>
              <TableHead className="text-right py-4 pr-4 text-xs font-bold uppercase tracking-wider text-muted-foreground/80">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredProducts.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={10}
                  className="text-center py-24 text-muted-foreground"
                >
                  No products found.
                </TableCell>
              </TableRow>
            ) : (
              filteredProducts.map((product) => {
                const stockStatus = getStockStatus(product);
                const isSelected = selectedIds.has(product.id);
                const preorderCount = product.preorder_count || 0;

                return (
                  <TableRow
                    key={product.id}
                    className={cn(
                      "group transition-all duration-300 border-b last:border-0 text-sm hover:bg-muted/40",
                      isSelected && "bg-primary/5 hover:bg-primary/10",
                      product.is_carousel_featured &&
                        "bg-amber-500/[0.02] border-l-2 border-l-amber-500/50",
                    )}
                  >
                    <TableCell className="px-4 align-middle">
                      <Checkbox
                        checked={isSelected}
                        onCheckedChange={(checked) =>
                          handleSelectOne(product.id, checked as boolean)
                        }
                        aria-label="Select row"
                      />
                    </TableCell>
                    <TableCell className="p-4 pl-0 align-middle">
                      {product.main_image_url ? (
                        <div className="h-12 w-12 relative rounded-lg overflow-hidden border shadow-sm transition-transform hover:scale-105">
                          <FlashImage
                            src={product.main_image_url}
                            alt={product.name}
                            fill
                            className="object-cover"
                          />
                        </div>
                      ) : (
                        <div className="h-12 w-12 rounded-lg bg-muted flex items-center justify-center text-muted-foreground text-xs border border-dashed">
                          <Package className="h-4 w-4 opacity-50" />
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="font-medium align-middle">
                      <div className="font-semibold text-foreground">
                        {product.name}
                      </div>
                    </TableCell>
                    <TableCell className="align-middle">
                      <Badge
                        variant="secondary"
                        className="font-medium rounded-md text-[10px] bg-secondary/50 text-secondary-foreground hover:bg-secondary/70"
                      >
                        {product.categories?.name || "Uncategorized"}
                      </Badge>
                    </TableCell>
                    <TableCell className="align-middle">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div className="flex items-center gap-2 cursor-help w-fit">
                            <Badge
                              variant={stockStatus.variant}
                              className={cn(
                                "px-2 py-0.5 rounded-full text-[10px] font-semibold border shadow-sm",
                                stockStatus.className,
                              )}
                            >
                              {stockStatus.label}
                            </Badge>
                            <span className="text-xs text-muted-foreground font-mono">
                              {stockStatus.count}
                            </span>
                          </div>
                        </TooltipTrigger>
                        <TooltipContent className="bg-popover text-popover-foreground text-xs rounded-md border shadow-xl p-3 z-50">
                          <div className="font-semibold mb-2 border-b pb-1 border-border/50">
                            Stock Breakdown
                          </div>
                          <div className="grid grid-cols-2 gap-2 min-w-[150px]">
                            {product.product_stock?.length ? (
                              product.product_stock.map(
                                (s: {
                                  id: string;
                                  size: string;
                                  color: string;
                                  quantity: number;
                                }) => (
                                  <div
                                    key={s.id}
                                    className="flex justify-between items-center bg-secondary/30 px-2 py-1 rounded"
                                  >
                                    <span className="font-medium text-[10px] uppercase">
                                      {s.size}
                                    </span>
                                    <span
                                      className={cn(
                                        "font-mono font-bold",
                                        s.quantity < 3 ? "text-red-500" : "",
                                      )}
                                    >
                                      {s.quantity}
                                    </span>
                                  </div>
                                ),
                              )
                            ) : (
                              <span className="col-span-2 text-muted-foreground italic">
                                No breakdown available
                              </span>
                            )}
                          </div>
                        </TooltipContent>
                      </Tooltip>
                    </TableCell>
                    <TableCell className="align-middle text-center">
                      {product.is_carousel_featured ? (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div className="flex justify-center">
                              <div className="p-2 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 shadow-sm animate-in zoom-in-50 duration-500">
                                <Sparkles className="h-4 w-4" />
                              </div>
                            </div>
                          </TooltipTrigger>
                          <TooltipContent>
                            Featured in Home Carousel
                          </TooltipContent>
                        </Tooltip>
                      ) : (
                        <div className="flex justify-center opacity-10 group-hover:opacity-40 transition-opacity">
                          <Sparkles className="h-4 w-4 text-muted-foreground" />
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="align-middle">
                      <div className="flex flex-col">
                        <span className="font-semibold text-foreground">
                          {formatCurrency(product.price)}
                        </span>
                        {calculateDiscount(
                          product.price,
                          product.original_price,
                        ) && (
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <span className="text-[10px] text-muted-foreground/60 line-through">
                              {formatCurrency(product.original_price)}
                            </span>
                            <span className="text-[9px] font-black text-red-500 uppercase bg-red-50 px-1 rounded">
                              -
                              {calculateDiscount(
                                product.price,
                                product.original_price,
                              )}
                              %
                            </span>
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="align-middle">
                      <div
                        className={cn(
                          "flex items-center gap-1.5 px-2.5 py-1 rounded-full w-fit text-xs font-medium border transition-colors cursor-pointer",
                          preorderCount > 0
                            ? "bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100 hover:border-blue-300"
                            : "bg-transparent text-muted-foreground border-transparent hover:bg-muted",
                        )}
                        onClick={() => handleViewWaitlist(product)}
                      >
                        <Users className="h-3 w-3" />
                        {preorderCount}
                      </div>
                    </TableCell>
                    <TableCell className="align-middle">
                      <div className="flex items-center gap-1.5">
                        <span className={cn("relative flex h-2 w-2")}>
                          <span
                            className={cn(
                              "animate-ping absolute inline-flex h-full w-full rounded-full opacity-75",
                              product.status === "active"
                                ? "bg-emerald-400"
                                : "hidden",
                            )}
                          ></span>
                          <span
                            className={cn(
                              "relative inline-flex rounded-full h-2 w-2",
                              product.status === "active"
                                ? "bg-emerald-500"
                                : product.status === "archived"
                                  ? "bg-amber-500"
                                  : "bg-slate-300",
                            )}
                          ></span>
                        </span>
                        <span className="text-xs text-muted-foreground font-medium capitalize">
                          {product.status ||
                            (product.is_active ? "active" : "draft")}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="align-middle">
                      <div className="flex items-center gap-1 text-xs text-muted-foreground/70">
                        <Clock className="h-3 w-3" />
                        {format(new Date(product.created_at), "MMM dd, yyyy")}
                      </div>
                    </TableCell>
                    <TableCell className="text-right align-middle pr-4">
                      <div className="flex items-center justify-end gap-1 transition-opacity">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-primary hover:bg-primary/10"
                          asChild
                        >
                          <Link href={`/admin/products/${product.id}`}>
                            <Pencil className="h-3.5 w-3.5" />
                          </Link>
                        </Button>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-muted"
                            >
                              <MoreHorizontal className="h-3.5 w-3.5" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-40">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem asChild>
                              <Link
                                href={`/product/${product.slug}`}
                                target="_blank"
                                className="flex items-center cursor-pointer"
                              >
                                <div className="w-4 mr-2">↗</div> View in Store
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleToggleCarousel(product)}
                              className="flex items-center cursor-pointer text-amber-600 dark:text-amber-400 focus:text-amber-700 font-bold"
                            >
                              <Sparkles className="h-4 w-4 mr-2" />
                              {product.is_carousel_featured
                                ? "Remove from Carousel"
                                : "Feature in Carousel"}
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="text-destructive focus:text-destructive cursor-pointer group/delete"
                              onClick={() => setDeleteId(product.id)}
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>

        {/* Pagination Controls */}
        <div className="border-t p-4 bg-muted/5 flex items-center justify-between">
          <div className="text-xs text-muted-foreground">
            Showing {filteredProducts.length} results (from{" "}
            {initialProducts.length} loaded)
          </div>
          <DataTablePagination
            totalItems={meta.total}
            itemsPerPage={meta.limit}
          />
        </div>
      </div>

      <AlertDialog
        open={!!deleteId}
        onOpenChange={(open) => !open && setDeleteId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Product?</AlertDialogTitle>
            <AlertDialogDescription>
              {`This will permanently delete "${initialProducts.find((p) => p.id === deleteId)?.name}".`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteId && deleteMutation.mutate(deleteId)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Waitlist Modal */}
      <Dialog
        open={!!waitlistProduct}
        onOpenChange={(open) => !open && setWaitlistProduct(null)}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Waitlist for {waitlistProduct?.name}</DialogTitle>
            <DialogDescription>
              Users who have requested a pre-order notification.
            </DialogDescription>
          </DialogHeader>
          <div className="mt-4 max-h-[300px] overflow-y-auto space-y-3">
            {isWaitlistLoading ? (
              <div className="flex items-center justify-center py-8 text-muted-foreground">
                <Loader2 className="h-6 w-6 animate-spin" />
              </div>
            ) : waitlistUsers.length > 0 ? (
              waitlistUsers.map((user) => (
                <div
                  key={user.user_id}
                  className="flex items-center gap-3 p-3 rounded-lg border bg-muted/20"
                >
                  <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs uppercase">
                    {user.profiles?.name?.[0] || "U"}
                  </div>
                  <div className="flex-1 overflow-hidden">
                    <p className="text-sm font-medium truncate">
                      {user.profiles?.name || "Unknown User"}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {user.email}
                    </p>
                  </div>
                  <div className="text-xs text-muted-foreground whitespace-nowrap flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {new Date(user.created_at).toLocaleDateString()}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Users className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>No users on the waitlist yet.</p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
      <AlertDialog
        open={!!deleteId}
        onOpenChange={(open) => !open && setDeleteId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              product and remove all associated data including images, stock,
              and reviews.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => deleteId && deleteMutation.mutate(deleteId)}
            >
              {deleteMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete Permanent"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
