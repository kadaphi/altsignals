import { supabaseAdmin } from '@/lib/supabase'
import crypto from 'crypto'

export async function GET(req) {
  return new Response('ok', { status: 200 })
}

export async function POST(req) {
  try {
    const rawBody = await req.text()
    const hmacHeader = req.headers.get('hmac')

    // Validate HMAC signature
    if (hmacHeader && process.env.OXAPAY_MERCHANT_KEY) {
      const calculatedHmac = crypto
        .createHmac('sha512', process.env.OXAPAY_MERCHANT_KEY)
        .update(rawBody)
        .digest('hex')
      if (calculatedHmac !== hmacHeader) {
        console.error('Invalid HMAC signature')
        return new Response('Invalid signature', { status: 401 })
      }
    }

    const data = JSON.parse(rawBody)
    console.log('OxaPay webhook received:', JSON.stringify(data))

    const { status, order_id, track_id, txs } = data

    // Only credit on Paid status
    if (status !== 'Paid') {
      return new Response('ok', { status: 200 })
    }

    // Get actual amount paid from txs
    const actualAmount = txs?.[0]?.sent_amount || data.amount
    const paidCurrency = txs?.[0]?.currency || data.currency

    // Find deposit by order_id
    let deposit = null

    if (order_id) {
      const { data: found } = await supabaseAdmin
        .from('deposits')
        .select('*, users(*)')
        .eq('order_id', String(order_id))
        .maybeSingle()
      if (found) deposit = found
    }

    if (!deposit && track_id) {
      const { data: found } = await supabaseAdmin
        .from('deposits')
        .select('*, users(*)')
        .eq('oxapay_track_id', String(track_id))
        .maybeSingle()
      if (found) deposit = found
    }

    if (!deposit) {
      console.error('Deposit not found for order_id:', order_id)
      return new Response('ok', { status: 200 })
    }

    if (deposit.status === 'completed') {
      return new Response('ok', { status: 200 })
    }

    // Credit the actual amount paid
    const creditAmount = Number(actualAmount) || Number(deposit.amount)

    await supabaseAdmin
      .from('deposits')
      .update({ status: 'completed', amount: creditAmount, oxapay_track_id: String(track_id || '') })
      .eq('id', deposit.id)

    const { data: freshUser } = await supabaseAdmin
      .from('users')
      .select('deposit_balance, total_deposited, full_name')
      .eq('id', deposit.user_id)
      .single()

    await supabaseAdmin
      .from('users')
      .update({
        deposit_balance: (freshUser?.deposit_balance || 0) + creditAmount,
        total_deposited: (freshUser?.total_deposited || 0) + creditAmount
      })
      .eq('id', deposit.user_id)

    await supabaseAdmin.from('trading_history').insert({
      user_id: deposit.user_id,
      type: 'deposit',
      amount: creditAmount,
      description: `Deposit of $${creditAmount} via ${paidCurrency || deposit.currency?.toUpperCase() || 'crypto'}`,
      reference_id: deposit.id
    })

    await supabaseAdmin.from('notifications').insert({
      user_id: deposit.user_id,
      title: 'Deposit Confirmed',
      message: `Your deposit of $${creditAmount} has been confirmed and credited to your account.`,
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
          message: `$${creditAmount} deposit confirmed for ${freshUser?.full_name}`,
          priority: 1,
          sound: 'cashregister'
        })
      })
    }

    console.log('Deposit credited:', deposit.id, 'Amount:', creditAmount)
    return new Response('ok', { status: 200 })

  } catch (error) {
    console.error('Webhook error:', error)
    return new Response('ok', { status: 200 })
  }
}