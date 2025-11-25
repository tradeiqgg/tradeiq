import { NextRequest, NextResponse } from 'next/server';
import { markAlertRead, markAllAlertsRead } from '@/lib/alerts/alertEngine';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { alertId, userId, markAll } = body;

    if (!userId) {
      return NextResponse.json(
        { error: 'userId is required' },
        { status: 400 }
      );
    }

    if (markAll) {
      await markAllAlertsRead(userId);
    } else if (alertId) {
      await markAlertRead(alertId, userId);
    } else {
      return NextResponse.json(
        { error: 'alertId or markAll is required' },
        { status: 400 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

