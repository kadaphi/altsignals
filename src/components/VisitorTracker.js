'use client'
import { useEffect } from 'react'
import { usePathname } from 'next/navigation'

export default function VisitorTracker() {
  const pathname = usePathname()

  useEffect(() => {
    const skipPaths = ['/dashboard', '/admin']
    const shouldSkip = skipPaths.some(p => pathname.startsWith(p))
    if (shouldSkip) return

    const sessionKey = 'as_visitor_tracked'
    if (sessionStorage.getItem(sessionKey)) return

    sessionStorage.setItem(sessionKey, '1')

    fetch('/api/visit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ page: pathname, userAgent: navigator.userAgent })
    }).catch(() => {})
  }, [])

  return null
}