'use client';

import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './useAuth';

// Create a context for personalization data
const PersonalizationContext = createContext();

// Cache recommendations in localStorage with expiration
const CACHE_KEY = 'personalization_recommendations';
const CACHE_EXPIRY = 1000 * 60 * 30; // 30 minutes

// Default recommendations based on auth state
const getDefaultRecommendations = (isAuthenticated) => {
  return {
    topSections: [
      { identifier: isAuthenticated ? "dashboard" : "features", priority: "high", reasoning: "Default high priority section" },
      { identifier: isAuthenticated ? "settings" : "pricing", priority: "medium", reasoning: "Default medium priority section" },
      { identifier: "about", priority: "low", reasoning: "Default low priority section" }
    ],
    uiCustomizations: {
      colorTheme: isAuthenticated ? "professional" : "vibrant",
      fontSizes: "medium",
      spacing: "balanced",
      emphasis: isAuthenticated ? ["dashboard-link"] : ["signup-cta", "login-link"],
      deemphasis: []
    },
    layoutPreferences: {
      contentDensity: "medium",
      navigationStyle: isAuthenticated ? "standard" : "prominent",
      featuredContent: isAuthenticated ? ["dashboard"] : ["features"],
      contentGrouping: "relevance"
    },
    userJourney: {
      suggestedNextPages: isAuthenticated 
        ? ["dashboard", "settings"] 
        : ["signup", "login", "features"],
      callToActionEmphasis: isAuthenticated ? "moderate" : "strong",
      personalizedGreeting: isAuthenticated ? "returning" : "new",
      authState: isAuthenticated ? "authenticated" : "anonymous"
    }
  };
};

// Helper to check if cached data is valid
const getCachedRecommendations = (userId) => {
  try {
    const cachedData = localStorage.getItem(CACHE_KEY);
    if (!cachedData) return null;
    
    const { recommendations, timestamp, cachedUserId } = JSON.parse(cachedData);
    const now = Date.now();
    
    // Check if cache is expired or user changed
    if (now - timestamp > CACHE_EXPIRY || cachedUserId !== userId) {
      console.log('Cache expired or user changed, clearing cache');
      localStorage.removeItem(CACHE_KEY);
      return null;
    }
    
    console.log('Using cached recommendations');
    return recommendations;
  } catch (error) {
    console.error('Error reading cache:', error);
    localStorage.removeItem(CACHE_KEY);
    return null;
  }
};

// Helper to cache recommendations
const cacheRecommendations = (recommendations, userId) => {
  try {
    const cacheData = {
      recommendations,
      timestamp: Date.now(),
      cachedUserId: userId || 'anonymous'
    };
    localStorage.setItem(CACHE_KEY, JSON.stringify(cacheData));
  } catch (error) {
    console.error('Error caching recommendations:', error);
  }
};

// Track user behavior changes to determine if refresh is needed
let behaviorChangeCount = 0;
const BEHAVIOR_THRESHOLD = 5; // Number of significant actions before forcing refresh

export function PersonalizationProvider({ children }) {
  const { user } = useAuth();
  const [recommendations, setRecommendations] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [lastRefreshTime, setLastRefreshTime] = useState(0);
  
  // Function to refresh recommendations
  const refreshRecommendations = useCallback(async (forceRefresh = false) => {
    const userId = user?.id || 'anonymous';
    const isAuthenticated = !!user;
    const now = Date.now();
    
    // Check if we should use cached data
    if (!forceRefresh) {
      // Check time-based throttling (prevent refreshes more often than every 5 minutes)
      const timeSinceLastRefresh = now - lastRefreshTime;
      if (lastRefreshTime > 0 && timeSinceLastRefresh < 1000 * 60 * 5) {
        console.log(`Skipping refresh, last refresh was ${Math.round(timeSinceLastRefresh/1000)}s ago`);
        return;
      }
      
      // Try to use cached recommendations
      const cachedRecommendations = getCachedRecommendations(userId);
      if (cachedRecommendations) {
        setRecommendations(cachedRecommendations);
        setIsLoading(false);
        return;
      }
    }
    
    console.log(`Refreshing recommendations for user: ${userId}, force: ${forceRefresh}`);
    setIsLoading(true);
    
    try {
      // Get analytics data from API
      const response = await fetch('/api/analytics/user-data');
      
      // Check if response is OK
      if (!response.ok) {
        throw new Error(`Analytics API returned ${response.status}: ${response.statusText}`);
      }
      
      const analyticsData = await response.json();
      
      // Add auth state to analytics data
      analyticsData.isAuthenticated = isAuthenticated;
      analyticsData.userId = userId;
      
      // Get personalized recommendations
      const recommendationsResponse = await fetch('/api/personalization/recommendations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          analyticsData,
          userId,
          forceRefresh
        })
      });
      
      if (!recommendationsResponse.ok) {
        throw new Error(`Recommendations API returned ${recommendationsResponse.status}`);
      }
      
      const result = await recommendationsResponse.json();
      
      if (result.success && result.recommendations) {
        // Cache the recommendations
        cacheRecommendations(result.recommendations, userId);
        
        // Reset behavior change counter after successful refresh
        behaviorChangeCount = 0;
        
        // Update state
        setRecommendations(result.recommendations);
        setLastRefreshTime(now);
      } else {
        throw new Error('Invalid recommendations response');
      }
    } catch (error) {
      console.error('Error refreshing recommendations:', error);
      // Set default recommendations based on auth state
      const defaultRecs = getDefaultRecommendations(isAuthenticated);
      setRecommendations(defaultRecs);
      cacheRecommendations(defaultRecs, userId);
    } finally {
      setIsLoading(false);
    }
  }, [user, lastRefreshTime]);

  // Track significant user behaviors to trigger refresh when needed
  const trackBehaviorChange = useCallback(() => {
    behaviorChangeCount++;
    console.log(`Behavior change detected (${behaviorChangeCount}/${BEHAVIOR_THRESHOLD})`);
    
    if (behaviorChangeCount >= BEHAVIOR_THRESHOLD) {
      console.log('Behavior threshold reached, refreshing recommendations');
      refreshRecommendations(true);
    }
  }, [refreshRecommendations]);

  // Refresh recommendations when user auth state changes
  useEffect(() => {
    const userId = user?.id || 'anonymous';
    const currentAuthState = recommendations?.userJourney?.authState;
    const expectedAuthState = user ? 'authenticated' : 'anonymous';
    
    // Force refresh if auth state changed
    if (recommendations && currentAuthState !== expectedAuthState) {
      console.log('Auth state changed, forcing recommendation refresh');
      refreshRecommendations(true);
    } else {
      refreshRecommendations(false);
    }
  }, [user, recommendations, refreshRecommendations]);

  return (
    <PersonalizationContext.Provider value={{ 
      recommendations, 
      refreshRecommendations, 
      isLoading,
      trackBehaviorChange 
    }}>
      {children}
    </PersonalizationContext.Provider>
  );
}

export function usePersonalization() {
  return useContext(PersonalizationContext);
}



