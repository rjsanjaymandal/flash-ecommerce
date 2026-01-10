import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { PaymentProcessor } from '@/lib/services/payment-processor'

export const dynamic = 'force-dynamic'

export async function GET(req: Request) {
  // 1. Security Check (CRON_SECRET)
  // Allow running if in dev mode locally or if header matches
  const authHeader = req.headers.get('authorization')
  if (process.env.NODE_ENV !== 'development' && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createAdminClient()
  
  // 2. Fetch Stale Pending Orders
  // Pending orders created more than 10 minutes ago
  const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000).toISOString()
  
  const { data: pendingOrders, error } = await supabase
    .from('orders')
    .select('id, created_at, user_id, total')
    .eq('status', 'pending')
    .lt('created_at', tenMinutesAgo)
    .limit(50) // Batch size

  if (error || !pendingOrders) {
      return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 })
  }

  const results = {
      scanned: pendingOrders.length,
      recovered: 0,
      failed: 0,
      details: [] as string[]
  }

  console.log(`[Reconcile] Scanning ${pendingOrders.length} pending orders...`)

  // 3. Process Each Order
  for (const order of pendingOrders) {
      try {
          // A. Check Razorpay Status
          const rzpOrder = await PaymentProcessor.findRazorpayOrderByReceipt(order.id)
          
          if (!rzpOrder) {
              // Order exists in DB but not in Razorpay? 
              // Likely user abandoned before even init. Ignore or Mark 'abandoned' if old enough?
              continue
          }

          if (rzpOrder.status === 'paid') {
              console.log(`[Reconcile] FOUND GHOST ORDER: ${order.id}`)
              
              // B. Fetch Payment ID
              const payments = await PaymentProcessor.getPaymentsForOrder(rzpOrder.id)
              const successfulPayment = payments.find((p: any) => p.status === 'captured')

              if (successfulPayment) {
                  // C. Sync
                  const result = await PaymentProcessor.processPayment(order.id, successfulPayment.id)
                  
                  if (result.success) {
                      results.recovered++
                      results.details.push(`Recovered ${order.id}`)
                      
                      // Log to System Logs
                      await supabase.from('system_logs').insert({
                          severity: 'INFO',
                          component: 'CRON_RECONCILE',
                          message: `Auto-recovered Order ${order.id}`,
                          metadata: { paymentId: successfulPayment.id }
                      })
                  } else {
                      results.failed++
                  }
              }
          } else if (rzpOrder.status === 'attempted') {
              // User tried but failed. We could trigger an abandoned cart email here in future.
          }

      } catch (err) {
          console.error(`[Reconcile] Error processing ${order.id}:`, err)
          results.failed++
      }
  }

  return NextResponse.json(results)
}
