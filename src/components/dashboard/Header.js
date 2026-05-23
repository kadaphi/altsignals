'use client'
import { useState, useEffect } from 'react'
import { useAuth } from '@/context/AuthContext'
import { useRouter } from 'next/navigation'

export default function DashboardHeader() {
  const { user } = useAuth()
  const router = useRouter()
  const [notifications, setNotifications] = useState([])
  const [showNotifs, setShowNotifs] = useState(false)
  const [announcements, setAnnouncements] = useState([])

  useEffect(() => {
    fetchNotifications()
    fetchAnnouncements()
  }, [])

  async function fetchNotifications() {
    try {
      const res = await fetch('/api/notifications', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('as_token')}` }
      })
      if (res.ok) {
        const data = await res.json()
        setNotifications(data.notifications || [])
      }
    } catch {}
  }

  async function fetchAnnouncements() {
    try {
      const res = await fetch('/api/announcements', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('as_token')}` }
      })
      if (res.ok) {
        const data = await res.json()
        setAnnouncements(data.announcements || [])
      }
    } catch {}
  }

  async function markAllRead() {
    try {
      await fetch('/api/notifications/read', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('as_token')}` }
      })
      setNotifications([])
    } catch {}
  }

  const unreadCount = notifications.filter(n => !n.is_read).length
  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'

  return (
    <div style={{
      background: '#0F0F1A',
      borderBottom: '1px solid rgba(0,229,255,0.08)',
      padding: '0 32px',
      height: '72px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      flexShrink: 0,
      gap: '16px'
    }}>
      <div style={{ paddingLeft: '60px' }} className="mobile-greeting">
        <div style={{ fontSize: '11px', color: '#8A8E99', marginBottom: '2px' }}>{greeting},</div>
        <div style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: '18px', fontWeight: '600', color: '#E8E4DC' }}>{user?.full_name?.split(' ')[0]}</div>
      </div>
      <style>{`
        @media(min-width:769px){ .mobile-greeting { padding-left: 0 !important; } }
      `}</style>

      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        {/* Balances */}
        <div style={{ display: 'flex', gap: '8px' }}>
          <div onClick={() => router.push('/dashboard/deposit')} style={{ background: '#111320', border: '1px solid rgba(0,229,255,0.12)', padding: '8px 16px', cursor: 'pointer', transition: 'border-color 0.2s' }}
            onMouseEnter={e => e.currentTarget.style.borderColor='rgba(0,229,255,0.3)'}
            onMouseLeave={e => e.currentTarget.style.borderColor='rgba(0,229,255,0.12)'}
          >
            <div style={{ fontSize: '8px', letterSpacing: '1.5px', textTransform: 'uppercase', color: '#8A8E99', marginBottom: '2px' }}>Deposit</div>
            <div style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: '14px', fontWeight: '600', color: '#00E5FF' }}>
              ${Number(user?.deposit_balance || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
          </div>
          <div onClick={() => router.push('/dashboard/withdraw')} style={{ background: '#111320', border: '1px solid rgba(0,229,255,0.12)', padding: '8px 16px', cursor: 'pointer', transition: 'border-color 0.2s' }}
            onMouseEnter={e => e.currentTarget.style.borderColor='rgba(0,229,255,0.3)'}
            onMouseLeave={e => e.currentTarget.style.borderColor='rgba(0,229,255,0.12)'}
          >
            <div style={{ fontSize: '8px', letterSpacing: '1.5px', textTransform: 'uppercase', color: '#8A8E99', marginBottom: '2px' }}>Withdrawal</div>
            <div style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: '14px', fontWeight: '600', color: '#00FF88' }}>
              ${Number(user?.withdrawal_balance || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
          </div>
        </div>

        {/* Notifications */}
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => { setShowNotifs(!showNotifs); if (!showNotifs && unreadCount > 0) markAllRead() }}
            style={{ background: '#111320', border: '1px solid rgba(0,229,255,0.12)', width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', position: 'relative', color: '#8A8E99', fontSize: '16px' }}
          >
            🔔
            {unreadCount > 0 && (
              <div style={{ position: 'absolute', top: '-4px', right: '-4px', width: '18px', height: '18px', background: '#00E5FF', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '9px', fontWeight: '700', color: '#0A0A0F' }}>{unreadCount}</div>
            )}
          </button>

          {showNotifs && (
            <div style={{ position: 'absolute', top: '48px', right: 0, width: '320px', background: '#111320', border: '1px solid rgba(0,229,255,0.12)', zIndex: 100, maxHeight: '400px', overflowY: 'auto' }}>
              <div style={{ padding: '16px', borderBottom: '1px solid rgba(0,229,255,0.08)', fontSize: '10px', fontWeight: '600', letterSpacing: '2px', textTransform: 'uppercase', color: '#00E5FF' }}>Notifications</div>
              {announcements.length > 0 && announcements.map((a, i) => (
                <div key={i} style={{ padding: '12px 16px', borderBottom: '1px solid rgba(0,229,255,0.04)', background: 'rgba(0,229,255,0.03)' }}>
                  <div style={{ fontSize: '11px', fontWeight: '600', color: '#00E5FF', marginBottom: '4px' }}>📢 {a.title}</div>
                  <div style={{ fontSize: '11px', color: '#8A8E99', lineHeight: '1.6' }}>{a.message}</div>
                </div>
              ))}
              {notifications.length === 0 && announcements.length === 0 ? (
                <div style={{ padding: '24px', textAlign: 'center', fontSize: '12px', color: '#8A8E99' }}>No notifications</div>
              ) : notifications.map((n, i) => (
                <div key={i} style={{ padding: '12px 16px', borderBottom: '1px solid rgba(0,229,255,0.04)', background: n.is_read ? 'none' : 'rgba(0,229,255,0.02)' }}>
                  <div style={{ fontSize: '11px', fontWeight: '600', color: '#E8E4DC', marginBottom: '4px' }}>{n.title}</div>
                  <div style={{ fontSize: '11px', color: '#8A8E99', lineHeight: '1.6' }}>{n.message}</div>
                  <div style={{ fontSize: '9px', color: '#8A8E99', marginTop: '4px' }}>{new Date(n.created_at).toLocaleDateString()}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}