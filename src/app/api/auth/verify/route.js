import { supabaseAdmin } from '@/lib/supabase'
import { generateToken } from '@/lib/auth'
import { sendWelcomeEmail } from '@/lib/email'

export async function POST(req) {
  try {
    const { email, otp } = await req.json()

    if (!email || !otp) {
      return Response.json({ error: 'Email and code are required' }, { status: 400 })
    }

    const { data: otpRecord } = await supabaseAdmin
      .from('otps')
      .select('*')
      .eq('email', email.toLowerCase())
      .eq('otp', otp)
      .gt('expires_at', new Date().toISOString())
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    if (!otpRecord) {
      return Response.json({ error: 'Invalid or expired verification code' }, { status: 400 })
    }

    await supabaseAdmin
      .from('users')
      .update({ is_verified: true })
      .eq('id', otpRecord.user_id)

    await supabaseAdmin
      .from('otps')
      .delete()
      .eq('id', otpRecord.id)

    const { data: user } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('id', otpRecord.user_id)
      .single()

    await sendWelcomeEmail(email, user.full_name)

    const token = generateToken(user.id)

    // Pushover notification
    if (process.env.PUSHOVER_API_TOKEN) {
      await fetch('https://api.pushover.net/1/messages.json', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token: process.env.PUSHOVER_API_TOKEN,
          user: process.env.PUSHOVER_USER_KEY,
          title: '🎉 New AltSignals Registration',
          message: `${user.full_name} (${user.email}) just verified their account`,
          priority: 0
        })
      })
    }

    return Response.json({ success: true, token, user })
  } catch (error) {
    console.error('Verify error:', error)
    return Response.json({ error: 'Something went wrong' }, { status: 500 })
  }
}