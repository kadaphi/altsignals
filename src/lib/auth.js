import jwt from 'jsonwebtoken'
import { supabaseAdmin } from './supabase'

export function generateToken(userId) {
  return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '30d' })
}

export function verifyToken(token) {
  try {
    return jwt.verify(token, process.env.JWT_SECRET)
  } catch {
    return null
  }
}

export async function getUserFromRequest(req) {
  try {
    const authHeader = req.headers.get('authorization')
    if (!authHeader?.startsWith('Bearer ')) return null
    const token = authHeader.split(' ')[1]
    const decoded = verifyToken(token)
    if (!decoded) return null
    const { data: user } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('id', decoded.userId)
      .single()
    return user || null
  } catch {
    return null
  }
}