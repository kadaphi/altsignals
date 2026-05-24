import { getUserFromRequest } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET(req) {
  try {
    const user = await getUserFromRequest(req)
    if (!user?.is_admin) return Response.json({ error: 'Unauthorized' }, { status: 401 })

    const { searchParams } = new URL(req.url)
    const session_id = searchParams.get('session_id')

    if (!session_id) return Response.json({ error: 'Session ID required' }, { status: 400 })

    const { data: messages } = await supabaseAdmin
      .from('chat_messages')
      .select('*')
      .eq('session_id', session_id)
      .order('created_at', { ascending: true })

    return Response.json({ messages: messages || [] })
  } catch {
    return Response.json({ error: 'Something went wrong' }, { status: 500 })
  }
}