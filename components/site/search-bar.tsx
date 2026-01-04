"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useDebounce } from "use-debounce";
import { Search, Loader2, X, ArrowRight } from "lucide-react";
import { getSearchIndex } from "@/app/actions/search-products";
import { cn, formatCurrency } from "@/lib/utils";
import { useProductSearch } from "@/hooks/use-product-search";
import { motion, AnimatePresence } from "framer-motion";
import FlashImage from "@/components/ui/flash-image";
import { SearchableProduct } from "@/hooks/use-product-search";

interface SearchOverlayProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SearchOverlay({ isOpen, onClose }: SearchOverlayProps) {
  const [term, setTerm] = useState("");
  const [query] = useDebounce(term, 300);
  const [results, setResults] = useState<SearchableProduct[]>([]);
  const [loading, setLoading] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  // Auto-focus when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  // Clear when closed
  useEffect(() => {
    if (!isOpen) {
      setTerm("");
      setResults([]);
    }
  }, [isOpen]);

  // Search Effect
  // Index State
  const [index, setIndex] = useState<SearchableProduct[]>([]);
  const [isIndexLoaded, setIsIndexLoaded] = useState(false);

  // Logic: Fetch index once on first open
  // Logic: Fetch index once on first open
  useEffect(() => {
    if (isOpen && !isIndexLoaded) {
      console.log("[Search] Fetching search index...");
      setLoading(true);
      getSearchIndex()
        .then((data) => {
          console.log("[Search] Index loaded:", data?.length);
          setIndex(data);
          setIsIndexLoaded(true);
        })
        .catch((err) => {
          console.error("[Search] Failed to load index:", err);
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [isOpen, isIndexLoaded]);

  // Instantiate Fuse Hook
  // We pass the index.
  const { search } = useProductSearch({ products: index });
  // Note: Ensure hook uses 'category_name' if we flattened it, or 'category.name' if object.
  // We flattened it to 'category_name' in the action.
  // We need to update the hook or pass config?
  // The hook has hardcoded keys. I should update the hook to look for 'category_name' too.
  // Actually, I'll update the hook file in next step. For now, this is fine.

  // Search Effect (Client Side)
  useEffect(() => {
    if (!query) {
      setResults([]);
      return;
    }

    // Perfrom Fuzzy Search
    const hits = search(query);
    setResults(hits.slice(0, 8)); // Limit to 8 results
  }, [query, search]);

  const handleClear = () => {
    setTerm("");
    setResults([]);
    inputRef.current?.focus();
  };

  // Handle ESC to close
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [onClose]);

  // Handle click outside to close
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      // If click is NOT inside the search overlay container (input + results), close it.
      // Note: The overlay itself (motion.div) covers the header.
      // Check if click is outside the motion.div?
      // Actually, if the overlay is only h-16, clicking below is outside.
      // So just checking if target is contained in a ref wrapping the whole Overlay component is enough.

      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(event.target as Node)
      ) {
        onClose();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen, onClose]);

  const wrapperRef = useRef<HTMLDivElement>(null);

  const overlayVariants = {
    open: { opacity: 1 },
    closed: { opacity: 0 },
  };

  return (
    <motion.div
      ref={wrapperRef}
      initial="closed"
      animate="open"
      exit="closed"
      variants={overlayVariants}
      className="fixed inset-0 z-[90] flex items-start bg-background/80 backdrop-blur-xl"
    >
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: -20, opacity: 0 }}
        transition={{ type: "spring", damping: 25, stiffness: 200 }}
        className="w-full max-w-7xl mx-auto flex flex-col h-full bg-background/95 backdrop-blur-3xl shadow-2xl relative"
      >
        {/* Search Input Area */}
        <div className="h-20 sm:h-24 flex items-center px-4 sm:px-6 lg:px-8 border-b border-border/40 relative">
          <Search className="h-6 w-6 text-primary mr-4 shrink-0" />

          <input
            ref={inputRef}
            type="text"
            value={term}
            onChange={(e) => setTerm(e.target.value)}
            placeholder="Type to find gear..."
            className="flex-1 bg-transparent border-none focus:outline-none text-2xl sm:text-4xl font-black tracking-tighter uppercase italic placeholder:text-muted-foreground/30 h-full py-4 text-foreground appearance-none"
          />

          {/* Actions */}
          <div className="flex items-center gap-4 ml-4">
            {loading && (
              <Loader2 className="h-5 w-5 animate-spin text-primary" />
            )}

            {term && !loading && (
              <button
                onClick={handleClear}
                className="text-muted-foreground hover:text-foreground transition-colors group"
              >
                <span className="sr-only">Clear</span>
                <X className="h-5 w-5 group-hover:rotate-90 transition-transform duration-300" />
              </button>
            )}

            <button
              onClick={onClose}
              className="h-10 w-10 sm:h-12 sm:w-12 flex items-center justify-center rounded-full bg-secondary/80 hover:bg-foreground hover:text-background transition-all"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          <div className="max-w-7xl mx-auto p-4 sm:p-12 lg:p-16">
            <AnimatePresence mode="wait">
              {term && results.length > 0 ? (
                <motion.div
                  key="results"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-12"
                >
                  <div>
                    <div className="flex items-center justify-between mb-8">
                      <p className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground">
                        Search Results ({results.length})
                      </p>
                      <div className="h-px flex-1 bg-border/50 ml-6" />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 xl:gap-8">
                      {results.map((product, i) => (
                        <motion.div
                          key={product.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: i * 0.05 }}
                        >
                          <Link
                            href={`/product/${product.slug || product.id}`}
                            onClick={onClose}
                            className="group flex flex-col gap-4"
                          >
                            <div className="relative aspect-[3/4] overflow-hidden rounded-2xl bg-muted border border-border/40">
                              {product.display_image ? (
                                <FlashImage
                                  src={product.display_image}
                                  alt={product.name}
                                  fill
                                  className="object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-muted-foreground/20">
                                  <Search className="h-12 w-12" />
                                </div>
                              )}
                              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                              <div className="absolute bottom-4 left-4 right-4 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all">
                                <div className="bg-background/90 backdrop-blur-md px-4 py-2 rounded-lg text-center font-black uppercase tracking-widest text-[10px]">
                                  View Product
                                </div>
                              </div>
                            </div>

                            <div>
                              <h3 className="font-black italic uppercase text-lg group-hover:text-primary transition-colors pr-4 leading-none truncate">
                                {product.name}
                              </h3>
                              <div className="flex items-center gap-3 mt-2">
                                <p className="text-sm font-bold tracking-tight">
                                  {formatCurrency(product.price)}
                                </p>
                                {product.category_name && (
                                  <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 border border-border/60 px-2 py-0.5 rounded-sm">
                                    {product.category_name}
                                  </span>
                                )}
                              </div>
                            </div>
                          </Link>
                        </motion.div>
                      ))}

                      {/* View All Card */}
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: results.length * 0.05 }}
                      >
                        <Link
                          href={`/shop?q=${term}`}
                          onClick={onClose}
                          className="flex flex-col items-center justify-center text-center aspect-[3/4] p-8 rounded-2xl border-2 border-dashed border-border hover:border-primary hover:bg-primary/5 transition-all group"
                        >
                          <div className="h-16 w-16 mb-4 rounded-full bg-secondary flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-all group-hover:scale-110">
                            <ArrowRight className="h-8 w-8" />
                          </div>
                          <div className="font-black italic uppercase tracking-tighter text-xl">
                            View All
                            <br />
                            Results
                          </div>
                          <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mt-4">
                            Browse Collection
                          </p>
                        </Link>
                      </motion.div>
                    </div>
                  </div>
                </motion.div>
              ) : !term ? (
                <motion.div
                  key="trending"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="grid grid-cols-1 md:grid-cols-2 gap-20"
                >
                  {/* trending categories or popular searches could go here */}
                  <div className="space-y-8">
                    <div>
                      <p className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground mb-6">
                        Discovery Points
                      </p>
                      <div className="flex flex-wrap gap-3">
                        {[
                          "New Arrivals",
                          "Best Sellers",
                          "Graphic Tees",
                          "Outerwear",
                          "Accessories",
                        ].map((tag) => (
                          <Link
                            key={tag}
                            href={`/shop?category=${tag.toLowerCase().replace(" ", "-")}`}
                            onClick={onClose}
                            className="px-6 py-4 bg-secondary/50 hover:bg-primary hover:text-white rounded-2xl font-black italic uppercase tracking-tighter transition-all hover:-rotate-1 active:scale-95"
                          >
                            {tag}
                          </Link>
                        ))}
                      </div>
                    </div>

                    <div>
                      <p className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground mb-6">
                        Recent Transmissions
                      </p>
                      <div className="space-y-2">
                        {[
                          "Flash Drop v2.0",
                          "Cyber Collection",
                          "Noir Aesthetics",
                        ].map((item) => (
                          <Link
                            key={item}
                            href="/shop"
                            onClick={onClose}
                            className="group flex items-center justify-between py-4 border-b border-border/40 hover:border-primary transition-colors"
                          >
                            <span className="text-2xl font-black italic uppercase italic tracking-tighter group-hover:translate-x-2 transition-transform">
                              {item}
                            </span>
                            <ArrowRight className="h-5 w-5 opacity-0 group-hover:opacity-100 transition-all -translate-x-4 group-hover:translate-x-0" />
                          </Link>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="hidden md:block relative aspect-square rounded-[3rem] overflow-hidden bg-zinc-900">
                    <FlashImage
                      src="https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&q=80&w=800"
                      alt="Discovery highlight"
                      fill
                      className="object-cover opacity-60 grayscale hover:grayscale-0 transition-all duration-1000"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
                    <div className="absolute bottom-10 left-10 p-4">
                      <h4 className="text-4xl font-black italic uppercase tracking-tighter text-white leading-none mb-2">
                        Flash
                        <br />
                        Discovery
                      </h4>
                      <p className="text-zinc-400 font-bold uppercase tracking-widest text-[10px]">
                        Curated Gear for High Velocity.
                      </p>
                    </div>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="py-32 text-center"
                >
                  <div className="inline-flex h-20 w-20 items-center justify-center rounded-full bg-secondary mb-6">
                    <Search className="h-10 w-10 text-muted-foreground/30" />
                  </div>
                  <h3 className="text-3xl font-black italic uppercase tracking-tighter mb-2">
                    No hits detected
                  </h3>
                  <p className="text-muted-foreground">
                    Adjust your coordinates and try again.
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
