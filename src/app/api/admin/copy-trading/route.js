import { getUserFromRequest } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET(req) {
  try {
    const user = await getUserFromRequest(req)
    if (!user?.is_admin) return Response.json({ error: 'Unauthorized' }, { status: 401 })

    const { data: traders } = await supabaseAdmin
      .from('copy_traders')
      .select('*')
      .order('created_at', { ascending: false })

    const { data: subscriptions } = await supabaseAdmin
      .from('copy_trade_subscriptions')
      .select('*, users(full_name, email), copy_traders(name)')
      .order('created_at', { ascending: false })

    const { data: codes } = await supabaseAdmin
      .from('subscription_codes')
      .select('*, copy_traders(name)')
      .order('created_at', { ascending: false })

    return Response.json({ traders: traders || [], subscriptions: subscriptions || [], codes: codes || [] })
  } catch {
    return Response.json({ error: 'Something went wrong' }, { status: 500 })
  }
}

export async function POST(req) {
  try {
    const user = await getUserFromRequest(req)
    if (!user?.is_admin) return Response.json({ error: 'Unauthorized' }, { status: 401 })

    const { action, trader_id, subscription_id, trader_data, subscribers } = await req.json()

    if (action === 'add_trader') {
      const { data: trader } = await supabaseAdmin
        .from('copy_traders')
        .insert(trader_data)
        .select()
        .single()
      return Response.json({ success: true, trader })
    }

    if (action === 'update_subscribers') {
      await supabaseAdmin
        .from('copy_traders')
        .update({ subscribers })
        .eq('id', trader_id)
      return Response.json({ success: true })
    }

    if (action === 'generate_code') {
      const code = Math.random().toString(36).substring(2, 10).toUpperCase()
      const { data: newCode } = await supabaseAdmin
        .from('subscription_codes')
        .insert({ trader_id, code })
        .select()
        .single()
      return Response.json({ success: true, code: newCode })
    }

    if (action === 'activate') {
      const { target_profit, ends_at } = await req.json().catch(() => ({})) || {}
      await supabaseAdmin
        .from('copy_trade_subscriptions')
        .update({
          status: 'active',
          starts_at: new Date().toISOString(),
          target_profit: target_profit || 0,
          ends_at: ends_at || null
        })
        .eq('id', subscription_id)

      const { data: sub } = await supabaseAdmin
        .from('copy_trade_subscriptions')
        .select('user_id, copy_traders(name)')
        .eq('id', subscription_id)
        .single()

      await supabaseAdmin.from('notifications').insert({
        user_id: sub.user_id,
        title: 'Copy Trade Activated',
        message: `Your copy trading subscription has been activated. Your account is now mirroring live trades.`,
        type: 'copy_trade'
      })

      return Response.json({ success: true })
    }

    if (action === 'complete') {
      const { data: sub } = await supabaseAdmin
        .from('copy_trade_subscriptions')
        .select('*, users(*)')
        .eq('id', subscription_id)
        .single()

      await supabaseAdmin
        .from('copy_trade_subscriptions')
        .update({ status: 'completed', completed: true })
        .eq('id', subscription_id)

      await supabaseAdmin
        .from('users')
        .update({
          withdrawal_balance: (sub.users.withdrawal_balance || 0) + Number(sub.target_profit),
          total_profit: (sub.users.total_profit || 0) + Number(sub.target_profit)
        })
        .eq('id', sub.user_id)

      await supabaseAdmin.from('notifications').insert({
        user_id: sub.user_id,
        title: '🎉 Copy Trade Target Reached!',
        message: `Congratulations! Your copy trading target of $${sub.target_profit} has been reached and credited to your withdrawal balance.`,
        type: 'copy_trade'
      })

      return Response.json({ success: true })
    }

    return Response.json({ error: 'Invalid action' }, { status: 400 })
  } catch (error) {
    console.error('Admin copy trading error:', error)
    return Response.json({ error: 'Something went wrong' }, { status: 500 })
  }
}

export async function PUT(req) {
  try {
    const user = await getUserFromRequest(req)
    if (!user?.is_admin) return Response.json({ error: 'Unauthorized' }, { status: 401 })

    const { trader_id, updates } = await req.json()

    await supabaseAdmin
      .from('copy_traders')
      .update(updates)
      .eq('id', trader_id)

    return Response.json({ success: true })
  } catch {
    return Response.json({ error: 'Something went wrong' }, { status: 500 })
  }
}