'use client'

// React Imports
import { useEffect, useState } from 'react'

// Next Imports
import { useRouter } from 'next/navigation'

// Type Imports
import type { Locale } from '@configs/i18n'
import type { ChildrenType } from '@core/types'

// Util Imports
import { getLocalizedUrl } from '@/utils/i18n'

export default function AuthGuard({ children, locale }: ChildrenType & { locale: Locale }) {
  const router = useRouter()
  const [isChecking, setIsChecking] = useState(true)

  useEffect(() => {
    // Check for JWT token in localStorage
    const token = localStorage.getItem('accessToken')

    if (!token) {
      // No token = redirect to login
      router.replace(getLocalizedUrl('/login', locale))
    } else {
      // Token exists = allow access
      setIsChecking(false)
    }
  }, [router, locale])

  // Show nothing while checking (prevents flash of protected content)
  if (isChecking) {
    return null
  }

  // Token verified = render protected content
  return <>{children}</>
}
