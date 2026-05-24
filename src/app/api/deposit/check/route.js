import { getUserFromRequest } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'

export async function POST(req) {
  try {
    const user = await getUserFromRequest(req)
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 })

    const { invoice_id } = await req.json()
    if (!invoice_id) return Response.json({ error: 'Invoice ID required' }, { status: 400 })

    const { data: deposit } = await supabaseAdmin
      .from('deposits')
      .select('*')
      .eq('invoice_id', invoice_id)
      .eq('user_id', user.id)
      .maybeSingle()

    if (!deposit) {
      // Try by order_id prefix
      const { data: deposits } = await supabaseAdmin
        .from('deposits')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'pending')
        .order('created_at', { ascending: false })
        .limit(1)

      if (!deposits || deposits.length === 0) {
        return Response.json({ error: 'Deposit not found' }, { status: 404 })
      }

      const latestDeposit = deposits[0]

      // Check payment status from NOWPayments using invoice_id
      const nowRes = await fetch(`https://api.nowpayments.io/v1/invoice/${latestDeposit.invoice_id}`, {
        headers: { 'x-api-key': process.env.NOWPAYMENTS_API_KEY }
      })

      if (nowRes.ok) {
        const nowData = await nowRes.json()
        console.log('NOWPayments invoice status:', JSON.stringify(nowData))

        if (nowData.payment_status === 'finished' || nowData.payment_status === 'confirmed' || nowData.status === 'finished') {
          // Credit the deposit
          if (latestDeposit.status === 'pending') {
            const { data: userRow } = await supabaseAdmin
              .from('users')
              .select('*')
              .eq('id', user.id)
              .single()

            await supabaseAdmin
              .from('deposits')
              .update({ status: 'completed' })
              .eq('id', latestDeposit.id)

            await supabaseAdmin
              .from('users')
              .update({
                deposit_balance: (userRow.deposit_balance || 0) + Number(latestDeposit.amount),
                total_deposited: (userRow.total_deposited || 0) + Number(latestDeposit.amount)
              })
              .eq('id', user.id)

            await supabaseAdmin.from('trading_history').insert({
              user_id: user.id,
              type: 'deposit',
              amount: Number(latestDeposit.amount),
              description: `Crypto deposit of $${latestDeposit.amount}`
            })

            await supabaseAdmin.from('notifications').insert({
              user_id: user.id,
              title: 'Deposit Confirmed',
              message: `Your deposit of $${latestDeposit.amount} has been credited to your account.`,
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
                  message: `${userRow.full_name} deposited $${latestDeposit.amount}`,
                  priority: 1
                })
              })
            }

            const { data: updatedUser } = await supabaseAdmin
              .from('users')
              .select('*')
              .eq('id', user.id)
              .single()

            return Response.json({ success: true, status: 'completed', user: updatedUser })
          }
        }
      }

      return Response.json({ success: true, status: latestDeposit.status })
    }

    // Deposit found by invoice_id
    if (deposit.status === 'completed') {
      const { data: updatedUser } = await supabaseAdmin
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single()
      return Response.json({ success: true, status: 'completed', user: updatedUser })
    }

    // Check NOWPayments for current status
    try {
      const nowRes = await fetch(`https://api.nowpayments.io/v1/invoice/${deposit.invoice_id}`, {
        headers: { 'x-api-key': process.env.NOWPAYMENTS_API_KEY }
      })

      if (nowRes.ok) {
        const nowData = await nowRes.json()
        console.log('NOWPayments invoice check:', JSON.stringify(nowData))

        if (nowData.payment_status === 'finished' || nowData.payment_status === 'confirmed' || nowData.status === 'finished') {
          if (deposit.status === 'pending') {
            const { data: userRow } = await supabaseAdmin
              .from('users')
              .select('*')
              .eq('id', user.id)
              .single()

            await supabaseAdmin
              .from('deposits')
              .update({ status: 'completed' })
              .eq('id', deposit.id)

            await supabaseAdmin
              .from('users')
              .update({
                deposit_balance: (userRow.deposit_balance || 0) + Number(deposit.amount),
                total_deposited: (userRow.total_deposited || 0) + Number(deposit.amount)
              })
              .eq('id', user.id)

            await supabaseAdmin.from('trading_history').insert({
              user_id: user.id,
              type: 'deposit',
              amount: Number(deposit.amount),
              description: `Crypto deposit of $${deposit.amount}`
            })

            await supabaseAdmin.from('notifications').insert({
              user_id: user.id,
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
                  message: `${userRow.full_name} deposited $${deposit.amount}`,
                  priority: 1
                })
              })
            }

            const { data: updatedUser } = await supabaseAdmin
              .from('users')
              .select('*')
              .eq('id', user.id)
              .single()

            return Response.json({ success: true, status: 'completed', user: updatedUser })
          }
        }
      }
    } catch (nowErr) {
      console.error('NOWPayments check error:', nowErr)
    }

    return Response.json({ success: true, status: deposit.status })
  } catch (error) {
    console.error('Check deposit error:', error)
    return Response.json({ error: 'Something went wrong' }, { status: 500 })
  }
}