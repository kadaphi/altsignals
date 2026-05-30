'use client'
import { useState, useEffect } from 'react'

export default function AdminKYCPage() {
  const [kyc, setKyc] = useState([])
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(null)
  const [filter, setFilter] = useState('pending')
  const [viewImage, setViewImage] = useState(null)

  useEffect(() => { fetchKYC() }, [])

  async function fetchKYC() {
    try {
      const res = await fetch('/api/admin/kyc', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('as_token')}` }
      })
      if (res.ok) {
        const data = await res.json()
        setKyc(data.kyc || [])
      }
    } catch {}
    finally { setLoading(false) }
  }

  async function handleUpdate(kyc_id, user_id, status) {
    setUpdating(kyc_id)
    try {
      await fetch('/api/admin/kyc', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('as_token')}` },
        body: JSON.stringify({ kyc_id, user_id, status })
      })
      fetchKYC()
    } catch {}
    finally { setUpdating(null) }
  }

  const filtered = filter === 'all' ? kyc : kyc.filter(k => k.status === filter)

  if (loading) return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', minHeight:'400px' }}>
      <div style={{ width:'36px', height:'36px', border:'2px solid rgba(0,229,255,0.2)', borderTop:'2px solid #00E5FF', borderRadius:'50%', animation:'spin 1s linear infinite' }}></div>
      <style>{`@keyframes spin{to{transform:rotate(360deg);}}`}</style>
    </div>
  )

  return (
    <div style={{ maxWidth:'1000px' }}>
      <style>{`@keyframes spin{to{transform:rotate(360deg);}}`}</style>

      <div style={{ marginBottom:'28px' }}>
        <h1 style={{ fontFamily:"'Space Grotesk',sans-serif", fontSize:'28px', fontWeight:'700', color:'#E8E4DC' }}>KYC Verification</h1>
        <div style={{ fontSize:'12px', color:'#8A8E99', marginTop:'4px' }}>{kyc.filter(k => k.status === 'pending').length} pending review</div>
      </div>

      <div style={{ display:'flex', gap:'8px', marginBottom:'24px', flexWrap:'wrap' }}>
        {['pending', 'approved', 'rejected', 'all'].map(f => (
          <button key={f} onClick={() => setFilter(f)}
            style={{ background: filter === f ? 'rgba(0,229,255,0.15)' : '#0F0F1A', border:`1px solid ${filter === f ? '#00E5FF' : 'rgba(0,229,255,0.08)'}`, padding:'8px 16px', color: filter === f ? '#00E5FF' : '#8A8E99', fontSize:'10px', fontWeight:'600', letterSpacing:'1px', textTransform:'uppercase', cursor:'pointer', fontFamily:'Inter,sans-serif' }}>
            {f}
          </button>
        ))}
      </div>

      <div style={{ display:'flex', flexDirection:'column', gap:'12px' }}>
        {filtered.length === 0 ? (
          <div style={{ background:'#0F0F1A', border:'1px solid rgba(0,229,255,0.08)', padding:'40px', textAlign:'center', fontSize:'13px', color:'#8A8E99' }}>No KYC submissions found</div>
        ) : filtered.map((k, i) => (
          <div key={i} style={{ background:'#0F0F1A', border:'1px solid rgba(0,229,255,0.08)', padding:'20px', position:'relative' }}>
            <div style={{ position:'absolute', top:0, left:0, width:'100%', height:'2px', background:`linear-gradient(90deg,${k.status === 'approved' ? '#00FF88' : k.status === 'rejected' ? '#FF4444' : '#FFD700'},transparent)` }}></div>

            {/* Header */}
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:'12px', gap:'12px' }}>
              <div style={{ minWidth:0 }}>
                <div style={{ fontSize:'13px', fontWeight:'600', color:'#E8E4DC', marginBottom:'2px' }}>{k.users?.full_name}</div>
                <div style={{ fontSize:'11px', color:'#8A8E99' }}>{k.users?.email}</div>
              </div>
              <div style={{ fontSize:'9px', fontWeight:'600', color: k.status === 'approved' ? '#00FF88' : k.status === 'rejected' ? '#FF4444' : '#FFD700', letterSpacing:'1px', flexShrink:0 }}>
                {k.status?.toUpperCase()}
              </div>
            </div>

            {/* Document info */}
            <div style={{ display:'flex', gap:'16px', flexWrap:'wrap', marginBottom:'14px' }}>
              <div>
                <div style={{ fontSize:'9px', color:'#8A8E99', marginBottom:'2px' }}>Document Type</div>
                <div style={{ fontSize:'12px', color:'#E8E4DC' }}>{k.document_type}</div>
              </div>
              <div>
                <div style={{ fontSize:'9px', color:'#8A8E99', marginBottom:'2px' }}>Document Number</div>
                <div style={{ fontSize:'12px', color:'#E8E4DC' }}>{k.document_number}</div>
              </div>
              <div>
                <div style={{ fontSize:'9px', color:'#8A8E99', marginBottom:'2px' }}>Submitted</div>
                <div style={{ fontSize:'11px', color:'#8A8E99' }}>{new Date(k.created_at).toLocaleDateString()}</div>
              </div>
            </div>

            {/* Document images */}
            <div style={{ display:'flex', gap:'8px', flexWrap:'wrap', marginBottom:'14px' }}>
              {k.document_url && (
                <button onClick={() => setViewImage(k.document_url)}
                  style={{ background:'rgba(0,229,255,0.08)', border:'1px solid rgba(0,229,255,0.2)', color:'#00E5FF', padding:'8px 14px', fontSize:'10px', fontWeight:'600', cursor:'pointer', fontFamily:'Inter,sans-serif' }}>
                  📄 View ID
                </button>
              )}
              {k.selfie_url && (
                <button onClick={() => setViewImage(k.selfie_url)}
                  style={{ background:'rgba(0,229,255,0.08)', border:'1px solid rgba(0,229,255,0.2)', color:'#00E5FF', padding:'8px 14px', fontSize:'10px', fontWeight:'600', cursor:'pointer', fontFamily:'Inter,sans-serif' }}>
                  🤳 View Selfie
                </button>
              )}
              {k.charge_receipt_url && (
                <button onClick={() => setViewImage(k.charge_receipt_url)}
                  style={{ background:'rgba(255,215,0,0.08)', border:'1px solid rgba(255,215,0,0.2)', color:'#FFD700', padding:'8px 14px', fontSize:'10px', fontWeight:'600', cursor:'pointer', fontFamily:'Inter,sans-serif' }}>
                  🧾 View Receipt
                </button>
              )}
            </div>

            {/* Actions */}
            {k.status === 'pending' && (
              <div style={{ display:'flex', gap:'8px' }}>
                <button onClick={() => handleUpdate(k.id, k.user_id, 'approved')} disabled={updating === k.id}
                  style={{ flex:1, background:'rgba(0,255,136,0.1)', border:'1px solid rgba(0,255,136,0.3)', color:'#00FF88', padding:'10px', fontSize:'10px', fontWeight:'600', cursor:'pointer', fontFamily:'Inter,sans-serif', letterSpacing:'1px', textTransform:'uppercase' }}>
                  ✓ Approve
                </button>
                <button onClick={() => handleUpdate(k.id, k.user_id, 'rejected')} disabled={updating === k.id}
                  style={{ flex:1, background:'rgba(255,68,68,0.1)', border:'1px solid rgba(255,68,68,0.3)', color:'#FF4444', padding:'10px', fontSize:'10px', fontWeight:'600', cursor:'pointer', fontFamily:'Inter,sans-serif', letterSpacing:'1px', textTransform:'uppercase' }}>
                  ✕ Reject
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Image viewer modal */}
      {viewImage && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.95)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:1000, padding:'20px' }}
          onClick={() => setViewImage(null)}>
          <div style={{ maxWidth:'90vw', maxHeight:'90vh', position:'relative' }}>
            <img src={viewImage} alt="KYC Document"
              style={{ maxWidth:'100%', maxHeight:'85vh', objectFit:'contain', border:'1px solid rgba(0,229,255,0.2)' }} />
            <button onClick={() => setViewImage(null)}
              style={{ position:'absolute', top:'-12px', right:'-12px', background:'#FF4444', border:'none', color:'#fff', width:'28px', height:'28px', borderRadius:'50%', cursor:'pointer', fontSize:'16px', display:'flex', alignItems:'center', justifyContent:'center' }}>
              ×
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
