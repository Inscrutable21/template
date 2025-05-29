import { useState, useEffect, useRef } from 'react';
import { usePersonalization } from './usePersonalization';
import { ANALYTICS_INTERACTION_EVENT } from '@/components/analytics/HeatmapTracker';

/**
 * Custom hook for ratio-based prioritization of content
 * @param {Array} items - Array of items to prioritize
 * @param {String} sectionType - Type of section (e.g., 'feature', 'testimonial')
 * @param {Number} threshold - Minimum ratio difference to trigger reordering (0.1 = 10%)
 * @param {Array} fixedItems - Array of item IDs that should never move (e.g., 'hero')
 * @returns {Array} - Prioritized array of items
 */
export function useRatioPrioritization(items, sectionType, threshold = 0.1, fixedItems = []) {
  const { recommendations, refreshRecommendations } = usePersonalization();
  const [prioritizedItems, setPrioritizedItems] = useState(items);
  const localInteractions = useRef({});
  const lastUpdate = useRef(Date.now());
  const updateDebounce = useRef(null);
  
  // Initialize local interactions from items
  useEffect(() => {
    if (items && items.length > 0) {
      const initialInteractions = {};
      items.forEach(item => {
        initialInteractions[item.id] = 0;
      });
      localInteractions.current = initialInteractions;
    }
  }, []);
  
  // Listen for real-time analytics events
  useEffect(() => {
    const handleAnalyticsEvent = (event) => {
      const { detail } = event;
      
      // Only process relevant clicks for this section type
      if (detail.type === 'click' && 
          detail.element?.identifier?.includes(sectionType)) {
        
        const itemId = detail.element.identifier.replace(`${sectionType}-`, '');
        
        // Update local interaction counts
        if (localInteractions.current[itemId] !== undefined) {
          localInteractions.current[itemId] = (localInteractions.current[itemId] || 0) + 1;
          
          // Debounce updates to avoid too frequent re-renders
          if (updateDebounce.current) {
            clearTimeout(updateDebounce.current);
          }
          
          updateDebounce.current = setTimeout(() => {
            updatePrioritization();
            // Refresh server data if it's been more than 5 seconds
            if (Date.now() - lastUpdate.current > 5000) {
              refreshRecommendations();
              lastUpdate.current = Date.now();
            }
          }, 100);
        }
      }
    };
    
    window.addEventListener(ANALYTICS_INTERACTION_EVENT, handleAnalyticsEvent);
    
    return () => {
      window.removeEventListener(ANALYTICS_INTERACTION_EVENT, handleAnalyticsEvent);
      if (updateDebounce.current) {
        clearTimeout(updateDebounce.current);
      }
    };
  }, [items, refreshRecommendations, sectionType]);
  
  // Update from server recommendations
  useEffect(() => {
    if (!recommendations?.topSections || !recommendations.topSections.length) {
      return;
    }
    
    // Extract relevant interactions for this section type
    const relevantInteractions = recommendations.topSections.filter(section => 
      section.identifier && 
      section.identifier.includes(sectionType)
    );
    
    if (relevantInteractions.length === 0) return;
    
    // Update local interaction counts from server data
    relevantInteractions.forEach(section => {
      const itemId = section.identifier.replace(`${sectionType}-`, '');
      if (localInteractions.current[itemId] !== undefined) {
        localInteractions.current[itemId] = section.count || 0;
      }
    });
    
    // Only update if we have actual changes to make
    const shouldUpdate = relevantInteractions.some(section => {
      const itemId = section.identifier.replace(`${sectionType}-`, '');
      return localInteractions.current[itemId] !== undefined;
    });
    
    if (shouldUpdate) {
      updatePrioritization();
    }
  }, [recommendations]);
  
  // Function to update prioritization based on interaction ratios
  const updatePrioritization = () => {
    // Calculate total interactions
    const totalInteractions = Object.values(localInteractions.current)
      .reduce((sum, count) => sum + count, 0);
    
    if (totalInteractions === 0) return;
    
    // Create ratio map
    const ratioMap = {};
    Object.entries(localInteractions.current).forEach(([id, count]) => {
      ratioMap[id] = count / totalInteractions;
    });
    
    // Separate fixed items and movable items
    const fixedItemsObjects = items.filter(item => fixedItems.includes(item.id));
    const movableItems = items.filter(item => !fixedItems.includes(item.id));
    
    // Sort movable items based on interaction ratio
    const sortedMovableItems = [...movableItems].sort((a, b) => {
      const ratioA = ratioMap[a.id] || 0;
      const ratioB = ratioMap[b.id] || 0;
      
      // Only reorder if the ratio difference exceeds the threshold
      if (Math.abs(ratioB - ratioA) < threshold) {
        // Maintain original order if difference is small
        return items.findIndex(item => item.id === a.id) - 
               items.findIndex(item => item.id === b.id);
      }
      
      return ratioB - ratioA;
    });
    
    // Combine fixed items (in their original positions) with sorted movable items
    const newPrioritizedItems = [...items];
    
    // Replace movable items with their sorted versions
    let movableIndex = 0;
    for (let i = 0; i < newPrioritizedItems.length; i++) {
      if (!fixedItems.includes(newPrioritizedItems[i].id)) {
        newPrioritizedItems[i] = sortedMovableItems[movableIndex];
        movableIndex++;
      }
    }
    
    setPrioritizedItems(newPrioritizedItems);
  };
  
  // Function to manually record an interaction
  const recordInteraction = (itemId) => {
    if (localInteractions.current[itemId] !== undefined) {
      localInteractions.current[itemId] = (localInteractions.current[itemId] || 0) + 1;
      updatePrioritization();
    }
  };
  
  return { prioritizedItems, recordInteraction };
}
