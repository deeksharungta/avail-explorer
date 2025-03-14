import { NextRequest, NextResponse } from 'next/server';
import { getAccountById } from '@/lib/api/accounts';

export async function GET(
  request: NextRequest,
  { params }: { params: { address: string } }
) {
  try {
    const { address } = params;
    const account = await getAccountById(address);

    return NextResponse.json({ data: account }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      {
        error: 'Failed to fetch account details',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
