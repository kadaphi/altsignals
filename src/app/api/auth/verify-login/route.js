import { supabaseAdmin } from '@/lib/supabase'

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
      .from('otps')
      .delete()
      .eq('id', otpRecord.id)

    return Response.json({ success: true })
  } catch (error) {
    console.error('Verify login error:', error)
    return Response.json({ error: 'Something went wrong' }, { status: 500 })
  }
}