'use client'

import { useReportWebVitals } from 'next/web-vitals'
import { useAuth } from '@/hooks/useAuth'

export function WebVitals() {
  const { user } = useAuth()
  
  useReportWebVitals((metric) => {
    // Skip tracking if disabled for this page
    if (window.disableAnalyticsTracking) {
      return;
    }
    
    const body = JSON.stringify({
      name: metric.name,
      value: metric.value,
      path: window.location.pathname,
      userId: user?.id || null
    })
    
    const url = '/api/analytics/vitals'
    
    // Use sendBeacon when available for better performance
    if (navigator.sendBeacon) {
      navigator.sendBeacon(url, body)
    } else {
      fetch(url, { 
        body, 
        method: 'POST', 
        keepalive: true,
        headers: { 'Content-Type': 'application/json' }
      })
    }
  })
  
  return null
}

