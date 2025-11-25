import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const limit = parseInt(searchParams.get('limit') || '20');
    const sort = searchParams.get('sort') || 'xp'; // xp, strategies, likes

    // Get top builders by strategy likes
    const { data: strategies, error: strategiesError } = await supabase
      .from('strategies')
      .select('user_id, likes_count')
      .eq('visibility', 'public');

    if (strategiesError) throw strategiesError;

    // Aggregate user stats
    const userStats: Record<string, {
      user_id: string;
      total_likes: number;
      strategy_count: number;
    }> = {};

    strategies?.forEach((s: any) => {
      if (!userStats[s.user_id]) {
        userStats[s.user_id] = {
          user_id: s.user_id,
          total_likes: 0,
          strategy_count: 0,
        };
      }
      userStats[s.user_id].total_likes += s.likes_count || 0;
      userStats[s.user_id].strategy_count += 1;
    });

    // Get user details
    const userIds = Object.keys(userStats);
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('id, username, avatar_url, builder_xp, followers_count')
      .in('id', userIds);

    if (usersError) throw usersError;

    // Combine and sort
    const builders = users?.map((user: any) => ({
      ...user,
      total_likes: userStats[user.id]?.total_likes || 0,
      strategy_count: userStats[user.id]?.strategy_count || 0,
    })) || [];

    builders.sort((a, b) => {
      if (sort === 'xp') {
        return (b.builder_xp || 0) - (a.builder_xp || 0);
      } else if (sort === 'strategies') {
        return b.strategy_count - a.strategy_count;
      } else {
        return b.total_likes - a.total_likes;
      }
    });

    return NextResponse.json({ builders: builders.slice(0, limit) });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

