import { getUserFromRequest } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'

async function generateTelegramInviteLink() {
  try {
    const res = await fetch(`https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/createChatInviteLink`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: process.env.TELEGRAM_CHANNEL_ID,
        member_limit: 1,
        name: `VIP-${Date.now()}`
      })
    })
    const data = await res.json()
    if (data.ok) return data.result.invite_link
    console.error('Telegram invite error:', data)
    return null
  } catch (error) {
    console.error('Telegram invite error:', error)
    return null
  }
}

export async function GET(req) {
  try {
    const user = await getUserFromRequest(req)
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 })

    const { data: plans } = await supabaseAdmin
      .from('vip_plans')
      .select('*')
      .eq('is_active', true)
      .order('price', { ascending: true })

    const { data: subscription } = await supabaseAdmin
      .from('vip_subscriptions')
      .select('*, vip_plans(*)')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .maybeSingle()

    return Response.json({ plans: plans || [], subscription: subscription || null })
  } catch {
    return Response.json({ error: 'Something went wrong' }, { status: 500 })
  }
}

export async function POST(req) {
  try {
    const user = await getUserFromRequest(req)
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 })

    const { plan_id } = await req.json()

    const { data: plan } = await supabaseAdmin
      .from('vip_plans')
      .select('*')
      .eq('id', plan_id)
      .single()

    if (!plan) return Response.json({ error: 'Plan not found' }, { status: 404 })

    if (user.deposit_balance < plan.price) {
      return Response.json({ error: 'INSUFFICIENT_BALANCE' }, { status: 400 })
    }

    const { data: existing } = await supabaseAdmin
      .from('vip_subscriptions')
      .select('id')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .maybeSingle()

    if (existing) {
      return Response.json({ error: 'You already have an active VIP subscription' }, { status: 400 })
    }

    let endsAt = null
    if (plan.duration_days) {
      endsAt = new Date()
      endsAt.setDate(endsAt.getDate() + plan.duration_days)
      endsAt = endsAt.toISOString()
    }

    await supabaseAdmin
      .from('users')
      .update({ deposit_balance: user.deposit_balance - plan.price })
      .eq('id', user.id)

    const telegramInviteLink = await generateTelegramInviteLink()

    const { data: subscription } = await supabaseAdmin
      .from('vip_subscriptions')
      .insert({
        user_id: user.id,
        plan_id,
        status: 'active',
        telegram_invite_link: telegramInviteLink,
        ends_at: endsAt
      })
      .select()
      .single()

    await supabaseAdmin.from('trading_history').insert({
      user_id: user.id,
      type: 'vip',
      amount: -plan.price,
      description: `VIP ${plan.name} subscription`
    })

    await supabaseAdmin.from('notifications').insert({
      user_id: user.id,
      title: '👑 VIP Access Granted!',
      message: telegramInviteLink
        ? `Your ${plan.name} VIP subscription is active. Click your invite link in the VIP section to join the channel.`
        : `Your ${plan.name} VIP subscription is active. Your Telegram invite link will be sent shortly.`,
      type: 'vip'
    })

    if (process.env.PUSHOVER_API_TOKEN) {
      await fetch('https://api.pushover.net/1/messages.json', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token: process.env.PUSHOVER_API_TOKEN,
          user: process.env.PUSHOVER_USER_KEY,
          title: '👑 New VIP Subscription',
          message: `${user.full_name} subscribed to ${plan.name} VIP for $${plan.price}`,
          priority: 1
        })
      })
    }

    return Response.json({ success: true, subscription, telegram_invite_link: telegramInviteLink })
  } catch (error) {
    console.error('VIP error:', error)
    return Response.json({ error: 'Something went wrong' }, { status: 500 })
  }
}