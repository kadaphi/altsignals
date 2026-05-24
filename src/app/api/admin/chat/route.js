import { getUserFromRequest } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET(req) {
  try {
    const user = await getUserFromRequest(req)
    if (!user?.is_admin) return Response.json({ error: 'Unauthorized' }, { status: 401 })

    const { data: sessions } = await supabaseAdmin
      .from('chat_sessions')
      .select('*, users(full_name, email)')
      .order('created_at', { ascending: false })

    return Response.json({ sessions: sessions || [] })
  } catch {
    return Response.json({ error: 'Something went wrong' }, { status: 500 })
  }
}

export async function POST(req) {
  try {
    const user = await getUserFromRequest(req)
    if (!user?.is_admin) return Response.json({ error: 'Unauthorized' }, { status: 401 })

    const { session_id, message, user_id } = await req.json()

    await supabaseAdmin.from('chat_messages').insert({
      session_id,
      user_id: user.id,
      message,
      is_admin: true
    })

    await supabaseAdmin.from('notifications').insert({
      user_id,
      title: 'New Support Message',
      message: 'You have a new message from AltSignals support.',
      type: 'chat'
    })

    return Response.json({ success: true })
  } catch {
    return Response.json({ error: 'Something went wrong' }, { status: 500 })
  }
}
export async function PUT(req) {
  try {
    const user = await getUserFromRequest(req)
    if (!user?.is_admin) return Response.json({ error: 'Unauthorized' }, { status: 401 })

    const { session_id, status } = await req.json()

    await supabaseAdmin
      .from('chat_sessions')
      .update({ status })
      .eq('id', session_id)

    return Response.json({ success: true })
  } catch {
    return Response.json({ error: 'Something went wrong' }, { status: 500 })
  }
}