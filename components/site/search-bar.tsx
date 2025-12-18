'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useDebounce } from 'use-debounce'
import { Search, Loader2, X } from 'lucide-react'
import { searchProducts } from '@/app/actions/search-products'
import { cn, formatCurrency } from '@/lib/utils'

export function SearchBar() {
  const [term, setTerm] = useState('')
  const [query] = useDebounce(term, 300)
  const [results, setResults] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  
  const wrapperRef = useRef<HTMLDivElement>(null)
  const router = useRouter()

  // Handle click outside to close
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

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
        setIsOpen(true)
      } catch (error) {
        console.error('Failed to search:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchResults()
  }, [query])

  return (
    <div ref={wrapperRef} className="relative w-full max-w-md">
      <div className="relative">
        <input
          type="text"
          value={term}
          onChange={(e) => {
            setTerm(e.target.value)
            if (!isOpen && e.target.value.length > 0) setIsOpen(true)
          }}
          onFocus={() => {
            if (term.length > 0) setIsOpen(true)
          }}
          placeholder="Search products..."
          className="w-full h-10 pl-10 pr-4 rounded-full border border-zinc-200 bg-white/5 focus:bg-white/10 dark:border-zinc-800 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all text-sm"
        />
        <div className="absolute left-3 top-2.5 text-muted-foreground pointer-events-none">
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Search className="h-4 w-4" />
          )}
        </div>
        {term.length > 0 && (
          <button 
            onClick={() => {
              setTerm('')
              setResults([])
              setIsOpen(false)
            }}
            className="absolute right-3 top-2.5 text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Results Dropdown */}
      {isOpen && (term.length > 0) && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-background border border-border rounded-xl shadow-xl overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-200">
          {loading && results.length === 0 ? (
             <div className="p-4 flex items-center justify-center text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Searching...
             </div>
          ) : results.length > 0 ? (
            <div className="py-2">
              <div className="px-3 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Products
              </div>
              {results.map((product) => (
                <Link
                  key={product.id}
                  href={`/product/${product.id}`} // Assuming ID based routing as per prompt, typically slug
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-3 px-4 py-2 hover:bg-muted/50 transition-colors group"
                >
                  <div className="h-10 w-10 relative rounded-md overflow-hidden bg-muted">
                    {product.images && product.images[0] ? (
                      <img 
                        src={product.images[0]} 
                        alt={product.name} 
                        className="h-full w-full object-cover group-hover:scale-105 transition-transform"
                      />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center bg-zinc-100 text-zinc-300">
                        <Search className="h-4 w-4" />
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col flex-1 min-w-0">
                    <span className="text-sm font-medium truncate group-hover:text-primary transition-colors">
                      {product.name}
                    </span>
                    <span className="text-xs text-muted-foreground font-mono">
                      {formatCurrency(product.price)}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center text-sm text-muted-foreground">
              No results found for "{term}"
            </div>
          )}
        </div>
      )}
    </div>
  )
}
