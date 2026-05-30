'use client'
import { useState, useEffect } from 'react'

export default function AdminVIPPage() {
  const [subscriptions, setSubscriptions] = useState([])
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(null)
  const [showInvite, setShowInvite] = useState(null)
  const [inviteLink, setInviteLink] = useState('')

  useEffect(() => { fetchData() }, [])

  async function fetchData() {
    try {
      const res = await fetch('/api/admin/vip', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('as_token')}` }
      })
      if (res.ok) {
        const data = await res.json()
        setSubscriptions(data.subscriptions || [])
      }
    } catch {}
    finally { setLoading(false) }
  }

  async function handleUpdate(subscription_id, status, telegram_invite_link) {
    setUpdating(subscription_id)
    try {
      await fetch('/api/admin/vip', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('as_token')}` },
        body: JSON.stringify({ subscription_id, status, telegram_invite_link })
      })
      setShowInvite(null)
      setInviteLink('')
      fetchData()
    } catch {}
    finally { setUpdating(null) }
  }

  if (loading) return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', minHeight:'400px' }}>
      <div style={{ width:'36px', height:'36px', border:'2px solid rgba(0,229,255,0.2)', borderTop:'2px solid #00E5FF', borderRadius:'50%', animation:'spin 1s linear infinite' }}></div>
      <style>{`@keyframes spin{to{transform:rotate(360deg);}}`}</style>
    </div>
  )

  return (
    <div style={{ maxWidth:'1200px' }}>
      <style>{`@keyframes spin{to{transform:rotate(360deg);}}`}</style>

      <div style={{ marginBottom:'28px' }}>
        <h1 style={{ fontFamily:"'Space Grotesk',sans-serif", fontSize:'28px', fontWeight:'700', color:'#E8E4DC' }}>VIP Subscriptions</h1>
        <div style={{ fontSize:'12px', color:'#8A8E99', marginTop:'4px' }}>{subscriptions.filter(s => s.status === 'active').length} active</div>
      </div>

      <div style={{ background:'#0F0F1A', border:'1px solid rgba(0,229,255,0.08)' }}>
        {subscriptions.length === 0 ? (
          <div style={{ padding:'40px', textAlign:'center', fontSize:'13px', color:'#8A8E99' }}>No VIP subscriptions yet</div>
        ) : subscriptions.map((sub, i) => (
          <div key={i} style={{ padding:'16px 20px', borderBottom:'1px solid rgba(0,229,255,0.04)' }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:'8px', gap:'12px' }}>
              <div style={{ minWidth:0 }}>
                <div style={{ fontSize:'13px', fontWeight:'600', color:'#E8E4DC', marginBottom:'2px' }}>{sub.users?.full_name}</div>
                <div style={{ fontSize:'10px', color:'#8A8E99', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{sub.users?.email}</div>
              </div>
              <div style={{ fontSize:'9px', fontWeight:'600', color: sub.status === 'active' ? '#00FF88' : sub.status === 'expired' ? '#FF4444' : '#FFD700', letterSpacing:'1px', flexShrink:0 }}>
                {sub.status?.toUpperCase()}
              </div>
            </div>

            <div style={{ display:'flex', gap:'16px', flexWrap:'wrap', marginBottom:'12px' }}>
              <div>
                <div style={{ fontSize:'9px', color:'#8A8E99', marginBottom:'2px' }}>Plan</div>
                <div style={{ fontSize:'11px', color:'#FFD700', fontWeight:'600' }}>{sub.vip_plans?.name}</div>
              </div>
              <div>
                <div style={{ fontSize:'9px', color:'#8A8E99', marginBottom:'2px' }}>Price</div>
                <div style={{ fontSize:'12px', color:'#E8E4DC', fontWeight:'600' }}>${sub.vip_plans?.price}</div>
              </div>
              {sub.ends_at && (
                <div>
                  <div style={{ fontSize:'9px', color:'#8A8E99', marginBottom:'2px' }}>Expires</div>
                  <div style={{ fontSize:'11px', color:'#8A8E99' }}>{new Date(sub.ends_at).toLocaleDateString()}</div>
                </div>
              )}
            </div>

            <div style={{ display:'flex', gap:'8px', flexWrap:'wrap' }}>
              {sub.status === 'pending' && (
                <button onClick={() => { setShowInvite(sub.id); setInviteLink('') }}
                  style={{ background:'rgba(0,229,255,0.1)', border:'1px solid rgba(0,229,255,0.3)', color:'#00E5FF', padding:'8px 16px', fontSize:'10px', fontWeight:'600', cursor:'pointer', fontFamily:'Inter,sans-serif', letterSpacing:'1px', textTransform:'uppercase' }}>
                  Approve
                </button>
              )}
              {sub.telegram_invite_link && (
                <a href={sub.telegram_invite_link} target="_blank" rel="noopener noreferrer"
                  style={{ background:'rgba(0,229,255,0.08)', border:'1px solid rgba(0,229,255,0.2)', color:'#00E5FF', padding:'8px 16px', fontSize:'10px', fontWeight:'600', textDecoration:'none', letterSpacing:'1px', textTransform:'uppercase' }}>
                  View Link
                </a>
              )}
            </div>
          </div>
        ))}
      </div>

      {showInvite && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.85)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:1000, padding:'20px' }}>
          <div style={{ background:'#0F0F1A', border:'1px solid rgba(0,229,255,0.2)', padding:'32px', maxWidth:'480px', width:'100%', position:'relative' }}>
            <div style={{ position:'absolute', top:0, left:0, width:'100%', height:'2px', background:'linear-gradient(90deg,#00E5FF,transparent)' }}></div>
            <h2 style={{ fontFamily:"'Space Grotesk',sans-serif", fontSize:'20px', fontWeight:'700', color:'#E8E4DC', marginBottom:'8px' }}>Approve VIP Subscription</h2>
            <p style={{ fontSize:'12px', color:'#8A8E99', marginBottom:'24px', lineHeight:'1.6' }}>Enter a single-use Telegram invite link for this member.</p>
            <div style={{ marginBottom:'24px' }}>
              <div style={{ fontSize:'9px', fontWeight:'600', letterSpacing:'2px', textTransform:'uppercase', color:'#8A8E99', marginBottom:'8px' }}>Telegram Invite Link</div>
              <input style={{ width:'100%', background:'#111320', border:'1px solid rgba(0,229,255,0.15)', padding:'12px 16px', color:'#E8E4DC', fontFamily:'Inter,sans-serif', fontSize:'13px', outline:'none' }}
                placeholder="https://t.me/+..." value={inviteLink} onChange={e => setInviteLink(e.target.value)} />
            </div>
            <div style={{ display:'flex', gap:'12px' }}>
              <button onClick={() => { setShowInvite(null); setInviteLink('') }}
                style={{ flex:1, background:'none', border:'1px solid rgba(0,229,255,0.2)', color:'#8A8E99', padding:'12px', fontSize:'10px', fontWeight:'600', letterSpacing:'2px', textTransform:'uppercase', cursor:'pointer', fontFamily:'Inter,sans-serif' }}>
                Cancel
              </button>
              <button onClick={() => handleUpdate(showInvite, 'active', inviteLink)} disabled={!inviteLink || !!updating}
                style={{ flex:2, background:'#00E5FF', border:'none', color:'#0A0A0F', padding:'12px', fontSize:'10px', fontWeight:'700', letterSpacing:'2px', textTransform:'uppercase', cursor:'pointer', fontFamily:'Inter,sans-serif', opacity: !inviteLink || updating ? 0.6 : 1 }}>
                {updating ? 'Approving...' : 'Approve & Send Link →'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
