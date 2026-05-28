export const dynamic = 'force-dynamic'

import { supabaseAdmin } from '@/lib/supabase'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(req) {
  try {
    const payload = await req.text()
    const body = JSON.parse(payload)

    if (body.type !== 'email.received') {
      return Response.json({ success: true })
    }

    const { email_id, from, subject, to, attachments: attachmentsMeta } = body.data

    // Fetch full email body
    let bodyText = ''
    let bodyHtml = ''
    try {
      const { data: fullEmail } = await resend.emails.receiving.get(email_id)
      bodyText = fullEmail?.text || ''
      bodyHtml = fullEmail?.html || ''
    } catch (err) {
      console.error('Failed to fetch email body:', err)
    }

    // Store attachment metadata only — not download URLs (they expire)
    const attachments = (attachmentsMeta || []).map(att => ({
      id: att.id,
      filename: att.filename,
      content_type: att.content_type,
      size: att.size || null
    }))

    await supabaseAdmin.from('inbound_emails').insert({
      from_email: from,
      to_email: Array.isArray(to) ? to[0] : to || '',
      subject: subject || '(no subject)',
      body_text: bodyText,
      body_html: bodyHtml,
      attachments: attachments.length > 0 ? attachments : null,
      email_id: email_id,
      received_at: body.created_at || new Date().toISOString()
    })

    if (process.env.PUSHOVER_API_TOKEN) {
      await fetch('https://api.pushover.net/1/messages.json', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token: process.env.PUSHOVER_API_TOKEN,
          user: process.env.PUSHOVER_USER_KEY,
          title: `📧 New Email — ${Array.isArray(to) ? to[0] : to || 'support'}`,
          message: `From: ${from}\nSubject: ${subject || '(no subject)'}${attachments.length > 0 ? `\n📎 ${attachments.length} attachment(s)` : ''}\n\n${bodyText?.slice(0, 300) || '(no preview)'}`,
          priority: 1,
          sound: 'magic'
        })
      })
    }

    return Response.json({ success: true })
  } catch (error) {
    console.error('Inbound email error:', error)
    return Response.json({ error: 'Something went wrong' }, { status: 500 })
  }
}
