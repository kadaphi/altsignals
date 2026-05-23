'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import DashboardSidebar from '@/components/dashboard/Sidebar'
import DashboardHeader from '@/components/dashboard/Header'

export default function DashboardLayout({ children }) {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/login')
    }
    if (!loading && user?.is_admin) {
      router.push('/admin')
    }
  }, [user, loading])

  if (loading || !user) {
    return (
      <div style={{
        minHeight: '100vh',
        background: '#0A0A0F',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'Inter, sans-serif'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '40px', height: '40px',
            border: '2px solid rgba(0,229,255,0.2)',
            borderTop: '2px solid #00E5FF',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 16px'
          }}></div>
          <style>{`@keyframes spin { to { transform: rotate(360deg); }}`}</style>
          <p style={{ color: '#8A8E99', fontSize: '12px', letterSpacing: '2px' }}>LOADING...</p>
        </div>
      </div>
    )
  }

  return (
    <div style={{
      height: '100vh',
      background: '#0A0A0F',
      display: 'flex',
      fontFamily: 'Inter, sans-serif',
      overflow: 'hidden'
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Space+Grotesk:wght@600;700&display=swap');
        * { margin: 0; padding: 0; box-sizing: border-box; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: #0A0A0F; }
        ::-webkit-scrollbar-thumb { background: rgba(0,229,255,0.3); border-radius: 2px; }
      `}</style>
      <DashboardSidebar />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, overflow: 'hidden' }}>
        <DashboardHeader />
        <main style={{ flex: 1, padding: '32px', overflowY: 'auto', overflowX: 'hidden' }}>
          {children}
        </main>
      </div>
    </div>
  )
}