import { getUserFromRequest } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET(req) {
  try {
    const user = await getUserFromRequest(req)
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 })

    const { data: deposits } = await supabaseAdmin
      .from('deposits')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    return Response.json({ deposits: deposits || [] })
  } catch {
    return Response.json({ error: 'Something went wrong' }, { status: 500 })
  }
}

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
      return Response.json({ error: `Minimum deposit amount is $${minDeposit}` }, { status: 400 })
    }

    if (!currency) {
      return Response.json({ error: 'Please select a currency' }, { status: 400 })
    }

    const orderId = `AS-${user.id}-${Date.now()}`

    const response = await fetch('https://api.nowpayments.io/v1/invoice', {
      method: 'POST',
      headers: {
        'x-api-key': process.env.NOWPAYMENTS_API_KEY,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        price_amount: amount,
        price_currency: 'usd',
        pay_currency: currency.toLowerCase(),
        order_id: orderId,
        order_description: `AltSignals deposit for ${user.email}`,
        success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/dashboard/deposit?status=success`,
        cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/dashboard/deposit?status=cancelled`,
        is_fixed_rate: false,
        is_fee_paid_by_user: false
      })
    })

    const invoice = await response.json()

    if (!response.ok) {
      console.error('NOWPayments error:', invoice)
      return Response.json({ error: 'Failed to create payment. Please try again.' }, { status: 500 })
    }

    const { data: deposit } = await supabaseAdmin
      .from('deposits')
      .insert({
        user_id: user.id,
        amount,
        currency: currency.toLowerCase(),
        status: 'pending',
        payment_id: String(invoice.id),
        invoice_id: String(invoice.id),
        order_id: orderId
      })
      .select()
      .single()

    return Response.json({
      success: true,
      invoice_url: invoice.invoice_url,
      invoice_id: invoice.id,
      deposit_id: deposit.id
    })
  } catch (error) {
    console.error('Deposit error:', error)
    return Response.json({ error: 'Something went wrong. Please try again.' }, { status: 500 })
  }
}