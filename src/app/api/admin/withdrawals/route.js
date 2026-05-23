import { getUserFromRequest } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET(req) {
  try {
    const user = await getUserFromRequest(req)
    if (!user?.is_admin) return Response.json({ error: 'Unauthorized' }, { status: 401 })

    const { data: withdrawals } = await supabaseAdmin
      .from('withdrawals')
      .select('*, users(full_name, email)')
      .order('created_at', { ascending: false })

    return Response.json({ withdrawals: withdrawals || [] })
  } catch {
    return Response.json({ error: 'Something went wrong' }, { status: 500 })
  }
}

export async function PUT(req) {
  try {
    const user = await getUserFromRequest(req)
    if (!user?.is_admin) return Response.json({ error: 'Unauthorized' }, { status: 401 })

    const { withdrawal_id, status } = await req.json()

    const { data: withdrawal } = await supabaseAdmin
      .from('withdrawals')
      .select('*, users(*)')
      .eq('id', withdrawal_id)
      .single()

    if (!withdrawal) return Response.json({ error: 'Withdrawal not found' }, { status: 404 })

    await supabaseAdmin
      .from('withdrawals')
      .update({ status })
      .eq('id', withdrawal_id)

    if (status === 'rejected') {
      await supabaseAdmin
        .from('users')
        .update({ withdrawal_balance: withdrawal.users.withdrawal_balance + withdrawal.amount })
        .eq('id', withdrawal.user_id)
    }

    await supabaseAdmin.from('notifications').insert({
      user_id: withdrawal.user_id,
      title: `Withdrawal ${status === 'completed' ? 'Approved' : 'Rejected'}`,
      message: `Your withdrawal request of $${withdrawal.amount} has been ${status === 'completed' ? 'approved and processed' : 'rejected. The amount has been returned to your balance'}.`,
      type: 'withdrawal'
    })

    return Response.json({ success: true })
  } catch {
    return Response.json({ error: 'Something went wrong' }, { status: 500 })
  }
}