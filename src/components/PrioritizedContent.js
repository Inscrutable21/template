'use client'

import { usePersonalization } from '@/hooks/usePersonalization';
import { useState, useEffect } from 'react';

export default function PrioritizedContent({ sections }) {
  const { recommendations } = usePersonalization();
  const [orderedSections, setOrderedSections] = useState(sections);
  
  useEffect(() => {
    if (!recommendations?.topSections || sections.length === 0) {
      return;
    }
    
    // Create a map of section IDs to their priority based on user interactions
    const priorityMap = {};
    recommendations.topSections.forEach((section, index) => {
      if (section.identifier) {
        priorityMap[section.identifier] = 10 - index; // Higher value = higher priority
      }
    });
    
    // Sort sections based on priority
    const sorted = [...sections].sort((a, b) => {
      const priorityA = priorityMap[a.id] || 0;
      const priorityB = priorityMap[b.id] || 0;
      return priorityB - priorityA;
    });
    
    setOrderedSections(sorted);
  }, [recommendations, sections]);
  
  return (
    <div className="space-y-6">
      {orderedSections.map((section) => (
        <div key={section.id} id={section.id} className="bg-foreground/5 rounded-lg p-6">
          <h2 className="text-xl font-bold mb-4">{section.title}</h2>
          <div>{section.content}</div>
        </div>
      ))}
    </div>
  );
}