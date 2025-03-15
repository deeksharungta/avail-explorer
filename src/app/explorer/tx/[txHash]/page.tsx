import TransactionDetails from '@/components/transaction/TransactionDetails';
import React from 'react';

export default async function TransactionDetailsPage({
  params,
}: {
  params: Promise<{ txHash: string }>;
}) {
  const { txHash } = await params;
  return <TransactionDetails txHash={txHash} />;
}
