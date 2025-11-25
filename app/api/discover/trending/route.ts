import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const limit = parseInt(searchParams.get('limit') || '20');
    const timeframe = searchParams.get('timeframe') || 'week'; // week, month, all

    let dateFilter = new Date();
    if (timeframe === 'week') {
      dateFilter.setDate(dateFilter.getDate() - 7);
    } else if (timeframe === 'month') {
      dateFilter.setMonth(dateFilter.getMonth() - 1);
    } else {
      dateFilter = new Date(0); // All time
    }

    const { data, error } = await supabase
      .from('strategies')
      .select(`
        *,
        user:users(id, username, avatar_url, wallet_address)
      `)
      .eq('visibility', 'public')
      .gte('created_at', dateFilter.toISOString())
      .order('likes_count', { ascending: false })
      .order('comments_count', { ascending: false })
      .limit(limit);

    if (error) throw error;

    return NextResponse.json({ strategies: data || [] });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

