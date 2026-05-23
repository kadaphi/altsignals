'use client'
import { useState, useEffect } from 'react'

export default function AdminCopyTradingPage() {
  const [traders, setTraders] = useState([])
  const [subscriptions, setSubscriptions] = useState([])
  const [codes, setCodes] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('subscriptions')
  const [updating, setUpdating] = useState(null)
  const [showAddTrader, setShowAddTrader] = useState(false)
  const [traderForm, setTraderForm] = useState({ name: '', bio: '', avatar_url: '', profit_percentage: '', min_capital: '' })
  const [activateForm, setActivateForm] = useState({})
  const [showActivate, setShowActivate] = useState(null)
  const [editSubscribers, setEditSubscribers] = useState({})

  useEffect(() => { fetchData() }, [])

  async function fetchData() {
    try {
      const res = await fetch('/api/admin/copy-trading', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('as_token')}` }
      })
      if (res.ok) {
        const data = await res.json()
        setTraders(data.traders || [])
        setSubscriptions(data.subscriptions || [])
        setCodes(data.codes || [])
      }
    } catch {}
    finally { setLoading(false) }
  }

  async function handleAction(action, params) {
    setUpdating(action)
    try {
      await fetch('/api/admin/copy-trading', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('as_token')}`
        },
        body: JSON.stringify({ action, ...params })
      })
      fetchData()
    } catch {}
    finally { setUpdating(null) }
  }

  async function handleActivate(subscription_id) {
    setUpdating(subscription_id)
    try {
      await fetch('/api/admin/copy-trading', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('as_token')}`
        },
        body: JSON.stringify({
          action: 'activate',
          subscription_id,
          target_profit: Number(activateForm.target_profit),
          ends_at: activateForm.ends_at
        })
      })
      setShowActivate(null)
      setActivateForm({})
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
      <style>{`@keyframes spin{to{transform:rotate(360deg);}}`}</style>
      <div style={{ marginBottom: '28px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <h1 style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: '28px', fontWeight: '700', color: '#E8E4DC' }}>Copy Trading</h1>
        <button onClick={() => setShowAddTrader(true)} style={{ background: '#00E5FF', border: 'none', color: '#0A0A0F', padding: '10px 20px', fontSize: '10px', fontWeight: '700', letterSpacing: '2px', textTransform: 'uppercase', cursor: 'pointer', fontFamily: 'Inter,sans-serif', clipPath: 'polygon(6px 0%,100% 0%,calc(100% - 6px) 100%,0% 100%)' }}>
          Add Trader
        </button>
      </div>

      <div style={{ display: 'flex', gap: '4px', marginBottom: '24px', borderBottom: '1px solid rgba(0,229,255,0.08)', paddingBottom: '0' }}>
        {['subscriptions', 'traders', 'codes'].map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)} style={{ background: 'none', border: 'none', borderBottom: activeTab === tab ? '2px solid #00E5FF' : '2px solid transparent', padding: '12px 20px', color: activeTab === tab ? '#00E5FF' : '#8A8E99', fontSize: '11px', fontWeight: '600', letterSpacing: '1.5px', textTransform: 'uppercase', cursor: 'pointer', fontFamily: 'Inter,sans-serif', marginBottom: '-1px' }}>
            {tab}
          </button>
        ))}
      </div>

      {activeTab === 'subscriptions' && (
        <div style={{ background: '#0F0F1A', border: '1px solid rgba(0,229,255,0.08)' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr 1fr', gap: '16px', padding: '12px 20px', borderBottom: '1px solid rgba(0,229,255,0.08)', fontSize: '9px', fontWeight: '700', letterSpacing: '2px', textTransform: 'uppercase', color: '#8A8E99' }}>
            <div>User</div>
            <div>Trader</div>
            <div>Status</div>
            <div>Profit</div>
            <div>Target</div>
            <div>Actions</div>
          </div>
          {subscriptions.length === 0 ? (
            <div style={{ padding: '40px', textAlign: 'center', fontSize: '13px', color: '#8A8E99' }}>No subscriptions yet</div>
          ) : subscriptions.map((sub, i) => (
            <div key={i} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr 1fr', gap: '16px', padding: '14px 20px', borderBottom: '1px solid rgba(0,229,255,0.04)', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: '12px', fontWeight: '500', color: '#E8E4DC' }}>{sub.users?.full_name}</div>
                <div style={{ fontSize: '10px', color: '#8A8E99' }}>{sub.users?.email}</div>
              </div>
              <div style={{ fontSize: '11px', color: '#00E5FF' }}>{sub.copy_traders?.name}</div>
              <div style={{ fontSize: '9px', fontWeight: '600', color: sub.status === 'active' ? '#00FF88' : sub.status === 'waiting' ? '#FFD700' : sub.status === 'completed' ? '#00E5FF' : '#FF4444', letterSpacing: '1px' }}>{sub.status.toUpperCase()}</div>
              <div style={{ fontSize: '12px', color: '#00FF88' }}>${Number(sub.current_profit || 0).toFixed(2)}</div>
              <div style={{ fontSize: '12px', color: '#8A8E99' }}>${Number(sub.target_profit || 0).toFixed(2)}</div>
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                {sub.status === 'waiting' && (
                  <button onClick={() => { setShowActivate(sub.id); setActivateForm({ target_profit: '', ends_at: '' }) }} style={{ background: 'rgba(0,229,255,0.1)', border: '1px solid rgba(0,229,255,0.3)', color: '#00E5FF', padding: '5px 8px', fontSize: '9px', fontWeight: '600', cursor: 'pointer', fontFamily: 'Inter,sans-serif' }}>
                    Activate
                  </button>
                )}
                {sub.status === 'active' && (
                  <button onClick={() => handleAction('complete', { subscription_id: sub.id })} disabled={updating === 'complete'} style={{ background: 'rgba(0,255,136,0.1)', border: '1px solid rgba(0,255,136,0.3)', color: '#00FF88', padding: '5px 8px', fontSize: '9px', fontWeight: '600', cursor: 'pointer', fontFamily: 'Inter,sans-serif' }}>
                    Complete
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'traders' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '16px' }}>
          {traders.map((trader, i) => (
            <div key={i} style={{ background: '#0F0F1A', border: '1px solid rgba(0,229,255,0.08)', padding: '24px', position: 'relative' }}>
              <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '2px', background: 'linear-gradient(90deg,#00E5FF,transparent)' }}></div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                <div style={{ width: '44px', height: '44px', borderRadius: '50%', background: 'rgba(0,229,255,0.08)', border: '1px solid rgba(0,229,255,0.2)', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px', fontWeight: '700', color: '#00E5FF' }}>
                  {trader.avatar_url ? <img src={trader.avatar_url} alt={trader.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : trader.name?.charAt(0)}
                </div>
                <div>
                  <div style={{ fontSize: '13px', fontWeight: '600', color: '#E8E4DC' }}>{trader.name}</div>
                  <div style={{ fontSize: '10px', color: '#00FF88' }}>+{trader.profit_percentage}% profit</div>
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '16px' }}>
                <div style={{ fontSize: '10px', color: '#8A8E99' }}>Min Capital: <span style={{ color: '#E8E4DC' }}>${trader.min_capital}</span></div>
                <div style={{ fontSize: '10px', color: '#8A8E99' }}>Active: <span style={{ color: trader.is_active ? '#00FF88' : '#FF4444' }}>{trader.is_active ? 'Yes' : 'No'}</span></div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                <div style={{ fontSize: '10px', color: '#8A8E99' }}>Subscribers:</div>
                <input
                  type="number"
                  style={{ width: '80px', background: '#111320', border: '1px solid rgba(0,229,255,0.15)', padding: '4px 8px', color: '#E8E4DC', fontFamily: 'Inter,sans-serif', fontSize: '12px', outline: 'none' }}
                  value={editSubscribers[trader.id] !== undefined ? editSubscribers[trader.id] : trader.subscribers}
                  onChange={e => setEditSubscribers({...editSubscribers, [trader.id]: Number(e.target.value)})}
                />
                <button onClick={() => handleAction('update_subscribers', { trader_id: trader.id, subscribers: editSubscribers[trader.id] || trader.subscribers })} style={{ background: 'rgba(0,229,255,0.1)', border: '1px solid rgba(0,229,255,0.2)', color: '#00E5FF', padding: '4px 10px', fontSize: '9px', fontWeight: '600', cursor: 'pointer', fontFamily: 'Inter,sans-serif' }}>
                  Save
                </button>
              </div>
              <button onClick={() => handleAction('generate_code', { trader_id: trader.id })} style={{ width: '100%', background: 'rgba(0,229,255,0.08)', border: '1px solid rgba(0,229,255,0.2)', color: '#00E5FF', padding: '8px', fontSize: '10px', fontWeight: '600', letterSpacing: '1px', textTransform: 'uppercase', cursor: 'pointer', fontFamily: 'Inter,sans-serif' }}>
                Generate Code
              </button>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'codes' && (
        <div style={{ background: '#0F0F1A', border: '1px solid rgba(0,229,255,0.08)' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '16px', padding: '12px 20px', borderBottom: '1px solid rgba(0,229,255,0.08)', fontSize: '9px', fontWeight: '700', letterSpacing: '2px', textTransform: 'uppercase', color: '#8A8E99' }}>
            <div>Code</div>
            <div>Trader</div>
            <div>Status</div>
            <div>Created</div>
          </div>
          {codes.map((code, i) => (
            <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '16px', padding: '12px 20px', borderBottom: '1px solid rgba(0,229,255,0.04)', alignItems: 'center' }}>
              <div style={{ fontFamily: 'monospace', fontSize: '13px', fontWeight: '700', color: '#00E5FF', letterSpacing: '2px' }}>{code.code}</div>
              <div style={{ fontSize: '11px', color: '#8A8E99' }}>{code.copy_traders?.name}</div>
              <div style={{ fontSize: '9px', fontWeight: '600', color: code.used ? '#FF4444' : '#00FF88', letterSpacing: '1px' }}>{code.used ? 'USED' : 'AVAILABLE'}</div>
              <div style={{ fontSize: '10px', color: '#8A8E99' }}>{new Date(code.created_at).toLocaleDateString()}</div>
            </div>
          ))}
        </div>
      )}

      {showActivate && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
          <div style={{ background: '#0F0F1A', border: '1px solid rgba(0,229,255,0.2)', padding: '40px', maxWidth: '440px', width: '100%', position: 'relative' }}>
            <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '2px', background: 'linear-gradient(90deg,#00E5FF,transparent)' }}></div>
            <h2 style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: '20px', fontWeight: '700', color: '#E8E4DC', marginBottom: '24px' }}>Activate Subscription</h2>
            <div style={{ marginBottom: '16px' }}>
              <div style={{ fontSize: '9px', fontWeight: '600', letterSpacing: '2px', textTransform: 'uppercase', color: '#8A8E99', marginBottom: '8px' }}>Target Profit ($)</div>
              <input type="number" style={{ width: '100%', background: '#111320', border: '1px solid rgba(0,229,255,0.15)', padding: '12px 16px', color: '#E8E4DC', fontFamily: 'Inter,sans-serif', fontSize: '13px', outline: 'none' }} value={activateForm.target_profit} onChange={e => setActivateForm({...activateForm, target_profit: e.target.value})} />
            </div>
            <div style={{ marginBottom: '24px' }}>
              <div style={{ fontSize: '9px', fontWeight: '600', letterSpacing: '2px', textTransform: 'uppercase', color: '#8A8E99', marginBottom: '8px' }}>End Date</div>
              <input type="datetime-local" style={{ width: '100%', background: '#111320', border: '1px solid rgba(0,229,255,0.15)', padding: '12px 16px', color: '#E8E4DC', fontFamily: 'Inter,sans-serif', fontSize: '13px', outline: 'none' }} value={activateForm.ends_at} onChange={e => setActivateForm({...activateForm, ends_at: e.target.value})} />
            </div>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button onClick={() => { setShowActivate(null); setActivateForm({}) }} style={{ flex: 1, background: 'none', border: '1px solid rgba(0,229,255,0.2)', color: '#8A8E99', padding: '12px', fontSize: '10px', fontWeight: '600', letterSpacing: '2px', textTransform: 'uppercase', cursor: 'pointer', fontFamily: 'Inter,sans-serif' }}>Cancel</button>
              <button onClick={() => handleActivate(showActivate)} disabled={!!updating} style={{ flex: 2, background: '#00E5FF', border: 'none', color: '#0A0A0F', padding: '12px', fontSize: '10px', fontWeight: '700', letterSpacing: '2px', textTransform: 'uppercase', cursor: 'pointer', fontFamily: 'Inter,sans-serif', opacity: updating ? 0.6 : 1 }}>
                {updating ? 'Activating...' : 'Activate →'}
              </button>
            </div>
          </div>
        </div>
      )}

      {showAddTrader && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
          <div style={{ background: '#0F0F1A', border: '1px solid rgba(0,229,255,0.2)', padding: '40px', maxWidth: '480px', width: '100%', position: 'relative' }}>
            <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '2px', background: 'linear-gradient(90deg,#00E5FF,transparent)' }}></div>
            <h2 style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: '20px', fontWeight: '700', color: '#E8E4DC', marginBottom: '24px' }}>Add Trader</h2>
            {[
              { label: 'Name', key: 'name' },
              { label: 'Bio', key: 'bio' },
              { label: 'Avatar URL', key: 'avatar_url' },
              { label: 'Profit %', key: 'profit_percentage' },
              { label: 'Min Capital', key: 'min_capital' },
            ].map(field => (
              <div key={field.key} style={{ marginBottom: '14px' }}>
                <div style={{ fontSize: '9px', fontWeight: '600', letterSpacing: '2px', textTransform: 'uppercase', color: '#8A8E99', marginBottom: '6px' }}>{field.label}</div>
                <input style={{ width: '100%', background: '#111320', border: '1px solid rgba(0,229,255,0.15)', padding: '10px 14px', color: '#E8E4DC', fontFamily: 'Inter,sans-serif', fontSize: '12px', outline: 'none' }} value={traderForm[field.key]} onChange={e => setTraderForm({...traderForm, [field.key]: e.target.value})} />
              </div>
            ))}
            <div style={{ display: 'flex', gap: '12px', marginTop: '20px' }}>
              <button onClick={() => setShowAddTrader(false)} style={{ flex: 1, background: 'none', border: '1px solid rgba(0,229,255,0.2)', color: '#8A8E99', padding: '12px', fontSize: '10px', fontWeight: '600', letterSpacing: '2px', textTransform: 'uppercase', cursor: 'pointer', fontFamily: 'Inter,sans-serif' }}>Cancel</button>
              <button onClick={() => { handleAction('add_trader', { trader_data: traderForm }); setShowAddTrader(false) }} style={{ flex: 2, background: '#00E5FF', border: 'none', color: '#0A0A0F', padding: '12px', fontSize: '10px', fontWeight: '700', letterSpacing: '2px', textTransform: 'uppercase', cursor: 'pointer', fontFamily: 'Inter,sans-serif' }}>
                Add Trader →
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}