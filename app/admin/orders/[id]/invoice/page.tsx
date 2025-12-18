import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { formatCurrency } from '@/lib/utils'
import { Separator } from '@/components/ui/separator'

export default async function InvoicePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const { data: order } = await supabase
    .from('orders')
    .select('*, profiles:user_id(*)')
    .eq('id', id)
    .single()
  
  const { data: items } = await supabase
    .from('order_items')
    .select('*')
    .eq('order_id', id)

  if (!order) notFound()

  return (
    <div className="bg-white min-h-screen text-slate-900 p-12 max-w-4xl mx-auto shadow-sm border border-slate-100 my-8">
      {/* Header */}
      <div className="flex justify-between items-start mb-12">
        <div>
          <h1 className="text-4xl font-black tracking-tighter uppercase italic text-primary">FLASH</h1>
          <p className="text-sm text-slate-500 mt-1 uppercase tracking-widest font-bold">Premium Streetwear</p>
        </div>
        <div className="text-right">
          <h2 className="text-2xl font-black uppercase italic">INVOICE</h2>
          <p className="font-mono text-sm text-slate-500">#{order.id.slice(0, 8).toUpperCase()}</p>
          <p className="text-xs text-slate-400 mt-1">{new Date(order.created_at || "").toLocaleDateString()}</p>
        </div>
      </div>

      <Separator className="bg-slate-100" />

      {/* Bill To / Ship To */}
      <div className="grid grid-cols-2 gap-12 py-12">
        <div>
          <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Billed To</h3>
          <p className="font-bold text-lg">{order.shipping_name}</p>
          <p className="text-slate-600 text-sm mt-1">{order.address_line1}</p>
          {order.address_line2 && <p className="text-slate-600 text-sm">{order.address_line2}</p>}
          <p className="text-slate-600 text-sm">{order.city}, {order.state} {order.pincode}</p>
          <p className="text-slate-600 text-sm">{order.country}</p>
          <p className="text-slate-600 text-sm mt-2">{order.phone}</p>
        </div>
        <div className="text-right">
          <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Payment Details</h3>
          <p className="font-bold">{(order as any).payment_reference ? 'Razorpay' : 'Cash on Delivery'}</p>
          <p className="text-slate-500 text-xs mt-1">Status: <span className="uppercase font-bold text-slate-900">{order.status}</span></p>
          {(order as any).payment_reference && <p className="text-slate-400 text-[10px] mt-1 font-mono">{(order as any).payment_reference}</p>}
        </div>
      </div>

      {/* Items Table */}
      <div className="mt-8">
        <div className="grid grid-cols-6 gap-4 border-b-2 border-slate-900 pb-2 mb-4">
          <span className="col-span-3 text-[10px] font-black uppercase tracking-widest">Description</span>
          <span className="text-center text-[10px] font-black uppercase tracking-widest">Qty</span>
          <span className="text-right text-[10px] font-black uppercase tracking-widest">Price</span>
          <span className="text-right text-[10px] font-black uppercase tracking-widest">Total</span>
        </div>
        <div className="space-y-4 divide-y divide-slate-50">
          {items?.map((item) => (
            <div key={item.id} className="grid grid-cols-6 gap-4 pt-4">
              <div className="col-span-3">
                <p className="font-bold uppercase tracking-tight italic">{item.name_snapshot}</p>
                <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold mt-1">
                  {item.size && `Size: ${item.size}`} {item.color && `| Color: ${item.color}`}
                </p>
              </div>
              <span className="text-center font-bold text-slate-600">{item.quantity}</span>
              <span className="text-right text-slate-500 font-medium italic">{formatCurrency(item.unit_price)}</span>
              <span className="text-right font-black italic">{formatCurrency(item.unit_price * item.quantity)}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Footer / Summary */}
      <div className="mt-12 flex justify-end">
        <div className="w-64 space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Subtotal</span>
            <span className="font-bold italic">{formatCurrency(order.subtotal || order.total - (order.shipping_fee || 0))}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Shipping</span>
            <span className="font-bold italic">{formatCurrency(order.shipping_fee || 0)}</span>
          </div>
          {(order.discount_amount || 0) > 0 && (
              <div className="flex justify-between text-sm text-primary">
                <span className="font-bold uppercase tracking-widest text-[10px]">Discount</span>
                <span className="font-bold italic">-{formatCurrency(order.discount_amount || 0)}</span>
              </div>
          )}
          <Separator className="bg-slate-900 h-0.5" />
          <div className="flex justify-between text-xl pt-2">
            <span className="font-black uppercase tracking-tighter italic">Total Amount</span>
            <span className="font-black italic underline decoration-primary decoration-4 underline-offset-4">{formatCurrency(order.total)}</span>
          </div>
        </div>
      </div>

      <div className="mt-24 pt-12 border-t border-slate-100 text-center">
        <p className="text-[8px] font-black uppercase tracking-[0.5em] text-slate-300">Thank you for riding with Flash</p>
        <p className="text-[10px] text-slate-400 mt-2 italic font-bold">This is a system generated invoice.</p>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          body { margin: 0; padding: 0; background: white; }
          .min-h-screen { min-height: auto; }
          .my-8 { margin: 0; }
          .p-12 { padding: 40px; }
          .shadow-sm, .border-slate-100 { box-shadow: none; border: none; }
          button { display: none !important; }
        }
      `}} />
    </div>
  )
}
