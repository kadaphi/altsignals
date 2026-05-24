'use client'
import { useEffect } from 'react'
import { usePathname } from 'next/navigation'

export default function VisitorTracker() {
  const pathname = usePathname()

  useEffect(() => {
    const skipPaths = ['/dashboard', '/admin']
    const shouldSkip = skipPaths.some(p => pathname.startsWith(p))
    if (shouldSkip) return

    fetch('/api/visit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ page: pathname, userAgent: navigator.userAgent })
    }).catch(() => {})
  }, [pathname])

  return null
}