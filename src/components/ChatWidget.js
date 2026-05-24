'use client'
import { useState, useEffect, useRef } from 'react'
import { useAuth } from '@/context/AuthContext'
import { usePathname } from 'next/navigation'

export default function ChatWidget() {
  const { user } = useAuth()
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  const [step, setStep] = useState('intro')
  const [guestForm, setGuestForm] = useState({ name: '', email: '', subject: '' })
  const [messages, setMessages] = useState([])
  const [message, setMessage] = useState('')
  const [sending, setSending] = useState(false)
  const [imageFile, setImageFile] = useState(null)
  const [imagePreview, setImagePreview] = useState('')
  const [closed, setClosed] = useState(false)
  const fileInputRef = useRef(null)
  const messagesEndRef = useRef(null)
  const pollRef = useRef(null)

  useEffect(() => {
    if (pathname.startsWith('/admin')) return
    if (user) {
      setStep('chat')
      fetchChat()
      if (pollRef.current) clearInterval(pollRef.current)
      pollRef.current = setInterval(fetchChat, 4000)
    } else {
      const saved = localStorage.getItem('as_guest_chat')
      if (saved) {
        setGuestForm(JSON.parse(saved))
        setStep('chat')
        fetchGuestChat(JSON.parse(saved).email)
      }
    }
    return () => { if (pollRef.current) clearInterval(pollRef.current) }
  }, [user, pathname])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  async function fetchChat() {
    try {
      const res = await fetch('/api/chat', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('as_token')}` }
      })
      if (res.ok) {
        const data = await res.json()
        setMessages(data.messages || [])
        setClosed(data.status === 'closed')
      }
    } catch {}
  }

  async function fetchGuestChat(email) {
    try {
      const res = await fetch(`/api/chat/guest?email=${encodeURIComponent(email)}`)
      if (res.ok) {
        const data = await res.json()
        setMessages(data.messages || [])
        setClosed(data.status === 'closed')
      }
    } catch {}
  }

  async function handleStartGuest() {
    if (!guestForm.name || !guestForm.email) return
    localStorage.setItem('as_guest_chat', JSON.stringify(guestForm))
    await fetch('/api/chat/guest', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...guestForm, message: guestForm.subject || 'Hello, I need help.' })
    })
    setStep('chat')
    fetchGuestChat(guestForm.email)
    if (pollRef.current) clearInterval(pollRef.current)
    pollRef.current = setInterval(() => fetchGuestChat(guestForm.email), 4000)
  }

  function handleFileChange(e) {
    const file = e.target.files[0]
    if (!file) return
    setImageFile(file)
    const reader = new FileReader()
    reader.onload = () => setImagePreview(reader.result)
    reader.readAsDataURL(file)
  }

  async function handleSend() {
    if (!message.trim() && !imagePreview) return
    setSending(true)
    try {
      if (user) {
        await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('as_token')}` },
          body: JSON.stringify({ message: message.trim(), image_url: imagePreview || null })
        })
        fetchChat()
      } else {
        await fetch('/api/chat/guest', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...guestForm, message: message.trim(), image_url: imagePreview || null })
        })
        fetchGuestChat(guestForm.email)
      }
      setMessage('')
      setImageFile(null)
      setImagePreview('')
    } catch {}
    finally { setSending(false) }
  }

  if (pathname.startsWith('/admin')) return null

  const displayName = user ? user.full_name?.split(' ')[0] : guestForm.name?.split(' ')[0]

  return (
    <>
      <style>{`
        .cwbtn { position:fixed; bottom:24px; right:24px; width:54px; height:54px; background:#00E5FF; border:none; border-radius:50%; cursor:pointer; display:flex; align-items:center; justify-content:center; z-index:999; box-shadow:0 4px 20px rgba(0,229,255,0.4); transition:transform 0.2s; font-size:22px; }
        .cwbtn:hover { transform:scale(1.08); }
        .cwwin { position:fixed; bottom:88px; right:24px; width:340px; background:#0F0F1A; border:1px solid rgba(0,229,255,0.2); z-index:998; display:flex; flex-direction:column; max-height:500px; box-shadow:0 8px 40px rgba(0,0,0,0.5); animation:cwSlide 0.2s ease; }
        @keyframes cwSlide { from{opacity:0;transform:translateY(10px);}to{opacity:1;transform:translateY(0);} }
        .cwinput { width:100%; background:#111320; border:1px solid rgba(0,229,255,0.15); padding:10px 12px; color:#E8E4DC; font-family:'Inter',sans-serif; font-size:12px; outline:none; }
        .cwinput:focus { border-color:rgba(0,229,255,0.4); }
        .cwinput::placeholder { color:#8A8E99; }
        .cwmsg { flex:1; overflow-y:auto; padding:16px; display:flex; flex-direction:column; gap:10px; min-height:160px; max-height:280px; }
        .cwmsg::-webkit-scrollbar { width:3px; }
        .cwmsg::-webkit-scrollbar-thumb { background:rgba(0,229,255,0.2); }
        @media(max-width:480px){ .cwwin{width:calc(100vw - 32px);right:16px;} }
      `}</style>

      <button className="cwbtn" onClick={() => setOpen(!open)}>
        {open
          ? <span style={{ color:'#0A0A0F', fontSize:'24px', fontWeight:'700', lineHeight:1 }}>×</span>
          : <span>💬</span>
        }
      </button>

      {open && (
        <div className="cwwin">
          {/* Header */}
          <div style={{ padding:'14px 16px', borderBottom:'1px solid rgba(0,229,255,0.08)', display:'flex', alignItems:'center', gap:'10px', background:'#0A0A0F' }}>
            <div style={{ width:'32px', height:'32px', background:'rgba(0,229,255,0.1)', border:'1px solid rgba(0,229,255,0.2)', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'14px', flexShrink:0 }}>💬</div>
            <div style={{ flex:1 }}>
              <div style={{ fontSize:'12px', fontWeight:'600', color:'#E8E4DC' }}>AltSignals Support</div>
              <div style={{ fontSize:'10px', color:'#00FF88', display:'flex', alignItems:'center', gap:'4px' }}>
                <span style={{ width:'5px', height:'5px', background:'#00FF88', borderRadius:'50%', display:'inline-block' }}></span>
                Online
              </div>
            </div>
            <button onClick={() => setOpen(false)} style={{ background:'none', border:'none', color:'#8A8E99', cursor:'pointer', fontSize:'20px', lineHeight:1 }}>×</button>
          </div>

          {/* Intro form for guests */}
          {step === 'intro' && (
            <div style={{ padding:'20px', display:'flex', flexDirection:'column', gap:'12px' }}>
              <div style={{ textAlign:'center', marginBottom:'4px' }}>
                <div style={{ fontSize:'24px', marginBottom:'8px' }}>👋</div>
                <div style={{ fontSize:'13px', fontWeight:'600', color:'#E8E4DC', marginBottom:'4px' }}>Hello there!</div>
                <div style={{ fontSize:'11px', color:'#8A8E99', lineHeight:'1.6' }}>Please tell us a bit about yourself and we'll get right back to you.</div>
              </div>
              <div>
                <div style={{ fontSize:'9px', fontWeight:'600', letterSpacing:'1.5px', textTransform:'uppercase', color:'#8A8E99', marginBottom:'6px' }}>Your Name *</div>
                <input className="cwinput" placeholder="John Smith" value={guestForm.name} onChange={e => setGuestForm({...guestForm, name: e.target.value})} />
              </div>
              <div>
                <div style={{ fontSize:'9px', fontWeight:'600', letterSpacing:'1.5px', textTransform:'uppercase', color:'#8A8E99', marginBottom:'6px' }}>Email Address *</div>
                <input className="cwinput" type="email" placeholder="you@example.com" value={guestForm.email} onChange={e => setGuestForm({...guestForm, email: e.target.value})} />
              </div>
              <div>
                <div style={{ fontSize:'9px', fontWeight:'600', letterSpacing:'1.5px', textTransform:'uppercase', color:'#8A8E99', marginBottom:'6px' }}>How can we help?</div>
                <input className="cwinput" placeholder="Brief description..." value={guestForm.subject} onChange={e => setGuestForm({...guestForm, subject: e.target.value})} />
              </div>
              <button
                onClick={handleStartGuest}
                disabled={!guestForm.name || !guestForm.email}
                style={{ background:'#00E5FF', border:'none', color:'#0A0A0F', padding:'12px', fontSize:'10px', fontWeight:'700', letterSpacing:'2px', textTransform:'uppercase', cursor:'pointer', fontFamily:'Inter,sans-serif', clipPath:'polygon(6px 0%,100% 0%,calc(100% - 6px) 100%,0% 100%)', opacity: !guestForm.name || !guestForm.email ? 0.6 : 1 }}
              >
                Start Chat →
              </button>
              <div style={{ fontSize:'10px', color:'#8A8E99', textAlign:'center' }}>Typical response: under 5 minutes</div>
            </div>
          )}

          {/* Chat */}
          {step === 'chat' && (
            <>
              <div className="cwmsg">
                {messages.length === 0 && (
                  <div style={{ textAlign:'center', padding:'20px 0' }}>
                    <div style={{ fontSize:'13px', fontWeight:'500', color:'#E8E4DC', marginBottom:'4px' }}>Hi {displayName}! 👋</div>
                    <div style={{ fontSize:'11px', color:'#8A8E99', lineHeight:'1.6' }}>How can we help you today?</div>
                  </div>
                )}
                {messages.map((msg, i) => (
                  <div key={i} style={{ display:'flex', justifyContent: msg.is_admin ? 'flex-start' : 'flex-end' }}>
                    <div style={{ maxWidth:'82%' }}>
                      <div style={{ background: msg.is_admin ? '#111320' : 'rgba(0,229,255,0.15)', border:`1px solid ${msg.is_admin ? 'rgba(0,229,255,0.08)' : 'rgba(0,229,255,0.3)'}`, padding:'9px 13px' }}>
                        {msg.image_url && <img src={msg.image_url} alt="attachment" style={{ maxWidth:'100%', marginBottom:'6px', display:'block' }} />}
                        {msg.message && <div style={{ fontSize:'12px', color:'#E8E4DC', lineHeight:'1.5' }}>{msg.message}</div>}
                      </div>
                      <div style={{ fontSize:'9px', color:'#8A8E99', marginTop:'3px', textAlign: msg.is_admin ? 'left' : 'right' }}>
                        {msg.is_admin ? 'Support' : 'You'} · {new Date(msg.created_at).toLocaleTimeString([], { hour:'2-digit', minute:'2-digit' })}
                      </div>
                    </div>
                  </div>
                ))}
                {closed && (
                  <div style={{ textAlign:'center', padding:'12px', background:'rgba(255,68,68,0.06)', border:'1px solid rgba(255,68,68,0.15)', fontSize:'11px', color:'#FF6666' }}>
                    This chat has been closed by support.
                    <div style={{ marginTop:'8px' }}>
                      <button onClick={() => {
                        localStorage.removeItem('as_guest_chat')
                        setStep('intro')
                        setMessages([])
                        setClosed(false)
                        setGuestForm({ name:'', email:'', subject:'' })
                      }} style={{ background:'none', border:'1px solid rgba(0,229,255,0.2)', color:'#00E5FF', padding:'6px 14px', fontSize:'9px', fontWeight:'600', cursor:'pointer', fontFamily:'Inter,sans-serif' }}>
                        Start New Chat
                      </button>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {imagePreview && (
                <div style={{ padding:'8px 12px', borderTop:'1px solid rgba(0,229,255,0.08)', display:'flex', alignItems:'center', gap:'8px' }}>
                  <img src={imagePreview} alt="preview" style={{ width:'40px', height:'40px', objectFit:'cover' }} />
                  <div style={{ fontSize:'10px', color:'#8A8E99', flex:1 }}>Image ready</div>
                  <button onClick={() => { setImageFile(null); setImagePreview('') }} style={{ background:'none', border:'none', color:'#FF4444', cursor:'pointer', fontSize:'16px' }}>×</button>
                </div>
              )}

              {!closed && (
                <div style={{ padding:'12px', borderTop:'1px solid rgba(0,229,255,0.08)' }}>
                  <textarea
                    className="cwinput"
                    rows={2}
                    placeholder="Type a message..."
                    value={message}
                    onChange={e => setMessage(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend() } }}
                    style={{ width:'100%', resize:'none', marginBottom:'8px' }}
                  />
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                    <button onClick={() => fileInputRef.current?.click()}
                      style={{ background:'none', border:'1px solid rgba(0,229,255,0.2)', color:'#8A8E99', padding:'6px 10px', cursor:'pointer', fontSize:'11px', display:'flex', alignItems:'center', gap:'5px', fontFamily:'Inter,sans-serif' }}>
                      <span>📎</span><span style={{ fontSize:'10px' }}>Attach</span>
                    </button>
                    <input ref={fileInputRef} type="file" accept="image/*" style={{ display:'none' }} onChange={handleFileChange} />
                    <button onClick={handleSend} disabled={sending || (!message.trim() && !imagePreview)}
                      style={{ background:'#00E5FF', border:'none', color:'#0A0A0F', padding:'8px 20px', fontSize:'10px', fontWeight:'700', letterSpacing:'2px', textTransform:'uppercase', cursor:'pointer', fontFamily:'Inter,sans-serif', clipPath:'polygon(6px 0%,100% 0%,calc(100% - 6px) 100%,0% 100%)', opacity: sending || (!message.trim() && !imagePreview) ? 0.6 : 1 }}>
                      {sending ? '...' : 'Send'}
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </>
  )
}