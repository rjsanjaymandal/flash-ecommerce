import { NextResponse } from 'next/server'
import { resend } from '@/lib/email/client'
import { createAdminClient } from '@/lib/supabase/admin'

export async function GET(req: Request) {
    const supabase = createAdminClient()
    const { searchParams } = new URL(req.url)
    const targetEmail = searchParams.get('email') || 'lgbtqfashionflash@gmail.com' // DANGER: Default to admin if not provided

    const apiKey = process.env.RESEND_API_KEY
    const keyStatus = apiKey ? (apiKey.startsWith('re_') ? 'Valid Format (re_...)' : 'Invalid Format') : 'Missing'

    console.log('[Debug] Email Test Initiated')
    console.log(`[Debug] Target: ${targetEmail}`)
    console.log(`[Debug] Key Status: ${keyStatus}`)

    try {
        if (!apiKey) {
            throw new Error('RESEND_API_KEY is not defined in environment variables')
        }

        const { data, error } = await resend.emails.send({
            from: 'FLASH Debug <system@flashhfashion.in>',
            to: targetEmail,
            subject: '🔍 Flash Email Diagnostic Test',
            html: `
                <h1>Email System Verify</h1>
                <p>This is a test email from the Flash Ecommerce diagnostic tool.</p>
                <p><strong>Timestamp:</strong> ${new Date().toISOString()}</p>
                <p><strong>Key Status:</strong> ${keyStatus}</p>
                <hr />
                <p>If you received this, the email pipeline is working.</p>
            `
        })

        if (error) {
            console.error('[Debug] Resend API Verification Failed:', error)
            
            await supabase.from('system_logs').insert({
                severity: 'ERROR',
                component: 'EMAIL_DEBUG',
                message: `Diagnostic failed: ${error.message}`,
                metadata: { error }
            })

            return NextResponse.json({ 
                success: false, 
                step: 'Resend API Call',
                error: error,
                config: { keyStatus }
            }, { status: 500 })
        }

        console.log('[Debug] Email sent successfully:', data)

        await supabase.from('system_logs').insert({
            severity: 'INFO',
            component: 'EMAIL_DEBUG',
            message: 'Diagnostic email sent successfully',
            metadata: { id: data?.id, target: targetEmail }
        })

        return NextResponse.json({
            success: true,
            id: data?.id,
            target: targetEmail,
            config: { keyStatus }
        })

    } catch (e: any) {
        console.error('[Debug] Unexpected Error:', e)
        return NextResponse.json({
            success: false,
            step: 'Internal Logic',
            error: e.message,
            stack: e.stack,
            config: { keyStatus }
        }, { status: 500 })
    }
}
