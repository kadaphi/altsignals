import { getUserFromRequest } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'

export async function POST(req) {
  try {
    const user = await getUserFromRequest(req)
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 })

    const { amount, currency } = await req.json()

    if (!amount || amount < 100) {
      return Response.json({ error: 'Minimum deposit is $100' }, { status: 400 })
    }

    if (!currency) {
      return Response.json({ error: 'Please select a currency' }, { status: 400 })
    }

    const nowRes = await fetch('https://api.nowpayments.io/v1/payment', {
      method: 'POST',
      headers: {
        'x-api-key': process.env.NOWPAYMENTS_API_KEY,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        price_amount: amount,
        price_currency: 'usd',
        pay_currency: currency,
        ipn_callback_url: `${process.env.NEXT_PUBLIC_SITE_URL}/api/deposit/webhook`,
        order_description: `AltSignals deposit for ${user.email}`
      })
    })

    const nowData = await nowRes.json()

    if (!nowData.pay_address) {
      return Response.json({ error: 'Failed to create payment. Please try again.' }, { status: 500 })
    }

    const { data: deposit } = await supabaseAdmin.from('deposits').insert({
      user_id: user.id,
      amount,
      status: 'pending',
      invoice_id: nowData.payment_id
    }).select().single()

    return Response.json({
      success: true,
      payment_id: nowData.payment_id,
      pay_address: nowData.pay_address,
      pay_amount: nowData.pay_amount,
      pay_currency: nowData.pay_currency,
    })
  } catch (error) {
    console.error('Deposit error:', error)
    return Response.json({ error: 'Something went wrong' }, { status: 500 })
  }
}