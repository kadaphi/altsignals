'use client'
import { useState, useEffect } from 'react'

export default function AdminCoursesPage() {
  const [courses, setCourses] = useState([])
  const [purchases, setPurchases] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('courses')
  const [editCourse, setEditCourse] = useState(null)
  const [editForm, setEditForm] = useState({})
  const [saving, setSaving] = useState(false)
  const [bundlePrice, setBundlePrice] = useState('')
  const [bundleLinks, setBundleLinks] = useState({})
  const [savingBundle, setSavingBundle] = useState(false)
  const [bundleSuccess, setBundleSuccess] = useState(false)

  useEffect(() => { fetchData() }, [])

  async function fetchData() {
    try {
      const res = await fetch('/api/admin/courses', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('as_token')}` }
      })
      if (res.ok) {
        const data = await res.json()
        const allCourses = data.courses || []
        setCourses(allCourses)
        setPurchases(data.purchases || [])

        // Find bundle course and individual courses
        const bundle = allCourses.find(c => c.order_index === 0)
        const individual = allCourses.filter(c => c.order_index > 0)

        if (bundle) {
          setBundlePrice(bundle.price)
          // Pre-fill bundle links from individual courses
          const links = {}
          individual.forEach(c => { links[c.id] = c.ebook_link || '' })
          setBundleLinks(links)
        }
      }
    } catch {}
    finally { setLoading(false) }
  }

  async function handleSave() {
    setSaving(true)
    try {
      await fetch('/api/admin/courses', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('as_token')}` },
        body: JSON.stringify({ course_id: editCourse.id, updates: editForm })
      })
      setEditCourse(null)
      fetchData()
    } catch {}
    finally { setSaving(false) }
  }

  async function handleSaveBundle() {
    setSavingBundle(true)
    setBundleSuccess(false)
    try {
      const bundle = courses.find(c => c.order_index === 0)
      if (!bundle) return

      // Save bundle price
      await fetch('/api/admin/courses', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('as_token')}` },
        body: JSON.stringify({ course_id: bundle.id, updates: { price: Number(bundlePrice) } })
      })

      // Save individual course links
      for (const [course_id, link] of Object.entries(bundleLinks)) {
        await fetch('/api/admin/courses', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('as_token')}` },
          body: JSON.stringify({ course_id, updates: { ebook_link: link } })
        })
      }

      setBundleSuccess(true)
      fetchData()
    } catch {}
    finally { setSavingBundle(false) }
  }

  const individualCourses = courses.filter(c => c.order_index > 0)
  const bundleCourse = courses.find(c => c.order_index === 0)

  const inputStyle = { width:'100%', background:'#111320', border:'1px solid rgba(0,229,255,0.15)', padding:'12px 16px', color:'#E8E4DC', fontFamily:'Inter,sans-serif', fontSize:'13px', outline:'none' }
  const labelStyle = { fontSize:'9px', fontWeight:'600', letterSpacing:'2px', textTransform:'uppercase', color:'#8A8E99', marginBottom:'8px', display:'block' }

  if (loading) return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', minHeight:'400px' }}>
      <div style={{ width:'36px', height:'36px', border:'2px solid rgba(0,229,255,0.2)', borderTop:'2px solid #00E5FF', borderRadius:'50%', animation:'spin 1s linear infinite' }}></div>
      <style>{`@keyframes spin{to{transform:rotate(360deg);}}`}</style>
    </div>
  )

  return (
    <div style={{ maxWidth:'1200px' }}>
      <style>{`
        @keyframes spin{to{transform:rotate(360deg);}}
        .courses-admin-grid { display:grid; grid-template-columns:repeat(2,1fr); gap:16px; }
        .purchases-grid { display:grid; grid-template-columns:2fr 2fr 1fr; gap:16px; }
        @media(max-width:768px){
          .courses-admin-grid { grid-template-columns:1fr !important; }
          .purchases-grid { grid-template-columns:1fr !important; display:block !important; }
        }
      `}</style>

      <div style={{ marginBottom:'28px' }}>
        <h1 style={{ fontFamily:"'Space Grotesk',sans-serif", fontSize:'28px', fontWeight:'700', color:'#E8E4DC' }}>Courses</h1>
        <div style={{ fontSize:'12px', color:'#8A8E99', marginTop:'4px' }}>{purchases.length} total purchases</div>
      </div>

      <div style={{ display:'flex', gap:'4px', marginBottom:'24px', borderBottom:'1px solid rgba(0,229,255,0.08)', overflowX:'auto' }}>
        {['courses', 'bundle', 'purchases'].map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            style={{ background:'none', border:'none', borderBottom: activeTab === tab ? '2px solid #00E5FF' : '2px solid transparent', padding:'12px 20px', color: activeTab === tab ? '#00E5FF' : '#8A8E99', fontSize:'11px', fontWeight:'600', letterSpacing:'1.5px', textTransform:'uppercase', cursor:'pointer', fontFamily:'Inter,sans-serif', marginBottom:'-1px', whiteSpace:'nowrap' }}>
            {tab}
          </button>
        ))}
      </div>

      {/* Individual Courses Tab */}
      {activeTab === 'courses' && (
        <div className="courses-admin-grid">
          {individualCourses.map((course, i) => (
            <div key={i} style={{ background:'#0F0F1A', border:'1px solid rgba(0,229,255,0.08)', padding:'24px', position:'relative' }}>
              <div style={{ position:'absolute', top:0, left:0, width:'100%', height:'2px', background:'linear-gradient(90deg,#00E5FF,transparent)' }}></div>
              <div style={{ fontSize:'9px', fontWeight:'700', letterSpacing:'3px', color:'#00E5FF', marginBottom:'8px' }}>COURSE {course.order_index}</div>
              <div style={{ fontSize:'15px', fontWeight:'600', color:'#E8E4DC', marginBottom:'8px' }}>{course.title}</div>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'16px', flexWrap:'wrap', gap:'8px' }}>
                <div style={{ fontFamily:"'Space Grotesk',sans-serif", fontSize:'22px', fontWeight:'700', color:'#00E5FF' }}>${Number(course.price).toLocaleString()}</div>
                <div style={{ fontSize:'10px', color:'#8A8E99' }}>{course.duration}</div>
              </div>
              {course.ebook_link && (
                <div style={{ fontSize:'10px', color:'#8A8E99', marginBottom:'16px', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                  Link: <span style={{ color:'#00E5FF' }}>{course.ebook_link}</span>
                </div>
              )}
              <button onClick={() => { setEditCourse(course); setEditForm({ price: course.price, ebook_link: course.ebook_link || '' }) }}
                style={{ width:'100%', background:'rgba(0,229,255,0.08)', border:'1px solid rgba(0,229,255,0.2)', color:'#00E5FF', padding:'10px', fontSize:'10px', fontWeight:'600', letterSpacing:'1px', textTransform:'uppercase', cursor:'pointer', fontFamily:'Inter,sans-serif' }}>
                Edit Price & Link
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Bundle Tab */}
      {activeTab === 'bundle' && (
        <div>
          <div style={{ background:'#0F0F1A', border:'1px solid rgba(0,229,255,0.08)', padding:'28px', position:'relative', marginBottom:'24px' }}>
            <div style={{ position:'absolute', top:0, left:0, width:'100%', height:'2px', background:'linear-gradient(90deg,#FFD700,transparent)' }}></div>
            <div style={{ fontSize:'9px', fontWeight:'700', letterSpacing:'3px', color:'#FFD700', marginBottom:'8px' }}>ALL ACCESS BUNDLE</div>
            <div style={{ fontSize:'14px', color:'#8A8E99', marginBottom:'20px', lineHeight:'1.6' }}>
              Users who purchase the bundle get access to all 6 courses at once. Set the bundle price and add access links for each course below.
            </div>

            {bundleSuccess && (
              <div style={{ background:'rgba(0,255,136,0.1)', border:'1px solid rgba(0,255,136,0.3)', padding:'10px 16px', marginBottom:'16px', fontSize:'12px', color:'#00FF88' }}>
                Bundle saved successfully
              </div>
            )}

            <div style={{ marginBottom:'20px' }}>
              <label style={labelStyle}>Bundle Price ($)</label>
              <input type="number" style={inputStyle} placeholder="e.g. 299" value={bundlePrice}
                onChange={e => setBundlePrice(e.target.value)} />
              <div style={{ fontSize:'10px', color:'#8A8E99', marginTop:'6px' }}>
                Users pay this once and get all 6 course links instantly.
              </div>
            </div>

            <div style={{ marginBottom:'24px' }}>
              <label style={{...labelStyle, marginBottom:'16px'}}>Course Access Links</label>
              {individualCourses.map((course, i) => (
                <div key={i} style={{ marginBottom:'16px' }}>
                  <div style={{ fontSize:'11px', fontWeight:'600', color:'#E8E4DC', marginBottom:'6px' }}>
                    Course {course.order_index} — {course.title}
                  </div>
                  <input style={inputStyle} placeholder="https://drive.google.com/... or https://t.me/..."
                    value={bundleLinks[course.id] || ''}
                    onChange={e => setBundleLinks({...bundleLinks, [course.id]: e.target.value})} />
                </div>
              ))}
            </div>

            <button onClick={handleSaveBundle} disabled={savingBundle}
              style={{ background:'#FFD700', border:'none', color:'#0A0A0F', padding:'14px 32px', fontSize:'11px', fontWeight:'700', letterSpacing:'2px', textTransform:'uppercase', cursor:'pointer', fontFamily:'Inter,sans-serif', clipPath:'polygon(6px 0%,100% 0%,calc(100% - 6px) 100%,0% 100%)', opacity: savingBundle ? 0.6 : 1 }}>
              {savingBundle ? 'Saving...' : 'Save Bundle →'}
            </button>
          </div>
        </div>
      )}

      {/* Purchases Tab */}
      {activeTab === 'purchases' && (
        <div style={{ background:'#0F0F1A', border:'1px solid rgba(0,229,255,0.08)', overflowX:'auto' }}>
          <div className="purchases-grid" style={{ padding:'12px 20px', borderBottom:'1px solid rgba(0,229,255,0.08)', fontSize:'9px', fontWeight:'700', letterSpacing:'2px', textTransform:'uppercase', color:'#8A8E99' }}>
            <div>User</div>
            <div>Course</div>
            <div>Date</div>
          </div>
          {purchases.length === 0 ? (
            <div style={{ padding:'40px', textAlign:'center', fontSize:'13px', color:'#8A8E99' }}>No purchases yet</div>
          ) : purchases.map((p, i) => (
            <div key={i} className="purchases-grid" style={{ padding:'14px 20px', borderBottom:'1px solid rgba(0,229,255,0.04)', alignItems:'center' }}>
              <div>
                <div style={{ fontSize:'12px', fontWeight:'500', color:'#E8E4DC' }}>{p.users?.full_name}</div>
                <div style={{ fontSize:'10px', color:'#8A8E99' }}>{p.users?.email}</div>
              </div>
              <div style={{ fontSize:'11px', color:'#00E5FF' }}>{p.courses?.title}</div>
              <div style={{ fontSize:'10px', color:'#8A8E99' }}>{new Date(p.created_at).toLocaleDateString()}</div>
            </div>
          ))}
        </div>
      )}

      {/* Edit Modal */}
      {editCourse && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.85)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:1000, padding:'20px' }}>
          <div style={{ background:'#0F0F1A', border:'1px solid rgba(0,229,255,0.2)', padding:'32px', maxWidth:'480px', width:'100%', position:'relative' }}>
            <div style={{ position:'absolute', top:0, left:0, width:'100%', height:'2px', background:'linear-gradient(90deg,#00E5FF,transparent)' }}></div>
            <h2 style={{ fontFamily:"'Space Grotesk',sans-serif", fontSize:'20px', fontWeight:'700', color:'#E8E4DC', marginBottom:'4px' }}>Edit Course</h2>
            <div style={{ fontSize:'12px', color:'#8A8E99', marginBottom:'24px' }}>{editCourse.title}</div>
            <div style={{ marginBottom:'16px' }}>
              <label style={labelStyle}>Price ($)</label>
              <input type="number" style={inputStyle} value={editForm.price}
                onChange={e => setEditForm({...editForm, price: Number(e.target.value)})} />
            </div>
            <div style={{ marginBottom:'24px' }}>
              <label style={labelStyle}>Course Access Link</label>
              <input style={inputStyle} placeholder="https://..." value={editForm.ebook_link}
                onChange={e => setEditForm({...editForm, ebook_link: e.target.value})} />
            </div>
            <div style={{ display:'flex', gap:'12px' }}>
              <button onClick={() => setEditCourse(null)}
                style={{ flex:1, background:'none', border:'1px solid rgba(0,229,255,0.2)', color:'#8A8E99', padding:'12px', fontSize:'10px', fontWeight:'600', letterSpacing:'2px', textTransform:'uppercase', cursor:'pointer', fontFamily:'Inter,sans-serif' }}>
                Cancel
              </button>
              <button onClick={handleSave} disabled={saving}
                style={{ flex:2, background:'#00E5FF', border:'none', color:'#0A0A0F', padding:'12px', fontSize:'10px', fontWeight:'700', letterSpacing:'2px', textTransform:'uppercase', cursor:'pointer', fontFamily:'Inter,sans-serif', opacity: saving ? 0.6 : 1 }}>
                {saving ? 'Saving...' : 'Save Changes →'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
