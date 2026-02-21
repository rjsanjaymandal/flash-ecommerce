"use client";

import { AuthProvider } from "@/context/auth-context";
import { CartDrawer } from "@/components/storefront/cart-drawer";
import { StoreSync } from "@/components/store-sync";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { User, Session } from "@supabase/supabase-js";
import { useState } from "react";
import { Toaster } from "sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "next-themes";

export function Providers({
  children,
  initialUser,
  initialSession,
  initialProfile,
}: {
  children: React.ReactNode;
  initialUser?: User | null;
  initialSession?: Session | null;
  initialProfile?: any; // Profile type can be complex, keeping any for now or defining it if needed
}) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // Enterprise Defaults: Data is considered fresh for 1 minute
            staleTime: 60 * 1000,
            // Keep unused data in cache for 5 minutes
            gcTime: 5 * 60 * 1000,
            // Prevent aggressive refetches on window focus in production
            refetchOnWindowFocus: false,
            // Smart retries for failed network requests
            retry: (failureCount, error: any) => {
              if (error?.status === 404 || error?.status === 401) return false;
              return failureCount < 2;
            },
          },
        },
      }),
  );

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider
        attribute="class"
        defaultTheme="light"
        enableSystem
        disableTransitionOnChange
      >
        <AuthProvider
          initialUser={initialUser}
          initialSession={initialSession}
          initialProfile={initialProfile}
        >
          <TooltipProvider>
            <StoreSync />
            {children}
            <Toaster position="top-center" richColors />
            <CartDrawer />
          </TooltipProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
