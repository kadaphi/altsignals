'use client'
import { useState, useEffect, useRef } from 'react'
import { useAuth } from '@/context/AuthContext'
import { usePathname } from 'next/navigation'

export default function ChatWidget() {
  const { user } = useAuth()
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState([])
  const [message, setMessage] = useState('')
  const [sending, setSending] = useState(false)
  const [imageUrl, setImageUrl] = useState('')
  const [showImageInput, setShowImageInput] = useState(false)
  const messagesEndRef = useRef(null)
  const pollRef = useRef(null)

  useEffect(() => {
    if (user && !pathname.startsWith('/admin')) {
      fetchChat()
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

  async function handleSend() {
    if (!message.trim() && !imageUrl) return
    setSending(true)
    try {
      await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('as_token')}`
        },
        body: JSON.stringify({ message: message.trim(), image_url: imageUrl || null })
      })
      setMessage('')
      setImageUrl('')
      setShowImageInput(false)
      fetchChat()
    } catch {}
    finally { setSending(false) }
  }

  if (pathname.startsWith('/admin')) return null
  if (!user) return null

  const unreadCount = messages.filter(m => m.is_admin && !m.is_read).length

  return (
    <>
      <button
        onClick={() => setOpen(!open)}
        style={{ position:'fixed', bottom:'24px', right:'24px', width:'52px', height:'52px', background:'#00E5FF', border:'none', borderRadius:'50%', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'22px', zIndex:999, boxShadow:'0 4px 20px rgba(0,229,255,0.4)', transition:'transform 0.2s' }}
        onMouseEnter={e => e.currentTarget.style.transform='scale(1.1)'}
        onMouseLeave={e => e.currentTarget.style.transform='scale(1)'}
      >
        {open ? <span style={{ color:'#0A0A0F', fontSize:'20px', fontWeight:'700' }}>×</span> : '💬'}
        {!open && unreadCount > 0 && (
          <div style={{ position:'absolute', top:'-4px', right:'-4px', width:'18px', height:'18px', background:'#FF4444', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'9px', fontWeight:'700', color:'#fff' }}>{unreadCount}</div>
        )}
      </button>

      {open && (
        <div style={{ position:'fixed', bottom:'88px', right:'24px', width:'320px', background:'#0F0F1A', border:'1px solid rgba(0,229,255,0.2)', zIndex:998, display:'flex', flexDirection:'column', maxHeight:'460px', boxShadow:'0 8px 32px rgba(0,0,0,0.4)' }}>
          <div style={{ padding:'16px', borderBottom:'1px solid rgba(0,229,255,0.08)', display:'flex', alignItems:'center', gap:'10px' }}>
            <div style={{ width:'8px', height:'8px', background:'#00FF88', borderRadius:'50%' }}></div>
            <div style={{ fontSize:'12px', fontWeight:'600', color:'#E8E4DC', flex:1 }}>AltSignals Support</div>
            <button onClick={() => setOpen(false)} style={{ background:'none', border:'none', color:'#8A8E99', cursor:'pointer', fontSize:'18px', lineHeight:1 }}>×</button>
          </div>

          <div style={{ flex:1, overflowY:'auto', padding:'16px', display:'flex', flexDirection:'column', gap:'10px', minHeight:'200px' }}>
            {messages.length === 0 && (
              <div style={{ textAlign:'center', fontSize:'12px', color:'#8A8E99', padding:'20px' }}>
                Hi {user?.full_name?.split(' ')[0]}! How can we help you today?
              </div>
            )}
            {messages.map((msg, i) => (
              <div key={i} style={{ display:'flex', justifyContent: msg.is_admin ? 'flex-start' : 'flex-end' }}>
                <div style={{ maxWidth:'80%', background: msg.is_admin ? '#111320' : 'rgba(0,229,255,0.15)', border:`1px solid ${msg.is_admin ? 'rgba(0,229,255,0.08)' : 'rgba(0,229,255,0.3)'}`, padding:'8px 12px' }}>
                  {msg.image_url && <img src={msg.image_url} alt="attachment" style={{ maxWidth:'100%', marginBottom:'6px', display:'block' }} />}
                  {msg.message && <div style={{ fontSize:'12px', color:'#E8E4DC', lineHeight:'1.5' }}>{msg.message}</div>}
                  <div style={{ fontSize:'9px', color:'#8A8E99', marginTop:'3px' }}>{new Date(msg.created_at).toLocaleTimeString()}</div>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {showImageInput && (
            <div style={{ padding:'8px 12px', borderTop:'1px solid rgba(0,229,255,0.08)' }}>
              <input
                style={{ width:'100%', background:'#111320', border:'1px solid rgba(0,229,255,0.15)', padding:'8px 12px', color:'#E8E4DC', fontFamily:'Inter,sans-serif', fontSize:'11px', outline:'none' }}
                placeholder="Paste image URL..."
                value={imageUrl}
                onChange={e => setImageUrl(e.target.value)}
              />
            </div>
          )}

          <div style={{ padding:'12px', borderTop:'1px solid rgba(0,229,255,0.08)', display:'flex', gap:'8px', alignItems:'center' }}>
            <button
              onClick={() => setShowImageInput(!showImageInput)}
              title="Attach image URL"
              style={{ background:'none', border:'1px solid rgba(0,229,255,0.2)', color:'#00E5FF', width:'34px', height:'34px', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', fontSize:'14px', flexShrink:0 }}
            >
              🖼
            </button>
            <input
              style={{ flex:1, background:'#111320', border:'1px solid rgba(0,229,255,0.15)', padding:'10px 12px', color:'#E8E4DC', fontFamily:'Inter,sans-serif', fontSize:'12px', outline:'none' }}
              placeholder="Type a message..."
              value={message}
              onChange={e => setMessage(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSend()}
            />
            <button onClick={handleSend} disabled={sending || (!message.trim() && !imageUrl)}
              style={{ background:'#00E5FF', border:'none', color:'#0A0A0F', padding:'10px 14px', fontSize:'12px', fontWeight:'700', cursor:'pointer', fontFamily:'Inter,sans-serif', opacity: sending || (!message.trim() && !imageUrl) ? 0.6 : 1 }}>
              →
            </button>
          </div>
        </div>
      )}
    </>
  )
}