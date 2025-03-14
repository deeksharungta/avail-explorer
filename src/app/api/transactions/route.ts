import { getLatestTransactions } from '@/lib/api/transactions';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const first = parseInt(searchParams.get('first') || '20');
    const after = searchParams.get('after') || undefined;

    const transactions = await getLatestTransactions({
      first,
      after,
    });

    return NextResponse.json({ data: transactions }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch latest transactions' },
      { status: 500 }
    );
  }
}
