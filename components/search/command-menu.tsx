'use client'

import { useState, useEffect, useTransition } from 'react'
import { 
    CommandDialog, 
    CommandInput, 
    CommandList, 
    CommandEmpty, 
    CommandGroup, 
    CommandItem, 
    CommandSeparator, 
    CommandShortcut 
} from '@/components/ui/command'
import { 
    LayoutDashboard, 
    ShoppingBag, 
    Home, 
    User, 
    Package,
    ArrowRight,
    Loader2
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { searchProducts } from '@/app/actions/search-actions'
import { useSearchStore } from '@/store/use-search-store'
import { formatCurrency } from '@/lib/utils'
import { useDebounce } from '@/hooks/use-debounce'

export function CommandMenu() {
  const { isOpen, setOpen, toggle } = useSearchStore()
  const [query, setQuery] = useState('')
  const debouncedQuery = useDebounce(query, 300)
  const [items, setItems] = useState<any[]>([])
  const [isPending, startTransition] = useTransition()
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
  
  // Server-side Search Effect
  useEffect(() => {
    if (debouncedQuery.length === 0) {
      setItems([])
      return
    }

    startTransition(async () => {
       const results = await searchProducts(debouncedQuery)
       setItems(results)
    })
  }, [debouncedQuery])

  const runCommand = (command: () => void) => {
    setOpen(false)
    command()
  }

  return (
    <CommandDialog open={isOpen} onOpenChange={setOpen} shouldFilter={false}>
      <div className="bg-zinc-950/20 backdrop-blur-3xl">
          <CommandInput 
            placeholder="Search products..." 
            value={query}
            onValueChange={setQuery}
            className="h-16 text-lg font-medium placeholder:text-zinc-500 border-none focus:ring-0 bg-transparent px-6"
          />
      </div>
      <CommandList className="scrollbar-hide bg-zinc-900/40 backdrop-blur-xl border-t border-white/5 p-2">
        <CommandEmpty className="py-12 text-center">
            {isPending ? (
                 <div className="flex flex-col items-center gap-3">
                    <Loader2 className="h-8 w-8 text-primary animate-spin" />
                    <p className="text-sm font-bold text-zinc-500 uppercase tracking-widest">Searching...</p>
                </div>
            ) : (
                <div className="flex flex-col items-center gap-3">
                    {!query ? (
                        <p className="text-sm font-medium text-zinc-500">Start typing to search products.</p>
                    ) : (
                        <>
                             <Package className="h-10 w-10 text-zinc-700" />
                             <p className="text-sm font-medium text-zinc-500">No products found.</p>
                        </>
                    )}
                </div>
            )}
        </CommandEmpty>
        
        {items.length > 0 && (
            <CommandGroup heading={<span className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 ml-2 mb-2 block">Results</span>}>
                {items.map((item) => (
                    <CommandItem 
                        key={item.id} 
                        onSelect={() => runCommand(() => router.push(`/product/${item.slug || item.id}`))}
                        className="group rounded-2xl mx-1 mb-2 cursor-pointer py-3 hover:bg-white/5 aria-selected:bg-white/10 transition-colors"
                    >
                        <div className="relative h-14 w-14 rounded-xl overflow-hidden border border-white/10 group-hover:border-primary/50 transition-colors mr-4 shrink-0 bg-white/5">
                            {item.main_image_url && <img src={item.main_image_url} className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-500" alt={item.name} />}
                        </div>
                        <div className="flex flex-col flex-1 gap-0.5 min-w-0">
                            <span className="font-black uppercase tracking-tight text-white group-hover:text-primary transition-colors truncate text-sm md:text-base">{item.name}</span>
                            <div className="flex items-center gap-2">
                                    {item.price && <span className="text-xs font-bold text-zinc-400 font-mono">{formatCurrency(item.price)}</span>}
                                    {item.category && <span className="text-[9px] px-1.5 py-0.5 rounded border border-white/10 bg-white/5 text-zinc-500 uppercase font-bold tracking-wider">{item.category}</span>}
                            </div>
                        </div>
                        <ArrowRight className="h-4 w-4 opacity-0 -translate-x-2 transition-all group-aria-selected:opacity-100 group-aria-selected:translate-x-0 group-hover:opacity-100 group-hover:translate-x-0 ml-auto mr-2 text-primary" />
                    </CommandItem>
                ))}
            </CommandGroup>
        )}
      </CommandList>
    </CommandDialog>
  )
}
