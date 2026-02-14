"use client";

import * as React from "react";
import {
  Calculator,
  Calendar,
  CreditCard,
  Settings,
  Smile,
  User,
  Search,
  ShoppingCart,
  Package,
  Home,
  LayoutDashboard,
  Layers,
  ShoppingBag,
  Bell,
  Activity,
  LogOut,
  ExternalLink,
} from "lucide-react";

import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "@/components/ui/command";
import { useRouter } from "next/navigation";
import { globalAdminSearch } from "@/app/actions/admin-search";
import { useDebounce } from "use-debounce";
import { useAuth } from "@/context/auth-context";

export function AdminCommandPalette() {
  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState("");
  const [debouncedQuery] = useDebounce(query, 300);
  const [results, setResults] = React.useState<{
    products: any[];
    orders: any[];
  }>({
    products: [],
    orders: [],
  });
  const [isLoading, setIsLoading] = React.useState(false);
  const router = useRouter();
  const { signOut } = useAuth();

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  React.useEffect(() => {
    if (debouncedQuery.length < 2) {
      setResults({ products: [], orders: [] });
      return;
    }

    const performSearch = async () => {
      setIsLoading(true);
      const data = await globalAdminSearch(debouncedQuery);
      setResults(data);
      setIsLoading(false);
    };

    performSearch();
  }, [debouncedQuery]);

  const runCommand = React.useCallback((command: () => void) => {
    setOpen(false);
    command();
  }, []);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex h-9 w-full items-center justify-between rounded-md border border-input bg-muted/50 px-3 py-2 text-sm text-muted-foreground shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground sm:w-64 lg:w-80"
      >
        <div className="flex items-center gap-2">
          <Search className="h-4 w-4" />
          <span>Search command...</span>
        </div>
        <kbd className="pointer-events-none hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 sm:flex">
          <span className="text-xs">⌘</span>K
        </kbd>
      </button>

      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput
          placeholder="Type a command or search..."
          onValueChange={setQuery}
        />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>

          {query.length < 2 && (
            <>
              <CommandGroup heading="Quick Nav">
                <CommandItem
                  onSelect={() => runCommand(() => router.push("/admin"))}
                >
                  <LayoutDashboard className="mr-2 h-4 w-4" />
                  <span>Dashboard</span>
                </CommandItem>
                <CommandItem
                  onSelect={() =>
                    runCommand(() => router.push("/admin/orders"))
                  }
                >
                  <ShoppingCart className="mr-2 h-4 w-4" />
                  <span>Orders</span>
                </CommandItem>
                <CommandItem
                  onSelect={() =>
                    runCommand(() => router.push("/admin/products"))
                  }
                >
                  <ShoppingBag className="mr-2 h-4 w-4" />
                  <span>Products</span>
                </CommandItem>
              </CommandGroup>
              <CommandSeparator />
              <CommandGroup heading="System">
                <CommandItem
                  onSelect={() =>
                    runCommand(() => router.push("/admin/settings"))
                  }
                >
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Settings</span>
                </CommandItem>
                <CommandItem
                  onSelect={() =>
                    runCommand(() => router.push("/admin/health"))
                  }
                >
                  <Activity className="mr-2 h-4 w-4" />
                  <span>System Health</span>
                </CommandItem>
                <CommandItem onSelect={() => runCommand(() => signOut())}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Sign Out</span>
                </CommandItem>
              </CommandGroup>
            </>
          )}

          {results.products.length > 0 && (
            <CommandGroup heading="Products">
              {results.products.map((p) => (
                <CommandItem
                  key={p.id}
                  value={p.name}
                  onSelect={() =>
                    runCommand(() => router.push(`/admin/products/${p.id}`))
                  }
                >
                  <Package className="mr-2 h-4 w-4" />
                  <span>{p.name}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          )}

          {results.orders.length > 0 && (
            <CommandGroup heading="Orders">
              {results.orders.map((o) => (
                <CommandItem
                  key={o.id}
                  value={o.id}
                  onSelect={() =>
                    runCommand(() => router.push(`/admin/orders/${o.id}`))
                  }
                >
                  <ShoppingCart className="mr-2 h-4 w-4" />
                  <span>
                    Order #{o.id.slice(0, 8)} - {o.shipping_name}
                  </span>
                </CommandItem>
              ))}
            </CommandGroup>
          )}
        </CommandList>
      </CommandDialog>
    </>
  );
}
