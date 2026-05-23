import { getUserFromRequest } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'
import bcrypt from 'bcryptjs'

export async function GET(req) {
  try {
    const user = await getUserFromRequest(req)
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 })
    return Response.json({ user })
  } catch {
    return Response.json({ error: 'Something went wrong' }, { status: 500 })
  }
}

export async function PUT(req) {
  try {
    const user = await getUserFromRequest(req)
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 })

    const { full_name, current_password, new_password } = await req.json()

    const updates = {}
    if (full_name) updates.full_name = full_name

    if (current_password && new_password) {
      const validPassword = await bcrypt.compare(current_password, user.password)
      if (!validPassword) return Response.json({ error: 'Current password is incorrect' }, { status: 400 })
      updates.password = await bcrypt.hash(new_password, 10)
    }

    const { data: updatedUser } = await supabaseAdmin
      .from('users')
      .update(updates)
      .eq('id', user.id)
      .select()
      .single()

    return Response.json({ success: true, user: updatedUser })
  } catch {
    return Response.json({ error: 'Something went wrong' }, { status: 500 })
  }
}