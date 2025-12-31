// utils/gtm.ts
// Google Tag Manager Utility Functions

export interface GTMParams {
  utm_source?: string
  utm_medium?: string
  utm_campaign?: string
  utm_term?: string
  utm_content?: string
  gclid?: string // Google Ads Click ID
  fbclid?: string // Facebook Click ID
  referrer?: string
}

export interface GTMEvent {
  event: string
  [key: string]: any
}

/**
 * Extract UTM and tracking parameters from URL
 */
export const extractTrackingParams = (): GTMParams => {
  if (typeof window === 'undefined') return {}

  const urlParams = new URLSearchParams(window.location.search)

  return {
    utm_source: urlParams.get('utm_source') || undefined,
    utm_medium: urlParams.get('utm_medium') || undefined,
    utm_campaign: urlParams.get('utm_campaign') || undefined,
    utm_term: urlParams.get('utm_term') || undefined,
    utm_content: urlParams.get('utm_content') || undefined,
    gclid: urlParams.get('gclid') || undefined,
    fbclid: urlParams.get('fbclid') || undefined,
    referrer: document.referrer || undefined
  }
}

/**
 * Store tracking params in sessionStorage for later use
 */
export const storeTrackingParams = (params: GTMParams = extractTrackingParams()) => {
  if (typeof window === 'undefined') return

  // Only store if there are actual params
  const hasParams = Object.values(params).some(val => val !== undefined)

  if (hasParams) {
    sessionStorage.setItem('trackingParams', JSON.stringify(params))
    console.log('📊 Stored tracking params:', params)
  }
}

/**
 * Retrieve stored tracking params
 */
export const getStoredTrackingParams = (): GTMParams => {
  if (typeof window === 'undefined') return {}

  try {
    const stored = sessionStorage.getItem('trackingParams')

    return stored ? JSON.parse(stored) : {}
  } catch (error) {
    console.error('Error retrieving tracking params:', error)

    return {}
  }
}

/**
 * Clear stored tracking params
 */
export const clearTrackingParams = () => {
  if (typeof window === 'undefined') return
  sessionStorage.removeItem('trackingParams')
}

/**
 * Initialize GTM DataLayer
 */
export const initGTMDataLayer = () => {
  if (typeof window === 'undefined') return

  window.dataLayer = window.dataLayer || []
}

/**
 * Push event to GTM DataLayer
 */
export const pushToDataLayer = (data: GTMEvent) => {
  if (typeof window === 'undefined') return

  window.dataLayer = window.dataLayer || []
  window.dataLayer.push(data)

  console.log('📤 Pushed to dataLayer:', data)
}

/**
 * Track page view with UTM parameters
 */
export const trackPageView = (pagePath: string, pageTitle?: string) => {
  const params = getStoredTrackingParams()

  pushToDataLayer({
    event: 'pageview',
    page: {
      path: pagePath,
      title: pageTitle || document.title,
      url: window.location.href
    },
    ...params
  })
}

/**
 * Track lead creation with source attribution
 */
export const trackLeadCreation = (leadData: { leadId: string; name: string; email: string; source?: string }) => {
  const params = getStoredTrackingParams()

  pushToDataLayer({
    event: 'lead_created',
    lead: leadData,
    attribution: params
  })
}

/**
 * Track form submission
 */
export const trackFormSubmit = (formName: string, formData?: any) => {
  const params = getStoredTrackingParams()

  pushToDataLayer({
    event: 'form_submit',
    form: {
      name: formName,
      ...formData
    },
    attribution: params
  })
}

/**
 * Track lead status change
 */
export const trackLeadStatusChange = (leadId: string, oldStatus: string, newStatus: string) => {
  pushToDataLayer({
    event: 'lead_status_change',
    lead: {
      id: leadId,
      oldStatus,
      newStatus
    }
  })
}

// Extend Window interface for TypeScript
declare global {
  interface Window {
    dataLayer: any[]
  }
}
