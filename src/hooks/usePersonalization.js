import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';

export function usePersonalization() {
  const { user } = useAuth();
  const [recommendations, setRecommendations] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastInteraction, setLastInteraction] = useState(0);
  
  // Function to fetch recommendations
  const fetchRecommendations = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const queryParams = user?.id ? `?userId=${user.id}&t=${Date.now()}` : '';
      const response = await fetch(`/api/personalization/recommendations${queryParams}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error ${response.status}`);
      }
      
      const data = await response.json();
      setRecommendations(data.recommendations);
    } catch (err) {
      console.error('Failed to fetch personalization data:', err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Initial fetch and regular refresh
  useEffect(() => {
    fetchRecommendations();
    
    // Refresh recommendations every 30 seconds
    const interval = setInterval(fetchRecommendations, 30 * 1000);
    
    return () => clearInterval(interval);
  }, [user]);
  
  // Set up real-time interaction tracking
  useEffect(() => {
    const handleInteraction = () => {
      setLastInteraction(Date.now());
    };
    
    // Listen for clicks to trigger immediate refresh
    document.addEventListener('click', handleInteraction);
    
    return () => {
      document.removeEventListener('click', handleInteraction);
    };
  }, []);
  
  // Refresh data after user interactions with a small delay
  useEffect(() => {
    if (lastInteraction === 0) return;
    
    const timer = setTimeout(() => {
      fetchRecommendations();
    }, 2000); // Small delay to avoid too many requests
    
    return () => clearTimeout(timer);
  }, [lastInteraction]);
  
  // Function to manually refresh recommendations
  const refreshRecommendations = () => {
    fetchRecommendations();
  };
  
  return { 
    recommendations, 
    isLoading, 
    error, 
    refreshRecommendations 
  };
}




