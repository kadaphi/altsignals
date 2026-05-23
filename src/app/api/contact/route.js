import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(req) {
  try {
    const { name, email, phone, subject, message, type } = await req.json()

    if (!name || !email || !message) {
      return Response.json({ error: 'Please fill in all required fields' }, { status: 400 })
    }

    const fromAlias = type === 'Compliance' ? 'compliance' :
      type === 'Partnership' ? 'invest' :
      type === 'Investment' ? 'invest' :
      'support'

    await resend.emails.send({
      from: `AltSignals <${fromAlias}@altsignals.finance>`,
      to: process.env.ADMIN_EMAIL,
      replyTo: email,
      subject: `New Contact Form: ${type} - ${subject || name}`,
      html: `
        <div style="font-family:'Helvetica Neue',Arial,sans-serif;max-width:560px;margin:0 auto;background:#0A0A0F;color:#E8E4DC;padding:48px 40px;">
          <div style="margin-bottom:24px;">
            <span style="font-size:20px;font-weight:700;letter-spacing:2px;color:#00E5FF;">ALT<span style="color:#ffffff">SIGNALS</span></span>
            <div style="font-size:10px;letter-spacing:2px;color:#8A8E99;margin-top:4px;">NEW CONTACT FORM SUBMISSION</div>
          </div>
          <table width="100%" cellpadding="0" cellspacing="0">
            ${[
              { label: 'Type', value: type },
              { label: 'Name', value: name },
              { label: 'Email', value: email },
              { label: 'Phone', value: phone || 'Not provided' },
              { label: 'Subject', value: subject || 'Not provided' },
            ].map(item => `
              <tr>
                <td style="padding:8px 0;border-bottom:1px solid rgba(0,229,255,0.08);font-size:9px;letter-spacing:2px;text-transform:uppercase;color:#8A8E99;">${item.label}</td>
                <td style="padding:8px 0;border-bottom:1px solid rgba(0,229,255,0.08);font-size:12px;color:#E8E4DC;text-align:right;">${item.value}</td>
              </tr>
            `).join('')}
          </table>
          <div style="margin-top:20px;">
            <div style="font-size:9px;letter-spacing:2px;text-transform:uppercase;color:#8A8E99;margin-bottom:10px;">Message</div>
            <div style="font-size:13px;color:#E8E4DC;line-height:1.8;background:#111320;padding:16px;border-left:2px solid #00E5FF;">${message}</div>
          </div>
          <p style="color:#8A8E99;font-size:10px;margin-top:24px;">Reply to this email to respond to ${name} at ${email}</p>
        </div>
      `
    })

    await resend.emails.send({
      from: 'AltSignals <support@altsignals.finance>',
      to: email,
      subject: 'We received your message — AltSignals',
      html: `
        <div style="font-family:'Helvetica Neue',Arial,sans-serif;max-width:560px;margin:0 auto;background:#0A0A0F;color:#E8E4DC;padding:48px 40px;">
          <div style="margin-bottom:32px;">
            <span style="font-size:20px;font-weight:700;letter-spacing:2px;color:#00E5FF;">ALT<span style="color:#ffffff">SIGNALS</span></span>
          </div>
          <h2 style="font-size:24px;font-weight:600;color:#ffffff;margin-bottom:16px;">Thank you, ${name}</h2>
          <p style="color:#8A8E99;font-size:13px;line-height:1.8;margin-bottom:20px;">We have received your message and our team will review it shortly. You can expect a response within 24 hours.</p>
          <div style="background:#111320;border-left:2px solid #00E5FF;padding:16px;margin-bottom:24px;">
            <p style="color:#8A8E99;font-size:12px;margin:0;line-height:1.7;">${message}</p>
          </div>
          <p style="color:#8A8E99;font-size:13px;line-height:1.8;margin:0;">For urgent matters contact us at <span style="color:#00E5FF;">support@altsignals.finance</span></p>
        </div>
      `
    })

    return Response.json({ success: true })
  } catch (error) {
    console.error('Contact form error:', error)
    return Response.json({ error: 'Something went wrong. Please try again.' }, { status: 500 })
  }
}