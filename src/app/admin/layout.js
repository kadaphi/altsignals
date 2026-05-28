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
  { label: 'Send Email', path: '/admin/send-email' },
  { label: 'Inbox', path: '/admin/inbox' },
]

export default function AdminLayout({ children }) {
  const { user, loading, logout } = useAuth()
  const router = useRouter()
  const pathname = usePathname()
  const [mobileNavOpen, setMobileNavOpen] = useState(false)

  useEffect(() => {
    if (!loading && !user) router.push('/auth/login')
    if (!loading && user && !user.is_admin) router.push('/dashboard')
  }, [user, loading])

  if (loading || !user) return (
    <div style={{ minHeight:'100vh', background:'#0A0A0F', display:'flex', alignItems:'center', justifyContent:'center' }}>
      <div style={{ width:'36px', height:'36px', border:'2px solid rgba(0,229,255,0.2)', borderTop:'2px solid #00E5FF', borderRadius:'50%', animation:'spin 1s linear infinite' }}></div>
      <style>{`@keyframes spin{to{transform:rotate(360deg);}}`}</style>
    </div>
  )

  return (
    <div style={{ minHeight:'100vh', background:'#0A0A0F', fontFamily:'Inter, sans-serif' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Space+Grotesk:wght@600;700&display=swap');
        * { margin:0; padding:0; box-sizing:border-box; }
        ::-webkit-scrollbar { width:4px; }
        ::-webkit-scrollbar-track { background:#0A0A0F; }
        ::-webkit-scrollbar-thumb { background:rgba(0,229,255,0.3); border-radius:2px; }
        .admin-sidebar { display:flex; }
        .admin-mobile-nav-btn { display:none; }
        @media(max-width:768px) {
          .admin-sidebar { display:none !important; }
          .admin-mobile-nav-btn { display:flex !important; }
          .admin-main { padding:16px !important; }
        }
      `}</style>

      {/* Header */}
      <div style={{ background:'#0F0F1A', borderBottom:'1px solid rgba(0,229,255,0.08)', padding:'0 20px', height:'60px', display:'flex', alignItems:'center', justifyContent:'space-between', position:'sticky', top:0, zIndex:100 }}>
        <div style={{ display:'flex', alignItems:'center', gap:'12px' }}>
          <button className="admin-mobile-nav-btn"
            onClick={() => setMobileNavOpen(!mobileNavOpen)}
            style={{ background:'none', border:'1px solid rgba(0,229,255,0.2)', color:'#00E5FF', width:'36px', height:'36px', cursor:'pointer', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:'4px' }}>
            <span style={{ width:'16px', height:'2px', background:'#00E5FF', display:'block' }}></span>
            <span style={{ width:'16px', height:'2px', background:'#00E5FF', display:'block' }}></span>
            <span style={{ width:'16px', height:'2px', background:'#00E5FF', display:'block' }}></span>
          </button>
          <div style={{ fontFamily:"'Space Grotesk',sans-serif", fontSize:'18px', fontWeight:'700' }}>
            <span style={{ color:'#00E5FF' }}>ALT</span>SIGNALS <span style={{ fontSize:'11px', color:'#8A8E99', fontWeight:'400', letterSpacing:'2px' }}>ADMIN</span>
          </div>
        </div>
        <button onClick={logout} style={{ background:'none', border:'1px solid rgba(255,68,68,0.3)', color:'#FF4444', padding:'8px 16px', fontSize:'10px', fontWeight:'600', letterSpacing:'1px', textTransform:'uppercase', cursor:'pointer', fontFamily:'Inter,sans-serif' }}>
          Sign Out
        </button>
      </div>

      <div style={{ display:'flex' }}>
        {/* Desktop Sidebar */}
        <div className="admin-sidebar" style={{ width:'220px', minHeight:'calc(100vh - 60px)', background:'#0F0F1A', borderRight:'1px solid rgba(0,229,255,0.08)', padding:'20px 0', flexShrink:0, flexDirection:'column' }}>
          {navItems.map(item => (
            <button key={item.path} onClick={() => router.push(item.path)}
              style={{ width:'100%', display:'flex', alignItems:'center', padding:'12px 20px', background: pathname === item.path ? 'rgba(0,229,255,0.08)' : 'none', border:'none', borderLeft: pathname === item.path ? '2px solid #00E5FF' : '2px solid transparent', color: pathname === item.path ? '#00E5FF' : '#8A8E99', fontSize:'11px', fontWeight:'500', letterSpacing:'0.5px', cursor:'pointer', fontFamily:'Inter,sans-serif', transition:'all 0.2s', textAlign:'left' }}
              onMouseEnter={e => { if (pathname !== item.path) { e.currentTarget.style.background='rgba(0,229,255,0.04)'; e.currentTarget.style.color='#E8E4DC' }}}
              onMouseLeave={e => { if (pathname !== item.path) { e.currentTarget.style.background='none'; e.currentTarget.style.color='#8A8E99' }}}
            >
              {item.label}
            </button>
          ))}
        </div>

        {/* Mobile Nav Overlay */}
        {mobileNavOpen && (
          <>
            <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.7)', zIndex:150 }}
              onClick={() => setMobileNavOpen(false)} />
            <div style={{ position:'fixed', top:0, left:0, bottom:0, width:'240px', background:'#0F0F1A', borderRight:'1px solid rgba(0,229,255,0.08)', zIndex:160, overflowY:'auto', paddingTop:'60px' }}>
              <div style={{ padding:'16px 20px', borderBottom:'1px solid rgba(0,229,255,0.08)', display:'flex', justifyContent:'space-between', alignItems:'center', position:'absolute', top:0, left:0, right:0 }}>
                <div style={{ fontFamily:"'Space Grotesk',sans-serif", fontSize:'14px', fontWeight:'700' }}>
                  <span style={{ color:'#00E5FF' }}>ALT</span>SIGNALS
                </div>
                <button onClick={() => setMobileNavOpen(false)} style={{ background:'none', border:'none', color:'#8A8E99', fontSize:'20px', cursor:'pointer' }}>×</button>
              </div>
              {navItems.map(item => (
                <button key={item.path} onClick={() => { router.push(item.path); setMobileNavOpen(false) }}
                  style={{ width:'100%', display:'flex', alignItems:'center', padding:'14px 20px', background: pathname === item.path ? 'rgba(0,229,255,0.08)' : 'none', border:'none', borderLeft: pathname === item.path ? '2px solid #00E5FF' : '2px solid transparent', color: pathname === item.path ? '#00E5FF' : '#8A8E99', fontSize:'12px', fontWeight:'500', cursor:'pointer', fontFamily:'Inter,sans-serif', textAlign:'left' }}>
                  {item.label}
                </button>
              ))}
            </div>
          </>
        )}

        <main className="admin-main" style={{ flex:1, padding:'32px', minHeight:'calc(100vh - 60px)', overflowY:'auto', overflowX:'hidden' }}>
          {children}
        </main>
      </div>
    </div>
  )
}
