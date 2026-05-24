'use client'
import { useState, useEffect } from 'react'

export default function AdminSendEmailPage() {
  const [users, setUsers] = useState([])
  const [form, setForm] = useState({ user_id: '', subject: '', message: '', from_alias: 'support' })
  const [sending, setSending] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => { fetchUsers() }, [])

  async function fetchUsers() {
    try {
      const res = await fetch('/api/admin/users', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('as_token')}` }
      })
      if (res.ok) {
        const data = await res.json()
        setUsers(data.users || [])
      }
    } catch {}
  }

  async function handleSend() {
    if (!form.user_id || !form.subject || !form.message) return setError('All fields are required')
    setSending(true)
    setError('')
    setSuccess(false)
    try {
      const res = await fetch('/api/admin/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('as_token')}` },
        body: JSON.stringify(form)
      })
      const data = await res.json()
      if (!res.ok) return setError(data.error)
      setSuccess(true)
      setForm({ user_id: '', subject: '', message: '', from_alias: 'support' })
    } catch { setError('Something went wrong') }
    finally { setSending(false) }
  }

  const selectStyle = { width:'100%', background:'#111320', border:'1px solid rgba(0,229,255,0.15)', padding:'14px 16px', color:'#E8E4DC', fontFamily:'Inter,sans-serif', fontSize:'13px', outline:'none' }

  return (
    <div style={{ maxWidth:'700px' }}>
      <div style={{ marginBottom:'28px' }}>
        <h1 style={{ fontFamily:"'Space Grotesk',sans-serif", fontSize:'28px', fontWeight:'700', color:'#E8E4DC' }}>Send Email</h1>
        <div style={{ fontSize:'12px', color:'#8A8E99', marginTop:'4px' }}>Send a direct email to any user</div>
      </div>

      {error && <div style={{ background:'rgba(255,68,68,0.1)', border:'1px solid rgba(255,68,68,0.3)', padding:'12px 16px', marginBottom:'20px', fontSize:'12px', color:'#FF4444' }}>{error}</div>}
      {success && <div style={{ background:'rgba(0,255,136,0.1)', border:'1px solid rgba(0,255,136,0.3)', padding:'12px 16px', marginBottom:'20px', fontSize:'12px', color:'#00FF88' }}>Email sent successfully!</div>}

      <div style={{ background:'#0F0F1A', border:'1px solid rgba(0,229,255,0.08)', padding:'32px', position:'relative' }}>
        <div style={{ position:'absolute', top:0, left:0, width:'100%', height:'2px', background:'linear-gradient(90deg,#00E5FF,transparent)' }}></div>

        <div style={{ marginBottom:'16px' }}>
          <div style={{ fontSize:'9px', fontWeight:'600', letterSpacing:'2px', textTransform:'uppercase', color:'#8A8E99', marginBottom:'8px' }}>From</div>
          <select style={selectStyle} value={form.from_alias} onChange={e => setForm({...form, from_alias: e.target.value})}>
            <option value="support">support@altsignals.finance</option>
            <option value="noreply">noreply@altsignals.finance</option>
            <option value="verification">verification@altsignals.finance</option>
            <option value="invest">invest@altsignals.finance</option>
            <option value="compliance">compliance@altsignals.finance</option>
          </select>
        </div>

        <div style={{ marginBottom:'16px' }}>
          <div style={{ fontSize:'9px', fontWeight:'600', letterSpacing:'2px', textTransform:'uppercase', color:'#8A8E99', marginBottom:'8px' }}>Recipient</div>
          <select style={selectStyle} value={form.user_id} onChange={e => setForm({...form, user_id: e.target.value})}>
            <option value="">Select a user...</option>
            {users.map(u => (
              <option key={u.id} value={u.id}>{u.full_name} — {u.email}</option>
            ))}
          </select>
        </div>

        <div style={{ marginBottom:'16px' }}>
          <div style={{ fontSize:'9px', fontWeight:'600', letterSpacing:'2px', textTransform:'uppercase', color:'#8A8E99', marginBottom:'8px' }}>Subject</div>
          <input style={{...selectStyle}} placeholder="Email subject..." value={form.subject} onChange={e => setForm({...form, subject: e.target.value})} />
        </div>

        <div style={{ marginBottom:'24px' }}>
          <div style={{ fontSize:'9px', fontWeight:'600', letterSpacing:'2px', textTransform:'uppercase', color:'#8A8E99', marginBottom:'8px' }}>Message</div>
          <textarea style={{...selectStyle, minHeight:'160px', resize:'vertical'}} placeholder="Email message..." value={form.message} onChange={e => setForm({...form, message: e.target.value})} />
        </div>

        <button onClick={handleSend} disabled={sending}
          style={{ background:'#00E5FF', border:'none', color:'#0A0A0F', padding:'14px 32px', fontSize:'11px', fontWeight:'700', letterSpacing:'2px', textTransform:'uppercase', cursor:'pointer', fontFamily:'Inter,sans-serif', clipPath:'polygon(6px 0%,100% 0%,calc(100% - 6px) 100%,0% 100%)', opacity: sending ? 0.6 : 1 }}>
          {sending ? 'Sending...' : 'Send Email →'}
        </button>
      </div>
    </div>
  )
}