'use client'
import { useState, useEffect } from 'react'

export default function AdminInboxPage() {
  const [emails, setEmails] = useState([])
  const [selected, setSelected] = useState(null)
  const [loading, setLoading] = useState(true)
  const [reply, setReply] = useState('')
  const [sending, setSending] = useState(false)
  const [success, setSuccess] = useState('')
  const [showEmail, setShowEmail] = useState(false)

  useEffect(() => {
    fetchEmails()
    const interval = setInterval(fetchEmails, 30000)
    return () => clearInterval(interval)
  }, [])

  async function fetchEmails() {
    try {
      const res = await fetch('/api/admin/inbox', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('as_token')}` }
      })
      if (res.ok) {
        const data = await res.json()
        setEmails(data.emails || [])
      }
    } catch {}
    finally { setLoading(false) }
  }

  async function handleSelect(email) {
    setSelected(email)
    setReply('')
    setSuccess('')
    setShowEmail(true)
    if (!email.is_read) {
      await fetch('/api/admin/inbox', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('as_token')}` },
        body: JSON.stringify({ id: email.id, is_read: true })
      })
      setEmails(prev => prev.map(e => e.id === email.id ? { ...e, is_read: true } : e))
    }
  }

  async function handleReply() {
    if (!reply.trim() || !selected) return
    setSending(true)
    try {
      const res = await fetch('/api/admin/inbox/reply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('as_token')}` },
        body: JSON.stringify({ to: selected.from_email, subject: `Re: ${selected.subject}`, message: reply, from_address: selected.to_email })
      })
      if (res.ok) { setSuccess('Reply sent!'); setReply('') }
    } catch {}
    finally { setSending(false) }
  }

  const unread = emails.filter(e => !e.is_read).length

  if (loading) return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', minHeight:'400px' }}>
      <div style={{ width:'36px', height:'36px', border:'2px solid rgba(0,229,255,0.2)', borderTop:'2px solid #00E5FF', borderRadius:'50%', animation:'spin 1s linear infinite' }}></div>
      <style>{`@keyframes spin{to{transform:rotate(360deg);}}`}</style>
    </div>
  )

  return (
    <div style={{ maxWidth:'1200px' }}>
      <style>{`
        @keyframes spin{to{transform:rotate(360deg);}}
        .inbox-layout { display:grid; grid-template-columns:300px 1fr; gap:16px; height:640px; }
        .inbox-list { display:flex !important; }
        .inbox-content { display:flex !important; }
        .inbox-back { display:none !important; }
        @media(max-width:768px){
          .inbox-layout { grid-template-columns:1fr !important; height:auto !important; }
          .inbox-list { display:${showEmail ? 'none' : 'flex'} !important; height:400px; }
          .inbox-content { display:${showEmail ? 'flex' : 'none'} !important; height:600px; }
          .inbox-back { display:flex !important; }
        }
      `}</style>

      <div style={{ marginBottom:'20px', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
        <div>
          <h1 style={{ fontFamily:"'Space Grotesk',sans-serif", fontSize:'28px', fontWeight:'700', color:'#E8E4DC' }}>Inbox</h1>
          <div style={{ fontSize:'12px', color:'#8A8E99', marginTop:'4px' }}>{unread} unread · {emails.length} total</div>
        </div>
        {showEmail && (
          <button className="inbox-back" onClick={() => { setShowEmail(false); setSelected(null) }}
            style={{ background:'none', border:'1px solid rgba(0,229,255,0.2)', color:'#8A8E99', padding:'8px 16px', fontSize:'10px', fontWeight:'600', cursor:'pointer', fontFamily:'Inter,sans-serif' }}>
            ← Back
          </button>
        )}
      </div>

      <div className="inbox-layout">
        {/* Email list */}
        <div className="inbox-list" style={{ background:'#0F0F1A', border:'1px solid rgba(0,229,255,0.08)', flexDirection:'column', overflowY:'auto' }}>
          {emails.length === 0 ? (
            <div style={{ padding:'40px', textAlign:'center', fontSize:'13px', color:'#8A8E99' }}>No emails yet</div>
          ) : emails.map((email, i) => (
            <div key={i} onClick={() => handleSelect(email)}
              style={{ padding:'14px 16px', borderBottom:'1px solid rgba(0,229,255,0.04)', cursor:'pointer', background: selected?.id === email.id ? 'rgba(0,229,255,0.06)' : 'none', borderLeft: selected?.id === email.id ? '2px solid #00E5FF' : '2px solid transparent', opacity: email.is_read ? 0.7 : 1 }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'4px' }}>
                <div style={{ fontSize:'12px', fontWeight: email.is_read ? '400' : '600', color:'#E8E4DC', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', maxWidth:'200px' }}>
                  {email.from_email}
                </div>
                {!email.is_read && <div style={{ width:'8px', height:'8px', background:'#00E5FF', borderRadius:'50%', flexShrink:0 }}></div>}
              </div>
              <div style={{ fontSize:'11px', color:'#8A8E99', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', marginBottom:'2px' }}>{email.subject}</div>
              <div style={{ fontSize:'9px', color:'#8A8E99' }}>{new Date(email.received_at).toLocaleString()}</div>
            </div>
          ))}
        </div>

        {/* Email content */}
        <div className="inbox-content" style={{ background:'#0F0F1A', border:'1px solid rgba(0,229,255,0.08)', flexDirection:'column' }}>
          {!selected ? (
            <div style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center', flexDirection:'column', gap:'12px' }}>
              <div style={{ fontSize:'32px', opacity:'0.3' }}>📧</div>
              <div style={{ fontSize:'13px', color:'#8A8E99' }}>Select an email to read</div>
            </div>
          ) : (
            <>
              <div style={{ padding:'20px 24px', borderBottom:'1px solid rgba(0,229,255,0.08)', flexShrink:0 }}>
                <div style={{ fontFamily:"'Space Grotesk',sans-serif", fontSize:'16px', fontWeight:'700', color:'#E8E4DC', marginBottom:'8px' }}>{selected.subject}</div>
                <div style={{ fontSize:'12px', color:'#8A8E99', marginBottom:'2px' }}>From: <span style={{ color:'#00E5FF' }}>{selected.from_email}</span></div>
                <div style={{ fontSize:'12px', color:'#8A8E99', marginBottom:'2px' }}>To: {selected.to_email}</div>
                <div style={{ fontSize:'11px', color:'#8A8E99' }}>{new Date(selected.received_at).toLocaleString()}</div>
              </div>

              <div style={{ flex:1, overflowY:'auto', padding:'20px 24px' }}>
                {selected.body_html ? (
                  <div dangerouslySetInnerHTML={{ __html: selected.body_html }} style={{ fontSize:'13px', color:'#E8E4DC', lineHeight:'1.8' }} />
                ) : (
                  <div style={{ fontSize:'13px', color:'#E8E4DC', lineHeight:'1.8', whiteSpace:'pre-wrap' }}>{selected.body_text || '(no content)'}</div>
                )}

                {selected.attachments && selected.attachments.length > 0 && (
                  <div style={{ marginTop:'20px', paddingTop:'16px', borderTop:'1px solid rgba(0,229,255,0.08)' }}>
                    <div style={{ fontSize:'9px', fontWeight:'700', letterSpacing:'2px', textTransform:'uppercase', color:'#8A8E99', marginBottom:'12px' }}>
                      📎 Attachments ({selected.attachments.length})
                    </div>
                    <div style={{ display:'flex', flexWrap:'wrap', gap:'8px' }}>
                      {selected.attachments.map((att, i) => (
                        <button key={i}
                          onClick={async () => {
                            const res = await fetch(`/api/admin/inbox/attachment?email_id=${selected.email_id}&attachment_id=${att.id}`, {
                              headers: { 'Authorization': `Bearer ${localStorage.getItem('as_token')}` }
                            })
                            const data = await res.json()
                            if (data.download_url) window.open(data.download_url, '_blank')
                          }}
                          style={{ display:'flex', alignItems:'center', gap:'6px', background:'#111320', border:'1px solid rgba(0,229,255,0.15)', padding:'8px 12px', cursor:'pointer', fontFamily:'Inter,sans-serif' }}>
                          <span>{att.content_type?.startsWith('image/') ? '🖼️' : '📄'}</span>
                          <span style={{ fontSize:'11px', color:'#00E5FF' }}>{att.filename}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div style={{ padding:'16px 24px', borderTop:'1px solid rgba(0,229,255,0.08)', flexShrink:0 }}>
                {success && <div style={{ fontSize:'11px', color:'#00FF88', marginBottom:'8px' }}>{success}</div>}
                <textarea
                  style={{ width:'100%', background:'#111320', border:'1px solid rgba(0,229,255,0.15)', padding:'12px', color:'#E8E4DC', fontFamily:'Inter,sans-serif', fontSize:'13px', outline:'none', minHeight:'80px', resize:'vertical', marginBottom:'10px' }}
                  placeholder={`Reply to ${selected.from_email}...`}
                  value={reply}
                  onChange={e => setReply(e.target.value)}
                />
                <button onClick={handleReply} disabled={sending || !reply.trim()}
                  style={{ background:'#00E5FF', border:'none', color:'#0A0A0F', padding:'12px 24px', fontSize:'10px', fontWeight:'700', letterSpacing:'2px', textTransform:'uppercase', cursor:'pointer', fontFamily:'Inter,sans-serif', opacity: sending || !reply.trim() ? 0.6 : 1 }}>
                  {sending ? 'Sending...' : 'Send Reply →'}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
