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

  useEffect(() => { fetchData() }, [])

  async function fetchData() {
    try {
      const res = await fetch('/api/admin/courses', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('as_token')}` }
      })
      if (res.ok) {
        const data = await res.json()
        setCourses(data.courses || [])
        setPurchases(data.purchases || [])
      }
    } catch {}
    finally { setLoading(false) }
  }

  async function handleSave() {
    setSaving(true)
    try {
      await fetch('/api/admin/courses', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('as_token')}`
        },
        body: JSON.stringify({ course_id: editCourse.id, updates: editForm })
      })
      setEditCourse(null)
      fetchData()
    } catch {}
    finally { setSaving(false) }
  }

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '400px' }}>
      <div style={{ width: '36px', height: '36px', border: '2px solid rgba(0,229,255,0.2)', borderTop: '2px solid #00E5FF', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
      <style>{`@keyframes spin{to{transform:rotate(360deg);}}`}</style>
    </div>
  )

  return (
    <div style={{ maxWidth: '1200px' }}>
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: '28px', fontWeight: '700', color: '#E8E4DC' }}>Courses</h1>
        <div style={{ fontSize: '12px', color: '#8A8E99', marginTop: '4px' }}>{purchases.length} total purchases</div>
      </div>

      <div style={{ display: 'flex', gap: '4px', marginBottom: '24px', borderBottom: '1px solid rgba(0,229,255,0.08)' }}>
        {['courses', 'purchases'].map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)} style={{ background: 'none', border: 'none', borderBottom: activeTab === tab ? '2px solid #00E5FF' : '2px solid transparent', padding: '12px 20px', color: activeTab === tab ? '#00E5FF' : '#8A8E99', fontSize: '11px', fontWeight: '600', letterSpacing: '1.5px', textTransform: 'uppercase', cursor: 'pointer', fontFamily: 'Inter,sans-serif', marginBottom: '-1px' }}>
            {tab}
          </button>
        ))}
      </div>

      {activeTab === 'courses' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: '16px' }}>
          {courses.map((course, i) => (
            <div key={i} style={{ background: '#0F0F1A', border: '1px solid rgba(0,229,255,0.08)', padding: '24px', position: 'relative' }}>
              <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '2px', background: 'linear-gradient(90deg,#00E5FF,transparent)' }}></div>
              <div style={{ fontSize: '9px', fontWeight: '700', letterSpacing: '3px', color: '#00E5FF', marginBottom: '8px' }}>COURSE {course.order_index}</div>
              <div style={{ fontSize: '15px', fontWeight: '600', color: '#E8E4DC', marginBottom: '8px' }}>{course.title}</div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <div style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: '22px', fontWeight: '700', color: '#00E5FF' }}>${Number(course.price).toLocaleString()}</div>
                <div style={{ fontSize: '10px', color: '#8A8E99' }}>{course.duration}</div>
              </div>
              {course.ebook_link && (
                <div style={{ fontSize: '10px', color: '#8A8E99', marginBottom: '16px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  Link: <span style={{ color: '#00E5FF' }}>{course.ebook_link}</span>
                </div>
              )}
              <button onClick={() => { setEditCourse(course); setEditForm({ price: course.price, ebook_link: course.ebook_link || '' }) }} style={{ width: '100%', background: 'rgba(0,229,255,0.08)', border: '1px solid rgba(0,229,255,0.2)', color: '#00E5FF', padding: '10px', fontSize: '10px', fontWeight: '600', letterSpacing: '1px', textTransform: 'uppercase', cursor: 'pointer', fontFamily: 'Inter,sans-serif' }}>
                Edit Price & Link
              </button>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'purchases' && (
        <div style={{ background: '#0F0F1A', border: '1px solid rgba(0,229,255,0.08)' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 2fr 1fr', gap: '16px', padding: '12px 20px', borderBottom: '1px solid rgba(0,229,255,0.08)', fontSize: '9px', fontWeight: '700', letterSpacing: '2px', textTransform: 'uppercase', color: '#8A8E99' }}>
            <div>User</div>
            <div>Course</div>
            <div>Date</div>
          </div>
          {purchases.length === 0 ? (
            <div style={{ padding: '40px', textAlign: 'center', fontSize: '13px', color: '#8A8E99' }}>No purchases yet</div>
          ) : purchases.map((p, i) => (
            <div key={i} style={{ display: 'grid', gridTemplateColumns: '2fr 2fr 1fr', gap: '16px', padding: '14px 20px', borderBottom: '1px solid rgba(0,229,255,0.04)', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: '12px', fontWeight: '500', color: '#E8E4DC' }}>{p.users?.full_name}</div>
                <div style={{ fontSize: '10px', color: '#8A8E99' }}>{p.users?.email}</div>
              </div>
              <div style={{ fontSize: '11px', color: '#00E5FF' }}>{p.courses?.title}</div>
              <div style={{ fontSize: '10px', color: '#8A8E99' }}>{new Date(p.created_at).toLocaleDateString()}</div>
            </div>
          ))}
        </div>
      )}

      {editCourse && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
          <div style={{ background: '#0F0F1A', border: '1px solid rgba(0,229,255,0.2)', padding: '40px', maxWidth: '480px', width: '100%', position: 'relative' }}>
            <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '2px', background: 'linear-gradient(90deg,#00E5FF,transparent)' }}></div>
            <h2 style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: '20px', fontWeight: '700', color: '#E8E4DC', marginBottom: '4px' }}>Edit Course</h2>
            <div style={{ fontSize: '12px', color: '#8A8E99', marginBottom: '24px' }}>{editCourse.title}</div>
            <div style={{ marginBottom: '16px' }}>
              <div style={{ fontSize: '9px', fontWeight: '600', letterSpacing: '2px', textTransform: 'uppercase', color: '#8A8E99', marginBottom: '8px' }}>Price ($)</div>
              <input type="number" style={{ width: '100%', background: '#111320', border: '1px solid rgba(0,229,255,0.15)', padding: '12px 16px', color: '#E8E4DC', fontFamily: 'Inter,sans-serif', fontSize: '13px', outline: 'none' }} value={editForm.price} onChange={e => setEditForm({...editForm, price: Number(e.target.value)})} />
            </div>
            <div style={{ marginBottom: '24px' }}>
              <div style={{ fontSize: '9px', fontWeight: '600', letterSpacing: '2px', textTransform: 'uppercase', color: '#8A8E99', marginBottom: '8px' }}>eBook / Course Link</div>
              <input style={{ width: '100%', background: '#111320', border: '1px solid rgba(0,229,255,0.15)', padding: '12px 16px', color: '#E8E4DC', fontFamily: 'Inter,sans-serif', fontSize: '13px', outline: 'none' }} placeholder="https://..." value={editForm.ebook_link} onChange={e => setEditForm({...editForm, ebook_link: e.target.value})} />
            </div>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button onClick={() => setEditCourse(null)} style={{ flex: 1, background: 'none', border: '1px solid rgba(0,229,255,0.2)', color: '#8A8E99', padding: '12px', fontSize: '10px', fontWeight: '600', letterSpacing: '2px', textTransform: 'uppercase', cursor: 'pointer', fontFamily: 'Inter,sans-serif' }}>Cancel</button>
              <button onClick={handleSave} disabled={saving} style={{ flex: 2, background: '#00E5FF', border: 'none', color: '#0A0A0F', padding: '12px', fontSize: '10px', fontWeight: '700', letterSpacing: '2px', textTransform: 'uppercase', cursor: 'pointer', fontFamily: 'Inter,sans-serif', opacity: saving ? 0.6 : 1 }}>
                {saving ? 'Saving...' : 'Save Changes →'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}