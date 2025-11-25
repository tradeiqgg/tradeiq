import { NextRequest, NextResponse } from 'next/server';
import { getUserAlerts } from '@/lib/alerts/alertEngine';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('userId');
    const strategyId = searchParams.get('strategyId');
    const type = searchParams.get('type') as any;
    const unreadOnly = searchParams.get('unreadOnly') === 'true';
    const limit = parseInt(searchParams.get('limit') || '100');

    if (!userId) {
      return NextResponse.json(
        { error: 'userId is required' },
        { status: 400 }
      );
    }

    const alerts = await getUserAlerts(userId, {
      strategyId,
      type,
      unreadOnly,
      limit,
    });

    return NextResponse.json({ alerts });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

