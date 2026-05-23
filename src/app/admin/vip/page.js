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
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('as_token')}`
        },
        body: JSON.stringify({ subscription_id, status, telegram_invite_link })
      })
      setShowInvite(null)
      setInviteLink('')
      fetchData()
    } catch {}
    finally { setUpdating(null) }
  }

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '400px' }}>
      <div style={{ width: '36px', height: '36px', border: '2px solid rgba(0,229,255,0.2)', borderTop: '2px solid #00E5FF', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
      <style>{`@keyframes spin{to{transform:rotate(360deg);}}`}</style>
    </div>
  )

  return (
    <div style={{ maxWidth: '1200px' }}>
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: '28px', fontWeight: '700', color: '#E8E4DC' }}>VIP Subscriptions</h1>
        <div style={{ fontSize: '12px', color: '#8A8E99', marginTop: '4px' }}>{subscriptions.filter(s => s.status === 'pending').length} pending approval</div>
      </div>

      <div style={{ background: '#0F0F1A', border: '1px solid rgba(0,229,255,0.08)' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr', gap: '16px', padding: '12px 20px', borderBottom: '1px solid rgba(0,229,255,0.08)', fontSize: '9px', fontWeight: '700', letterSpacing: '2px', textTransform: 'uppercase', color: '#8A8E99' }}>
          <div>User</div>
          <div>Plan</div>
          <div>Price</div>
          <div>Status</div>
          <div>Actions</div>
        </div>
        {subscriptions.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', fontSize: '13px', color: '#8A8E99' }}>No VIP subscriptions yet</div>
        ) : subscriptions.map((sub, i) => (
          <div key={i} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr', gap: '16px', padding: '14px 20px', borderBottom: '1px solid rgba(0,229,255,0.04)', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: '12px', fontWeight: '500', color: '#E8E4DC' }}>{sub.users?.full_name}</div>
              <div style={{ fontSize: '10px', color: '#8A8E99' }}>{sub.users?.email}</div>
            </div>
            <div style={{ fontSize: '11px', color: '#FFD700' }}>{sub.vip_plans?.name}</div>
            <div style={{ fontSize: '12px', fontWeight: '600', color: '#E8E4DC' }}>${sub.vip_plans?.price}</div>
            <div style={{ fontSize: '9px', fontWeight: '600', color: sub.status === 'active' ? '#00FF88' : sub.status === 'pending' ? '#FFD700' : '#FF4444', letterSpacing: '1px' }}>{sub.status.toUpperCase()}</div>
            <div style={{ display: 'flex', gap: '6px' }}>
              {sub.status === 'pending' && (
                <button onClick={() => { setShowInvite(sub.id); setInviteLink('') }} style={{ background: 'rgba(0,229,255,0.1)', border: '1px solid rgba(0,229,255,0.3)', color: '#00E5FF', padding: '6px 10px', fontSize: '9px', fontWeight: '600', cursor: 'pointer', fontFamily: 'Inter,sans-serif' }}>
                  Approve
                </button>
              )}
              {sub.telegram_invite_link && (
                <a href={sub.telegram_invite_link} target="_blank" rel="noopener noreferrer" style={{ background: 'rgba(0,229,255,0.08)', border: '1px solid rgba(0,229,255,0.2)', color: '#00E5FF', padding: '6px 10px', fontSize: '9px', fontWeight: '600', textDecoration: 'none' }}>
                  Link
                </a>
              )}
            </div>
          </div>
        ))}
      </div>

      {showInvite && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
          <div style={{ background: '#0F0F1A', border: '1px solid rgba(0,229,255,0.2)', padding: '40px', maxWidth: '480px', width: '100%', position: 'relative' }}>
            <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '2px', background: 'linear-gradient(90deg,#00E5FF,transparent)' }}></div>
            <h2 style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: '20px', fontWeight: '700', color: '#E8E4DC', marginBottom: '8px' }}>Approve VIP Subscription</h2>
            <p style={{ fontSize: '12px', color: '#8A8E99', marginBottom: '24px', lineHeight: '1.6' }}>Enter a single-use Telegram invite link for this member.</p>
            <div style={{ marginBottom: '24px' }}>
              <div style={{ fontSize: '9px', fontWeight: '600', letterSpacing: '2px', textTransform: 'uppercase', color: '#8A8E99', marginBottom: '8px' }}>Telegram Invite Link</div>
              <input style={{ width: '100%', background: '#111320', border: '1px solid rgba(0,229,255,0.15)', padding: '12px 16px', color: '#E8E4DC', fontFamily: 'Inter,sans-serif', fontSize: '13px', outline: 'none' }} placeholder="https://t.me/+..." value={inviteLink} onChange={e => setInviteLink(e.target.value)} />
            </div>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button onClick={() => { setShowInvite(null); setInviteLink('') }} style={{ flex: 1, background: 'none', border: '1px solid rgba(0,229,255,0.2)', color: '#8A8E99', padding: '12px', fontSize: '10px', fontWeight: '600', letterSpacing: '2px', textTransform: 'uppercase', cursor: 'pointer', fontFamily: 'Inter,sans-serif' }}>Cancel</button>
              <button onClick={() => handleUpdate(showInvite, 'active', inviteLink)} disabled={!inviteLink || !!updating} style={{ flex: 2, background: '#00E5FF', border: 'none', color: '#0A0A0F', padding: '12px', fontSize: '10px', fontWeight: '700', letterSpacing: '2px', textTransform: 'uppercase', cursor: 'pointer', fontFamily: 'Inter,sans-serif', opacity: !inviteLink || updating ? 0.6 : 1 }}>
                {updating ? 'Approving...' : 'Approve & Send Link →'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}