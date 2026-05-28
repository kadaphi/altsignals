import { getUserFromRequest } from '@/lib/auth'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(req) {
  try {
    const user = await getUserFromRequest(req)
    if (!user?.is_admin) return Response.json({ error: 'Unauthorized' }, { status: 401 })

    const { to, subject, message } = await req.json()

    await resend.emails.send({
      from: 'AltSignals Support <support@altsignals.finance>',
      to,
      subject,
      html: `
        <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#0A0A0F;padding:40px 20px;">
          <div style="border-bottom:2px solid #00E5FF;padding-bottom:16px;margin-bottom:24px;">
            <span style="font-size:20px;font-weight:700;color:#E8E4DC;">ALT<span style="color:#00E5FF;">SIGNALS</span></span>
          </div>
          <div style="color:#E8E4DC;font-size:14px;line-height:1.8;white-space:pre-wrap;">${message}</div>
          <div style="margin-top:32px;padding-top:16px;border-top:1px solid rgba(0,229,255,0.1);color:#8A8E99;font-size:11px;">
            AltSignals Support Team · support@altsignals.finance
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