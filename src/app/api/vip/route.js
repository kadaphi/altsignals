import { getUserFromRequest } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

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

async function checkVIPExpiry(subscription, user) {
  if (!subscription.ends_at) return subscription

  const now = new Date()
  const endsAt = new Date(subscription.ends_at)
  const daysLeft = Math.ceil((endsAt - now) / (1000 * 60 * 60 * 24))

  if (daysLeft <= 0) {
    await supabaseAdmin
      .from('vip_subscriptions')
      .update({ status: 'expired' })
      .eq('id', subscription.id)

    await supabaseAdmin.from('notifications').insert({
      user_id: user.id,
      title: '❌ VIP Membership Expired',
      message: 'Your VIP membership has expired. Renew now to restore access to the VIP channel and premium signals.',
      type: 'vip'
    })

    if (process.env.PUSHOVER_API_TOKEN) {
      await fetch('https://api.pushover.net/1/messages.json', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token: process.env.PUSHOVER_API_TOKEN,
          user: process.env.PUSHOVER_USER_KEY,
          title: '⏰ VIP Subscription Expired',
          message: `${user.full_name} (${user.email})\nPlan: ${subscription.vip_plans?.name}\nInvite link: ${subscription.telegram_invite_link || 'N/A'}\nUser ID: ${user.id}\n\nPlease remove from Telegram channel.`,
          priority: 1
        })
      })
    }

    return { ...subscription, status: 'expired' }
  }

  const reminderKey = `${daysLeft}d`
  const alreadySent = (subscription.reminders_sent || []).includes(reminderKey)
  const shouldRemind = [10, 5, 1].includes(daysLeft)

  if (shouldRemind && !alreadySent) {
    try {
      await resend.emails.send({
        from: 'AltSignals <support@altsignals.finance>',
        to: user.email,
        subject: `Your VIP membership expires in ${daysLeft} day${daysLeft > 1 ? 's' : ''} — Renew Now`,
        html: `
          <!DOCTYPE html>
          <html>
          <body style="margin:0;padding:0;background:#0A0A0F;font-family:'Helvetica Neue',Arial,sans-serif;">
            <table width="100%" cellpadding="0" cellspacing="0" style="background:#0A0A0F;padding:40px 20px;">
              <tr><td align="center">
                <table width="560" cellpadding="0" cellspacing="0" style="background:#0F0F1A;border:1px solid rgba(0,229,255,0.15);">
                  <tr><td style="padding:32px 40px;border-bottom:2px solid #00E5FF;">
                    <span style="font-family:sans-serif;font-size:20px;font-weight:700;color:#E8E4DC;">ALT<span style="color:#00E5FF;">SIGNALS</span></span>
                  </td></tr>
                  <tr><td style="padding:40px;">
                    <h2 style="font-size:24px;font-weight:700;color:#E8E4DC;margin:0 0 16px;">⚠️ VIP Expiring in ${daysLeft} Day${daysLeft > 1 ? 's' : ''}</h2>
                    <p style="color:#8A8E99;font-size:14px;line-height:1.8;margin:0 0 16px;">Hi ${user.full_name},</p>
                    <p style="color:#8A8E99;font-size:14px;line-height:1.8;margin:0 0 24px;">
                      Your <strong style="color:#00E5FF;">${subscription.vip_plans?.name} VIP membership</strong> expires on
                      <strong style="color:#E8E4DC;">${endsAt.toLocaleDateString('en-US', { weekday:'long', year:'numeric', month:'long', day:'numeric' })}</strong>.
                      Renew now to keep access to premium signals and the VIP channel.
                    </p>
                    <a href="https://altsignals.finance/dashboard/vip" style="display:inline-block;background:#00E5FF;color:#0A0A0F;padding:14px 32px;font-size:12px;font-weight:700;letter-spacing:2px;text-transform:uppercase;text-decoration:none;">
                      Renew Subscription →
                    </a>
                  </td></tr>
                  <tr><td style="padding:24px 40px;border-top:1px solid rgba(0,229,255,0.08);">
                    <p style="color:#8A8E99;font-size:11px;margin:0;">© 2026 AltSignals. You received this because you have an active VIP subscription.</p>
                  </td></tr>
                </table>
              </td></tr>
            </table>
          </body>
          </html>
        `
      })
    } catch (emailErr) {
      console.error('VIP reminder email error:', emailErr)
    }

    await supabaseAdmin.from('notifications').insert({
      user_id: user.id,
      title: `⚠️ VIP Expires in ${daysLeft} Day${daysLeft > 1 ? 's' : ''}`,
      message: `Your ${subscription.vip_plans?.name} VIP membership expires on ${endsAt.toLocaleDateString()}. Renew now to keep your access.`,
      type: 'vip'
    })

    await supabaseAdmin
      .from('vip_subscriptions')
      .update({ reminders_sent: [...(subscription.reminders_sent || []), reminderKey] })
      .eq('id', subscription.id)
  }

  return subscription
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
      .select('*, vip_plans(*), reminders_sent')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .maybeSingle()

    if (subscription) {
      const checked = await checkVIPExpiry(subscription, user)
      if (checked.status === 'expired') {
        return Response.json({ plans: plans || [], subscription: null, expired: true })
      }
    }

    return Response.json({ plans: plans || [], subscription: subscription || null })
  } catch (error) {
    console.error('VIP GET error:', error)
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
        ends_at: endsAt,
        reminders_sent: []
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