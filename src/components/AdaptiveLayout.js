'use client'

import { usePersonalization } from '@/hooks/usePersonalization';
import { useState, useEffect } from 'react';

export default function AdaptiveLayout({ children }) {
  const { recommendations } = usePersonalization();
  const [layoutClass, setLayoutClass] = useState('');
  
  useEffect(() => {
    if (recommendations?.layoutPreferences) {
      const { contentDensity } = recommendations.layoutPreferences;
      
      // Apply different layout classes based on user preferences
      switch (contentDensity) {
        case 'high':
          setLayoutClass('max-w-7xl mx-auto px-4 space-y-4');
          break;
        case 'low':
          setLayoutClass('max-w-4xl mx-auto px-6 space-y-8');
          break;
        default:
          setLayoutClass('max-w-6xl mx-auto px-5 space-y-6');
      }
    }
  }, [recommendations]);
  
  return (
    <div className={layoutClass}>
      {children}
    </div>
  );
}