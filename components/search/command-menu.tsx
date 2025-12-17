'use client'

import { useState, useEffect } from 'react'
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
    Settings, 
    User, 
    LogOut,
    Package,
    ArrowRight
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { getSearchIndex } from '@/app/actions/search-actions'
import { useSearchStore } from '@/store/use-search-store'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { formatCurrency } from '@/lib/utils'

export function CommandMenu() {
  const { isOpen, setOpen, toggle } = useSearchStore()
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
  
  useEffect(() => {
      if(isOpen && items.length === 0) {
          getSearchIndex().then(setItems)
      }
  }, [isOpen, items.length])

  const runCommand = (command: () => void) => {
    setOpen(false)
    command()
  }

  return (
    <CommandDialog open={isOpen} onOpenChange={setOpen}>
      <CommandInput placeholder="Type a command or search products..." />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        
        <CommandGroup heading="Suggestions">
          <CommandItem onSelect={() => runCommand(() => router.push('/shop'))}>
            <ShoppingBag className="mr-2 h-4 w-4" />
            <span>Shop All</span>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => router.push('/account'))}>
            <User className="mr-2 h-4 w-4" />
            <span>My Account</span>
          </CommandItem>
           <CommandItem onSelect={() => runCommand(() => router.push('/admin'))}>
            <LayoutDashboard className="mr-2 h-4 w-4" />
            <span>Admin Dashboard</span>
            <CommandShortcut>⌘A</CommandShortcut>
          </CommandItem>
        </CommandGroup>
        
        <CommandSeparator />
        
        <CommandGroup heading="Products">
            {items.slice(0, 10).map((item) => (
                <CommandItem 
                    key={item.id} 
                    onSelect={() => runCommand(() => router.push(`/product/${item.id}`))} // Or slug if you have it
                    className="group"
                >
                    <Avatar className="mr-2 h-8 w-8 rounded-md border">
                        <AvatarImage src={item.main_image_url} className="object-cover" />
                        <AvatarFallback><Package className="h-4 w-4" /></AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col flex-1">
                        <span className="font-medium">{item.name}</span>
                        {item.price && <span className="text-xs text-muted-foreground">{formatCurrency(item.price)}</span>}
                    </div>
                    <ArrowRight className="ml-auto h-4 w-4 opacity-0 -translate-x-2 transition-all group-aria-selected:opacity-100 group-aria-selected:translate-x-0" />
                </CommandItem>
            ))}
        </CommandGroup>

        <CommandSeparator />

        <CommandGroup heading="Settings">
          <CommandItem onSelect={() => runCommand(() => router.push('/account'))}>
            <Settings className="mr-2 h-4 w-4" />
            <span>Settings</span>
            <CommandShortcut>⌘S</CommandShortcut>
          </CommandItem>
           <CommandItem onSelect={() => runCommand(() => router.push('/'))}>
            <Home className="mr-2 h-4 w-4" />
            <span>Home</span>
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  )
}
