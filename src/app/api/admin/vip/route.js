import { getUserFromRequest } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET(req) {
  try {
    const user = await getUserFromRequest(req)
    if (!user?.is_admin) return Response.json({ error: 'Unauthorized' }, { status: 401 })

    const { data: subscriptions } = await supabaseAdmin
      .from('vip_subscriptions')
      .select('*, users(full_name, email), vip_plans(name, price)')
      .order('created_at', { ascending: false })

    const { data: plans } = await supabaseAdmin
      .from('vip_plans')
      .select('*')
      .order('price', { ascending: true })

    return Response.json({ subscriptions: subscriptions || [], plans: plans || [] })
  } catch {
    return Response.json({ error: 'Something went wrong' }, { status: 500 })
  }
}

export async function PUT(req) {
  try {
    const user = await getUserFromRequest(req)
    if (!user?.is_admin) return Response.json({ error: 'Unauthorized' }, { status: 401 })

    const { subscription_id, status, telegram_invite_link } = await req.json()

    const { data: sub } = await supabaseAdmin
      .from('vip_subscriptions')
      .select('*, vip_plans(name)')
      .eq('id', subscription_id)
      .single()

    await supabaseAdmin
      .from('vip_subscriptions')
      .update({ status, telegram_invite_link })
      .eq('id', subscription_id)

    if (telegram_invite_link) {
      await supabaseAdmin.from('notifications').insert({
        user_id: sub.user_id,
        title: '👑 VIP Access Granted',
        message: `Your ${sub.vip_plans?.name} VIP subscription is now active. Click your invite link in the VIP section to join the Telegram group.`,
        type: 'vip'
      })
    }

    return Response.json({ success: true })
  } catch {
    return Response.json({ error: 'Something went wrong' }, { status: 500 })
  }
}