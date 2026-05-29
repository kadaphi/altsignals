'use client'
import { useState, useEffect, useRef } from 'react'
import { useAuth } from '@/context/AuthContext'
import { useRouter } from 'next/navigation'

const CURRENCIES = [
  { id: 'usdttrc20', symbol: 'USDT TRC20', name: 'Tether TRC20', icon: '₮', color: '#26A17B' },
  { id: 'usdterc20', symbol: 'USDT ERC20', name: 'Tether ERC20', icon: '₮', color: '#26A17B' },
  { id: 'usdcbsc',   symbol: 'USDC',       name: 'USD Coin',     icon: '$', color: '#2775CA' },
  { id: 'btc',       symbol: 'BTC',        name: 'Bitcoin',      icon: '₿', color: '#F7931A' },
  { id: 'eth',       symbol: 'ETH',        name: 'Ethereum',     icon: 'Ξ', color: '#627EEA' },
  { id: 'bnbbsc',    symbol: 'BNB',        name: 'BNB Chain',    icon: 'B', color: '#F3BA2F' },
  { id: 'trx',       symbol: 'TRX',        name: 'Tron',         icon: '◈', color: '#FF0013' },
  { id: 'sol',       symbol: 'SOL',        name: 'Solana',       icon: '◎', color: '#9945FF' },
  { id: 'ltc',       symbol: 'LTC',        name: 'Litecoin',     icon: 'Ł', color: '#BFBBBB' },
  { id: 'doge',      symbol: 'DOGE',       name: 'Dogecoin',     icon: 'Ð', color: '#C2A633' },
]

// Stablecoins don't need conversion
const STABLECOINS = ['usdttrc20', 'usdterc20', 'usdcbsc']

// CoinGecko IDs for price fetch
const COINGECKO_IDS = {
  btc: 'bitcoin', eth: 'ethereum', bnbbsc: 'binancecoin',
  trx: 'tron', sol: 'solana', ltc: 'litecoin', doge: 'dogecoin'
}

export default function DepositPage() {
  const { user, updateUser } = useAuth()
  const router = useRouter()
  const [amount, setAmount] = useState('')
  const [currency, setCurrency] = useState('')
  const [loading, setLoading] = useState(false)
  const [fetchingMin, setFetchingMin] = useState(true)
  const [error, setError] = useState('')
  const [minDeposit, setMinDeposit] = useState(100)
  const [depositInfo, setDepositInfo] = useState(null)
  const [copied, setCopied] = useState(false)
  const [polling, setPolling] = useState(false)
  const [cryptoAmount, setCryptoAmount] = useState(null)
  const [fetchingPrice, setFetchingPrice] = useState(false)
  const pollRef = useRef(null)
  const priceRef = useRef(null)

  useEffect(() => {
    fetchMinDeposit()
    return () => {
      if (pollRef.current) clearInterval(pollRef.current)
      if (priceRef.current) clearTimeout(priceRef.current)
    }
  }, [])

  useEffect(() => {
    if (amount && currency && !STABLECOINS.includes(currency)) {
      if (priceRef.current) clearTimeout(priceRef.current)
      priceRef.current = setTimeout(() => fetchCryptoPrice(), 500)
    } else {
      setCryptoAmount(null)
    }
  }, [amount, currency])

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

  async function fetchCryptoPrice() {
    const geckoId = COINGECKO_IDS[currency]
    if (!geckoId || !amount || Number(amount) <= 0) return
    setFetchingPrice(true)
    try {
      const res = await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${geckoId}&vs_currencies=usd`)
      if (res.ok) {
        const data = await res.json()
        const price = data[geckoId]?.usd
        if (price) {
          const crypto = (Number(amount) / price).toFixed(6)
          setCryptoAmount({ amount: crypto, symbol: CURRENCIES.find(c => c.id === currency)?.symbol })
        }
      }
    } catch {}
    finally { setFetchingPrice(false) }
  }

  async function handleDeposit() {
    const min = minDeposit || 100
    if (!amount || Number(amount) < min) return setError(`Minimum deposit is $${min}`)
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
      setDepositInfo({ ...data, cryptoAmount })
      startPolling(data.deposit_id)
    } catch { setError('Something went wrong') }
    finally { setLoading(false) }
  }

  function startPolling(deposit_id) {
    setPolling(true)
    pollRef.current = setInterval(async () => {
      try {
        const res = await fetch('/api/deposit/check', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('as_token')}`
          },
          body: JSON.stringify({ deposit_id })
        })
        const data = await res.json()
        if (data.status === 'completed') {
          clearInterval(pollRef.current)
          setPolling(false)
          if (data.user) updateUser(data.user)
          setDepositInfo(prev => ({ ...prev, completed: true }))
        }
      } catch {}
    }, 5000)
  }

  async function copyAddress() {
    if (!depositInfo?.address) return
    await navigator.clipboard.writeText(depositInfo.address)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const min = minDeposit || 100
  const selectedCurrency = CURRENCIES.find(c => c.id === currency)

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
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.5} }
      `}</style>

      <div style={{ marginBottom:'28px' }}>
        <div style={{ fontSize:'9px', fontWeight:'600', letterSpacing:'3px', textTransform:'uppercase', color:'#00E5FF', marginBottom:'8px' }}>Fund Account</div>
        <h1 style={{ fontFamily:"'Space Grotesk',sans-serif", fontSize:'32px', fontWeight:'700', color:'#E8E4DC' }}>Deposit</h1>
      </div>

      {/* Completed */}
      {depositInfo?.completed && (
        <div style={{ background:'rgba(0,255,136,0.1)', border:'1px solid rgba(0,255,136,0.3)', padding:'32px', textAlign:'center', marginBottom:'24px', position:'relative' }}>
          <div style={{ position:'absolute', top:0, left:0, width:'100%', height:'2px', background:'linear-gradient(90deg,#00FF88,transparent)' }}></div>
          <div style={{ fontSize:'48px', marginBottom:'12px' }}>✓</div>
          <div style={{ fontFamily:"'Space Grotesk',sans-serif", fontSize:'22px', fontWeight:'700', color:'#00FF88', marginBottom:'8px' }}>Deposit Confirmed!</div>
          <div style={{ fontSize:'13px', color:'#8A8E99', marginBottom:'20px' }}>Your balance has been updated.</div>
          <button className="btn" style={{ clipPath:'none' }} onClick={() => { setDepositInfo(null); setAmount(''); setCurrency('') }}>
            Make Another Deposit
          </button>
        </div>
      )}

      {/* Address display */}
      {depositInfo && !depositInfo.completed && (
        <div style={{ background:'#0F0F1A', border:'1px solid rgba(0,229,255,0.15)', padding:'28px', marginBottom:'24px', position:'relative' }}>
          <div style={{ position:'absolute', top:0, left:0, width:'100%', height:'2px', background:'linear-gradient(90deg,#00E5FF,transparent)' }}></div>

          <div style={{ display:'flex', alignItems:'center', gap:'10px', marginBottom:'20px' }}>
            <div style={{ width:'10px', height:'10px', background:'#00FF88', borderRadius:'50%', animation:'pulse 2s infinite' }}></div>
            <div style={{ fontSize:'12px', fontWeight:'600', color:'#00FF88' }}>Waiting for payment...</div>
            {polling && <div style={{ width:'16px', height:'16px', border:'2px solid rgba(0,229,255,0.2)', borderTop:'2px solid #00E5FF', borderRadius:'50%', animation:'spin 1s linear infinite', marginLeft:'auto' }}></div>}
          </div>

          <div style={{ marginBottom:'20px' }}>
            <div style={{ fontSize:'9px', fontWeight:'600', letterSpacing:'2px', textTransform:'uppercase', color:'#8A8E99', marginBottom:'8px' }}>Amount to send</div>
            <div style={{ fontFamily:"'Space Grotesk',sans-serif", fontSize:'28px', fontWeight:'700', color:'#00E5FF' }}>
              ${Number(depositInfo.amount).toLocaleString()}
              <span style={{ fontSize:'14px', color:'#8A8E99', marginLeft:'8px' }}>USD</span>
            </div>
            {depositInfo.cryptoAmount && (
              <div style={{ fontSize:'14px', color:'#FFD700', marginTop:'6px', fontWeight:'600' }}>
                ≈ {depositInfo.cryptoAmount.amount} {depositInfo.cryptoAmount.symbol}
              </div>
            )}
          </div>

          <div style={{ marginBottom:'8px' }}>
            <div style={{ fontSize:'9px', fontWeight:'600', letterSpacing:'2px', textTransform:'uppercase', color:'#8A8E99', marginBottom:'8px' }}>
              {depositInfo.currency} ({depositInfo.network}) Address
            </div>
            <div style={{ background:'#111320', border:'1px solid rgba(0,229,255,0.2)', padding:'14px 16px', display:'flex', alignItems:'center', gap:'12px', cursor:'pointer' }}
              onClick={copyAddress}>
              <div style={{ flex:1, fontSize:'12px', color:'#00E5FF', fontFamily:'monospace', wordBreak:'break-all' }}>{depositInfo.address}</div>
              <div style={{ fontSize:'18px', flexShrink:0 }}>{copied ? '✓' : '📋'}</div>
            </div>
            <div style={{ fontSize:'10px', color: copied ? '#00FF88' : '#8A8E99', marginTop:'6px' }}>
              {copied ? '✓ Copied!' : 'Tap to copy address'}
            </div>
          </div>

          <div style={{ background:'rgba(255,68,68,0.06)', border:'1px solid rgba(255,68,68,0.15)', padding:'12px 16px', marginTop:'16px' }}>
            <div style={{ fontSize:'11px', color:'#FF6B6B', lineHeight:'1.7' }}>
              ⚠️ Only send <strong>{depositInfo.currency}</strong> on the <strong>{depositInfo.network}</strong> network. Sending other assets will result in permanent loss.
            </div>
          </div>

          <button className="btn" style={{ marginTop:'16px' }} onClick={() => { setDepositInfo(null); clearInterval(pollRef.current); setPolling(false) }}>
            ← Make a Different Deposit
          </button>
        </div>
      )}

      {/* Form */}
      {!depositInfo && (
        <div style={{ background:'#0F0F1A', border:'1px solid rgba(0,229,255,0.08)', padding:'32px', position:'relative' }}>
          <div style={{ position:'absolute', top:0, left:0, width:'100%', height:'2px', background:'linear-gradient(90deg,#00E5FF,transparent)' }}></div>

          {error && <div style={{ background:'rgba(255,68,68,0.1)', border:'1px solid rgba(255,68,68,0.3)', padding:'12px 16px', marginBottom:'20px', fontSize:'12px', color:'#FF4444' }}>{error}</div>}

          <div style={{ marginBottom:'20px' }}>
            <div style={{ fontSize:'9px', fontWeight:'600', letterSpacing:'2px', textTransform:'uppercase', color:'#8A8E99', marginBottom:'8px' }}>Amount (USD)</div>
            <div style={{ position:'relative' }}>
              <span style={{ position:'absolute', left:'16px', top:'50%', transform:'translateY(-50%)', color:'#00E5FF', fontSize:'16px' }}>$</span>
              {fetchingMin ? (
                <div style={{ background:'#111320', border:'1px solid rgba(0,229,255,0.15)', padding:'14px 16px', color:'#8A8E99' }}>Loading...</div>
              ) : (
                <input className="dep-input" style={{ paddingLeft:'32px' }} type="number"
                  placeholder={`Enter amount (min. $${min})`} value={amount}
                  onChange={e => { setAmount(e.target.value); setError('') }} min={min} />
              )}
            </div>

            {/* Crypto equivalent */}
            {currency && !STABLECOINS.includes(currency) && amount && Number(amount) > 0 && (
              <div style={{ marginTop:'8px', padding:'10px 14px', background:'rgba(255,215,0,0.06)', border:'1px solid rgba(255,215,0,0.15)', fontSize:'12px', color:'#FFD700' }}>
                {fetchingPrice ? 'Fetching price...' : cryptoAmount ? `≈ ${cryptoAmount.amount} ${cryptoAmount.symbol}` : ''}
              </div>
            )}

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
                <button key={c.id} className={`currency-btn ${currency === c.id ? 'selected' : ''}`}
                  onClick={() => { setCurrency(c.id); setError('') }}>
                  <span style={{ fontSize:'18px', color: currency === c.id ? c.color : '#8A8E99' }}>{c.icon}</span>
                  <span style={{ fontSize:'8px', fontWeight:'600', letterSpacing:'0.5px', color: currency === c.id ? '#00E5FF' : '#8A8E99', textAlign:'center' }}>{c.symbol}</span>
                </button>
              ))}
            </div>
          </div>

          <div style={{ background:'rgba(0,229,255,0.04)', border:'1px solid rgba(0,229,255,0.1)', padding:'16px', marginBottom:'8px' }}>
            <div style={{ fontSize:'11px', fontWeight:'600', color:'#00E5FF', marginBottom:'6px' }}>ℹ How it works</div>
            <ul style={{ fontSize:'11px', color:'#8A8E99', lineHeight:'1.8', paddingLeft:'16px' }}>
              <li>Select your preferred currency and enter amount</li>
              <li>A unique deposit address will be generated for you</li>
              <li>Send crypto to that address — any amount anytime</li>
              <li>Balance is credited automatically after confirmation</li>
              <li>Minimum deposit is ${min}</li>
            </ul>
          </div>

          <button className="btn" onClick={handleDeposit} disabled={loading || fetchingMin}>
            {loading ? 'Generating Address...' : 'Generate Deposit Address →'}
          </button>
        </div>
      )}
    </div>
  )
}
