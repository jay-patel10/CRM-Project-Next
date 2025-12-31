// components/GTMProvider.tsx
'use client'

import { useEffect } from 'react'

import { usePathname, useSearchParams } from 'next/navigation'

import { initGTMDataLayer, storeTrackingParams, trackPageView } from '@/utils/gtm'

interface GTMProviderProps {
  children: React.ReactNode
  gtmId?: string // Optional: If you want to load GTM script
}

export const GTMProvider = ({ children, gtmId }: GTMProviderProps) => {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  // Initialize on mount
  useEffect(() => {
    initGTMDataLayer()

    // Store tracking params if present in URL
    storeTrackingParams()
  }, [])

  // Track page views on route change
  useEffect(() => {
    if (pathname) {
      trackPageView(pathname)
    }
  }, [pathname, searchParams])

  // Optional: Load GTM script if gtmId is provided
  useEffect(() => {
    if (!gtmId || typeof window === 'undefined') return

    // GTM script injection
    const script = document.createElement('script')

    script.innerHTML = `
      (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
      new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
      j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
      'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
      })(window,document,'script','dataLayer','${gtmId}');
    `
    document.head.appendChild(script)

    // GTM noscript fallback
    const noscript = document.createElement('noscript')
    const iframe = document.createElement('iframe')

    iframe.src = `https://www.googletagmanager.com/ns.html?id=${gtmId}`
    iframe.height = '0'
    iframe.width = '0'
    iframe.style.display = 'none'
    iframe.style.visibility = 'hidden'
    noscript.appendChild(iframe)
    document.body.insertBefore(noscript, document.body.firstChild)

    return () => {
      // Cleanup
      document.head.removeChild(script)
      document.body.removeChild(noscript)
    }
  }, [gtmId])

  return <>{children}</>
}
