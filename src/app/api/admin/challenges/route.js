import { getUserFromRequest } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET(req) {
  try {
    const user = await getUserFromRequest(req)
    if (!user?.is_admin) return Response.json({ error: 'Unauthorized' }, { status: 401 })

    const { data: challenges } = await supabaseAdmin
      .from('challenges')
      .select('*')
      .order('tier', { ascending: true })

    const { data: enrollments } = await supabaseAdmin
      .from('challenge_enrollments')
      .select('*, users(full_name, email), challenges(name, tier)')
      .order('created_at', { ascending: false })

    return Response.json({ challenges: challenges || [], enrollments: enrollments || [] })
  } catch {
    return Response.json({ error: 'Something went wrong' }, { status: 500 })
  }
}

export async function PUT(req) {
  try {
    const user = await getUserFromRequest(req)
    if (!user?.is_admin) return Response.json({ error: 'Unauthorized' }, { status: 401 })

    const { enrollment_id, status } = await req.json()

    const { data: enrollment } = await supabaseAdmin
      .from('challenge_enrollments')
      .select('*, challenges(name, reward_amount)')
      .eq('id', enrollment_id)
      .single()

    if (!enrollment) return Response.json({ error: 'Enrollment not found' }, { status: 404 })

    await supabaseAdmin
      .from('challenge_enrollments')
      .update({ status })
      .eq('id', enrollment_id)

    // If passed, credit reward amount to withdrawal balance
    if (status === 'completed' && enrollment.challenges?.reward_amount > 0) {
      const { data: freshUser } = await supabaseAdmin
        .from('users')
        .select('withdrawal_balance, total_profit')
        .eq('id', enrollment.user_id)
        .single()

      await supabaseAdmin
        .from('users')
        .update({
          withdrawal_balance: (freshUser?.withdrawal_balance || 0) + Number(enrollment.challenges.reward_amount),
          total_profit: (freshUser?.total_profit || 0) + Number(enrollment.challenges.reward_amount)
        })
        .eq('id', enrollment.user_id)

      await supabaseAdmin.from('trading_history').insert({
        user_id: enrollment.user_id,
        type: 'challenge',
        amount: Number(enrollment.challenges.reward_amount),
        description: `Challenge reward: ${enrollment.challenges.name}`
      })
    }

    await supabaseAdmin.from('notifications').insert({
      user_id: enrollment.user_id,
      title: status === 'completed' ? '🏆 Challenge Passed!' : '❌ Challenge Failed',
      message: status === 'completed'
        ? `Congratulations! You passed the ${enrollment.challenges?.name} challenge.${enrollment.challenges?.reward_amount > 0 ? ` $${enrollment.challenges.reward_amount} has been credited to your withdrawal balance.` : ''}`
        : `Your ${enrollment.challenges?.name} challenge attempt has been marked as failed. Keep practicing!`,
      type: 'challenge'
    })

    return Response.json({ success: true })
  } catch {
    return Response.json({ error: 'Something went wrong' }, { status: 500 })
  }
}

export async function PATCH(req) {
  try {
    const user = await getUserFromRequest(req)
    if (!user?.is_admin) return Response.json({ error: 'Unauthorized' }, { status: 401 })

    const { challenge_id, entry_fee, challenge_link, prize_description, reward_amount } = await req.json()

    const updates = {}
    if (entry_fee !== undefined) updates.entry_fee = entry_fee
    if (challenge_link !== undefined) updates.challenge_link = challenge_link
    if (prize_description !== undefined) updates.prize_description = prize_description
    if (reward_amount !== undefined) updates.reward_amount = reward_amount

    const { error } = await supabaseAdmin
      .from('challenges')
      .update(updates)
      .eq('id', challenge_id)

    if (error) {
      console.error('Challenge update error:', error)
      return Response.json({ error: error.message }, { status: 500 })
    }

    return Response.json({ success: true })
  } catch (error) {
    console.error('Admin challenges PATCH error:', error)
    return Response.json({ error: 'Something went wrong' }, { status: 500 })
  }
}