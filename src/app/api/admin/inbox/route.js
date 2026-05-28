import { getUserFromRequest } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function GET(req) {
  try {
    const user = await getUserFromRequest(req)
    if (!user?.is_admin) return Response.json({ error: 'Unauthorized' }, { status: 401 })

    const { data: emails } = await supabaseAdmin
      .from('inbound_emails')
      .select('*')
      .order('received_at', { ascending: false })
      .limit(50)

    return Response.json({ emails: emails || [] })
  } catch {
    return Response.json({ error: 'Something went wrong' }, { status: 500 })
  }
}

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
        <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#0A0A0F;color:#E8E4DC;padding:32px;">
          <div style="font-size:20px;font-weight:700;margin-bottom:24px;">
            <span style="color:#00E5FF">ALT</span>SIGNALS
          </div>
          <div style="font-size:14px;line-height:1.8;white-space:pre-wrap;">${message}</div>
          <div style="margin-top:32px;padding-top:16px;border-top:1px solid rgba(0,229,255,0.1);font-size:11px;color:#8A8E99;">
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

export async function PATCH(req) {
  try {
    const user = await getUserFromRequest(req)
    if (!user?.is_admin) return Response.json({ error: 'Unauthorized' }, { status: 401 })

    const { id } = await req.json()

    await supabaseAdmin
      .from('inbound_emails')
      .update({ is_read: true })
      .eq('id', id)

    return Response.json({ success: true })
  } catch {
    return Response.json({ error: 'Something went wrong' }, { status: 500 })
  }
}