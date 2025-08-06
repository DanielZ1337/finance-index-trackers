import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { db } from '@/lib/db';
import { schema } from '@/lib/db';
import { eq, and, gte, desc, sql } from 'drizzle-orm';
import { subDays, subHours } from 'date-fns';
import { UAParser } from 'ua-parser-js';

export async function GET(request: NextRequest) {
  try {
    // Get current session to verify authentication
    const session = await auth.api.getSession({
      headers: await headers()
    });

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const range = searchParams.get('range') || '24h';

    // Calculate time range
    let startDate: Date;
    const now = new Date();

    switch (range) {
      case '24h':
        startDate = subHours(now, 24);
        break;
      case '7d':
        startDate = subDays(now, 7);
        break;
      case '30d':
        startDate = subDays(now, 30);
        break;
      default:
        startDate = subHours(now, 24);
    }

    // Get all sessions for the user within the time range
    const userSessions = await db
      .select()
      .from(schema.session)
      .where(
        and(
          eq(schema.session.userId, session.user.id),
          gte(schema.session.updatedAt, startDate)
        )
      )
      .orderBy(desc(schema.session.updatedAt));

    // Get indicator views for these sessions
    const sessionIds = userSessions.map(s => s.id);
    
    const sessionViews = sessionIds.length > 0 
      ? await db
          .select({
            sessionId: schema.indicatorViews.id, // We'll need to add session tracking
            indicatorId: schema.indicatorViews.indicatorId,
            indicatorName: schema.indicators.name,
            indicatorCategory: schema.indicators.category,
            viewedAt: schema.indicatorViews.viewedAt,
            userId: schema.indicatorViews.userId,
          })
          .from(schema.indicatorViews)
          .innerJoin(schema.indicators, eq(schema.indicatorViews.indicatorId, schema.indicators.id))
          .where(
            and(
              eq(schema.indicatorViews.userId, session.user.id),
              gte(schema.indicatorViews.viewedAt, startDate)
            )
          )
          .orderBy(desc(schema.indicatorViews.viewedAt))
      : [];

    // Process session activities
    const activities = userSessions.map((userSession) => {
      // Parse device info
      let deviceInfo = {
        type: 'desktop',
        browser: 'Unknown',
        os: 'Unknown',
      };

      if (userSession.userAgent) {
        try {
          if (typeof userSession.userAgent === 'string') {
            if (userSession.userAgent.startsWith('{')) {
              const userAgentData = JSON.parse(userSession.userAgent);
              deviceInfo = {
                type: userAgentData.device || 'desktop',
                browser: userAgentData.browser || 'Unknown',
                os: userAgentData.os || 'Unknown',
              };
            } else {
              const parser = new UAParser(userSession.userAgent);
              const result = parser.getResult();
              deviceInfo = {
                type: result.device.type || 'desktop',
                browser: `${result.browser.name || 'Unknown'} ${result.browser.version || ''}`.trim(),
                os: `${result.os.name || 'Unknown'} ${result.os.version || ''}`.trim(),
              };
            }
          }
        } catch (e) {
          console.warn('Failed to parse user agent:', e);
        }
      }

      // Get views for this session (approximate by time window)
      const sessionStart = new Date(userSession.createdAt);
      const sessionEnd = new Date(userSession.updatedAt);
      
      const sessionViewsFiltered = sessionViews.filter(view => {
        if (!view.viewedAt) return false;
        const viewTime = new Date(view.viewedAt);
        return viewTime >= sessionStart && viewTime <= sessionEnd;
      });

      // Group indicators by ID and count views
      const indicatorMap = new Map();
      sessionViewsFiltered.forEach(view => {
        if (indicatorMap.has(view.indicatorId)) {
          indicatorMap.get(view.indicatorId).viewCount++;
        } else {
          indicatorMap.set(view.indicatorId, {
            id: view.indicatorId,
            name: view.indicatorName,
            category: view.indicatorCategory,
            viewedAt: view.viewedAt,
            viewCount: 1,
          });
        }
      });

      const indicators = Array.from(indicatorMap.values());
      const sessionDuration = Math.max(1, Math.round(
        (sessionEnd.getTime() - sessionStart.getTime()) / (1000 * 60)
      )); // in minutes

      return {
        sessionId: userSession.id,
        device: deviceInfo,
        viewCount: sessionViewsFiltered.length,
        indicators,
        lastActive: userSession.updatedAt.toISOString(),
        duration: sessionDuration,
      };
    });

    // Filter out sessions with no activity
    const activeActivities = activities.filter(activity => activity.viewCount > 0);

    return NextResponse.json({
      activities: activeActivities,
      summary: {
        totalSessions: activeActivities.length,
        totalViews: activeActivities.reduce((sum, activity) => sum + activity.viewCount, 0),
        avgDuration: activeActivities.length > 0 
          ? activeActivities.reduce((sum, activity) => sum + activity.duration, 0) / activeActivities.length
          : 0,
        avgViewsPerSession: activeActivities.length > 0
          ? activeActivities.reduce((sum, activity) => sum + activity.viewCount, 0) / activeActivities.length
          : 0,
      },
    });
  } catch (error) {
    console.error('Error fetching session analytics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch session analytics' },
      { status: 500 }
    );
  }
}
