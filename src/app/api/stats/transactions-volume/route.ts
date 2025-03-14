import { NextRequest, NextResponse } from 'next/server';
import { getTransactionVolume } from '@/lib/api/stats';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const timeframe = parseInt(searchParams.get('timeframe') || '7');

    const volumeData = await getTransactionVolume(timeframe);

    return NextResponse.json({ data: volumeData }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch transaction volume data' },
      { status: 500 }
    );
  }
}
