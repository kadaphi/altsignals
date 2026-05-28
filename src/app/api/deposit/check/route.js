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
  await creditDeposit(deposit, null)
  return Response.json({ status: 'completed', credited: true })
}
      return Response.json({ status: 'unknown' })
    }

    const payment = await res.json()
    const status = payment.payment_status

    console.log('Payment status check:', payment_id, status, 'actually_paid:', payment.actually_paid)

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

      await creditDeposit(deposit, payment)
      return Response.json({ status: 'completed', credited: true })
    }

    return Response.json({ status })
  } catch (error) {
    console.error('Check payment error:', error)
    return Response.json({ status: 'unknown' })
  }
}

async function creditDeposit(deposit, payment) {
  const { data: freshUser } = await supabaseAdmin
    .from('users')
    .select('deposit_balance, total_deposited, full_name')
    .eq('id', deposit.user_id)
    .single()

  if (!freshUser) return

  // Use actually_paid from NOWPayments if available, otherwise use invoice amount
  const invoiceAmount = Number(deposit.amount)
  const actuallyPaid = payment?.actually_paid ? Number(payment.actually_paid) : null
  const creditAmount = actuallyPaid && actuallyPaid < invoiceAmount ? actuallyPaid : invoiceAmount
  const isPartial = creditAmount < invoiceAmount

  await supabaseAdmin
    .from('deposits')
    .update({ status: 'completed', amount: creditAmount })
    .eq('id', deposit.id)

  await supabaseAdmin
    .from('users')
    .update({
      deposit_balance: (freshUser.deposit_balance || 0) + creditAmount,
      total_deposited: (freshUser.total_deposited || 0) + creditAmount
    })
    .eq('id', deposit.user_id)

  await supabaseAdmin.from('trading_history').insert({
    user_id: deposit.user_id,
    type: 'deposit',
    amount: creditAmount,
    description: `Deposit of $${creditAmount} via ${deposit.currency?.toUpperCase() || 'crypto'}${isPartial ? ` (partial — invoice was $${invoiceAmount})` : ''}`,
    reference_id: deposit.id
  })

  await supabaseAdmin.from('notifications').insert({
    user_id: deposit.user_id,
    title: 'Deposit Confirmed',
    message: isPartial
      ? `Your deposit of $${creditAmount} has been credited. Note: your invoice was $${invoiceAmount} — the difference was deducted in network fees.`
      : `Your deposit of $${creditAmount} has been confirmed and credited to your account.`,
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
        message: `$${creditAmount} deposit confirmed for ${freshUser.full_name}${isPartial ? ` (partial of $${invoiceAmount})` : ''}`,
        priority: 1,
        sound: 'cashregister'
      })
    })
  }
}