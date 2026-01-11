"use client";

import { useState, useEffect, useCallback } from "react";
import {
  X,
  Search as SearchIcon,
  Loader2,
  ArrowRight,
  TrendingUp,
  History,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { searchProducts } from "@/app/actions/search-products"; // Uses RPC
import Link from "next/link";
import FlashImage from "@/components/ui/flash-image";
import { useDebounce } from "@/hooks/use-debounce";
// Assuming useDebounce exists, if not I'll implement a local one or create the hook.
// I'll stick to local timeout for safety in this snippet if hook isn't guaranteed.

interface SearchOverlayProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SearchOverlay({ isOpen, onClose }: SearchOverlayProps) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);

  // Load recents
  useEffect(() => {
    const saved = localStorage.getItem("recent_searches");
    if (saved) setRecentSearches(JSON.parse(saved).slice(0, 4));
  }, []);

  const addToRecents = (term: string) => {
    if (!term) return;
    const updated = [term, ...recentSearches.filter((s) => s !== term)].slice(
      0,
      4
    );
    setRecentSearches(updated);
    localStorage.setItem("recent_searches", JSON.stringify(updated));
  };

  const handleSearch = useCallback(async (searchTerm: string) => {
    if (!searchTerm.trim()) {
      setResults([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    try {
      const data = await searchProducts(searchTerm);
      setResults(data);
    } catch (error) {
      console.error("Search failed", error);
    } finally {
      setIsSearching(false);
    }
  }, []);

  // Debounce logic
  useEffect(() => {
    const timer = setTimeout(() => {
      handleSearch(query);
    }, 300);
    return () => clearTimeout(timer);
  }, [query, handleSearch]);

  const onSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!query) return;
    addToRecents(query);
    onClose();
    router.push(`/shop?search=${encodeURIComponent(query)}`);
  };

  // Close on Escape
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [onClose]);

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-start justify-center bg-background/95 backdrop-blur-xl pt-20 px-4"
    >
      <div className="w-full max-w-2xl relative">
        <Button
          variant="ghost"
          size="icon"
          className="absolute -right-4 -top-12 md:-right-12 text-muted-foreground hover:text-foreground"
          onClick={onClose}
        >
          <X className="h-6 w-6" />
        </Button>

        <form onSubmit={onSubmit} className="relative mb-8">
          <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-6 w-6 text-muted-foreground" />
          <Input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search products, collections, vibes..."
            className="w-full h-16 pl-14 pr-4 text-xl md:text-2xl font-bold bg-transparent border-0 border-b-2 border-primary/20 focus-visible:ring-0 focus-visible:border-primary rounded-none placeholder:text-muted-foreground/50"
          />
          {isSearching && (
            <div className="absolute right-4 top-1/2 -translate-y-1/2">
              <Loader2 className="h-5 w-5 animate-spin text-primary" />
            </div>
          )}
        </form>

        <div className="min-h-[300px]">
          <AnimatePresence mode="wait">
            {query.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="grid grid-cols-1 md:grid-cols-2 gap-8"
              >
                <div>
                  <h3 className="text-sm font-black uppercase tracking-widest text-muted-foreground mb-4 flex items-center gap-2">
                    <History className="h-4 w-4" /> Recent
                  </h3>
                  <div className="space-y-2">
                    {recentSearches.length > 0 ? (
                      recentSearches.map((term) => (
                        <button
                          key={term}
                          onClick={() => setQuery(term)}
                          className="block w-full text-left py-2 text-lg font-medium hover:text-primary hover:translate-x-2 transition-all"
                        >
                          {term}
                        </button>
                      ))
                    ) : (
                      <p className="text-muted-foreground text-sm italic">
                        No recent searches
                      </p>
                    )}
                  </div>
                </div>
                <div>
                  <h3 className="text-sm font-black uppercase tracking-widest text-muted-foreground mb-4 flex items-center gap-2">
                    <TrendingUp className="h-4 w-4" /> Trending Now
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {[
                      "Oversized Tees",
                      "Cargo Pants",
                      "Best Sellers",
                      "New Arrivals",
                    ].map((tag) => (
                      <button
                        key={tag}
                        onClick={() => setQuery(tag)}
                        className="px-4 py-2 rounded-full border border-border hover:border-primary hover:bg-primary/5 hover:text-primary transition-all text-sm font-bold uppercase tracking-wide"
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-2"
              >
                {results.length > 0 ? (
                  <div className="space-y-4">
                    <h3 className="text-sm font-black uppercase tracking-widest text-muted-foreground mb-2">
                      Top Results
                    </h3>
                    {results.map((product) => (
                      <Link
                        key={product.id}
                        href={`/product/${product.slug}`}
                        onClick={() => {
                          addToRecents(query);
                          onClose();
                        }}
                        className="flex items-center gap-4 p-3 rounded-xl hover:bg-accent/50 transition-colors group"
                      >
                        <div className="h-16 w-16 relative overflow-hidden rounded-lg bg-muted">
                          {product.main_image_url && (
                            <FlashImage
                              src={product.main_image_url}
                              fill
                              className="object-cover"
                              alt={product.name}
                            />
                          )}
                        </div>
                        <div className="flex-1">
                          <h4 className="font-bold text-lg group-hover:text-primary transition-colors">
                            {product.name}
                          </h4>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-muted-foreground">
                              ₹{product.price}
                            </span>
                            {product.rank > 0.1 && (
                              <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full font-bold uppercase">
                                Best Match
                              </span>
                            )}
                          </div>
                        </div>
                        <ArrowRight className="h-5 w-5 opacity-0 -translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-primary" />
                      </Link>
                    ))}
                    <Button
                      className="w-full mt-4 font-bold uppercase tracking-widest"
                      size="lg"
                      onClick={() => onSubmit()}
                    >
                      View All Results for &quot;{query}&quot;
                    </Button>
                  </div>
                ) : (
                  !isSearching && (
                    <div className="text-center py-12">
                      <p className="text-xl font-bold text-muted-foreground">
                        No matches found for &quot;{query}&quot;
                      </p>
                      <p className="text-sm text-muted-foreground mt-2">
                        Try checking for typos or using broader terms.
                      </p>
                    </div>
                  )
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}
