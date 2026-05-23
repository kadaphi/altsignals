'use client'
import { useState, useEffect } from 'react'
import { useAuth } from '@/context/AuthContext'

export default function WithdrawPage() {
  const { user } = useAuth()
  const [form, setForm] = useState({ amount: '', wallet_address: '', network: 'USDT TRC20' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [withdrawals, setWithdrawals] = useState([])

  useEffect(() => { fetchWithdrawals() }, [])

  async function fetchWithdrawals() {
    try {
      const res = await fetch('/api/withdraw', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('as_token')}` }
      })
      if (res.ok) {
        const data = await res.json()
        setWithdrawals(data.withdrawals || [])
      }
    } catch {}
  }

  async function handleWithdraw() {
    if (!form.amount || Number(form.amount) < 10) return setError('Minimum withdrawal is $10')
    if (!form.wallet_address) return setError('Wallet address is required')
    if (user.withdrawal_balance < Number(form.amount)) return setError('Insufficient withdrawal balance')
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/withdraw', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('as_token')}`
        },
        body: JSON.stringify({ amount: Number(form.amount), wallet_address: form.wallet_address, network: form.network })
      })
      const data = await res.json()
      if (!res.ok) return setError(data.error)
      setSuccess(true)
      setForm({ amount: '', wallet_address: '', network: 'USDT TRC20' })
      fetchWithdrawals()
    } catch { setError('Something went wrong') }
    finally { setLoading(false) }
  }

  const networks = ['USDT TRC20', 'USDT ERC20', 'BTC', 'ETH', 'BNB']

  return (
    <div style={{ maxWidth: '700px' }}>
      <div style={{ marginBottom: '28px' }}>
        <div style={{ fontSize: '9px', fontWeight: '600', letterSpacing: '3px', textTransform: 'uppercase', color: '#00E5FF', marginBottom: '8px' }}>Cash Out</div>
        <h1 style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: '32px', fontWeight: '700', color: '#E8E4DC' }}>Withdraw</h1>
      </div>

      <div style={{ background: '#0F0F1A', border: '1px solid rgba(0,229,255,0.08)', padding: '20px', marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div style={{ fontSize: '9px', fontWeight: '600', letterSpacing: '2px', textTransform: 'uppercase', color: '#8A8E99', marginBottom: '4px' }}>Available Balance</div>
          <div style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: '28px', fontWeight: '700', color: '#00FF88' }}>
            ${Number(user?.withdrawal_balance || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </div>
        </div>
        <div style={{ fontSize: '9px', color: '#8A8E99', textAlign: 'right' }}>
          <div>Min. withdrawal: $10</div>
          <div style={{ marginTop: '4px' }}>Processing: 1-24 hours</div>
        </div>
      </div>

      {success && (
        <div style={{ background: 'rgba(0,255,136,0.1)', border: '1px solid rgba(0,255,136,0.3)', padding: '16px', marginBottom: '24px', fontSize: '13px', color: '#00FF88' }}>
          Withdrawal request submitted successfully. Processing within 1-24 hours.
        </div>
      )}

      <div style={{ background: '#0F0F1A', border: '1px solid rgba(0,229,255,0.08)', padding: '32px', position: 'relative', marginBottom: '24px' }}>
        <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '2px', background: 'linear-gradient(90deg,#00E5FF,transparent)' }}></div>

        {error && <div style={{ background: 'rgba(255,68,68,0.1)', border: '1px solid rgba(255,68,68,0.3)', padding: '12px 16px', marginBottom: '20px', fontSize: '12px', color: '#FF4444' }}>{error}</div>}

        <div style={{ marginBottom: '16px' }}>
          <div style={{ fontSize: '9px', fontWeight: '600', letterSpacing: '2px', textTransform: 'uppercase', color: '#8A8E99', marginBottom: '8px' }}>Amount (USD)</div>
          <input
            style={{ width: '100%', background: '#111320', border: '1px solid rgba(0,229,255,0.15)', padding: '14px 16px', color: '#E8E4DC', fontFamily: 'Inter,sans-serif', fontSize: '16px', outline: 'none' }}
            placeholder="Enter amount"
            type="number"
            value={form.amount}
            onChange={e => { setForm({...form, amount: e.target.value}); setError(''); setSuccess(false) }}
          />
        </div>

        <div style={{ marginBottom: '16px' }}>
          <div style={{ fontSize: '9px', fontWeight: '600', letterSpacing: '2px', textTransform: 'uppercase', color: '#8A8E99', marginBottom: '8px' }}>Network</div>
          <select
            style={{ width: '100%', background: '#111320', border: '1px solid rgba(0,229,255,0.15)', padding: '14px 16px', color: '#E8E4DC', fontFamily: 'Inter,sans-serif', fontSize: '13px', outline: 'none' }}
            value={form.network}
            onChange={e => setForm({...form, network: e.target.value})}
          >
            {networks.map(n => <option key={n} value={n}>{n}</option>)}
          </select>
        </div>

        <div style={{ marginBottom: '28px' }}>
          <div style={{ fontSize: '9px', fontWeight: '600', letterSpacing: '2px', textTransform: 'uppercase', color: '#8A8E99', marginBottom: '8px' }}>Wallet Address</div>
          <input
            style={{ width: '100%', background: '#111320', border: '1px solid rgba(0,229,255,0.15)', padding: '14px 16px', color: '#E8E4DC', fontFamily: 'Inter,sans-serif', fontSize: '13px', outline: 'none' }}
            placeholder="Enter your wallet address"
            value={form.wallet_address}
            onChange={e => { setForm({...form, wallet_address: e.target.value}); setError('') }}
          />
        </div>

        <button
          onClick={handleWithdraw}
          disabled={loading}
          style={{ width: '100%', background: '#00E5FF', border: 'none', color: '#0A0A0F', padding: '14px', fontSize: '11px', fontWeight: '700', letterSpacing: '2px', textTransform: 'uppercase', cursor: 'pointer', fontFamily: 'Inter,sans-serif', clipPath: 'polygon(8px 0%,100% 0%,calc(100% - 8px) 100%,0% 100%)', opacity: loading ? 0.6 : 1 }}
        >
          {loading ? 'Processing...' : 'Submit Withdrawal →'}
        </button>
      </div>

      {withdrawals.length > 0 && (
        <div style={{ background: '#0F0F1A', border: '1px solid rgba(0,229,255,0.08)', padding: '24px' }}>
          <div style={{ fontSize: '9px', fontWeight: '600', letterSpacing: '2px', textTransform: 'uppercase', color: '#00E5FF', marginBottom: '16px' }}>Withdrawal History</div>
          {withdrawals.map((w, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid rgba(0,229,255,0.04)' }}>
              <div>
                <div style={{ fontSize: '11px', color: '#E8E4DC', marginBottom: '2px' }}>{w.network}</div>
                <div style={{ fontSize: '9px', color: '#8A8E99' }}>{new Date(w.created_at).toLocaleDateString()}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '13px', fontWeight: '600', color: '#E8E4DC', marginBottom: '2px' }}>${Number(w.amount).toFixed(2)}</div>
                <div style={{ fontSize: '9px', color: w.status === 'completed' ? '#00FF88' : w.status === 'rejected' ? '#FF4444' : '#FFD700', textTransform: 'uppercase', letterSpacing: '1px' }}>{w.status}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}