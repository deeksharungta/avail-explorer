'use client';

import React from 'react';

interface StatCardProps {
  title: string;
  value: string;
}

export default function StatCard({ title, value }: StatCardProps) {
  return (
    <div className='bg-secondary p-6 rounded-md border border-white/10'>
      <div className='text-gray-400 mb-2'>{title}</div>
      <div className='text-3xl font-bold text-white'>{value}</div>
    </div>
  );
}
