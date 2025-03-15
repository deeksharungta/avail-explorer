import React from 'react';
import { Upload, User, Database, Clock, DollarSign } from 'lucide-react';
import { DataSubmissionNode } from '@/types/graphql';
import InfoItem from './InfoItem';
import { formatDate } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';

interface DataSubmissionTabProps {
  dataSubmissions: DataSubmissionNode[];
}

export default function DataSubmissionTab({
  dataSubmissions,
}: DataSubmissionTabProps) {
  return (
    <Card className='bg-secondary/70 border-white/20 shadow-lg'>
      <CardContent className='py-6'>
        <h3 className='text-lg font-medium mb-6 text-white flex items-center'>
          <Upload className='h-5 w-5 mr-2 text-blue-400' />
          Data Submissions
        </h3>
        <div className='space-y-6'>
          {dataSubmissions.map((submission) => (
            <div key={submission.id}>
              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                <InfoItem
                  label='APP ID'
                  value={submission.appId}
                  icon={Database}
                  iconClassName='text-indigo-400'
                />
                <InfoItem
                  label='SIZE'
                  value={submission.byteSize}
                  icon={Upload}
                  iconClassName='text-cyan-400'
                />
                <InfoItem
                  label='SIGNER'
                  value={submission.signer}
                  copyable
                  icon={User}
                  iconClassName='text-green-400'
                />
                <InfoItem
                  label='FEES'
                  value={`${submission.fees} AVAIL`}
                  icon={DollarSign}
                  iconClassName='text-yellow-400'
                />
                <InfoItem
                  label='TIME'
                  value={formatDate(submission.timestamp)}
                  icon={Clock}
                  iconClassName='text-orange-400'
                />
              </div>
            </div>
          ))}
        </div>
        {dataSubmissions.length === 0 && (
          <div className='text-center text-white/60 py-8 flex flex-col items-center'>
            <Upload className='h-12 w-12 text-blue-400 mb-4' />
            <p>No data submissions found</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
