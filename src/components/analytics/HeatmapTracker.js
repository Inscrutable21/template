"use client"
import { useEffect, useRef } from 'react';
import { useAuth } from '@/hooks/useAuth';

// Create a custom event for real-time analytics
const ANALYTICS_EVENT = 'analytics-interaction';

export default function HeatmapTracker() {
  const { user } = useAuth();
  const sessionStartTime = useRef(Date.now());
  
  // Track page view on component mount
  useEffect(() => {
    // Don't track the analytics dashboard page
    if (window.location.pathname.includes('/analytics-dashboard')) {
      return;
    }
    
    // Track page view
    fetch('/api/analytics/pageview', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        path: window.location.pathname,
        userId: user?.id || null
      })
    }).catch(err => console.error('Failed to track page view:', err));
    
    // Track clicks
    const handleClick = (e) => {
      // Find the clicked element
      let element = e.target;
      
      // Find the closest interactive element (button, link, etc.)
      while (element && element !== document.body) {
        if (
          element.tagName === 'BUTTON' || 
          element.tagName === 'A' || 
          element.tagName === 'INPUT' || 
          element.tagName === 'SELECT' || 
          element.tagName === 'TEXTAREA' ||
          element.dataset.analyticsId
        ) {
          break;
        }
        element = element.parentElement;
      }
      
      // Find the closest section
      let section = e.target;
      let sectionId = null;
      while (section && section !== document.body) {
        if (section.tagName === 'SECTION' || section.id) {
          sectionId = section.id || null;
          break;
        }
        section = section.parentElement;
      }
      
      // Get element info
      const elementInfo = {
        type: element.tagName.toLowerCase(),
        id: element.id || null,
        class: element.className || null,
        text: element.innerText?.substring(0, 50) || null,
        sectionId: sectionId,
        dataset: {
          analyticsId: element.dataset.analyticsId || null,
          feature: element.dataset.feature || null,
          sectionId: element.dataset.sectionId || null
        },
        identifier: element.dataset.analyticsId || 
                   (sectionId ? `section-${sectionId}` : null)
      };
      
      // Calculate time on page
      const timeOnPage = Math.round((Date.now() - sessionStartTime.current) / 1000);
      
      // Send click data
      fetch('/api/analytics/heatmap', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          x: e.clientX,
          y: e.clientY,
          path: window.location.pathname,
          eventType: 'click',
          userId: user?.id || null,
          elementInfo: JSON.stringify(elementInfo),
          timeOnPage: timeOnPage,
          type: element.tagName.toLowerCase()
        })
      })
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP error ${response.status}`);
        }
        console.log('Click tracked successfully');
        
        // Dispatch custom event for real-time updates
        window.dispatchEvent(new CustomEvent(ANALYTICS_EVENT, {
          detail: {
            type: 'click',
            element: elementInfo,
            path: window.location.pathname
          }
        }));
      })
      .catch(err => console.error('Failed to track click:', err));
    };
    
    // Add click listener
    document.addEventListener('click', handleClick);
    
    return () => {
      document.removeEventListener('click', handleClick);
    };
  }, [user]);
  
  // Add or update scroll tracking
  useEffect(() => {
    if (window.location.pathname.includes('/analytics-dashboard')) {
      return;
    }
    
    let lastScrollPercentage = 0;
    
    const handleScroll = () => {
      // Calculate scroll percentage
      const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
      const scrollTop = document.documentElement.scrollTop;
      const scrollPercentage = Math.round((scrollTop / scrollHeight) * 100);
      
      // Only track if percentage changed significantly (by at least 5%)
      if (Math.abs(scrollPercentage - lastScrollPercentage) >= 5) {
        lastScrollPercentage = scrollPercentage;
        
        // Calculate time on page
        const timeOnPage = Math.round((Date.now() - sessionStartTime.current) / 1000);
        
        // Determine milestone
        let milestone = null;
        if (scrollPercentage >= 100) milestone = '100%';
        else if (scrollPercentage >= 75) milestone = '75%';
        else if (scrollPercentage >= 50) milestone = '50%';
        else if (scrollPercentage >= 25) milestone = '25%';
        
        // Get visible sections
        const visibleSections = getVisibleSections();
        
        // Send scroll data
        fetch('/api/analytics/heatmap', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            x: 0, // Not relevant for scroll
            y: scrollTop,
            path: window.location.pathname,
            eventType: 'scroll',
            userId: user?.id || null,
            scrollPercentage: scrollPercentage,
            milestone: milestone,
            visibleSections: visibleSections,
            timeOnPage: timeOnPage
          })
        }).catch(err => console.error('Failed to track scroll:', err));
      }
    };
    
    // Helper function to get visible sections
    const getVisibleSections = () => {
      const sections = document.querySelectorAll('section[id], div[id]');
      const visibleSections = [];
      
      sections.forEach(section => {
        const rect = section.getBoundingClientRect();
        if (rect.top < window.innerHeight && rect.bottom > 0) {
          visibleSections.push(section.id);
        }
      });
      
      return visibleSections.join(',');
    };
    
    // Add throttled scroll listener
    let scrollTimeout;
    const throttledScroll = () => {
      if (!scrollTimeout) {
        scrollTimeout = setTimeout(() => {
          handleScroll();
          scrollTimeout = null;
        }, 500); // Throttle to once per 500ms
      }
    };
    
    window.addEventListener('scroll', throttledScroll);
    
    // Track initial scroll position
    handleScroll();
    
    return () => {
      window.removeEventListener('scroll', throttledScroll);
      clearTimeout(scrollTimeout);
    };
  }, [user]);
  
  return null;
}

// Export the event name for other components to use
export const ANALYTICS_INTERACTION_EVENT = ANALYTICS_EVENT;


