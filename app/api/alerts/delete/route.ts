import { NextRequest, NextResponse } from 'next/server';
import { deleteAlert } from '@/lib/alerts/alertEngine';

export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const alertId = searchParams.get('alertId');
    const userId = searchParams.get('userId');

    if (!alertId || !userId) {
      return NextResponse.json(
        { error: 'alertId and userId are required' },
        { status: 400 }
      );
    }

    await deleteAlert(alertId, userId);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

