import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { headers } from 'next/headers';

export async function POST(request) {
  try {
    const data = await request.json();
    console.log('Received heatmap event:', data);
    const headersList = headers();
    const userAgent = headersList.get('user-agent') || '';
    
    // Extract data from request
    const { x, y, path, eventType, userId } = data;
    
    // Create base data object
    const eventData = {
      x,
      y,
      path,
      eventType,
      userId,
      userAgent,
      timestamp: new Date()
    };
    
    // Add element info if it exists
    if (data.elementInfo) {
      eventData.elementInfo = data.elementInfo;
    }
    
    // Add scroll percentage if it exists
    if (data.scrollPercentage !== undefined) {
      eventData.scrollPercentage = data.scrollPercentage;
    }

    // Add visible sections if they exist
    if (data.visibleSections) {
      eventData.visibleSections = data.visibleSections;
    }

    // Add time on page if it exists
    if (data.timeOnPage) {
      eventData.timeOnPage = data.timeOnPage;
    }

    // Add milestone if it exists
    if (data.milestone) {
      eventData.milestone = data.milestone;
    }
    
    console.log('Saving heatmap event:', eventData);
    
    // Store in database
    const result = await prisma.heatmapEvent.create({
      data: eventData
    });
    
    console.log('Heatmap event saved with ID:', result.id);
    return NextResponse.json({ success: true, id: result.id }, { status: 200 });
  } catch (error) {
    console.error('Failed to store heatmap event:', error);
    return NextResponse.json(
      { message: 'Failed to store heatmap event', error: error.message },
      { status: 500 }
    );
  }
}


