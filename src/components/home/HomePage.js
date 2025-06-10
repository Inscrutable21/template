'use client'

import { useEffect, useState } from 'react';
import { usePersonalization } from '@/hooks/usePersonalization';
import FeaturesSection from '@/components/home/FeaturesSection';
import AboutSection from '@/components/home/AboutSection';
import TestimonialsSection from '@/components/home/TestimonialsSection';
import HeroSection from '@/components/home/HeroSection';

export default function HomePage() {
  console.log('HomePage component rendered');
  const { recommendations, refreshRecommendations, isLoading } = usePersonalization();
  const [orderedSections, setOrderedSections] = useState([]);
  
  // Refresh recommendations on page load/refresh
  useEffect(() => {
    console.log('HomePage mounted, refreshing recommendations');
    refreshRecommendations();
  }, [refreshRecommendations]);
  
  // Reorder sections based on recommendations
  useEffect(() => {
    console.log('Processing recommendations for section ordering:', recommendations?.topSections);
    
    // Define all available sections
    const allSections = [
      { id: 'hero', component: <HeroSection key="hero" /> },
      { id: 'features', component: <FeaturesSection key="features" /> },
      { id: 'testimonials', component: <TestimonialsSection key="testimonials" /> },
      { id: 'about', component: <AboutSection key="about" /> }
    ];
    
    if (!recommendations?.topSections || recommendations.topSections.length === 0) {
      // Default order if no recommendations
      setOrderedSections(allSections);
      return;
    }
    
    // Always keep hero section first
    const heroSection = allSections.find(s => s.id === 'hero');
    const remainingSections = allSections.filter(s => s.id !== 'hero');
    
    // Create priority map from recommendations
    const priorityMap = {};
    recommendations.topSections.forEach(section => {
      if (section.identifier) {
        // Higher number = higher priority
        priorityMap[section.identifier] = 
          section.priority === 'high' ? 3 : 
          section.priority === 'medium' ? 2 : 1;
      }
    });
    
    console.log('Priority map for sections:', priorityMap);
    
    // Sort sections based on priority
    const sortedSections = [...remainingSections].sort((a, b) => {
      const priorityA = priorityMap[a.id] || 0;
      const priorityB = priorityMap[b.id] || 0;
      return priorityB - priorityA; // Higher priority first
    });
    
    // Set ordered sections with hero first
    const finalOrder = [heroSection, ...sortedSections];
    console.log('Final section order:', finalOrder.map(s => s.id));
    setOrderedSections(finalOrder);
    
  }, [recommendations]);
  
  // Apply UI customizations based on recommendations
  const uiCustomizations = recommendations?.uiCustomizations || {
    colorTheme: 'default',
    fontSizes: 'medium',
    spacing: 'balanced'
  };
  
  if (isLoading) {
    return <div className="loading">Loading personalized experience...</div>;
  }
  
  return (
    <main className={`home-page theme-${uiCustomizations.colorTheme} font-size-${uiCustomizations.fontSizes} spacing-${uiCustomizations.spacing}`}>
      {orderedSections.map((section, index) => (
        <div 
          key={section.id} 
          id={section.id} 
          data-section-id={section.id}
          data-analytics-id={`section-${section.id}`}
          data-priority={recommendations?.topSections?.find(s => s.identifier === section.id)?.priority || 'default'}
        >
          {section.component}
        </div>
      ))}
    </main>
  );
}



