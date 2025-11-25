import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { user_id, username, message } = body;

    if (!user_id || !message) {
      return NextResponse.json(
        { error: 'user_id and message are required' },
        { status: 400 }
      );
    }

    // Verify user exists
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id, username')
      .eq('id', user_id)
      .single();

    if (userError || !user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Insert message - server-side has elevated permissions
    const { data, error } = await supabase
      .from('community_chat_messages')
      .insert({
        user_id: user.id,
        username: username || user.username || 'Anonymous',
        message: message.trim(),
      })
      .select()
      .single();

    if (error) {
      console.error('Failed to insert message:', error);
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ data });
  } catch (error: any) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

