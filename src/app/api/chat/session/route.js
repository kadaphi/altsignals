import { getUserFromRequest } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET(req) {
  try {
    const user = await getUserFromRequest(req)
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 })

    const { data: sessions } = await supabaseAdmin
      .from('chat_sessions')
      .select('*, users(full_name, email)')
      .eq('status', 'open')
      .order('created_at', { ascending: false })

    return Response.json({ sessions: sessions || [] })
  } catch {
    return Response.json({ error: 'Something went wrong' }, { status: 500 })
  }
}