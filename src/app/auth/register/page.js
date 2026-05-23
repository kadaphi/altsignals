'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function RegisterPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [passwordStrength, setPasswordStrength] = useState(0)
  const [form, setForm] = useState({
    full_name: '', email: '', phone: '',
    country: '', password: '', confirm_password: ''
  })
  const [otp, setOtp] = useState('')

  function handleChange(e) {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
    setError('')
    if (e.target.name === 'password') {
      const val = e.target.value
      let strength = 0
      if (val.length >= 8) strength++
      if (/[A-Z]/.test(val)) strength++
      if (/[0-9]/.test(val)) strength++
      if (/[^A-Za-z0-9]/.test(val)) strength++
      setPasswordStrength(strength)
    }
  }

  function generatePassword() {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$%'
    let pwd = ''
    for (let i = 0; i < 14; i++) pwd += chars[Math.floor(Math.random() * chars.length)]
    setForm(prev => ({ ...prev, password: pwd, confirm_password: pwd }))
    setPasswordStrength(4)
  }

  async function handleRegister() {
    if (!form.full_name || !form.email || !form.password) return setError('Please fill in all required fields')
    if (form.password !== form.confirm_password) return setError('Passwords do not match')
    if (form.password.length < 8) return setError('Password must be at least 8 characters')
    setLoading(true)
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ full_name: form.full_name, email: form.email, phone: form.phone, country: form.country, password: form.password })
      })
      const data = await res.json()
      if (!res.ok) return setError(data.error)
      localStorage.setItem('as_verify_email', form.email)
      setStep(2)
    } catch { setError('Something went wrong') }
    finally { setLoading(false) }
  }

  async function handleVerify() {
    if (!otp || otp.length !== 6) return setError('Please enter the 6-digit code')
    setLoading(true)
    try {
      const res = await fetch('/api/auth/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: form.email, otp })
      })
      const data = await res.json()
      if (!res.ok) return setError(data.error)
      localStorage.setItem('as_token', data.token)
      localStorage.removeItem('as_verify_email')
      if (data.user?.is_admin) router.push('/admin')
      else router.push('/dashboard')
    } catch { setError('Something went wrong') }
    finally { setLoading(false) }
  }

  const strengthColors = ['#FF4444', '#FF9800', '#00E5FF', '#00FF88']
  const strengthLabels = ['', 'Weak — add uppercase & numbers', 'Fair — add special characters', 'Good — add more characters', 'Strong password ✓']

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
        .gen-btn { background:none; border:1px solid rgba(0,229,255,0.2); color:#00E5FF; padding:6px 12px; font-size:9px; font-weight:600; letter-spacing:1.5px; text-transform:uppercase; cursor:pointer; font-family:'Inter',sans-serif; transition:all 0.2s; white-space:nowrap; }
        .gen-btn:hover { background:rgba(0,229,255,0.08); }
        .form-row { display:grid; grid-template-columns:1fr 1fr; gap:12px; }
        .otp-input { width:100%; background:#111320; border:1px solid rgba(0,229,255,0.3); padding:20px; color:#00E5FF; font-family:'Space Grotesk',sans-serif; font-size:36px; font-weight:700; outline:none; text-align:center; letter-spacing:12px; }
        .otp-input:focus { border-color:#00E5FF; }
        @media(max-width:520px){ .form-row{grid-template-columns:1fr;} }
      `}</style>
      <div style={{ width:'100%', maxWidth:'480px' }}>
        <div style={{ textAlign:'center', marginBottom:'40px' }}>
          <div style={{ fontFamily:"'Space Grotesk',sans-serif", fontSize:'24px', fontWeight:'700', marginBottom:'8px' }}>
            <span style={{ color:'#00E5FF' }}>ALT</span>SIGNALS
          </div>
          <div style={{ fontSize:'13px', color:'#8A8E99' }}>{step === 1 ? 'Create your trading account' : 'Verify your email address'}</div>
        </div>
        <div style={{ background:'#111320', border:'1px solid rgba(0,229,255,0.12)', padding:'40px', position:'relative' }}>
          <div style={{ position:'absolute', top:0, left:0, width:'100%', height:'2px', background:'linear-gradient(90deg,#00E5FF,transparent)' }}></div>

          {error && <div style={{ background:'rgba(255,68,68,0.1)', border:'1px solid rgba(255,68,68,0.3)', padding:'12px 16px', marginBottom:'20px', fontSize:'12px', color:'#FF4444' }}>{error}</div>}

          {step === 1 ? (
            <>
              <div style={{ marginBottom:'16px' }}>
                <div style={{ fontSize:'9px', fontWeight:'600', letterSpacing:'2px', textTransform:'uppercase', color:'#8A8E99', marginBottom:'8px' }}>Full Name *</div>
                <input className="auth-input" name="full_name" placeholder="John Smith" value={form.full_name} onChange={handleChange} />
              </div>
              <div style={{ marginBottom:'16px' }}>
                <div style={{ fontSize:'9px', fontWeight:'600', letterSpacing:'2px', textTransform:'uppercase', color:'#8A8E99', marginBottom:'8px' }}>Email Address *</div>
                <input className="auth-input" name="email" type="email" placeholder="you@example.com" value={form.email} onChange={handleChange} />
              </div>
              <div className="form-row" style={{ marginBottom:'16px' }}>
                <div>
                  <div style={{ fontSize:'9px', fontWeight:'600', letterSpacing:'2px', textTransform:'uppercase', color:'#8A8E99', marginBottom:'8px' }}>Phone</div>
                  <input className="auth-input" name="phone" placeholder="+1 234 567 8900" value={form.phone} onChange={handleChange} />
                </div>
                <div>
                  <div style={{ fontSize:'9px', fontWeight:'600', letterSpacing:'2px', textTransform:'uppercase', color:'#8A8E99', marginBottom:'8px' }}>Country</div>
                  <input className="auth-input" name="country" placeholder="United States" value={form.country} onChange={handleChange} />
                </div>
              </div>
              <div style={{ marginBottom:'16px' }}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'8px' }}>
                  <div style={{ fontSize:'9px', fontWeight:'600', letterSpacing:'2px', textTransform:'uppercase', color:'#8A8E99' }}>Password *</div>
                  <button className="gen-btn" onClick={generatePassword} type="button">Generate Strong</button>
                </div>
                <input className="auth-input" name="password" type="password" placeholder="Min. 8 characters" value={form.password} onChange={handleChange} />
                {form.password.length > 0 && (
                  <div style={{ marginTop:'8px' }}>
                    <div style={{ display:'flex', gap:'4px', marginBottom:'5px' }}>
                      {[1,2,3,4].map(i => (
                        <div key={i} style={{ flex:1, height:'3px', borderRadius:'2px', background: i <= passwordStrength ? strengthColors[passwordStrength-1] : 'rgba(255,255,255,0.08)', transition:'background 0.3s' }}></div>
                      ))}
                    </div>
                    <div style={{ fontSize:'10px', color: strengthColors[passwordStrength-1] || '#8A8E99' }}>
                      {strengthLabels[passwordStrength]}
                    </div>
                  </div>
                )}
              </div>
              <div style={{ marginBottom:'28px' }}>
                <div style={{ fontSize:'9px', fontWeight:'600', letterSpacing:'2px', textTransform:'uppercase', color:'#8A8E99', marginBottom:'8px' }}>Confirm Password *</div>
                <input className="auth-input" name="confirm_password" type="password" placeholder="Repeat your password" value={form.confirm_password} onChange={handleChange}
                  style={{ borderColor: form.confirm_password && form.confirm_password !== form.password ? 'rgba(255,68,68,0.4)' : '' }} />
                {form.confirm_password && form.confirm_password !== form.password && (
                  <div style={{ fontSize:'10px', color:'#FF4444', marginTop:'5px' }}>Passwords do not match</div>
                )}
              </div>
              <button className="auth-btn" onClick={handleRegister} disabled={loading}>
                {loading ? 'Creating Account...' : 'Create Account →'}
              </button>
              <div style={{ textAlign:'center', marginTop:'24px', fontSize:'12px', color:'#8A8E99' }}>
                Already have an account?{' '}
                <span style={{ color:'#00E5FF', cursor:'pointer' }} onClick={() => router.push('/auth/login')}>Sign In</span>
              </div>
            </>
          ) : (
            <>
              <div style={{ textAlign:'center', marginBottom:'28px' }}>
                <div style={{ fontSize:'13px', color:'#8A8E99', lineHeight:'1.8' }}>
                  We sent a 6-digit code to<br />
                  <strong style={{ color:'#E8E4DC' }}>{form.email}</strong>
                </div>
              </div>
              <div style={{ marginBottom:'8px' }}>
                <input
                  className="otp-input"
                  placeholder="000000"
                  value={otp}
                  maxLength={6}
                  onChange={e => { setOtp(e.target.value.replace(/\D/g,'').slice(0,6)); setError('') }}
                  onKeyDown={e => e.key === 'Enter' && handleVerify()}
                />
              </div>
              <div style={{ fontSize:'11px', color:'#8A8E99', textAlign:'center', marginBottom:'24px', lineHeight:'1.6' }}>
                Check your spam folder if you don't see it within a minute.
              </div>
              <button className="auth-btn" onClick={handleVerify} disabled={loading}>
                {loading ? 'Verifying...' : 'Verify & Enter Platform →'}
              </button>
              <div style={{ textAlign:'center', marginTop:'24px', fontSize:'12px', color:'#8A8E99' }}>
                Wrong email?{' '}
                <span style={{ color:'#00E5FF', cursor:'pointer' }} onClick={() => setStep(1)}>Go back</span>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}