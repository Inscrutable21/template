'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '@/hooks/useAuth';
import HeroSection from '@/components/home/HeroSection';
import FeaturesSection from '@/components/home/FeaturesSection';
import AboutSection from '@/components/home/AboutSection';
import TestimonialsSection from '@/components/home/TestimonialsSection';
import { usePersonalization } from '@/hooks/usePersonalization';
import Link from 'next/link';

export default function Home() {
  const { user } = useAuth();
  const { recommendations, refreshRecommendations, isLoading } = usePersonalization();
  const [greeting, setGreeting] = useState('Welcome');
  
  // Refresh recommendations on page load
  useEffect(() => {
    console.log('Home page mounted, refreshing recommendations');
    refreshRecommendations();
  }, [refreshRecommendations]);
  
  // Set personalized greeting based on user journey
  useEffect(() => {
    if (recommendations?.userJourney?.personalizedGreeting) {
      const greetingType = recommendations.userJourney.personalizedGreeting;
      const username = user?.name || 'there';
      
      switch (greetingType) {
        case 'returning':
          setGreeting(`Welcome back, ${username}!`);
          break;
        case 'new':
          setGreeting(`Hello ${username}, nice to meet you!`);
          break;
        case 'engaged':
          setGreeting(`Great to see you again, ${username}!`);
          break;
        default:
          setGreeting(`Welcome, ${username}!`);
      }
    }
  }, [recommendations, user]);
  
  const initialSections = [
    { id: 'hero', component: <HeroSection greeting={greeting} /> },
    { id: 'features', component: <FeaturesSection /> },
    { id: 'about', component: <AboutSection /> },
    { id: 'testimonials', component: <TestimonialsSection /> }
  ];
  
  // Reorder sections based on AI recommendations
  const sections = useMemo(() => {
    if (!recommendations?.topSections || isLoading) {
      return initialSections;
    }
    
    // Always keep hero section first
    const heroSection = initialSections.find(s => s.id === 'hero');
    const remainingSections = initialSections.filter(s => s.id !== 'hero');
    
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
    
    // Sort sections based on priority
    const sortedSections = [...remainingSections].sort((a, b) => {
      const priorityA = priorityMap[a.id] || 0;
      const priorityB = priorityMap[b.id] || 0;
      return priorityB - priorityA; // Higher priority first
    });
    
    // Return with hero first
    return [heroSection, ...sortedSections];
  }, [recommendations, isLoading, initialSections, greeting]);
  
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
  
  // Get UI customization classes
  const getUIClasses = () => {
    if (!recommendations?.uiCustomizations) return '';
    
    const { colorTheme, fontSizes, spacing } = recommendations.uiCustomizations;
    return `theme-${colorTheme || 'default'} font-size-${fontSizes || 'medium'} spacing-${spacing || 'balanced'}`;
  };
  
  // Apply call-to-action emphasis
  const getCtaEmphasis = () => {
    if (!recommendations?.userJourney?.callToActionEmphasis) return '';
    
    return `cta-emphasis-${recommendations.userJourney.callToActionEmphasis}`;
  };
  
  // Apply content grouping style
  const getContentGrouping = () => {
    if (!recommendations?.layoutPreferences?.contentGrouping) return '';
    
    return `content-group-${recommendations.layoutPreferences.contentGrouping}`;
  };
  
  // Check if user is authenticated
  const isAuthenticated = user !== null;
  
  // Check if recommendations match current auth state
  const recommendationsMatchAuthState = 
    recommendations?.userJourney?.authState === (isAuthenticated ? 'authenticated' : 'anonymous');
  
  // If recommendations don't match auth state, refresh them
  useEffect(() => {
    if (recommendations && !recommendationsMatchAuthState) {
      console.log('Auth state changed, refreshing recommendations');
      refreshRecommendations();
    }
  }, [isAuthenticated, recommendations, recommendationsMatchAuthState, refreshRecommendations]);
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-pulse text-center">
          <h2 className="text-2xl font-bold mb-4">Personalizing your experience...</h2>
          <p className="text-gray-600">Just a moment while we tailor the content for you</p>
        </div>
      </div>
    );
  }
  
  return (
    <main className={`${getContentSpacing()} ${getUIClasses()} ${getCtaEmphasis()} ${getContentGrouping()}`}>
      {/* Auth-specific CTA for logged-out users */}
      {!isAuthenticated && (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg mb-8 shadow-sm">
          <h3 className="text-lg font-medium mb-2">Get started with MyApp</h3>
          <div className="flex gap-4">
            <Link 
              href="/signup" 
              className="px-4 py-2 bg-foreground text-background rounded-md hover:bg-foreground/90 transition-colors"
            >
              Sign Up
            </Link>
            <Link 
              href="/login" 
              className="px-4 py-2 border border-foreground/20 rounded-md hover:bg-foreground/5 transition-colors"
            >
              Log In
            </Link>
          </div>
        </div>
      )}
      
      {/* Personalized suggested pages if available */}
      {recommendations?.userJourney?.suggestedNextPages?.length > 0 && (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg mb-8 shadow-sm">
          <h3 className="text-lg font-medium mb-2">Recommended for you</h3>
          <div className="flex gap-4 overflow-x-auto pb-2">
            {recommendations.userJourney.suggestedNextPages.map((page, index) => (
              <Link 
                key={index} 
                href={`/${page}`}
                className="px-4 py-2 bg-white rounded-md shadow-sm hover:shadow-md transition-shadow"
              >
                {page.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
              </Link>
            ))}
          </div>
        </div>
      )}
      
      {/* Main content sections */}
      {sections.map((section) => {
        // Check if this section should be emphasized
        const isEmphasized = recommendations?.uiCustomizations?.emphasis?.includes(section.id);
        const isDeemphasized = recommendations?.uiCustomizations?.deemphasis?.includes(section.id);
        
        // Apply emphasis classes
        const emphasisClass = isEmphasized ? 'section-emphasis' : 
                             isDeemphasized ? 'section-deemphasis' : '';
        
        // Check if this is featured content
        const isFeatured = recommendations?.layoutPreferences?.featuredContent?.includes(section.id);
        const featuredClass = isFeatured ? 'featured-content' : '';
        
        return (
          <div 
            key={section.id} 
            id={section.id} 
            className={`${emphasisClass} ${featuredClass}`}
            data-section-id={section.id}
            data-analytics-id={`section-${section.id}`}
            data-priority={recommendations?.topSections?.find(s => s.identifier === section.id)?.priority || 'default'}
            data-auth-state={isAuthenticated ? 'authenticated' : 'anonymous'}
          >
            {section.component}
            
            {/* Show reasoning for section priority (for development) */}
            {process.env.NODE_ENV === 'development' && (
              <div className="text-xs text-gray-400 mt-2 p-2 bg-gray-100 rounded">
                Priority: {recommendations?.topSections?.find(s => s.identifier === section.id)?.priority || 'default'} - 
                {recommendations?.topSections?.find(s => s.identifier === section.id)?.reasoning || 'No reasoning provided'}
              </div>
            )}
          </div>
        );
      })}
    </main>
  );
}


