import { getUserFromRequest } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET(req) {
  try {
    const user = await getUserFromRequest(req)
    if (!user?.is_admin) return Response.json({ error: 'Unauthorized' }, { status: 401 })

    const { searchParams } = new URL(req.url)
    const includeClosed = searchParams.get('include_closed') === 'true'

    let query = supabaseAdmin
      .from('chat_sessions')
      .select('*')
      .order('created_at', { ascending: false })

    if (!includeClosed) {
      query = query.neq('status', 'closed')
    }

    const { data: sessions } = await query

    const formatted = await Promise.all((sessions || []).map(async s => {
      let full_name = s.guest_name || 'Guest'
      let email = s.guest_email || 'No email'

      if (s.user_id) {
        const { data: u } = await supabaseAdmin
          .from('users')
          .select('full_name, email')
          .eq('id', s.user_id)
          .single()
        if (u) { full_name = u.full_name; email = u.email }
      }

      return { ...s, display_name: full_name, display_email: email }
    }))

    return Response.json({ sessions: formatted })
  } catch (error) {
    console.error('Admin chat GET error:', error)
    return Response.json({ error: 'Something went wrong' }, { status: 500 })
  }
}

export async function POST(req) {
  try {
    const user = await getUserFromRequest(req)
    if (!user?.is_admin) return Response.json({ error: 'Unauthorized' }, { status: 401 })

    const { session_id, message, user_id } = await req.json()

    await supabaseAdmin.from('chat_messages').insert({
      session_id,
      message,
      is_admin: true
    })

    if (user_id) {
      await supabaseAdmin.from('notifications').insert({
        user_id,
        title: 'New Support Message',
        message: 'You have a new message from AltSignals support.',
        type: 'chat'
      })
    }

    return Response.json({ success: true })
  } catch (error) {
    console.error('Admin chat POST error:', error)
    return Response.json({ error: 'Something went wrong' }, { status: 500 })
  }
}

export async function PUT(req) {
  try {
    const user = await getUserFromRequest(req)
    if (!user?.is_admin) return Response.json({ error: 'Unauthorized' }, { status: 401 })

    const { session_id, status } = await req.json()

    await supabaseAdmin
      .from('chat_sessions')
      .update({ status })
      .eq('id', session_id)

    return Response.json({ success: true })
  } catch (error) {
    console.error('Admin chat PUT error:', error)
    return Response.json({ error: 'Something went wrong' }, { status: 500 })
  }
}