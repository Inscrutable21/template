'use client';

import { useEffect } from 'react';
import { usePersonalization } from '@/hooks/usePersonalization';

export default function PersonalizedUI() {
  const { recommendations, isLoading } = usePersonalization();
  
  useEffect(() => {
    if (isLoading || !recommendations) return;
    
    // Apply UI customizations based on ChatGPT recommendations
    const applyUICustomizations = () => {
      const { uiCustomizations, layoutPreferences } = recommendations;
      const rootElement = document.documentElement;
      
      console.log('Applying UI customizations:', uiCustomizations);
      
      // Apply color theme
      if (uiCustomizations?.colorTheme) {
        // Remove any existing theme classes
        rootElement.classList.remove(
          'theme-default', 
          'theme-vibrant', 
          'theme-subtle', 
          'theme-professional'
        );
        
        // Add new theme class
        rootElement.classList.add(`theme-${uiCustomizations.colorTheme}`);
        
        // You could also set CSS variables for more granular control
        switch (uiCustomizations.colorTheme) {
          case 'vibrant':
            rootElement.style.setProperty('--primary-color', 'hsl(230, 100%, 50%)');
            rootElement.style.setProperty('--secondary-color', 'hsl(280, 100%, 60%)');
            break;
          case 'subtle':
            rootElement.style.setProperty('--primary-color', 'hsl(210, 30%, 50%)');
            rootElement.style.setProperty('--secondary-color', 'hsl(180, 30%, 60%)');
            break;
          case 'professional':
            rootElement.style.setProperty('--primary-color', 'hsl(210, 50%, 40%)');
            rootElement.style.setProperty('--secondary-color', 'hsl(150, 40%, 40%)');
            break;
          default: // default theme
            rootElement.style.setProperty('--primary-color', 'hsl(220, 70%, 50%)');
            rootElement.style.setProperty('--secondary-color', 'hsl(260, 70%, 60%)');
        }
      }
      
      // Apply font sizes
      if (uiCustomizations?.fontSizes) {
        // Remove existing font size classes
        rootElement.classList.remove(
          'font-size-small',
          'font-size-medium',
          'font-size-large'
        );
        
        // Add new font size class
        rootElement.classList.add(`font-size-${uiCustomizations.fontSizes}`);
        
        // Set base font size
        switch (uiCustomizations.fontSizes) {
          case 'small':
            rootElement.style.setProperty('--base-font-size', '0.875rem');
            break;
          case 'large':
            rootElement.style.setProperty('--base-font-size', '1.125rem');
            break;
          default: // medium
            rootElement.style.setProperty('--base-font-size', '1rem');
        }
      }
      
      // Apply spacing
      if (uiCustomizations?.spacing) {
        // Remove existing spacing classes
        rootElement.classList.remove(
          'spacing-compact',
          'spacing-balanced',
          'spacing-spacious'
        );
        
        // Add new spacing class
        rootElement.classList.add(`spacing-${uiCustomizations.spacing}`);
        
        // Set content spacing
        switch (uiCustomizations.spacing) {
          case 'compact':
            rootElement.style.setProperty('--content-spacing', '0.75rem');
            break;
          case 'spacious':
            rootElement.style.setProperty('--content-spacing', '1.5rem');
            break;
          default: // balanced
            rootElement.style.setProperty('--content-spacing', '1rem');
        }
      }
      
      // Apply navigation style
      if (layoutPreferences?.navigationStyle) {
        const navElement = document.querySelector('nav');
        if (navElement) {
          // Remove existing nav styles
          navElement.classList.remove(
            'nav-prominent', 
            'nav-standard', 
            'nav-minimal'
          );
          
          // Add new nav style
          navElement.classList.add(`nav-${layoutPreferences.navigationStyle}`);
        }
      }
      
      console.log('Applied UI customizations based on ChatGPT recommendations');
    };
    
    applyUICustomizations();
  }, [recommendations, isLoading]);
  
  // This component doesn't render anything visible
  return null;
}

