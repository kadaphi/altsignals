import { getUserFromRequest } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'

export async function POST(req) {
  try {
    const user = await getUserFromRequest(req)
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 })

    const { payment_id, deposit_id } = await req.json()

    const res = await fetch(`https://api.nowpayments.io/v1/payment/${payment_id}`, {
      headers: { 'x-api-key': process.env.NOWPAYMENTS_API_KEY }
    })

    if (!res.ok) {
      const { data: deposit } = await supabaseAdmin
        .from('deposits')
        .select('*')
        .eq('id', deposit_id)
        .eq('user_id', user.id)
        .single()

      if (deposit && deposit.status !== 'completed') {
        await creditDeposit(deposit)
        return Response.json({ status: 'completed', credited: true })
      }
      return Response.json({ status: 'unknown' })
    }

    const payment = await res.json()
    const status = payment.payment_status

    console.log('Payment status check:', payment_id, status, JSON.stringify(payment))

    if (status === 'finished' || status === 'confirmed' || status === 'partially_paid' || status === 'sending') {
      const { data: deposit } = await supabaseAdmin
        .from('deposits')
        .select('*')
        .eq('id', deposit_id)
        .eq('user_id', user.id)
        .single()

      if (!deposit) return Response.json({ status })
      if (deposit.status === 'completed') {
        return Response.json({ status: 'completed', already_processed: true })
      }

      await creditDeposit(deposit)
      return Response.json({ status: 'completed', credited: true })
    }

    return Response.json({ status })
  } catch (error) {
    console.error('Check payment error:', error)
    return Response.json({ status: 'unknown' })
  }
}

async function creditDeposit(deposit) {
  const { data: freshUser } = await supabaseAdmin
    .from('users')
    .select('deposit_balance, total_deposited, full_name')
    .eq('id', deposit.user_id)
    .single()

  if (!freshUser) {
    console.error('User not found for deposit:', deposit.id)
    return
  }

  await supabaseAdmin
    .from('deposits')
    .update({ status: 'completed' })
    .eq('id', deposit.id)

  await supabaseAdmin
    .from('users')
    .update({
      deposit_balance: (freshUser.deposit_balance || 0) + Number(deposit.amount),
      total_deposited: (freshUser.total_deposited || 0) + Number(deposit.amount)
    })
    .eq('id', deposit.user_id)

  await supabaseAdmin.from('trading_history').insert({
    user_id: deposit.user_id,
    type: 'deposit',
    amount: Number(deposit.amount),
    description: `Deposit of $${deposit.amount} via ${deposit.currency?.toUpperCase() || 'crypto'}`,
    reference_id: deposit.id
  })

  await supabaseAdmin.from('notifications').insert({
    user_id: deposit.user_id,
    title: 'Deposit Confirmed',
    message: `Your deposit of $${deposit.amount} has been confirmed and credited to your account.`,
    type: 'deposit'
  })

  if (process.env.PUSHOVER_API_TOKEN) {
    await fetch('https://api.pushover.net/1/messages.json', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        token: process.env.PUSHOVER_API_TOKEN,
        user: process.env.PUSHOVER_USER_KEY,
        title: '💰 New AltSignals Deposit',
        message: `$${deposit.amount} deposit confirmed for ${freshUser.full_name}`,
        priority: 1,
        sound: 'cashregister'
      })
    })
  }
}
