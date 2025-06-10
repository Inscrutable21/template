import { NextResponse } from 'next/server';
import { generatePersonalizedRecommendations } from '@/lib/openai';
import { getAnalyticsForUser } from '@/lib/analytics';

// Simple in-memory cache to reduce API calls
const recommendationsCache = new Map();
const CACHE_TTL = 1000 * 60 * 30; // 30 minutes

export async function POST(request) {
  try {
    // Parse request body
    let body;
    try {
      body = await request.json();
    } catch (parseError) {
      console.error('Failed to parse request body:', parseError);
      return NextResponse.json({ 
        success: false, 
        error: 'Invalid request body' 
      }, { status: 400 });
    }
    
    const { analyticsData, userId, forceRefresh } = body;
    
    if (!analyticsData) {
      return NextResponse.json({ 
        success: false, 
        error: 'Missing analyticsData in request body' 
      }, { status: 400 });
    }
    
    const cacheKey = userId || 'anonymous';
    
    // Check cache if not forcing refresh
    if (!forceRefresh && recommendationsCache.has(cacheKey)) {
      const { recommendations, timestamp } = recommendationsCache.get(cacheKey);
      const now = Date.now();
      
      // Use cached recommendations if they're still valid
      if (now - timestamp < CACHE_TTL) {
        console.log(`Using cached recommendations for user: ${cacheKey}`);
        return NextResponse.json({ 
          success: true,
          recommendations,
          cached: true
        });
      }
      
      // Remove expired cache entry
      recommendationsCache.delete(cacheKey);
    }
    
    console.log(`Generating personalization for user: ${userId || 'anonymous'}, refresh: ${forceRefresh}`);
    
    // Generate recommendations using OpenAI
    const recommendations = await generatePersonalizedRecommendations(
      analyticsData, 
      userId || 'anonymous', 
      forceRefresh === true
    );
    
    // Cache the recommendations
    recommendationsCache.set(cacheKey, {
      recommendations,
      timestamp: Date.now()
    });
    
    // Log the recommendations for debugging
    console.log('Generated recommendations:', JSON.stringify(recommendations, null, 2));
    
    return NextResponse.json({ 
      success: true,
      recommendations,
      cached: false
    });
  } catch (error) {
    console.error('Error in personalization API:', error);
    return NextResponse.json({ 
      success: false, 
      error: error.message || 'Unknown error'
    }, { status: 500 });
  }
}

export async function GET(request) {
  try {
    // Get query parameters
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const refresh = searchParams.get('refresh') === 'true';
    
    const cacheKey = userId || 'anonymous';
    
    // Check cache if not forcing refresh
    if (!refresh && recommendationsCache.has(cacheKey)) {
      const { recommendations, timestamp } = recommendationsCache.get(cacheKey);
      const now = Date.now();
      
      // Use cached recommendations if they're still valid
      if (now - timestamp < CACHE_TTL) {
        console.log(`Using cached recommendations for user: ${cacheKey}`);
        return NextResponse.json({ 
          success: true,
          recommendations,
          cached: true
        });
      }
      
      // Remove expired cache entry
      recommendationsCache.delete(cacheKey);
    }
    
    console.log(`Fetching personalization for user: ${userId || 'anonymous'}, refresh: ${refresh}`);
    
    // Get user analytics data
    const analyticsData = await getAnalyticsForUser(userId);
    
    // Generate recommendations using OpenAI
    const recommendations = await generatePersonalizedRecommendations(
      analyticsData, 
      userId || 'anonymous', 
      refresh
    );
    
    // Cache the recommendations
    recommendationsCache.set(cacheKey, {
      recommendations,
      timestamp: Date.now()
    });
    
    // Log the recommendations for debugging
    console.log('Generated recommendations:', JSON.stringify(recommendations, null, 2));
    
    return NextResponse.json({ 
      success: true,
      recommendations,
      cached: false
    });
  } catch (error) {
    console.error('Error in personalization API:', error);
    return NextResponse.json({ 
      success: false, 
      error: error.message || 'Unknown error'
    }, { status: 500 });
  }
}




