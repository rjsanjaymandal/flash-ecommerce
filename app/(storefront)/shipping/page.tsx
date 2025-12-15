import { Truck, Globe, Clock, ShieldCheck } from "lucide-react"

export default function ShippingPage() {
  return (
    <div className="container mx-auto px-4 py-20 lg:py-32 max-w-4xl">
      <h1 className="text-4xl font-bold tracking-tight mb-8">Shipping & Delivery</h1>
      
      <div className="grid md:grid-cols-2 gap-8 mb-12">
            <div className="p-6 rounded-2xl border bg-muted/20 flex flex-col items-start gap-4">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                    <Truck className="h-5 w-5" />
                </div>
                <div>
                    <h3 className="font-semibold text-lg">Fast Domestic Shipping</h3>
                    <p className="text-muted-foreground">Delivery within 3-5 business days for all standard orders.</p>
                </div>
            </div>
             <div className="p-6 rounded-2xl border bg-muted/20 flex flex-col items-start gap-4">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                    <Clock className="h-5 w-5" />
                </div>
                <div>
                    <h3 className="font-semibold text-lg">Same-Day Processing</h3>
                    <p className="text-muted-foreground">Orders placed before 2 PM are processed the same day.</p>
                </div>
            </div>
      </div>

      <div className="prose prose-sm dark:prose-invert text-muted-foreground">
        <h3 className="text-foreground text-xl font-semibold">International Shipping</h3>
        <p>
          We currently ship to over 50 countries. International delivery times vary from 7-14 business days depending on the destination and customs processing.
        </p>
        
        <h3 className="text-foreground text-xl font-semibold mt-6">Tracking Your Order</h3>
        <p>
          You will receive a shipment confirmation email with a tracking number once your order has been dispatched.
        </p>

        <h3 className="text-foreground text-xl font-semibold mt-6">Returns</h3>
        <p>
            If you are not satisfied with your purchase, you can return it within 14 days for a full refund. Please see our FAQ for more details on returns.
        </p>
      </div>
    </div>
  )
}
