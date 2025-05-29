'use client'

import { usePersonalization } from '@/hooks/usePersonalization';
import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function PersonalizedContent() {
  const { recommendations, isLoading } = usePersonalization();
  
  // Format path to readable title
  const formatPathToTitle = (path) => {
    // Remove leading slash and split by remaining slashes
    const parts = path.replace(/^\//, '').split('/');
    
    // If it's the homepage, return "Home"
    if (parts.length === 1 && parts[0] === '') {
      return 'Home';
    }
    
    // Get the last meaningful part of the path
    const lastPart = parts[parts.length - 1] || parts[parts.length - 2] || '';
    
    // Replace hyphens with spaces and capitalize each word
    return lastPart
      .replace(/-/g, ' ')
      .replace(/\b\w/g, char => char.toUpperCase());
  };
  
  if (isLoading) {
    return <div className="animate-pulse h-48 bg-foreground/5 rounded-lg"></div>;
  }
  
  if (!recommendations) {
    return null;
  }
  
  return (
    <div className="bg-foreground/5 rounded-lg p-6">
      <h2 className="text-xl font-bold mb-4">Recommended for You</h2>
      
      {recommendations.topSections.length > 0 && (
        <div className="mb-6">
          <h3 className="font-semibold mb-2">Based on Your Interests</h3>
          <div className="grid grid-cols-1 gap-4">
            {recommendations.topSections.slice(0, 3).map((section, index) => (
              <div key={index} className="bg-background p-4 rounded-md shadow-sm">
                <div className="font-medium">
                  {section.text || `${section.type}: ${section.identifier}`}
                </div>
                <Link 
                  href={section.path} 
                  className="text-primary text-sm hover:underline"
                >
                  View content
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {recommendations.suggestedContent.length > 0 && (
        <div>
          <h3 className="font-semibold mb-2">Pages You Might Like</h3>
          <ul className="space-y-2">
            {recommendations.suggestedContent.map((path, index) => (
              <li key={index}>
                <Link 
                  href={path} 
                  className="text-primary hover:underline"
                >
                  {formatPathToTitle(path)}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
