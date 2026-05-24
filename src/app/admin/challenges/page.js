'use client'
import { useState, useEffect } from 'react'

export default function AdminChallengesPage() {
  const [challenges, setChallenges] = useState([])
  const [enrollments, setEnrollments] = useState([])
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(null)
  const [activeTab, setActiveTab] = useState('enrollments')
  const [editFees, setEditFees] = useState({})
  const [savingFee, setSavingFee] = useState(null)

  useEffect(() => { fetchData() }, [])

  async function fetchData() {
    try {
      const res = await fetch('/api/admin/challenges', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('as_token')}` }
      })
      if (res.ok) {
        const data = await res.json()
        setChallenges(data.challenges || [])
        setEnrollments(data.enrollments || [])
        const fees = {}
        data.challenges?.forEach(c => { fees[c.id] = c.entry_fee })
        setEditFees(fees)
      }
    } catch {}
    finally { setLoading(false) }
  }

  async function handleUpdate(enrollment_id, status) {
    setUpdating(enrollment_id)
    try {
      await fetch('/api/admin/challenges', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('as_token')}` },
        body: JSON.stringify({ enrollment_id, status })
      })
      fetchData()
    } catch {}
    finally { setUpdating(null) }
  }

  async function handleSaveFee(challenge_id) {
    setSavingFee(challenge_id)
    try {
      await fetch('/api/admin/challenges', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('as_token')}` },
        body: JSON.stringify({ challenge_id, entry_fee: Number(editFees[challenge_id]) })
      })
      fetchData()
    } catch {}
    finally { setSavingFee(null) }
  }

  const tierColors = { 1: '#00E5FF', 2: '#00FF88', 3: '#FFD700', 4: '#FF6B35' }

  if (loading) return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', minHeight:'400px' }}>
      <div style={{ width:'36px', height:'36px', border:'2px solid rgba(0,229,255,0.2)', borderTop:'2px solid #00E5FF', borderRadius:'50%', animation:'spin 1s linear infinite' }}></div>
      <style>{`@keyframes spin{to{transform:rotate(360deg);}}`}</style>
    </div>
  )

  return (
    <div style={{ maxWidth:'1200px' }}>
      <div style={{ marginBottom:'28px' }}>
        <h1 style={{ fontFamily:"'Space Grotesk',sans-serif", fontSize:'28px', fontWeight:'700', color:'#E8E4DC' }}>Challenges</h1>
        <div style={{ fontSize:'12px', color:'#8A8E99', marginTop:'4px' }}>{enrollments.length} total enrollments</div>
      </div>

      <div style={{ display:'flex', gap:'4px', marginBottom:'24px', borderBottom:'1px solid rgba(0,229,255,0.08)' }}>
        {['enrollments', 'challenges'].map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)} style={{ background:'none', border:'none', borderBottom: activeTab === tab ? '2px solid #00E5FF' : '2px solid transparent', padding:'12px 20px', color: activeTab === tab ? '#00E5FF' : '#8A8E99', fontSize:'11px', fontWeight:'600', letterSpacing:'1.5px', textTransform:'uppercase', cursor:'pointer', fontFamily:'Inter,sans-serif', marginBottom:'-1px' }}>
            {tab}
          </button>
        ))}
      </div>

      {activeTab === 'enrollments' && (
        <div style={{ background:'#0F0F1A', border:'1px solid rgba(0,229,255,0.08)' }}>
          <div style={{ display:'grid', gridTemplateColumns:'2fr 2fr 1fr 1fr 1fr', gap:'16px', padding:'12px 20px', borderBottom:'1px solid rgba(0,229,255,0.08)', fontSize:'9px', fontWeight:'700', letterSpacing:'2px', textTransform:'uppercase', color:'#8A8E99' }}>
            <div>User</div><div>Challenge</div><div>Fee Paid</div><div>Status</div><div>Actions</div>
          </div>
          {enrollments.length === 0 ? (
            <div style={{ padding:'40px', textAlign:'center', fontSize:'13px', color:'#8A8E99' }}>No enrollments yet</div>
          ) : enrollments.map((e, i) => (
            <div key={i} style={{ display:'grid', gridTemplateColumns:'2fr 2fr 1fr 1fr 1fr', gap:'16px', padding:'14px 20px', borderBottom:'1px solid rgba(0,229,255,0.04)', alignItems:'center' }}>
              <div>
                <div style={{ fontSize:'12px', fontWeight:'500', color:'#E8E4DC' }}>{e.users?.full_name}</div>
                <div style={{ fontSize:'10px', color:'#8A8E99' }}>{e.users?.email}</div>
              </div>
              <div>
                <div style={{ fontSize:'11px', color: tierColors[e.challenges?.tier] || '#00E5FF' }}>{e.challenges?.name}</div>
                <div style={{ fontSize:'9px', color:'#8A8E99' }}>Tier {e.challenges?.tier}</div>
              </div>
              <div style={{ fontSize:'12px', color:'#E8E4DC' }}>${Number(e.entry_fee_paid).toFixed(2)}</div>
              <div style={{ fontSize:'9px', fontWeight:'600', color: e.status === 'active' ? '#00E5FF' : e.status === 'completed' ? '#00FF88' : '#FF4444', letterSpacing:'1px' }}>{e.status.toUpperCase()}</div>
              <div style={{ display:'flex', gap:'6px' }}>
                {e.status === 'active' && (
                  <>
                    <button onClick={() => handleUpdate(e.id, 'completed')} disabled={updating === e.id} style={{ background:'rgba(0,255,136,0.1)', border:'1px solid rgba(0,255,136,0.3)', color:'#00FF88', padding:'5px 8px', fontSize:'9px', fontWeight:'600', cursor:'pointer', fontFamily:'Inter,sans-serif' }}>Pass</button>
                    <button onClick={() => handleUpdate(e.id, 'failed')} disabled={updating === e.id} style={{ background:'rgba(255,68,68,0.1)', border:'1px solid rgba(255,68,68,0.3)', color:'#FF4444', padding:'5px 8px', fontSize:'9px', fontWeight:'600', cursor:'pointer', fontFamily:'Inter,sans-serif' }}>Fail</button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'challenges' && (
        <div style={{ display:'grid', gridTemplateColumns:'repeat(2,1fr)', gap:'16px' }}>
          {challenges.map((c, i) => (
            <div key={i} style={{ background:'#0F0F1A', border:'1px solid rgba(0,229,255,0.08)', padding:'24px', position:'relative' }}>
              <div style={{ position:'absolute', top:0, left:0, width:'100%', height:'2px', background:`linear-gradient(90deg,${tierColors[c.tier]||'#00E5FF'},transparent)` }}></div>
              <div style={{ fontSize:'9px', fontWeight:'700', letterSpacing:'3px', color: tierColors[c.tier] || '#00E5FF', marginBottom:'8px' }}>TIER {c.tier}</div>
              <div style={{ fontSize:'16px', fontWeight:'600', color:'#E8E4DC', marginBottom:'8px' }}>{c.name}</div>
              <div style={{ fontSize:'11px', color:'#8A8E99', lineHeight:'1.6', marginBottom:'20px' }}>{c.description}</div>
              <div style={{ display:'flex', alignItems:'center', gap:'10px' }}>
                <div style={{ fontSize:'10px', color:'#8A8E99', whiteSpace:'nowrap' }}>Entry Fee ($)</div>
                <input
                  type="number"
                  style={{ width:'100px', background:'#111320', border:'1px solid rgba(0,229,255,0.15)', padding:'8px 12px', color:'#E8E4DC', fontFamily:'Inter,sans-serif', fontSize:'13px', outline:'none' }}
                  value={editFees[c.id] ?? c.entry_fee}
                  onChange={e => setEditFees({...editFees, [c.id]: e.target.value})}
                />
                <button
                  onClick={() => handleSaveFee(c.id)}
                  disabled={savingFee === c.id}
                  style={{ background:'rgba(0,229,255,0.1)', border:'1px solid rgba(0,229,255,0.2)', color:'#00E5FF', padding:'8px 14px', fontSize:'9px', fontWeight:'600', cursor:'pointer', fontFamily:'Inter,sans-serif', opacity: savingFee === c.id ? 0.6 : 1 }}
                >
                  {savingFee === c.id ? 'Saving...' : 'Save'}
                </button>
              </div>
              <div style={{ marginTop:'12px', fontSize:'10px', color: c.is_active ? '#00FF88' : '#FF4444', fontWeight:'600' }}>
                {c.is_active ? '● ACTIVE' : '● INACTIVE'}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}