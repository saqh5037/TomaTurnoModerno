import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// POST - Track documentation events
export async function POST(req) {
  try {
    const {
      eventType,
      moduleId,
      userId,
      userRole,
      metadata,
      sessionId,
      timestamp
    } = await req.json();

    // Get client information
    const ipAddress = req.headers.get('x-forwarded-for') ||
                     req.headers.get('x-real-ip') ||
                     'unknown';
    const userAgent = req.headers.get('user-agent') || 'unknown';

    // Create analytics event
    const event = await prisma.documentationEvent.create({
      data: {
        eventType,
        moduleId,
        userId: userId ? parseInt(userId) : null,
        userRole,
        metadata: metadata || {},
        sessionId: sessionId || generateSessionId(),
        ipAddress,
        userAgent,
        timestamp: timestamp ? new Date(timestamp) : new Date()
      }
    });

    // Update module views if it's a page view
    if (eventType === 'page_view' && moduleId) {
      await prisma.documentationModule.update({
        where: { moduleId },
        data: {
          views: {
            increment: 1
          }
        }
      });
    }

    return NextResponse.json({
      success: true,
      eventId: event.id
    });

  } catch (error) {
    console.error('Error tracking documentation event:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to track event' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

// GET - Retrieve analytics data
export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const eventType = searchParams.get('eventType');
    const moduleId = searchParams.get('moduleId');
    const userRole = searchParams.get('userRole');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const limit = parseInt(searchParams.get('limit')) || 100;
    const page = parseInt(searchParams.get('page')) || 1;
    const aggregateBy = searchParams.get('aggregateBy'); // hour, day, week, month

    // Build where clause
    const where = {};

    if (eventType) where.eventType = eventType;
    if (moduleId) where.moduleId = moduleId;
    if (userRole) where.userRole = userRole;

    if (startDate && endDate) {
      where.timestamp = {
        gte: new Date(startDate),
        lte: new Date(endDate)
      };
    }

    // If aggregation is requested
    if (aggregateBy) {
      const aggregatedData = await getAggregatedData(where, aggregateBy);
      return NextResponse.json({
        success: true,
        data: aggregatedData,
        aggregation: aggregateBy
      });
    }

    // Regular query with pagination
    const skip = (page - 1) * limit;

    const [events, total] = await Promise.all([
      prisma.documentationEvent.findMany({
        where,
        orderBy: { timestamp: 'desc' },
        skip,
        take: limit,
        include: {
          user: {
            select: { id: true, name: true, role: true }
          },
          module: {
            select: { moduleId: true, title: true, category: true }
          }
        }
      }),
      prisma.documentationEvent.count({ where })
    ]);

    return NextResponse.json({
      success: true,
      data: events,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Error retrieving analytics:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to retrieve analytics' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

// Helper function to get aggregated data
async function getAggregatedData(where, aggregateBy) {
  const groupByField = getGroupByField(aggregateBy);

  // This is a simplified aggregation - in a real app, you'd use proper SQL aggregation
  const events = await prisma.documentationEvent.findMany({
    where,
    select: {
      timestamp: true,
      eventType: true,
      moduleId: true,
      userRole: true,
      metadata: true
    },
    orderBy: { timestamp: 'asc' }
  });

  // Group events by time period
  const grouped = {};

  events.forEach(event => {
    const key = formatDateForAggregation(event.timestamp, aggregateBy);

    if (!grouped[key]) {
      grouped[key] = {
        timestamp: key,
        total: 0,
        byEventType: {},
        byUserRole: {},
        byModule: {},
        uniqueUsers: new Set(),
        uniqueSessions: new Set()
      };
    }

    const group = grouped[key];
    group.total++;

    // Count by event type
    group.byEventType[event.eventType] = (group.byEventType[event.eventType] || 0) + 1;

    // Count by user role
    if (event.userRole) {
      group.byUserRole[event.userRole] = (group.byUserRole[event.userRole] || 0) + 1;
    }

    // Count by module
    if (event.moduleId) {
      group.byModule[event.moduleId] = (group.byModule[event.moduleId] || 0) + 1;
    }

    // Track unique users and sessions
    if (event.metadata?.userId) {
      group.uniqueUsers.add(event.metadata.userId);
    }
    if (event.metadata?.sessionId) {
      group.uniqueSessions.add(event.metadata.sessionId);
    }
  });

  // Convert Sets to counts and return array
  return Object.values(grouped).map(group => ({
    ...group,
    uniqueUsers: group.uniqueUsers.size,
    uniqueSessions: group.uniqueSessions.size
  }));
}

// Helper function to format date for aggregation
function formatDateForAggregation(date, aggregateBy) {
  const d = new Date(date);

  switch (aggregateBy) {
    case 'hour':
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:00`;
    case 'day':
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    case 'week':
      const weekStart = new Date(d);
      weekStart.setDate(d.getDate() - d.getDay());
      return `${weekStart.getFullYear()}-W${String(Math.ceil(weekStart.getDate() / 7)).padStart(2, '0')}`;
    case 'month':
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    default:
      return d.toISOString().split('T')[0];
  }
}

// Helper function to get group by field for SQL aggregation
function getGroupByField(aggregateBy) {
  switch (aggregateBy) {
    case 'hour':
      return 'DATE_TRUNC(\'hour\', timestamp)';
    case 'day':
      return 'DATE_TRUNC(\'day\', timestamp)';
    case 'week':
      return 'DATE_TRUNC(\'week\', timestamp)';
    case 'month':
      return 'DATE_TRUNC(\'month\', timestamp)';
    default:
      return 'DATE_TRUNC(\'day\', timestamp)';
  }
}

// Generate unique session ID
function generateSessionId() {
  return 'sess_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}