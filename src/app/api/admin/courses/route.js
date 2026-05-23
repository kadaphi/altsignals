import { getUserFromRequest } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET(req) {
  try {
    const user = await getUserFromRequest(req)
    if (!user?.is_admin) return Response.json({ error: 'Unauthorized' }, { status: 401 })

    const { data: courses } = await supabaseAdmin
      .from('courses')
      .select('*')
      .order('order_index', { ascending: true })

    const { data: purchases } = await supabaseAdmin
      .from('course_purchases')
      .select('*, users(full_name, email), courses(title)')
      .order('created_at', { ascending: false })

    return Response.json({ courses: courses || [], purchases: purchases || [] })
  } catch {
    return Response.json({ error: 'Something went wrong' }, { status: 500 })
  }
}

export async function PUT(req) {
  try {
    const user = await getUserFromRequest(req)
    if (!user?.is_admin) return Response.json({ error: 'Unauthorized' }, { status: 401 })

    const { course_id, updates } = await req.json()

    await supabaseAdmin
      .from('courses')
      .update(updates)
      .eq('id', course_id)

    return Response.json({ success: true })
  } catch {
    return Response.json({ error: 'Something went wrong' }, { status: 500 })
  }
}