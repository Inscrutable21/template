'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';

export function HeatmapTracker() {
  const pathname = usePathname();
  const { user } = useAuth();
  const lastScrollTime = useRef(0);
  const lastClickTime = useRef(0);
  const scrollTimeout = useRef(null);
  
  useEffect(() => {
    // Skip tracking if disabled for this page
    if (typeof window !== 'undefined' && window.disableAnalyticsTracking) {
      return;
    }
    
    const trackClick = async (e) => {
      // Throttle clicks to one per second
      const now = Date.now();
      if (now - lastClickTime.current < 1000) return;
      lastClickTime.current = now;
      
      try {
        const userId = user?.id || null;
        const rect = e.target.getBoundingClientRect();
        const x = Math.round(e.clientX - rect.left);
        const y = Math.round(e.clientY - rect.top);
        
        // Get element info
        let elementInfo = '';
        if (e.target.id) {
          elementInfo = `#${e.target.id}`;
        } else if (e.target.className && typeof e.target.className === 'string') {
          elementInfo = `.${e.target.className.split(' ')[0]}`;
        } else {
          elementInfo = e.target.tagName.toLowerCase();
        }
        
        // Get data attributes
        const dataAttributes = {};
        for (const key in e.target.dataset) {
          dataAttributes[key] = e.target.dataset[key];
        }
        
        if (Object.keys(dataAttributes).length > 0) {
          elementInfo += ` ${JSON.stringify(dataAttributes)}`;
        }
        
        console.log(`Tracking click at (${x}, ${y}) on ${elementInfo}`);
        
        await fetch('/api/analytics/heatmap', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            x,
            y,
            path: pathname,
            eventType: 'click',
            elementInfo,
            userId
          }),
        });
      } catch (error) {
        console.error('Failed to track click:', error);
      }
    };
    
    const trackScroll = async () => {
      // Throttle scroll events
      const now = Date.now();
      if (now - lastScrollTime.current < 2000) {
        // Reset the timeout if we're scrolling
        if (scrollTimeout.current) {
          clearTimeout(scrollTimeout.current);
        }
        
        scrollTimeout.current = setTimeout(() => {
          trackScroll();
        }, 2000);
        
        return;
      }
      
      lastScrollTime.current = now;
      
      try {
        const userId = user?.id || null;
        
        // Calculate scroll percentage
        const scrollTop = window.scrollY || document.documentElement.scrollTop;
        const scrollHeight = document.documentElement.scrollHeight;
        const clientHeight = document.documentElement.clientHeight;
        const scrollPercentage = Math.round((scrollTop / (scrollHeight - clientHeight)) * 100);
        
        // Get visible sections
        const sections = document.querySelectorAll('section, [data-section]');
        const visibleSections = [];
        
        sections.forEach(section => {
          const rect = section.getBoundingClientRect();
          const isVisible = rect.top < window.innerHeight && rect.bottom > 0;
          
          if (isVisible) {
            const sectionId = section.id || section.dataset.section || section.className.split(' ')[0];
            if (sectionId) {
              visibleSections.push(sectionId);
            }
          }
        });
        
        console.log(`Tracking scroll at ${scrollPercentage}%, visible sections: ${visibleSections}`);
        
        await fetch('/api/analytics/heatmap', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            path: pathname,
            eventType: 'scroll',
            scrollPercentage,
            visibleSections: visibleSections.join(','),
            userId
          }),
        });
      } catch (error) {
        console.error('Failed to track scroll:', error);
      }
    };
    
    // Add event listeners
    window.addEventListener('click', trackClick);
    window.addEventListener('scroll', () => {
      if (scrollTimeout.current) {
        clearTimeout(scrollTimeout.current);
      }
      
      scrollTimeout.current = setTimeout(() => {
        trackScroll();
      }, 500);
    });
    
    // Initial scroll tracking
    trackScroll();
    
    // Cleanup
    return () => {
      window.removeEventListener('click', trackClick);
      window.removeEventListener('scroll', () => {});
      if (scrollTimeout.current) {
        clearTimeout(scrollTimeout.current);
      }
    };
  }, [pathname, user]);
  
  return null;
}


