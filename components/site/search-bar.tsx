'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useDebounce } from 'use-debounce'
import { Search, Loader2, X, ArrowRight } from 'lucide-react'
import { searchProducts } from '@/app/actions/search-products'
import { cn, formatCurrency } from '@/lib/utils'
import { motion, AnimatePresence } from 'framer-motion'

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
  useEffect(() => {
    if (!query) {
      setResults([])
      return
    }

    async function fetchResults() {
      setLoading(true)
      try {
        const data = await searchProducts(query)
        setResults(data)
      } catch (error) {
        console.error('Failed to search:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchResults()
  }, [query])

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
                className="absolute inset-0 z-60 flex items-center bg-background/80 backdrop-blur-xl animate-in fade-in slide-in-from-top-2 duration-200"
            >
                <div className="w-full h-full max-w-7xl mx-auto flex items-center px-4 sm:px-6 lg:px-8 relative">
                    
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
                        <div className="absolute top-full left-0 right-0 p-4 sm:px-6 lg:px-8 bg-background/80 backdrop-blur-xl border-b border-border/50 shadow-2xl max-h-[70vh] overflow-y-auto">
                            <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 py-6">
                                {results.map((product) => (
                                    <Link 
                                        key={product.id} 
                                        href={`/product/${product.id}`}
                                        onClick={onClose}
                                        className="group block space-y-3"
                                    >
                                        <div className="aspect-3/4 relative overflow-hidden rounded-xl bg-secondary">
                                            {product.images?.[0] ? (
                                                <img 
                                                    src={product.images[0]} 
                                                    alt={product.name}
                                                    className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                                                    <Search className="h-8 w-8 opacity-20" />
                                                </div>
                                            )}
                                            {/* Quick Add Overlay? */}
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-sm truncate">{product.name}</h3>
                                            <p className="text-xs text-muted-foreground font-mono mt-1">{formatCurrency(product.price)}</p>
                                        </div>
                                    </Link>
                                ))}
                                <Link 
                                    href={`/shop?q=${term}`}
                                    onClick={onClose}
                                    className="aspect-3/4 flex flex-col items-center justify-center gap-4 rounded-xl border-2 border-dashed border-border hover:border-primary hover:bg-primary/5 transition-all group"
                                >
                                    <div className="h-12 w-12 rounded-full bg-secondary flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-colors">
                                        <ArrowRight className="h-6 w-6" />
                                    </div>
                                    <span className="font-bold uppercase tracking-widest text-sm">View All Results</span>
                                </Link>
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
