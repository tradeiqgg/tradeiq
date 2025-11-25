import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { strategyId, userId } = body;

    if (!strategyId || !userId) {
      return NextResponse.json(
        { error: 'strategyId and userId are required' },
        { status: 400 }
      );
    }

    // Check if already liked
    const { data: existing } = await supabase
      .from('strategy_likes')
      .select('id')
      .eq('strategy_id', strategyId)
      .eq('user_id', userId)
      .maybeSingle();

    if (existing) {
      return NextResponse.json({ message: 'Already liked', liked: true });
    }

    // Add like
    const { data, error } = await supabase
      .from('strategy_likes')
      .insert({
        strategy_id: strategyId,
        user_id: userId,
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ like: data, liked: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const strategyId = searchParams.get('strategyId');
    const userId = searchParams.get('userId');

    if (!strategyId || !userId) {
      return NextResponse.json(
        { error: 'strategyId and userId are required' },
        { status: 400 }
      );
    }

    const { error } = await supabase
      .from('strategy_likes')
      .delete()
      .eq('strategy_id', strategyId)
      .eq('user_id', userId);

    if (error) throw error;

    return NextResponse.json({ liked: false });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const strategyId = searchParams.get('strategyId');
    const userId = searchParams.get('userId');

    if (!strategyId || !userId) {
      return NextResponse.json(
        { error: 'strategyId and userId are required' },
        { status: 400 }
      );
    }

    const { data } = await supabase
      .from('strategy_likes')
      .select('id')
      .eq('strategy_id', strategyId)
      .eq('user_id', userId)
      .maybeSingle();

    return NextResponse.json({ liked: !!data });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

