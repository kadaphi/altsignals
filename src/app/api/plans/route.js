import { getUserFromRequest } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET(req) {
  try {
    const user = await getUserFromRequest(req)
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 })

    const { data: plans } = await supabaseAdmin
      .from('investment_plans')
      .select('*')
      .eq('is_active', true)
      .order('min_amount', { ascending: true })

    const { data: investments } = await supabaseAdmin
      .from('user_investments')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    return Response.json({ plans: plans || [], investments: investments || [] })
  } catch {
    return Response.json({ error: 'Something went wrong' }, { status: 500 })
  }
}

export async function POST(req) {
  try {
    const user = await getUserFromRequest(req)
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 })

    const { plan_id, amount } = await req.json()

    const { data: plan } = await supabaseAdmin
      .from('investment_plans')
      .select('*')
      .eq('id', plan_id)
      .single()

    if (!plan) return Response.json({ error: 'Plan not found' }, { status: 404 })

    if (amount < plan.min_amount) {
      return Response.json({ error: `Minimum investment is $${plan.min_amount}` }, { status: 400 })
    }

    if (user.deposit_balance < amount) {
      return Response.json({ error: 'INSUFFICIENT_BALANCE' }, { status: 400 })
    }

    const endsAt = new Date()
    endsAt.setDate(endsAt.getDate() + plan.duration_days)

    await supabaseAdmin
      .from('users')
      .update({ deposit_balance: user.deposit_balance - amount })
      .eq('id', user.id)

    await supabaseAdmin.from('user_investments').insert({
      user_id: user.id,
      plan_id,
      amount,
      target_profit: plan.target_profit,
      status: 'active',
      ends_at: endsAt.toISOString()
    })

    await supabaseAdmin.from('trading_history').insert({
      user_id: user.id,
      type: 'investment',
      amount: -amount,
      description: `Investment in ${plan.name} plan`
    })

    await supabaseAdmin.from('notifications').insert({
      user_id: user.id,
      title: 'Investment Activated',
      message: `Your investment of $${amount} in the ${plan.name} plan is now active.`,
      type: 'investment'
    })

    if (process.env.PUSHOVER_API_TOKEN) {
      await fetch('https://api.pushover.net/1/messages.json', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token: process.env.PUSHOVER_API_TOKEN,
          user: process.env.PUSHOVER_USER_KEY,
          title: '📈 New AltSignals Investment',
          message: `${user.full_name} invested $${amount} in ${plan.name} plan`,
          priority: 0
        })
      })
    }

    return Response.json({ success: true, message: 'Investment activated successfully' })
  } catch {
    return Response.json({ error: 'Something went wrong' }, { status: 500 })
  }
}