import { getUserFromRequest } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET(req) {
  try {
    const user = await getUserFromRequest(req)
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 })

    const { data: courses } = await supabaseAdmin
      .from('courses')
      .select('*')
      .eq('is_active', true)
      .order('order_index', { ascending: true })

    const { data: purchases } = await supabaseAdmin
      .from('course_purchases')
      .select('course_id')
      .eq('user_id', user.id)

    const { data: coaching } = await supabaseAdmin
      .from('settings')
      .select('coaching_fee, coaching_link, coaching_description')
      .single()

    const purchasedIds = (purchases || []).map(p => p.course_id)

    return Response.json({
      courses: courses || [],
      purchasedIds,
      coaching: coaching || {}
    })
  } catch {
    return Response.json({ error: 'Something went wrong' }, { status: 500 })
  }
}

export async function POST(req) {
  try {
    const user = await getUserFromRequest(req)
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 })

    const { course_id } = await req.json()

    const { data: course } = await supabaseAdmin
      .from('courses')
      .select('*')
      .eq('id', course_id)
      .single()

    if (!course) return Response.json({ error: 'Course not found' }, { status: 404 })

    if (user.deposit_balance < course.price) {
      return Response.json({ error: 'INSUFFICIENT_BALANCE' }, { status: 400 })
    }

    const { data: existing } = await supabaseAdmin
      .from('course_purchases')
      .select('id')
      .eq('user_id', user.id)
      .eq('course_id', course_id)
      .maybeSingle()

    if (existing) {
      return Response.json({ error: 'You already own this course' }, { status: 400 })
    }

    await supabaseAdmin
      .from('users')
      .update({ deposit_balance: user.deposit_balance - course.price })
      .eq('id', user.id)

    await supabaseAdmin.from('course_purchases').insert({
      user_id: user.id,
      course_id
    })

    await supabaseAdmin.from('trading_history').insert({
      user_id: user.id,
      type: 'course',
      amount: -course.price,
      description: `Course purchase: ${course.title}`
    })

    await supabaseAdmin.from('notifications').insert({
      user_id: user.id,
      title: 'Course Purchased',
      message: `You now have access to ${course.title}. Click the link in your course library to get started.`,
      type: 'course'
    })

    if (process.env.PUSHOVER_API_TOKEN) {
      await fetch('https://api.pushover.net/1/messages.json', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token: process.env.PUSHOVER_API_TOKEN,
          user: process.env.PUSHOVER_USER_KEY,
          title: '📚 New Course Purchase',
          message: `${user.full_name} purchased ${course.title} for $${course.price}`,
          priority: 0
        })
      })
    }

    return Response.json({ success: true, ebook_link: course.ebook_link })
  } catch {
    return Response.json({ error: 'Something went wrong' }, { status: 500 })
  }
}