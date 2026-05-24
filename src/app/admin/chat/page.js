'use client'
import { useState, useEffect, useRef } from 'react'

export default function AdminChatPage() {
  const [sessions, setSessions] = useState([])
  const [selectedSession, setSelectedSession] = useState(null)
  const [messages, setMessages] = useState([])
  const [reply, setReply] = useState('')
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const messagesEndRef = useRef(null)
  const pollRef = useRef(null)

  useEffect(() => {
    fetchSessions()
    const interval = setInterval(fetchSessions, 5000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    if (selectedSession) {
      fetchMessages(selectedSession.id)
      if (pollRef.current) clearInterval(pollRef.current)
      pollRef.current = setInterval(() => fetchMessages(selectedSession.id), 3000)
    }
    return () => { if (pollRef.current) clearInterval(pollRef.current) }
  }, [selectedSession?.id])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  async function fetchSessions() {
    try {
      const res = await fetch('/api/admin/chat', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('as_token')}` }
      })
      if (res.ok) {
        const data = await res.json()
        setSessions(data.sessions || [])
      }
    } catch {}
    finally { setLoading(false) }
  }

  async function fetchMessages(sessionId) {
    try {
      const res = await fetch('/api/admin/chat/messages?session_id=' + sessionId, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('as_token')}` }
      })
      if (res.ok) {
        const data = await res.json()
        setMessages(data.messages || [])
      }
    } catch {}
  }

  async function handleReply() {
    if (!reply.trim() || !selectedSession) return
    setSending(true)
    try {
      await fetch('/api/admin/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('as_token')}`
        },
        body: JSON.stringify({
          session_id: selectedSession.id,
          message: reply,
          user_id: selectedSession.user_id
        })
      })
      setReply('')
      fetchMessages(selectedSession.id)
    } catch {}
    finally { setSending(false) }
  }

  if (loading) return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', minHeight:'400px' }}>
      <div style={{ width:'36px', height:'36px', border:'2px solid rgba(0,229,255,0.2)', borderTop:'2px solid #00E5FF', borderRadius:'50%', animation:'spin 1s linear infinite' }}></div>
      <style>{`@keyframes spin{to{transform:rotate(360deg);}}`}</style>
    </div>
  )

  return (
    <div style={{ maxWidth:'1200px' }}>
      <div style={{ marginBottom:'28px' }}>
        <h1 style={{ fontFamily:"'Space Grotesk',sans-serif", fontSize:'28px', fontWeight:'700', color:'#E8E4DC' }}>Live Chat</h1>
        <div style={{ fontSize:'12px', color:'#8A8E99', marginTop:'4px' }}>{sessions.length} active sessions</div>
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'280px 1fr', gap:'16px', height:'600px' }}>
        {/* Sessions */}
        <div style={{ background:'#0F0F1A', border:'1px solid rgba(0,229,255,0.08)', overflowY:'auto' }}>
          <div style={{ padding:'16px', borderBottom:'1px solid rgba(0,229,255,0.08)', fontSize:'9px', fontWeight:'700', letterSpacing:'2px', textTransform:'uppercase', color:'#00E5FF' }}>Sessions</div>
          {sessions.length === 0 ? (
            <div style={{ padding:'24px', textAlign:'center', fontSize:'12px', color:'#8A8E99' }}>No active chats</div>
          ) : sessions.map((s, i) => (
            <div key={i} onClick={() => setSelectedSession(s)}
              style={{ padding:'14px 16px', borderBottom:'1px solid rgba(0,229,255,0.04)', cursor:'pointer', background: selectedSession?.id === s.id ? 'rgba(0,229,255,0.06)' : 'none', borderLeft: selectedSession?.id === s.id ? '2px solid #00E5FF' : '2px solid transparent' }}>
              <div style={{ fontSize:'12px', fontWeight:'500', color:'#E8E4DC', marginBottom:'2px' }}>{s.users?.full_name}</div>
              <div style={{ fontSize:'10px', color:'#8A8E99' }}>{s.users?.email}</div>
              <div style={{ fontSize:'9px', color:'#8A8E99', marginTop:'4px' }}>{new Date(s.created_at).toLocaleDateString()}</div>
            </div>
          ))}
        </div>

        {/* Chat window */}
        <div style={{ background:'#0F0F1A', border:'1px solid rgba(0,229,255,0.08)', display:'flex', flexDirection:'column' }}>
          {!selectedSession ? (
            <div style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center', fontSize:'13px', color:'#8A8E99' }}>Select a chat session</div>
          ) : (
            <>
              <div style={{ padding:'16px', borderBottom:'1px solid rgba(0,229,255,0.08)' }}>
                <div style={{ fontSize:'13px', fontWeight:'600', color:'#E8E4DC' }}>{selectedSession.users?.full_name}</div>
                <div style={{ fontSize:'11px', color:'#8A8E99' }}>{selectedSession.users?.email}</div>
              </div>
              <div style={{ flex:1, overflowY:'auto', padding:'16px', display:'flex', flexDirection:'column', gap:'10px' }}>
                {messages.length === 0 && (
                  <div style={{ textAlign:'center', fontSize:'12px', color:'#8A8E99', padding:'20px' }}>No messages yet</div>
                )}
                {messages.map((msg, i) => (
                  <div key={i} style={{ display:'flex', justifyContent: msg.is_admin ? 'flex-end' : 'flex-start' }}>
                    <div style={{ maxWidth:'70%' }}>
                      <div style={{ background: msg.is_admin ? 'rgba(0,229,255,0.15)' : '#111320', border:`1px solid ${msg.is_admin ? 'rgba(0,229,255,0.3)' : 'rgba(0,229,255,0.08)'}`, padding:'10px 14px' }}>
                        {msg.image_url && <img src={msg.image_url} alt="attachment" style={{ maxWidth:'200px', marginBottom:'8px', display:'block' }} />}
                        <div style={{ fontSize:'12px', color:'#E8E4DC', lineHeight:'1.6' }}>{msg.message}</div>
                      </div>
                      <div style={{ fontSize:'9px', color:'#8A8E99', marginTop:'4px', textAlign: msg.is_admin ? 'right' : 'left' }}>
                        {msg.is_admin ? 'You' : selectedSession.users?.full_name} · {new Date(msg.created_at).toLocaleTimeString()}
                      </div>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
             </div>
              <div style={{ padding:'16px', borderTop:'1px solid rgba(0,229,255,0.08)', display:'flex', flexDirection:'column', gap:'8px' }}>
                <div style={{ display:'flex', gap:'12px' }}>
                  <input
                    style={{ flex:1, background:'#111320', border:'1px solid rgba(0,229,255,0.15)', padding:'12px 16px', color:'#E8E4DC', fontFamily:'Inter,sans-serif', fontSize:'13px', outline:'none' }}
                    placeholder="Type a reply..."
                    value={reply}
                    onChange={e => setReply(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleReply()}
                  />
                  <button onClick={handleReply} disabled={sending || !reply.trim()}
                    style={{ background:'#00E5FF', border:'none', color:'#0A0A0F', padding:'12px 24px', fontSize:'10px', fontWeight:'700', letterSpacing:'2px', textTransform:'uppercase', cursor:'pointer', fontFamily:'Inter,sans-serif', opacity: sending || !reply.trim() ? 0.6 : 1 }}>
                    {sending ? '...' : 'Send'}
                  </button>
                </div>
                <button
                  onClick={async () => {
                    await fetch('/api/admin/chat', {
                      method: 'PUT',
                      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('as_token')}` },
                      body: JSON.stringify({ session_id: selectedSession.id, status: 'closed' })
                    })
                    setSelectedSession(null)
                    setMessages([])
                    fetchSessions()
                  }}
                  style={{ background:'none', border:'1px solid rgba(255,68,68,0.3)', color:'#FF4444', padding:'8px', fontSize:'10px', fontWeight:'600', letterSpacing:'2px', textTransform:'uppercase', cursor:'pointer', fontFamily:'Inter,sans-serif' }}
                >
                  Close Chat
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}