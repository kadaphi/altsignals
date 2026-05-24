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
    console.log('NOWPayments webhook received:', JSON.stringify(data))

    if (data.payment_status === 'finished' || data.payment_status === 'confirmed') {
      // Try all possible ID fields NOWPayments might send
      const possibleIds = [
        String(data.invoice_id || ''),
        String(data.order_id || ''),
        String(data.payment_id || ''),
      ].filter(Boolean)

      console.log('Looking for deposit with IDs:', possibleIds)

      let deposit = null

      for (const id of possibleIds) {
        const { data: found } = await supabaseAdmin
          .from('deposits')
          .select('*, users(*)')
          .eq('invoice_id', id)
          .maybeSingle()

        if (found) { deposit = found; break }
      }

      if (!deposit) {
        console.error('Deposit not found for IDs:', possibleIds)
        return Response.json({ success: true })
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

        console.log('Deposit credited successfully:', deposit.id)
      } else {
        console.log('Deposit already processed:', deposit.id)
      }
    }

    return Response.json({ success: true })
  } catch (error) {
    console.error('Webhook error:', error)
    return Response.json({ error: 'Something went wrong' }, { status: 500 })
  }
}