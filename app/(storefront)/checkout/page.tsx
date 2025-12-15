'use client'

import { useCart } from "@/context/cart-context"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/context/auth-context"
import { createClient } from "@/lib/supabase/client"
import { useState } from "react"
import { Loader2 } from "lucide-react"
import { formatCurrency } from "@/lib/utils"
import Script from 'next/script'
import { createOrder } from "./actions"

declare global {
    interface Window {
        Razorpay: any;
    }
}

export default function CheckoutPage() {
  const { items, cartTotal, clearCart } = useCart()
  const { user } = useAuth()
  const [isProcessing, setIsProcessing] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const supabase = createClient()
  
  // Form State
  const [formData, setFormData] = useState({
      firstName: '',
      lastName: '',
      address: '',
      city: '',
      state: '',
      zip: '',
      country: '',
      phone: ''
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleCheckout = async (e: React.FormEvent) => {
      e.preventDefault()
      setIsProcessing(true)

      try {
          // 1. Create Order & Items (using Server Action)
          const order = await createOrder({
              user_id: user?.id || null, 
              subtotal: cartTotal,
              total: cartTotal,
              shipping_name: `${formData.firstName} ${formData.lastName}`,
              phone: formData.phone,
              address_line1: formData.address,
              city: formData.city,
              state: formData.state,
              pincode: formData.zip,
              country: formData.country,
              payment_provider: 'razorpay',
              payment_reference: '',
              items: items
          })

          // 3. Create Razorpay Order
          const response = await fetch('/api/razorpay/order', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ amount: cartTotal, currency: 'INR' })
          })
          const rzpOrder = await response.json()
          
          if (!response.ok) throw new Error(rzpOrder.error || 'Failed to create Razorpay order')

          // 4. Open Razorpay Checkout
          const options = {
              key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID, 
              amount: rzpOrder.amount, 
              currency: rzpOrder.currency,
              name: "Flash Ecommerce",
              description: "Order Payment",
              order_id: rzpOrder.id,
              handler: async function (paymentResponse: any) {
                  // 5. Verify Payment
                  const verifyRes = await fetch('/api/razorpay/verify', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({
                          razorpay_order_id: paymentResponse.razorpay_order_id,
                          razorpay_payment_id: paymentResponse.razorpay_payment_id,
                          razorpay_signature: paymentResponse.razorpay_signature
                      })
                  })
                  const verifyData = await verifyRes.json()

                  if (verifyData.verified) {
                      // 6. Update Order Status
                      await supabase
                          .from('orders')
                          .update({ 
                              status: 'paid',
                              payment_provider: 'razorpay',
                              payment_reference: paymentResponse.razorpay_payment_id
                          })
                          .eq('id', (order as any).id)

                      setIsSuccess(true)
                      clearCart()
                  } else {
                      alert('Payment verification failed. Please contact support.')
                  }
              },
              prefill: {
                  name: `${formData.firstName} ${formData.lastName}`,
                  email: user?.email || 'guest@example.com',
                  contact: formData.phone
              },
              theme: {
                  color: "#000000"
              },
              modal: {
                  ondismiss: function() {
                      setIsProcessing(false)
                  }
              }
          };

          const rzp1 = new window.Razorpay(options);
          rzp1.open();

      } catch (err: any) {
          console.error('Checkout failed detailed:', {
              message: err?.message,
              details: err?.details,
              hint: err?.hint,
              code: err?.code,
              fullError: err
          })
          alert(`Checkout failed: ${err?.message || 'Unknown error'}`)
          setIsProcessing(false)
      }
      // Note: setIsProcessing(false) is handled in modal dismiss or catch to prevent early button enable
  }

  if (isSuccess) {
      return (
          <div className="min-h-screen flex items-center justify-center p-4 text-center animate-in fade-in duration-500">
              <div className="max-w-md space-y-6 bg-card p-8 rounded-2xl border shadow-xl">
                  <div className="mx-auto w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center">
                      <Loader2 className="h-8 w-8 animate-pulse" /> 
                      {/* Using Loader as placeholder or Check icon if imported */}
                  </div>
                  <h1 className="text-3xl font-bold">Order Received!</h1>
                  <p className="text-muted-foreground">Thank you, {formData.firstName}. We'll send shipping updates to your email.</p>
                  <Button asChild className="w-full h-12 text-lg rounded-full"><a href="/">Back to Shop</a></Button>
              </div>
          </div>
      )
  }

  if (items.length === 0) {
      return (
          <div className="min-h-screen pt-32 text-center text-muted-foreground">
              Your cart is empty. <a href="/shop" className="text-primary hover:underline font-bold">Go Shop</a>
          </div>
      )
  }

  return (
    <div className="min-h-screen pt-24 pb-12 container mx-auto px-4">
        <h1 className="text-4xl font-black tracking-tight mb-8">Checkout</h1>
        <div className="grid md:grid-cols-2 gap-12">
            <form onSubmit={handleCheckout} className="space-y-6 animate-in slide-in-from-left-5 duration-500">
                <div className="space-y-4 rounded-xl border border-border p-6 shadow-sm bg-card/50 backdrop-blur-sm">
                    <h2 className="text-xl font-bold flex items-center gap-2">1. Shipping Information</h2>
                    <div className="grid grid-cols-2 gap-4">
                        <Input name="firstName" placeholder="First Name" required value={formData.firstName} onChange={handleInputChange} />
                        <Input name="lastName" placeholder="Last Name" required value={formData.lastName} onChange={handleInputChange} />
                    </div>
                    <Input name="address" placeholder="Address" required value={formData.address} onChange={handleInputChange} />
                    <Input name="city" placeholder="City" required value={formData.city} onChange={handleInputChange} />
                    <div className="grid grid-cols-2 gap-4">
                        <Input name="state" placeholder="State/Province" required value={formData.state} onChange={handleInputChange} />
                        <Input name="zip" placeholder="Postal Code" required value={formData.zip} onChange={handleInputChange} />
                    </div>
                    <Input name="country" placeholder="Country" required value={formData.country} onChange={handleInputChange} />
                    <Input name="phone" placeholder="Phone" type="tel" required value={formData.phone} onChange={handleInputChange} />
                </div>

                <div className="space-y-4 rounded-xl border border-border p-6 shadow-sm bg-card/50 backdrop-blur-sm">
                    <h2 className="text-xl font-bold">2. Payment</h2>
                    <div className="bg-muted/50 p-4 rounded-lg text-sm text-muted-foreground border border-blue-200/20">
                        This is a demo store. No payment processing is active. Click Pay to simulate an order.
                    </div>
                    <Input placeholder="Card Number (Demo)" disabled className="bg-muted cursor-not-allowed" />
                </div>

                <Button type="submit" size="lg" className="w-full h-14 text-lg rounded-full shadow-lg shadow-primary/20" disabled={isProcessing}>
                    {isProcessing && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
                    {isProcessing ? 'Processing Order...' : `Pay ${formatCurrency(cartTotal)}`}
                </Button>
            </form>

            <div className="space-y-6 animate-in slide-in-from-right-5 duration-500 delay-100">
                <div className="bg-muted/30 p-8 rounded-2xl space-y-6 sticky top-24 border border-border">
                    <h2 className="font-bold text-xl">Order Summary</h2>
                    <div className="space-y-4">
                        {items.map(item => (
                            <div key={`${item.productId}-${item.size}`} className="flex justify-between items-center text-sm">
                                <div className="flex items-center gap-3">
                                    {item.image && <img src={item.image} className="h-10 w-10 rounded-md object-cover" />}
                                    <div>
                                        <p className="font-medium">{item.name}</p>
                                        <p className="text-muted-foreground text-xs">{item.size} / {item.color} x {item.quantity}</p>
                                    </div>
                                </div>
                                <span className="font-mono">{formatCurrency(item.price * item.quantity)}</span>
                            </div>
                        ))}
                    </div>
                    <div className="border-t border-border pt-4 flex justify-between font-bold text-2xl">
                        <span>Total</span>
                        <span>{formatCurrency(cartTotal)}</span>
                    </div>
                </div>
            </div>
        </div>
    <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />
  </div>
  )
}
