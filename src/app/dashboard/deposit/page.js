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
  const [fetchingMin, setFetchingMin] = useState(true)
  const [error, setError] = useState('')
  const [step, setStep] = useState(1)
  const [minDeposit, setMinDeposit] = useState(100)

  useEffect(() => {
    fetchMinDeposit()
    const params = new URLSearchParams(window.location.search)
    const status = params.get('status')
    if (status === 'success') {
      setStep(3)
      window.history.replaceState({}, '', '/dashboard/deposit')
      checkAndCreditDeposit()
    } else if (status === 'cancelled') {
      setError('Payment was cancelled. Please try again.')
      window.history.replaceState({}, '', '/dashboard/deposit')
    }
  }, [])

  async function fetchMinDeposit() {
    try {
      const res = await fetch('/api/settings')
      if (res.ok) {
        const data = await res.json()
        setMinDeposit(Number(data.settings?.min_deposit || 100))
      }
    } catch {}
    finally { setFetchingMin(false) }
  }

  async function checkAndCreditDeposit() {
    try {
      const payment_id = localStorage.getItem('as_payment_id')
      const deposit_id = localStorage.getItem('as_deposit_id')
      if (!payment_id || !deposit_id) return

      const res = await fetch('/api/deposit/check', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('as_token')}`
        },
        body: JSON.stringify({ payment_id, deposit_id })
      })

      const data = await res.json()
      if (data.status === 'completed') {
        localStorage.removeItem('as_payment_id')
        localStorage.removeItem('as_deposit_id')
        const meRes = await fetch('/api/auth/me', {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('as_token')}` }
        })
        if (meRes.ok) {
          const meData = await meRes.json()
          updateUser(meData.user)
        }
      }
    } catch {}
  }

  async function handleDeposit() {
    const min = minDeposit || 100
    if (!amount || Number(amount) < min) return setError(`Minimum deposit amount is $${min}`)
    if (!currency) return setError('Please select a currency')
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/deposit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('as_token')}`
        },
        body: JSON.stringify({ amount: Number(amount), currency })
      })
      const data = await res.json()
      if (!res.ok) return setError(data.error)
      localStorage.setItem('as_payment_id', String(data.invoice_id))
      localStorage.setItem('as_deposit_id', data.deposit_id)
      window.location.href = data.invoice_url
    } catch { setError('Something went wrong') }
    finally { setLoading(false) }
  }

  const min = minDeposit || 100

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
        .btn { width:100%; background:#00E5FF; border:none; color:#0A0A0F; padding:14px; font-size:11px; font-weight:700; letter-spacing:2px; text-transform:uppercase; cursor:pointer; font-family:'Inter',sans-serif; clip-path:polygon(8px 0%,100% 0%,calc(100% - 8px) 100%,0% 100%); transition:background 0.3s; margin-top:8px; }
        .btn:hover { background:#33EEFF; }
        .btn:disabled { opacity:0.6; cursor:not-allowed; }
        @keyframes spin { to{transform:rotate(360deg);} }
      `}</style>

      <div style={{ marginBottom:'28px' }}>
        <div style={{ fontSize:'9px', fontWeight:'600', letterSpacing:'3px', textTransform:'uppercase', color:'#00E5FF', marginBottom:'8px' }}>Fund Account</div>
        <h1 style={{ fontFamily:"'Space Grotesk',sans-serif", fontSize:'32px', fontWeight:'700', color:'#E8E4DC' }}>Deposit</h1>
      </div>

      {step === 3 ? (
        <div style={{ background:'#0F0F1A', border:'1px solid rgba(0,255,136,0.2)', padding:'48px 32px', textAlign:'center', position:'relative' }}>
          <div style={{ position:'absolute', top:0, left:0, width:'100%', height:'2px', background:'linear-gradient(90deg,#00FF88,transparent)' }}></div>
          <div style={{ fontSize:'48px', marginBottom:'16px' }}>✅</div>
          <h2 style={{ fontFamily:"'Space Grotesk',sans-serif", fontSize:'28px', fontWeight:'700', color:'#00FF88', marginBottom:'12px' }}>Payment Submitted!</h2>
          <p style={{ fontSize:'13px', color:'#8A8E99', lineHeight:'1.8', marginBottom:'8px' }}>Your payment has been submitted successfully.</p>
          <p style={{ fontSize:'13px', color:'#8A8E99', lineHeight:'1.8', marginBottom:'28px' }}>Your balance will be credited once the blockchain confirms the transaction. This usually takes a few minutes.</p>
          <button className="btn" style={{ marginTop:'0' }} onClick={() => setStep(1)}>Make Another Deposit</button>
        </div>
      ) : (
        <div style={{ background:'#0F0F1A', border:'1px solid rgba(0,229,255,0.08)', padding:'32px', position:'relative' }}>
          <div style={{ position:'absolute', top:0, left:0, width:'100%', height:'2px', background:'linear-gradient(90deg,#00E5FF,transparent)' }}></div>

          {error && <div style={{ background:'rgba(255,68,68,0.1)', border:'1px solid rgba(255,68,68,0.3)', padding:'12px 16px', marginBottom:'20px', fontSize:'12px', color:'#FF4444' }}>{error}</div>}

          <div style={{ marginBottom:'20px' }}>
            <div style={{ fontSize:'9px', fontWeight:'600', letterSpacing:'2px', textTransform:'uppercase', color:'#8A8E99', marginBottom:'8px' }}>Amount (USD)</div>
            <div style={{ position:'relative' }}>
              <span style={{ position:'absolute', left:'16px', top:'50%', transform:'translateY(-50%)', color:'#00E5FF', fontSize:'16px' }}>$</span>
              {fetchingMin ? (
                <div style={{ background:'#111320', border:'1px solid rgba(0,229,255,0.15)', padding:'14px 16px', color:'#8A8E99', fontSize:'13px' }}>Loading...</div>
              ) : (
                <input className="dep-input" style={{ paddingLeft:'32px' }} type="number" placeholder={`Enter amount (min. $${min})`} value={amount} onChange={e => { setAmount(e.target.value); setError('') }} min={min} />
              )}
            </div>
            {!fetchingMin && (
              <div style={{ display:'flex', gap:'8px', marginTop:'10px', flexWrap:'wrap' }}>
                {[min, 500, 1000, 5000, 10000].filter((v,i,a) => a.indexOf(v) === i).map(v => (
                  <button key={v} className={`shortcut ${amount == v ? 'active' : ''}`} onClick={() => setAmount(String(v))}>
                    ${v.toLocaleString()}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div style={{ marginBottom:'20px' }}>
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

          <div style={{ background:'rgba(0,229,255,0.04)', border:'1px solid rgba(0,229,255,0.1)', padding:'16px', marginBottom:'8px' }}>
            <div style={{ fontSize:'11px', fontWeight:'600', color:'#00E5FF', marginBottom:'6px' }}>ℹ How it works</div>
            <ul style={{ fontSize:'11px', fontWeight:'300', color:'#8A8E99', lineHeight:'1.8', paddingLeft:'16px' }}>
              <li>Click the button below to proceed to our secure payment page</li>
              <li>Complete your payment on the NOWPayments platform</li>
              <li>Your balance will be credited automatically after confirmation</li>
              <li>Minimum deposit is ${min}</li>
            </ul>
          </div>

          <button className="btn" onClick={handleDeposit} disabled={loading || fetchingMin}>
            {loading ? 'Redirecting to Payment...' : 'Proceed to Payment →'}
          </button>
        </div>
      )}
    </div>
  )
}