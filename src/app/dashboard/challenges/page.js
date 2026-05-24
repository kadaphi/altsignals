'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'

export default function ChallengesPage() {
  const { user, updateUser } = useAuth()
  const router = useRouter()
  const [challenges, setChallenges] = useState([])
  const [enrollments, setEnrollments] = useState([])
  const [loading, setLoading] = useState(true)
  const [purchasing, setPurchasing] = useState(null)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => { fetchChallenges() }, [])

  async function fetchChallenges() {
    try {
      const res = await fetch('/api/challenges', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('as_token')}` }
      })
      if (res.ok) {
        const data = await res.json()
        setChallenges(data.challenges || [])
        setEnrollments(data.enrollments || [])
      }
    } catch {}
    finally { setLoading(false) }
  }

  async function handleEnroll(challenge_id) {
    setPurchasing(challenge_id)
    setError('')
    setSuccess('')
    try {
      const res = await fetch('/api/challenges', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('as_token')}` },
        body: JSON.stringify({ challenge_id })
      })
      const data = await res.json()
      if (data.error === 'INSUFFICIENT_BALANCE') { router.push('/dashboard/deposit'); return }
      if (!res.ok) return setError(data.error)
      setSuccess('Successfully enrolled in challenge!')
      fetchChallenges()
    } catch { setError('Something went wrong') }
    finally { setPurchasing(null) }
  }

  if (loading) return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', minHeight:'400px' }}>
      <div style={{ width:'36px', height:'36px', border:'2px solid rgba(0,229,255,0.2)', borderTop:'2px solid #00E5FF', borderRadius:'50%', animation:'spin 1s linear infinite' }}></div>
      <style>{`@keyframes spin{to{transform:rotate(360deg);}}`}</style>
    </div>
  )

  const tierColors = { 1:'#00E5FF', 2:'#00FF88', 3:'#FFD700', 4:'#FF6B35' }

  return (
    <div style={{ maxWidth:'1100px' }}>
      <style>{`@keyframes spin{to{transform:rotate(360deg);}}`}</style>
      <div style={{ marginBottom:'28px' }}>
        <div style={{ fontSize:'9px', fontWeight:'600', letterSpacing:'3px', textTransform:'uppercase', color:'#00E5FF', marginBottom:'8px' }}>Compete & Win</div>
        <h1 style={{ fontFamily:"'Space Grotesk',sans-serif", fontSize:'32px', fontWeight:'700', color:'#E8E4DC' }}>Trading Challenges</h1>
      </div>

      {error && <div style={{ background:'rgba(255,68,68,0.1)', border:'1px solid rgba(255,68,68,0.3)', padding:'12px 16px', marginBottom:'20px', fontSize:'12px', color:'#FF4444' }}>{error}</div>}
      {success && <div style={{ background:'rgba(0,255,136,0.1)', border:'1px solid rgba(0,255,136,0.3)', padding:'12px 16px', marginBottom:'20px', fontSize:'12px', color:'#00FF88' }}>{success}</div>}

      <div style={{ display:'grid', gridTemplateColumns:'repeat(2,1fr)', gap:'16px', marginBottom:'40px' }}>
        {challenges.map((challenge) => {
          const enrolled = enrollments.find(e => e.challenge_id === challenge.id)
          const color = tierColors[challenge.tier] || '#00E5FF'
          return (
            <div key={challenge.id} style={{ background:'#0F0F1A', border:'1px solid rgba(0,229,255,0.08)', padding:'32px', position:'relative' }}>
              <div style={{ position:'absolute', top:0, left:0, width:'100%', height:'2px', background:`linear-gradient(90deg,${color},transparent)` }}></div>
              <div style={{ fontSize:'9px', fontWeight:'700', letterSpacing:'3px', textTransform:'uppercase', color, marginBottom:'8px' }}>TIER {challenge.tier}</div>
              <div style={{ fontFamily:"'Space Grotesk',sans-serif", fontSize:'22px', fontWeight:'700', color:'#E8E4DC', marginBottom:'8px' }}>{challenge.name}</div>
              <p style={{ fontSize:'12px', color:'#8A8E99', lineHeight:'1.8', marginBottom:'20px' }}>{challenge.description}</p>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'20px' }}>
                <div>
                  <div style={{ fontSize:'9px', color:'#8A8E99', marginBottom:'4px' }}>Entry Fee</div>
                  <div style={{ fontFamily:"'Space Grotesk',sans-serif", fontSize:'28px', fontWeight:'700', color }}>${Number(challenge.entry_fee).toLocaleString()}</div>
                </div>
                {challenge.prize_pool && (
                  <div style={{ textAlign:'right' }}>
                    <div style={{ fontSize:'9px', color:'#8A8E99', marginBottom:'4px' }}>Prize Pool</div>
                    <div style={{ fontFamily:"'Space Grotesk',sans-serif", fontSize:'28px', fontWeight:'700', color:'#00FF88' }}>${Number(challenge.prize_pool).toLocaleString()}</div>
                  </div>
                )}
              </div>
              {enrolled ? (
                <div style={{ background:`rgba(${color === '#00E5FF' ? '0,229,255' : '0,255,136'},0.08)`, border:`1px solid rgba(${color === '#00E5FF' ? '0,229,255' : '0,255,136'},0.2)`, padding:'12px', textAlign:'center', fontSize:'10px', fontWeight:'700', color, letterSpacing:'2px', textTransform:'uppercase' }}>
                  ✓ ENROLLED — {enrolled.status?.toUpperCase()}
                </div>
              ) : (
                <button onClick={() => handleEnroll(challenge.id)} disabled={purchasing !== null}
                  style={{ width:'100%', background: purchasing === challenge.id ? `rgba(${color === '#00E5FF' ? '0,229,255' : '0,255,136'},0.3)` : color, border:'none', color:'#0A0A0F', padding:'14px', fontSize:'10px', fontWeight:'700', letterSpacing:'2px', textTransform:'uppercase', cursor: purchasing !== null ? 'not-allowed' : 'pointer', fontFamily:'Inter,sans-serif', clipPath:'polygon(6px 0%,100% 0%,calc(100% - 6px) 100%,0% 100%)', opacity: purchasing !== null && purchasing !== challenge.id ? 0.5 : 1 }}>
                  {purchasing === challenge.id ? 'Processing...' : `Enter Challenge — $${Number(challenge.entry_fee).toLocaleString()} →`}
                </button>
              )}
            </div>
          )
        })}
      </div>

      {enrollments.length > 0 && (
        <div>
          <div style={{ fontSize:'9px', fontWeight:'600', letterSpacing:'3px', textTransform:'uppercase', color:'#8A8E99', marginBottom:'16px' }}>My Enrollments</div>
          <div style={{ background:'#0F0F1A', border:'1px solid rgba(0,229,255,0.08)', padding:'24px' }}>
            {enrollments.map((e, i) => (
              <div key={i} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'12px 0', borderBottom:'1px solid rgba(0,229,255,0.04)' }}>
                <div>
                  <div style={{ fontSize:'12px', fontWeight:'500', color:'#E8E4DC', marginBottom:'2px' }}>{e.challenges?.name}</div>
                  <div style={{ fontSize:'9px', color:'#8A8E99' }}>Enrolled: {new Date(e.created_at).toLocaleDateString()}</div>
                </div>
                <div style={{ fontSize:'9px', fontWeight:'600', color: e.status === 'completed' ? '#00FF88' : e.status === 'failed' ? '#FF4444' : '#00E5FF', textTransform:'uppercase', letterSpacing:'1px' }}>{e.status}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}