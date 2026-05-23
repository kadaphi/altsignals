'use client'
import { useState, useEffect } from 'react'

export default function AdminUsersPage() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [selectedUser, setSelectedUser] = useState(null)
  const [editForm, setEditForm] = useState({})
  const [saving, setSaving] = useState(false)

  useEffect(() => { fetchUsers() }, [])

  async function fetchUsers() {
    try {
      const res = await fetch('/api/admin/users', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('as_token')}` }
      })
      if (res.ok) {
        const data = await res.json()
        setUsers(data.users || [])
      }
    } catch {}
    finally { setLoading(false) }
  }

  async function handleSave() {
    setSaving(true)
    try {
      await fetch('/api/admin/users', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('as_token')}`
        },
        body: JSON.stringify({ user_id: selectedUser.id, updates: editForm })
      })
      setSelectedUser(null)
      fetchUsers()
    } catch {}
    finally { setSaving(false) }
  }

  const filtered = users.filter(u =>
    u.full_name?.toLowerCase().includes(search.toLowerCase()) ||
    u.email?.toLowerCase().includes(search.toLowerCase())
  )

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '400px' }}>
      <div style={{ width: '36px', height: '36px', border: '2px solid rgba(0,229,255,0.2)', borderTop: '2px solid #00E5FF', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
      <style>{`@keyframes spin{to{transform:rotate(360deg);}}`}</style>
    </div>
  )

  return (
    <div style={{ maxWidth: '1200px' }}>
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: '28px', fontWeight: '700', color: '#E8E4DC' }}>Users</h1>
        <div style={{ fontSize: '12px', color: '#8A8E99', marginTop: '4px' }}>{users.length} total users</div>
      </div>

      <input
        style={{ width: '100%', maxWidth: '400px', background: '#0F0F1A', border: '1px solid rgba(0,229,255,0.15)', padding: '12px 16px', color: '#E8E4DC', fontFamily: 'Inter,sans-serif', fontSize: '13px', outline: 'none', marginBottom: '24px' }}
        placeholder="Search by name or email..."
        value={search}
        onChange={e => setSearch(e.target.value)}
      />

      <div style={{ background: '#0F0F1A', border: '1px solid rgba(0,229,255,0.08)' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 2fr 1fr 1fr 1fr 1fr', gap: '16px', padding: '12px 20px', borderBottom: '1px solid rgba(0,229,255,0.08)', fontSize: '9px', fontWeight: '700', letterSpacing: '2px', textTransform: 'uppercase', color: '#8A8E99' }}>
          <div>Name</div>
          <div>Email</div>
          <div>Deposit Bal</div>
          <div>Withdraw Bal</div>
          <div>Status</div>
          <div>Actions</div>
        </div>
        {filtered.map((u, i) => (
          <div key={i} style={{ display: 'grid', gridTemplateColumns: '2fr 2fr 1fr 1fr 1fr 1fr', gap: '16px', padding: '14px 20px', borderBottom: '1px solid rgba(0,229,255,0.04)', alignItems: 'center' }}>
            <div style={{ fontSize: '12px', fontWeight: '500', color: '#E8E4DC' }}>{u.full_name}</div>
            <div style={{ fontSize: '11px', color: '#8A8E99' }}>{u.email}</div>
            <div style={{ fontSize: '12px', color: '#00E5FF' }}>${Number(u.deposit_balance || 0).toFixed(2)}</div>
            <div style={{ fontSize: '12px', color: '#00FF88' }}>${Number(u.withdrawal_balance || 0).toFixed(2)}</div>
            <div style={{ fontSize: '9px', fontWeight: '600', letterSpacing: '1px', color: u.is_banned ? '#FF4444' : u.is_verified ? '#00FF88' : '#FFD700' }}>
              {u.is_banned ? 'BANNED' : u.is_verified ? 'ACTIVE' : 'UNVERIFIED'}
            </div>
            <button onClick={() => { setSelectedUser(u); setEditForm({ deposit_balance: u.deposit_balance, withdrawal_balance: u.withdrawal_balance, account_level: u.account_level, is_banned: u.is_banned }) }} style={{ background: 'rgba(0,229,255,0.08)', border: '1px solid rgba(0,229,255,0.2)', color: '#00E5FF', padding: '6px 12px', fontSize: '10px', fontWeight: '600', cursor: 'pointer', fontFamily: 'Inter,sans-serif' }}>
              Edit
            </button>
          </div>
        ))}
      </div>

      {selectedUser && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
          <div style={{ background: '#0F0F1A', border: '1px solid rgba(0,229,255,0.2)', padding: '40px', maxWidth: '480px', width: '100%', position: 'relative' }}>
            <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '2px', background: 'linear-gradient(90deg,#00E5FF,transparent)' }}></div>
            <h2 style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: '20px', fontWeight: '700', color: '#E8E4DC', marginBottom: '4px' }}>{selectedUser.full_name}</h2>
            <div style={{ fontSize: '12px', color: '#8A8E99', marginBottom: '24px' }}>{selectedUser.email}</div>

            {[
              { label: 'Deposit Balance', key: 'deposit_balance', type: 'number' },
              { label: 'Withdrawal Balance', key: 'withdrawal_balance', type: 'number' },
              { label: 'Account Level', key: 'account_level', type: 'text' },
            ].map(field => (
              <div key={field.key} style={{ marginBottom: '16px' }}>
                <div style={{ fontSize: '9px', fontWeight: '600', letterSpacing: '2px', textTransform: 'uppercase', color: '#8A8E99', marginBottom: '8px' }}>{field.label}</div>
                <input
                  type={field.type}
                  style={{ width: '100%', background: '#111320', border: '1px solid rgba(0,229,255,0.15)', padding: '12px 16px', color: '#E8E4DC', fontFamily: 'Inter,sans-serif', fontSize: '13px', outline: 'none' }}
                  value={editForm[field.key] || ''}
                  onChange={e => setEditForm({...editForm, [field.key]: field.type === 'number' ? Number(e.target.value) : e.target.value})}
                />
              </div>
            ))}

            <div style={{ marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '12px' }}>
              <input type="checkbox" id="banned" checked={editForm.is_banned || false} onChange={e => setEditForm({...editForm, is_banned: e.target.checked})} />
              <label htmlFor="banned" style={{ fontSize: '12px', color: '#8A8E99', cursor: 'pointer' }}>Ban this user</label>
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
              <button onClick={() => setSelectedUser(null)} style={{ flex: 1, background: 'none', border: '1px solid rgba(0,229,255,0.2)', color: '#8A8E99', padding: '12px', fontSize: '10px', fontWeight: '600', letterSpacing: '2px', textTransform: 'uppercase', cursor: 'pointer', fontFamily: 'Inter,sans-serif' }}>Cancel</button>
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