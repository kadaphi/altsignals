import { supabaseAdmin } from '@/lib/supabase'
import crypto from 'crypto'

export async function POST(req) {
  try {
    const body = await req.text()
    const signature = req.headers.get('x-nowpayments-sig')

    // Verify signature
    if (signature && process.env.NOWPAYMENTS_IPN_SECRET) {
      const hmac = crypto.createHmac('sha512', process.env.NOWPAYMENTS_IPN_SECRET.trim())
      const sorted = JSON.stringify(JSON.parse(body), Object.keys(JSON.parse(body)).sort())
      hmac.update(sorted)
      const digest = hmac.digest('hex')
      if (digest !== signature) {
        return Response.json({ error: 'Invalid signature' }, { status: 401 })
      }
    }

    const data = JSON.parse(body)

    if (data.payment_status === 'finished' || data.payment_status === 'confirmed') {
      const { data: deposit } = await supabaseAdmin
        .from('deposits')
        .select('*, users(*)')
        .eq('invoice_id', data.order_id)
        .single()

      if (deposit && deposit.status === 'pending') {
        await supabaseAdmin
          .from('deposits')
          .update({ status: 'completed' })
          .eq('id', deposit.id)

        await supabaseAdmin
          .from('users')
          .update({
            deposit_balance: (deposit.users.deposit_balance || 0) + deposit.amount,
            total_deposited: (deposit.users.total_deposited || 0) + deposit.amount
          })
          .eq('id', deposit.user_id)

        await supabaseAdmin.from('trading_history').insert({
          user_id: deposit.user_id,
          type: 'deposit',
          amount: deposit.amount,
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
      }
    }

    return Response.json({ success: true })
  } catch (error) {
    console.error('Webhook error:', error)
    return Response.json({ error: 'Something went wrong' }, { status: 500 })
  }
}