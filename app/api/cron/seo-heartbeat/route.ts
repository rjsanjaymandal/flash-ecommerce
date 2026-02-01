
import { revalidatePath } from 'next/cache'
import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
    // 1. Security Check (CRON_SECRET)
    const authHeader = req.headers.get('authorization')
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        return new NextResponse('Unauthorized', { status: 401 })
    }

    try {
        // 2. Revalidate Critical Paths
        // Ensures the "static" shell is refreshed with latest DB content
        const paths = ['/', '/shop', '/blog']
        const categories = ['anime-streetwear', 'heavyweight-cotton', 'oversized-tees', 'hoodies', 'accessories', 'techwear']
        
        paths.forEach(p => revalidatePath(p))
        categories.forEach(c => revalidatePath(`/shop/${c}`))

        // 3. Ping Search Engines (Fire & Forget)
        const sitemapUrl = 'https://flashhfashion.in/sitemap.xml'
        const pingGoogle = fetch(`https://www.google.com/ping?sitemap=${sitemapUrl}`)
        const pingBing = fetch(`https://www.bing.com/ping?sitemap=${sitemapUrl}`)

        // We ideally await these, but don't fail the cron if they time out
        await Promise.allSettled([pingGoogle, pingBing])

        return NextResponse.json({ 
            success: true, 
            message: 'SEO Heartbeat successful. Paths revalidated & Search Engines pinged.',
            timestamp: new Date().toISOString()
        })

    } catch (error) {
        console.error('[SEO Heartbeat] Failed:', error)
        return new NextResponse('Internal Server Error', { status: 500 })
    }
}
