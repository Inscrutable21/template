'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import HeroSection from '@/components/home/HeroSection';
import FeaturesSection from '@/components/home/FeaturesSection';
import AboutSection from '@/components/home/AboutSection';
import TestimonialsSection from '@/components/home/TestimonialsSection';
import { useRatioPrioritization } from '@/hooks/useRatioPrioritization';
import { usePersonalization } from '@/hooks/usePersonalization';

export default function Home() {
  const { user } = useAuth();
  const { recommendations } = usePersonalization();
  const initialSections = [
    { id: 'hero', component: <HeroSection /> },
    { id: 'features', component: <FeaturesSection /> },
    { id: 'about', component: <AboutSection /> },
    { id: 'testimonials', component: <TestimonialsSection /> }
  ];
  
  // Use the ratio prioritization hook with a 10% threshold
  // Hero section is fixed and will never move
  const { prioritizedItems: sections } = useRatioPrioritization(
    initialSections, 
    'section', 
    0.1, 
    ['hero'] // Hero section is fixed
  );
  
  // Apply content density from user preferences
  const getContentSpacing = () => {
    if (!recommendations?.layoutPreferences) return 'space-y-16';
    
    const { contentDensity } = recommendations.layoutPreferences;
    switch (contentDensity) {
      case 'high': return 'space-y-8';
      case 'low': return 'space-y-24';
      default: return 'space-y-16';
    }
  };
  
  // Memoize sections to prevent unnecessary re-renders
  const memoizedSections = React.useMemo(() => {
    return {
      hero: sections.find(s => s.id === 'hero')?.component,
      others: sections.filter(s => s.id !== 'hero').map(section => (
        <div 
          key={section.id} 
          id={section.id} 
          data-section-id={section.id}
          data-analytics-id={`section-${section.id}`}
        >
          {section.component}
        </div>
      ))
    };
  }, [sections]);
  
  return (
    <main className={`${getContentSpacing()}`}>
      {/* Hero section always stays at the top */}
      {memoizedSections.hero}
      
      {/* Render other sections in the prioritized order */}
      {memoizedSections.others}
    </main>
  );
}


