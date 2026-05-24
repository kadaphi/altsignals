'use client'
import { useState, useEffect } from 'react'
import { useAuth } from '@/context/AuthContext'

const CURRENCIES = [
  { id: 'btc', symbol: 'BTC', name: 'Bitcoin', icon: '₿' },
  { id: 'eth', symbol: 'ETH', name: 'Ethereum', icon: 'Ξ' },
  { id: 'usdttrc20', symbol: 'USDT TRC20', name: 'Tether TRC20', icon: '₮' },
  { id: 'usdterc20', symbol: 'USDT ERC20', name: 'Tether ERC20', icon: '₮' },
  { id: 'trx', symbol: 'TRX', name: 'Tron', icon: '◈' },
  { id: 'bnbbsc', symbol: 'BNB', name: 'BNB Chain', icon: 'B' },
  { id: 'sol', symbol: 'SOL', name: 'Solana', icon: '◎' },
  { id: 'xrp', symbol: 'XRP', name: 'Ripple', icon: 'X' },
  { id: 'ltc', symbol: 'LTC', name: 'Litecoin', icon: 'Ł' },
  { id: 'usdcbsc', symbol: 'USDC', name: 'USD Coin', icon: '$' },
  { id: 'doge', symbol: 'DOGE', name: 'Dogecoin', icon: 'Ð' },
  { id: 'maticpolygon', symbol: 'MATIC', name: 'Polygon', icon: '⬡' },
]

export default function DepositPage() {
  const { user, updateUser } = useAuth()
  const [amount, setAmount] = useState('')
  const [currency, setCurrency] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [polling, setPolling] = useState(false)
  const [success, setSuccess] = useState(false)
  const [minDeposit, setMinDeposit] = useState(100)

  useEffect(() => {
    fetch('/api/settings')
    .then(r => r.json())
    .then(d => { if (d.settings?.min_deposit) setMinDeposit(Number(d.settings.min_deposit)) })
    .catch(() => {})

    const params = new URLSearchParams(window.location.search)
    if (params.get('status') === 'success') {
      const savedId = localStorage.getItem('as_invoice_id')
      if (savedId) {
        setPolling(true)
        pollDeposit(savedId)
      }
    }
  }, [])

  async function pollDeposit(id) {
  let attempts = 0
  const interval = setInterval(async () => {
    attempts++
    try {
      const res = await fetch('/api/deposit/check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('as_token')}` },
        body: JSON.stringify({ invoice_id: id })
      })
      const data = await res.json()
      if (data.status === 'completed') {
        clearInterval(interval)
        setPolling(false)
        setSuccess(true)
        localStorage.removeItem('as_invoice_id')
        if (data.user) updateUser(data.user)
        window.history.replaceState({}, '', '/dashboard/deposit')
        return
      }
    } catch {}
    if (attempts > 20) {
      clearInterval(interval)
      setPolling(false)
      window.history.replaceState({}, '', '/dashboard/deposit')
    }
  }, 3000)
}

  async function handleDeposit() {
    if (!amount || Number(amount) < minDeposit) return setError(`Minimum deposit is $${minDeposit}`)
    if (!currency) return setError('Please select a payment currency')
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/deposit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('as_token')}` },
        body: JSON.stringify({ amount: Number(amount), currency })
      })
      const data = await res.json()
      if (!res.ok) return setError(data.error)
      localStorage.setItem('as_invoice_id', data.invoice_id)
      window.location.href = data.invoice_url
    } catch { setError('Something went wrong') }
    finally { setLoading(false) }
  }

  return (
    <div style={{ maxWidth:'600px' }}>
      <style>{`
        .dep-input { width:100%; background:#111320; border:1px solid rgba(0,229,255,0.15); padding:14px 16px; color:#E8E4DC; font-family:'Inter',sans-serif; font-size:16px; outline:none; transition:border-color 0.3s; }
        .dep-input:focus { border-color:rgba(0,229,255,0.5); }
        .dep-input::placeholder { color:#8A8E99; }
        .currency-btn { background:#111320; border:1px solid rgba(0,229,255,0.12); padding:12px 8px; display:flex; flex-direction:column; align-items:center; gap:5px; cursor:pointer; transition:all 0.2s; }
        .currency-btn:hover { border-color:rgba(0,229,255,0.4); }
        .currency-btn.selected { border-color:#00E5FF; background:rgba(0,229,255,0.08); }
        .shortcut { background:#111320; border:1px solid rgba(0,229,255,0.12); color:#8A8E99; padding:8px 14px; font-size:11px; font-weight:600; cursor:pointer; transition:all 0.2s; font-family:'Inter',sans-serif; }
        .shortcut:hover,.shortcut.active { border-color:#00E5FF; color:#00E5FF; background:rgba(0,229,255,0.06); }
        .btn { width:100%; background:#00E5FF; border:none; color:#0A0A0F; padding:14px; font-size:11px; font-weight:700; letter-spacing:2px; text-transform:uppercase; cursor:pointer; font-family:'Inter',sans-serif; clip-path:polygon(8px 0%,100% 0%,calc(100% - 8px) 100%,0% 100%); transition:background 0.3s; }
        .btn:hover { background:#33EEFF; }
        .btn:disabled { opacity:0.6; cursor:not-allowed; }
        @keyframes spin { to{transform:rotate(360deg);} }
      `}</style>

      <div style={{ marginBottom:'28px' }}>
        <div style={{ fontSize:'9px', fontWeight:'600', letterSpacing:'3px', textTransform:'uppercase', color:'#00E5FF', marginBottom:'8px' }}>Fund Account</div>
        <h1 style={{ fontFamily:"'Space Grotesk',sans-serif", fontSize:'32px', fontWeight:'700', color:'#E8E4DC' }}>Deposit</h1>
      </div>

      {success && (
        <div style={{ background:'rgba(0,255,136,0.1)', border:'1px solid rgba(0,255,136,0.3)', padding:'20px', marginBottom:'24px', textAlign:'center' }}>
          <div style={{ fontSize:'32px', marginBottom:'8px' }}>✓</div>
          <div style={{ fontSize:'14px', fontWeight:'600', color:'#00FF88', marginBottom:'4px' }}>Deposit Confirmed!</div>
          <div style={{ fontSize:'12px', color:'#8A8E99' }}>Your balance has been updated.</div>
        </div>
      )}

      {polling && (
        <div style={{ background:'rgba(0,229,255,0.08)', border:'1px solid rgba(0,229,255,0.2)', padding:'20px', marginBottom:'24px', textAlign:'center' }}>
          <div style={{ width:'32px', height:'32px', border:'2px solid rgba(0,229,255,0.2)', borderTop:'2px solid #00E5FF', borderRadius:'50%', animation:'spin 1s linear infinite', margin:'0 auto 12px' }}></div>
          <div style={{ fontSize:'13px', color:'#00E5FF' }}>Confirming your payment...</div>
        </div>
      )}

      <div style={{ background:'#0F0F1A', border:'1px solid rgba(0,229,255,0.08)', padding:'32px', position:'relative' }}>
        <div style={{ position:'absolute', top:0, left:0, width:'100%', height:'2px', background:'linear-gradient(90deg,#00E5FF,transparent)' }}></div>

        {error && <div style={{ background:'rgba(255,68,68,0.1)', border:'1px solid rgba(255,68,68,0.3)', padding:'12px 16px', marginBottom:'20px', fontSize:'12px', color:'#FF4444' }}>{error}</div>}

        <div style={{ marginBottom:'20px' }}>
          <div style={{ fontSize:'9px', fontWeight:'600', letterSpacing:'2px', textTransform:'uppercase', color:'#8A8E99', marginBottom:'8px' }}>Amount (USD)</div>
          <div style={{ position:'relative' }}>
            <span style={{ position:'absolute', left:'16px', top:'50%', transform:'translateY(-50%)', color:'#00E5FF', fontSize:'16px' }}>$</span>
            <input className="dep-input" style={{ paddingLeft:'32px' }} type="number" placeholder={`Min. $${minDeposit}`} value={amount} onChange={e => { setAmount(e.target.value); setError('') }} />
          </div>
          <div style={{ display:'flex', gap:'8px', marginTop:'10px', flexWrap:'wrap' }}>
            {[minDeposit, 500, 1000, 5000, 10000].filter((v,i,a) => a.indexOf(v) === i).map(v => (
              <button key={v} className={`shortcut ${amount == v ? 'active' : ''}`} onClick={() => setAmount(String(v))}>
                ${v.toLocaleString()}
              </button>
            ))}
          </div>
        </div>

        <div style={{ marginBottom:'28px' }}>
          <div style={{ fontSize:'9px', fontWeight:'600', letterSpacing:'2px', textTransform:'uppercase', color:'#8A8E99', marginBottom:'8px' }}>Select Currency</div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:'8px' }}>
            {CURRENCIES.map(c => (
              <button key={c.id} className={`currency-btn ${currency === c.id ? 'selected' : ''}`} onClick={() => { setCurrency(c.id); setError('') }}>
                <span style={{ fontSize:'18px', color: currency === c.id ? '#00E5FF' : '#8A8E99' }}>{c.icon}</span>
                <span style={{ fontSize:'9px', fontWeight:'600', letterSpacing:'1px', color: currency === c.id ? '#00E5FF' : '#8A8E99' }}>{c.symbol}</span>
              </button>
            ))}
          </div>
        </div>

        <button className="btn" onClick={handleDeposit} disabled={loading}>
          {loading ? 'Redirecting to Payment...' : 'Proceed to Payment →'}
        </button>
      </div>

      <div style={{ background:'#0F0F1A', border:'1px solid rgba(0,229,255,0.08)', padding:'20px', marginTop:'16px' }}>
        <div style={{ fontSize:'9px', fontWeight:'600', letterSpacing:'2px', textTransform:'uppercase', color:'#00E5FF', marginBottom:'12px' }}>Payment Info</div>
        {[
          `Minimum deposit is $${minDeposit}`,
          'Payments processed securely via NOWPayments',
          'Select your preferred cryptocurrency above',
          'You will be redirected to complete payment',
          'Balance credited after network confirmation',
        ].map((info, i) => (
          <div key={i} style={{ display:'flex', alignItems:'center', gap:'10px', marginBottom:'8px' }}>
            <div style={{ width:'5px', height:'5px', background:'#00E5FF', borderRadius:'50%', flexShrink:0 }}></div>
            <div style={{ fontSize:'12px', color:'#8A8E99' }}>{info}</div>
          </div>
        ))}
      </div>
    </div>
  )
}