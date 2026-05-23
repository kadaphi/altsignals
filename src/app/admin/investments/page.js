'use client'
import { useState, useEffect } from 'react'

export default function AdminInvestmentsPage() {
  const [investments, setInvestments] = useState([])
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(null)
  const [filter, setFilter] = useState('active')

  useEffect(() => { fetchInvestments() }, [])

  async function fetchInvestments() {
    try {
      const res = await fetch('/api/admin/investments', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('as_token')}` }
      })
      if (res.ok) {
        const data = await res.json()
        setInvestments(data.investments || [])
      }
    } catch {}
    finally { setLoading(false) }
  }

  async function handleUpdate(investment_id, status) {
    setUpdating(investment_id)
    try {
      await fetch('/api/admin/investments', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('as_token')}`
        },
        body: JSON.stringify({ investment_id, status })
      })
      fetchInvestments()
    } catch {}
    finally { setUpdating(null) }
  }

  const filtered = filter === 'all' ? investments : investments.filter(inv => inv.status === filter)

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '400px' }}>
      <div style={{ width: '36px', height: '36px', border: '2px solid rgba(0,229,255,0.2)', borderTop: '2px solid #00E5FF', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
      <style>{`@keyframes spin{to{transform:rotate(360deg);}}`}</style>
    </div>
  )

  return (
    <div style={{ maxWidth: '1200px' }}>
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: '28px', fontWeight: '700', color: '#E8E4DC' }}>Investments</h1>
        <div style={{ fontSize: '12px', color: '#8A8E99', marginTop: '4px' }}>{investments.filter(i => i.status === 'active').length} active</div>
      </div>

      <div style={{ display: 'flex', gap: '8px', marginBottom: '24px' }}>
        {['active', 'completed', 'all'].map(f => (
          <button key={f} onClick={() => setFilter(f)} style={{ background: filter === f ? 'rgba(0,229,255,0.15)' : '#0F0F1A', border: `1px solid ${filter === f ? '#00E5FF' : 'rgba(0,229,255,0.08)'}`, padding: '8px 16px', color: filter === f ? '#00E5FF' : '#8A8E99', fontSize: '10px', fontWeight: '600', letterSpacing: '1px', textTransform: 'uppercase', cursor: 'pointer', fontFamily: 'Inter,sans-serif' }}>
            {f}
          </button>
        ))}
      </div>

      <div style={{ background: '#0F0F1A', border: '1px solid rgba(0,229,255,0.08)' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr 1fr', gap: '16px', padding: '12px 20px', borderBottom: '1px solid rgba(0,229,255,0.08)', fontSize: '9px', fontWeight: '700', letterSpacing: '2px', textTransform: 'uppercase', color: '#8A8E99' }}>
          <div>User</div>
          <div>Plan</div>
          <div>Amount</div>
          <div>Target</div>
          <div>Ends</div>
          <div>Actions</div>
        </div>
        {filtered.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', fontSize: '13px', color: '#8A8E99' }}>No investments found</div>
        ) : filtered.map((inv, i) => (
          <div key={i} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr 1fr', gap: '16px', padding: '14px 20px', borderBottom: '1px solid rgba(0,229,255,0.04)', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: '12px', fontWeight: '500', color: '#E8E4DC' }}>{inv.users?.full_name}</div>
              <div style={{ fontSize: '10px', color: '#8A8E99' }}>{inv.users?.email}</div>
            </div>
            <div style={{ fontSize: '11px', color: '#00E5FF' }}>{inv.investment_plans?.name}</div>
            <div style={{ fontSize: '12px', fontWeight: '600', color: '#E8E4DC' }}>${Number(inv.amount).toFixed(2)}</div>
            <div style={{ fontSize: '12px', color: '#00FF88' }}>${Number(inv.target_profit).toFixed(2)}</div>
            <div style={{ fontSize: '10px', color: '#8A8E99' }}>{inv.ends_at ? new Date(inv.ends_at).toLocaleDateString() : 'N/A'}</div>
            <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
              <div style={{ fontSize: '9px', fontWeight: '600', color: inv.status === 'completed' ? '#00FF88' : '#00E5FF', letterSpacing: '1px' }}>{inv.status.toUpperCase()}</div>
              {inv.status === 'active' && (
                <button onClick={() => handleUpdate(inv.id, 'completed')} disabled={updating === inv.id} style={{ background: 'rgba(0,255,136,0.1)', border: '1px solid rgba(0,255,136,0.3)', color: '#00FF88', padding: '5px 10px', fontSize: '9px', fontWeight: '600', cursor: 'pointer', fontFamily: 'Inter,sans-serif' }}>
                  Complete
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}