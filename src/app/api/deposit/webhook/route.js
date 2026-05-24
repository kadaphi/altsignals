import { supabaseAdmin } from '@/lib/supabase'
import crypto from 'crypto'

export async function GET(req) {
  return Response.json({ status: 'ok' })
}

export async function POST(req) {
  try {
    const rawBody = await req.text()

    const signature = req.headers.get('x-nowpayments-sig')
    if (signature && process.env.NOWPAYMENTS_IPN_SECRET) {
      const hmac = crypto
        .createHmac('sha512', process.env.NOWPAYMENTS_IPN_SECRET)
        .update(rawBody)
        .digest('hex')
      if (hmac !== signature) {
        console.error('Invalid webhook signature - continuing anyway')
      }
    }

    let body
    try {
      body = JSON.parse(rawBody)
    } catch {
      const params = new URLSearchParams(rawBody)
      body = Object.fromEntries(params)
    }

    console.log('NOWPayments webhook received:', JSON.stringify(body))

    const { payment_id, payment_status, invoice_id, order_id } = body

    if (!payment_id && !invoice_id) {
      return Response.json({ error: 'Invalid webhook' }, { status: 400 })
    }

    if (payment_status !== 'finished' && payment_status !== 'confirmed') {
      return Response.json({ success: true, message: 'Status noted' })
    }

    let deposit = null

    // 1. Try order_id first — we set this ourselves
    if (order_id && String(order_id).startsWith('as_')) {
      const { data: d0 } = await supabaseAdmin
        .from('deposits')
        .select('*, users(*)')
        .eq('order_id', String(order_id))
        .maybeSingle()
      deposit = d0
    }

    // 2. Try payment_id against payment_id column
    if (!deposit && payment_id) {
      const { data: d1 } = await supabaseAdmin
        .from('deposits')
        .select('*, users(*)')
        .eq('payment_id', String(payment_id))
        .maybeSingle()
      deposit = d1
    }

    // 3. Try invoice_id against payment_id column
    if (!deposit && invoice_id) {
      const { data: d2 } = await supabaseAdmin
        .from('deposits')
        .select('*, users(*)')
        .eq('payment_id', String(invoice_id))
        .maybeSingle()
      deposit = d2
    }

    // 4. Try payment_id against invoice_id column
    if (!deposit && payment_id) {
      const { data: d3 } = await supabaseAdmin
        .from('deposits')
        .select('*, users(*)')
        .eq('invoice_id', String(payment_id))
        .maybeSingle()
      deposit = d3
    }

    // 5. Try invoice_id against invoice_id column
    if (!deposit && invoice_id) {
      const { data: d4 } = await supabaseAdmin
        .from('deposits')
        .select('*, users(*)')
        .eq('invoice_id', String(invoice_id))
        .maybeSingle()
      deposit = d4
    }

    if (!deposit) {
      console.error('Deposit not found for payment_id:', payment_id, 'invoice_id:', invoice_id, 'order_id:', order_id)
      return Response.json({ error: 'Deposit not found' }, { status: 404 })
    }

    if (deposit.status === 'completed') {
      return Response.json({ success: true, message: 'Already processed' })
    }

    await supabaseAdmin
      .from('deposits')
      .update({ status: 'completed', payment_id: String(payment_id || '') })
      .eq('id', deposit.id)

    await supabaseAdmin
      .from('users')
      .update({
        deposit_balance: (deposit.users.deposit_balance || 0) + Number(deposit.amount),
        total_deposited: (deposit.users.total_deposited || 0) + Number(deposit.amount)
      })
      .eq('id', deposit.user_id)

    await supabaseAdmin.from('trading_history').insert({
      user_id: deposit.user_id,
      type: 'deposit',
      amount: Number(deposit.amount),
      description: `Deposit of $${deposit.amount} confirmed`,
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
          message: `$${deposit.amount} deposit confirmed for ${deposit.users.full_name}`,
          priority: 1,
          sound: 'cashregister'
        })
      })
    }

    return Response.json({ success: true })

  } catch (error) {
    console.error('Webhook error:', error)
    return Response.json({ error: 'Something went wrong' }, { status: 500 })
  }
}