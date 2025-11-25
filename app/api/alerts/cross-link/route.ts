import { NextRequest, NextResponse } from 'next/server';
import { createCrossStrategyLink, deleteCrossStrategyLink } from '@/lib/alerts/crossSignals';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, sourceStrategyId, targetStrategyId, mode, config } = body;

    if (!userId || !sourceStrategyId || !targetStrategyId || !mode) {
      return NextResponse.json(
        { error: 'userId, sourceStrategyId, targetStrategyId, and mode are required' },
        { status: 400 }
      );
    }

    const link = await createCrossStrategyLink(
      userId,
      sourceStrategyId,
      targetStrategyId,
      mode,
      config
    );

    return NextResponse.json({ link });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const linkId = searchParams.get('linkId');
    const userId = searchParams.get('userId');

    if (!linkId || !userId) {
      return NextResponse.json(
        { error: 'linkId and userId are required' },
        { status: 400 }
      );
    }

    await deleteCrossStrategyLink(linkId, userId);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

