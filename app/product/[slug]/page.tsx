'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { useCart } from '@/context/cart-context'
import { Loader2, Check } from 'lucide-react'

export default function ProductPage() {
  const { slug } = useParams()
  const { addItem } = useCart()
  const [product, setProduct] = useState<any>(null)
  const [stock, setStock] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  
  // Selection State
  const [selectedSize, setSelectedSize] = useState('')
  const [selectedColor, setSelectedColor] = useState('')
  
  const supabase = createClient()

  useEffect(() => {
    const fetchData = async () => {
        const { data: prod } = await supabase
            .from('products')
            .select('*')
            .eq('slug', slug)
            .single()
        
        if (prod) {
            setProduct(prod)
            const { data: st } = await supabase
                .from('product_stock')
                .select('*')
                .eq('product_id', prod.id)
            setStock(st || [])
        }
        setLoading(false)
    }
    fetchData()
  }, [slug])

  if (loading) return <div className="min-h-screen pt-24 flex justify-center"><Loader2 className="animate-spin" /></div>
  if (!product) return <div className="min-h-screen pt-24 text-center">Product not found</div>

  // Available options
  const availableSizes = Array.from(new Set(stock.map(s => s.size)))
  const availableColors = Array.from(new Set(stock.filter(s => s.size === selectedSize).map(s => s.color))) // Colors available for selected size
  
  // Fallback: If no stock records, use product options tags (but better to rely on stock for purchase validity)
  // For this demo, let's assume stock is the source of truth for purchase.

  const currentStockItem = stock.find(s => s.size === selectedSize && s.color === selectedColor)
  const maxQty = currentStockItem?.quantity || 0

  const handleAddToCart = () => {
    if (!selectedSize || !selectedColor) return
    addItem({
        productId: product.id,
        name: product.name,
        price: product.price,
        image: product.main_image_url,
        size: selectedSize,
        color: selectedColor,
        quantity: 1,
        maxQuantity: maxQty
    })
  }

  return (
    <div className="min-h-screen pt-24 pb-12 container mx-auto px-4">
        <div className="grid md:grid-cols-2 gap-12">
            {/* Image Gallery */}
            <div className="space-y-4">
                <div className="aspect-[4/5] w-full overflow-hidden rounded-2xl bg-muted border border-border">
                     {product.main_image_url ? (
                        <img src={product.main_image_url} alt={product.name} className="h-full w-full object-cover" />
                     ) : (
                        <div className="h-full w-full flex items-center justify-center text-muted-foreground">No Image</div>
                     )}
                </div>
            </div>

            {/* Product Info */}
            <div className="space-y-8 sticky top-24 h-fit">
                <div>
                    <h1 className="text-4xl font-black tracking-tight mb-2">{product.name}</h1>
                    <p className="text-2xl font-bold text-primary">${product.price}</p>
                </div>

                <div className="prose prose-sm text-muted-foreground">
                    <p>{product.description}</p>
                </div>

                {/* Selectors */}
                <div className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Size</label>
                        <div className="flex flex-wrap gap-2">
                            {product.size_options?.map((size: string) => {
                                // Check if this size exists in stock at all
                                const hasStock = stock.some(s => s.size === size && s.quantity > 0)
                                return (
                                    <button
                                        key={size}
                                        disabled={!hasStock}
                                        onClick={() => { setSelectedSize(size); setSelectedColor('') }} // Reset color on size change
                                        className={cn(
                                            "min-w-[3rem] px-3 py-2 rounded-lg border text-sm font-medium transition-all",
                                            selectedSize === size 
                                                ? "border-primary bg-primary/10 text-primary ring-1 ring-primary"
                                                : "border-input bg-background hover:bg-muted",
                                            !hasStock && "opacity-50 cursor-not-allowed decoration-slice line-through"
                                        )}
                                    >
                                        {size}
                                    </button>
                                )
                            })}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium">Color</label>
                        <div className="flex flex-wrap gap-2">
                            {product.color_options?.map((color: string) => {
                                 // Check availability for selected size if chosen, else general availability
                                 const hasStockForSize = selectedSize 
                                    ? stock.some(s => s.size === selectedSize && s.color === color && s.quantity > 0)
                                    : stock.some(s => s.color === color && s.quantity > 0)

                                return (
                                    <button
                                        key={color}
                                        disabled={!selectedSize || !hasStockForSize}
                                        onClick={() => setSelectedColor(color)}
                                        className={cn(
                                            "px-4 py-2 rounded-lg border text-sm font-medium transition-all",
                                            selectedColor === color 
                                                ? "border-primary bg-primary/10 text-primary ring-1 ring-primary"
                                                : "border-input bg-background hover:bg-muted",
                                             (!selectedSize || !hasStockForSize) && "opacity-50 cursor-not-allowed"
                                        )}
                                    >
                                        {color}
                                    </button>
                                )
                            })}
                        </div>
                         {!selectedSize && <p className="text-xs text-muted-foreground">Select a size first</p>}
                    </div>
                </div>

                <div className="pt-6 border-t border-border">
                    <Button 
                        size="lg" 
                        className="w-full h-14 text-lg bg-linear-to-r from-primary to-accent" 
                        disabled={!selectedSize || !selectedColor || maxQty === 0}
                        onClick={handleAddToCart}
                    >
                        {maxQty === 0 ? 'Out of Stock' : 'Add to Bag'}
                    </Button>
                    <p className="mt-4 text-center text-xs text-muted-foreground">
                        Free shipping on orders over $100 • 30-day returns
                    </p>
                </div>
            </div>
        </div>
    </div>
  )
}
