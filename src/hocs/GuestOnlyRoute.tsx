'use client'

// React Imports
import { useEffect, useState } from 'react'

// Next Imports
import { useRouter } from 'next/navigation'

// Type Imports
import type { ChildrenType } from '@core/types'
import type { Locale } from '@configs/i18n'

// Config Imports
import themeConfig from '@configs/themeConfig'

// Util Imports
import { getLocalizedUrl } from '@/utils/i18n'

const GuestOnlyRoute = ({ children, lang }: ChildrenType & { lang: Locale }) => {
  const router = useRouter()
  const [isChecking, setIsChecking] = useState(true)

  useEffect(() => {
    // Check for JWT token
    const token = localStorage.getItem('accessToken')

    if (token) {
      // Already logged in = redirect to dashboard
      router.replace(getLocalizedUrl(themeConfig.homePageUrl, lang))
    } else {
      // No token = allow access to guest pages (login/register)
      setIsChecking(false)
    }
  }, [router, lang])

  // Show nothing while checking
  if (isChecking) {
    return null
  }

  // Not logged in = render guest content (login/register forms)
  return <>{children}</>
}

export default GuestOnlyRoute
