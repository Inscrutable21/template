import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { headers } from 'next/headers';

export async function POST(request) {
  try {
    const data = await request.json();
    console.log('Received heatmap event:', data);
    const headersList = await headers();
    
    // Extract data from request
    const { x, y, path, eventType, userId } = data;
    
    // Create base data object with only fields defined in the schema
    const eventData = {
      path,
      eventType,
      timestamp: new Date()
    };
    
    // Only add x and y if they are defined (for click events)
    if (x !== undefined) eventData.x = x;
    if (y !== undefined) eventData.y = y;
    
    // Add user relation if userId exists
    if (userId) {
      eventData.user = {
        connect: { id: userId }
      };
    }
    
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








