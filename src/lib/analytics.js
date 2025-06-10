import prisma from '@/lib/prisma';

/**
 * Get analytics data for a specific user
 * @param {string|null} userId - The user ID or null for anonymous users
 * @returns {Promise<Object>} Analytics data for the user
 */
export async function getAnalyticsForUser(userId) {
  try {
    console.log(`Fetching analytics data for user: ${userId || 'anonymous'}`);
    
    // Build filter conditions
    const filter = {};
    if (userId) {
      filter.userId = userId;
    } else {
      // For anonymous users, only get data where userId is null
      filter.userId = null;
    }
    
    // Get page views
    const pageViews = await prisma.pageView.findMany({
      where: filter,
      orderBy: { timestamp: 'desc' },
      take: 50
    });
    
    // Get heatmap data
    const heatmapData = await prisma.heatmapEvent.findMany({
      where: filter,
      orderBy: { timestamp: 'desc' },
      take: 100
    });
    
    // Get web vitals
    const webVitals = await prisma.webVital.findMany({
      where: filter,
      orderBy: { timestamp: 'desc' },
      take: 50
    });
    
    // Process heatmap data to extract useful information
    const clicksByPath = {};
    const scrollDepthData = [];
    const elementClicksData = [];
    const sectionVisibilityData = [];
    
    heatmapData.forEach(event => {
      // Skip analytics dashboard page data
      if (event.path?.includes('/analytics-dashboard')) {
        return;
      }
      
      // Process clicks by path
      if (event.eventType === 'click') {
        if (!clicksByPath[event.path]) {
          clicksByPath[event.path] = 0;
        }
        clicksByPath[event.path]++;
        
        // Process element clicks
        if (event.elementInfo) {
          let elementKey = 'unknown-element';
          
          try {
            // Parse element info if it's a string
            const elementData = typeof event.elementInfo === 'string' 
              ? JSON.parse(event.elementInfo) 
              : event.elementInfo;
            
            // Extract the most useful identifier for this element
            elementKey = elementData.identifier || 
                          elementData.id || 
                          elementData.text || 
                          (elementData.class ? elementData.class.split(' ')[0] : '') || 
                          elementData.tag || 
                          'unknown-element';
          } catch (e) {
            console.error('Error parsing element info:', e);
          }
          
          // Check if this element already exists in our data
          const existingElement = elementClicksData.find(item => item.element === elementKey);
          
          if (existingElement) {
            existingElement.count++;
          } else {
            elementClicksData.push({ element: elementKey, count: 1 });
          }
        }
      }
      
      // Process scroll depth
      if (event.eventType === 'scroll' && event.scrollPercentage) {
        scrollDepthData.push({
          path: event.path,
          percentage: event.scrollPercentage,
          timestamp: event.timestamp
        });
      }
      
      // Process section visibility
      if (event.visibleSections) {
        const sections = typeof event.visibleSections === 'string' 
          ? event.visibleSections.split(',') 
          : [];
          
        sections.forEach(section => {
          if (!section) return;
          
          // Clean up section name
          const cleanSection = section.trim();
          
          if (!cleanSection) return;
          
          const existingSection = sectionVisibilityData.find(item => item.section === cleanSection);
          if (existingSection) {
            existingSection.count++;
          } else {
            sectionVisibilityData.push({ section: cleanSection, count: 1 });
          }
        });
      }
    });
    
    // Sort data by count
    elementClicksData.sort((a, b) => b.count - a.count);
    sectionVisibilityData.sort((a, b) => b.count - a.count);
    
    return {
      pageViews,
      webVitals,
      clicksByPath: Object.entries(clicksByPath).map(([path, count]) => ({ path, count })),
      scrollDepthData,
      elementClicksData,
      sectionVisibilityData
    };
  } catch (error) {
    console.error('Error getting analytics for user:', error);
    return {
      pageViews: [],
      webVitals: [],
      clicksByPath: [],
      scrollDepthData: [],
      elementClicksData: [],
      sectionVisibilityData: []
    };
  }
}

