'use client'
import { useState, useEffect, useRef } from 'react'
import { useAuth } from '@/context/AuthContext'
import { usePathname } from 'next/navigation'

export default function ChatWidget() {
  const { user } = useAuth()
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  const [step, setStep] = useState('chat')
  const [messages, setMessages] = useState([])
  const [message, setMessage] = useState('')
  const [sending, setSending] = useState(false)
  const [imageFile, setImageFile] = useState(null)
  const [imagePreview, setImagePreview] = useState('')
  const fileInputRef = useRef(null)
  const messagesEndRef = useRef(null)
  const pollRef = useRef(null)

  useEffect(() => {
    if (user && !pathname.startsWith('/admin')) {
      fetchChat()
      if (pollRef.current) clearInterval(pollRef.current)
      pollRef.current = setInterval(fetchChat, 4000)
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
      }
    } catch {}
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
      let image_url = null
      if (imagePreview) {
        image_url = imagePreview
      }
      await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('as_token')}`
        },
        body: JSON.stringify({ message: message.trim(), image_url })
      })
      setMessage('')
      setImageFile(null)
      setImagePreview('')
      fetchChat()
    } catch {}
    finally { setSending(false) }
  }

  if (pathname.startsWith('/admin')) return null
  if (!user) return null

  const unreadCount = messages.filter(m => m.is_admin).length > 0 && !open ? 1 : 0

  return (
    <>
      <style>{`
        .chat-widget-btn { position:fixed; bottom:24px; right:24px; width:54px; height:54px; background:#00E5FF; border:none; border-radius:50%; cursor:pointer; display:flex; align-items:center; justify-content:center; z-index:999; box-shadow:0 4px 20px rgba(0,229,255,0.4); transition:transform 0.2s; font-size:22px; }
        .chat-widget-btn:hover { transform:scale(1.08); }
        .chat-window { position:fixed; bottom:88px; right:24px; width:340px; background:#0F0F1A; border:1px solid rgba(0,229,255,0.2); z-index:998; display:flex; flex-direction:column; max-height:480px; box-shadow:0 8px 40px rgba(0,0,0,0.5); animation:chatSlide 0.2s ease; }
        @keyframes chatSlide { from{opacity:0;transform:translateY(10px);}to{opacity:1;transform:translateY(0);} }
        .chat-header { padding:14px 16px; border-bottom:1px solid rgba(0,229,255,0.08); display:flex; align-items:center; gap:10px; background:#0A0A0F; }
        .chat-messages { flex:1; overflow-y:auto; padding:16px; display:flex; flex-direction:column; gap:10px; min-height:180px; max-height:280px; }
        .chat-messages::-webkit-scrollbar { width:3px; }
        .chat-messages::-webkit-scrollbar-thumb { background:rgba(0,229,255,0.2); }
        .chat-input-area { padding:12px; border-top:1px solid rgba(0,229,255,0.08); }
        .chat-input { width:100%; background:#111320; border:1px solid rgba(0,229,255,0.15); padding:10px 12px; color:#E8E4DC; font-family:'Inter',sans-serif; font-size:12px; outline:none; resize:none; }
        .chat-input:focus { border-color:rgba(0,229,255,0.4); }
        .chat-input::placeholder { color:#8A8E99; }
        @media(max-width:480px){ .chat-window{width:calc(100vw - 32px); right:16px;} }
      `}</style>

      <button className="chat-widget-btn" onClick={() => setOpen(!open)}>
        {open
          ? <span style={{ color:'#0A0A0F', fontSize:'24px', fontWeight:'700', lineHeight:1 }}>×</span>
          : <span>💬</span>
        }
        {!open && unreadCount > 0 && (
          <div style={{ position:'absolute', top:'-3px', right:'-3px', width:'18px', height:'18px', background:'#FF4444', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'9px', fontWeight:'700', color:'#fff' }}>{unreadCount}</div>
        )}
      </button>

      {open && (
        <div className="chat-window">
          <div className="chat-header">
            <div style={{ width:'32px', height:'32px', background:'rgba(0,229,255,0.1)', border:'1px solid rgba(0,229,255,0.2)', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'14px', flexShrink:0 }}>💬</div>
            <div style={{ flex:1 }}>
              <div style={{ fontSize:'12px', fontWeight:'600', color:'#E8E4DC' }}>AltSignals Support</div>
              <div style={{ fontSize:'10px', color:'#00FF88', display:'flex', alignItems:'center', gap:'4px' }}>
                <span style={{ width:'5px', height:'5px', background:'#00FF88', borderRadius:'50%', display:'inline-block' }}></span>
                Online
              </div>
            </div>
            <button onClick={() => setOpen(false)} style={{ background:'none', border:'none', color:'#8A8E99', cursor:'pointer', fontSize:'20px', lineHeight:1, padding:'0' }}>×</button>
          </div>

          <div className="chat-messages">
            {messages.length === 0 && (
              <div style={{ textAlign:'center', padding:'20px 0' }}>
                <div style={{ fontSize:'28px', marginBottom:'8px' }}>👋</div>
                <div style={{ fontSize:'13px', fontWeight:'500', color:'#E8E4DC', marginBottom:'4px' }}>Hi {user?.full_name?.split(' ')[0]}!</div>
                <div style={{ fontSize:'11px', color:'#8A8E99', lineHeight:'1.6' }}>How can we help you today? Send us a message and we'll respond shortly.</div>
              </div>
            )}
            {messages.map((msg, i) => (
              <div key={i} style={{ display:'flex', justifyContent: msg.is_admin ? 'flex-start' : 'flex-end' }}>
                <div style={{ maxWidth:'82%' }}>
                  <div style={{ background: msg.is_admin ? '#111320' : 'rgba(0,229,255,0.15)', border:`1px solid ${msg.is_admin ? 'rgba(0,229,255,0.08)' : 'rgba(0,229,255,0.3)'}`, padding:'9px 13px', borderRadius:'2px' }}>
                    {msg.image_url && <img src={msg.image_url} alt="attachment" style={{ maxWidth:'100%', marginBottom:'6px', display:'block', borderRadius:'2px' }} />}
                    {msg.message && <div style={{ fontSize:'12px', color:'#E8E4DC', lineHeight:'1.5' }}>{msg.message}</div>}
                  </div>
                  <div style={{ fontSize:'9px', color:'#8A8E99', marginTop:'3px', textAlign: msg.is_admin ? 'left' : 'right' }}>
                    {msg.is_admin ? 'Support' : 'You'} · {new Date(msg.created_at).toLocaleTimeString([], { hour:'2-digit', minute:'2-digit' })}
                  </div>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {imagePreview && (
            <div style={{ padding:'8px 12px', borderTop:'1px solid rgba(0,229,255,0.08)', display:'flex', alignItems:'center', gap:'8px' }}>
              <img src={imagePreview} alt="preview" style={{ width:'48px', height:'48px', objectFit:'cover', borderRadius:'2px' }} />
              <div style={{ fontSize:'10px', color:'#8A8E99', flex:1 }}>Image ready to send</div>
              <button onClick={() => { setImageFile(null); setImagePreview('') }} style={{ background:'none', border:'none', color:'#FF4444', cursor:'pointer', fontSize:'16px' }}>×</button>
            </div>
          )}

          <div className="chat-input-area">
            <textarea
              className="chat-input"
              rows={2}
              placeholder="Type a message..."
              value={message}
              onChange={e => setMessage(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend() } }}
            />
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginTop:'8px' }}>
              <button
                onClick={() => fileInputRef.current?.click()}
                style={{ background:'none', border:'1px solid rgba(0,229,255,0.2)', color:'#8A8E99', padding:'6px 10px', cursor:'pointer', fontSize:'11px', display:'flex', alignItems:'center', gap:'5px', fontFamily:'Inter,sans-serif' }}
              >
                <span>📎</span>
                <span style={{ fontSize:'10px' }}>Attach</span>
              </button>
              <input ref={fileInputRef} type="file" accept="image/*" style={{ display:'none' }} onChange={handleFileChange} />
              <button onClick={handleSend} disabled={sending || (!message.trim() && !imagePreview)}
                style={{ background:'#00E5FF', border:'none', color:'#0A0A0F', padding:'8px 20px', fontSize:'10px', fontWeight:'700', letterSpacing:'2px', textTransform:'uppercase', cursor:'pointer', fontFamily:'Inter,sans-serif', clipPath:'polygon(6px 0%,100% 0%,calc(100% - 6px) 100%,0% 100%)', opacity: sending || (!message.trim() && !imagePreview) ? 0.6 : 1 }}>
                {sending ? '...' : 'Send'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}