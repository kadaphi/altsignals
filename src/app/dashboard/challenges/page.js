'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function ChallengesPage() {
  const router = useRouter()
  const [challenges, setChallenges] = useState([])
  const [enrollments, setEnrollments] = useState([])
  const [loading, setLoading] = useState(true)
  const [enrolling, setEnrolling] = useState(false)
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
    setEnrolling(true)
    setError('')
    setSuccess('')
    try {
      const res = await fetch('/api/challenges', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('as_token')}`
        },
        body: JSON.stringify({ challenge_id })
      })
      const data = await res.json()
      if (data.error === 'INSUFFICIENT_BALANCE') { router.push('/dashboard/deposit'); return }
      if (!res.ok) return setError(data.error)
      setSuccess('Successfully enrolled in challenge!')
      fetchChallenges()
    } catch { setError('Something went wrong') }
    finally { setEnrolling(false) }
  }

  const tierColors = { 1: '#00E5FF', 2: '#00FF88', 3: '#FFD700', 4: '#FF6B35' }
  const tierNames = { 1: 'TIER 1', 2: 'TIER 2', 3: 'TIER 3', 4: 'TIER 4' }

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '400px' }}>
      <div style={{ width: '36px', height: '36px', border: '2px solid rgba(0,229,255,0.2)', borderTop: '2px solid #00E5FF', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
      <style>{`@keyframes spin{to{transform:rotate(360deg);}}`}</style>
    </div>
  )

  return (
    <div style={{ maxWidth: '1100px' }}>
      <style>{`@keyframes spin{to{transform:rotate(360deg);}}`}</style>
      <div style={{ marginBottom: '28px' }}>
        <div style={{ fontSize: '9px', fontWeight: '600', letterSpacing: '3px', textTransform: 'uppercase', color: '#00E5FF', marginBottom: '8px' }}>Prove Your Skills</div>
        <h1 style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: '32px', fontWeight: '700', color: '#E8E4DC' }}>Trading Challenges</h1>
      </div>

      {error && <div style={{ background: 'rgba(255,68,68,0.1)', border: '1px solid rgba(255,68,68,0.3)', padding: '12px 16px', marginBottom: '20px', fontSize: '12px', color: '#FF4444' }}>{error}</div>}
      {success && <div style={{ background: 'rgba(0,255,136,0.1)', border: '1px solid rgba(0,255,136,0.3)', padding: '12px 16px', marginBottom: '20px', fontSize: '12px', color: '#00FF88' }}>{success}</div>}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: '16px' }}>
        {challenges.length === 0 ? (
          <div style={{ background: '#0F0F1A', border: '1px solid rgba(0,229,255,0.08)', padding: '60px', textAlign: 'center', gridColumn: '1/-1' }}>
            <div style={{ fontSize: '13px', color: '#8A8E99' }}>No challenges available at the moment</div>
          </div>
        ) : challenges.map((challenge) => {
          const isEnrolled = enrollments.some(e => e.challenge_id === challenge.id && e.status === 'active')
          const tierColor = tierColors[challenge.tier] || '#00E5FF'
          return (
            <div key={challenge.id} style={{ background: '#0F0F1A', border: `1px solid rgba(0,229,255,0.08)`, padding: '32px', position: 'relative', display: 'flex', flexDirection: 'column' }}>
              <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '2px', background: `linear-gradient(90deg,${tierColor},transparent)` }}></div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                <div style={{ fontSize: '9px', fontWeight: '700', letterSpacing: '3px', textTransform: 'uppercase', color: tierColor }}>{tierNames[challenge.tier] || 'CHALLENGE'}</div>
                <div style={{ background: `rgba(0,229,255,0.08)`, border: `1px solid rgba(0,229,255,0.2)`, padding: '4px 12px', fontSize: '11px', fontWeight: '700', color: '#00E5FF' }}>
                  ${Number(challenge.entry_fee).toLocaleString()} Entry
                </div>
              </div>
              <div style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: '22px', fontWeight: '700', color: '#E8E4DC', marginBottom: '12px' }}>{challenge.name}</div>
              <p style={{ fontSize: '12px', color: '#8A8E99', lineHeight: '1.8', marginBottom: '20px', flex: 1 }}>{challenge.description}</p>

              {challenge.rules && challenge.rules.length > 0 && (
                <div style={{ marginBottom: '20px' }}>
                  <div style={{ fontSize: '9px', fontWeight: '700', letterSpacing: '2px', textTransform: 'uppercase', color: '#8A8E99', marginBottom: '8px' }}>Rules</div>
                  {challenge.rules.map((rule, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                      <div style={{ width: '4px', height: '4px', background: tierColor, borderRadius: '50%', flexShrink: 0 }}></div>
                      <div style={{ fontSize: '11px', color: '#8A8E99' }}>{rule}</div>
                    </div>
                  ))}
                </div>
              )}

              {challenge.prize && (
                <div style={{ background: `rgba(0,229,255,0.04)`, border: `1px solid rgba(0,229,255,0.1)`, padding: '12px', marginBottom: '20px' }}>
                  <div style={{ fontSize: '9px', fontWeight: '700', letterSpacing: '2px', textTransform: 'uppercase', color: tierColor, marginBottom: '4px' }}>Prize</div>
                  <div style={{ fontSize: '12px', color: '#E8E4DC' }}>{challenge.prize}</div>
                </div>
              )}

              {isEnrolled ? (
                <div style={{ background: 'rgba(0,255,136,0.08)', border: '1px solid rgba(0,255,136,0.2)', padding: '12px', textAlign: 'center', fontSize: '11px', fontWeight: '600', color: '#00FF88', letterSpacing: '1px' }}>
                  ✓ ENROLLED
                </div>
              ) : (
                <button onClick={() => handleEnroll(challenge.id)} disabled={enrolling} style={{ width: '100%', background: tierColor, border: 'none', color: '#0A0A0F', padding: '13px', fontSize: '10px', fontWeight: '700', letterSpacing: '2px', textTransform: 'uppercase', cursor: 'pointer', fontFamily: 'Inter,sans-serif', clipPath: 'polygon(6px 0%,100% 0%,calc(100% - 6px) 100%,0% 100%)', opacity: enrolling ? 0.6 : 1 }}>
                  {enrolling ? 'Enrolling...' : 'Enter Challenge →'}
                </button>
              )}
            </div>
          )
        })}
      </div>

      {enrollments.length > 0 && (
        <div style={{ marginTop: '40px' }}>
          <div style={{ fontSize: '9px', fontWeight: '600', letterSpacing: '3px', textTransform: 'uppercase', color: '#8A8E99', marginBottom: '16px' }}>My Enrollments</div>
          <div style={{ background: '#0F0F1A', border: '1px solid rgba(0,229,255,0.08)', padding: '24px' }}>
            {enrollments.map((e, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid rgba(0,229,255,0.04)' }}>
                <div>
                  <div style={{ fontSize: '12px', fontWeight: '500', color: '#E8E4DC', marginBottom: '2px' }}>{e.challenges?.name}</div>
                  <div style={{ fontSize: '9px', color: '#8A8E99' }}>{new Date(e.created_at).toLocaleDateString()}</div>
                </div>
                <div style={{ fontSize: '9px', fontWeight: '600', letterSpacing: '1px', textTransform: 'uppercase', color: e.status === 'active' ? '#00E5FF' : e.status === 'completed' ? '#00FF88' : '#FF4444' }}>{e.status}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}