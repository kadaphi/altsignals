'use client'
import { useState } from 'react'
import { useAuth } from '@/context/AuthContext'

export default function ProfilePage() {
  const { user, updateUser } = useAuth()
  const [activeTab, setActiveTab] = useState('profile')
  const [form, setForm] = useState({ full_name: user?.full_name || '' })
  const [passwordForm, setPasswordForm] = useState({ current_password: '', new_password: '', confirm_password: '' })
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
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('as_token')}`
        },
        body: JSON.stringify({ full_name: form.full_name })
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
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('as_token')}`
        },
        body: JSON.stringify({ current_password: passwordForm.current_password, new_password: passwordForm.new_password })
      })
      const data = await res.json()
      if (!res.ok) return setError(data.error)
      setSuccess('Password updated successfully')
      setPasswordForm({ current_password: '', new_password: '', confirm_password: '' })
    } catch { setError('Something went wrong') }
    finally { setLoading(false) }
  }

  const tabs = ['profile', 'security']
  if (user?.withdrawal_balance >= 5000) tabs.push('kyc')

  return (
    <div style={{ maxWidth: '700px' }}>
      <div style={{ marginBottom: '28px' }}>
        <div style={{ fontSize: '9px', fontWeight: '600', letterSpacing: '3px', textTransform: 'uppercase', color: '#00E5FF', marginBottom: '8px' }}>Account</div>
        <h1 style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: '32px', fontWeight: '700', color: '#E8E4DC' }}>Profile</h1>
      </div>

      <div style={{ display: 'flex', gap: '4px', marginBottom: '24px', borderBottom: '1px solid rgba(0,229,255,0.08)', paddingBottom: '0' }}>
        {tabs.map(tab => (
          <button key={tab} onClick={() => { setActiveTab(tab); setError(''); setSuccess('') }} style={{ background: 'none', border: 'none', borderBottom: activeTab === tab ? '2px solid #00E5FF' : '2px solid transparent', padding: '12px 20px', color: activeTab === tab ? '#00E5FF' : '#8A8E99', fontSize: '11px', fontWeight: '600', letterSpacing: '1.5px', textTransform: 'uppercase', cursor: 'pointer', fontFamily: 'Inter,sans-serif', transition: 'all 0.2s', marginBottom: '-1px' }}>
            {tab}
          </button>
        ))}
      </div>

      {error && <div style={{ background: 'rgba(255,68,68,0.1)', border: '1px solid rgba(255,68,68,0.3)', padding: '12px 16px', marginBottom: '20px', fontSize: '12px', color: '#FF4444' }}>{error}</div>}
      {success && <div style={{ background: 'rgba(0,255,136,0.1)', border: '1px solid rgba(0,255,136,0.3)', padding: '12px 16px', marginBottom: '20px', fontSize: '12px', color: '#00FF88' }}>{success}</div>}

      {activeTab === 'profile' && (
        <div style={{ background: '#0F0F1A', border: '1px solid rgba(0,229,255,0.08)', padding: '32px', position: 'relative' }}>
          <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '2px', background: 'linear-gradient(90deg,#00E5FF,transparent)' }}></div>
          <div style={{ marginBottom: '16px' }}>
            <div style={{ fontSize: '9px', fontWeight: '600', letterSpacing: '2px', textTransform: 'uppercase', color: '#8A8E99', marginBottom: '8px' }}>Full Name</div>
            <input style={{ width: '100%', background: '#111320', border: '1px solid rgba(0,229,255,0.15)', padding: '14px 16px', color: '#E8E4DC', fontFamily: 'Inter,sans-serif', fontSize: '13px', outline: 'none' }} value={form.full_name} onChange={e => setForm({...form, full_name: e.target.value})} />
          </div>
          <div style={{ marginBottom: '24px' }}>
            <div style={{ fontSize: '9px', fontWeight: '600', letterSpacing: '2px', textTransform: 'uppercase', color: '#8A8E99', marginBottom: '8px' }}>Email Address</div>
            <input style={{ width: '100%', background: '#111320', border: '1px solid rgba(0,229,255,0.08)', padding: '14px 16px', color: '#8A8E99', fontFamily: 'Inter,sans-serif', fontSize: '13px', outline: 'none' }} value={user?.email || ''} disabled />
          </div>
          <button onClick={handleUpdateProfile} disabled={loading} style={{ background: '#00E5FF', border: 'none', color: '#0A0A0F', padding: '14px 32px', fontSize: '11px', fontWeight: '700', letterSpacing: '2px', textTransform: 'uppercase', cursor: 'pointer', fontFamily: 'Inter,sans-serif', clipPath: 'polygon(6px 0%,100% 0%,calc(100% - 6px) 100%,0% 100%)', opacity: loading ? 0.6 : 1 }}>
            {loading ? 'Saving...' : 'Save Changes →'}
          </button>
        </div>
      )}

      {activeTab === 'security' && (
        <div style={{ background: '#0F0F1A', border: '1px solid rgba(0,229,255,0.08)', padding: '32px', position: 'relative' }}>
          <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '2px', background: 'linear-gradient(90deg,#00E5FF,transparent)' }}></div>
          <div style={{ marginBottom: '16px' }}>
            <div style={{ fontSize: '9px', fontWeight: '600', letterSpacing: '2px', textTransform: 'uppercase', color: '#8A8E99', marginBottom: '8px' }}>Current Password</div>
            <input type="password" style={{ width: '100%', background: '#111320', border: '1px solid rgba(0,229,255,0.15)', padding: '14px 16px', color: '#E8E4DC', fontFamily: 'Inter,sans-serif', fontSize: '13px', outline: 'none' }} value={passwordForm.current_password} onChange={e => setPasswordForm({...passwordForm, current_password: e.target.value})} />
          </div>
          <div style={{ marginBottom: '16px' }}>
            <div style={{ fontSize: '9px', fontWeight: '600', letterSpacing: '2px', textTransform: 'uppercase', color: '#8A8E99', marginBottom: '8px' }}>New Password</div>
            <input type="password" style={{ width: '100%', background: '#111320', border: '1px solid rgba(0,229,255,0.15)', padding: '14px 16px', color: '#E8E4DC', fontFamily: 'Inter,sans-serif', fontSize: '13px', outline: 'none' }} value={passwordForm.new_password} onChange={e => setPasswordForm({...passwordForm, new_password: e.target.value})} />
          </div>
          <div style={{ marginBottom: '24px' }}>
            <div style={{ fontSize: '9px', fontWeight: '600', letterSpacing: '2px', textTransform: 'uppercase', color: '#8A8E99', marginBottom: '8px' }}>Confirm New Password</div>
            <input type="password" style={{ width: '100%', background: '#111320', border: '1px solid rgba(0,229,255,0.15)', padding: '14px 16px', color: '#E8E4DC', fontFamily: 'Inter,sans-serif', fontSize: '13px', outline: 'none' }} value={passwordForm.confirm_password} onChange={e => setPasswordForm({...passwordForm, confirm_password: e.target.value})} />
          </div>
          <button onClick={handleUpdatePassword} disabled={loading} style={{ background: '#00E5FF', border: 'none', color: '#0A0A0F', padding: '14px 32px', fontSize: '11px', fontWeight: '700', letterSpacing: '2px', textTransform: 'uppercase', cursor: 'pointer', fontFamily: 'Inter,sans-serif', clipPath: 'polygon(6px 0%,100% 0%,calc(100% - 6px) 100%,0% 100%)', opacity: loading ? 0.6 : 1 }}>
            {loading ? 'Updating...' : 'Update Password →'}
          </button>
        </div>
      )}

      {activeTab === 'kyc' && (
        <div style={{ background: '#0F0F1A', border: '1px solid rgba(0,229,255,0.08)', padding: '32px', position: 'relative' }}>
          <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '2px', background: 'linear-gradient(90deg,#00E5FF,transparent)' }}></div>
          <p style={{ fontSize: '13px', color: '#8A8E99', lineHeight: '1.8', marginBottom: '24px' }}>
            KYC verification is required for withdrawals above $5,000. Please submit your identity documents below.
          </p>
          <div style={{ background: 'rgba(0,229,255,0.06)', border: '1px solid rgba(0,229,255,0.15)', padding: '16px', marginBottom: '24px' }}>
            <div style={{ fontSize: '11px', color: '#00E5FF', fontWeight: '600', marginBottom: '4px' }}>Current Status</div>
            <div style={{ fontSize: '13px', color: '#E8E4DC', textTransform: 'capitalize' }}>{user?.kyc_status || 'Not Submitted'}</div>
          </div>
          <div style={{ fontSize: '12px', color: '#8A8E99', lineHeight: '1.8' }}>
            Please contact support via live chat to submit your KYC documents.
          </div>
        </div>
      )}
    </div>
  )
}