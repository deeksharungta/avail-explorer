import { getAccountTransactions } from '@/lib/api/accounts';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ address: string }> }
) {
  try {
    const { address } = await params;
    const { searchParams } = new URL(request.url);

    const first = parseInt(searchParams.get('first') || '20');
    const after = searchParams.get('after') || undefined;

    const transactions = await getAccountTransactions({
      address,
      first,
      after,
    });

    return NextResponse.json({ data: transactions }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      {
        error: 'Failed to fetch account transactions',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
