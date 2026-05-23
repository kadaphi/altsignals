import { getUserFromRequest } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET(req) {
  try {
    const user = await getUserFromRequest(req)
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 })

    const { data: withdrawals } = await supabaseAdmin
      .from('withdrawals')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    return Response.json({ withdrawals: withdrawals || [] })
  } catch {
    return Response.json({ error: 'Something went wrong' }, { status: 500 })
  }
}

export async function POST(req) {
  try {
    const user = await getUserFromRequest(req)
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 })

    const { amount, wallet_address, network } = await req.json()

    if (!amount || amount < 10) {
      return Response.json({ error: 'Minimum withdrawal is $10' }, { status: 400 })
    }

    if (!wallet_address) {
      return Response.json({ error: 'Wallet address is required' }, { status: 400 })
    }

    if (user.withdrawal_balance < amount) {
      return Response.json({ error: 'Insufficient withdrawal balance' }, { status: 400 })
    }

    await supabaseAdmin
      .from('users')
      .update({ withdrawal_balance: user.withdrawal_balance - amount })
      .eq('id', user.id)

    await supabaseAdmin.from('withdrawals').insert({
      user_id: user.id,
      amount,
      wallet_address,
      network: network || 'USDT TRC20',
      status: 'pending'
    })

    await supabaseAdmin.from('trading_history').insert({
      user_id: user.id,
      type: 'withdrawal',
      amount: -amount,
      description: `Withdrawal request of $${amount}`
    })

    await supabaseAdmin.from('notifications').insert({
      user_id: user.id,
      title: 'Withdrawal Request Submitted',
      message: `Your withdrawal request of $${amount} has been submitted and is being processed.`,
      type: 'withdrawal'
    })

    if (process.env.PUSHOVER_API_TOKEN) {
      await fetch('https://api.pushover.net/1/messages.json', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token: process.env.PUSHOVER_API_TOKEN,
          user: process.env.PUSHOVER_USER_KEY,
          title: '💸 New AltSignals Withdrawal',
          message: `${user.full_name} requested withdrawal of $${amount} to ${wallet_address}`,
          priority: 1
        })
      })
    }

    return Response.json({ success: true, message: 'Withdrawal request submitted successfully' })
  } catch {
    return Response.json({ error: 'Something went wrong' }, { status: 500 })
  }
}