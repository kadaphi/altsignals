import { supabaseAdmin } from '@/lib/supabase'
import crypto from 'crypto'

export async function POST(req) {
  try {
    const body = await req.text()
    const signature = req.headers.get('x-nowpayments-sig')

    if (signature && process.env.NOWPAYMENTS_IPN_SECRET) {
      const hmac = crypto.createHmac('sha512', process.env.NOWPAYMENTS_IPN_SECRET.trim())
      const parsed = JSON.parse(body)
      const sorted = JSON.stringify(parsed, Object.keys(parsed).sort())
      hmac.update(sorted)
      const digest = hmac.digest('hex')
      if (digest !== signature) {
        console.error('Invalid webhook signature')
        return Response.json({ error: 'Invalid signature' }, { status: 401 })
      }
    }

    const data = JSON.parse(body)
    console.log('NOWPayments webhook:', JSON.stringify(data))

    if (data.payment_status === 'finished' || data.payment_status === 'confirmed') {
      let deposit = null

      // 1. Try order_id first — most reliable since we set it ourselves
      if (data.order_id && String(data.order_id).startsWith('as_')) {
        const { data: found } = await supabaseAdmin
          .from('deposits')
          .select('*, users(*)')
          .eq('order_id', String(data.order_id))
          .maybeSingle()
        if (found) deposit = found
      }

      // 2. Try invoice_id
      if (!deposit && data.invoice_id) {
        const { data: found } = await supabaseAdmin
          .from('deposits')
          .select('*, users(*)')
          .eq('invoice_id', String(data.invoice_id))
          .maybeSingle()
        if (found) deposit = found
      }

      // 3. Try payment_id
      if (!deposit && data.payment_id) {
        const { data: found } = await supabaseAdmin
          .from('deposits')
          .select('*, users(*)')
          .eq('payment_id', String(data.payment_id))
          .maybeSingle()
        if (found) deposit = found
      }

      console.log('Deposit found:', deposit ? deposit.id : 'NOT FOUND')

      if (!deposit) {
        console.error('Deposit not found. Webhook data:', JSON.stringify(data))
        return Response.json({ success: true })
      }

      // Store payment_id for future reference
      if (data.payment_id) {
        await supabaseAdmin
          .from('deposits')
          .update({ payment_id: String(data.payment_id) })
          .eq('id', deposit.id)
      }

      if (deposit.status === 'pending') {
        await supabaseAdmin
          .from('deposits')
          .update({ status: 'completed' })
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
          description: `Crypto deposit of $${deposit.amount}`
        })

        await supabaseAdmin.from('notifications').insert({
          user_id: deposit.user_id,
          title: 'Deposit Confirmed',
          message: `Your deposit of $${deposit.amount} has been credited to your account.`,
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
              message: `${deposit.users.full_name} deposited $${deposit.amount}`,
              priority: 1
            })
          })
        }

        console.log('Deposit credited:', deposit.id, 'Amount:', deposit.amount)
      } else {
        console.log('Already processed:', deposit.id)
      }
    }

    return Response.json({ success: true })
  } catch (error) {
    console.error('Webhook error:', error)
    return Response.json({ error: 'Something went wrong' }, { status: 500 })
  }
}