import { getUserFromRequest } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET(req) {
  try {
    const user = await getUserFromRequest(req)
    if (!user?.is_admin) return Response.json({ error: 'Unauthorized' }, { status: 401 })

    const { data: announcements } = await supabaseAdmin
      .from('announcements')
      .select('*')
      .order('created_at', { ascending: false })

    return Response.json({ announcements: announcements || [] })
  } catch {
    return Response.json({ error: 'Something went wrong' }, { status: 500 })
  }
}

export async function POST(req) {
  try {
    const user = await getUserFromRequest(req)
    if (!user?.is_admin) return Response.json({ error: 'Unauthorized' }, { status: 401 })

    const { title, message } = await req.json()

    await supabaseAdmin.from('announcements').insert({ title, message, is_active: true })

    return Response.json({ success: true })
  } catch {
    return Response.json({ error: 'Something went wrong' }, { status: 500 })
  }
}

export async function DELETE(req) {
  try {
    const user = await getUserFromRequest(req)
    if (!user?.is_admin) return Response.json({ error: 'Unauthorized' }, { status: 401 })

    const { id } = await req.json()

    await supabaseAdmin
      .from('announcements')
      .update({ is_active: false })
      .eq('id', id)

    return Response.json({ success: true })
  } catch {
    return Response.json({ error: 'Something went wrong' }, { status: 500 })
  }
}