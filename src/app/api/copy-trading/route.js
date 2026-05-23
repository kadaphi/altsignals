import { getUserFromRequest } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'

const PAIRS = ['BTC/USDT', 'ETH/USDT', 'SOL/USDT', 'BNB/USDT', 'XRP/USDT', 'ADA/USDT', 'DOGE/USDT', 'MATIC/USDT']

async function runCatchUp(subscription, user) {
  const now = new Date()
  const lastActive = subscription.last_active_at ? new Date(subscription.last_active_at) : new Date(subscription.starts_at)
  const endsAt = new Date(subscription.ends_at)
  const targetProfit = Number(subscription.target_profit || 0)
  const currentProfit = Number(subscription.current_profit || 0)
  const secondsAway = Math.floor((now - lastActive) / 1000)

  if (secondsAway < 10) return

  const targetReached = now >= endsAt

  if (targetReached) {
    const remaining = targetProfit - currentProfit
    if (remaining <= 0) return

    const logCount = Math.floor(Math.random() * 10) + 10
    const logs = []
    let runningTotal = 0

    for (let i = 0; i < logCount - 1; i++) {
      const isLast = i === logCount - 2
      let amount
      if (isLast) {
        amount = Number((remaining - runningTotal).toFixed(2))
      } else {
        amount = Number((Math.random() * (remaining / logCount) * 2).toFixed(2))
      }
      const isPositive = amount >= 0
      const pair = PAIRS[Math.floor(Math.random() * PAIRS.length)]
      logs.push({
        subscription_id: subscription.id,
        user_id: user.id,
        amount,
        type: isPositive ? 'profit' : 'loss',
        description: isPositive ? `Profit from ${pair} trade` : `Loss on ${pair} trade`,
        created_at: new Date(lastActive.getTime() + (i * (secondsAway / logCount) * 1000)).toISOString()
      })
      runningTotal += amount
    }

    if (logs.length > 0) {
      await supabaseAdmin.from('copy_trade_logs').insert(logs)
      await supabaseAdmin.from('trading_history').insert(
        logs.map(l => ({
          user_id: user.id,
          type: 'copy_trade',
          amount: l.amount,
          description: l.description,
          created_at: l.created_at
        }))
      )
    }

    await supabaseAdmin
      .from('copy_trade_subscriptions')
      .update({
        status: 'completed',
        completed: true,
        current_profit: targetProfit,
        last_active_at: now.toISOString()
      })
      .eq('id', subscription.id)

    const { data: freshUser } = await supabaseAdmin
      .from('users')
      .select('withdrawal_balance, total_profit')
      .eq('id', user.id)
      .single()

    await supabaseAdmin
      .from('users')
      .update({
        withdrawal_balance: (freshUser?.withdrawal_balance || 0) + targetProfit,
        total_profit: (freshUser?.total_profit || 0) + targetProfit
      })
      .eq('id', user.id)

    await supabaseAdmin.from('notifications').insert({
      user_id: user.id,
      title: '🎉 Copy Trade Target Reached!',
      message: `Congratulations! Your copy trading target of $${targetProfit} has been reached and credited to your withdrawal balance.`,
      type: 'copy_trade'
    })

  } else {
    const logsToGenerate = Math.min(Math.floor(secondsAway / 4), 200)
    if (logsToGenerate === 0) return

    const totalDuration = endsAt - new Date(subscription.starts_at)
    const elapsed = now - new Date(subscription.starts_at)
    const expectedProgress = Math.min(elapsed / totalDuration, 0.85)
    const expectedProfit = targetProfit * expectedProgress
    const profitNeeded = expectedProfit - currentProfit

    let runningProfit = 0
    const logs = []

    for (let i = 0; i < logsToGenerate; i++) {
      const remaining = profitNeeded - runningProfit
      const isPositive = remaining > 0 ? Math.random() > 0.3 : Math.random() > 0.7
      const maxAmount = Math.abs(remaining / (logsToGenerate - i)) * 2
      const amount = Number((Math.random() * Math.max(maxAmount, 10) + 5).toFixed(2))
      const finalAmount = isPositive ? amount : -amount
      const pair = PAIRS[Math.floor(Math.random() * PAIRS.length)]

      logs.push({
        subscription_id: subscription.id,
        user_id: user.id,
        amount: finalAmount,
        type: isPositive ? 'profit' : 'loss',
        description: isPositive ? `Profit from ${pair} trade` : `Loss on ${pair} trade`,
        created_at: new Date(lastActive.getTime() + (i * (secondsAway / logsToGenerate) * 1000)).toISOString()
      })
      runningProfit += finalAmount
    }

    const newProfit = currentProfit + runningProfit

    if (logs.length > 0) {
      await supabaseAdmin.from('copy_trade_logs').insert(logs)
      await supabaseAdmin.from('trading_history').insert(
        logs.map(l => ({
          user_id: user.id,
          type: 'copy_trade',
          amount: l.amount,
          description: l.description,
          created_at: l.created_at
        }))
      )
    }

    await supabaseAdmin
      .from('copy_trade_subscriptions')
      .update({
        current_profit: newProfit,
        last_active_at: now.toISOString()
      })
      .eq('id', subscription.id)
  }
}

export async function GET(req) {
  try {
    const user = await getUserFromRequest(req)
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 })

    const { data: traders } = await supabaseAdmin
      .from('copy_traders')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: true })

    const { data: subscription } = await supabaseAdmin
      .from('copy_trade_subscriptions')
      .select('*, copy_traders(*)')
      .eq('user_id', user.id)
      .in('status', ['waiting', 'active'])
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    if (subscription?.status === 'active') {
      await runCatchUp(subscription, user)

      const { data: updatedSub } = await supabaseAdmin
        .from('copy_trade_subscriptions')
        .select('*, copy_traders(*)')
        .eq('id', subscription.id)
        .single()

      return Response.json({
        traders: traders || [],
        subscription: updatedSub || subscription
      })
    }

    return Response.json({
      traders: traders || [],
      subscription: subscription || null
    })

  } catch (error) {
    console.error('Copy trading get error:', error)
    return Response.json({ error: 'Something went wrong' }, { status: 500 })
  }
}

export async function POST(req) {
  try {
    const user = await getUserFromRequest(req)
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 })

    const { trader_id, code } = await req.json()

    const { data: trader } = await supabaseAdmin
      .from('copy_traders')
      .select('*')
      .eq('id', trader_id)
      .single()

    if (!trader) return Response.json({ error: 'Trader not found' }, { status: 404 })

    if (user.deposit_balance < trader.min_capital) {
      return Response.json({ error: `INSUFFICIENT_BALANCE:${trader.min_capital}` }, { status: 400 })
    }

    const { data: subCode } = await supabaseAdmin
      .from('subscription_codes')
      .select('*')
      .eq('code', code.toUpperCase())
      .eq('trader_id', trader_id)
      .eq('used', false)
      .single()

    if (!subCode) {
      return Response.json({ error: 'Invalid or already used subscription code' }, { status: 400 })
    }

    const { data: existing } = await supabaseAdmin
      .from('copy_trade_subscriptions')
      .select('id')
      .eq('user_id', user.id)
      .in('status', ['waiting', 'active'])
      .maybeSingle()

    if (existing) {
      return Response.json({ error: 'You already have an active copy trade subscription' }, { status: 400 })
    }

    await supabaseAdmin
      .from('subscription_codes')
      .update({ used: true, used_by: user.id })
      .eq('id', subCode.id)

    await supabaseAdmin
      .from('users')
      .update({ deposit_balance: user.deposit_balance - trader.min_capital })
      .eq('id', user.id)

    await supabaseAdmin.from('trading_history').insert({
      user_id: user.id,
      type: 'copy_trade',
      amount: -trader.min_capital,
      description: `Copy trade subscription: ${trader.name}`
    })

    const { data: subscription } = await supabaseAdmin
      .from('copy_trade_subscriptions')
      .insert({
        user_id: user.id,
        trader_id,
        status: 'waiting',
        last_active_at: new Date().toISOString()
      })
      .select()
      .single()

    await supabaseAdmin
      .from('copy_traders')
      .update({ subscribers: (trader.subscribers || 0) + 1 })
      .eq('id', trader_id)

    await supabaseAdmin.from('notifications').insert({
      user_id: user.id,
      title: 'Copy Trade Subscription Active',
      message: `You are now subscribed to ${trader.name}. Waiting for trader confirmation.`,
      type: 'copy_trade'
    })

    return Response.json({ success: true, subscription })

  } catch (error) {
    console.error('Copy trading post error:', error)
    return Response.json({ error: 'Something went wrong' }, { status: 500 })
  }
}

export async function DELETE(req) {
  try {
    const user = await getUserFromRequest(req)
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 })

    const { subscription_id } = await req.json()

    const { data: subscription } = await supabaseAdmin
      .from('copy_trade_subscriptions')
      .select('*')
      .eq('id', subscription_id)
      .eq('user_id', user.id)
      .single()

    if (!subscription) return Response.json({ error: 'Subscription not found' }, { status: 404 })

    await supabaseAdmin
      .from('copy_trade_subscriptions')
      .update({ status: 'cancelled' })
      .eq('id', subscription_id)

    return Response.json({ success: true })

  } catch (error) {
    console.error('Copy trading delete error:', error)
    return Response.json({ error: 'Something went wrong' }, { status: 500 })
  }
}