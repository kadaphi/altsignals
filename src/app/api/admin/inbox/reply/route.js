import { getUserFromRequest } from '@/lib/auth'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

const validFromAddresses = [
  'support@altsignals.finance',
  'invest@altsignals.finance',
  'compliance@altsignals.finance',
  'noreply@altsignals.finance',
  'verification@altsignals.finance',
]

export async function POST(req) {
  try {
    const user = await getUserFromRequest(req)
    if (!user?.is_admin) return Response.json({ error: 'Unauthorized' }, { status: 401 })

    const { to, subject, message, from_address } = await req.json()

    // Use the address the original email was sent to, fallback to support
    const fromAddress = validFromAddresses.includes(from_address)
      ? from_address
      : 'support@altsignals.finance'

    const fromName = fromAddress.split('@')[0].charAt(0).toUpperCase() + fromAddress.split('@')[0].slice(1)

    await resend.emails.send({
      from: `AltSignals ${fromName} <${fromAddress}>`,
      to,
      subject,
      html: `
        <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#0A0A0F;padding:40px 20px;">
          <div style="border-bottom:2px solid #00E5FF;padding-bottom:16px;margin-bottom:24px;">
            <span style="font-size:20px;font-weight:700;color:#E8E4DC;">ALT<span style="color:#00E5FF;">SIGNALS</span></span>
          </div>
          <div style="color:#E8E4DC;font-size:14px;line-height:1.8;white-space:pre-wrap;">${message}</div>
          <div style="margin-top:32px;padding-top:16px;border-top:1px solid rgba(0,229,255,0.1);color:#8A8E99;font-size:11px;">
            AltSignals ${fromName} · ${fromAddress}
          </div>
        </div>
      `
    })

    return Response.json({ success: true })
  } catch (error) {
    console.error('Reply error:', error)
    return Response.json({ error: 'Something went wrong' }, { status: 500 })
  }
}
