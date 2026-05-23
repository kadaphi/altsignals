'use client'
import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'

export default function CopyTradingPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [traders, setTraders] = useState([])
  const [subscription, setSubscription] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selectedTrader, setSelectedTrader] = useState(null)
  const [code, setCode] = useState('')
  const [subscribing, setSubscribing] = useState(false)
  const [showCancelConfirm, setShowCancelConfirm] = useState(false)
  const [cancelling, setCancelling] = useState(false)
  const [logs, setLogs] = useState([])
  const [liveBalance, setLiveBalance] = useState(0)
  const [candles, setCandles] = useState([])
  const logsEndRef = useRef(null)
  const simulationRef = useRef(null)
  const heartbeatRef = useRef(null)

  useEffect(() => { fetchData() }, [])

  useEffect(() => {
    if (subscription?.status === 'active') {
      fetchLogs()
      startSimulation()
      startHeartbeat()
    }
    return () => {
      if (simulationRef.current) clearInterval(simulationRef.current)
      if (heartbeatRef.current) clearInterval(heartbeatRef.current)
    }
  }, [subscription?.id])

  function generateCandle(isPositive, amount) {
    const body = Math.max(amount / 3, 8)
    const wickTop = Math.random() * 12 + 2
    const wickBottom = Math.random() * 12 + 2
    return { isPositive, body, wickTop, wickBottom }
  }

  async function fetchData() {
    try {
      const res = await fetch('/api/copy-trading', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('as_token')}` }
      })
      if (res.ok) {
        const data = await res.json()
        setTraders(data.traders || [])
        setSubscription(data.subscription || null)
        if (data.subscription?.status === 'active') {
          setLiveBalance(data.subscription.current_profit || 0)
        }
      }
    } catch {}
    finally { setLoading(false) }
  }

  async function fetchLogs() {
    try {
      const res = await fetch('/api/copy-trading/logs', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('as_token')}` }
      })
      if (res.ok) {
        const data = await res.json()
        setLogs(data.logs || [])
        if (data.subscription) setLiveBalance(data.subscription.current_profit || 0)
        const c = (data.logs || []).slice(0, 30).reverse().map(l =>
          generateCandle(l.amount > 0, Math.abs(l.amount))
        )
        setCandles(c)
      }
    } catch {}
  }

  function startHeartbeat() {
    if (heartbeatRef.current) clearInterval(heartbeatRef.current)
    heartbeatRef.current = setInterval(async () => {
      try {
        await fetch('/api/copy-trading/heartbeat', {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${localStorage.getItem('as_token')}` }
        })
      } catch {}
    }, 30000)
  }

  function startSimulation() {
    if (simulationRef.current) clearInterval(simulationRef.current)
    simulationRef.current = setInterval(async () => {
      const isPositive = Math.random() > 0.35
      const amount = (Math.random() * 200 + 10).toFixed(2)
      const description = isPositive
        ? `Profit from ${['BTC/USDT', 'ETH/USDT', 'SOL/USDT', 'BNB/USDT'][Math.floor(Math.random() * 4)]} trade`
        : `Loss on ${['XRP/USDT', 'ADA/USDT', 'DOGE/USDT', 'MATIC/USDT'][Math.floor(Math.random() * 4)]} trade`

      const newLog = {
        id: Date.now(),
        amount: isPositive ? Number(amount) : -Number(amount),
        type: isPositive ? 'profit' : 'loss',
        description,
        created_at: new Date().toISOString()
      }

      setLogs(prev => [newLog, ...prev].slice(0, 50))
      setLiveBalance(prev => prev + (isPositive ? Number(amount) : -Number(amount)))
      setCandles(prev => [...prev.slice(-29), generateCandle(isPositive, Number(amount))])

      try {
        await fetch('/api/copy-trading/logs', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('as_token')}`
          },
          body: JSON.stringify({
            amount: isPositive ? Number(amount) : -Number(amount),
            description,
            type: isPositive ? 'profit' : 'loss'
          })
        })
      } catch {}
    }, 4000)
  }

  async function handleSubscribe() {
    if (!code || code.length < 4) return setError('Please enter a valid subscription code')
    setSubscribing(true)
    setError('')
    try {
      const res = await fetch('/api/copy-trading', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('as_token')}`
        },
        body: JSON.stringify({ trader_id: selectedTrader.id, code })
      })
      const data = await res.json()
      if (data.error?.startsWith('INSUFFICIENT_BALANCE:')) { router.push('/dashboard/deposit'); return }
      if (!res.ok) return setError(data.error)
      setSelectedTrader(null)
      setCode('')
      fetchData()
    } catch { setError('Something went wrong') }
    finally { setSubscribing(false) }
  }

  async function handleCancel() {
    setCancelling(true)
    try {
      const res = await fetch('/api/copy-trading', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('as_token')}`
        },
        body: JSON.stringify({ subscription_id: subscription.id })
      })
      if (res.ok) {
        setSubscription(null)
        setShowCancelConfirm(false)
        setLogs([])
        setCandles([])
        if (simulationRef.current) clearInterval(simulationRef.current)
        if (heartbeatRef.current) clearInterval(heartbeatRef.current)
        fetchData()
      }
    } catch {}
    finally { setCancelling(false) }
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
        .trader-card { background:#0F0F1A; border:1px solid rgba(0,229,255,0.08); padding:28px; position:relative; cursor:pointer; transition:border-color 0.2s; display:flex; flex-direction:column; }
        .trader-card:hover { border-color:rgba(0,229,255,0.3); }
        .trader-card::before { content:''; position:absolute; top:0; left:0; width:100%; height:2px; background:linear-gradient(90deg,#00E5FF,transparent); }
        .log-item { display:flex; align-items:center; gap:12px; padding:10px 0; border-bottom:1px solid rgba(0,229,255,0.04); animation:fadeIn 0.3s ease; }
        @keyframes fadeIn { from{opacity:0;transform:translateX(-10px);}to{opacity:1;transform:translateX(0);} }
        @keyframes spin { to{transform:rotate(360deg);} }
        .traders-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:16px; align-items:start; }
        @media(max-width:900px){ .traders-grid{grid-template-columns:repeat(2,1fr)!important;} }
        @media(max-width:600px){ .traders-grid{grid-template-columns:1fr!important;} }
      `}</style>

      <div style={{ marginBottom: '28px' }}>
        <div style={{ fontSize: '9px', fontWeight: '600', letterSpacing: '3px', textTransform: 'uppercase', color: '#00E5FF', marginBottom: '8px' }}>Mirror Trading</div>
        <h1 style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: '32px', fontWeight: '700', color: '#E8E4DC' }}>Copy Trading</h1>
      </div>

      {error && <div style={{ background: 'rgba(255,68,68,0.1)', border: '1px solid rgba(255,68,68,0.3)', padding: '12px 16px', marginBottom: '20px', fontSize: '12px', color: '#FF4444' }}>{error}</div>}

      {subscription && (
        <div style={{ background: '#0F0F1A', border: '1px solid rgba(0,229,255,0.2)', padding: '28px', marginBottom: '32px', position: 'relative' }}>
          <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '2px', background: 'linear-gradient(90deg,#00FF88,transparent)' }}></div>

          {subscription.status === 'waiting' && (
            <div style={{ textAlign: 'center', padding: '20px 0' }}>
              <div style={{ width: '60px', height: '60px', border: '2px solid rgba(0,229,255,0.2)', borderTop: '2px solid #00E5FF', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 20px' }}></div>
              <h2 style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: '24px', fontWeight: '700', color: '#E8E4DC', marginBottom: '12px' }}>Waiting for Trader Confirmation</h2>
              <p style={{ fontSize: '13px', color: '#8A8E99', lineHeight: '1.8', maxWidth: '400px', margin: '0 auto 24px' }}>
                Your subscription to <strong style={{ color: '#00E5FF' }}>{subscription.copy_traders?.name}</strong> is being reviewed.
              </p>
              <button onClick={() => setShowCancelConfirm(true)} style={{ background: 'none', border: '1px solid rgba(255,68,68,0.3)', color: '#FF4444', padding: '10px 24px', fontSize: '10px', fontWeight: '600', letterSpacing: '2px', textTransform: 'uppercase', cursor: 'pointer', fontFamily: 'Inter,sans-serif' }}>
                Cancel Subscription
              </button>
            </div>
          )}

          {subscription.status === 'active' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
                <div>
                  <div style={{ fontSize: '9px', fontWeight: '600', letterSpacing: '3px', textTransform: 'uppercase', color: '#00FF88', marginBottom: '8px' }}>● Live Copy Trading</div>
                  <div style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: '24px', fontWeight: '700', color: '#E8E4DC' }}>Copying: {subscription.copy_traders?.name}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '9px', letterSpacing: '2px', textTransform: 'uppercase', color: '#8A8E99', marginBottom: '4px' }}>Live Profit</div>
                  <div style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: '36px', fontWeight: '700', color: liveBalance >= 0 ? '#00FF88' : '#FF4444' }}>
                    {liveBalance >= 0 ? '+' : ''}{liveBalance.toFixed(2)}
                  </div>
                </div>
              </div>

              <div style={{ background: '#0A0A0F', border: '1px solid rgba(0,229,255,0.06)', padding: '12px 16px', marginBottom: '20px', height: '120px', display: 'flex', alignItems: 'center', gap: '4px', overflow: 'hidden' }}>
                {candles.length === 0 ? (
                  <div style={{ width: '100%', textAlign: 'center', fontSize: '11px', color: '#8A8E99' }}>Waiting for trades...</div>
                ) : candles.map((candle, i) => {
                  const bodyH = Math.min(candle.body, 50)
                  const wickTopH = Math.min(candle.wickTop, 20)
                  const wickBotH = Math.min(candle.wickBottom, 20)
                  const color = candle.isPositive ? '#00FF88' : '#FF4444'
                  const colorDim = candle.isPositive ? 'rgba(0,255,136,0.3)' : 'rgba(255,68,68,0.3)'
                  return (
                    <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1, minWidth: '8px', height: '90px', justifyContent: 'center' }}>
                      <div style={{ width: '1px', height: `${wickTopH}px`, background: colorDim }}></div>
                      <div style={{ width: '80%', height: `${bodyH}px`, background: color, border: `1px solid ${color}`, minHeight: '4px' }}></div>
                      <div style={{ width: '1px', height: `${wickBotH}px`, background: colorDim }}></div>
                    </div>
                  )
                })}
              </div>

              <div style={{ background: '#0A0A0F', border: '1px solid rgba(0,229,255,0.06)', padding: '16px', maxHeight: '240px', overflowY: 'auto', marginBottom: '20px' }}>
                <div style={{ fontSize: '9px', fontWeight: '600', letterSpacing: '2px', textTransform: 'uppercase', color: '#8A8E99', marginBottom: '12px' }}>Live Trade Log</div>
                {logs.length === 0 ? (
                  <div style={{ fontSize: '12px', color: '#8A8E99', textAlign: 'center', padding: '20px' }}>Waiting for trades...</div>
                ) : logs.map((log, i) => (
                  <div key={log.id || i} className="log-item">
                    <div style={{ width: '28px', height: '28px', background: log.amount > 0 ? 'rgba(0,255,136,0.1)' : 'rgba(255,68,68,0.1)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: '12px', color: log.amount > 0 ? '#00FF88' : '#FF4444' }}>
                      {log.amount > 0 ? '↑' : '↓'}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: '11px', color: '#E8E4DC', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{log.description}</div>
                      <div style={{ fontSize: '9px', color: '#8A8E99', marginTop: '2px' }}>{new Date(log.created_at).toLocaleTimeString()}</div>
                    </div>
                    <div style={{ fontSize: '12px', fontWeight: '600', color: log.amount > 0 ? '#00FF88' : '#FF4444', flexShrink: 0 }}>
                      {log.amount > 0 ? '+' : '-'}${Math.abs(log.amount).toFixed(2)}
                    </div>
                  </div>
                ))}
                <div ref={logsEndRef} />
              </div>

              <button onClick={() => setShowCancelConfirm(true)} style={{ background: 'none', border: '1px solid rgba(255,68,68,0.3)', color: '#FF4444', padding: '10px 24px', fontSize: '10px', fontWeight: '600', letterSpacing: '2px', textTransform: 'uppercase', cursor: 'pointer', fontFamily: 'Inter,sans-serif' }}>
                Cancel Subscription
              </button>
            </div>
          )}

          {subscription.status === 'completed' && (
            <div style={{ textAlign: 'center', padding: '20px 0' }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>🎉</div>
              <h2 style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: '28px', fontWeight: '700', color: '#00FF88', marginBottom: '12px' }}>Target Reached!</h2>
              <p style={{ fontSize: '13px', color: '#8A8E99', lineHeight: '1.8', marginBottom: '8px' }}>Your copy trading target has been achieved.</p>
              <div style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: '48px', fontWeight: '700', color: '#00FF88', margin: '16px 0' }}>
                ${Number(subscription.target_profit || 0).toLocaleString()}
              </div>
              <p style={{ fontSize: '12px', color: '#8A8E99' }}>Profits have been credited to your withdrawal balance.</p>
            </div>
          )}
        </div>
      )}

      {!subscription && (
        <>
          <div style={{ fontSize: '9px', fontWeight: '600', letterSpacing: '3px', textTransform: 'uppercase', color: '#8A8E99', marginBottom: '16px' }}>Available Expert Traders</div>
          {traders.length === 0 ? (
            <div style={{ background: '#0F0F1A', border: '1px solid rgba(0,229,255,0.08)', padding: '60px', textAlign: 'center' }}>
              <div style={{ fontSize: '13px', color: '#8A8E99' }}>No traders available at the moment</div>
            </div>
          ) : (
            <div className="traders-grid">
              {traders.map((trader) => (
                <div key={trader.id} className="trader-card" onClick={() => setSelectedTrader(trader)}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '20px' }}>
                    <div style={{ width: '52px', height: '52px', background: 'rgba(0,229,255,0.08)', border: '1px solid rgba(0,229,255,0.2)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Space Grotesk',sans-serif", fontSize: '20px', fontWeight: '700', color: '#00E5FF', flexShrink: 0, overflow: 'hidden' }}>
                      {trader.avatar_url ? <img src={trader.avatar_url} alt={trader.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : trader.name?.charAt(0)}
                    </div>
                    <div>
                      <div style={{ fontSize: '14px', fontWeight: '600', color: '#E8E4DC', marginBottom: '4px' }}>{trader.name}</div>
                      <div style={{ display: 'flex', gap: '2px' }}>{'★★★★★'.split('').map((s, i) => <span key={i} style={{ color: '#00E5FF', fontSize: '12px' }}>{s}</span>)}</div>
                    </div>
                  </div>
                  {trader.bio && <p style={{ fontSize: '11px', color: '#8A8E99', lineHeight: '1.7', marginBottom: '20px', flex: 1, display: '-webkit-box', WebkitLineClamp: 4, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{trader.bio}</p>}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '12px', marginBottom: '20px' }}>
                    {[
                      { label: 'Profit', value: `+${trader.profit_percentage}%` },
                      { label: 'Min Capital', value: `$${Number(trader.min_capital).toLocaleString()}` },
                      { label: 'Subscribers', value: (trader.subscribers || 0).toLocaleString() },
                    ].map((stat, j) => (
                      <div key={j} style={{ textAlign: 'center' }}>
                        <div style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: '16px', fontWeight: '700', color: j === 0 ? '#00FF88' : '#00E5FF' }}>{stat.value}</div>
                        <div style={{ fontSize: '8px', letterSpacing: '1px', textTransform: 'uppercase', color: '#8A8E99', marginTop: '2px' }}>{stat.label}</div>
                      </div>
                    ))}
                  </div>
                  <div style={{ background: '#00E5FF', padding: '11px', textAlign: 'center', fontSize: '9px', fontWeight: '700', letterSpacing: '2px', textTransform: 'uppercase', color: '#0A0A0F', clipPath: 'polygon(6px 0%,100% 0%,calc(100% - 6px) 100%,0% 100%)' }}>
                    Copy This Trader →
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {selectedTrader && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
          <div style={{ background: '#0F0F1A', border: '1px solid rgba(0,229,255,0.2)', padding: '40px', maxWidth: '440px', width: '100%', position: 'relative' }}>
            <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '2px', background: 'linear-gradient(90deg,#00E5FF,transparent)' }}></div>
            <h2 style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: '24px', fontWeight: '700', color: '#E8E4DC', marginBottom: '8px' }}>Subscribe to {selectedTrader.name}</h2>
            <p style={{ fontSize: '12px', color: '#8A8E99', marginBottom: '28px', lineHeight: '1.6' }}>Enter your one-time subscription code to start copying this trader.</p>
            {error && <div style={{ background: 'rgba(255,68,68,0.1)', border: '1px solid rgba(255,68,68,0.3)', padding: '12px 16px', marginBottom: '16px', fontSize: '12px', color: '#FF4444' }}>{error}</div>}
            <div style={{ marginBottom: '20px' }}>
              <div style={{ fontSize: '9px', fontWeight: '600', letterSpacing: '2px', textTransform: 'uppercase', color: '#8A8E99', marginBottom: '8px' }}>Subscription Code</div>
              <input style={{ width: '100%', background: '#111320', border: '1px solid rgba(0,229,255,0.15)', padding: '14px 16px', color: '#E8E4DC', fontFamily: 'Inter,sans-serif', fontSize: '13px', outline: 'none', textTransform: 'uppercase', letterSpacing: '3px' }} placeholder="Enter code" value={code} onChange={e => { setCode(e.target.value.toUpperCase()); setError('') }} />
            </div>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button onClick={() => { setSelectedTrader(null); setCode(''); setError('') }} style={{ flex: 1, background: 'none', border: '1px solid rgba(0,229,255,0.2)', color: '#8A8E99', padding: '14px', fontSize: '10px', fontWeight: '600', letterSpacing: '2px', textTransform: 'uppercase', cursor: 'pointer', fontFamily: 'Inter,sans-serif' }}>Cancel</button>
              <button onClick={handleSubscribe} disabled={subscribing} style={{ flex: 2, background: '#00E5FF', border: 'none', color: '#0A0A0F', padding: '14px', fontSize: '10px', fontWeight: '700', letterSpacing: '2px', textTransform: 'uppercase', cursor: 'pointer', fontFamily: 'Inter,sans-serif', clipPath: 'polygon(6px 0%,100% 0%,calc(100% - 6px) 100%,0% 100%)', opacity: subscribing ? 0.6 : 1 }}>
                {subscribing ? 'Subscribing...' : 'Subscribe →'}
              </button>
            </div>
          </div>
        </div>
      )}

      {showCancelConfirm && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
          <div style={{ background: '#0F0F1A', border: '1px solid rgba(255,68,68,0.2)', padding: '40px', maxWidth: '440px', width: '100%', position: 'relative' }}>
            <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '2px', background: 'linear-gradient(90deg,#FF4444,transparent)' }}></div>
            <h2 style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: '24px', fontWeight: '700', color: '#E8E4DC', marginBottom: '8px' }}>Cancel Subscription?</h2>
            <p style={{ fontSize: '13px', color: '#8A8E99', marginBottom: '16px', lineHeight: '1.7' }}>Are you sure you want to cancel your copy trading subscription?</p>
            <div style={{ background: 'rgba(255,68,68,0.08)', border: '1px solid rgba(255,68,68,0.2)', padding: '16px', marginBottom: '24px' }}>
              <p style={{ fontSize: '12px', color: '#FF4444', lineHeight: '1.7', margin: 0 }}>⚠ Subscription fees are non-refundable. Any profits earned will be credited to your account.</p>
            </div>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button onClick={() => setShowCancelConfirm(false)} style={{ flex: 1, background: 'none', border: '1px solid rgba(0,229,255,0.2)', color: '#8A8E99', padding: '14px', fontSize: '10px', fontWeight: '600', letterSpacing: '2px', textTransform: 'uppercase', cursor: 'pointer', fontFamily: 'Inter,sans-serif' }}>Keep It</button>
              <button onClick={handleCancel} disabled={cancelling} style={{ flex: 1, background: 'rgba(255,68,68,0.1)', border: '1px solid rgba(255,68,68,0.3)', color: '#FF4444', padding: '14px', fontSize: '10px', fontWeight: '600', letterSpacing: '2px', textTransform: 'uppercase', cursor: 'pointer', fontFamily: 'Inter,sans-serif', opacity: cancelling ? 0.6 : 1 }}>
                {cancelling ? 'Cancelling...' : 'Yes, Cancel'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}