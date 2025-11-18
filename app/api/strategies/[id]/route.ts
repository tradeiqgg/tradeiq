import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// GET single strategy by ID (with security check)
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const strategyId = params.id;
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('user_id');

    if (!userId) {
      return NextResponse.json({ error: 'user_id is required' }, { status: 400 });
    }

    // Fetch strategy and verify ownership
    const { data, error } = await supabase
      .from('strategies')
      .select('*')
      .eq('id', strategyId)
      .eq('user_id', userId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Strategy not found or access denied' }, { status: 404 });
      }
      throw error;
    }

    return NextResponse.json({ strategy: data });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// UPDATE strategy (with security check)
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const strategyId = params.id;
    const body = await request.json();
    const userId = body.user_id;

    if (!userId) {
      return NextResponse.json({ error: 'user_id is required' }, { status: 400 });
    }

    // Verify ownership before update
    const { data: existing, error: checkError } = await supabase
      .from('strategies')
      .select('user_id')
      .eq('id', strategyId)
      .single();

    if (checkError || !existing) {
      return NextResponse.json({ error: 'Strategy not found' }, { status: 404 });
    }

    if (existing.user_id !== userId) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // Update strategy
    const { data, error } = await supabase
      .from('strategies')
      .update({
        ...body,
        updated_at: new Date().toISOString(),
      })
      .eq('id', strategyId)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ strategy: data });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// DELETE strategy (with security check)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const strategyId = params.id;
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('user_id');

    if (!userId) {
      return NextResponse.json({ error: 'user_id is required' }, { status: 400 });
    }

    // Verify ownership before delete
    const { data: existing, error: checkError } = await supabase
      .from('strategies')
      .select('user_id')
      .eq('id', strategyId)
      .single();

    if (checkError || !existing) {
      return NextResponse.json({ error: 'Strategy not found' }, { status: 404 });
    }

    if (existing.user_id !== userId) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // Delete strategy
    const { error } = await supabase
      .from('strategies')
      .delete()
      .eq('id', strategyId)
      .eq('user_id', userId);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

