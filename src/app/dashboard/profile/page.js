'use client'
import { useState } from 'react'
import { useAuth } from '@/context/AuthContext'

export default function ProfilePage() {
  const { user, updateUser, refreshUser } = useAuth()
  const [activeTab, setActiveTab] = useState('profile')
  const [form, setForm] = useState({
    full_name: user?.full_name || '',
    phone: user?.phone || '',
    country: user?.country || ''
  })
  const [passwordForm, setPasswordForm] = useState({ current_password: '', new_password: '', confirm_password: '' })
  const [kycForm, setKycForm] = useState({ id_type: 'Passport', id_number: '' })
  const [idImageFile, setIdImageFile] = useState(null)
  const [selfieFile, setSelfieFile] = useState(null)
  const [idImagePreview, setIdImagePreview] = useState('')
  const [selfiePreview, setSelfiePreview] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  async function handleUpdateProfile() {
    setLoading(true)
    setError('')
    setSuccess('')
    try {
      const res = await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('as_token')}` },
        body: JSON.stringify({ full_name: form.full_name, phone: form.phone, country: form.country })
      })
      const data = await res.json()
      if (!res.ok) return setError(data.error)
      updateUser(data.user)
      setSuccess('Profile updated successfully')
    } catch { setError('Something went wrong') }
    finally { setLoading(false) }
  }

  async function handleUpdatePassword() {
    if (passwordForm.new_password !== passwordForm.confirm_password) return setError('Passwords do not match')
    if (passwordForm.new_password.length < 6) return setError('Password must be at least 6 characters')
    setLoading(true)
    setError('')
    setSuccess('')
    try {
      const res = await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('as_token')}` },
        body: JSON.stringify({ current_password: passwordForm.current_password, new_password: passwordForm.new_password })
      })
      const data = await res.json()
      if (!res.ok) return setError(data.error)
      setSuccess('Password updated successfully')
      setPasswordForm({ current_password: '', new_password: '', confirm_password: '' })
    } catch { setError('Something went wrong') }
    finally { setLoading(false) }
  }

  function handleFileChange(e, type) {
    const file = e.target.files[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      if (type === 'id') { setIdImageFile(file); setIdImagePreview(reader.result) }
      else { setSelfieFile(file); setSelfiePreview(reader.result) }
    }
    reader.readAsDataURL(file)
  }

  async function handleSubmitKYC() {
    if (!idImagePreview) return setError('Please upload your ID document')
    if (!selfiePreview) return setError('Please upload a selfie with your ID')
    setLoading(true)
    setError('')
    setSuccess('')
    try {
      const res = await fetch('/api/kyc', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('as_token')}` },
        body: JSON.stringify({
          id_type: kycForm.id_type,
          id_number: kycForm.id_number,
          id_image_url: idImagePreview,
          selfie_url: selfiePreview
        })
      })
      const data = await res.json()
      if (!res.ok) return setError(data.error)
      setSuccess('KYC submitted successfully. We will review your documents within 24 hours.')
      await refreshUser()
    } catch { setError('Something went wrong') }
    finally { setLoading(false) }
  }

  const inputStyle = { width:'100%', background:'#111320', border:'1px solid rgba(0,229,255,0.15)', padding:'14px 16px', color:'#E8E4DC', fontFamily:'Inter,sans-serif', fontSize:'13px', outline:'none' }
  const labelStyle = { fontSize:'9px', fontWeight:'600', letterSpacing:'2px', textTransform:'uppercase', color:'#8A8E99', marginBottom:'8px', display:'block' }
  const cardStyle = { background:'#0F0F1A', border:'1px solid rgba(0,229,255,0.08)', padding:'32px', position:'relative' }

  const tabs = ['profile', 'security', 'kyc']

  return (
    <div style={{ maxWidth:'700px' }}>
      <div style={{ marginBottom:'28px' }}>
        <div style={{ fontSize:'9px', fontWeight:'600', letterSpacing:'3px', textTransform:'uppercase', color:'#00E5FF', marginBottom:'8px' }}>Account</div>
        <h1 style={{ fontFamily:"'Space Grotesk',sans-serif", fontSize:'32px', fontWeight:'700', color:'#E8E4DC' }}>Profile</h1>
      </div>

      <div style={{ display:'flex', gap:'4px', marginBottom:'24px', borderBottom:'1px solid rgba(0,229,255,0.08)' }}>
        {tabs.map(tab => (
          <button key={tab} onClick={() => { setActiveTab(tab); setError(''); setSuccess('') }}
            style={{ background:'none', border:'none', borderBottom: activeTab === tab ? '2px solid #00E5FF' : '2px solid transparent', padding:'12px 20px', color: activeTab === tab ? '#00E5FF' : '#8A8E99', fontSize:'11px', fontWeight:'600', letterSpacing:'1.5px', textTransform:'uppercase', cursor:'pointer', fontFamily:'Inter,sans-serif', marginBottom:'-1px' }}>
            {tab}
          </button>
        ))}
      </div>

      {error && <div style={{ background:'rgba(255,68,68,0.1)', border:'1px solid rgba(255,68,68,0.3)', padding:'12px 16px', marginBottom:'20px', fontSize:'12px', color:'#FF4444' }}>{error}</div>}
      {success && <div style={{ background:'rgba(0,255,136,0.1)', border:'1px solid rgba(0,255,136,0.3)', padding:'12px 16px', marginBottom:'20px', fontSize:'12px', color:'#00FF88' }}>{success}</div>}

      {activeTab === 'profile' && (
        <div style={cardStyle}>
          <div style={{ position:'absolute', top:0, left:0, width:'100%', height:'2px', background:'linear-gradient(90deg,#00E5FF,transparent)' }}></div>
          <div style={{ marginBottom:'16px' }}>
            <label style={labelStyle}>Full Name</label>
            <input style={inputStyle} value={form.full_name} onChange={e => setForm({...form, full_name: e.target.value})} />
          </div>
          <div style={{ marginBottom:'16px' }}>
            <label style={labelStyle}>Email Address</label>
            <input style={{...inputStyle, color:'#8A8E99', borderColor:'rgba(0,229,255,0.06)'}} value={user?.email || ''} disabled />
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'12px', marginBottom:'24px' }}>
            <div>
              <label style={labelStyle}>Phone</label>
              <input style={inputStyle} placeholder="+1 234 567 8900" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} />
            </div>
            <div>
              <label style={labelStyle}>Country</label>
              <input style={inputStyle} placeholder="United States" value={form.country} onChange={e => setForm({...form, country: e.target.value})} />
            </div>
          </div>
          <button onClick={handleUpdateProfile} disabled={loading}
            style={{ background:'#00E5FF', border:'none', color:'#0A0A0F', padding:'14px 32px', fontSize:'11px', fontWeight:'700', letterSpacing:'2px', textTransform:'uppercase', cursor:'pointer', fontFamily:'Inter,sans-serif', clipPath:'polygon(6px 0%,100% 0%,calc(100% - 6px) 100%,0% 100%)', opacity: loading ? 0.6 : 1 }}>
            {loading ? 'Saving...' : 'Save Changes →'}
          </button>
        </div>
      )}

      {activeTab === 'security' && (
        <div style={cardStyle}>
          <div style={{ position:'absolute', top:0, left:0, width:'100%', height:'2px', background:'linear-gradient(90deg,#00E5FF,transparent)' }}></div>
          {[
            { label:'Current Password', key:'current_password', placeholder:'Your current password' },
            { label:'New Password', key:'new_password', placeholder:'Min. 6 characters' },
            { label:'Confirm New Password', key:'confirm_password', placeholder:'Repeat new password' },
          ].map(field => (
            <div key={field.key} style={{ marginBottom:'16px' }}>
              <label style={labelStyle}>{field.label}</label>
              <input type="password" style={inputStyle} placeholder={field.placeholder}
                value={passwordForm[field.key]}
                onChange={e => setPasswordForm({...passwordForm, [field.key]: e.target.value})} />
            </div>
          ))}
          <button onClick={handleUpdatePassword} disabled={loading}
            style={{ background:'#00E5FF', border:'none', color:'#0A0A0F', padding:'14px 32px', fontSize:'11px', fontWeight:'700', letterSpacing:'2px', textTransform:'uppercase', cursor:'pointer', fontFamily:'Inter,sans-serif', clipPath:'polygon(6px 0%,100% 0%,calc(100% - 6px) 100%,0% 100%)', opacity: loading ? 0.6 : 1 }}>
            {loading ? 'Updating...' : 'Update Password →'}
          </button>
        </div>
      )}

      {activeTab === 'kyc' && (
        <div style={cardStyle}>
          <div style={{ position:'absolute', top:0, left:0, width:'100%', height:'2px', background:'linear-gradient(90deg,#00E5FF,transparent)' }}></div>

          {user?.kyc_status === 'verified' ? (
            <div style={{ textAlign:'center', padding:'32px 0' }}>
              <div style={{ fontSize:'48px', marginBottom:'16px' }}>✓</div>
              <div style={{ fontFamily:"'Space Grotesk',sans-serif", fontSize:'20px', fontWeight:'700', color:'#00FF88', marginBottom:'8px' }}>KYC Verified</div>
              <div style={{ fontSize:'13px', color:'#8A8E99' }}>Your identity has been verified successfully.</div>
            </div>
          ) : user?.kyc_status === 'pending' ? (
            <div style={{ textAlign:'center', padding:'32px 0' }}>
              <div style={{ fontSize:'48px', marginBottom:'16px' }}>⏳</div>
              <div style={{ fontFamily:"'Space Grotesk',sans-serif", fontSize:'20px', fontWeight:'700', color:'#FFD700', marginBottom:'8px' }}>Under Review</div>
              <div style={{ fontSize:'13px', color:'#8A8E99' }}>Your documents are being reviewed. This usually takes 24 hours.</div>
            </div>
          ) : (
            <>
              <div style={{ background:'rgba(0,229,255,0.04)', border:'1px solid rgba(0,229,255,0.1)', padding:'16px', marginBottom:'24px' }}>
                <div style={{ fontSize:'11px', fontWeight:'600', color:'#00E5FF', marginBottom:'6px' }}>KYC Verification Required</div>
                <div style={{ fontSize:'12px', color:'#8A8E99', lineHeight:'1.8' }}>
                  Identity verification is required for withdrawals above $5,000. Please submit the following documents.
                </div>
              </div>

              <div style={{ marginBottom:'16px' }}>
                <label style={labelStyle}>ID Type</label>
                <select style={{...inputStyle, cursor:'pointer'}} value={kycForm.id_type} onChange={e => setKycForm({...kycForm, id_type: e.target.value})}>
                  <option value="Passport">Passport</option>
                  <option value="National ID">National ID Card</option>
                  <option value="Driver's License">Driver's License</option>
                </select>
              </div>

              <div style={{ marginBottom:'16px' }}>
                <label style={labelStyle}>ID Number</label>
                <input style={inputStyle} placeholder="Enter your ID number" value={kycForm.id_number} onChange={e => setKycForm({...kycForm, id_number: e.target.value})} />
              </div>

              <div style={{ marginBottom:'16px' }}>
                <label style={labelStyle}>ID Document Photo *</label>
                <div style={{ border:'1px dashed rgba(0,229,255,0.2)', padding:'20px', textAlign:'center', cursor:'pointer', background:'#111320' }}
                  onClick={() => document.getElementById('id-upload').click()}>
                  {idImagePreview ? (
                    <img src={idImagePreview} alt="ID" style={{ maxWidth:'100%', maxHeight:'200px', objectFit:'contain' }} />
                  ) : (
                    <div>
                      <div style={{ fontSize:'24px', marginBottom:'8px', opacity:'0.4' }}>📄</div>
                      <div style={{ fontSize:'12px', color:'#8A8E99' }}>Click to upload your ID document</div>
                      <div style={{ fontSize:'10px', color:'#8A8E99', marginTop:'4px' }}>JPG, PNG up to 5MB</div>
                    </div>
                  )}
                </div>
                <input id="id-upload" type="file" accept="image/*" style={{ display:'none' }} onChange={e => handleFileChange(e, 'id')} />
              </div>

              <div style={{ marginBottom:'24px' }}>
                <label style={labelStyle}>Selfie with ID Document *</label>
                <div style={{ border:'1px dashed rgba(0,229,255,0.2)', padding:'20px', textAlign:'center', cursor:'pointer', background:'#111320' }}
                  onClick={() => document.getElementById('selfie-upload').click()}>
                  {selfiePreview ? (
                    <img src={selfiePreview} alt="Selfie" style={{ maxWidth:'100%', maxHeight:'200px', objectFit:'contain' }} />
                  ) : (
                    <div>
                      <div style={{ fontSize:'24px', marginBottom:'8px', opacity:'0.4' }}>🤳</div>
                      <div style={{ fontSize:'12px', color:'#8A8E99' }}>Click to upload selfie holding your ID</div>
                      <div style={{ fontSize:'10px', color:'#8A8E99', marginTop:'4px' }}>JPG, PNG up to 5MB</div>
                    </div>
                  )}
                </div>
                <input id="selfie-upload" type="file" accept="image/*" style={{ display:'none' }} onChange={e => handleFileChange(e, 'selfie')} />
              </div>

              <button onClick={handleSubmitKYC} disabled={loading}
                style={{ width:'100%', background:'#00E5FF', border:'none', color:'#0A0A0F', padding:'14px', fontSize:'11px', fontWeight:'700', letterSpacing:'2px', textTransform:'uppercase', cursor:'pointer', fontFamily:'Inter,sans-serif', clipPath:'polygon(6px 0%,100% 0%,calc(100% - 6px) 100%,0% 100%)', opacity: loading ? 0.6 : 1 }}>
                {loading ? 'Submitting...' : 'Submit KYC Documents →'}
              </button>
            </>
          )}
        </div>
      )}
    </div>
  )
}