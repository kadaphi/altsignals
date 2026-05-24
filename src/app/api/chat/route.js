import { supabaseAdmin } from '@/lib/supabase'
import { getUserFromRequest } from '@/lib/auth'

export async function GET(req) {
  try {
    const user = await getUserFromRequest(req)
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 })

    const { data: session } = await supabaseAdmin
      .from('chat_sessions')
      .select('*')
      .eq('user_id', user.id)
      .eq('status', 'open')
      .maybeSingle()

    if (!session) return Response.json({ status: 'open', messages: [] })

    const { data: messages } = await supabaseAdmin
      .from('chat_messages')
      .select('*')
      .eq('session_id', session.id)
      .order('created_at', { ascending: true })

    return Response.json({ status: 'open', session, messages: messages || [] })
  } catch {
    return Response.json({ error: 'Something went wrong' }, { status: 500 })
  }
}

export async function POST(req) {
  try {
    const { message, image_url } = await req.json()
    const user = await getUserFromRequest(req)

    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 })

    let session
    const { data: existing } = await supabaseAdmin
      .from('chat_sessions')
      .select('*')
      .eq('user_id', user.id)
      .eq('status', 'open')
      .maybeSingle()

    if (existing) {
      session = existing
    } else {
      const { data: newSession } = await supabaseAdmin
        .from('chat_sessions')
        .insert({ user_id: user.id, status: 'open' })
        .select()
        .single()
      session = newSession
    }

    await supabaseAdmin.from('chat_messages').insert({
      session_id: session.id,
      user_id: user.id,
      message,
      image_url,
      is_admin: false
    })

    if (process.env.PUSHOVER_API_TOKEN) {
      await fetch('https://api.pushover.net/1/messages.json', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token: process.env.PUSHOVER_API_TOKEN,
          user: process.env.PUSHOVER_USER_KEY,
          title: `💬 New message from ${user.full_name}`,
          message: message || '[Image]',
          priority: 1,
          sound: 'cashregister'
        })
      })
    }

    return Response.json({ success: true })
  } catch {
    return Response.json({ error: 'Something went wrong' }, { status: 500 })
  }
}