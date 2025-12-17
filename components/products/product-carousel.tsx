'use client'

import { ProductCard } from '@/components/storefront/product-card'
import { useRef } from 'react'

interface ProductCarouselProps {
  title?: string
  products: any[]
}

export function ProductCarousel({ title = "You Might Also Like", products }: ProductCarouselProps) {
  const scrollRef = useRef<HTMLDivElement>(null)

  if (!products || products.length === 0) return null

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-light tracking-tight">{title}</h2>
      </div>
      
      <div 
        ref={scrollRef}
        className="flex gap-4 overflow-x-auto pb-4 -mx-4 px-4 snap-x snap-mandatory scrollbar-hide"
      >
        {products.map((product) => (
          <div key={product.id} className="min-w-[280px] w-[280px] snap-start">
            <ProductCard product={product} />
          </div>
        ))}
      </div>
    </div>
  )
}
