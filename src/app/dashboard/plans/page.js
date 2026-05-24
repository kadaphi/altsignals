'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'

export default function PlansPage() {
  const { user, updateUser } = useAuth()
  const router = useRouter()
  const [plans, setPlans] = useState([])
  const [investments, setInvestments] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedPlan, setSelectedPlan] = useState(null)
  const [customAmount, setCustomAmount] = useState('')
  const [showCustom, setShowCustom] = useState(false)
  const [customPreview, setCustomPreview] = useState(null)
  const [investing, setInvesting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  useEffect(() => { fetchPlans() }, [])
  useEffect(() => {
    if (customAmount && Number(customAmount) >= 2000) calculateCustom(Number(customAmount))
    else setCustomPreview(null)
  }, [customAmount])

  async function fetchPlans() {
    try {
      const res = await fetch('/api/plans', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('as_token')}` }
      })
      if (res.ok) {
        const data = await res.json()
        setPlans(data.plans || [])
        setInvestments(data.investments || [])
      }
    } catch {}
    finally { setLoading(false) }
  }

  function calculateCustom(amount) {
    let plan = plans[0]
    for (const p of plans) {
      if (amount >= p.min_amount) plan = p
    }
    const weeklyReturn = plan ? (plan.weekly_return / plan.min_amount) * amount : amount * 0.42
    const duration = plan ? plan.duration_days : 28
    const totalROI = weeklyReturn * Math.floor(duration / 7)
    setCustomPreview({ weeklyReturn: Math.round(weeklyReturn), totalROI: Math.round(totalROI), duration, planName: plan?.name })
  }

  async function handleInvest(plan_id, amount) {
    setInvesting(true)
    setError('')
    try {
      const res = await fetch('/api/plans', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('as_token')}` },
        body: JSON.stringify({ plan_id, amount: Number(amount) })
      })
      const data = await res.json()
      if (data.error === 'INSUFFICIENT_BALANCE') { router.push('/dashboard/deposit'); return }
      if (!res.ok) return setError(data.error)
      setSuccess(true)
      setSelectedPlan(null)
      setShowCustom(false)
      setCustomAmount('')
      fetchPlans()
    } catch { setError('Something went wrong') }
    finally { setInvesting(false) }
  }

  if (loading) return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', minHeight:'400px' }}>
      <div style={{ width:'36px', height:'36px', border:'2px solid rgba(0,229,255,0.2)', borderTop:'2px solid #00E5FF', borderRadius:'50%', animation:'spin 1s linear infinite' }}></div>
      <style>{`@keyframes spin{to{transform:rotate(360deg);}}`}</style>
    </div>
  )

  const COLORS = ['#00E5FF', '#7B61FF', '#00FF88', '#FF9800', '#FF6B35']

  return (
    <div style={{ maxWidth:'1100px' }}>
      <style>{`
        @keyframes spin{to{transform:rotate(360deg);}}
        .plan-card { background:#0F0F1A; border:1px solid rgba(0,229,255,0.08); padding:28px; position:relative; cursor:pointer; transition:all 0.3s; display:flex; flex-direction:column; }
        .plan-card:hover { border-color:rgba(0,229,255,0.3); transform:translateY(-2px); }
        .plan-card::before { content:''; position:absolute; top:0; left:0; width:100%; height:2px; }
        .plans-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:16px; }
        .custom-input { width:100%; background:#111320; border:1px solid rgba(0,229,255,0.15); padding:14px 16px; color:#E8E4DC; font-family:'Inter',sans-serif; font-size:16px; outline:none; transition:border-color 0.3s; }
        .custom-input:focus { border-color:rgba(0,229,255,0.5); }
        .custom-input::placeholder { color:#8A8E99; }
        @media(max-width:900px){ .plans-grid{grid-template-columns:repeat(2,1fr)!important;} }
        @media(max-width:600px){ .plans-grid{grid-template-columns:1fr!important;} }
      `}</style>

      <div style={{ marginBottom:'28px' }}>
        <div style={{ fontSize:'9px', fontWeight:'600', letterSpacing:'3px', textTransform:'uppercase', color:'#00E5FF', marginBottom:'8px' }}>Fund Management</div>
        <h1 style={{ fontFamily:"'Space Grotesk',sans-serif", fontSize:'32px', fontWeight:'700', color:'#E8E4DC' }}>Investment Plans</h1>
      </div>

      {success && (
        <div style={{ background:'rgba(0,255,136,0.1)', border:'1px solid rgba(0,255,136,0.3)', padding:'16px', marginBottom:'24px', fontSize:'13px', color:'#00FF88' }}>
          Investment activated successfully!
        </div>
      )}

      {error && <div style={{ background:'rgba(255,68,68,0.1)', border:'1px solid rgba(255,68,68,0.3)', padding:'12px 16px', marginBottom:'20px', fontSize:'12px', color:'#FF4444' }}>{error}</div>}

      <div style={{ background:'#0F0F1A', border:'1px solid rgba(0,229,255,0.08)', padding:'16px 20px', marginBottom:'24px', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
        <div style={{ fontSize:'11px', color:'#8A8E99' }}>Available Balance</div>
        <div style={{ fontFamily:"'Space Grotesk',sans-serif", fontSize:'22px', fontWeight:'700', color:'#00E5FF' }}>
          ${Number(user?.deposit_balance || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
        </div>
      </div>

      {/* Fixed Plans */}
      <div style={{ marginBottom:'32px' }}>
        <div style={{ fontSize:'9px', fontWeight:'600', letterSpacing:'3px', textTransform:'uppercase', color:'#8A8E99', marginBottom:'16px' }}>Fixed Plans</div>
        <div className="plans-grid">
          {plans.map((plan, i) => (
            <div key={plan.id} className="plan-card" onClick={() => { setSelectedPlan(plan); setError(''); setSuccess(false) }}
              style={{ '--plan-color': COLORS[i] || '#00E5FF' }}>
              <div style={{ position:'absolute', top:0, left:0, width:'100%', height:'2px', background:`linear-gradient(90deg,${COLORS[i] || '#00E5FF'},transparent)` }}></div>
              <div style={{ fontSize:'9px', fontWeight:'700', letterSpacing:'3px', textTransform:'uppercase', color: COLORS[i] || '#00E5FF', marginBottom:'16px' }}>{plan.name}</div>
              <div style={{ fontFamily:"'Space Grotesk',sans-serif", fontSize:'32px', fontWeight:'700', color:'#E8E4DC', marginBottom:'6px' }}>${Number(plan.min_amount).toLocaleString()}</div>
              <div style={{ fontFamily:"'Space Grotesk',sans-serif", fontSize:'18px', fontWeight:'600', color:'#00FF88', marginBottom:'8px' }}>→ ${Number(plan.target_profit).toLocaleString()}</div>
              {plan.weekly_return && (
                <div style={{ fontSize:'11px', color:'#8A8E99', marginBottom:'8px' }}>
                  Weekly: <span style={{ color:'#00FF88' }}>${Number(plan.weekly_return).toLocaleString()}</span>
                </div>
              )}
              <div style={{ fontSize:'10px', fontWeight:'500', letterSpacing:'1.5px', textTransform:'uppercase', color:'#8A8E99', marginBottom:'20px', flex:1 }}>{plan.duration_days} Days</div>
              <div style={{ background: COLORS[i] || '#00E5FF', padding:'10px', textAlign:'center', fontSize:'9px', fontWeight:'700', letterSpacing:'2px', textTransform:'uppercase', color:'#0A0A0F', clipPath:'polygon(6px 0%,100% 0%,calc(100% - 6px) 100%,0% 100%)' }}>
                Invest Now →
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Custom Plan */}
      <div style={{ background:'#0F0F1A', border:'1px solid rgba(123,97,255,0.3)', padding:'32px', position:'relative', marginBottom:'32px' }}>
        <div style={{ position:'absolute', top:0, left:0, width:'100%', height:'2px', background:'linear-gradient(90deg,#7B61FF,transparent)' }}></div>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom: showCustom ? '24px' : '0', flexWrap:'wrap', gap:'16px' }}>
          <div>
            <div style={{ fontSize:'9px', fontWeight:'700', letterSpacing:'3px', textTransform:'uppercase', color:'#7B61FF', marginBottom:'8px' }}>Custom Plan</div>
            <div style={{ fontFamily:"'Space Grotesk',sans-serif", fontSize:'20px', fontWeight:'700', color:'#E8E4DC' }}>Invest any amount from $2,000</div>
            <div style={{ fontSize:'12px', color:'#8A8E99', marginTop:'6px' }}>Returns calculated based on closest plan rate</div>
          </div>
          <button onClick={() => { setShowCustom(!showCustom); setError('') }}
            style={{ background: showCustom ? 'none' : '#7B61FF', border:'1px solid #7B61FF', color: showCustom ? '#7B61FF' : '#fff', padding:'12px 24px', fontSize:'10px', fontWeight:'700', letterSpacing:'2px', textTransform:'uppercase', cursor:'pointer', fontFamily:'Inter,sans-serif', clipPath:'polygon(6px 0%,100% 0%,calc(100% - 6px) 100%,0% 100%)' }}>
            {showCustom ? 'Cancel' : 'Customize →'}
          </button>
        </div>

        {showCustom && (
          <div>
            <div style={{ marginBottom:'20px' }}>
              <div style={{ fontSize:'9px', fontWeight:'600', letterSpacing:'2px', textTransform:'uppercase', color:'#8A8E99', marginBottom:'8px' }}>Your Investment Amount ($)</div>
              <div style={{ position:'relative' }}>
                <span style={{ position:'absolute', left:'16px', top:'50%', transform:'translateY(-50%)', color:'#7B61FF', fontSize:'16px' }}>$</span>
                <input className="custom-input" style={{ paddingLeft:'32px' }} type="number" placeholder="Min. $2,000" value={customAmount} onChange={e => setCustomAmount(e.target.value)} min="2000" />
              </div>
            </div>

            {customPreview && (
              <div style={{ background:'rgba(123,97,255,0.06)', border:'1px solid rgba(123,97,255,0.2)', padding:'20px', marginBottom:'20px' }}>
                <div style={{ fontSize:'9px', fontWeight:'600', letterSpacing:'2px', textTransform:'uppercase', color:'#7B61FF', marginBottom:'16px' }}>Based on {customPreview.planName} plan rate</div>
                <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:'16px', textAlign:'center' }}>
                  {[
                    { label:'You Invest', value:`$${Number(customAmount).toLocaleString()}` },
                    { label:'Weekly Return', value:`$${customPreview.weeklyReturn.toLocaleString()}`, color:'#00FF88' },
                    { label:'Total ROI', value:`$${customPreview.totalROI.toLocaleString()}`, color:'#00FF88' },
                  ].map((s,i) => (
                    <div key={i}>
                      <div style={{ fontSize:'9px', letterSpacing:'2px', textTransform:'uppercase', color:'#8A8E99', marginBottom:'8px' }}>{s.label}</div>
                      <div style={{ fontFamily:"'Space Grotesk',sans-serif", fontSize:'22px', fontWeight:'700', color: s.color || '#E8E4DC' }}>{s.value}</div>
                    </div>
                  ))}
                </div>
                <div style={{ fontSize:'11px', color:'#8A8E99', textAlign:'center', marginTop:'12px' }}>Duration: {customPreview.duration} days</div>
              </div>
            )}

            {customPreview && Number(customAmount) >= 2000 && (
              <button
                onClick={() => {
                  const matchedPlan = [...plans].reverse().find(p => Number(customAmount) >= p.min_amount)
                  if (!matchedPlan) return setError('No matching plan found')
                  setSelectedPlan({ ...matchedPlan, customAmount: Number(customAmount), isCustom: true })
                }}
                style={{ width:'100%', background:'#7B61FF', border:'none', padding:'14px', color:'#fff', fontSize:'11px', fontWeight:'700', letterSpacing:'2px', textTransform:'uppercase', cursor:'pointer', fontFamily:'Inter,sans-serif', clipPath:'polygon(8px 0%,100% 0%,calc(100% - 8px) 100%,0% 100%)' }}
              >
                Proceed with Custom Plan →
              </button>
            )}
          </div>
        )}
      </div>

      {/* Active Investments */}
      {investments.length > 0 && (
        <div>
          <div style={{ fontSize:'9px', fontWeight:'600', letterSpacing:'3px', textTransform:'uppercase', color:'#8A8E99', marginBottom:'16px' }}>Active Investments</div>
          <div style={{ background:'#0F0F1A', border:'1px solid rgba(0,229,255,0.08)', padding:'24px' }}>
            {investments.map((inv, i) => (
              <div key={i} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'12px 0', borderBottom:'1px solid rgba(0,229,255,0.04)' }}>
                <div>
                  <div style={{ fontSize:'12px', fontWeight:'500', color:'#E8E4DC', marginBottom:'2px' }}>{inv.investment_plans?.name || 'Plan'}</div>
                  <div style={{ fontSize:'9px', color:'#8A8E99' }}>Ends: {new Date(inv.ends_at).toLocaleDateString()}</div>
                </div>
                <div style={{ textAlign:'right' }}>
                  <div style={{ fontSize:'13px', fontWeight:'600', color:'#E8E4DC' }}>${Number(inv.amount).toFixed(2)}</div>
                  <div style={{ fontSize:'9px', color: inv.status === 'completed' ? '#00FF88' : '#00E5FF', textTransform:'uppercase', letterSpacing:'1px' }}>{inv.status}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Confirm Modal */}
      {selectedPlan && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.85)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:1000, padding:'20px' }}>
          <div style={{ background:'#0F0F1A', border:'1px solid rgba(0,229,255,0.2)', padding:'40px', maxWidth:'440px', width:'100%', position:'relative' }}>
            <div style={{ position:'absolute', top:0, left:0, width:'100%', height:'2px', background:'linear-gradient(90deg,#00E5FF,transparent)' }}></div>
            <h2 style={{ fontFamily:"'Space Grotesk',sans-serif", fontSize:'24px', fontWeight:'700', color:'#E8E4DC', marginBottom:'8px' }}>
              {selectedPlan.isCustom ? 'Custom Investment' : `${selectedPlan.name} Plan`}
            </h2>
            <p style={{ fontSize:'12px', color:'#8A8E99', marginBottom:'24px', lineHeight:'1.6' }}>Review your investment details below.</p>
            {error && <div style={{ background:'rgba(255,68,68,0.1)', border:'1px solid rgba(255,68,68,0.3)', padding:'12px 16px', marginBottom:'16px', fontSize:'12px', color:'#FF4444' }}>{error}</div>}
            <div style={{ background:'#111320', border:'1px solid rgba(0,229,255,0.08)', padding:'20px', marginBottom:'24px' }}>
              {[
                { label:'Plan', value: selectedPlan.isCustom ? `Custom (${selectedPlan.name} rate)` : selectedPlan.name },
                { label:'Amount', value:`$${Number(selectedPlan.isCustom ? selectedPlan.customAmount : selectedPlan.min_amount).toLocaleString()}` },
                { label:'Target Profit', value:`$${Number(selectedPlan.target_profit).toLocaleString()}` },
                { label:'Duration', value:`${selectedPlan.duration_days} Days` },
              ].map((item,i) => (
                <div key={i} style={{ display:'flex', justifyContent:'space-between', padding:'8px 0', borderBottom: i < 3 ? '1px solid rgba(0,229,255,0.06)' : 'none' }}>
                  <span style={{ fontSize:'11px', color:'#8A8E99' }}>{item.label}</span>
                  <span style={{ fontSize:'11px', color:'#E8E4DC', fontWeight:'500' }}>{item.value}</span>
                </div>
              ))}
            </div>
            <div style={{ display:'flex', gap:'12px' }}>
              <button onClick={() => { setSelectedPlan(null); setError('') }} style={{ flex:1, background:'none', border:'1px solid rgba(0,229,255,0.2)', color:'#8A8E99', padding:'14px', fontSize:'10px', fontWeight:'600', letterSpacing:'2px', textTransform:'uppercase', cursor:'pointer', fontFamily:'Inter,sans-serif' }}>Cancel</button>
              <button onClick={() => handleInvest(selectedPlan.id, selectedPlan.isCustom ? selectedPlan.customAmount : selectedPlan.min_amount)} disabled={investing}
                style={{ flex:2, background:'#00E5FF', border:'none', color:'#0A0A0F', padding:'14px', fontSize:'10px', fontWeight:'700', letterSpacing:'2px', textTransform:'uppercase', cursor:'pointer', fontFamily:'Inter,sans-serif', clipPath:'polygon(6px 0%,100% 0%,calc(100% - 6px) 100%,0% 100%)', opacity: investing ? 0.6 : 1 }}>
                {investing ? 'Processing...' : 'Confirm Investment →'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}