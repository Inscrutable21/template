import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import prisma from '@/lib/prisma';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export async function GET() {
  try {
    // Get token from cookies - await the cookies() call
    const cookieStore = await cookies();
    const token = cookieStore.get('auth_token')?.value;
    
    let userId = null;
    let isAuthenticated = false;
    
    // If token exists, verify it
    if (token) {
      try {
        const decoded = jwt.verify(token, JWT_SECRET);
        userId = decoded.userId;
        isAuthenticated = true;
      } catch (tokenError) {
        console.error('Token verification error:', tokenError);
      }
    }
    
    // Get basic analytics data
    let analyticsData = {
      userId,
      isAuthenticated,
      pageViews: [],
      clicksData: [],
      scrollDepthData: []
    };
    
    // If user is authenticated, get more detailed analytics
    if (userId) {
      try {
        // Get page views
        const pageViews = await prisma.pageView.findMany({
          where: { 
            user: { id: userId } 
          },
          orderBy: { timestamp: 'desc' },
          take: 20
        });
        
        // Get heatmap events for clicks
        const clicks = await prisma.heatmapEvent.findMany({
          where: { 
            user: { id: userId },
            eventType: 'click'
          },
          orderBy: { timestamp: 'desc' },
          take: 50
        });
        
        // Get heatmap events for scroll depth
        const scrollDepth = await prisma.heatmapEvent.findMany({
          where: { 
            user: { id: userId },
            eventType: 'scroll'
          },
          orderBy: { timestamp: 'desc' },
          take: 20
        });
        
        analyticsData = {
          ...analyticsData,
          pageViews,
          clicksData: clicks,
          scrollDepthData: scrollDepth
        };
      } catch (dbError) {
        console.error('Database error:', dbError);
        // Continue with basic analytics if DB fails
      }
    }
    
    return NextResponse.json(analyticsData);
  } catch (error) {
    console.error('Error fetching user data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user data' },
      { status: 500 }
    );
  }
}

