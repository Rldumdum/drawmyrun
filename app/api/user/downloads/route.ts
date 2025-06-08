import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma'; // Adjust path to your Prisma instance
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth'; // Adjust path to your auth config

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized - Please log in' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    
    // Pagination parameters
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get('limit') || '10')));
    const skip = (page - 1) * limit;
    
    // Sorting parameters
    const sortBy = searchParams.get('sortBy') || 'downloadedAt';
    const sortOrder = searchParams.get('sortOrder') === 'asc' ? 'asc' : 'desc';
    
    // Filter parameters
    const minDistance = searchParams.get('minDistance') ? parseFloat(searchParams.get('minDistance')!) : undefined;
    const maxDistance = searchParams.get('maxDistance') ? parseFloat(searchParams.get('maxDistance')!) : undefined;
    const dateFrom = searchParams.get('dateFrom') ? new Date(searchParams.get('dateFrom')!) : undefined;
    const dateTo = searchParams.get('dateTo') ? new Date(searchParams.get('dateTo')!) : undefined;

    // Build where clause for filtering
    const whereClause: import('@prisma/client').Prisma.DownloadWhereInput = {
      userId: session.user.id,
    };

    // Add distance filters
    if (minDistance !== undefined || maxDistance !== undefined) {
      whereClause.distance = {};
      if (minDistance !== undefined) whereClause.distance.gte = minDistance;
      if (maxDistance !== undefined) whereClause.distance.lte = maxDistance;
    }

    // Add date filters
    if (dateFrom || dateTo) {
      whereClause.createdAt = {};
      if (dateFrom) whereClause.createdAt.gte = dateFrom;
      if (dateTo) {
        // Set time to end of day for dateTo
        const endOfDay = new Date(dateTo);
        endOfDay.setHours(23, 59, 59, 999);
        whereClause.createdAt.lte = endOfDay;
      }
    }

    // Build orderBy clause
    const orderByClause: Record<string, 'asc' | 'desc'> = {};
    if (sortBy === 'distance' || sortBy === 'downloadedAt' || sortBy === 'createdAt') {
      orderByClause[sortBy] = sortOrder;
    } else {
      orderByClause.createdAt = 'desc'; // Default sort
    }

    // Fetch downloads with filters and pagination
    const downloads = await prisma.download.findMany({
      where: whereClause,
      orderBy: orderByClause,
      skip,
      take: limit,
      select: {
        id: true,
        fileName: true,
        distance: true,
        estimatedTime: true,
        markers: true,
        fileUrl: true,
        publicId: true,
        fileSize: true,
        downloadedAt: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    // Get total count for pagination
    const totalCount = await prisma.download.count({
      where: whereClause,
    });

    // Calculate statistics
    const stats = await prisma.download.aggregate({
      where: { userId: session.user.id },
      _sum: {
        distance: true,
        markers: true,
      },
      _avg: {
        distance: true,
      },
      _count: {
        id: true,
      },
    });

    const totalPages = Math.ceil(totalCount / limit);

    return NextResponse.json({
      success: true,
      data: {
        downloads,
        pagination: {
          currentPage: page,
          totalPages,
          totalCount,
          limit,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1,
        },
        stats: {
          totalRuns: stats._count.id,
          totalDistance: stats._sum.distance || 0,
          averageDistance: stats._avg.distance || 0,
          totalMarkers: stats._sum.markers || 0,
        },
        filters: {
          sortBy,
          sortOrder,
          minDistance,
          maxDistance,
          dateFrom: dateFrom?.toISOString(),
          dateTo: dateTo?.toISOString(),
        },
      },
    });

  } catch (error) {
    console.error('Error fetching user downloads:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Internal server error',
        message: 'Failed to fetch downloads'
      },
      { status: 500 }
    );
  }
}

// Optional: DELETE method to delete a specific download
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized - Please log in' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const downloadId = searchParams.get('id');

    if (!downloadId) {
      return NextResponse.json(
        { error: 'Download ID is required' },
        { status: 400 }
      );
    }

    // Verify the download belongs to the user
    const download = await prisma.download.findFirst({
      where: {
        id: downloadId,
        userId: session.user.id,
      },
    });

    if (!download) {
      return NextResponse.json(
        { error: 'Download not found or unauthorized' },
        { status: 404 }
      );
    }

    // Delete from database
    await prisma.download.delete({
      where: {
        id: downloadId,
      },
    });

    // Optionally delete from Cloudinary too
    // if (download.publicId) {
    //   try {
    //     await cloudinary.uploader.destroy(download.publicId, { resource_type: 'raw' });
    //   } catch (cloudinaryError) {
    //     console.error('Failed to delete from Cloudinary:', cloudinaryError);
    //   }
    // }

    return NextResponse.json({
      success: true,
      message: 'Download deleted successfully',
    });

  } catch (error) {
    console.error('Error deleting download:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Internal server error',
        message: 'Failed to delete download'
      },
      { status: 500 }
    );
  }
}