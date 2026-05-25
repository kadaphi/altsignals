'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'

export default function VIPPage() {
  const { user, refreshUser } = useAuth()
  const router = useRouter()
  const [plans, setPlans] = useState([])
  const [subscription, setSubscription] = useState(null)
  const [loading, setLoading] = useState(true)
  const [purchasing, setPurchasing] = useState(null)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [inviteLink, setInviteLink] = useState('')

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

  async function handleSubscribe(plan_id) {
    setPurchasing(plan_id)
    setError('')
    setSuccess('')
    try {
      const res = await fetch('/api/vip', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('as_token')}` },
        body: JSON.stringify({ plan_id })
      })
      const data = await res.json()
      if (data.error === 'INSUFFICIENT_BALANCE') { router.push('/dashboard/deposit'); return }
      if (!res.ok) return setError(data.error)
      setSuccess('VIP subscription activated!')
      if (data.telegram_invite_link) setInviteLink(data.telegram_invite_link)
      await refreshUser()
      fetchVIP()
    } catch { setError('Something went wrong') }
    finally { setPurchasing(null) }
  }

  const planDetails = {
    'Monthly': {
      color: '#00E5FF',
      badge: 'STARTER',
      features: [
        'Access to VIP Telegram channel',
        'Daily trading signals',
        'Basic market analysis',
        'Community support',
        'Renews every 30 days',
      ]
    },
    'Lifetime': {
      color: '#FFD700',
      badge: 'LIFETIME',
      features: [
        'Permanent VIP Telegram access',
        'Daily & premium trading signals',
        'Advanced market analysis',
        'Priority support',
        'All future updates included',
        'One-time payment — never pay again',
      ]
    },
    'Premium': {
      color: '#00FF88',
      badge: 'PREMIUM',
      features: [
        'Everything in Lifetime',
        'Private 1-on-1 mentorship sessions',
        'Exclusive premium signal group',
        'Direct access to our analysts',
        'Custom portfolio review',
        'VIP-only trade alerts & strategies',
      ]
    }
  }

  if (loading) return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', minHeight:'400px' }}>
      <div style={{ width:'36px', height:'36px', border:'2px solid rgba(0,229,255,0.2)', borderTop:'2px solid #00E5FF', borderRadius:'50%', animation:'spin 1s linear infinite' }}></div>
      <style>{`@keyframes spin{to{transform:rotate(360deg);}}`}</style>
    </div>
  )

  return (
    <div style={{ maxWidth:'1000px' }}>
      <style>{`
        @keyframes spin{to{transform:rotate(360deg);}}
        .vip-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:16px; }
        @media(max-width:768px){ .vip-grid{ grid-template-columns:1fr !important; } }
      `}</style>

      <div style={{ marginBottom:'28px' }}>
        <div style={{ fontSize:'9px', fontWeight:'600', letterSpacing:'3px', textTransform:'uppercase', color:'#00E5FF', marginBottom:'8px' }}>Exclusive Access</div>
        <h1 style={{ fontFamily:"'Space Grotesk',sans-serif", fontSize:'32px', fontWeight:'700', color:'#E8E4DC' }}>VIP Membership</h1>
        <p style={{ fontSize:'13px', color:'#8A8E99', marginTop:'8px', lineHeight:'1.6' }}>Choose the plan that fits your trading journey. Upgrade anytime.</p>
      </div>

      {error && <div style={{ background:'rgba(255,68,68,0.1)', border:'1px solid rgba(255,68,68,0.3)', padding:'12px 16px', marginBottom:'20px', fontSize:'12px', color:'#FF4444' }}>{error}</div>}
      {success && <div style={{ background:'rgba(0,255,136,0.1)', border:'1px solid rgba(0,255,136,0.3)', padding:'12px 16px', marginBottom:'20px', fontSize:'12px', color:'#00FF88' }}>{success}</div>}

      {inviteLink && (
        <div style={{ background:'rgba(0,229,255,0.06)', border:'1px solid rgba(0,229,255,0.2)', padding:'24px', marginBottom:'24px', position:'relative' }}>
          <div style={{ position:'absolute', top:0, left:0, width:'100%', height:'2px', background:'linear-gradient(90deg,#00E5FF,transparent)' }}></div>
          <div style={{ fontSize:'9px', fontWeight:'700', letterSpacing:'3px', textTransform:'uppercase', color:'#00E5FF', marginBottom:'12px' }}>Your Telegram Invite Link</div>
          <div style={{ background:'#111320', border:'1px solid rgba(0,229,255,0.2)', padding:'14px 16px', marginBottom:'12px', wordBreak:'break-all', fontSize:'12px', color:'#00E5FF', fontFamily:'monospace' }}>{inviteLink}</div>
          <div style={{ display:'flex', gap:'12px' }}>
            <button onClick={() => navigator.clipboard.writeText(inviteLink)}
              style={{ background:'rgba(0,229,255,0.1)', border:'1px solid rgba(0,229,255,0.3)', color:'#00E5FF', padding:'10px 20px', fontSize:'10px', fontWeight:'600', cursor:'pointer', fontFamily:'Inter,sans-serif' }}>
              Copy Link
            </button>
            <a href={inviteLink} target="_blank" rel="noopener noreferrer"
              style={{ background:'#00E5FF', color:'#0A0A0F', padding:'10px 20px', fontSize:'10px', fontWeight:'700', textDecoration:'none', display:'inline-flex', alignItems:'center', clipPath:'polygon(6px 0%,100% 0%,calc(100% - 6px) 100%,0% 100%)' }}>
              Join Channel →
            </a>
          </div>
        </div>
      )}

      {subscription ? (
        <div style={{ background:'#0F0F1A', border:'1px solid rgba(0,255,136,0.2)', padding:'32px', position:'relative', marginBottom:'32px' }}>
          <div style={{ position:'absolute', top:0, left:0, width:'100%', height:'2px', background:'linear-gradient(90deg,#00FF88,transparent)' }}></div>
          <div style={{ fontSize:'9px', fontWeight:'700', letterSpacing:'3px', textTransform:'uppercase', color:'#00FF88', marginBottom:'12px' }}>● ACTIVE VIP MEMBERSHIP</div>
          <div style={{ fontFamily:"'Space Grotesk',sans-serif", fontSize:'24px', fontWeight:'700', color:'#E8E4DC', marginBottom:'8px' }}>{subscription.vip_plans?.name}</div>
          {subscription.ends_at && (
            <div style={{ fontSize:'12px', color:'#8A8E99', marginBottom:'16px' }}>Expires: {new Date(subscription.ends_at).toLocaleDateString()}</div>
          )}
          {!subscription.ends_at && (
            <div style={{ fontSize:'12px', color:'#00FF88', marginBottom:'16px' }}>✓ Lifetime access — never expires</div>
          )}
          {subscription.telegram_invite_link && (
            <a href={subscription.telegram_invite_link} target="_blank" rel="noopener noreferrer"
              style={{ background:'#00E5FF', color:'#0A0A0F', padding:'12px 24px', fontSize:'10px', fontWeight:'700', textDecoration:'none', display:'inline-flex', alignItems:'center', clipPath:'polygon(6px 0%,100% 0%,calc(100% - 6px) 100%,0% 100%)' }}>
              Access VIP Channel →
            </a>
          )}
        </div>
      ) : (
        <div className="vip-grid">
          {plans.map((plan) => {
            const details = planDetails[plan.name] || { color:'#00E5FF', badge:plan.name.toUpperCase(), features:[] }
            const isLifetime = !plan.duration_days
            const isPremium = plan.name === 'Premium'
            return (
              <div key={plan.id} style={{ background:'#0F0F1A', border:`1px solid ${isPremium ? 'rgba(0,255,136,0.2)' : isLifetime ? 'rgba(255,215,0,0.2)' : 'rgba(0,229,255,0.08)'}`, padding:'32px', position:'relative', display:'flex', flexDirection:'column' }}>
                <div style={{ position:'absolute', top:0, left:0, width:'100%', height:'2px', background:`linear-gradient(90deg,${details.color},transparent)` }}></div>

                {isPremium && (
                  <div style={{ position:'absolute', top:'16px', right:'16px', background:'rgba(0,255,136,0.15)', border:'1px solid rgba(0,255,136,0.3)', color:'#00FF88', fontSize:'8px', fontWeight:'700', letterSpacing:'2px', padding:'4px 8px' }}>BEST VALUE</div>
                )}
                {isLifetime && !isPremium && (
                  <div style={{ position:'absolute', top:'16px', right:'16px', background:'rgba(255,215,0,0.15)', border:'1px solid rgba(255,215,0,0.3)', color:'#FFD700', fontSize:'8px', fontWeight:'700', letterSpacing:'2px', padding:'4px 8px' }}>POPULAR</div>
                )}

                <div style={{ fontSize:'9px', fontWeight:'700', letterSpacing:'3px', textTransform:'uppercase', color:details.color, marginBottom:'8px' }}>{details.badge}</div>
                <div style={{ fontFamily:"'Space Grotesk',sans-serif", fontSize:'36px', fontWeight:'700', color:'#E8E4DC', marginBottom:'4px' }}>${Number(plan.price).toLocaleString()}</div>
                <div style={{ fontSize:'11px', color:'#8A8E99', marginBottom:'24px' }}>
                  {plan.duration_days ? `per ${plan.duration_days} days` : 'one-time payment'}
                </div>

                <div style={{ flex:1, marginBottom:'24px' }}>
                  {details.features.map((f, i) => (
                    <div key={i} style={{ display:'flex', alignItems:'flex-start', gap:'8px', marginBottom:'10px' }}>
                      <span style={{ color:details.color, fontSize:'12px', flexShrink:0, marginTop:'1px' }}>✓</span>
                      <span style={{ fontSize:'12px', color:'#8A8E99', lineHeight:'1.5' }}>{f}</span>
                    </div>
                  ))}
                </div>

                <button onClick={() => handleSubscribe(plan.id)} disabled={purchasing !== null}
                  style={{ background: purchasing === plan.id ? `rgba(0,229,255,0.3)` : details.color, border:'none', color:'#0A0A0F', padding:'14px', fontSize:'10px', fontWeight:'700', letterSpacing:'2px', textTransform:'uppercase', cursor: purchasing !== null ? 'not-allowed' : 'pointer', fontFamily:'Inter,sans-serif', clipPath:'polygon(6px 0%,100% 0%,calc(100% - 6px) 100%,0% 100%)', opacity: purchasing !== null && purchasing !== plan.id ? 0.5 : 1 }}>
                  {purchasing === plan.id ? 'Processing...' : `Get ${plan.name} →`}
                </button>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}