import { supabaseAdmin } from '@/lib/supabase'

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url)
    const email = searchParams.get('email')
    if (!email) return Response.json({ messages: [] })

    const { data: session } = await supabaseAdmin
      .from('chat_sessions')
      .select('*')
      .eq('guest_email', email)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    if (!session) return Response.json({ messages: [], status: 'open' })

    const { data: messages } = await supabaseAdmin
      .from('chat_messages')
      .select('*')
      .eq('session_id', session.id)
      .order('created_at', { ascending: true })

    return Response.json({ messages: messages || [], status: session.status })
  } catch {
    return Response.json({ messages: [], status: 'open' })
  }
}

export async function POST(req) {
  try {
    const { name, email, subject, message, image_url } = await req.json()
    if (!email || !message) return Response.json({ error: 'Missing fields' }, { status: 400 })

    let session
    const { data: existing } = await supabaseAdmin
      .from('chat_sessions')
      .select('*')
      .eq('guest_email', email)
      .eq('status', 'open')
      .maybeSingle()

    if (existing) {
      session = existing
    } else {
      const { data: newSession } = await supabaseAdmin
        .from('chat_sessions')
        .insert({ guest_email: email, guest_name: name, status: 'open' })
        .select()
        .single()
      session = newSession
    }

    await supabaseAdmin.from('chat_messages').insert({
      session_id: session.id,
      message,
      image_url: image_url || null,
      is_admin: false
    })

    if (process.env.PUSHOVER_API_TOKEN) {
      await fetch('https://api.pushover.net/1/messages.json', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token: process.env.PUSHOVER_API_TOKEN,
          user: process.env.PUSHOVER_USER_KEY,
          title: `💬 New message from ${name || email}`,
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