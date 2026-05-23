import { getUserFromRequest } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET(req) {
  try {
    const user = await getUserFromRequest(req)
    if (!user?.is_admin) return Response.json({ error: 'Unauthorized' }, { status: 401 })

    const { data: users } = await supabaseAdmin
      .from('users')
      .select('*')
      .order('created_at', { ascending: false })

    return Response.json({ users: users || [] })
  } catch {
    return Response.json({ error: 'Something went wrong' }, { status: 500 })
  }
}

export async function PUT(req) {
  try {
    const user = await getUserFromRequest(req)
    if (!user?.is_admin) return Response.json({ error: 'Unauthorized' }, { status: 401 })

    const { user_id, updates } = await req.json()

    await supabaseAdmin
      .from('users')
      .update(updates)
      .eq('id', user_id)

    return Response.json({ success: true })
  } catch {
    return Response.json({ error: 'Something went wrong' }, { status: 500 })
  }
}