'use client'
import { useState, useEffect } from 'react'
import { useAuth } from '@/context/AuthContext'
import { useRouter } from 'next/navigation'

const CURRENCIES = [
  { id: 'btc', name: 'Bitcoin', symbol: 'BTC', icon: '₿' },
  { id: 'eth', name: 'Ethereum', symbol: 'ETH', icon: 'Ξ' },
  { id: 'usdttrc20', name: 'Tether TRC20', symbol: 'USDT TRC20', icon: '₮' },
  { id: 'usdterc20', name: 'Tether ERC20', symbol: 'USDT ERC20', icon: '₮' },
  { id: 'trx', name: 'Tron', symbol: 'TRX', icon: '◈' },
  { id: 'bnbbsc', name: 'BNB', symbol: 'BNB', icon: 'B' },
  { id: 'sol', name: 'Solana', symbol: 'SOL', icon: '◎' },
  { id: 'xrp', name: 'XRP', symbol: 'XRP', icon: 'X' },
  { id: 'ltc', name: 'Litecoin', symbol: 'LTC', icon: 'Ł' },
  { id: 'usdcbsc', name: 'USDC', symbol: 'USDC', icon: '$' },
  { id: 'doge', name: 'Dogecoin', symbol: 'DOGE', icon: 'Ð' },
  { id: 'maticpolygon', name: 'Polygon', symbol: 'MATIC', icon: '⬡' },
]

export default function DepositPage() {
  const { user, updateUser } = useAuth()
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [amount, setAmount] = useState('')
  const [currency, setCurrency] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [payment, setPayment] = useState(null)
  const [copied, setCopied] = useState(false)
  const [polling, setPolling] = useState(false)
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    if (params.get('status') === 'success') {
      const savedId = localStorage.getItem('as_invoice_id')
      if (savedId) { setPolling(true); pollDeposit(savedId) }
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
        }
      } catch {}
      if (attempts > 20) clearInterval(interval)
    }, 3000)
  }

  async function handleProceed() {
    if (!amount || Number(amount) < 100) return setError('Minimum deposit is $100')
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
      localStorage.setItem('as_invoice_id', data.invoice_id || data.payment_id)
      if (data.invoice_url) {
        window.location.href = data.invoice_url
      } else {
        setPayment(data)
        setStep(3)
      }
    } catch { setError('Something went wrong') }
    finally { setLoading(false) }
  }

  function copyAddress() {
    navigator.clipboard.writeText(payment?.pay_address)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div style={{ maxWidth: '640px' }}>
      <style>{`
        .dep-input { width:100%; background:#111320; border:1px solid rgba(0,229,255,0.15); padding:14px 16px; color:#E8E4DC; font-family:'Inter',sans-serif; font-size:16px; outline:none; transition:border-color 0.3s; }
        .dep-input:focus { border-color:rgba(0,229,255,0.5); }
        .dep-input::placeholder { color:#8A8E99; }
        .currency-btn { background:#111320; border:1px solid rgba(0,229,255,0.12); padding:14px 10px; display:flex; flex-direction:column; align-items:center; gap:6px; cursor:pointer; transition:all 0.2s; }
        .currency-btn:hover { border-color:rgba(0,229,255,0.4); }
        .currency-btn.selected { border-color:#00E5FF; background:rgba(0,229,255,0.08); }
        .shortcut { background:#111320; border:1px solid rgba(0,229,255,0.12); color:#8A8E99; padding:8px 16px; font-size:11px; font-weight:600; cursor:pointer; transition:all 0.2s; font-family:'Inter',sans-serif; }
        .shortcut:hover { border-color:rgba(0,229,255,0.4); color:#00E5FF; }
        .shortcut.active { border-color:#00E5FF; color:#00E5FF; background:rgba(0,229,255,0.08); }
        .btn { background:#00E5FF; border:none; color:#0A0A0F; padding:14px 32px; font-size:11px; font-weight:700; letter-spacing:2px; text-transform:uppercase; cursor:pointer; font-family:'Inter',sans-serif; clip-path:polygon(8px 0%,100% 0%,calc(100% - 8px) 100%,0% 100%); transition:background 0.3s; }
        .btn:hover { background:#33EEFF; }
        .btn:disabled { opacity:0.6; cursor:not-allowed; }
        .step-indicator { display:flex; gap:8px; margin-bottom:32px; }
        .step { flex:1; height:3px; border-radius:2px; }
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
          <style>{`@keyframes spin{to{transform:rotate(360deg);}}`}</style>
          <div style={{ fontSize:'13px', color:'#00E5FF' }}>Confirming your payment...</div>
        </div>
      )}

      {/* Step indicators */}
      <div className="step-indicator">
        {[1,2,3].map(s => (
          <div key={s} className="step" style={{ background: step >= s ? '#00E5FF' : 'rgba(0,229,255,0.12)' }}></div>
        ))}
      </div>

      <div style={{ background:'#0F0F1A', border:'1px solid rgba(0,229,255,0.08)', padding:'32px', position:'relative' }}>
        <div style={{ position:'absolute', top:0, left:0, width:'100%', height:'2px', background:'linear-gradient(90deg,#00E5FF,transparent)' }}></div>

        {error && <div style={{ background:'rgba(255,68,68,0.1)', border:'1px solid rgba(255,68,68,0.3)', padding:'12px 16px', marginBottom:'20px', fontSize:'12px', color:'#FF4444' }}>{error}</div>}

        {/* Step 1 — Amount */}
        {step === 1 && (
          <>
            <div style={{ fontSize:'9px', fontWeight:'700', letterSpacing:'3px', textTransform:'uppercase', color:'#00E5FF', marginBottom:'20px' }}>Step 1 — Enter Amount</div>
            <div style={{ marginBottom:'16px' }}>
              <div style={{ fontSize:'9px', fontWeight:'600', letterSpacing:'2px', textTransform:'uppercase', color:'#8A8E99', marginBottom:'8px' }}>Amount (USD)</div>
              <input className="dep-input" type="number" placeholder="Min. $100" value={amount} onChange={e => { setAmount(e.target.value); setError('') }} />
            </div>
            <div style={{ display:'flex', gap:'8px', marginBottom:'28px', flexWrap:'wrap' }}>
              {[100, 500, 1000, 5000, 10000].map(v => (
                <button key={v} className={`shortcut ${amount == v ? 'active' : ''}`} onClick={() => setAmount(String(v))}>
                  ${v.toLocaleString()}
                </button>
              ))}
            </div>
            <button className="btn" onClick={() => {
              if (!amount || Number(amount) < 100) return setError('Minimum deposit is $100')
              setError(''); setStep(2)
            }}>
              Continue →
            </button>
          </>
        )}

        {/* Step 2 — Currency */}
        {step === 2 && (
          <>
            <div style={{ fontSize:'9px', fontWeight:'700', letterSpacing:'3px', textTransform:'uppercase', color:'#00E5FF', marginBottom:'8px' }}>Step 2 — Select Currency</div>
            <div style={{ fontSize:'13px', color:'#8A8E99', marginBottom:'20px' }}>
              Depositing: <span style={{ color:'#E8E4DC', fontWeight:'600' }}>${Number(amount).toLocaleString()}</span>
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:'8px', marginBottom:'24px' }}>
              {CURRENCIES.map(c => (
                <button key={c.id} className={`currency-btn ${currency === c.id ? 'selected' : ''}`} onClick={() => { setCurrency(c.id); setError('') }}>
                  <span style={{ fontSize:'20px', color:'#00E5FF' }}>{c.icon}</span>
                  <span style={{ fontSize:'9px', fontWeight:'600', letterSpacing:'1px', color: currency === c.id ? '#00E5FF' : '#8A8E99' }}>{c.symbol}</span>
                </button>
              ))}
            </div>
            <div style={{ display:'flex', gap:'12px' }}>
              <button onClick={() => setStep(1)} style={{ flex:1, background:'none', border:'1px solid rgba(0,229,255,0.2)', color:'#8A8E99', padding:'14px', fontSize:'10px', fontWeight:'600', letterSpacing:'2px', textTransform:'uppercase', cursor:'pointer', fontFamily:'Inter,sans-serif' }}>Back</button>
              <button className="btn" style={{ flex:2 }} onClick={handleProceed} disabled={loading}>
                {loading ? 'Processing...' : 'Generate Address →'}
              </button>
            </div>
          </>
        )}

        {/* Step 3 — Payment address */}
        {step === 3 && payment && (
          <>
            <div style={{ fontSize:'9px', fontWeight:'700', letterSpacing:'3px', textTransform:'uppercase', color:'#00E5FF', marginBottom:'20px' }}>Step 3 — Send Payment</div>
            <div style={{ textAlign:'center', paddingBottom:'24px', borderBottom:'1px solid rgba(0,229,255,0.08)', marginBottom:'24px' }}>
              <div style={{ fontFamily:"'Space Grotesk',sans-serif", fontSize:'44px', fontWeight:'700', color:'#00E5FF', lineHeight:'1' }}>${Number(amount).toLocaleString()}</div>
              <div style={{ fontSize:'11px', fontWeight:'500', letterSpacing:'2px', textTransform:'uppercase', color:'#8A8E99', marginTop:'8px' }}>
                Send exactly {payment?.pay_amount} {payment?.pay_currency?.toUpperCase()}
              </div>
            </div>
            <div style={{ marginBottom:'20px' }}>
              <div style={{ fontSize:'9px', fontWeight:'600', letterSpacing:'2px', textTransform:'uppercase', color:'#8A8E99', marginBottom:'8px' }}>Payment Address</div>
              <div style={{ background:'#111320', border:'1px solid rgba(0,229,255,0.2)', padding:'16px', display:'flex', alignItems:'center', justifyContent:'space-between', gap:'12px' }}>
                <span style={{ fontSize:'11px', color:'#00E5FF', wordBreak:'break-all', fontFamily:'monospace' }}>{payment?.pay_address}</span>
                <button onClick={copyAddress} style={{ background:'rgba(0,229,255,0.1)', border:'1px solid rgba(0,229,255,0.3)', color:'#00E5FF', padding:'8px 16px', fontSize:'10px', fontWeight:'600', cursor:'pointer', whiteSpace:'nowrap', fontFamily:'Inter,sans-serif' }}>
                  {copied ? 'Copied!' : 'Copy'}
                </button>
              </div>
            </div>
            <div style={{ background:'rgba(0,229,255,0.04)', border:'1px solid rgba(0,229,255,0.12)', padding:'16px', marginBottom:'24px' }}>
              <div style={{ fontSize:'11px', fontWeight:'600', color:'#00E5FF', marginBottom:'8px' }}>⚠ Important</div>
              <ul style={{ fontSize:'11px', fontWeight:'300', color:'#8A8E99', lineHeight:'1.8', paddingLeft:'16px' }}>
                <li>Send only {payment?.pay_currency?.toUpperCase()} to this address</li>
                <li>Balance credited after network confirmation</li>
                <li>This address expires in 60 minutes</li>
                <li>Minimum deposit is $100</li>
              </ul>
            </div>
            <button className="btn" onClick={() => { setStep(1); setAmount(''); setCurrency(''); setPayment(null) }}>
              Make Another Deposit
            </button>
          </>
        )}
      </div>
    </div>
  )
}