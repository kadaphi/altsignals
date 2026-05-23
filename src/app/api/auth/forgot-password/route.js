import { supabaseAdmin } from '@/lib/supabase'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(req) {
  try {
    const { email } = await req.json()

    if (!email) {
      return Response.json({ error: 'Email is required' }, { status: 400 })
    }

    const { data: user } = await supabaseAdmin
      .from('users')
      .select('id, full_name')
      .eq('email', email.toLowerCase())
      .single()

    if (!user) {
      return Response.json({ success: true, message: 'If this email exists, a reset code has been sent' })
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString()
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000).toISOString()

    await supabaseAdmin.from('otps').insert({
      user_id: user.id,
      email: email.toLowerCase(),
      otp,
      expires_at: otpExpiry
    })

    await resend.emails.send({
      from: 'AltSignals <noreply@altsignals.finance>',
      to: email,
      subject: 'Reset Your AltSignals Password',
      html: `
        <div style="font-family:'Helvetica Neue',Arial,sans-serif;max-width:560px;margin:0 auto;background:#0A0A0F;color:#E8E4DC;padding:48px 40px;">
          <div style="margin-bottom:32px;">
            <span style="font-size:22px;font-weight:700;letter-spacing:2px;color:#00E5FF;">ALT<span style="color:#ffffff">SIGNALS</span></span>
          </div>
          <h1 style="font-size:28px;font-weight:300;margin-bottom:16px;color:#ffffff;">Password Reset</h1>
          <p style="font-size:14px;color:#8A8E99;line-height:1.8;margin-bottom:32px;">Hi ${user.full_name}, use the code below to reset your password.</p>
          <div style="background:#111320;border:1px solid rgba(0,229,255,0.2);padding:28px;text-align:center;margin-bottom:32px;">
            <div style="font-size:42px;font-weight:700;letter-spacing:12px;color:#00E5FF;">${otp}</div>
            <div style="font-size:12px;color:#8A8E99;margin-top:12px;">Valid for 10 minutes</div>
          </div>
          <p style="font-size:12px;color:#8A8E99;">If you did not request this, please ignore this email.</p>
        </div>
      `
    })

    return Response.json({ success: true, message: 'Reset code sent to your email' })
  } catch (error) {
    console.error('Forgot password error:', error)
    return Response.json({ error: 'Something went wrong' }, { status: 500 })
  }
}