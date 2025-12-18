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
      <CommandInput 
        placeholder="Type a command or search products..." 
        value={query}
        onValueChange={setQuery}
      />
      <CommandList className="scrollbar-hide">
        <CommandEmpty className="py-12 text-center">
            {isPending ? (
                 <div className="flex flex-col items-center gap-2">
                    <Loader2 className="h-10 w-10 text-primary animate-spin" />
                    <p className="text-sm font-medium text-muted-foreground">Searching typespace...</p>
                </div>
            ) : (
                <div className="flex flex-col items-center gap-2">
                    <Package className="h-10 w-10 text-muted-foreground/20" />
                    <p className="text-sm font-medium text-muted-foreground">No matches found for your vibe.</p>
                </div>
            )}
        </CommandEmpty>
        
        {!query && (
            <>
                <CommandGroup heading={<span className="text-xs font-black uppercase tracking-widest text-primary ml-1">Quick Discovery</span>}>
                <CommandItem onSelect={() => runCommand(() => router.push('/shop'))} className="rounded-xl mx-1 mb-1">
                    <ShoppingBag className="mr-2 h-4 w-4" />
                    <span className="font-bold">Browse All Collections</span>
                </CommandItem>
                <CommandItem onSelect={() => runCommand(() => router.push('/account'))} className="rounded-xl mx-1 mb-1">
                    <User className="mr-2 h-4 w-4" />
                    <span className="font-bold">Member Profile</span>
                </CommandItem>
                </CommandGroup>

                <CommandSeparator className="opacity-50" />

                <CommandGroup heading={<span className="text-xs font-black uppercase tracking-widest text-accent ml-1">Trending Collections</span>}>
                    <div className="grid grid-cols-2 gap-2 p-2 focus-within:ring-0">
                        <button 
                            onClick={() => runCommand(() => router.push('/shop?category=streetwear'))}
                            className="flex flex-col gap-2 p-4 rounded-2xl bg-primary/5 hover:bg-primary/10 transition-colors text-left group"
                        >
                            <span className="text-xs font-black uppercase tracking-widest opacity-60">Collection</span>
                            <span className="text-lg font-black italic tracking-tighter uppercase group-hover:text-primary transition-colors">Streetwear</span>
                        </button>
                        <button 
                            onClick={() => runCommand(() => router.push('/shop?category=accessories'))}
                            className="flex flex-col gap-2 p-4 rounded-2xl bg-accent/5 hover:bg-accent/10 transition-colors text-left group"
                        >
                            <span className="text-xs font-black uppercase tracking-widest opacity-60">Collection</span>
                            <span className="text-lg font-black italic tracking-tighter uppercase group-hover:text-accent transition-colors">Accessories</span>
                        </button>
                    </div>
                </CommandGroup>
            </>
        )}
        
        {items.length > 0 && (
            <>
                <CommandSeparator className="opacity-50" />
                <CommandGroup heading={<span className="text-xs font-black uppercase tracking-widest text-primary ml-1">Products</span>}>
                    {items.map((item) => (
                        <CommandItem 
                            key={item.id} 
                            onSelect={() => runCommand(() => router.push(`/product/${item.slug || item.id}`))}
                            className="group rounded-xl mx-1 mb-1 cursor-pointer py-3"
                        >
                            <div className="relative h-12 w-12 rounded-xl overflow-hidden border border-border group-hover:border-primary transition-colors mr-3 shrink-0">
                                {item.main_image_url && <img src={item.main_image_url} className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-500" alt={item.name} />}
                            </div>
                            <div className="flex flex-col flex-1 gap-1 min-w-0">
                                <span className="font-black uppercase tracking-tight leading-none group-hover:text-primary transition-colors truncate">{item.name}</span>
                                {item.price && <span className="text-xs font-bold text-muted-foreground">{formatCurrency(item.price)}</span>}
                            </div>
                            <ArrowRight className="h-4 w-4 opacity-0 -translate-x-2 transition-all group-aria-selected:opacity-100 group-aria-selected:translate-x-0 group-hover:opacity-100 group-hover:translate-x-0 ml-auto" />
                        </CommandItem>
                    ))}
                </CommandGroup>
            </>
        )}

        <CommandSeparator className="opacity-50" />

        <CommandGroup heading={<span className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">System</span>}>
           <CommandItem onSelect={() => runCommand(() => router.push('/'))} className="rounded-xl mx-1">
            <Home className="mr-2 h-4 w-4" />
            <span className="font-bold">Home</span>
          </CommandItem>
           <CommandItem onSelect={() => runCommand(() => router.push('/admin'))} className="rounded-xl mx-1">
            <LayoutDashboard className="mr-2 h-4 w-4" />
            <span className="font-bold">Control Panel</span>
            <CommandShortcut>⌘A</CommandShortcut>
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  )
}
