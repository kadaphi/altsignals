import { getUserFromRequest } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'

const CURRENCY_MAP = {
  btc:       { currency: 'BTC',  network: 'Bitcoin'  },
  eth:       { currency: 'ETH',  network: 'Ethereum' },
  usdttrc20: { currency: 'USDT', network: 'TRC20'    },
  usdterc20: { currency: 'USDT', network: 'ERC20'    },
  trx:       { currency: 'TRX',  network: 'TRC20'    },
  bnbbsc:    { currency: 'BNB',  network: 'BEP20'    },
  sol:       { currency: 'SOL',  network: 'Solana'   },
  ltc:       { currency: 'LTC',  network: 'Litecoin' },
  usdcbsc:   { currency: 'USDC', network: 'BEP20'    },
  doge:      { currency: 'DOGE', network: 'Dogecoin' },
}

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

    const currencyConfig = CURRENCY_MAP[currency]
    if (!currencyConfig) {
      return Response.json({ error: 'Unsupported currency' }, { status: 400 })
    }

    const orderId = `AS${user.id.split('-')[0]}${Date.now()}`
    console.log('Order ID:', orderId, 'Length:', orderId.length)

    // Always generate fresh static address with callback URL
    const oxaRes = await fetch('https://api.oxapay.com/v1/payment/static-address', {
      method: 'POST',
      headers: {
        'merchant_api_key': process.env.OXAPAY_MERCHANT_KEY,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        network: currencyConfig.network,
        callback_url: 'https://www.altsignals.finance/api/deposit/webhook',
        order_id: orderId,
        description: `AltSignals deposit for ${user.email}`
      })
    })

    const oxaData = await oxaRes.json()
    console.log('OxaPay response:', JSON.stringify(oxaData))

    if (!oxaData.data?.address) {
      return Response.json({ error: 'Failed to generate deposit address. Please try again.' }, { status: 500 })
    }

    const address = oxaData.data.address
    const trackId = oxaData.data.track_id ? String(oxaData.data.track_id) : null

    const { data: deposit } = await supabaseAdmin
      .from('deposits')
      .insert({
        user_id: user.id,
        amount,
        currency: currency.toLowerCase(),
        status: 'pending',
        payment_id: orderId,
        invoice_id: orderId,
        order_id: orderId,
        oxapay_address: address,
        oxapay_track_id: trackId
      })
      .select()
      .single()

    return Response.json({
      success: true,
      address,
      currency: currencyConfig.currency,
      network: currencyConfig.network,
      amount,
      deposit_id: deposit.id,
      order_id: orderId
    })
  } catch (error) {
    console.error('Deposit error:', error)
    return Response.json({ error: 'Something went wrong. Please try again.' }, { status: 500 })
  }
}
