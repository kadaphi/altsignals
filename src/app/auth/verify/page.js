'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function VerifyPage() {
  const router = useRouter()
  const [otp, setOtp] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [email, setEmail] = useState('')

  useEffect(() => {
    const savedEmail = localStorage.getItem('as_verify_email')
    if (!savedEmail) router.push('/auth/register')
    else setEmail(savedEmail)
  }, [])

  async function handleVerify() {
    if (!otp || otp.length !== 6) return setError('Please enter the 6-digit code')
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/auth/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp })
      })
      const data = await res.json()
      if (!res.ok) return setError(data.error)
      localStorage.setItem('as_token', data.token)
      localStorage.removeItem('as_verify_email')
      if (data.user?.is_admin) {
        router.push('/admin')
      } else {
        router.push('/dashboard')
      }
    } catch { setError('Something went wrong') }
    finally { setLoading(false) }
  }

  return (
    <div style={{ minHeight:'100vh', background:'#0A0A0F', display:'flex', alignItems:'center', justifyContent:'center', padding:'20px', fontFamily:"'Inter',sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Space+Grotesk:wght@600;700&display=swap');
        .auth-input { width:100%; background:#111320; border:1px solid rgba(0,229,255,0.15); padding:14px 16px; color:#E8E4DC; font-family:'Inter',sans-serif; font-size:24px; outline:none; transition:border-color 0.3s; text-align:center; letter-spacing:8px; }
        .auth-input:focus { border-color:rgba(0,229,255,0.5); }
        .auth-input::placeholder { color:#8A8E99; font-size:13px; letter-spacing:0; }
        .auth-btn { width:100%; background:#00E5FF; border:none; color:#0A0A0F; padding:14px; font-size:11px; font-weight:700; letter-spacing:2px; text-transform:uppercase; cursor:pointer; font-family:'Inter',sans-serif; transition:background 0.3s; clip-path:polygon(8px 0%,100% 0%,calc(100% - 8px) 100%,0% 100%); }
        .auth-btn:hover { background:#33EEFF; }
        .auth-btn:disabled { opacity:0.6; cursor:not-allowed; }
      `}</style>
      <div style={{ width:'100%', maxWidth:'440px' }}>
        <div style={{ textAlign:'center', marginBottom:'40px' }}>
          <div style={{ fontFamily:"'Space Grotesk',sans-serif", fontSize:'24px', fontWeight:'700', marginBottom:'8px' }}>
            <span style={{ color:'#00E5FF' }}>ALT</span>SIGNALS
          </div>
          <div style={{ fontSize:'13px', color:'#8A8E99' }}>Verify your email address</div>
        </div>
        <div style={{ background:'#111320', border:'1px solid rgba(0,229,255,0.12)', padding:'40px', position:'relative' }}>
          <div style={{ position:'absolute', top:0, left:0, width:'100%', height:'2px', background:'linear-gradient(90deg,#00E5FF,transparent)' }}></div>
          <div style={{ textAlign:'center', marginBottom:'28px' }}>
            <div style={{ fontSize:'13px', color:'#8A8E99', lineHeight:'1.8' }}>
              We sent a 6-digit code to<br />
              <strong style={{ color:'#E8E4DC' }}>{email}</strong>
            </div>
          </div>
          {error && <div style={{ background:'rgba(255,68,68,0.1)', border:'1px solid rgba(255,68,68,0.3)', padding:'12px 16px', marginBottom:'20px', fontSize:'12px', color:'#FF4444' }}>{error}</div>}
          <div style={{ marginBottom:'28px' }}>
            <div style={{ fontSize:'9px', fontWeight:'600', letterSpacing:'2px', textTransform:'uppercase', color:'#8A8E99', marginBottom:'8px' }}>Verification Code</div>
            <input className="auth-input" placeholder="000000" maxLength={6} value={otp} onChange={e => { setOtp(e.target.value.replace(/\D/g,'')); setError('') }} onKeyDown={e => e.key === 'Enter' && handleVerify()} />
          </div>
          <button className="auth-btn" onClick={handleVerify} disabled={loading}>
            {loading ? 'Verifying...' : 'Verify Account →'}
          </button>
          <div style={{ textAlign:'center', marginTop:'24px', fontSize:'12px', color:'#8A8E99' }}>
            Wrong email?{' '}
            <span style={{ color:'#00E5FF', cursor:'pointer' }} onClick={() => router.push('/auth/register')}>Go back</span>
          </div>
        </div>
      </div>
    </div>
  )
}