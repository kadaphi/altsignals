import { supabaseAdmin } from '@/lib/supabase'

export async function POST(req) {
  try {
    const body = await req.json()
    console.log('Inbound email received:', JSON.stringify(body))

    if (body.type !== 'email.received') {
      return Response.json({ success: true })
    }

    const { from, subject, text, html, to } = body.data

    // Store in database
    await supabaseAdmin.from('inbound_emails').insert({
      from_email: from,
      to_email: Array.isArray(to) ? to[0] : to || '',
      subject: subject || '(no subject)',
      body_text: text || '',
      body_html: html || '',
      received_at: body.created_at || new Date().toISOString()
    })

    // Pushover notification
    if (process.env.PUSHOVER_API_TOKEN) {
      await fetch('https://api.pushover.net/1/messages.json', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token: process.env.PUSHOVER_API_TOKEN,
          user: process.env.PUSHOVER_USER_KEY,
          title: `📧 New Email — ${Array.isArray(to) ? to[0] : to || 'support'}`,
          message: `From: ${from}\nSubject: ${subject || '(no subject)'}\n\n${text?.slice(0, 300) || '(no text)'}`,
          priority: 1,
          sound: 'incoming'
        })
      })
    }

    return Response.json({ success: true })
  } catch (error) {
    console.error('Inbound email error:', error)
    return Response.json({ error: 'Something went wrong' }, { status: 500 })
  }
}