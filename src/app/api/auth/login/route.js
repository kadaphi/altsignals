import { supabaseAdmin } from '@/lib/supabase'
import { generateToken } from '@/lib/auth'
import bcrypt from 'bcryptjs'

export async function POST(req) {
  try {
    const { email, password } = await req.json()

    if (!email || !password) {
      return Response.json({ error: 'Email and password are required' }, { status: 400 })
    }

    const { data: user } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('email', email.toLowerCase())
      .single()

    if (!user) {
      return Response.json({ error: 'Invalid email or password' }, { status: 401 })
    }

    const validPassword = await bcrypt.compare(password, user.password)
    if (!validPassword) {
      return Response.json({ error: 'Invalid email or password' }, { status: 401 })
    }

    if (!user.is_verified) {
      return Response.json({ error: 'Please verify your email first' }, { status: 401 })
    }

    if (user.is_banned) {
      return Response.json({ error: 'Your account has been suspended' }, { status: 401 })
    }

    const token = generateToken(user.id)

    return Response.json({ success: true, token, user })
  } catch (error) {
    console.error('Login error:', error)
    return Response.json({ error: 'Something went wrong' }, { status: 500 })
  }
}