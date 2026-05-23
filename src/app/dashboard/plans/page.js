'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'

export default function PlansPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [plans, setPlans] = useState([])
  const [investments, setInvestments] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedPlan, setSelectedPlan] = useState(null)
  const [amount, setAmount] = useState('')
  const [investing, setInvesting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  useEffect(() => { fetchPlans() }, [])

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

  async function handleInvest() {
    if (!amount || Number(amount) < selectedPlan.min_amount) return setError(`Minimum investment is $${selectedPlan.min_amount}`)
    setInvesting(true)
    setError('')
    try {
      const res = await fetch('/api/plans', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('as_token')}`
        },
        body: JSON.stringify({ plan_id: selectedPlan.id, amount: Number(amount) })
      })
      const data = await res.json()
      if (data.error === 'INSUFFICIENT_BALANCE') { router.push('/dashboard/deposit'); return }
      if (!res.ok) return setError(data.error)
      setSuccess(true)
      setSelectedPlan(null)
      setAmount('')
      fetchPlans()
    } catch { setError('Something went wrong') }
    finally { setInvesting(false) }
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
        .plan-card { background:#0F0F1A; border:1px solid rgba(0,229,255,0.08); padding:28px; position:relative; cursor:pointer; transition:all 0.3s; display:flex; flex-direction:column; }
        .plan-card:hover { border-color:rgba(0,229,255,0.3); }
        .plan-card::before { content:''; position:absolute; top:0; left:0; width:100%; height:2px; background:linear-gradient(90deg,#00E5FF,transparent); }
        .plans-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:16px; align-items:start; }
        @media(max-width:900px){ .plans-grid{grid-template-columns:repeat(2,1fr)!important;} }
        @media(max-width:600px){ .plans-grid{grid-template-columns:1fr!important;} }
      `}</style>

      <div style={{ marginBottom: '28px' }}>
        <div style={{ fontSize: '9px', fontWeight: '600', letterSpacing: '3px', textTransform: 'uppercase', color: '#00E5FF', marginBottom: '8px' }}>Fund Management</div>
        <h1 style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: '32px', fontWeight: '700', color: '#E8E4DC' }}>Investment Plans</h1>
      </div>

      {success && (
        <div style={{ background: 'rgba(0,255,136,0.1)', border: '1px solid rgba(0,255,136,0.3)', padding: '16px', marginBottom: '24px', fontSize: '13px', color: '#00FF88' }}>
          Investment activated successfully!
        </div>
      )}

      {plans.length === 0 ? (
        <div style={{ background: '#0F0F1A', border: '1px solid rgba(0,229,255,0.08)', padding: '60px', textAlign: 'center' }}>
          <div style={{ fontSize: '13px', color: '#8A8E99' }}>No plans available at the moment</div>
        </div>
      ) : (
        <div className="plans-grid">
          {plans.map((plan) => (
            <div key={plan.id} className="plan-card" onClick={() => { setSelectedPlan(plan); setAmount(String(plan.min_amount)); setError(''); setSuccess(false) }}>
              <div style={{ fontSize: '9px', fontWeight: '700', letterSpacing: '3px', textTransform: 'uppercase', color: '#00E5FF', marginBottom: '16px' }}>{plan.name}</div>
              <div style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: '32px', fontWeight: '700', color: '#E8E4DC', marginBottom: '6px' }}>${Number(plan.min_amount).toLocaleString()}</div>
              <div style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: '20px', fontWeight: '600', color: '#00FF88', marginBottom: '8px' }}>→ ${Number(plan.target_profit).toLocaleString()}</div>
              <div style={{ fontSize: '10px', fontWeight: '500', letterSpacing: '1.5px', textTransform: 'uppercase', color: '#8A8E99', marginBottom: '20px', flex: 1 }}>{plan.duration_days} Days</div>
              {plan.weekly_return && (
                <div style={{ fontSize: '11px', color: '#8A8E99', marginBottom: '16px' }}>Weekly return: <span style={{ color: '#00FF88' }}>${Number(plan.weekly_return).toLocaleString()}</span></div>
              )}
              <div style={{ background: '#00E5FF', padding: '11px', textAlign: 'center', fontSize: '9px', fontWeight: '700', letterSpacing: '2px', textTransform: 'uppercase', color: '#0A0A0F', clipPath: 'polygon(6px 0%,100% 0%,calc(100% - 6px) 100%,0% 100%)' }}>
                Invest Now →
              </div>
            </div>
          ))}
        </div>
      )}

      {investments.length > 0 && (
        <div style={{ marginTop: '40px' }}>
          <div style={{ fontSize: '9px', fontWeight: '600', letterSpacing: '3px', textTransform: 'uppercase', color: '#8A8E99', marginBottom: '16px' }}>Active Investments</div>
          <div style={{ background: '#0F0F1A', border: '1px solid rgba(0,229,255,0.08)', padding: '24px' }}>
            {investments.map((inv, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid rgba(0,229,255,0.04)' }}>
                <div>
                  <div style={{ fontSize: '12px', fontWeight: '500', color: '#E8E4DC', marginBottom: '2px' }}>{inv.investment_plans?.name || 'Plan'}</div>
                  <div style={{ fontSize: '9px', color: '#8A8E99' }}>Ends: {new Date(inv.ends_at).toLocaleDateString()}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '13px', fontWeight: '600', color: '#E8E4DC' }}>${Number(inv.amount).toFixed(2)}</div>
                  <div style={{ fontSize: '9px', color: inv.status === 'completed' ? '#00FF88' : '#00E5FF', textTransform: 'uppercase', letterSpacing: '1px' }}>{inv.status}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {selectedPlan && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
          <div style={{ background: '#0F0F1A', border: '1px solid rgba(0,229,255,0.2)', padding: '40px', maxWidth: '440px', width: '100%', position: 'relative' }}>
            <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '2px', background: 'linear-gradient(90deg,#00E5FF,transparent)' }}></div>
            <h2 style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: '24px', fontWeight: '700', color: '#E8E4DC', marginBottom: '8px' }}>Invest in {selectedPlan.name}</h2>
            <p style={{ fontSize: '12px', color: '#8A8E99', marginBottom: '24px', lineHeight: '1.6' }}>
              Min: ${Number(selectedPlan.min_amount).toLocaleString()} · Target: ${Number(selectedPlan.target_profit).toLocaleString()} · {selectedPlan.duration_days} days
            </p>
            {error && <div style={{ background: 'rgba(255,68,68,0.1)', border: '1px solid rgba(255,68,68,0.3)', padding: '12px 16px', marginBottom: '16px', fontSize: '12px', color: '#FF4444' }}>{error}</div>}
            <div style={{ marginBottom: '20px' }}>
              <div style={{ fontSize: '9px', fontWeight: '600', letterSpacing: '2px', textTransform: 'uppercase', color: '#8A8E99', marginBottom: '8px' }}>Investment Amount</div>
              <input
                style={{ width: '100%', background: '#111320', border: '1px solid rgba(0,229,255,0.15)', padding: '14px 16px', color: '#E8E4DC', fontFamily: 'Inter,sans-serif', fontSize: '16px', outline: 'none' }}
                type="number"
                value={amount}
                onChange={e => { setAmount(e.target.value); setError('') }}
              />
            </div>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button onClick={() => { setSelectedPlan(null); setError('') }} style={{ flex: 1, background: 'none', border: '1px solid rgba(0,229,255,0.2)', color: '#8A8E99', padding: '14px', fontSize: '10px', fontWeight: '600', letterSpacing: '2px', textTransform: 'uppercase', cursor: 'pointer', fontFamily: 'Inter,sans-serif' }}>Cancel</button>
              <button onClick={handleInvest} disabled={investing} style={{ flex: 2, background: '#00E5FF', border: 'none', color: '#0A0A0F', padding: '14px', fontSize: '10px', fontWeight: '700', letterSpacing: '2px', textTransform: 'uppercase', cursor: 'pointer', fontFamily: 'Inter,sans-serif', clipPath: 'polygon(6px 0%,100% 0%,calc(100% - 6px) 100%,0% 100%)', opacity: investing ? 0.6 : 1 }}>
                {investing ? 'Processing...' : 'Confirm Investment →'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}