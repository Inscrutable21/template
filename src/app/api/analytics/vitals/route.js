import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { headers } from 'next/headers';

export async function POST(request) {
  try {
    const { name, value, path, userId } = await request.json();
    const headersList = await headers();
    const userAgent = headersList.get('user-agent') || '';
    
    // Create data object
    const vitalData = {
      name,
      value,
      path,
      userAgent,
      timestamp: new Date()
    };
    
    // Add user relation if userId exists
    if (userId) {
      vitalData.user = {
        connect: { id: userId }
      };
    }
    
    // Store in database
    await prisma.webVital.create({
      data: vitalData
    });
    
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('Failed to store web vital:', error);
    return NextResponse.json(
      { message: 'Failed to store web vital', error: error.message },
      { status: 500 }
    );
  }
}
