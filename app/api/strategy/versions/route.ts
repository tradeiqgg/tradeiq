import { NextRequest, NextResponse } from 'next/server';
import { listVersions, restoreVersion } from '@/lib/cloud/strategySync';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const strategyId = searchParams.get('strategyId');

    if (!strategyId) {
      return NextResponse.json(
        { error: 'strategyId is required' },
        { status: 400 }
      );
    }

    const versions = await listVersions(strategyId);

    return NextResponse.json({ versions });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { strategyId, userId, version } = body;

    if (!strategyId || !userId || !version) {
      return NextResponse.json(
        { error: 'strategyId, userId, and version are required' },
        { status: 400 }
      );
    }

    const strategy = await restoreVersion(strategyId, userId, version);

    return NextResponse.json({ strategy });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

