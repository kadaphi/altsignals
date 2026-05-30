'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'

export default function CoursesPage() {
  const router = useRouter()
  const { refreshUser } = useAuth()
  const [courses, setCourses] = useState([])
  const [purchasedIds, setPurchasedIds] = useState([])
  const [coaching, setCoaching] = useState({})
  const [loading, setLoading] = useState(true)
  const [purchasing, setPurchasing] = useState(null)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => { fetchCourses() }, [])

  async function fetchCourses() {
    try {
      const res = await fetch('/api/courses', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('as_token')}` }
      })
      if (res.ok) {
        const data = await res.json()
        setCourses(data.courses || [])
        setPurchasedIds(data.purchasedIds || [])
        setCoaching(data.coaching || {})
      }
    } catch {}
    finally { setLoading(false) }
  }

  async function handlePurchase(course_id) {
    setPurchasing(course_id)
    setError('')
    setSuccess('')
    try {
      const res = await fetch('/api/courses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('as_token')}` },
        body: JSON.stringify({ course_id })
      })
      const data = await res.json()
      if (data.error === 'INSUFFICIENT_BALANCE') { router.push('/dashboard/deposit'); return }
      if (!res.ok) return setError(data.error)
      setSuccess('Purchase successful! Your course links have been sent to your notifications.')
      await refreshUser()
      fetchCourses()
    } catch { setError('Something went wrong') }
    finally { setPurchasing(null) }
  }

  if (loading) return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', minHeight:'400px' }}>
      <div style={{ width:'36px', height:'36px', border:'2px solid rgba(0,229,255,0.2)', borderTop:'2px solid #00E5FF', borderRadius:'50%', animation:'spin 1s linear infinite' }}></div>
      <style>{`@keyframes spin{to{transform:rotate(360deg);}}`}</style>
    </div>
  )

  const bundleCourse = courses.find(c => c.order_index === 0)
  const individualCourses = courses.filter(c => c.order_index > 0)
  const bundlePurchased = bundleCourse ? purchasedIds.includes(bundleCourse.id) : false
  const allPurchased = individualCourses.length > 0 && individualCourses.every(c => purchasedIds.includes(c.id))

  return (
    <div style={{ maxWidth:'1100px' }}>
      <style>{`
        @keyframes spin{to{transform:rotate(360deg);}}
        .courses-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:16px; margin-bottom:40px; }
        .coaching-row { display:flex; justify-content:space-between; align-items:flex-start; flex-wrap:wrap; gap:24px; }
        .coaching-actions { display:flex; flex-direction:column; align-items:flex-end; gap:16px; }
        @media(max-width:768px){
          .courses-grid{ grid-template-columns:1fr !important; }
          .coaching-row{ flex-direction:column !important; }
          .coaching-actions{ align-items:flex-start !important; width:100%; }
        }
      `}</style>

      <div style={{ marginBottom:'28px' }}>
        <div style={{ fontSize:'9px', fontWeight:'600', letterSpacing:'3px', textTransform:'uppercase', color:'#00E5FF', marginBottom:'8px' }}>Education</div>
        <h1 style={{ fontFamily:"'Space Grotesk',sans-serif", fontSize:'32px', fontWeight:'700', color:'#E8E4DC' }}>Trading Courses</h1>
      </div>

      {error && <div style={{ background:'rgba(255,68,68,0.1)', border:'1px solid rgba(255,68,68,0.3)', padding:'12px 16px', marginBottom:'20px', fontSize:'12px', color:'#FF4444' }}>{error}</div>}
      {success && <div style={{ background:'rgba(0,255,136,0.1)', border:'1px solid rgba(0,255,136,0.3)', padding:'12px 16px', marginBottom:'20px', fontSize:'12px', color:'#00FF88' }}>{success}</div>}

      {/* Bundle Course — shown prominently at top */}
      {bundleCourse && !allPurchased && (
        <div style={{ background:'#0F0F1A', border:'2px solid rgba(255,215,0,0.25)', padding:'32px', position:'relative', marginBottom:'32px' }}>
          <div style={{ position:'absolute', top:0, left:0, width:'100%', height:'3px', background:'linear-gradient(90deg,#FFD700,#00E5FF,transparent)' }}></div>
          <div style={{ position:'absolute', top:'16px', right:'16px', background:'rgba(255,215,0,0.15)', border:'1px solid rgba(255,215,0,0.4)', color:'#FFD700', fontSize:'9px', fontWeight:'700', letterSpacing:'2px', padding:'5px 12px' }}>
            BEST VALUE
          </div>

          <div style={{ display:'flex', flexWrap:'wrap', gap:'24px', alignItems:'flex-start' }}>
            <div style={{ flex:1, minWidth:'240px' }}>
              <div style={{ fontSize:'9px', fontWeight:'700', letterSpacing:'3px', textTransform:'uppercase', color:'#FFD700', marginBottom:'10px' }}>🎓 All Access Bundle</div>
              <div style={{ fontFamily:"'Space Grotesk',sans-serif", fontSize:'24px', fontWeight:'700', color:'#E8E4DC', marginBottom:'10px' }}>{bundleCourse.title}</div>
              <p style={{ fontSize:'13px', color:'#8A8E99', lineHeight:'1.8', marginBottom:'16px' }}>{bundleCourse.description}</p>
              <div style={{ display:'flex', flexWrap:'wrap', gap:'8px' }}>
                {individualCourses.map((c, i) => (
                  <div key={i} style={{ background:'rgba(255,215,0,0.08)', border:'1px solid rgba(255,215,0,0.2)', padding:'4px 10px', fontSize:'10px', color:'#FFD700' }}>
                    ✓ {c.title}
                  </div>
                ))}
              </div>
            </div>

            <div style={{ display:'flex', flexDirection:'column', alignItems:'flex-end', gap:'12px', minWidth:'180px' }}>
              <div>
                <div style={{ fontFamily:"'Space Grotesk',sans-serif", fontSize:'42px', fontWeight:'700', color:'#FFD700', lineHeight:1 }}>
                  ${Number(bundleCourse.price).toLocaleString()}
                </div>
                <div style={{ fontSize:'11px', color:'#8A8E99', textAlign:'right', marginTop:'4px' }}>one-time payment</div>
                {individualCourses.length > 0 && (
                  <div style={{ fontSize:'10px', color:'#8A8E99', textAlign:'right', marginTop:'2px', textDecoration:'line-through' }}>
                    vs ${individualCourses.reduce((sum, c) => sum + Number(c.price), 0).toLocaleString()} individually
                  </div>
                )}
              </div>

              {bundlePurchased ? (
                <div style={{ background:'rgba(0,255,136,0.08)', border:'1px solid rgba(0,255,136,0.2)', padding:'12px 24px', textAlign:'center', fontSize:'11px', fontWeight:'600', color:'#00FF88', letterSpacing:'1px' }}>
                  ✓ PURCHASED — Check Notifications
                </div>
              ) : (
                <button onClick={() => handlePurchase(bundleCourse.id)} disabled={purchasing !== null}
                  style={{ background: purchasing === bundleCourse.id ? 'rgba(255,215,0,0.3)' : '#FFD700', border:'none', color:'#0A0A0F', padding:'15px 32px', fontSize:'11px', fontWeight:'700', letterSpacing:'2px', textTransform:'uppercase', cursor: purchasing !== null ? 'not-allowed' : 'pointer', fontFamily:'Inter,sans-serif', clipPath:'polygon(8px 0%,100% 0%,calc(100% - 8px) 100%,0% 100%)', opacity: purchasing !== null && purchasing !== bundleCourse.id ? 0.5 : 1, whiteSpace:'nowrap' }}>
                  {purchasing === bundleCourse.id ? 'Processing...' : 'Get All Courses →'}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Individual Courses */}
      {individualCourses.length > 0 && (
        <>
          <div style={{ fontSize:'9px', fontWeight:'600', letterSpacing:'3px', textTransform:'uppercase', color:'#8A8E99', marginBottom:'16px' }}>
            Individual Courses
          </div>
          <div className="courses-grid">
            {individualCourses.map((course) => {
              const isPurchased = purchasedIds.includes(course.id) || bundlePurchased || allPurchased
              return (
                <div key={course.id} style={{ background:'#0F0F1A', border:'1px solid rgba(0,229,255,0.08)', padding:'28px', position:'relative', display:'flex', flexDirection:'column', transition:'border-color 0.2s' }}
                  onMouseEnter={e => e.currentTarget.style.borderColor='rgba(0,229,255,0.25)'}
                  onMouseLeave={e => e.currentTarget.style.borderColor='rgba(0,229,255,0.08)'}
                >
                  <div style={{ position:'absolute', top:0, left:0, width:'100%', height:'2px', background:'linear-gradient(90deg,#00E5FF,transparent)' }}></div>
                  <div style={{ fontSize:'9px', fontWeight:'700', letterSpacing:'3px', textTransform:'uppercase', color:'#00E5FF', marginBottom:'12px' }}>Course {course.order_index}</div>
                  <div style={{ fontFamily:"'Space Grotesk',sans-serif", fontSize:'18px', fontWeight:'700', color:'#E8E4DC', marginBottom:'10px' }}>{course.title}</div>
                  <p style={{ fontSize:'12px', color:'#8A8E99', lineHeight:'1.8', marginBottom:'20px', flex:1 }}>{course.description}</p>
                  {course.topics && course.topics.length > 0 && (
                    <div style={{ marginBottom:'20px' }}>
                      {course.topics.slice(0, 3).map((topic, i) => (
                        <div key={i} style={{ display:'flex', alignItems:'center', gap:'8px', marginBottom:'4px' }}>
                          <div style={{ width:'4px', height:'4px', background:'#00E5FF', borderRadius:'50%', flexShrink:0 }}></div>
                          <div style={{ fontSize:'11px', color:'#8A8E99' }}>{topic}</div>
                        </div>
                      ))}
                      {course.topics.length > 3 && <div style={{ fontSize:'10px', color:'#00E5FF', marginTop:'4px' }}>+{course.topics.length - 3} more topics</div>}
                    </div>
                  )}
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'16px' }}>
                    <div style={{ fontFamily:"'Space Grotesk',sans-serif", fontSize:'24px', fontWeight:'700', color:'#00E5FF' }}>${Number(course.price).toLocaleString()}</div>
                    {course.duration && <div style={{ fontSize:'10px', color:'#8A8E99' }}>{course.duration}</div>}
                  </div>
                  {isPurchased ? (
                    <div style={{ display:'flex', flexDirection:'column', gap:'8px' }}>
                      <div style={{ background:'rgba(0,255,136,0.08)', border:'1px solid rgba(0,255,136,0.2)', padding:'10px', textAlign:'center', fontSize:'10px', fontWeight:'600', color:'#00FF88', letterSpacing:'1px' }}>✓ PURCHASED</div>
                      {course.ebook_link && (
                        <a href={course.ebook_link} target="_blank" rel="noopener noreferrer"
                          style={{ display:'block', background:'#00E5FF', color:'#0A0A0F', padding:'10px', textAlign:'center', fontSize:'10px', fontWeight:'700', letterSpacing:'2px', textTransform:'uppercase', textDecoration:'none', clipPath:'polygon(6px 0%,100% 0%,calc(100% - 6px) 100%,0% 100%)' }}>
                          Access Course →
                        </a>
                      )}
                    </div>
                  ) : (
                    <button onClick={() => handlePurchase(course.id)} disabled={purchasing !== null}
                      style={{ width:'100%', background: purchasing === course.id ? 'rgba(0,229,255,0.3)' : '#00E5FF', border:'none', color:'#0A0A0F', padding:'12px', fontSize:'10px', fontWeight:'700', letterSpacing:'2px', textTransform:'uppercase', cursor: purchasing !== null ? 'not-allowed' : 'pointer', fontFamily:'Inter,sans-serif', clipPath:'polygon(6px 0%,100% 0%,calc(100% - 6px) 100%,0% 100%)', opacity: purchasing !== null && purchasing !== course.id ? 0.5 : 1 }}>
                      {purchasing === course.id ? 'Processing...' : 'Purchase Course →'}
                    </button>
                  )}
                </div>
              )
            })}
          </div>
        </>
      )}

      {/* 1-on-1 Coaching */}
      <div style={{ background:'#0F0F1A', border:'1px solid rgba(123,97,255,0.2)', padding:'40px', position:'relative' }}>
        <div style={{ position:'absolute', top:0, left:0, width:'100%', height:'2px', background:'linear-gradient(90deg,#7B61FF,#00E5FF,transparent)' }}></div>
        <div className="coaching-row">
          <div style={{ flex:1, minWidth:'280px' }}>
            <div style={{ fontSize:'9px', fontWeight:'700', letterSpacing:'3px', textTransform:'uppercase', color:'#7B61FF', marginBottom:'12px' }}>Private Mentorship</div>
            <div style={{ fontFamily:"'Space Grotesk',sans-serif", fontSize:'24px', fontWeight:'700', color:'#E8E4DC', marginBottom:'12px' }}>1-on-1 Coaching Session</div>
            <p style={{ fontSize:'13px', color:'#8A8E99', lineHeight:'1.8' }}>
              {coaching.coaching_description || 'Work directly with our head trader in a private one-on-one session. Get personalized feedback on your trading strategy, risk management and chart analysis.'}
            </p>
          </div>
          <div className="coaching-actions">
            <div style={{ fontFamily:"'Space Grotesk',sans-serif", fontSize:'40px', fontWeight:'700', color:'#7B61FF' }}>
              ${Number(coaching.coaching_fee || 0).toLocaleString()}
            </div>
            <a href={coaching.coaching_link || 'https://altsignals.finance/contact'} target="_blank" rel="noopener noreferrer"
              style={{ display:'inline-flex', alignItems:'center', gap:'8px', background:'#7B61FF', color:'#ffffff', padding:'14px 28px', fontSize:'11px', fontWeight:'700', letterSpacing:'2px', textTransform:'uppercase', textDecoration:'none', clipPath:'polygon(6px 0%,100% 0%,calc(100% - 6px) 100%,0% 100%)' }}>
              Book Session →
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
