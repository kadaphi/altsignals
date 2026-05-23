import { getUserFromRequest } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET(req) {
  try {
    const user = await getUserFromRequest(req)
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 })

    const { data: challenges } = await supabaseAdmin
      .from('challenges')
      .select('*')
      .eq('is_active', true)
      .order('tier', { ascending: true })

    const { data: enrollments } = await supabaseAdmin
      .from('challenge_enrollments')
      .select('*, challenges(*)')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    return Response.json({ challenges: challenges || [], enrollments: enrollments || [] })
  } catch {
    return Response.json({ error: 'Something went wrong' }, { status: 500 })
  }
}

export async function POST(req) {
  try {
    const user = await getUserFromRequest(req)
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 })

    const { challenge_id } = await req.json()

    const { data: challenge } = await supabaseAdmin
      .from('challenges')
      .select('*')
      .eq('id', challenge_id)
      .single()

    if (!challenge) return Response.json({ error: 'Challenge not found' }, { status: 404 })

    if (user.deposit_balance < challenge.entry_fee) {
      return Response.json({ error: 'INSUFFICIENT_BALANCE' }, { status: 400 })
    }

    const { data: existing } = await supabaseAdmin
      .from('challenge_enrollments')
      .select('id')
      .eq('user_id', user.id)
      .eq('challenge_id', challenge_id)
      .eq('status', 'active')
      .maybeSingle()

    if (existing) {
      return Response.json({ error: 'You are already enrolled in this challenge' }, { status: 400 })
    }

    await supabaseAdmin
      .from('users')
      .update({ deposit_balance: user.deposit_balance - challenge.entry_fee })
      .eq('id', user.id)

    await supabaseAdmin.from('challenge_enrollments').insert({
      user_id: user.id,
      challenge_id,
      status: 'active',
      entry_fee_paid: challenge.entry_fee
    })

    await supabaseAdmin.from('trading_history').insert({
      user_id: user.id,
      type: 'challenge',
      amount: -challenge.entry_fee,
      description: `Challenge entry: ${challenge.name}`
    })

    await supabaseAdmin.from('notifications').insert({
      user_id: user.id,
      title: 'Challenge Enrollment Confirmed',
      message: `You have successfully enrolled in the ${challenge.name} challenge. Good luck!`,
      type: 'challenge'
    })

    if (process.env.PUSHOVER_API_TOKEN) {
      await fetch('https://api.pushover.net/1/messages.json', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token: process.env.PUSHOVER_API_TOKEN,
          user: process.env.PUSHOVER_USER_KEY,
          title: '⚔ New Challenge Enrollment',
          message: `${user.full_name} enrolled in ${challenge.name} challenge`,
          priority: 0
        })
      })
    }

    return Response.json({ success: true })
  } catch {
    return Response.json({ error: 'Something went wrong' }, { status: 500 })
  }
}