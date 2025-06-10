import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { headers } from 'next/headers';

export async function POST(request) {
  try {
    const { path, userId } = await request.json();
    const headersList = await headers();
    const userAgent = headersList.get('user-agent') || '';
    const ipAddress = headersList.get('x-forwarded-for') || '';
    
    // Create data object
    const pageViewData = {
      path,
      userAgent,
      ipAddress,
      timestamp: new Date()
    };
    
    // Add user relation if userId exists
    if (userId) {
      pageViewData.user = {
        connect: { id: userId }
      };
    }
    
    // Store in database
    await prisma.pageView.create({
      data: pageViewData
    });
    
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('Failed to store page view:', error);
    return NextResponse.json(
      { message: 'Failed to store page view', error: error.message },
      { status: 500 }
    );
  }
}

