'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function ForgotPasswordPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSendCode() {
    if (!email) return setError('Email is required')
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      })
      const data = await res.json()
      if (!res.ok) return setError(data.error)
      setStep(2)
    } catch { setError('Something went wrong') }
    finally { setLoading(false) }
  }

  async function handleResetPassword() {
    if (!otp || otp.length !== 6) return setError('Please enter the 6-digit code')
    if (!password || password.length < 6) return setError('Password must be at least 6 characters')
    if (password !== confirmPassword) return setError('Passwords do not match')
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp, password })
      })
      const data = await res.json()
      if (!res.ok) return setError(data.error)
      setStep(3)
    } catch { setError('Something went wrong') }
    finally { setLoading(false) }
  }

  return (
    <div style={{ minHeight:'100vh', background:'#0A0A0F', display:'flex', alignItems:'center', justifyContent:'center', padding:'20px', fontFamily:"'Inter',sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Space+Grotesk:wght@600;700&display=swap');
        .auth-input { width:100%; background:#111320; border:1px solid rgba(0,229,255,0.15); padding:14px 16px; color:#E8E4DC; font-family:'Inter',sans-serif; font-size:13px; outline:none; transition:border-color 0.3s; }
        .auth-input:focus { border-color:rgba(0,229,255,0.5); }
        .auth-input::placeholder { color:#8A8E99; }
        .auth-btn { width:100%; background:#00E5FF; border:none; color:#0A0A0F; padding:14px; font-size:11px; font-weight:700; letter-spacing:2px; text-transform:uppercase; cursor:pointer; font-family:'Inter',sans-serif; transition:background 0.3s; clip-path:polygon(8px 0%,100% 0%,calc(100% - 8px) 100%,0% 100%); }
        .auth-btn:hover { background:#33EEFF; }
        .auth-btn:disabled { opacity:0.6; cursor:not-allowed; }
      `}</style>
      <div style={{ width:'100%', maxWidth:'440px' }}>
        <div style={{ textAlign:'center', marginBottom:'40px' }}>
          <div style={{ fontFamily:"'Space Grotesk',sans-serif", fontSize:'24px', fontWeight:'700', marginBottom:'8px' }}>
            <span style={{ color:'#00E5FF' }}>ALT</span>SIGNALS
          </div>
          <div style={{ fontSize:'13px', color:'#8A8E99' }}>Reset your password</div>
        </div>
        <div style={{ background:'#111320', border:'1px solid rgba(0,229,255,0.12)', padding:'40px', position:'relative' }}>
          <div style={{ position:'absolute', top:0, left:0, width:'100%', height:'2px', background:'linear-gradient(90deg,#00E5FF,transparent)' }}></div>

          {step === 1 && (
            <>
              <p style={{ fontSize:'13px', color:'#8A8E99', lineHeight:'1.8', marginBottom:'24px' }}>Enter your email and we'll send you a reset code.</p>
              {error && <div style={{ background:'rgba(255,68,68,0.1)', border:'1px solid rgba(255,68,68,0.3)', padding:'12px 16px', marginBottom:'20px', fontSize:'12px', color:'#FF4444' }}>{error}</div>}
              <div style={{ marginBottom:'28px' }}>
                <div style={{ fontSize:'9px', fontWeight:'600', letterSpacing:'2px', textTransform:'uppercase', color:'#8A8E99', marginBottom:'8px' }}>Email Address</div>
                <input className="auth-input" type="email" placeholder="you@example.com" value={email} onChange={e => { setEmail(e.target.value); setError('') }} onKeyDown={e => e.key === 'Enter' && handleSendCode()} />
              </div>
              <button className="auth-btn" onClick={handleSendCode} disabled={loading}>
                {loading ? 'Sending...' : 'Send Reset Code →'}
              </button>
            </>
          )}

          {step === 2 && (
            <>
              <p style={{ fontSize:'13px', color:'#8A8E99', lineHeight:'1.8', marginBottom:'24px' }}>Enter the code sent to <strong style={{ color:'#E8E4DC' }}>{email}</strong> and your new password.</p>
              {error && <div style={{ background:'rgba(255,68,68,0.1)', border:'1px solid rgba(255,68,68,0.3)', padding:'12px 16px', marginBottom:'20px', fontSize:'12px', color:'#FF4444' }}>{error}</div>}
              <div style={{ marginBottom:'16px' }}>
                <div style={{ fontSize:'9px', fontWeight:'600', letterSpacing:'2px', textTransform:'uppercase', color:'#8A8E99', marginBottom:'8px' }}>Reset Code</div>
                <input className="auth-input" placeholder="6-digit code" maxLength={6} value={otp} onChange={e => { setOtp(e.target.value.replace(/\D/g,'')); setError('') }} style={{ letterSpacing:'6px', textAlign:'center', fontSize:'20px' }} />
              </div>
              <div style={{ marginBottom:'16px' }}>
                <div style={{ fontSize:'9px', fontWeight:'600', letterSpacing:'2px', textTransform:'uppercase', color:'#8A8E99', marginBottom:'8px' }}>New Password</div>
                <input className="auth-input" type="password" placeholder="Min. 6 characters" value={password} onChange={e => { setPassword(e.target.value); setError('') }} />
              </div>
              <div style={{ marginBottom:'28px' }}>
                <div style={{ fontSize:'9px', fontWeight:'600', letterSpacing:'2px', textTransform:'uppercase', color:'#8A8E99', marginBottom:'8px' }}>Confirm Password</div>
                <input className="auth-input" type="password" placeholder="Repeat password" value={confirmPassword} onChange={e => { setConfirmPassword(e.target.value); setError('') }} onKeyDown={e => e.key === 'Enter' && handleResetPassword()} />
              </div>
              <button className="auth-btn" onClick={handleResetPassword} disabled={loading}>
                {loading ? 'Resetting...' : 'Reset Password →'}
              </button>
            </>
          )}

          {step === 3 && (
            <div style={{ textAlign:'center', padding:'20px 0' }}>
              <div style={{ fontSize:'48px', marginBottom:'16px' }}>✓</div>
              <h2 style={{ fontFamily:"'Space Grotesk',sans-serif", fontSize:'24px', fontWeight:'700', color:'#00E5FF', marginBottom:'12px' }}>Password Reset!</h2>
              <p style={{ fontSize:'13px', color:'#8A8E99', marginBottom:'28px' }}>Your password has been updated successfully.</p>
              <button className="auth-btn" onClick={() => router.push('/auth/login')}>Sign In →</button>
            </div>
          )}

          {step !== 3 && (
            <div style={{ textAlign:'center', marginTop:'24px', fontSize:'12px', color:'#8A8E99' }}>
              Remember your password?{' '}
              <span style={{ color:'#00E5FF', cursor:'pointer' }} onClick={() => router.push('/auth/login')}>Sign In</span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}