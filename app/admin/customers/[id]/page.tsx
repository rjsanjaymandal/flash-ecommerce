'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useParams, useRouter } from 'next/navigation'
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { formatCurrency } from '@/lib/utils'
import { Loader2, Trash2, ArrowLeft, ShoppingCart, Heart, Package } from 'lucide-react'
import { toast } from 'sonner'
import Link from 'next/link'

export default function CustomerDetailPage() {
    const params = useParams()
    const id = params.id as string
    const supabase = createClient()
    const router = useRouter()
    
    const [profile, setProfile] = useState<any>(null)
    const [cart, setCart] = useState<any[]>([])
    const [wishlist, setWishlist] = useState<any[]>([])
    const [orders, setOrders] = useState<any[]>([])
    const [isLoading, setIsLoading] = useState(true)

    const fetchData = async () => {
        setIsLoading(true)
        // Profile & Orders
        const { data: profileData } = await supabase
            .from('profiles')
            .select('*, orders(*)')
            .eq('id', id)
            .single()

        // Cart
        const { data: cartData } = await supabase
            .from('cart_items')
            .select('*, product:products(*)')
            .eq('user_id', id)
        
        // Wishlist
        const { data: wishlistData } = await supabase
            .from('wishlist_items')
            .select('*, product:products(*)')
            .eq('user_id', id)

        if (profileData) {
            setProfile(profileData)
            setOrders(profileData.orders || [])
        }
        if (cartData) setCart(cartData)
        if (wishlistData) setWishlist(wishlistData)
        
        setIsLoading(false)
    }

    useEffect(() => {
        fetchData()
    }, [id])

    // Admin Action: Clear User Cart
    const clearUserCart = async () => {
        if (!confirm("Are you sure you want to empty this user's cart?")) return
        const { error } = await supabase.from('cart_items').delete().eq('user_id', id)
        if (error) toast.error("Failed to clear cart")
        else {
            toast.success("User cart cleared")
            fetchData()
        }
    }

    const removeItem = async (itemId: string, type: 'cart' | 'wishlist') => {
        const table = type === 'cart' ? 'cart_items' : 'wishlist_items'
        const { error } = await supabase.from(table).delete().eq('id', itemId)
        if (error) toast.error("Failed to remove item")
        else {
            toast.success("Item removed")
            fetchData()
        }
    }

    if (isLoading) return <div className="flex h-[50vh] items-center justify-center"><Loader2 className="animate-spin text-muted-foreground" /></div>
    if (!profile) return <div className="flex flex-col items-center justify-center h-[50vh] gap-4">User not found <Button variant="outline" onClick={() => router.back()}>Go Back</Button></div>

    return (
        <div className="space-y-8 animate-in fade-in duration-500 max-w-6xl mx-auto pb-20">
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" asChild><Link href="/admin/customers"><ArrowLeft className="h-4 w-4" /></Link></Button>
                <div>
                   <h1 className="text-3xl font-black tracking-tight">{profile.name || 'Anonymous User'}</h1>
                   <p className="text-muted-foreground text-sm">{profile.email} • Joined {new Date(profile.created_at).toLocaleDateString()}</p>
                </div>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
                 {/* User Stats Card */}
                 <div className="md:col-span-1 space-y-6">
                    <Card>
                        <CardHeader className="flex flex-row items-center gap-4 pb-2">
                            <Avatar className="h-16 w-16 border-2 border-primary/10">
                                <AvatarImage src={`https://avatar.vercel.sh/${profile.email}`} />
                                <AvatarFallback>{profile.name?.[0]}</AvatarFallback>
                            </Avatar>
                            <div>
                                <CardTitle className="text-lg">{profile.role}</CardTitle>
                                <Badge variant="outline">{profile.fit_preference || 'No Fit Pref'}</Badge>
                            </div>
                        </CardHeader>
                        <CardContent className="grid gap-4">
                            <div className="flex justify-between border-b pb-2">
                                <span className="text-muted-foreground">Total Spent</span>
                                <span className="font-bold font-mono">{formatCurrency(orders.reduce((acc, o) => acc + (o.status === 'paid' ? o.total : 0), 0))}</span>
                            </div>
                            <div className="flex justify-between border-b pb-2">
                                <span className="text-muted-foreground">Total Orders</span>
                                <span className="font-bold">{orders.length}</span>
                            </div>
                        </CardContent>
                    </Card>
                 </div>

                 {/* Cart & Wishlist */}
                 <div className="md:col-span-2 space-y-8">
                    {/* Live Cart */}
                    <Card className="border-blue-200 bg-blue-50/10 shadow-sm">
                        <CardHeader className="flex flex-row items-center justify-between">
                            <div className="flex items-center gap-2">
                                <div className="p-2 bg-blue-100 rounded-lg text-blue-600"><ShoppingCart className="h-5 w-5" /></div>
                                <div>
                                    <CardTitle>Live Cart</CardTitle>
                                    <CardDescription>Items currently in their cart</CardDescription>
                                </div>
                            </div>
                            {cart.length > 0 && <Button variant="destructive" size="sm" onClick={clearUserCart}><Trash2 className="h-4 w-4 mr-2" /> Empty Cart</Button>}
                        </CardHeader>
                        <CardContent>
                            {cart.length === 0 ? (
                                <p className="text-muted-foreground text-sm py-8 text-center">Cart is empty.</p>
                            ) : (
                                <div className="space-y-4">
                                    {cart.map(item => (
                                        <div key={item.id} className="flex items-center justify-between p-3 bg-card rounded-xl border border-border/50 shadow-sm">
                                            <div className="flex items-center gap-3">
                                                {item.product?.main_image_url && <img src={item.product.main_image_url} className="h-12 w-12 object-cover rounded-md" />}
                                                <div>
                                                    <p className="font-medium text-sm">{item.product?.name}</p>
                                                    <p className="text-xs text-muted-foreground">{item.size} • {item.color} • x{item.quantity}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-4">
                                                <span className="font-mono text-sm">{formatCurrency(item.product?.price * item.quantity)}</span>
                                                <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-red-500" onClick={() => removeItem(item.id, 'cart')}>
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Wishlist */}
                    <Card>
                        <CardHeader className="flex flex-row items-center gap-2">
                             <div className="p-2 bg-pink-100 rounded-lg text-pink-600"><Heart className="h-5 w-5" /></div>
                             <CardTitle>Wishlist</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {wishlist.length === 0 ? (
                                <p className="text-muted-foreground text-sm py-8 text-center">Wishlist is empty.</p>
                            ) : (
                                <div className="grid grid-cols-2 gap-4">
                                    {wishlist.map(item => (
                                        <div key={item.id} className="flex items-center gap-3 p-3 bg-card rounded-xl border">
                                            {item.product?.main_image_url && <img src={item.product.main_image_url} className="h-10 w-10 object-cover rounded-md" />}
                                            <div className="flex-1 min-w-0">
                                                <p className="font-medium text-sm truncate">{item.product?.name}</p>
                                                <p className="text-xs text-muted-foreground font-mono">{formatCurrency(item.product?.price)}</p>
                                            </div>
                                            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => removeItem(item.id, 'wishlist')}><Trash2 className="h-3 w-3" /></Button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                 </div>
            </div>
        </div>
    )
}
