import { getTransactionByHash } from '@/lib/api/transactions';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ txHash: string }> }
) {
  try {
    const { txHash } = await params;
    const transaction = await getTransactionByHash(txHash);

    if (!transaction) {
      return NextResponse.json(
        { error: 'Transaction not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ data: transaction }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      {
        error: 'Failed to fetch transaction details',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
