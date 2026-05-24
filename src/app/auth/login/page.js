'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [form, setForm] = useState({ email: '', password: '' })
  const [otp, setOtp] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [pendingUser, setPendingUser] = useState(null)
  const [pendingToken, setPendingToken] = useState(null)

  async function handleLogin() {
    if (!form.email || !form.password) return setError('All fields are required')
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      })
      const data = await res.json()
      if (!res.ok) return setError(data.error)
      setPendingUser(data.user)
      setPendingToken(data.token)
      setStep(2)
    } catch { setError('Something went wrong') }
    finally { setLoading(false) }
  }

  async function handleVerifyOTP() {
    if (!otp || otp.length !== 6) return setError('Please enter the 6-digit code')
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/auth/verify-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: form.email, otp })
      })
      const data = await res.json()
      if (!res.ok) return setError(data.error)
      localStorage.setItem('as_token', pendingToken)
      window.location.href = pendingUser?.is_admin ? '/admin' : '/dashboard'
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
        .otp-input { width:100%; background:#111320; border:1px solid rgba(0,229,255,0.3); padding:20px; color:#00E5FF; font-family:'Space Grotesk',sans-serif; font-size:36px; font-weight:700; outline:none; text-align:center; letter-spacing:12px; }
        .otp-input:focus { border-color:#00E5FF; }
      `}</style>

      <div style={{ width:'100%', maxWidth:'440px' }}>
        <div style={{ textAlign:'center', marginBottom:'40px' }}>
          <div style={{ fontFamily:"'Space Grotesk',sans-serif", fontSize:'24px', fontWeight:'700', marginBottom:'8px' }}>
            <span style={{ color:'#00E5FF' }}>ALT</span>SIGNALS
          </div>
          <div style={{ fontSize:'13px', color:'#8A8E99' }}>
            {step === 1 ? 'Sign in to your account' : 'Verify your identity'}
          </div>
        </div>

        <div style={{ background:'#111320', border:'1px solid rgba(0,229,255,0.12)', padding:'40px', position:'relative' }}>
          <div style={{ position:'absolute', top:0, left:0, width:'100%', height:'2px', background:'linear-gradient(90deg,#00E5FF,transparent)' }}></div>

          {error && <div style={{ background:'rgba(255,68,68,0.1)', border:'1px solid rgba(255,68,68,0.3)', padding:'12px 16px', marginBottom:'20px', fontSize:'12px', color:'#FF4444' }}>{error}</div>}

          {step === 1 && (
            <>
              <div style={{ marginBottom:'16px' }}>
                <div style={{ fontSize:'9px', fontWeight:'600', letterSpacing:'2px', textTransform:'uppercase', color:'#8A8E99', marginBottom:'8px' }}>Email Address</div>
                <input className="auth-input" type="email" placeholder="you@example.com" value={form.email} onChange={e => { setForm({...form, email: e.target.value}); setError('') }} />
              </div>
              <div style={{ marginBottom:'12px' }}>
                <div style={{ fontSize:'9px', fontWeight:'600', letterSpacing:'2px', textTransform:'uppercase', color:'#8A8E99', marginBottom:'8px' }}>Password</div>
                <input className="auth-input" type="password" placeholder="Your password" value={form.password} onChange={e => { setForm({...form, password: e.target.value}); setError('') }} onKeyDown={e => e.key === 'Enter' && handleLogin()} />
              </div>
              <div style={{ textAlign:'right', marginBottom:'28px' }}>
                <span style={{ fontSize:'12px', color:'#00E5FF', cursor:'pointer' }} onClick={() => router.push('/auth/forgot-password')}>Forgot password?</span>
              </div>
              <button className="auth-btn" onClick={handleLogin} disabled={loading}>
                {loading ? 'Sending Code...' : 'Continue →'}
              </button>
              <div style={{ textAlign:'center', marginTop:'24px', fontSize:'12px', color:'#8A8E99' }}>
                Don't have an account?{' '}
                <span style={{ color:'#00E5FF', cursor:'pointer' }} onClick={() => router.push('/auth/register')}>Create Account</span>
              </div>
            </>
          )}

          {step === 2 && (
            <>
              <div style={{ textAlign:'center', marginBottom:'24px' }}>
                <div style={{ fontSize:'13px', color:'#8A8E99', lineHeight:'1.8' }}>
                  We sent a verification code to<br />
                  <strong style={{ color:'#E8E4DC' }}>{form.email}</strong>
                </div>
              </div>
              <div style={{ marginBottom:'8px' }}>
                <input
                  className="otp-input"
                  placeholder="000000"
                  maxLength={6}
                  value={otp}
                  onChange={e => { setOtp(e.target.value.replace(/\D/g,'').slice(0,6)); setError('') }}
                  onKeyDown={e => e.key === 'Enter' && handleVerifyOTP()}
                />
              </div>
              <div style={{ fontSize:'11px', color:'#8A8E99', textAlign:'center', marginBottom:'24px', lineHeight:'1.6' }}>
                Check your spam folder if you don't see it.
              </div>
              <button className="auth-btn" onClick={handleVerifyOTP} disabled={loading}>
                {loading ? 'Verifying...' : 'Sign In →'}
              </button>
              <div style={{ textAlign:'center', marginTop:'24px', fontSize:'12px', color:'#8A8E99' }}>
                <span style={{ color:'#00E5FF', cursor:'pointer' }} onClick={() => { setStep(1); setOtp(''); setError('') }}>← Back</span>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}