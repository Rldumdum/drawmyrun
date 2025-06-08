// app/api/downloads/route.ts (or pages/api/downloads.ts for Pages Router)

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma'; // Adjust path to your Prisma instance
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth'; // Adjust path to your auth config

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const {
      fileName,
      distance,
      estimatedTime,
      markers,
      fileUrl,
      publicId,
      fileSize,
      userId
    } = body;

    // Validate required fields
    if (!fileName || !distance || !estimatedTime || !markers || !fileUrl || !userId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Ensure the userId matches the session user
    if (userId !== session.user.id) {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      );
    }

    // Create download record
    const download = await prisma.download.create({
      data: {
        fileName,
        distance: parseFloat(distance),
        estimatedTime,
        markers: parseInt(markers),
        fileUrl,
        publicId,
        fileSize: fileSize ? parseInt(fileSize) : null,
        userId,
      },
    });

    return NextResponse.json({
      success: true,
      download,
    });

  } catch (error) {
    console.error('Error creating download record:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Optional: GET method to retrieve user's downloads
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;

    const downloads = await prisma.download.findMany({
      where: {
        userId: session.user.id,
      },
      orderBy: {
        downloadedAt: 'desc',
      },
      skip,
      take: limit,
    });

    const total = await prisma.download.count({
      where: {
        userId: session.user.id,
      },
    });

    return NextResponse.json({
      downloads,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });

  } catch (error) {
    console.error('Error fetching downloads:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}