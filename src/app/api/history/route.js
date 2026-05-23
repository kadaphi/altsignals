import { getUserFromRequest } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET(req) {
  try {
    const user = await getUserFromRequest(req)
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 })

    const { data: history } = await supabaseAdmin
      .from('trading_history')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(50)

    return Response.json({ history: history || [] })
  } catch {
    return Response.json({ error: 'Something went wrong' }, { status: 500 })
  }
}