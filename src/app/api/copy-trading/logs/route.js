import { getUserFromRequest } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET(req) {
  try {
    const user = await getUserFromRequest(req)
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 })

    const { data: subscription } = await supabaseAdmin
      .from('copy_trade_subscriptions')
      .select('*')
      .eq('user_id', user.id)
      .in('status', ['active', 'waiting'])
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    const { data: logs } = await supabaseAdmin
      .from('copy_trade_logs')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(50)

    return Response.json({ logs: logs || [], subscription })
  } catch {
    return Response.json({ error: 'Something went wrong' }, { status: 500 })
  }
}

export async function POST(req) {
  try {
    const user = await getUserFromRequest(req)
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 })

    const { amount, description, type } = await req.json()

    const { data: subscription } = await supabaseAdmin
      .from('copy_trade_subscriptions')
      .select('*')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .single()

    if (!subscription) return Response.json({ error: 'No active subscription' }, { status: 404 })

    await supabaseAdmin.from('copy_trade_logs').insert({
      subscription_id: subscription.id,
      user_id: user.id,
      amount,
      type,
      description
    })

    await supabaseAdmin.from('trading_history').insert({
      user_id: user.id,
      type: 'copy_trade',
      amount,
      description
    })

    const newProfit = (subscription.current_profit || 0) + amount

    await supabaseAdmin
      .from('copy_trade_subscriptions')
      .update({ current_profit: newProfit })
      .eq('id', subscription.id)

    return Response.json({ success: true })
  } catch {
    return Response.json({ error: 'Something went wrong' }, { status: 500 })
  }
}