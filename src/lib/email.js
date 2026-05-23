import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function sendOTPEmail(email, otp, name) {
  await resend.emails.send({
    from: 'AltSignals <noreply@altsignals.finance>',
    to: email,
    subject: 'Your AltSignals Verification Code',
    html: `
      <div style="font-family: 'Helvetica Neue', Arial, sans-serif; max-width: 560px; margin: 0 auto; background: #0A0A0F; color: #E8E4DC; padding: 48px 40px; border-radius: 4px;">
        <div style="margin-bottom: 32px;">
          <span style="font-size: 22px; font-weight: 700; letter-spacing: 2px; color: #00E5FF;">ALT<span style="color:#ffffff">SIGNALS</span></span>
        </div>
        <h1 style="font-size: 28px; font-weight: 300; margin-bottom: 16px; color: #ffffff;">Verify Your Account</h1>
        <p style="font-size: 14px; color: #8A8E99; line-height: 1.8; margin-bottom: 32px;">Hi ${name}, use the code below to verify your AltSignals account.</p>
        <div style="background: #111320; border: 1px solid rgba(0,229,255,0.2); padding: 28px; text-align: center; margin-bottom: 32px;">
          <div style="font-size: 42px; font-weight: 700; letter-spacing: 12px; color: #00E5FF;">${otp}</div>
          <div style="font-size: 12px; color: #8A8E99; margin-top: 12px;">Valid for 10 minutes</div>
        </div>
        <p style="font-size: 12px; color: #8A8E99;">If you did not request this code, please ignore this email.</p>
      </div>
    `
  })
}

export async function sendWelcomeEmail(email, name) {
  await resend.emails.send({
    from: 'AltSignals <noreply@altsignals.finance>',
    to: email,
    subject: 'Welcome to AltSignals',
    html: `
      <div style="font-family: 'Helvetica Neue', Arial, sans-serif; max-width: 560px; margin: 0 auto; background: #0A0A0F; color: #E8E4DC; padding: 48px 40px; border-radius: 4px;">
        <div style="margin-bottom: 32px;">
          <span style="font-size: 22px; font-weight: 700; letter-spacing: 2px; color: #00E5FF;">ALT<span style="color:#ffffff">SIGNALS</span></span>
        </div>
        <h1 style="font-size: 28px; font-weight: 300; margin-bottom: 16px; color: #ffffff;">Welcome, ${name}</h1>
        <p style="font-size: 14px; color: #8A8E99; line-height: 1.8; margin-bottom: 32px;">Your AltSignals account is now active. You have access to professional trading signals, copy trading, VIP membership and trading challenges.</p>
        <a href="https://altsignals.finance/dashboard" style="display: inline-block; background: #00E5FF; color: #0A0A0F; padding: 14px 32px; font-size: 12px; font-weight: 700; letter-spacing: 2px; text-decoration: none; text-transform: uppercase;">Access Dashboard</a>
      </div>
    `
  })
}