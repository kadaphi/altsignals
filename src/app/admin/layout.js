'use client'
import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'

const navItems = [
  { label: 'Overview', path: '/admin' },
  { label: 'Users', path: '/admin/users' },
  { label: 'Withdrawals', path: '/admin/withdrawals' },
  { label: 'Investments', path: '/admin/investments' },
  { label: 'Copy Trading', path: '/admin/copy-trading' },
  { label: 'VIP', path: '/admin/vip' },
  { label: 'Challenges', path: '/admin/challenges' },
  { label: 'Courses', path: '/admin/courses' },
  { label: 'KYC', path: '/admin/kyc' },
  { label: 'Chat', path: '/admin/chat' },
  { label: 'Settings', path: '/admin/settings' },
]

export default function AdminLayout({ children }) {
  const { user, loading, logout } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    if (!loading && !user) router.push('/auth/login')
    if (!loading && user && !user.is_admin) router.push('/dashboard')
  }, [user, loading])

  if (loading || !user) return (
    <div style={{ minHeight: '100vh', background: '#0A0A0F', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ width: '36px', height: '36px', border: '2px solid rgba(0,229,255,0.2)', borderTop: '2px solid #00E5FF', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
      <style>{`@keyframes spin{to{transform:rotate(360deg);}}`}</style>
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', background: '#0A0A0F', fontFamily: 'Inter, sans-serif' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Space+Grotesk:wght@600;700&display=swap');
        * { margin:0; padding:0; box-sizing:border-box; }
        ::-webkit-scrollbar { width:4px; }
        ::-webkit-scrollbar-track { background:#0A0A0F; }
        ::-webkit-scrollbar-thumb { background:rgba(0,229,255,0.3); border-radius:2px; }
      `}</style>

      <div style={{ background: '#0F0F1A', borderBottom: '1px solid rgba(0,229,255,0.08)', padding: '0 32px', height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: '18px', fontWeight: '700' }}>
          <span style={{ color: '#00E5FF' }}>ALT</span>SIGNALS <span style={{ fontSize: '11px', color: '#8A8E99', fontWeight: '400', letterSpacing: '2px' }}>ADMIN</span>
        </div>
        <button onClick={logout} style={{ background: 'none', border: '1px solid rgba(255,68,68,0.3)', color: '#FF4444', padding: '8px 16px', fontSize: '10px', fontWeight: '600', letterSpacing: '1px', textTransform: 'uppercase', cursor: 'pointer', fontFamily: 'Inter,sans-serif' }}>
          Sign Out
        </button>
      </div>

      <div style={{ display: 'flex' }}>
        <div style={{ width: '220px', minHeight: 'calc(100vh - 60px)', background: '#0F0F1A', borderRight: '1px solid rgba(0,229,255,0.08)', padding: '20px 0', flexShrink: 0 }}>
          {navItems.map(item => (
            <button key={item.path} onClick={() => router.push(item.path)} style={{ width: '100%', display: 'flex', alignItems: 'center', padding: '12px 20px', background: pathname === item.path ? 'rgba(0,229,255,0.08)' : 'none', border: 'none', borderLeft: pathname === item.path ? '2px solid #00E5FF' : '2px solid transparent', color: pathname === item.path ? '#00E5FF' : '#8A8E99', fontSize: '11px', fontWeight: '500', letterSpacing: '0.5px', cursor: 'pointer', fontFamily: 'Inter,sans-serif', transition: 'all 0.2s', textAlign: 'left' }}
              onMouseEnter={e => { if (pathname !== item.path) { e.currentTarget.style.background = 'rgba(0,229,255,0.04)'; e.currentTarget.style.color = '#E8E4DC' }}}
              onMouseLeave={e => { if (pathname !== item.path) { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = '#8A8E99' }}}
            >
              {item.label}
            </button>
          ))}
        </div>

        <main style={{ flex: 1, padding: '32px', minHeight: 'calc(100vh - 60px)', overflowY: 'auto' }}>
          {children}
        </main>
      </div>
    </div>
  )
}