'use client'
import { useState, useEffect } from 'react'

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState(false)
  const [announcements, setAnnouncements] = useState([])
  const [newAnnouncement, setNewAnnouncement] = useState({ title: '', message: '' })

  useEffect(() => { fetchSettings(); fetchAnnouncements() }, [])

  async function fetchSettings() {
    try {
      const res = await fetch('/api/admin/settings', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('as_token')}` }
      })
      if (res.ok) {
        const data = await res.json()
        setSettings(data.settings || {})
      }
    } catch {}
    finally { setLoading(false) }
  }

  async function fetchAnnouncements() {
    try {
      const res = await fetch('/api/admin/announcement', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('as_token')}` }
      })
      if (res.ok) {
        const data = await res.json()
        setAnnouncements(data.announcements || [])
      }
    } catch {}
  }

  async function handleSave() {
    setSaving(true)
    setSuccess(false)
    try {
      await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('as_token')}` },
        body: JSON.stringify(settings)
      })
      setSuccess(true)
    } catch {}
    finally { setSaving(false) }
  }

  async function handleAddAnnouncement() {
    if (!newAnnouncement.title) return
    try {
      await fetch('/api/admin/announcement', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('as_token')}` },
        body: JSON.stringify(newAnnouncement)
      })
      setNewAnnouncement({ title: '', message: '' })
      fetchAnnouncements()
    } catch {}
  }

  async function handleDeleteAnnouncement(id) {
    try {
      await fetch('/api/admin/announcement', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('as_token')}` },
        body: JSON.stringify({ id })
      })
      fetchAnnouncements()
    } catch {}
  }

  const inputStyle = { width:'100%', background:'#111320', border:'1px solid rgba(0,229,255,0.15)', padding:'12px 16px', color:'#E8E4DC', fontFamily:'Inter,sans-serif', fontSize:'13px', outline:'none' }
  const labelStyle = { fontSize:'9px', fontWeight:'600', letterSpacing:'2px', textTransform:'uppercase', color:'#8A8E99', marginBottom:'8px', display:'block' }

  if (loading) return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', minHeight:'400px' }}>
      <div style={{ width:'36px', height:'36px', border:'2px solid rgba(0,229,255,0.2)', borderTop:'2px solid #00E5FF', borderRadius:'50%', animation:'spin 1s linear infinite' }}></div>
      <style>{`@keyframes spin{to{transform:rotate(360deg);}}`}</style>
    </div>
  )

  return (
    <div style={{ maxWidth:'800px' }}>
      <div style={{ marginBottom:'28px' }}>
        <h1 style={{ fontFamily:"'Space Grotesk',sans-serif", fontSize:'28px', fontWeight:'700', color:'#E8E4DC' }}>Settings</h1>
      </div>

      {success && <div style={{ background:'rgba(0,255,136,0.1)', border:'1px solid rgba(0,255,136,0.3)', padding:'12px 16px', marginBottom:'24px', fontSize:'12px', color:'#00FF88' }}>Settings saved successfully</div>}

      {/* Platform Settings */}
      <div style={{ background:'#0F0F1A', border:'1px solid rgba(0,229,255,0.08)', padding:'32px', position:'relative', marginBottom:'24px' }}>
        <div style={{ position:'absolute', top:0, left:0, width:'100%', height:'2px', background:'linear-gradient(90deg,#00E5FF,transparent)' }}></div>
        <div style={{ fontSize:'9px', fontWeight:'700', letterSpacing:'3px', textTransform:'uppercase', color:'#00E5FF', marginBottom:'24px' }}>Platform Settings</div>

        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'16px', marginBottom:'16px' }}>
          <div>
            <label style={labelStyle}>Min Deposit ($)</label>
            <input type="number" style={inputStyle} value={settings.min_deposit || ''} onChange={e => setSettings({...settings, min_deposit: Number(e.target.value)})} />
          </div>
          <div>
            <label style={labelStyle}>Min Withdrawal ($)</label>
            <input type="number" style={inputStyle} value={settings.min_withdrawal || ''} onChange={e => setSettings({...settings, min_withdrawal: Number(e.target.value)})} />
          </div>
        </div>

        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'16px', marginBottom:'16px' }}>
          <div>
            <label style={labelStyle}>Coaching Fee ($)</label>
            <input type="number" style={inputStyle} value={settings.coaching_fee || ''} onChange={e => setSettings({...settings, coaching_fee: Number(e.target.value)})} />
          </div>
          <div>
            <label style={labelStyle}>Coaching Link</label>
            <input style={inputStyle} placeholder="https://wa.me/..." value={settings.coaching_link || ''} onChange={e => setSettings({...settings, coaching_link: e.target.value})} />
          </div>
        </div>

        <div style={{ marginBottom:'24px' }}>
          <label style={labelStyle}>Coaching Description</label>
          <textarea style={{...inputStyle, minHeight:'80px', resize:'vertical'}} value={settings.coaching_description || ''} onChange={e => setSettings({...settings, coaching_description: e.target.value})} />
        </div>

        <div style={{ display:'flex', gap:'24px', marginBottom:'24px' }}>
          <label style={{ display:'flex', alignItems:'center', gap:'8px', cursor:'pointer' }}>
            <input type="checkbox" checked={settings.chat_enabled || false} onChange={e => setSettings({...settings, chat_enabled: e.target.checked})} />
            <span style={{ fontSize:'12px', color:'#8A8E99' }}>Chat Enabled</span>
          </label>
          <label style={{ display:'flex', alignItems:'center', gap:'8px', cursor:'pointer' }}>
            <input type="checkbox" checked={settings.maintenance_mode || false} onChange={e => setSettings({...settings, maintenance_mode: e.target.checked})} />
            <span style={{ fontSize:'12px', color:'#8A8E99' }}>Maintenance Mode</span>
          </label>
        </div>

        <button onClick={handleSave} disabled={saving}
          style={{ background:'#00E5FF', border:'none', color:'#0A0A0F', padding:'12px 32px', fontSize:'11px', fontWeight:'700', letterSpacing:'2px', textTransform:'uppercase', cursor:'pointer', fontFamily:'Inter,sans-serif', clipPath:'polygon(6px 0%,100% 0%,calc(100% - 6px) 100%,0% 100%)', opacity: saving ? 0.6 : 1 }}>
          {saving ? 'Saving...' : 'Save Settings →'}
        </button>
      </div>

      {/* KYC Fee Settings */}
      <div style={{ background:'#0F0F1A', border:'1px solid rgba(0,229,255,0.08)', padding:'32px', position:'relative', marginBottom:'24px' }}>
        <div style={{ position:'absolute', top:0, left:0, width:'100%', height:'2px', background:'linear-gradient(90deg,#FF4444,transparent)' }}></div>
        <div style={{ fontSize:'9px', fontWeight:'700', letterSpacing:'3px', textTransform:'uppercase', color:'#FF4444', marginBottom:'8px' }}>KYC Verification Fee</div>
        <div style={{ fontSize:'12px', color:'#8A8E99', marginBottom:'24px', lineHeight:'1.6' }}>
          If set, users will be required to pay this fee and upload a payment receipt before their KYC can be approved. Leave at 0 to disable the fee requirement.
        </div>

        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'16px', marginBottom:'16px' }}>
          <div>
            <label style={labelStyle}>KYC Fee ($)</label>
            <input type="number" style={inputStyle} placeholder="0" value={settings.kyc_fee || ''} onChange={e => setSettings({...settings, kyc_fee: Number(e.target.value)})} />
          </div>
          <div>
            <label style={labelStyle}>Payment Address</label>
            <input style={inputStyle} placeholder="Wallet address to pay fee to" value={settings.kyc_fee_address || ''} onChange={e => setSettings({...settings, kyc_fee_address: e.target.value})} />
          </div>
        </div>

        <div style={{ marginBottom:'24px' }}>
          <label style={labelStyle}>Fee Reason / Instructions</label>
          <textarea style={{...inputStyle, minHeight:'80px', resize:'vertical'}} placeholder="e.g. A one-time verification fee is required to process your KYC. Please send the fee to the address above and upload your receipt." value={settings.kyc_fee_reason || ''} onChange={e => setSettings({...settings, kyc_fee_reason: e.target.value})} />
        </div>

        <button onClick={handleSave} disabled={saving}
          style={{ background:'#00E5FF', border:'none', color:'#0A0A0F', padding:'12px 32px', fontSize:'11px', fontWeight:'700', letterSpacing:'2px', textTransform:'uppercase', cursor:'pointer', fontFamily:'Inter,sans-serif', clipPath:'polygon(6px 0%,100% 0%,calc(100% - 6px) 100%,0% 100%)', opacity: saving ? 0.6 : 1 }}>
          {saving ? 'Saving...' : 'Save KYC Settings →'}
        </button>
      </div>

      {/* Announcements */}
      <div style={{ background:'#0F0F1A', border:'1px solid rgba(0,229,255,0.08)', padding:'32px', position:'relative' }}>
        <div style={{ position:'absolute', top:0, left:0, width:'100%', height:'2px', background:'linear-gradient(90deg,#00E5FF,transparent)' }}></div>
        <div style={{ fontSize:'9px', fontWeight:'700', letterSpacing:'3px', textTransform:'uppercase', color:'#00E5FF', marginBottom:'24px' }}>Announcements</div>

        <div style={{ marginBottom:'16px' }}>
          <label style={labelStyle}>Title</label>
          <input style={{...inputStyle, marginBottom:'12px'}} placeholder="Announcement title" value={newAnnouncement.title} onChange={e => setNewAnnouncement({...newAnnouncement, title: e.target.value})} />
          <label style={labelStyle}>Message</label>
          <textarea style={{...inputStyle, minHeight:'80px', resize:'vertical'}} placeholder="Announcement message" value={newAnnouncement.message} onChange={e => setNewAnnouncement({...newAnnouncement, message: e.target.value})} />
        </div>
        <button onClick={handleAddAnnouncement}
          style={{ background:'#00E5FF', border:'none', color:'#0A0A0F', padding:'10px 24px', fontSize:'10px', fontWeight:'700', letterSpacing:'2px', textTransform:'uppercase', cursor:'pointer', fontFamily:'Inter,sans-serif', marginBottom:'24px', clipPath:'polygon(6px 0%,100% 0%,calc(100% - 6px) 100%,0% 100%)' }}>
          Post Announcement
        </button>

        {announcements.map((a, i) => (
          <div key={i} style={{ background:'#111320', border:'1px solid rgba(0,229,255,0.08)', padding:'16px', marginBottom:'8px', display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
            <div>
              <div style={{ fontSize:'12px', fontWeight:'600', color:'#E8E4DC', marginBottom:'4px' }}>{a.title}</div>
              <div style={{ fontSize:'11px', color:'#8A8E99' }}>{a.message}</div>
            </div>
            <button onClick={() => handleDeleteAnnouncement(a.id)} style={{ background:'none', border:'none', color:'#FF4444', cursor:'pointer', fontSize:'16px', flexShrink:0, marginLeft:'16px' }}>×</button>
          </div>
        ))}
      </div>
    </div>
  )
}