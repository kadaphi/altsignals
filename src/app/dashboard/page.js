'use client'
import { useState, useEffect } from 'react'
import { useAuth } from '@/context/AuthContext'
import { useRouter } from 'next/navigation'

export default function DashboardPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [history, setHistory] = useState([])

  useEffect(() => {
    fetchHistory()
  }, [])

  async function fetchHistory() {
    try {
      const res = await fetch('/api/history', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('as_token')}` }
      })
      if (res.ok) {
        const data = await res.json()
        setHistory(data.history?.slice(0, 5) || [])
      }
    } catch {}
  }

  const quickActions = [
    { icon: '↑', label: 'Deposit', path: '/dashboard/deposit', color: '#00E5FF' },
    { icon: '↓', label: 'Withdraw', path: '/dashboard/withdraw', color: '#00FF88' },
    { icon: '◈', label: 'Invest', path: '/dashboard/plans', color: '#7B61FF' },
    { icon: '⟳', label: 'Copy Trade', path: '/dashboard/copy-trading', color: '#00E5FF' },
    { icon: '♛', label: 'VIP', path: '/dashboard/vip', color: '#FFD700' },
    { icon: '⚔', label: 'Challenges', path: '/dashboard/challenges', color: '#FF6B35' },
    { icon: '▦', label: 'Markets', path: '/dashboard/markets', color: '#00E5FF' },
    { icon: '📚', label: 'Courses', path: '/dashboard/courses', color: '#7B61FF' },
  ]

  return (
    <div style={{ maxWidth: '1100px' }}>
      <style>{`@keyframes spin{to{transform:rotate(360deg);}}`}</style>

      <div style={{ marginBottom: '32px' }}>
        <div style={{ fontSize: '9px', fontWeight: '600', letterSpacing: '3px', textTransform: 'uppercase', color: '#00E5FF', marginBottom: '8px' }}>Overview</div>
        <h1 style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: '32px', fontWeight: '700', color: '#E8E4DC' }}>Your Portfolio</h1>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '12px', marginBottom: '32px' }}>
        {[
          { label: 'Deposit Balance', value: `$${Number(user?.deposit_balance || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}`, sub: 'Available for trading', color: '#00E5FF' },
          { label: 'Withdrawal Balance', value: `$${Number(user?.withdrawal_balance || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}`, sub: 'Ready to withdraw', color: '#00FF88' },
          { label: 'Total Deposited', value: `$${Number(user?.total_deposited || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}`, sub: 'Lifetime deposits', color: '#E8E4DC' },
          { label: 'Total Profit', value: `$${Number(user?.total_profit || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}`, sub: 'Total earnings', color: '#00FF88' },
        ].map((stat, i) => (
          <div key={i} style={{ background: '#0F0F1A', border: '1px solid rgba(0,229,255,0.08)', padding: '20px', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '2px', background: `linear-gradient(90deg,${stat.color},transparent)` }}></div>
            <div style={{ fontSize: '9px', fontWeight: '600', letterSpacing: '2px', textTransform: 'uppercase', color: '#8A8E99', marginBottom: '8px' }}>{stat.label}</div>
            <div style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: '24px', fontWeight: '700', color: stat.color, marginBottom: '4px' }}>{stat.value}</div>
            <div style={{ fontSize: '10px', color: '#8A8E99' }}>{stat.sub}</div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div style={{ marginBottom: '32px' }}>
        <div style={{ fontSize: '9px', fontWeight: '600', letterSpacing: '3px', textTransform: 'uppercase', color: '#8A8E99', marginBottom: '16px' }}>Quick Actions</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(8,1fr)', gap: '8px' }}>
          {quickActions.map((action, i) => (
            <button key={i} onClick={() => router.push(action.path)} style={{ background: '#0F0F1A', border: '1px solid rgba(0,229,255,0.08)', padding: '16px 8px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', cursor: 'pointer', transition: 'all 0.2s', fontFamily: 'Inter,sans-serif' }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(0,229,255,0.3)'; e.currentTarget.style.background = 'rgba(0,229,255,0.04)' }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(0,229,255,0.08)'; e.currentTarget.style.background = '#0F0F1A' }}
            >
              <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: `rgba(0,229,255,0.08)`, border: `1px solid rgba(0,229,255,0.2)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px', color: action.color }}>{action.icon}</div>
              <div style={{ fontSize: '9px', fontWeight: '500', letterSpacing: '0.5px', color: '#8A8E99', textAlign: 'center' }}>{action.label}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
        <div style={{ background: '#0F0F1A', border: '1px solid rgba(0,229,255,0.08)', padding: '24px' }}>
          <div style={{ fontSize: '9px', fontWeight: '600', letterSpacing: '2px', textTransform: 'uppercase', color: '#00E5FF', marginBottom: '16px' }}>Recent Activity</div>
          {history.length === 0 ? (
            <div style={{ fontSize: '12px', color: '#8A8E99', textAlign: 'center', padding: '20px' }}>No recent activity</div>
          ) : history.map((h, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid rgba(0,229,255,0.04)' }}>
              <div>
                <div style={{ fontSize: '11px', color: '#E8E4DC', marginBottom: '2px' }}>{h.description}</div>
                <div style={{ fontSize: '9px', color: '#8A8E99' }}>{new Date(h.created_at).toLocaleDateString()}</div>
              </div>
              <div style={{ fontSize: '12px', fontWeight: '600', color: h.amount > 0 ? '#00FF88' : '#FF4444' }}>
                {h.amount > 0 ? '+' : ''}${Math.abs(h.amount).toFixed(2)}
              </div>
            </div>
          ))}
        </div>

        <div style={{ background: '#0F0F1A', border: '1px solid rgba(0,229,255,0.08)', padding: '24px' }}>
          <div style={{ fontSize: '9px', fontWeight: '600', letterSpacing: '2px', textTransform: 'uppercase', color: '#00E5FF', marginBottom: '16px' }}>Account Status</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {[
              { label: 'Account Level', value: user?.account_level || 'STARTER' },
              { label: 'Member Since', value: user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A' },
              { label: 'Email', value: user?.email || 'N/A' },
              { label: 'KYC Status', value: user?.kyc_status || 'Not Submitted' },
            ].map((item, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid rgba(0,229,255,0.04)' }}>
                <div style={{ fontSize: '11px', color: '#8A8E99' }}>{item.label}</div>
                <div style={{ fontSize: '11px', fontWeight: '500', color: '#E8E4DC' }}>{item.value}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}