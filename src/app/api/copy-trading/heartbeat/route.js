import { getUserFromRequest } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'

export async function POST(req) {
  try {
    const user = await getUserFromRequest(req)
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 })

    await supabaseAdmin
      .from('copy_trade_subscriptions')
      .update({ last_active_at: new Date().toISOString() })
      .eq('user_id', user.id)
      .eq('status', 'active')

    return Response.json({ success: true })
  } catch {
    return Response.json({ error: 'Something went wrong' }, { status: 500 })
  }
}