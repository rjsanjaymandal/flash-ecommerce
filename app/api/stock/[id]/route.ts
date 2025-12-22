import { createStaticClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params

    if (!id || !/^[0-9a-f]{8}-[0-9a-f]{4}-[4][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id)) {
         return NextResponse.json({ error: 'Invalid ID' }, { status: 400 })
    }

    const supabase = createStaticClient()
    
    // Fetch product stock variants
    const { data, error } = await supabase
        .from('product_stock')
        .select('size, color, quantity')
        .eq('product_id', id)

    if (error) {
        console.error("Stock API Error:", error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data)
}
