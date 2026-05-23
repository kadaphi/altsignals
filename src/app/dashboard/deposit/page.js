'use client'
import { useState, useEffect } from 'react'
import { useAuth } from '@/context/AuthContext'
import { useRouter } from 'next/navigation'

export default function DepositPage() {
  const { user, updateUser } = useAuth()
  const router = useRouter()
  const [amount, setAmount] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [invoiceUrl, setInvoiceUrl] = useState('')
  const [invoiceId, setInvoiceId] = useState('')
  const [polling, setPolling] = useState(false)
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    if (params.get('status') === 'success') {
      const savedId = localStorage.getItem('as_invoice_id')
      if (savedId) {
        setInvoiceId(savedId)
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
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('as_token')}`
          },
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

  async function handleDeposit() {
    if (!amount || Number(amount) < 100) return setError('Minimum deposit is $100')
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/deposit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('as_token')}`
        },
        body: JSON.stringify({ amount: Number(amount) })
      })
      const data = await res.json()
      if (!res.ok) return setError(data.error)
      localStorage.setItem('as_invoice_id', data.invoice_id)
      setInvoiceUrl(data.invoice_url)
      window.location.href = data.invoice_url
    } catch { setError('Something went wrong') }
    finally { setLoading(false) }
  }

  return (
    <div style={{ maxWidth: '600px' }}>
      <div style={{ marginBottom: '28px' }}>
        <div style={{ fontSize: '9px', fontWeight: '600', letterSpacing: '3px', textTransform: 'uppercase', color: '#00E5FF', marginBottom: '8px' }}>Fund Account</div>
        <h1 style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: '32px', fontWeight: '700', color: '#E8E4DC' }}>Deposit</h1>
      </div>

      {success && (
        <div style={{ background: 'rgba(0,255,136,0.1)', border: '1px solid rgba(0,255,136,0.3)', padding: '20px', marginBottom: '24px', textAlign: 'center' }}>
          <div style={{ fontSize: '32px', marginBottom: '8px' }}>✓</div>
          <div style={{ fontSize: '14px', fontWeight: '600', color: '#00FF88', marginBottom: '4px' }}>Deposit Confirmed!</div>
          <div style={{ fontSize: '12px', color: '#8A8E99' }}>Your balance has been updated.</div>
        </div>
      )}

      {polling && (
        <div style={{ background: 'rgba(0,229,255,0.08)', border: '1px solid rgba(0,229,255,0.2)', padding: '20px', marginBottom: '24px', textAlign: 'center' }}>
          <div style={{ width: '32px', height: '32px', border: '2px solid rgba(0,229,255,0.2)', borderTop: '2px solid #00E5FF', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 12px' }}></div>
          <style>{`@keyframes spin{to{transform:rotate(360deg);}}`}</style>
          <div style={{ fontSize: '13px', color: '#00E5FF' }}>Confirming your payment...</div>
        </div>
      )}

      <div style={{ background: '#0F0F1A', border: '1px solid rgba(0,229,255,0.08)', padding: '32px', position: 'relative', marginBottom: '24px' }}>
        <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '2px', background: 'linear-gradient(90deg,#00E5FF,transparent)' }}></div>

        {error && <div style={{ background: 'rgba(255,68,68,0.1)', border: '1px solid rgba(255,68,68,0.3)', padding: '12px 16px', marginBottom: '20px', fontSize: '12px', color: '#FF4444' }}>{error}</div>}

        <div style={{ marginBottom: '24px' }}>
          <div style={{ fontSize: '9px', fontWeight: '600', letterSpacing: '2px', textTransform: 'uppercase', color: '#8A8E99', marginBottom: '8px' }}>Amount (USD)</div>
          <input
            style={{ width: '100%', background: '#111320', border: '1px solid rgba(0,229,255,0.15)', padding: '14px 16px', color: '#E8E4DC', fontFamily: 'Inter,sans-serif', fontSize: '18px', outline: 'none', transition: 'border-color 0.3s' }}
            placeholder="Min. $100"
            type="number"
            value={amount}
            onChange={e => { setAmount(e.target.value); setError('') }}
            onFocus={e => e.target.style.borderColor = 'rgba(0,229,255,0.5)'}
            onBlur={e => e.target.style.borderColor = 'rgba(0,229,255,0.15)'}
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '8px', marginBottom: '24px' }}>
          {[100, 500, 1000, 5000].map(v => (
            <button key={v} onClick={() => setAmount(String(v))} style={{ background: amount == v ? 'rgba(0,229,255,0.15)' : '#111320', border: `1px solid ${amount == v ? '#00E5FF' : 'rgba(0,229,255,0.12)'}`, padding: '10px', color: amount == v ? '#00E5FF' : '#8A8E99', fontSize: '12px', fontWeight: '600', cursor: 'pointer', fontFamily: 'Inter,sans-serif', transition: 'all 0.2s' }}>
              ${v.toLocaleString()}
            </button>
          ))}
        </div>

        <button
          onClick={handleDeposit}
          disabled={loading}
          style={{ width: '100%', background: '#00E5FF', border: 'none', color: '#0A0A0F', padding: '14px', fontSize: '11px', fontWeight: '700', letterSpacing: '2px', textTransform: 'uppercase', cursor: 'pointer', fontFamily: 'Inter,sans-serif', transition: 'background 0.3s', clipPath: 'polygon(8px 0%,100% 0%,calc(100% - 8px) 100%,0% 100%)', opacity: loading ? 0.6 : 1 }}
        >
          {loading ? 'Processing...' : 'Proceed to Payment →'}
        </button>
      </div>

      <div style={{ background: '#0F0F1A', border: '1px solid rgba(0,229,255,0.08)', padding: '24px' }}>
        <div style={{ fontSize: '9px', fontWeight: '600', letterSpacing: '2px', textTransform: 'uppercase', color: '#00E5FF', marginBottom: '16px' }}>Payment Info</div>
        {[
          'Payments processed via NOWPayments',
          'Supports USDT, BTC, ETH and 50+ cryptocurrencies',
          'Deposits credited within 1-3 confirmations',
          'Minimum deposit amount is $100',
        ].map((info, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
            <div style={{ width: '6px', height: '6px', background: '#00E5FF', borderRadius: '50%', flexShrink: 0 }}></div>
            <div style={{ fontSize: '12px', color: '#8A8E99' }}>{info}</div>
          </div>
        ))}
      </div>
    </div>
  )
}