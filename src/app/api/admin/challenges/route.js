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
      .select('*, challenges(name)')
      .eq('id', enrollment_id)
      .single()

    await supabaseAdmin
      .from('challenge_enrollments')
      .update({ status })
      .eq('id', enrollment_id)

    await supabaseAdmin.from('notifications').insert({
      user_id: enrollment.user_id,
      title: `Challenge ${status === 'completed' ? 'Completed' : 'Updated'}`,
      message: `Your ${enrollment.challenges?.name} challenge status has been updated to ${status}.`,
      type: 'challenge'
    })

    return Response.json({ success: true })
  } catch {
    return Response.json({ error: 'Something went wrong' }, { status: 500 })
  }
}