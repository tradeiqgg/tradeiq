import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { publishStrategy } from '@/lib/cloud/strategySync';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { strategyId, userId, title, description, tags } = body;

    if (!strategyId || !userId || !title) {
      return NextResponse.json(
        { error: 'strategyId, userId, and title are required' },
        { status: 400 }
      );
    }

    const strategy = await publishStrategy(strategyId, userId, {
      title,
      description,
      tags,
    });

    return NextResponse.json({ strategy });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

