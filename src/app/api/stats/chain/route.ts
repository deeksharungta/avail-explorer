import { NextResponse } from 'next/server';
import { getChainStats } from '@/lib/api/stats';

export async function GET() {
  try {
    const stats = await getChainStats();

    return NextResponse.json({ data: stats }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      {
        error: 'Failed to fetch chain statistics',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
