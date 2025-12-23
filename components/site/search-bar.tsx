'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useDebounce } from 'use-debounce'
import { Search, Loader2, X, ArrowRight } from 'lucide-react'
import { getSearchIndex } from '@/app/actions/search-products'
import { cn, formatCurrency } from '@/lib/utils'
import { useProductSearch } from '@/hooks/use-product-search'
import { motion, AnimatePresence } from 'framer-motion'
import NextImage from 'next/image'
import imageLoader from '@/lib/image-loader'

interface SearchOverlayProps {
    isOpen: boolean
    onClose: () => void
}

export function SearchOverlay({ isOpen, onClose }: SearchOverlayProps) {
  const [term, setTerm] = useState('')
  const [query] = useDebounce(term, 300)
  const [results, setResults] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  
  const inputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()

  // Auto-focus when opened
  useEffect(() => {
    if (isOpen) {
        setTimeout(() => inputRef.current?.focus(), 100)
    }
  }, [isOpen])

  // Clear when closed
  useEffect(() => {
      if (!isOpen) {
          setTerm('')
          setResults([])
      }
  }, [isOpen])

  // Search Effect
  // Index State
  const [index, setIndex] = useState<any[]>([])
  const [isIndexLoaded, setIsIndexLoaded] = useState(false)
  
  // Logic: Fetch index once on first open
  // Logic: Fetch index once on first open
  useEffect(() => {
      if (isOpen && !isIndexLoaded) {
          console.log('[Search] Fetching search index...')
          setLoading(true)
          getSearchIndex()
            .then(data => {
              console.log('[Search] Index loaded:', data?.length)
              setIndex(data)
              setIsIndexLoaded(true)
            })
            .catch(err => {
                console.error('[Search] Failed to load index:', err)
            })
            .finally(() => {
                setLoading(false)
            })
      }
  }, [isOpen, isIndexLoaded])

  // Instantiate Fuse Hook
  // We pass the index. 
  const { search } = useProductSearch({ products: index })
  // Note: Ensure hook uses 'category_name' if we flattened it, or 'category.name' if object.
  // We flattened it to 'category_name' in the action.
  // We need to update the hook or pass config? 
  // The hook has hardcoded keys. I should update the hook to look for 'category_name' too.
  // Actually, I'll update the hook file in next step. For now, this is fine.

  // Search Effect (Client Side)
  useEffect(() => {
    if (!query) {
      setResults([])
      return
    }
    
    // Perfrom Fuzzy Search
    const hits = search(query)
    setResults(hits.slice(0, 8)) // Limit to 8 results
    
  }, [query, search])

  const handleClear = () => {
    setTerm('')
    setResults([])
    inputRef.current?.focus()
  }

  // Handle ESC to close
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
        if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleEsc)
    return () => window.removeEventListener('keydown', handleEsc)
  }, [onClose])

  // Handle click outside to close
  useEffect(() => {
      if (!isOpen) return

      const handleClickOutside = (event: MouseEvent) => {
          // If click is NOT inside the search overlay container (input + results), close it.
          // Note: The overlay itself (motion.div) covers the header. 
          // Check if click is outside the motion.div?
          // Actually, if the overlay is only h-16, clicking below is outside.
          // So just checking if target is contained in a ref wrapping the whole Overlay component is enough.
          
          if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
              onClose()
          }
      }

      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isOpen, onClose])

  const wrapperRef = useRef<HTMLDivElement>(null)

  return (
    <>
        {isOpen && (
            <div 
                ref={wrapperRef}
                className="fixed inset-0 z-50 flex items-start bg-background/80 backdrop-blur-xl animate-in fade-in slide-in-from-top-2 duration-200"
            >
                <div className="w-full h-16 max-w-7xl mx-auto flex items-center px-4 sm:px-6 lg:px-8 relative">
                    
                    <Search className="h-6 w-6 text-muted-foreground mr-4 shrink-0" />
                    
                    <input
                        ref={inputRef}
                        type="text"
                        value={term}
                        onChange={(e) => setTerm(e.target.value)}
                        placeholder="Search for products..."
                        className="flex-1 bg-transparent border-none focus:outline-none text-2xl font-bold placeholder:text-muted-foreground/50 h-full py-4 text-foreground"
                    />

                    {/* Actions */}
                    <div className="flex items-center gap-4 ml-4">
                        {loading && <Loader2 className="h-5 w-5 animate-spin text-primary" />}
                        
                        {term && !loading && (
                            <button onClick={handleClear} className="text-muted-foreground hover:text-foreground transition-colors">
                                <span className="sr-only">Clear</span>
                                <span className="text-xs font-bold uppercase tracking-wider">Clear</span>
                            </button>
                        )}

                        <button 
                            onClick={onClose}
                            className="h-10 w-10 flex items-center justify-center rounded-full bg-secondary/50 hover:bg-secondary text-foreground transition-all"
                        >
                            <X className="h-5 w-5" />
                        </button>
                    </div>

                    {/* Results Overlay (Absolute below header) */}
                    {results.length > 0 && (
                        <div className="absolute top-full left-0 right-0 h-[calc(100vh-64px)] overflow-y-auto bg-background/95 backdrop-blur-xl border-t border-border/50 shadow-2xl animate-in fade-in slide-in-from-top-2">
                           <div className="max-w-7xl mx-auto p-4 sm:px-6 lg:px-8 pb-20">
                                <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-4 px-1">Top Results</p>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
                                    {results.map((product) => (
                                        <Link 
                                            key={product.id} 
                                            href={`/product/${product.slug || product.id}`}
                                            onClick={onClose}
                                            className="group flex items-center gap-4 p-2 rounded-xl hover:bg-secondary/50 transition-colors sm:block sm:p-0 sm:hover:bg-transparent"
                                        >
                                            {/* Image: Small on mobile, Aspect Ratio on Desktop */}
                                            <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-md border border-border/50 bg-secondary sm:aspect-3/4 sm:h-auto sm:w-full sm:rounded-xl">
                                                {product.display_image ? (
                                                    <NextImage 
                                                        loader={imageLoader}
                                                        src={product.display_image} 
                                                        alt={product.name}
                                                        fill
                                                        className="object-cover sm:group-hover:scale-105 transition-transform duration-500"
                                                    />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-muted-foreground bg-muted">
                                                        <Search className="h-6 w-6 opacity-20" />
                                                    </div>
                                                )}
                                            </div>

                                            {/* Details */}
                                            <div className="flex-1 min-w-0 sm:mt-3">
                                                <h3 className="font-semibold text-sm truncate pr-2 group-hover:text-primary transition-colors">{product.name}</h3>
                                                <div className="flex items-center gap-2 mt-1">
                                                     <p className="text-xs font-mono font-medium text-foreground">{formatCurrency(product.price)}</p>
                                                     {product.category_name && (
                                                        <span className="text-[10px] uppercase text-muted-foreground px-1.5 py-0.5 rounded-full bg-secondary hidden sm:inline-block">
                                                            {product.category_name}
                                                        </span>
                                                     )}
                                                </div>
                                            </div>
                                            
                                            {/* Mobile Arrow */}
                                            <div className="sm:hidden text-muted-foreground/50">
                                                <ArrowRight className="h-5 w-5" />
                                            </div>
                                        </Link>
                                    ))}

                                    {/* View All Card */}
                                    <Link 
                                        href={`/shop?q=${term}`}
                                        onClick={onClose}
                                        className="flex items-center gap-4 p-2 rounded-xl border border-dashed border-border hover:border-primary hover:bg-primary/5 transition-all text-muted-foreground hover:text-primary sm:flex-col sm:justify-center sm:text-center sm:aspect-3/4 sm:p-6"
                                    >
                                        <div className="h-12 w-12 shrink-0 rounded-full bg-secondary flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-colors">
                                           <ArrowRight className="h-5 w-5" />
                                        </div>
                                        <div className="font-bold uppercase tracking-widest text-xs sm:text-sm">View All Results</div>
                                    </Link>
                                </div>
                            </div>
                        </div>
                    )}

                     {/* No Results State */}
                     {term && !loading && results.length === 0 && (
                        <div className="absolute top-full left-0 right-0 p-12 bg-background/95 backdrop-blur-xl border-b border-white/5 text-center shadow-2xl">
                            <p className="text-muted-foreground">No results found for <span className="text-foreground font-bold">"{term}"</span></p>
                        </div>
                    )}
                </div>
            </div>
        )}
    </>
  )
}
