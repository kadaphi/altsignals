import { getUserFromRequest } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(req) {
  try {
    const user = await getUserFromRequest(req)
    if (!user?.is_admin) return Response.json({ error: 'Unauthorized' }, { status: 401 })

    const { user_id, subject, message } = await req.json()

    const { data: targetUser } = await supabaseAdmin
      .from('users')
      .select('email, full_name')
      .eq('id', user_id)
      .single()

    if (!targetUser) return Response.json({ error: 'User not found' }, { status: 404 })

    await resend.emails.send({
      from: 'AltSignals <noreply@altsignals.finance>',
      to: targetUser.email,
      subject,
      html: `
        <div style="font-family:'Helvetica Neue',Arial,sans-serif;max-width:560px;margin:0 auto;background:#0A0A0F;color:#E8E4DC;padding:48px 40px;">
          <div style="margin-bottom:32px;">
            <span style="font-size:22px;font-weight:700;letter-spacing:2px;color:#00E5FF;">ALT<span style="color:#ffffff">SIGNALS</span></span>
          </div>
          <h1 style="font-size:24px;font-weight:600;margin-bottom:16px;color:#ffffff;">Hi ${targetUser.full_name},</h1>
          <div style="font-size:14px;color:#8A8E99;line-height:1.8;">${message}</div>
          <div style="margin-top:32px;padding-top:32px;border-top:1px solid rgba(0,229,255,0.1);font-size:11px;color:rgba(138,142,153,0.5);">
            AltSignals Support Team
          </div>
        </div>
      `
    })

    return Response.json({ success: true })
  } catch {
    return Response.json({ error: 'Something went wrong' }, { status: 500 })
  }
}