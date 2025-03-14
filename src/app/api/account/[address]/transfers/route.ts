import { NextRequest, NextResponse } from 'next/server';
import { getAccountTransfers } from '@/lib/api/accounts';

export async function GET(
  request: NextRequest,
  { params }: { params: { address: string } }
) {
  try {
    const { address } = params;
    const { searchParams } = new URL(request.url);

    const first = parseInt(searchParams.get('first') || '20');
    const after = searchParams.get('after') || undefined;

    const transfers = await getAccountTransfers({
      address,
      first,
      after,
    });

    return NextResponse.json({ data: transfers }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      {
        error: 'Failed to fetch account transfers',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
