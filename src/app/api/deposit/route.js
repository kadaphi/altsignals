import { getUserFromRequest } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'

export async function POST(req) {
  try {
    const user = await getUserFromRequest(req)
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 })

    const { amount, currency } = await req.json()

const { data: settingsRow } = await supabaseAdmin
  .from('settings')
  .select('min_deposit')
  .limit(1)
  .single()

const minDeposit = Number(settingsRow?.min_deposit || 100)

if (!amount || amount < minDeposit) {
  return Response.json({ error: `Minimum deposit is $${minDeposit}` }, { status: 400 })
}

    if (!currency) {
      return Response.json({ error: 'Please select a currency' }, { status: 400 })
    }

    const nowRes = await fetch('https://api.nowpayments.io/v1/invoice', {
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
        success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/dashboard/deposit?status=success`,
        cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/dashboard/deposit`,
        order_description: `AltSignals deposit for ${user.email}`
      })
    })

    const nowData = await nowRes.json()

    if (!nowData.invoice_url) {
      return Response.json({ error: 'Failed to create payment invoice. Please try again.' }, { status: 500 })
    }

    await supabaseAdmin.from('deposits').insert({
  user_id: user.id,
  amount,
  status: 'pending',
  invoice_id: String(nowData.id),
  payment_id: null
})

return Response.json({
  success: true,
  invoice_url: nowData.invoice_url,
  invoice_id: String(nowData.id)
})
  } catch (error) {
    console.error('Deposit error:', error)
    return Response.json({ error: 'Something went wrong' }, { status: 500 })
  }
}