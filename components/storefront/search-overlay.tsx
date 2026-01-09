"use client";

import { useState, useEffect, useRef } from "react";
import { X, Search, ChevronRight, Loader2, ShoppingBag } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import FlashImage from "@/components/ui/flash-image";
import { formatCurrency, cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

// Inline Debounce Hook
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);
  return debouncedValue;
}

interface SearchResult {
  id: string; // UUID from database
  name: string;
  slug: string;
  price: number;
  main_image_url: string | null;
  category_name?: string;
}

interface SearchOverlayProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SearchOverlay({ isOpen, onClose }: SearchOverlayProps) {
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebounce(query, 300);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const supabase = createClient();

  // Prevent body scroll and Focus Input
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      setTimeout(() => inputRef.current?.focus(), 100);
    } else {
      document.body.style.overflow = "unset";
      setQuery("");
      setResults([]);
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  // Execute Search
  useEffect(() => {
    const search = async () => {
      if (!debouncedQuery.trim()) {
        setResults([]);
        return;
      }

      setIsLoading(true);
      try {
        const { data, error } = await supabase.rpc("search_products_v2", {
          query_text: debouncedQuery,
          limit_val: 8,
        });

        if (error) {
          console.error("Search RPC Error:", error);
          // Fallback or empty results strictly to prevent crash
          setResults([]);
        } else {
          setResults(data || []);
        }
      } catch (err) {
        console.error("Search Fail:", err);
      } finally {
        setIsLoading(false);
      }
    };

    search();
  }, [debouncedQuery]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] bg-background/95 backdrop-blur-3xl flex flex-col cursor-pointer"
          onClick={onClose}
        >
          {/* Header */}
          <div
            className="sticky top-0 z-10 border-b border-border/50 bg-background/50 backdrop-blur-md px-4 py-4 md:px-8 md:py-6 cursor-default"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="max-w-3xl mx-auto flex items-center gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-0 top-1/2 -translate-y-1/2 h-6 w-6 text-muted-foreground" />
                <Input
                  ref={inputRef}
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="WHAT ARE YOU LOOKING FOR?"
                  className="w-full bg-transparent border-0 border-b-2 border-transparent focus:border-primary text-xl md:text-3xl font-black uppercase tracking-tight placeholder:text-muted-foreground/30 focus:ring-0 px-10 py-2 h-auto rounded-none shadow-none focus-visible:ring-0"
                />
                {isLoading && (
                  <Loader2 className="absolute right-0 top-1/2 -translate-y-1/2 h-5 w-5 animate-spin text-primary" />
                )}
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="rounded-full h-12 w-12 hover:bg-destructive/10 hover:text-destructive transition-colors shrink-0"
              >
                <X className="h-6 w-6" />
              </Button>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-4 md:p-8 cursor-pointer">
            <div
              className="max-w-3xl mx-auto space-y-8 cursor-default"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Default State: Trending */}
              {!query && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <div className="space-y-3">
                    <h3 className="text-xs font-black uppercase tracking-widest text-muted-foreground">
                      Trending Now
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {/* Hardcoded trending for now, can be dynamic later */}
                      {[
                        "Oversized Tees",
                        "Hoodies",
                        "Cargo Pants",
                        "New Drops",
                      ].map((term) => (
                        <button
                          key={term}
                          onClick={() => setQuery(term)}
                          className="px-4 py-2 rounded-full bg-secondary/50 border border-transparent hover:border-primary/20 hover:bg-secondary text-sm font-medium transition-all"
                        >
                          {term}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Results State */}
              {query && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-black uppercase tracking-widest text-muted-foreground">
                      {results.length} Results
                    </h3>
                  </div>

                  {results.length > 0 ? (
                    <div className="grid grid-cols-1 gap-2">
                      {results.map((product) => (
                        <Link
                          key={product.id}
                          href={`/product/${product.slug}`}
                          onClick={onClose}
                          className="group flex items-center gap-4 p-3 rounded-2xl hover:bg-secondary/40 transition-all border border-transparent hover:border-border/50"
                        >
                          <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-muted border border-border/50 group-hover:scale-105 transition-transform duration-500">
                            {product.main_image_url ? (
                              <FlashImage
                                src={product.main_image_url}
                                alt={product.name}
                                fill
                                className="object-cover"
                              />
                            ) : (
                              <div className="h-full w-full flex items-center justify-center bg-secondary">
                                <ShoppingBag className="h-6 w-6 text-muted-foreground/20" />
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="text-lg font-bold truncate group-hover:text-primary transition-colors">
                              {product.name}
                            </h4>
                            <div className="flex items-center gap-2 mt-1">
                              {product.category_name && (
                                <span className="text-[10px] font-black uppercase px-1.5 py-0.5 rounded bg-secondary text-muted-foreground">
                                  {product.category_name}
                                </span>
                              )}
                              <p className="text-sm font-black text-foreground">
                                {formatCurrency(product.price)}
                              </p>
                            </div>
                          </div>
                          <div className="h-10 w-10 rounded-full border border-border/50 flex items-center justify-center opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all shadow-sm">
                            <ChevronRight className="h-5 w-5 text-muted-foreground" />
                          </div>
                        </Link>
                      ))}
                    </div>
                  ) : (
                    !isLoading && (
                      <div className="flex flex-col items-center justify-center py-20 text-center opacity-60">
                        <ShoppingBag className="h-12 w-12 mb-4 text-muted-foreground" />
                        <p className="text-lg font-medium">No matches found</p>
                        <p className="text-sm text-muted-foreground">
                          Try "Shirt" or "Pants"
                        </p>
                      </div>
                    )
                  )}
                </div>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
