import { getUserFromRequest } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'

export async function POST(req) {
  try {
    const user = await getUserFromRequest(req)
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 })

    const { amount } = await req.json()

    if (!amount || amount < 100) {
      return Response.json({ error: 'Minimum deposit is $100' }, { status: 400 })
    }

    // Create NOWPayments invoice
    const nowRes = await fetch('https://api.nowpayments.io/v1/invoice', {
      method: 'POST',
      headers: {
        'x-api-key': process.env.NOWPAYMENTS_API_KEY,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        price_amount: amount,
        price_currency: 'usd',
        pay_currency: 'usdttrc20',
        ipn_callback_url: `${process.env.NEXT_PUBLIC_SITE_URL}/api/deposit/webhook`,
        success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/dashboard/deposit?status=success`,
        cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/dashboard/deposit`,
        order_description: `AltSignals deposit for ${user.email}`
      })
    })

    const nowData = await nowRes.json()

    if (!nowData.invoice_url) {
      return Response.json({ error: 'Failed to create payment invoice' }, { status: 500 })
    }

    // Save deposit record
    await supabaseAdmin.from('deposits').insert({
      user_id: user.id,
      amount,
      status: 'pending',
      invoice_id: nowData.id
    })

    return Response.json({ success: true, invoice_url: nowData.invoice_url, invoice_id: nowData.id })
  } catch (error) {
    console.error('Deposit error:', error)
    return Response.json({ error: 'Something went wrong' }, { status: 500 })
  }
}