import { supabaseAdmin } from '@/lib/supabase'
import bcrypt from 'bcryptjs'

export async function POST(req) {
  try {
    const { email, otp, password } = await req.json()

    if (!email || !otp || !password) {
      return Response.json({ error: 'All fields are required' }, { status: 400 })
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
      return Response.json({ error: 'Invalid or expired reset code' }, { status: 400 })
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    await supabaseAdmin
      .from('users')
      .update({ password: hashedPassword })
      .eq('id', otpRecord.user_id)

    await supabaseAdmin
      .from('otps')
      .delete()
      .eq('id', otpRecord.id)

    return Response.json({ success: true, message: 'Password reset successfully' })
  } catch (error) {
    console.error('Reset password error:', error)
    return Response.json({ error: 'Something went wrong' }, { status: 500 })
  }
}