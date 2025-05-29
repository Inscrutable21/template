import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { headers } from 'next/headers';

export async function POST(request) {
  try {
    const { path, userId } = await request.json();
    const headersList = await headers();
    const userAgent = headersList.get('user-agent') || '';
    const ipAddress = headersList.get('x-forwarded-for') || '';
    
    // Store in database
    await prisma.pageView.create({
      data: {
        path,
        userId,
        userAgent,
        ipAddress,
        timestamp: new Date()
      }
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
