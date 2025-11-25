import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get('q') || '';
    const tag = searchParams.get('tag');
    const sort = searchParams.get('sort') || 'created_at';
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = parseInt(searchParams.get('offset') || '0');

    let supabaseQuery = supabase
      .from('strategies')
      .select(`
        *,
        user:users(id, username, avatar_url, wallet_address)
      `)
      .eq('visibility', 'public')
      .range(offset, offset + limit - 1);

    // Search by query
    if (query) {
      supabaseQuery = supabaseQuery.or(
        `title.ilike.%${query}%,description.ilike.%${query}%`
      );
    }

    // Filter by tag
    if (tag) {
      supabaseQuery = supabaseQuery.contains('tags', [tag]);
    }

    // Sort
    const ascending = sort === 'created_at' || sort === 'updated_at';
    supabaseQuery = supabaseQuery.order(sort, { ascending });

    const { data, error } = await supabaseQuery;

    if (error) throw error;

    return NextResponse.json({ strategies: data || [] });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

