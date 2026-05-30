'use client'
import { useState, useEffect } from 'react'

export default function AdminPage() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => { fetchStats() }, [])

  async function fetchStats() {
    try {
      const res = await fetch('/api/admin/stats', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('as_token')}` }
      })
      if (res.ok) {
        const data = await res.json()
        setStats(data)
      }
    } catch {}
    finally { setLoading(false) }
  }

  if (loading) return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', minHeight:'400px' }}>
      <div style={{ width:'36px', height:'36px', border:'2px solid rgba(0,229,255,0.2)', borderTop:'2px solid #00E5FF', borderRadius:'50%', animation:'spin 1s linear infinite' }}></div>
      <style>{`@keyframes spin{to{transform:rotate(360deg);}}`}</style>
    </div>
  )

  const statCards = [
    { label: 'Total Users', value: stats?.total_users || 0, color: '#00E5FF' },
    { label: 'Total Deposits', value: `$${Number(stats?.total_deposits || 0).toLocaleString()}`, color: '#00FF88' },
    { label: 'Pending Withdrawals', value: stats?.pending_withdrawals || 0, color: '#FFD700' },
    { label: 'Active Investments', value: stats?.active_investments || 0, color: '#7B61FF' },
    { label: 'Active Copy Trades', value: stats?.active_copy_trades || 0, color: '#00E5FF' },
    { label: 'VIP Members', value: stats?.vip_members || 0, color: '#FFD700' },
    { label: 'Challenge Enrollments', value: stats?.challenge_enrollments || 0, color: '#FF6B35' },
    { label: 'Course Purchases', value: stats?.course_purchases || 0, color: '#7B61FF' },
  ]

  return (
    <div style={{ maxWidth:'1200px' }}>
      <style>{`
        .admin-stats-grid { display:grid; grid-template-columns:repeat(4,1fr); gap:12px; margin-bottom:32px; }
        @media(max-width:768px){ .admin-stats-grid{ grid-template-columns:repeat(2,1fr) !important; } }
      `}</style>

      <div style={{ marginBottom:'32px' }}>
        <div style={{ fontSize:'9px', fontWeight:'600', letterSpacing:'3px', textTransform:'uppercase', color:'#00E5FF', marginBottom:'8px' }}>Admin Panel</div>
        <h1 style={{ fontFamily:"'Space Grotesk',sans-serif", fontSize:'28px', fontWeight:'700', color:'#E8E4DC' }}>Overview</h1>
      </div>

      <div className="admin-stats-grid">
        {statCards.map((stat, i) => (
          <div key={i} style={{ background:'#0F0F1A', border:'1px solid rgba(0,229,255,0.08)', padding:'16px', position:'relative', overflow:'hidden' }}>
            <div style={{ position:'absolute', top:0, left:0, width:'100%', height:'2px', background:`linear-gradient(90deg,${stat.color},transparent)` }}></div>
            <div style={{ fontSize:'9px', fontWeight:'600', letterSpacing:'2px', textTransform:'uppercase', color:'#8A8E99', marginBottom:'8px' }}>{stat.label}</div>
            <div style={{ fontFamily:"'Space Grotesk',sans-serif", fontSize:'22px', fontWeight:'700', color:stat.color, wordBreak:'break-all' }}>{stat.value}</div>
          </div>
        ))}
      </div>

      {stats?.recent_users && stats.recent_users.length > 0 && (
        <div style={{ background:'#0F0F1A', border:'1px solid rgba(0,229,255,0.08)', padding:'24px', overflowX:'auto' }}>
          <div style={{ fontSize:'9px', fontWeight:'600', letterSpacing:'2px', textTransform:'uppercase', color:'#00E5FF', marginBottom:'16px' }}>Recent Registrations</div>
          {stats.recent_users.map((u, i) => (
            <div key={i} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'10px 0', borderBottom:'1px solid rgba(0,229,255,0.04)', gap:'12px' }}>
              <div style={{ minWidth:0 }}>
                <div style={{ fontSize:'12px', fontWeight:'500', color:'#E8E4DC', marginBottom:'2px', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{u.full_name}</div>
                <div style={{ fontSize:'10px', color:'#8A8E99', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{u.email}</div>
              </div>
              <div style={{ fontSize:'10px', color:'#8A8E99', flexShrink:0 }}>{new Date(u.created_at).toLocaleDateString()}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
