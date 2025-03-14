import { NextRequest, NextResponse } from 'next/server';
import { getAccountTransactions } from '@/lib/services/api/accounts';

export async function GET(
  request: NextRequest,
  { params }: { params: { address: string } }
) {
  try {
    const { address } = params;
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
      { error: 'Failed to fetch account transactions' },
      { status: 500 }
    );
  }
}
