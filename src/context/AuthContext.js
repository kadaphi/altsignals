'use client'
import { createContext, useContext, useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

const AuthContext = createContext({})

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const token = localStorage.getItem('as_token')
    if (token) {
      fetchUser(token)
    } else {
      setLoading(false)
    }
  }, [])

  async function fetchUser(token) {
    try {
      const res = await fetch('/api/auth/me', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      if (res.ok) {
        const data = await res.json()
        setUser(data.user)
      } else {
        localStorage.removeItem('as_token')
      }
    } catch {}
    finally { setLoading(false) }
  }

  function updateUser(updates) {
    setUser(prev => ({ ...prev, ...updates }))
  }

  async function logout() {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('as_token')}` }
      })
    } catch {}
    localStorage.removeItem('as_token')
    setUser(null)
    router.push('/auth/login')
  }

  return (
    <AuthContext.Provider value={{ user, loading, updateUser, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)