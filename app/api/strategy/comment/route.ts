import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { strategyId, userId, message } = body;

    if (!strategyId || !userId || !message) {
      return NextResponse.json(
        { error: 'strategyId, userId, and message are required' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('strategy_comments')
      .insert({
        strategy_id: strategyId,
        user_id: userId,
        message: message.trim(),
      })
      .select(`
        *,
        user:users(id, username, avatar_url, wallet_address)
      `)
      .single();

    if (error) throw error;

    return NextResponse.json({ comment: data });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const strategyId = searchParams.get('strategyId');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    if (!strategyId) {
      return NextResponse.json(
        { error: 'strategyId is required' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('strategy_comments')
      .select(`
        *,
        user:users(id, username, avatar_url, wallet_address)
      `)
      .eq('strategy_id', strategyId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;

    return NextResponse.json({ comments: data || [] });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const commentId = searchParams.get('commentId');
    const userId = searchParams.get('userId');

    if (!commentId || !userId) {
      return NextResponse.json(
        { error: 'commentId and userId are required' },
        { status: 400 }
      );
    }

    // Verify ownership
    const { data: comment } = await supabase
      .from('strategy_comments')
      .select('user_id')
      .eq('id', commentId)
      .single();

    if (!comment || comment.user_id !== userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }

    const { error } = await supabase
      .from('strategy_comments')
      .delete()
      .eq('id', commentId);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

