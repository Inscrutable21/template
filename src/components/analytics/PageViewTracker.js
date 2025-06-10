'use client'

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';

export function PageViewTracker() {
  const pathname = usePathname();
  const { user } = useAuth();
  
  useEffect(() => {
    // Skip tracking if disabled for this page
    if (window.disableAnalyticsTracking) {
      return;
    }
    
    const trackPageView = async () => {
      try {
        const userId = user?.id || null;
        console.log(`Tracking page view for ${pathname}, user: ${userId || 'anonymous'}`);
        
        await fetch('/api/analytics/pageview', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            path: pathname,
            userId: userId
          }),
        });
      } catch (error) {
        console.error('Failed to track page view:', error);
      }
    };
    
    trackPageView();
  }, [pathname, user]);
  
  return null;
}