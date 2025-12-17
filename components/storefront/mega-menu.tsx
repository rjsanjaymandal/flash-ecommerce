'use client'

import React from 'react'
import Link from 'next/link'
import { NavigationMenuContent, NavigationMenuItem, NavigationMenuLink, NavigationMenuTrigger } from '@/components/ui/navigation-menu'
import { cn } from '@/lib/utils'

interface MegaMenuProps {
  category: {
    id: string
    name: string
    slug: string
    image_url?: string | null
    children?: {
      id: string
      name: string
      slug: string
    }[]
  }
}

export function MegaMenu({ category }: MegaMenuProps) {
  return (
    <div className="absolute top-full left-0 w-[600px] -translate-x-1/4 pt-2 opacity-0 translate-y-2 pointer-events-none group-hover:opacity-100 group-hover:translate-y-0 group-hover:pointer-events-auto transition-all duration-200 ease-out z-50">
       <div className="bg-background border border-border shadow-2xl rounded-xl overflow-hidden p-6 grid grid-cols-12 gap-6">
            {/* Subcategories Column */}
            <div className="col-span-4 space-y-4">
                <h4 className="font-bold text-sm uppercase tracking-wider text-muted-foreground border-b border-border pb-2">
                    Browse {category.name}
                </h4>
                <div className="flex flex-col gap-2">
                    {category.children?.map((child) => (
                        <Link 
                            key={child.id}
                            href={`/shop?category=${child.id}`}
                            className="text-sm font-medium hover:text-primary hover:underline hover:underline-offset-4 transition-all"
                        >
                            {child.name}
                        </Link>
                    ))}
                    <Link 
                         href={`/shop?category=${category.id}`} 
                         className="text-sm font-bold text-primary mt-2 flex items-center gap-1"
                    >
                        View All {category.name}
                    </Link>
                </div>
            </div>

            {/* Featured Image Column */}
            <div className="col-span-8">
                <Link href={`/shop?category=${category.id}`} className="group/card block relative h-full w-full overflow-hidden rounded-lg bg-muted">
                    {category.image_url ? (
                        <img 
                            src={category.image_url} 
                            alt={category.name} 
                            className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover/card:scale-105"
                        />
                    ) : (
                        <div className="absolute inset-0 flex items-center justify-center text-muted-foreground bg-secondary/30">
                            No Featured Image
                        </div>
                    )}
                    <div className="absolute inset-0 bg-linear-to-t from-black/60 via-transparent to-transparent" />
                    <div className="absolute bottom-4 left-4 text-white">
                        <p className="text-xs font-bold uppercase tracking-wider mb-1">Featured Collection</p>
                        <h3 className="text-2xl font-black">{category.name}</h3>
                    </div>
                </Link>
            </div>
       </div>
    </div>
  )
}
