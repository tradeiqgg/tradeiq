import { NextRequest, NextResponse } from 'next/server';
import { forkStrategy } from '@/lib/cloud/strategySync';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { originalStrategyId, userId, newTitle } = body;

    if (!originalStrategyId || !userId) {
      return NextResponse.json(
        { error: 'originalStrategyId and userId are required' },
        { status: 400 }
      );
    }

    const strategy = await forkStrategy(originalStrategyId, userId, newTitle);

    return NextResponse.json({ strategy });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

