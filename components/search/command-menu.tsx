'use client'

import { useState, useEffect } from 'react'
// BUT since we manually installed cmdk, we might not have the shadcn wrapper. 
// I will assume the user MIGHT NOT have the shadcn 'command' component.
// Safer to implement a raw CMDK wrapper or check if I can use the standard one. 
// The user already has `radix-ui/react-dialog` etc, so likely has shadcn.
// I will use a simplified version to avoid dependency issues if 'components/ui/command' is missing.

// Re-implementing simplified Command Menu using raw cmdk to be safe
import { Command } from 'cmdk'
import { Dialog, DialogContent } from '@/components/ui/dialog' 
import { Search, Package, ArrowRight } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { getSearchIndex } from '@/app/actions/search-actions'

import { useSearchStore } from '@/store/use-search-store'

export function CommandMenu() {
  const { isOpen, setOpen, toggle } = useSearchStore()
  const [query, setQuery] = useState('')
  const [items, setItems] = useState<any[]>([])
  const router = useRouter()

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        toggle()
      }
    }
    document.addEventListener('keydown', down)
    return () => document.removeEventListener('keydown', down)
  }, [toggle])
  
  // Fetch items once on mount (or could fetch on open)
  useEffect(() => {
      if(isOpen && items.length === 0) {
          getSearchIndex().then(setItems)
      }
  }, [isOpen, items.length])

  // Simple client-side filtering
  const filtered = items.filter(item => 
      item.name.toLowerCase().includes(query.toLowerCase())
  ).slice(0, 5)

  return (
    <Dialog open={isOpen} onOpenChange={setOpen}>
        <DialogContent className="p-0 overflow-hidden shadow-2xl max-w-2xl bg-popover text-popover-foreground">
            <div className="flex items-center border-b px-3">
              <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
              <input 
                className="flex h-12 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
                placeholder="Search products..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>
            <div className="max-h-[300px] overflow-y-auto p-2">
                {!query && items.length === 0 && <p className="text-center py-6 text-sm text-muted-foreground">Loading...</p>}
                {query && filtered.length === 0 && <p className="text-center py-6 text-sm text-muted-foreground">No results found.</p>}
                {filtered.map((item) => (
                    <div 
                        key={item.id}
                        className="relative flex cursor-default select-none items-center rounded-sm px-2 py-2 text-sm outline-none hover:bg-accent hover:text-accent-foreground aria-selected:bg-accent aria-selected:text-accent-foreground cursor-pointer group"
                        onClick={() => {
                            setOpen(false)
                            router.push(`/product/${item.id}`) // Assuming the slug is available or just use ID navigation if setup
                        }}
                    >
                        <Package className="mr-2 h-4 w-4 opacity-70" />
                        <span className="flex-1">{item.name}</span>
                        <ArrowRight className="h-4 w-4 opacity-0 -translate-x-2 transition-all group-hover:opacity-100 group-hover:translate-x-0 text-muted-foreground" />
                    </div>
                ))}
            </div>
            <div className="py-2 px-4 border-t text-[10px] text-muted-foreground flex justify-between">
                <span>Product Search</span>
                <span>ESC to close</span>
            </div>
        </DialogContent>
    </Dialog>
  )
}
