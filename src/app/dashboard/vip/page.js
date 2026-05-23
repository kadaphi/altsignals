'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function VIPPage() {
  const router = useRouter()
  const [plans, setPlans] = useState([])
  const [subscription, setSubscription] = useState(null)
  const [loading, setLoading] = useState(true)
  const [purchasing, setPurchasing] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  useEffect(() => { fetchVIP() }, [])

  async function fetchVIP() {
    try {
      const res = await fetch('/api/vip', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('as_token')}` }
      })
      if (res.ok) {
        const data = await res.json()
        setPlans(data.plans || [])
        setSubscription(data.subscription || null)
      }
    } catch {}
    finally { setLoading(false) }
  }

  async function handlePurchase(plan_id) {
    setPurchasing(true)
    setError('')
    try {
      const res = await fetch('/api/vip', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('as_token')}`
        },
        body: JSON.stringify({ plan_id })
      })
      const data = await res.json()
      if (data.error === 'INSUFFICIENT_BALANCE') { router.push('/dashboard/deposit'); return }
      if (!res.ok) return setError(data.error)
      setSuccess(true)
      fetchVIP()
    } catch { setError('Something went wrong') }
    finally { setPurchasing(false) }
  }

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '400px' }}>
      <div style={{ width: '36px', height: '36px', border: '2px solid rgba(0,229,255,0.2)', borderTop: '2px solid #00E5FF', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
      <style>{`@keyframes spin{to{transform:rotate(360deg);}}`}</style>
    </div>
  )

  return (
    <div style={{ maxWidth: '1100px' }}>
      <style>{`
        @keyframes spin{to{transform:rotate(360deg);}}
        .vip-card { background:#0F0F1A; border:1px solid rgba(0,229,255,0.08); padding:32px; position:relative; transition:all 0.3s; display:flex; flex-direction:column; }
        .vip-card:hover { border-color:rgba(0,229,255,0.25); }
        .vip-card.featured { border-color:rgba(0,229,255,0.3); background:#111320; }
        .vip-card.featured::before { content:'MOST POPULAR'; position:absolute; top:-12px; left:50%; transform:translateX(-50%); background:#00E5FF; color:#0A0A0F; font-size:8px; font-weight:700; letter-spacing:2px; padding:4px 12px; white-space:nowrap; }
        .vip-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:20px; align-items:start; }
        @media(max-width:900px){ .vip-grid{grid-template-columns:1fr!important;} }
      `}</style>

      <div style={{ marginBottom: '28px' }}>
        <div style={{ fontSize: '9px', fontWeight: '600', letterSpacing: '3px', textTransform: 'uppercase', color: '#00E5FF', marginBottom: '8px' }}>Elite Access</div>
        <h1 style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: '32px', fontWeight: '700', color: '#E8E4DC' }}>VIP Membership</h1>
      </div>

      {error && <div style={{ background: 'rgba(255,68,68,0.1)', border: '1px solid rgba(255,68,68,0.3)', padding: '12px 16px', marginBottom: '20px', fontSize: '12px', color: '#FF4444' }}>{error}</div>}

      {success && (
        <div style={{ background: 'rgba(0,255,136,0.1)', border: '1px solid rgba(0,255,136,0.3)', padding: '20px', marginBottom: '24px', textAlign: 'center' }}>
          <div style={{ fontSize: '24px', marginBottom: '8px' }}>✓</div>
          <div style={{ fontSize: '14px', fontWeight: '600', color: '#00FF88', marginBottom: '4px' }}>VIP Subscription Activated!</div>
          <div style={{ fontSize: '12px', color: '#8A8E99' }}>Your Telegram invite link will be sent to your account shortly.</div>
        </div>
      )}

      {subscription ? (
        <div style={{ background: '#0F0F1A', border: '1px solid rgba(0,229,255,0.2)', padding: '32px', marginBottom: '32px', position: 'relative' }}>
          <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '2px', background: 'linear-gradient(90deg,#00E5FF,transparent)' }}></div>
          <div style={{ fontSize: '9px', fontWeight: '600', letterSpacing: '3px', textTransform: 'uppercase', color: '#00E5FF', marginBottom: '12px' }}>● Active VIP Member</div>
          <div style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: '28px', fontWeight: '700', color: '#E8E4DC', marginBottom: '8px' }}>{subscription.vip_plans?.name}</div>
          {subscription.ends_at && (
            <div style={{ fontSize: '12px', color: '#8A8E99' }}>Expires: {new Date(subscription.ends_at).toLocaleDateString()}</div>
          )}
          {subscription.telegram_invite_link && (
            <a href={subscription.telegram_invite_link} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', marginTop: '16px', background: '#00E5FF', color: '#0A0A0F', padding: '12px 24px', fontSize: '11px', fontWeight: '700', letterSpacing: '2px', textTransform: 'uppercase', textDecoration: 'none', clipPath: 'polygon(6px 0%,100% 0%,calc(100% - 6px) 100%,0% 100%)' }}>
              Join Telegram Group →
            </a>
          )}
        </div>
      ) : (
        <div className="vip-grid">
          {plans.length === 0 ? (
            <div style={{ background: '#0F0F1A', border: '1px solid rgba(0,229,255,0.08)', padding: '60px', textAlign: 'center', gridColumn: '1/-1' }}>
              <div style={{ fontSize: '13px', color: '#8A8E99' }}>No VIP plans available at the moment</div>
            </div>
          ) : plans.map((plan, i) => (
            <div key={plan.id} className={`vip-card${plan.is_featured ? ' featured' : ''}`}>
              <div style={{ fontSize: '9px', fontWeight: '700', letterSpacing: '3px', textTransform: 'uppercase', color: '#00E5FF', marginBottom: '12px' }}>{plan.name}</div>
              <div style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: '48px', fontWeight: '700', color: '#E8E4DC', lineHeight: '1', marginBottom: '4px' }}>${Number(plan.price).toLocaleString()}</div>
              <div style={{ fontSize: '11px', color: '#8A8E99', marginBottom: '24px' }}>{plan.duration_days ? `${plan.duration_days} days` : 'Lifetime'}</div>
              <ul style={{ listStyle: 'none', marginBottom: '28px', flex: 1 }}>
                {(plan.features || []).map((f, j) => (
                  <li key={j} style={{ fontSize: '12px', color: '#8A8E99', padding: '6px 0', borderBottom: '1px solid rgba(255,255,255,0.04)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ color: '#00E5FF', fontWeight: '700', flexShrink: 0 }}>✓</span> {f}
                  </li>
                ))}
              </ul>
              <button onClick={() => handlePurchase(plan.id)} disabled={purchasing} style={{ width: '100%', background: '#00E5FF', border: 'none', color: '#0A0A0F', padding: '14px', fontSize: '11px', fontWeight: '700', letterSpacing: '2px', textTransform: 'uppercase', cursor: 'pointer', fontFamily: 'Inter,sans-serif', clipPath: 'polygon(6px 0%,100% 0%,calc(100% - 6px) 100%,0% 100%)', opacity: purchasing ? 0.6 : 1 }}>
                {purchasing ? 'Processing...' : `Get ${plan.name} →`}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}