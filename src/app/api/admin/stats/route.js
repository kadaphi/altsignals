import { getUserFromRequest } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET(req) {
  try {
    const user = await getUserFromRequest(req)
    if (!user?.is_admin) return Response.json({ error: 'Unauthorized' }, { status: 401 })

    const [
      { count: total_users },
      { data: deposits },
      { count: pending_withdrawals },
      { count: active_investments },
      { count: active_copy_trades },
      { count: vip_members },
      { count: challenge_enrollments },
      { count: course_purchases },
      { data: recent_users }
    ] = await Promise.all([
      supabaseAdmin.from('users').select('*', { count: 'exact', head: true }),
      supabaseAdmin.from('deposits').select('amount').eq('status', 'completed'),
      supabaseAdmin.from('withdrawals').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
      supabaseAdmin.from('user_investments').select('*', { count: 'exact', head: true }).eq('status', 'active'),
      supabaseAdmin.from('copy_trade_subscriptions').select('*', { count: 'exact', head: true }).eq('status', 'active'),
      supabaseAdmin.from('vip_subscriptions').select('*', { count: 'exact', head: true }).eq('status', 'active'),
      supabaseAdmin.from('challenge_enrollments').select('*', { count: 'exact', head: true }),
      supabaseAdmin.from('course_purchases').select('*', { count: 'exact', head: true }),
      supabaseAdmin.from('users').select('full_name, email, created_at').order('created_at', { ascending: false }).limit(5)
    ])

    const total_deposits = (deposits || []).reduce((sum, d) => sum + Number(d.amount), 0)

    return Response.json({
      total_users,
      total_deposits,
      pending_withdrawals,
      active_investments,
      active_copy_trades,
      vip_members,
      challenge_enrollments,
      course_purchases,
      recent_users
    })
  } catch (error) {
    console.error('Admin stats error:', error)
    return Response.json({ error: 'Something went wrong' }, { status: 500 })
  }
}