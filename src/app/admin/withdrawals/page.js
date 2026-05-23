'use client'
import { useState, useEffect } from 'react'

export default function AdminWithdrawalsPage() {
  const [withdrawals, setWithdrawals] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('pending')
  const [updating, setUpdating] = useState(null)

  useEffect(() => { fetchWithdrawals() }, [])

  async function fetchWithdrawals() {
    try {
      const res = await fetch('/api/admin/withdrawals', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('as_token')}` }
      })
      if (res.ok) {
        const data = await res.json()
        setWithdrawals(data.withdrawals || [])
      }
    } catch {}
    finally { setLoading(false) }
  }

  async function handleUpdate(withdrawal_id, status) {
    setUpdating(withdrawal_id)
    try {
      await fetch('/api/admin/withdrawals', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('as_token')}`
        },
        body: JSON.stringify({ withdrawal_id, status })
      })
      fetchWithdrawals()
    } catch {}
    finally { setUpdating(null) }
  }

  const filtered = filter === 'all' ? withdrawals : withdrawals.filter(w => w.status === filter)

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '400px' }}>
      <div style={{ width: '36px', height: '36px', border: '2px solid rgba(0,229,255,0.2)', borderTop: '2px solid #00E5FF', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
      <style>{`@keyframes spin{to{transform:rotate(360deg);}}`}</style>
    </div>
  )

  return (
    <div style={{ maxWidth: '1200px' }}>
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: '28px', fontWeight: '700', color: '#E8E4DC' }}>Withdrawals</h1>
        <div style={{ fontSize: '12px', color: '#8A8E99', marginTop: '4px' }}>{withdrawals.filter(w => w.status === 'pending').length} pending</div>
      </div>

      <div style={{ display: 'flex', gap: '8px', marginBottom: '24px' }}>
        {['pending', 'completed', 'rejected', 'all'].map(f => (
          <button key={f} onClick={() => setFilter(f)} style={{ background: filter === f ? 'rgba(0,229,255,0.15)' : '#0F0F1A', border: `1px solid ${filter === f ? '#00E5FF' : 'rgba(0,229,255,0.08)'}`, padding: '8px 16px', color: filter === f ? '#00E5FF' : '#8A8E99', fontSize: '10px', fontWeight: '600', letterSpacing: '1px', textTransform: 'uppercase', cursor: 'pointer', fontFamily: 'Inter,sans-serif' }}>
            {f}
          </button>
        ))}
      </div>

      <div style={{ background: '#0F0F1A', border: '1px solid rgba(0,229,255,0.08)' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 2fr 1fr 1fr 1fr 1fr', gap: '16px', padding: '12px 20px', borderBottom: '1px solid rgba(0,229,255,0.08)', fontSize: '9px', fontWeight: '700', letterSpacing: '2px', textTransform: 'uppercase', color: '#8A8E99' }}>
          <div>User</div>
          <div>Wallet</div>
          <div>Network</div>
          <div>Amount</div>
          <div>Status</div>
          <div>Actions</div>
        </div>
        {filtered.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', fontSize: '13px', color: '#8A8E99' }}>No withdrawals found</div>
        ) : filtered.map((w, i) => (
          <div key={i} style={{ display: 'grid', gridTemplateColumns: '2fr 2fr 1fr 1fr 1fr 1fr', gap: '16px', padding: '14px 20px', borderBottom: '1px solid rgba(0,229,255,0.04)', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: '12px', fontWeight: '500', color: '#E8E4DC' }}>{w.users?.full_name}</div>
              <div style={{ fontSize: '10px', color: '#8A8E99' }}>{w.users?.email}</div>
            </div>
            <div style={{ fontSize: '10px', color: '#8A8E99', wordBreak: 'break-all' }}>{w.wallet_address}</div>
            <div style={{ fontSize: '11px', color: '#8A8E99' }}>{w.network}</div>
            <div style={{ fontSize: '13px', fontWeight: '600', color: '#E8E4DC' }}>${Number(w.amount).toFixed(2)}</div>
            <div style={{ fontSize: '9px', fontWeight: '600', letterSpacing: '1px', color: w.status === 'completed' ? '#00FF88' : w.status === 'rejected' ? '#FF4444' : '#FFD700' }}>
              {w.status.toUpperCase()}
            </div>
            {w.status === 'pending' && (
              <div style={{ display: 'flex', gap: '6px' }}>
                <button onClick={() => handleUpdate(w.id, 'completed')} disabled={updating === w.id} style={{ background: 'rgba(0,255,136,0.1)', border: '1px solid rgba(0,255,136,0.3)', color: '#00FF88', padding: '6px 10px', fontSize: '9px', fontWeight: '600', cursor: 'pointer', fontFamily: 'Inter,sans-serif' }}>
                  Approve
                </button>
                <button onClick={() => handleUpdate(w.id, 'rejected')} disabled={updating === w.id} style={{ background: 'rgba(255,68,68,0.1)', border: '1px solid rgba(255,68,68,0.3)', color: '#FF4444', padding: '6px 10px', fontSize: '9px', fontWeight: '600', cursor: 'pointer', fontFamily: 'Inter,sans-serif' }}>
                  Reject
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}