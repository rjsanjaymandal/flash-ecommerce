import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { cn, formatCurrency } from '@/lib/utils'

export function ProductCard({ product }: { product: any }) {
  return (
    <Link 
        href={`/product/${product.slug}`}
        className="group relative flex flex-col overflow-hidden rounded-xl border border-border bg-card transition-all hover:shadow-lg"
    >
        <div className="aspect-[4/5] w-full overflow-hidden bg-muted">
            {product.main_image_url ? (
                <img 
                    src={product.main_image_url} 
                    alt={product.name}
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
            ) : (
                <div className="h-full w-full flex items-center justify-center text-muted-foreground">
                    No Image
                </div>
            )}
        </div>
        <div className="flex flex-1 flex-col p-4">
            <h3 className="text-lg font-medium">{product.name}</h3>
            <p className="text-sm text-muted-foreground">{product.categories?.name}</p>
            <div className="mt-auto pt-4 flex items-center justify-between">
                <span className="text-lg font-bold">{formatCurrency(product.price)}</span>
                <span className="text-xs font-medium text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                    View Details
                </span>
            </div>
        </div>
    </Link>
  )
}
