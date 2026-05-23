'use client'
import { useState, useEffect } from 'react'

export default function HistoryPage() {
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')

  useEffect(() => { fetchHistory() }, [])

  async function fetchHistory() {
    try {
      const res = await fetch('/api/history', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('as_token')}` }
      })
      if (res.ok) {
        const data = await res.json()
        setHistory(data.history || [])
      }
    } catch {}
    finally { setLoading(false) }
  }

  const filtered = filter === 'all' ? history : history.filter(h => h.type === filter)

  const typeColor = (type) => {
    switch(type) {
      case 'deposit': return '#00E5FF'
      case 'withdrawal': return '#FF4444'
      case 'investment': return '#7B61FF'
      case 'copy_trade': return '#00FF88'
      case 'vip': return '#FFD700'
      case 'challenge': return '#FF6B35'
      case 'course': return '#00E5FF'
      default: return '#8A8E99'
    }
  }

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '400px' }}>
      <div style={{ width: '36px', height: '36px', border: '2px solid rgba(0,229,255,0.2)', borderTop: '2px solid #00E5FF', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
      <style>{`@keyframes spin{to{transform:rotate(360deg);}}`}</style>
    </div>
  )

  return (
    <div style={{ maxWidth: '900px' }}>
      <div style={{ marginBottom: '28px' }}>
        <div style={{ fontSize: '9px', fontWeight: '600', letterSpacing: '3px', textTransform: 'uppercase', color: '#00E5FF', marginBottom: '8px' }}>Activity</div>
        <h1 style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: '32px', fontWeight: '700', color: '#E8E4DC' }}>Trade History</h1>
      </div>

      <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', flexWrap: 'wrap' }}>
        {['all', 'deposit', 'withdrawal', 'investment', 'copy_trade', 'vip', 'challenge', 'course'].map(f => (
          <button key={f} onClick={() => setFilter(f)} style={{ background: filter === f ? 'rgba(0,229,255,0.15)' : '#0F0F1A', border: `1px solid ${filter === f ? '#00E5FF' : 'rgba(0,229,255,0.08)'}`, padding: '8px 16px', color: filter === f ? '#00E5FF' : '#8A8E99', fontSize: '10px', fontWeight: '600', letterSpacing: '1px', textTransform: 'uppercase', cursor: 'pointer', fontFamily: 'Inter,sans-serif', transition: 'all 0.2s' }}>
            {f === 'all' ? 'All' : f.replace('_', ' ')}
          </button>
        ))}
      </div>

      <div style={{ background: '#0F0F1A', border: '1px solid rgba(0,229,255,0.08)', padding: '24px' }}>
        {filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', fontSize: '13px', color: '#8A8E99' }}>No transactions found</div>
        ) : filtered.map((h, i) => (
          <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 0', borderBottom: '1px solid rgba(0,229,255,0.04)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: `rgba(0,229,255,0.08)`, border: `1px solid rgba(0,229,255,0.15)`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: typeColor(h.type) }}></div>
              </div>
              <div>
                <div style={{ fontSize: '12px', fontWeight: '500', color: '#E8E4DC', marginBottom: '2px' }}>{h.description}</div>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <div style={{ fontSize: '9px', color: '#8A8E99' }}>{new Date(h.created_at).toLocaleDateString()}</div>
                  <div style={{ fontSize: '9px', fontWeight: '600', letterSpacing: '1px', textTransform: 'uppercase', color: typeColor(h.type) }}>{h.type.replace('_', ' ')}</div>
                </div>
              </div>
            </div>
            <div style={{ fontSize: '14px', fontWeight: '700', color: h.amount > 0 ? '#00FF88' : '#FF4444', flexShrink: 0 }}>
              {h.amount > 0 ? '+' : ''}${Math.abs(h.amount).toFixed(2)}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}