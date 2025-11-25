import { NextRequest, NextResponse } from 'next/server';
import { createAlert } from '@/lib/alerts/alertEngine';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { user_id, strategy_id, type, message, payload, severity } = body;

    if (!user_id || !type || !message) {
      return NextResponse.json(
        { error: 'user_id, type, and message are required' },
        { status: 400 }
      );
    }

    const alert = await createAlert({
      user_id,
      strategy_id,
      type,
      message,
      payload,
      severity,
    });

    return NextResponse.json({ alert });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

