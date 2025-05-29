import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { headers } from 'next/headers';

// Add caching to improve performance
const cache = new Map();
const CACHE_TTL = 10 * 1000; // 10 seconds cache

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const timestamp = searchParams.get('t'); // Used to bypass cache when needed
    
    // Check cache first (unless timestamp is provided to force refresh)
    const cacheKey = `recommendations-${userId || 'anonymous'}`;
    const cachedData = cache.get(cacheKey);
    
    if (cachedData && !timestamp && Date.now() - cachedData.timestamp < CACHE_TTL) {
      return NextResponse.json({
        success: true,
        recommendations: cachedData.data,
        fromCache: true
      });
    }
    
    // If no userId, return generic recommendations
    if (!userId) {
      const genericRecommendations = {
        topSections: [],
        suggestedContent: [],
        layoutPreferences: { contentDensity: 'medium' }
      };
      
      // Store in cache
      cache.set(cacheKey, {
        timestamp: Date.now(),
        data: genericRecommendations
      });
      
      return NextResponse.json({
        success: true,
        recommendations: genericRecommendations
      });
    }
    
    // Get user's click data - limit to recent clicks for faster response
    const clickData = await prisma.heatmapEvent.findMany({
      where: {
        userId: userId,
        eventType: 'click',
        timestamp: {
          gte: new Date(Date.now() - 24 * 60 * 60 * 1000) // Last 24 hours
        }
      },
      orderBy: {
        timestamp: 'desc'
      },
      take: 100
    });
    
    // Get user's scroll data
    const scrollData = await prisma.heatmapEvent.findMany({
      where: {
        userId: userId,
        eventType: 'scroll'
      },
      orderBy: {
        timestamp: 'desc'
      },
      take: 100
    });
    
    // Analyze most clicked elements
    const elementClicks = {};
    clickData.forEach(click => {
      try {
        if (click.elementInfo) {
          const info = typeof click.elementInfo === 'string' 
            ? JSON.parse(click.elementInfo) 
            : click.elementInfo;
          
          // Use data-analytics-id if available
          const identifier = info.identifier || 
                            (info.dataset && info.dataset.analyticsId) || 
                            `${info.type}:${info.id || info.class || 'unknown'}`;
          
          // Group by section type for ratio calculations
          let sectionType = 'unknown';
          if (identifier.includes('feature-')) sectionType = 'feature';
          else if (identifier.includes('testimonial-')) sectionType = 'testimonial';
          else if (identifier.includes('section-')) sectionType = 'section';
          
          const key = `${sectionType}:${identifier}`;
          
          if (!elementClicks[key]) {
            elementClicks[key] = {
              count: 0,
              type: info.type,
              identifier: identifier,
              text: info.text || '',
              path: click.path,
              sectionType: sectionType
            };
          }
          
          elementClicks[key].count++;
        }
      } catch (e) {
        console.error('Error parsing element info:', e);
      }
    });

    // Calculate ratios for each section type
    const sectionTypes = ['feature', 'testimonial', 'section'];
    const ratiosByType = {};

    sectionTypes.forEach(type => {
      const elementsOfType = Object.values(elementClicks)
        .filter(el => el.sectionType === type);
      
      const totalClicksForType = elementsOfType.reduce((sum, el) => sum + el.count, 0);
      
      elementsOfType.forEach(el => {
        el.ratio = totalClicksForType > 0 ? el.count / totalClicksForType : 0;
      });
    });

    // Get top clicked elements with ratio information
    const topElements = Object.values(elementClicks)
      .sort((a, b) => b.count - a.count)
      .slice(0, 20);

    // Analyze most viewed pages
    const pageViews = {};
    [...clickData, ...scrollData].forEach(event => {
      if (!pageViews[event.path]) {
        pageViews[event.path] = 0;
      }
      pageViews[event.path]++;
    });
    
    // Get top viewed pages
    const topPages = Object.entries(pageViews)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([path]) => path);
    
    // Analyze scroll depth preferences
    const scrollDepths = scrollData.map(s => s.scrollPercentage || 0);
    const avgScrollDepth = scrollDepths.length > 0
      ? scrollDepths.reduce((sum, depth) => sum + depth, 0) / scrollDepths.length
      : 0;
    
    // Determine content density preference based on scroll behavior
    let contentDensity = 'medium';
    if (avgScrollDepth > 75) {
      contentDensity = 'high'; // User scrolls a lot, can handle dense content
    } else if (avgScrollDepth < 40) {
      contentDensity = 'low'; // User doesn't scroll much, needs spacious layout
    }
    
    // Build recommendations
    const recommendations = {
      topSections: topElements.map(el => ({
        type: el.type,
        identifier: el.identifier,
        text: el.text,
        path: el.path,
        count: el.count,
        ratio: el.ratio || 0,
        sectionType: el.sectionType,
        priority: el.ratio > 0.3 ? 'high' : el.ratio > 0.1 ? 'medium' : 'low'
      })),
      suggestedContent: topPages,
      layoutPreferences: {
        contentDensity
      }
    };
    
    // Store in cache
    cache.set(cacheKey, {
      timestamp: Date.now(),
      data: recommendations
    });
    
    return NextResponse.json({
      success: true,
      recommendations
    });
  } catch (error) {
    console.error('Failed to generate recommendations:', error);
    return NextResponse.json(
      { message: 'Failed to generate recommendations', error: error.message },
      { status: 500 }
    );
  }
}


