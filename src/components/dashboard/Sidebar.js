'use client'
import { useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'

const navItems = [
  { icon: '⬡', label: 'Dashboard', path: '/dashboard' },
  { icon: '↑', label: 'Deposit', path: '/dashboard/deposit' },
  { icon: '↓', label: 'Withdraw', path: '/dashboard/withdraw' },
  { icon: '◈', label: 'Fund Plans', path: '/dashboard/plans' },
  { icon: '⟳', label: 'Copy Trading', path: '/dashboard/copy-trading' },
  { icon: '♛', label: 'VIP Membership', path: '/dashboard/vip' },
  { icon: '⚔', label: 'Challenges', path: '/dashboard/challenges' },
  { icon: '▦', label: 'Markets', path: '/dashboard/markets' },
  { icon: '📚', label: 'Courses', path: '/dashboard/courses' },
  { icon: '≡', label: 'Trade History', path: '/dashboard/history' },
  { icon: '◉', label: 'Profile', path: '/dashboard/profile' },
]

export default function DashboardSidebar() {
  const router = useRouter()
  const pathname = usePathname()
  const { user, logout } = useAuth()
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  const SidebarContent = ({ onNavigate, mobile = false }) => (
    <div style={{
      width: collapsed && !mobile ? '72px' : '240px',
      height: '100vh',
      background: '#0F0F1A',
      borderRight: '1px solid rgba(0,229,255,0.08)',
      display: 'flex',
      flexDirection: 'column',
      transition: 'width 0.3s ease',
      position: 'relative',
      zIndex: 50,
      flexShrink: 0,
      overflowX: 'hidden',
      overflowY: 'auto',
    }}>
      {/* Logo */}
      <div style={{
        padding: collapsed && !mobile ? '10px 0' : '10px 20px',
        borderBottom: '1px solid rgba(0,229,255,0.08)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: collapsed && !mobile ? 'center' : 'space-between',
        height: '72px',
        flexShrink: 0,
      }}>
        {(!collapsed || mobile) && (
          <div style={{
            fontFamily:"'Space Grotesk',sans-serif",
            fontSize:'16px',
            fontWeight:'700',
            letterSpacing:'1px',
            color:'#E8E4DC',
            paddingLeft: mobile ? '52px' : '0'
          }}>
            <span style={{ color:'#00E5FF' }}>ALT</span>SIGNALS
          </div>
        )}
        {collapsed && !mobile && (
          <div style={{ fontFamily:"'Space Grotesk',sans-serif", fontSize:'14px', fontWeight:'700', color:'#00E5FF' }}>AS</div>
        )}
        {!mobile && !collapsed && (
          <button onClick={() => setCollapsed(true)} style={{ background:'none', border:'none', color:'#8A8E99', cursor:'pointer', fontSize:'16px', padding:'4px' }}>‹</button>
        )}
        {mobile && (
          <button onClick={() => setMobileOpen(false)} style={{ background:'none', border:'none', color:'#8A8E99', cursor:'pointer', fontSize:'22px', padding:'4px', lineHeight:1 }}>×</button>
        )}
      </div>

      {collapsed && !mobile && (
        <button onClick={() => setCollapsed(false)} style={{ background:'none', border:'none', color:'#8A8E99', cursor:'pointer', fontSize:'16px', padding:'12px', textAlign:'center', flexShrink:0 }}>›</button>
      )}

      {/* Nav Items — flex:1 so it fills space, user info stays at bottom */}
      <nav style={{ flex: 1, padding:'8px 0', overflowY: 'auto' }}>
        {navItems.map((item) => {
          const isActive = pathname === item.path
          return (
            <button
              key={item.path}
              onClick={() => { router.push(item.path); if (onNavigate) onNavigate() }}
              style={{
                width:'100%', display:'flex', alignItems:'center',
                gap:'12px',
                padding: collapsed && !mobile ? '14px 0' : '14px 20px',
                justifyContent: collapsed && !mobile ? 'center' : 'flex-start',
                background: isActive ? 'rgba(0,229,255,0.08)' : 'none',
                border:'none',
                borderLeft: isActive ? '2px solid #00E5FF' : '2px solid transparent',
                cursor:'pointer', transition:'all 0.2s',
                color: isActive ? '#00E5FF' : '#8A8E99',
              }}
              onMouseEnter={e => { if (!isActive) { e.currentTarget.style.background='rgba(0,229,255,0.04)'; e.currentTarget.style.color='#E8E4DC' }}}
              onMouseLeave={e => { if (!isActive) { e.currentTarget.style.background='none'; e.currentTarget.style.color='#8A8E99' }}}
            >
              <span style={{ fontSize:'16px', flexShrink:0 }}>{item.icon}</span>
              {(!collapsed || mobile) && <span style={{ fontSize:'12px', fontWeight:'600', letterSpacing:'0.5px', whiteSpace:'nowrap' }}>{item.label}</span>}
            </button>
          )
        })}
      </nav>

      {/* User Info — pinned to bottom */}
      <div style={{
        padding: collapsed && !mobile ? '14px 0' : '14px 20px',
        borderTop:'1px solid rgba(0,229,255,0.08)',
        flexShrink: 0,
        background: '#0F0F1A',
      }}>
        {(!collapsed || mobile) && (
          <div style={{ marginBottom:'4px' }}>
  <div style={{ fontSize:'12px', fontWeight:'600', color:'#E8E4DC', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{user?.full_name}</div>
  <div style={{ fontSize:'9px', letterSpacing:'1.5px', textTransform:'uppercase', color:'#00E5FF', marginTop:'1px' }}>{user?.account_level}</div>
</div>
        )}
        <button
          onClick={logout}
          style={{ width:'100%', display:'flex', alignItems:'center', gap:'8px', justifyContent: collapsed && !mobile ? 'center' : 'flex-start', background:'none', border:'none', color:'#8A8E99', cursor:'pointer', fontSize:'12px', fontWeight:'500', letterSpacing:'1px', padding:'6px 0', transition:'color 0.2s', fontFamily:'Inter, sans-serif' }}
          onMouseEnter={e => e.currentTarget.style.color='#FF4444'}
          onMouseLeave={e => e.currentTarget.style.color='#8A8E99'}
        >
          <span style={{ fontSize:'14px' }}>⏻</span>
          {(!collapsed || mobile) && <span>Sign Out</span>}
        </button>
      </div>
    </div>
  )

  return (
    <>
      <style>{`
        .desktop-sidebar { display: flex; }
        .mobile-menu-btn { display: none !important; }
        @media (max-width: 768px) {
          .desktop-sidebar { display: none !important; }
          .mobile-menu-btn { display: flex !important; }
        }
      `}</style>

      <div className="desktop-sidebar">
        <SidebarContent />
      </div>

      {/* Hamburger — top left */}
      <button
        className="mobile-menu-btn"
        onClick={() => setMobileOpen(true)}
        style={{
          position: 'fixed', top: '14px', left: '16px',
          zIndex: 200, background: '#0F0F1A',
          border: '1px solid rgba(0,229,255,0.2)',
          width: '44px', height: '44px',
          alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer', flexDirection: 'column', gap: '5px'
        }}
      >
        <span style={{ width:'20px', height:'2px', background:'#00E5FF', display:'block' }}></span>
        <span style={{ width:'20px', height:'2px', background:'#00E5FF', display:'block' }}></span>
        <span style={{ width:'20px', height:'2px', background:'#00E5FF', display:'block' }}></span>
      </button>

      {/* Overlay — tap to close */}
      {mobileOpen && (
        <div
          style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.7)', zIndex:150 }}
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile sidebar drawer */}
      {mobileOpen && (
        <div style={{
          position: 'fixed', top:0, left:0, bottom:0,
          zIndex: 160,
          overflowY: 'auto',
          WebkitOverflowScrolling: 'touch'
        }}>
          <SidebarContent mobile={true} onNavigate={() => setMobileOpen(false)} />
        </div>
      )}
    </>
  )
}