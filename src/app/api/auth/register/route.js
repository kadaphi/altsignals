import { supabaseAdmin } from '@/lib/supabase'
import { generateToken } from '@/lib/auth'
import { sendOTPEmail } from '@/lib/email'
import bcrypt from 'bcryptjs'

export async function POST(req) {
  try {
    const { email, password, full_name } = await req.json()

    if (!email || !password || !full_name) {
      return Response.json({ error: 'All fields are required' }, { status: 400 })
    }

    const { data: existing } = await supabaseAdmin
      .from('users')
      .select('id')
      .eq('email', email.toLowerCase())
      .single()

    if (existing) {
      return Response.json({ error: 'Email already registered' }, { status: 400 })
    }

    const hashedPassword = await bcrypt.hash(password, 10)
    const otp = Math.floor(100000 + Math.random() * 900000).toString()
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000).toISOString()

    const { data: user, error } = await supabaseAdmin
      .from('users')
      .insert({
        email: email.toLowerCase(),
        password: hashedPassword,
        full_name,
        is_verified: false,
        deposit_balance: 0,
        withdrawal_balance: 0,
        total_profit: 0,
        account_level: 'STARTER'
      })
      .select()
      .single()

    if (error) return Response.json({ error: 'Registration failed' }, { status: 500 })

    await supabaseAdmin.from('otps').insert({
      user_id: user.id,
      email: email.toLowerCase(),
      otp,
      expires_at: otpExpiry
    })

    await sendOTPEmail(email, otp, full_name)

    return Response.json({ success: true, message: 'Verification code sent to your email' })
  } catch (error) {
    console.error('Register error:', error)
    return Response.json({ error: 'Something went wrong' }, { status: 500 })
  }
}