import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request) {
  try {
    // Get query parameters
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const anonymous = searchParams.get('anonymous');
    
    // Build filter conditions
    const filter = {};
    if (userId) {
      filter.user = { id: userId };
    } else if (anonymous === 'true') {
      filter.user = null;
    }
    
    console.log('Applying filter:', filter);
    
    // Initialize data structures for analytics
    const heatmapPoints = {};
    const clicksByPath = {};
    const scrollDepthByPath = {};
    const elementClicks = {};
    const scrollMilestones = {};
    const sectionVisibility = {};
    const timeOnPage = {};
    
    try {
      // Get page views data with filter
      const pageViewsData = await prisma.pageView.groupBy({
        by: ['path'],
        _count: {
          path: true
        },
        where: filter,
        orderBy: {
          _count: {
            path: 'desc'
          }
        },
        take: 10
      });
      
      const pageViews = pageViewsData.map(item => ({
        path: item.path,
        count: item._count.path
      }));
      
      // Get web vitals data with filter
      const webVitalsData = await prisma.webVital.groupBy({
        by: ['name'],
        _avg: {
          value: true
        },
        where: filter
      });
      
      const webVitals = webVitalsData.map(item => ({
        name: item.name,
        value: item._avg.value
      }));
      
      // Get heatmap data with filter
      const heatmapData = await prisma.heatmapEvent.findMany({
        select: {
          x: true,
          y: true,
          path: true,
          eventType: true,
          elementInfo: true,
          scrollPercentage: true,
          timestamp: true,
          userId: true
          // Remove fields that don't exist in the schema
          // milestone: true,
          // visibleSections: true,
          // timeOnPage: true
        },
        where: filter,
        take: 1000,
        orderBy: {
          timestamp: 'desc'
        }
      });
      
      console.log(`Retrieved ${heatmapData.length} heatmap events with filter:`, filter);
      
      // Process heatmap data
      heatmapData.forEach(point => {
        // Skip analytics dashboard page data
        if (point.path.includes('/analytics-dashboard')) {
          return;
        }
        
        // Initialize path data if not exists
        if (!clicksByPath[point.path]) {
          clicksByPath[point.path] = 0;
        }
        
        // Track clicks by path
        if (point.eventType === 'click') {
          clicksByPath[point.path]++;
          
          // Process element clicks
          if (point.elementInfo) {
            try {
              const elementData = typeof point.elementInfo === 'string' 
                ? JSON.parse(point.elementInfo) 
                : point.elementInfo;
              
              // Use the identifier field if available, otherwise fallback to previous logic
              const elementKey = elementData.identifier || 
                                elementData.text || 
                                (elementData.id ? `#${elementData.id}` : '') || 
                                (elementData.class ? `.${elementData.class}` : '') || 
                                elementData.tag;
              
              if (elementKey && elementKey.length > 0) {
                const fullElementKey = `${point.path}:${elementKey}`;
                if (!elementClicks[fullElementKey]) {
                  elementClicks[fullElementKey] = {
                    path: point.path,
                    element: elementKey,
                    count: 0,
                    details: elementData,
                    type: elementData.tag
                  };
                }
                elementClicks[fullElementKey].count++;
              }
            } catch (e) {
              console.error('Error parsing element info:', e, point.elementInfo);
            }
          }
        }
        
        // Track scroll depth as percentage
        if (point.eventType === 'scroll' && point.scrollPercentage !== null) {
          if (!scrollDepthByPath[point.path]) {
            scrollDepthByPath[point.path] = {
              percentages: [],
              maxPercentage: 0,
              userCount: new Set()
            };
          }
          scrollDepthByPath[point.path].percentages.push(point.scrollPercentage);
          if (point.scrollPercentage > scrollDepthByPath[point.path].maxPercentage) {
            scrollDepthByPath[point.path].maxPercentage = point.scrollPercentage;
          }
          
          // Track unique users
          if (point.userId) {
            scrollDepthByPath[point.path].userCount.add(point.userId);
          } else {
            scrollDepthByPath[point.path].userCount.add('anonymous');
          }
        }
        
        // Track scroll milestones
        if (point.milestone) {
          if (!scrollMilestones[point.path]) {
            scrollMilestones[point.path] = {
              '25%': 0,
              '50%': 0,
              '75%': 0,
              '100%': 0
            };
          }
          
          if (scrollMilestones[point.path][point.milestone] !== undefined) {
            scrollMilestones[point.path][point.milestone]++;
          }
        }
        
        // Track visible sections
        if (point.visibleSections) {
          const sections = point.visibleSections.split(',');
          sections.forEach(section => {
            if (section) {
              const key = `${point.path}:${section}`;
              if (!sectionVisibility[key]) {
                sectionVisibility[key] = {
                  path: point.path,
                  section: section,
                  count: 0
                };
              }
              sectionVisibility[key].count++;
            }
          });
        }
        
        // Track time on page
        if (point.timeOnPage) {
          if (!timeOnPage[point.path]) {
            timeOnPage[point.path] = {
              path: point.path,
              times: [],
              maxTime: 0,
              avgTime: 0
            };
          }
          
          timeOnPage[point.path].times.push(point.timeOnPage);
          if (point.timeOnPage > timeOnPage[point.path].maxTime) {
            timeOnPage[point.path].maxTime = point.timeOnPage;
          }
        }
      });

      // Calculate averages and prepare data for frontend
      Object.keys(scrollDepthByPath).forEach(path => {
        const data = scrollDepthByPath[path];
        data.avgPercentage = Math.round(
          data.percentages.reduce((sum, p) => sum + p, 0) / data.percentages.length
        );
        data.userCount = data.userCount.size;
      });

      // Convert to arrays for the frontend
      const scrollDepthData = Object.entries(scrollDepthByPath)
        .filter(([path]) => !path.includes('/analytics-dashboard'))
        .map(([path, data]) => ({
          path,
          avgPercentage: data.avgPercentage,
          maxPercentage: data.maxPercentage,
          userCount: data.userCount
        }))
        .sort((a, b) => b.avgPercentage - a.avgPercentage);

      const scrollMilestoneData = Object.entries(scrollMilestones)
        .filter(([path]) => !path.includes('/analytics-dashboard'))
        .map(([path, milestones]) => ({
          path,
          ...milestones
        }));

      const sectionVisibilityData = Object.values(sectionVisibility)
        .sort((a, b) => b.count - a.count);

      const timeOnPageData = Object.values(timeOnPage)
        .map(item => {
          if (item.times.length > 0) {
            item.avgTime = Math.round(
              item.times.reduce((sum, time) => sum + time, 0) / item.times.length
            );
          }
          return item;
        })
        .sort((a, b) => b.avgTime - a.avgTime);

      // Convert to arrays for the frontend
      const clicksData = Object.entries(clicksByPath).map(([path, count]) => ({
        path,
        count
      })).sort((a, b) => b.count - a.count);

      // Element clicks data
      const elementClicksData = Object.values(elementClicks)
        .sort((a, b) => b.count - a.count)
        .slice(0, 20); // Top 20 most clicked elements

      // Return the data
      return NextResponse.json({
        pageViews,
        webVitals,
        heatmapData: Object.values(heatmapPoints),
        clicksData,
        elementClicksData,
        scrollDepthData,
        scrollMilestoneData,
        sectionVisibilityData,
        timeOnPageData
      }, { status: 200 });
    } catch (dbError) {
      console.error('Database error:', dbError);
      return NextResponse.json(
        { message: 'Database error', error: dbError.message },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Failed to fetch analytics data:', error);
    return NextResponse.json(
      { message: 'Failed to fetch analytics data', error: error.message },
      { status: 500 }
    );
  }
}






































