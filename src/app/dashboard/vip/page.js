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
        if (data.expired) setError('Your VIP membership has expired. Please renew below.')
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
      badge: 'MONTHLY',
      duration: 'per 30 days',
      features: [
        'VIP Futures Signals',
        '95% Win Rate Signals',
        '24/7 Trading Support',
      ]
    },
    'Lifetime': {
      color: '#FFD700',
      badge: '6 MONTHS',
      duration: 'per 180 days',
      features: [
        'VIP Futures Signals',
        '95% Win Rate Signals',
        '24/7 Trading Support',
        'Live Trading Sessions',
        'All Future Updates',
        'Members Only Community',
        'Daily Market Analysis',
      ]
    },
    'Premium': {
      color: '#00FF88',
      badge: 'LIFETIME',
      duration: 'one-time payment',
      features: [
        'All Monthly VIP Benefits',
        '1:1 Private Mentorship',
        'Exclusive Private Signals',
        'Copy Trading Access',
        'Priority Support',
        'Strategy Deep Dives',
        'Portfolio Review Sessions',
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
        .vip-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:20px; }
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
          {subscription.ends_at && (() => {
            const daysLeft = Math.ceil((new Date(subscription.ends_at) - new Date()) / (1000 * 60 * 60 * 24))
            return (
              <div style={{ marginBottom:'16px' }}>
                <div style={{ fontSize:'12px', color: daysLeft <= 10 ? '#FF4444' : '#8A8E99', marginBottom:'8px' }}>
                  {daysLeft <= 0 ? '❌ Expired' : daysLeft <= 10 ? `⚠️ Expires in ${daysLeft} days` : `Expires: ${new Date(subscription.ends_at).toLocaleDateString()}`}
                </div>
                {daysLeft <= 10 && daysLeft > 0 && (
                  <button onClick={() => { setSubscription(null); window.scrollTo(0,0) }}
                    style={{ background:'rgba(255,68,68,0.1)', border:'1px solid rgba(255,68,68,0.3)', color:'#FF4444', padding:'10px 20px', fontSize:'10px', fontWeight:'700', letterSpacing:'2px', textTransform:'uppercase', cursor:'pointer', fontFamily:'Inter,sans-serif' }}>
                    Renew Subscription →
                  </button>
                )}
              </div>
            )
          })()}
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
            const details = planDetails[plan.name] || {
              color: '#00E5FF',
              badge: plan.name.toUpperCase(),
              duration: plan.duration_days ? `per ${plan.duration_days} days` : 'one-time payment',
              features: []
            }
            const isPremium = plan.name === 'Premium'
            const isLifetime = plan.name === 'Lifetime'

            return (
              <div key={plan.id} style={{
                background:'#0F0F1A',
                border:`1px solid ${isPremium ? 'rgba(0,255,136,0.25)' : isLifetime ? 'rgba(255,215,0,0.25)' : 'rgba(0,229,255,0.12)'}`,
                padding:'32px',
                position:'relative',
                display:'flex',
                flexDirection:'column',
                transition:'transform 0.2s',
              }}>
                <div style={{ position:'absolute', top:0, left:0, width:'100%', height:'3px', background:`linear-gradient(90deg,${details.color},transparent)` }}></div>

                {isPremium && (
                  <div style={{ position:'absolute', top:'16px', right:'16px', background:'rgba(0,255,136,0.12)', border:'1px solid rgba(0,255,136,0.3)', color:'#00FF88', fontSize:'8px', fontWeight:'700', letterSpacing:'2px', padding:'4px 10px' }}>BEST VALUE</div>
                )}
                {isLifetime && (
                  <div style={{ position:'absolute', top:'16px', right:'16px', background:'rgba(255,215,0,0.12)', border:'1px solid rgba(255,215,0,0.3)', color:'#FFD700', fontSize:'8px', fontWeight:'700', letterSpacing:'2px', padding:'4px 10px' }}>POPULAR</div>
                )}

                <div style={{ fontSize:'9px', fontWeight:'700', letterSpacing:'3px', textTransform:'uppercase', color:details.color, marginBottom:'12px' }}>{details.badge}</div>

                <div style={{ fontFamily:"'Space Grotesk',sans-serif", fontSize:'42px', fontWeight:'700', color:'#E8E4DC', lineHeight:1, marginBottom:'6px' }}>
                  ${Number(plan.price).toLocaleString()}
                </div>
                <div style={{ fontSize:'11px', color:'#8A8E99', marginBottom:'24px', letterSpacing:'0.5px' }}>{details.duration}</div>

                <div style={{ flex:1, marginBottom:'28px', borderTop:`1px solid rgba(${isPremium ? '0,255,136' : isLifetime ? '255,215,0' : '0,229,255'},0.1)`, paddingTop:'20px' }}>
                  {details.features.map((f, i) => (
                    <div key={i} style={{ display:'flex', alignItems:'center', gap:'10px', marginBottom:'12px' }}>
                      <div style={{ width:'18px', height:'18px', borderRadius:'50%', background:`rgba(${isPremium ? '0,255,136' : isLifetime ? '255,215,0' : '0,229,255'},0.1)`, border:`1px solid ${details.color}`, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                        <span style={{ color:details.color, fontSize:'10px', fontWeight:'700' }}>✓</span>
                      </div>
                      <span style={{ fontSize:'12px', color:'#C8C4BC', lineHeight:'1.4' }}>{f}</span>
                    </div>
                  ))}
                </div>

                <button onClick={() => handleSubscribe(plan.id)} disabled={purchasing !== null}
                  style={{
                    background: purchasing === plan.id ? `rgba(0,229,255,0.3)` : details.color,
                    border:'none', color:'#0A0A0F', padding:'15px',
                    fontSize:'11px', fontWeight:'700', letterSpacing:'2px', textTransform:'uppercase',
                    cursor: purchasing !== null ? 'not-allowed' : 'pointer',
                    fontFamily:'Inter,sans-serif',
                    clipPath:'polygon(8px 0%,100% 0%,calc(100% - 8px) 100%,0% 100%)',
                    opacity: purchasing !== null && purchasing !== plan.id ? 0.5 : 1,
                    transition:'opacity 0.2s'
                  }}>
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