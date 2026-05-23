'use client'
import { useState } from 'react'
import Link from 'next/link'

export default function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', subject: '', message: '', type: 'General Inquiry' })
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit() {
    if (!form.name || !form.email || !form.message) return setError('Please fill in all required fields')
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      })
      const data = await res.json()
      if (!res.ok) return setError(data.error || 'Something went wrong')
      setSuccess(true)
    } catch { setError('Something went wrong. Please try again.') }
    finally { setLoading(false) }
  }

  return (
    <div style={{ background: '#0A0A0F', minHeight: '100vh', fontFamily: "'Inter', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Space+Grotesk:wght@600;700&display=swap');
        * { margin:0; padding:0; box-sizing:border-box; }
        nav { position:sticky; top:0; background:rgba(10,10,15,0.97); border-bottom:1px solid rgba(0,229,255,0.12); padding:20px 60px; display:flex; align-items:center; justify-content:space-between; z-index:100; backdrop-filter:blur(12px); }
        .contact-input { width:100%; background:#111320; border:1px solid rgba(0,229,255,0.15); padding:14px 16px; color:#E8E4DC; font-family:'Inter',sans-serif; font-size:13px; font-weight:300; outline:none; transition:border-color 0.3s; }
        .contact-input:focus { border-color:rgba(0,229,255,0.5); }
        .contact-input::placeholder { color:#8A8E99; }
        .type-btn { background:none; border:1px solid rgba(0,229,255,0.15); color:#8A8E99; padding:8px 16px; font-size:9px; font-weight:600; letter-spacing:1.5px; text-transform:uppercase; cursor:pointer; transition:all 0.2s; font-family:'Inter',sans-serif; }
        .type-btn.active { background:rgba(0,229,255,0.1); border-color:#00E5FF; color:#00E5FF; }
        .info-card { background:#0F0F1A; border:1px solid rgba(0,229,255,0.08); padding:24px; position:relative; }
        .info-card::before { content:''; position:absolute; top:0; left:0; width:100%; height:2px; background:linear-gradient(90deg,#00E5FF,transparent); }
        @media(max-width:900px){ nav{padding:16px 20px;} .contact-body{padding:40px 20px!important;} .contact-hero{padding:80px 20px 40px!important;} .contact-grid{grid-template-columns:1fr!important;} }
      `}</style>

      <nav>
        <Link href="/" style={{ fontFamily:"'Space Grotesk',sans-serif", fontSize:'18px', fontWeight:'700', textDecoration:'none', color:'#E8E4DC' }}>
          <span style={{ color:'#00E5FF' }}>ALT</span>SIGNALS
        </Link>
        <div style={{ display:'flex', gap:'32px', alignItems:'center' }}>
          <Link href="/about" style={{ fontSize:'10px', fontWeight:'500', letterSpacing:'2px', textTransform:'uppercase', color:'#8A8E99', textDecoration:'none' }}>About</Link>
          <Link href="/auth/register" style={{ fontSize:'10px', fontWeight:'700', letterSpacing:'2px', textTransform:'uppercase', color:'#0A0A0F', background:'#00E5FF', padding:'10px 24px', textDecoration:'none', clipPath:'polygon(6px 0%,100% 0%,calc(100% - 6px) 100%,0% 100%)' }}>Get Started</Link>
        </div>
      </nav>

      <div className="contact-hero" style={{ padding:'100px 60px 60px', maxWidth:'1200px', margin:'0 auto' }}>
        <div style={{ fontSize:'10px', fontWeight:'600', letterSpacing:'4px', textTransform:'uppercase', color:'#00E5FF', marginBottom:'20px', display:'flex', alignItems:'center', gap:'14px' }}>
          <span style={{ display:'block', width:'40px', height:'1px', background:'#00E5FF' }}></span>
          Get In Touch
        </div>
        <h1 style={{ fontFamily:"'Space Grotesk',sans-serif", fontSize:'clamp(36px,5vw,64px)', fontWeight:'700', color:'#E8E4DC', lineHeight:'1.1', marginBottom:'20px' }}>
          We'd love to <span style={{ color:'#00E5FF' }}>hear from you</span>
        </h1>
        <p style={{ fontSize:'15px', fontWeight:'300', color:'#8A8E99', maxWidth:'520px', lineHeight:'1.8' }}>
          Whether you're an existing member, prospective investor, or have a general enquiry, our team is ready to assist. We typically respond within 24 hours.
        </p>
      </div>

      <div className="contact-body" style={{ padding:'0 60px 80px', maxWidth:'1200px', margin:'0 auto' }}>
        <div className="contact-grid" style={{ display:'grid', gridTemplateColumns:'1fr 1.6fr', gap:'32px', alignItems:'start' }}>

          <div style={{ display:'flex', flexDirection:'column', gap:'12px' }}>
            {[
              { title:'General Support', email:'support@altsignals.finance', desc:'Account questions, technical issues, and general enquiries.' },
              { title:'Investment Relations', email:'invest@altsignals.finance', desc:'New investment inquiries and partnership opportunities.' },
              { title:'Compliance & Legal', email:'compliance@altsignals.finance', desc:'Regulatory, legal, and compliance matters.' },
              { title:'Privacy & Data', email:'privacy@altsignals.finance', desc:'Data protection requests and privacy concerns.' },
            ].map((item,i) => (
              <div key={i} className="info-card">
                <div style={{ fontSize:'12px', fontWeight:'600', color:'#E8E4DC', marginBottom:'4px' }}>{item.title}</div>
                <div style={{ fontSize:'11px', color:'#00E5FF', marginBottom:'6px', fontFamily:'monospace' }}>{item.email}</div>
                <div style={{ fontSize:'11px', color:'#8A8E99', lineHeight:'1.6' }}>{item.desc}</div>
              </div>
            ))}
          </div>

          <div style={{ background:'#0F0F1A', border:'1px solid rgba(0,229,255,0.08)', padding:'40px', position:'relative' }}>
            <div style={{ position:'absolute', top:0, left:0, width:'100%', height:'2px', background:'linear-gradient(90deg,#00E5FF,transparent)' }}></div>

            {success ? (
              <div style={{ textAlign:'center', padding:'60px 0' }}>
                <div style={{ fontSize:'48px', marginBottom:'20px' }}>✓</div>
                <h3 style={{ fontFamily:"'Space Grotesk',sans-serif", fontSize:'24px', fontWeight:'700', color:'#E8E4DC', marginBottom:'12px' }}>Message Sent</h3>
                <p style={{ fontSize:'13px', color:'#8A8E99', lineHeight:'1.8', marginBottom:'28px' }}>Thank you for reaching out. Our team will respond within 24 hours.</p>
                <button onClick={() => setSuccess(false)} style={{ background:'none', border:'1px solid rgba(0,229,255,0.3)', color:'#00E5FF', padding:'12px 28px', fontSize:'10px', fontWeight:'600', letterSpacing:'2px', textTransform:'uppercase', cursor:'pointer', fontFamily:'Inter,sans-serif' }}>
                  Send Another Message
                </button>
              </div>
            ) : (
              <>
                <div style={{ fontSize:'9px', fontWeight:'600', letterSpacing:'3px', textTransform:'uppercase', color:'#00E5FF', marginBottom:'24px' }}>Send Us a Message</div>

                <div style={{ display:'flex', gap:'8px', flexWrap:'wrap', marginBottom:'20px' }}>
                  {['General Inquiry', 'Investment', 'Support', 'Partnership', 'Compliance'].map(type => (
                    <button key={type} className={`type-btn ${form.type === type ? 'active' : ''}`} onClick={() => setForm(p => ({ ...p, type }))}>
                      {type}
                    </button>
                  ))}
                </div>

                {error && <div style={{ background:'rgba(255,68,68,0.1)', border:'1px solid rgba(255,68,68,0.3)', padding:'12px 16px', marginBottom:'16px', fontSize:'12px', color:'#FF4444' }}>{error}</div>}

                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'12px', marginBottom:'12px' }}>
                  <div>
                    <div style={{ fontSize:'9px', fontWeight:'600', letterSpacing:'2px', textTransform:'uppercase', color:'#8A8E99', marginBottom:'8px' }}>Full Name *</div>
                    <input className="contact-input" placeholder="John Smith" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} />
                  </div>
                  <div>
                    <div style={{ fontSize:'9px', fontWeight:'600', letterSpacing:'2px', textTransform:'uppercase', color:'#8A8E99', marginBottom:'8px' }}>Email Address *</div>
                    <input className="contact-input" type="email" placeholder="you@example.com" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} />
                  </div>
                </div>

                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'12px', marginBottom:'12px' }}>
                  <div>
                    <div style={{ fontSize:'9px', fontWeight:'600', letterSpacing:'2px', textTransform:'uppercase', color:'#8A8E99', marginBottom:'8px' }}>Phone (Optional)</div>
                    <input className="contact-input" placeholder="+1 234 567 8900" value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} />
                  </div>
                  <div>
                    <div style={{ fontSize:'9px', fontWeight:'600', letterSpacing:'2px', textTransform:'uppercase', color:'#8A8E99', marginBottom:'8px' }}>Subject</div>
                    <input className="contact-input" placeholder="How can we help?" value={form.subject} onChange={e => setForm(p => ({ ...p, subject: e.target.value }))} />
                  </div>
                </div>

                <div style={{ marginBottom:'20px' }}>
                  <div style={{ fontSize:'9px', fontWeight:'600', letterSpacing:'2px', textTransform:'uppercase', color:'#8A8E99', marginBottom:'8px' }}>Message *</div>
                  <textarea className="contact-input" placeholder="Tell us how we can help..." rows={5} value={form.message} onChange={e => setForm(p => ({ ...p, message: e.target.value }))} style={{ resize:'vertical' }} />
                </div>

                <button onClick={handleSubmit} disabled={loading} style={{ width:'100%', background:'#00E5FF', border:'none', padding:'14px', color:'#0A0A0F', fontSize:'11px', fontWeight:'700', letterSpacing:'2px', textTransform:'uppercase', cursor:'pointer', fontFamily:'Inter,sans-serif', clipPath:'polygon(8px 0%,100% 0%,calc(100% - 8px) 100%,0% 100%)', opacity: loading ? 0.6 : 1 }}>
                  {loading ? 'Sending...' : 'Send Message →'}
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      <div style={{ padding:'32px 60px', borderTop:'1px solid rgba(0,229,255,0.08)', textAlign:'center', fontSize:'11px', color:'#8A8E99' }}>
        © 2026 AltSignals Ltd. ·{' '}
        <Link href="/legal/privacy-policy" style={{ color:'#8A8E99', textDecoration:'none' }}>Privacy Policy</Link> ·{' '}
        <Link href="/legal/terms-of-service" style={{ color:'#8A8E99', textDecoration:'none' }}>Terms of Service</Link>
      </div>
    </div>
  )
}