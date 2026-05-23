import { getUserFromRequest } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET(req) {
  try {
    const user = await getUserFromRequest(req)
    if (!user?.is_admin) return Response.json({ error: 'Unauthorized' }, { status: 401 })

    const { data: investments } = await supabaseAdmin
      .from('user_investments')
      .select('*, users(full_name, email), investment_plans(name)')
      .order('created_at', { ascending: false })

    return Response.json({ investments: investments || [] })
  } catch {
    return Response.json({ error: 'Something went wrong' }, { status: 500 })
  }
}

export async function PUT(req) {
  try {
    const user = await getUserFromRequest(req)
    if (!user?.is_admin) return Response.json({ error: 'Unauthorized' }, { status: 401 })

    const { investment_id, status } = await req.json()

    const { data: investment } = await supabaseAdmin
      .from('user_investments')
      .select('*, users(*), investment_plans(*)')
      .eq('id', investment_id)
      .single()

    if (!investment) return Response.json({ error: 'Investment not found' }, { status: 404 })

    await supabaseAdmin
      .from('user_investments')
      .update({ status })
      .eq('id', investment_id)

    if (status === 'completed') {
      await supabaseAdmin
        .from('users')
        .update({
          withdrawal_balance: (investment.users.withdrawal_balance || 0) + Number(investment.target_profit),
          total_profit: (investment.users.total_profit || 0) + Number(investment.target_profit)
        })
        .eq('id', investment.user_id)

      await supabaseAdmin.from('notifications').insert({
        user_id: investment.user_id,
        title: '🎉 Investment Completed',
        message: `Your ${investment.investment_plans?.name} investment has matured. $${investment.target_profit} has been credited to your withdrawal balance.`,
        type: 'investment'
      })
    }

    return Response.json({ success: true })
  } catch {
    return Response.json({ error: 'Something went wrong' }, { status: 500 })
  }
}