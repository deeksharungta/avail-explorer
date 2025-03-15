import { Tabs, TabsList, TabsTrigger, TabsContent } from '@radix-ui/react-tabs';
import React from 'react';
import DataSubmissionTab from './DataSubmissionTab';
import EventsTab from './EventsTab';
import ExtrinsicDetailsTab from './ExtrinsicDetailsTab';
import TransfersTab from './TransfersTab';
import { ExtrinsicWithRelations } from '@/types/graphql';
import { useTransactionRelatedData } from '@/hooks/transactions/useTransactionRelatedData';

interface RelatedDetailsProps {
  extrinsic: ExtrinsicWithRelations;
}

const RelatedDetails: React.FC<RelatedDetailsProps> = ({ extrinsic }) => {
  const { data, isLoading, isError } = useTransactionRelatedData(extrinsic.id);

  if (isLoading) {
    return <RelatedDetailsSkeleton />;
  }

  if (isError || !data) {
    return;
  }

  const { transfers, dataSubmissions, events } = data;

  return (
    <Tabs defaultValue='details' className='mt-4'>
      <TabsList className='bg-secondary rounded-lg p-1 inline-flex items-center space-x-1 mb-1 text-md '>
        <TabsTrigger
          value='details'
          className='
            cursor-pointer
            px-3 py-1 text-sm rounded-md
            data-[state=active]:bg-white/10 
            data-[state=active]:text-white
            text-white/60 
            hover:text-white/80
            transition-colors
          '
        >
          Details
        </TabsTrigger>
        <TabsTrigger
          value='events'
          className='
            cursor-pointer
            px-3 py-1 text-sm rounded-md
            data-[state=active]:bg-white/10 
            data-[state=active]:text-white
            text-white/60 
            hover:text-white/80
            transition-colors
          '
        >
          Events ({extrinsic.nbEvents})
        </TabsTrigger>
        {transfers.length > 0 && (
          <TabsTrigger
            value='transfers'
            className='
              cursor-pointer
              px-3 py-1 text-sm rounded-md
              data-[state=active]:bg-white/10 
              data-[state=active]:text-white
              text-white/60 
              hover:text-white/80
              transition-colors
            '
          >
            Transfers ({transfers.length})
          </TabsTrigger>
        )}
        {dataSubmissions.length > 0 && (
          <TabsTrigger
            value='dataSubmissions'
            className='
              cursor-pointer
              px-3 py-1 text-sm rounded-md
              data-[state=active]:bg-white/10 
              data-[state=active]:text-white
              text-white/60 
              hover:text-white/80
              transition-colors
            '
          >
            Data Submissions ({dataSubmissions.length})
          </TabsTrigger>
        )}
      </TabsList>

      <TabsContent value='details' className='mt-2'>
        <ExtrinsicDetailsTab extrinsic={extrinsic} />
      </TabsContent>

      <TabsContent value='events' className='mt-2'>
        <EventsTab events={events} />
      </TabsContent>

      {transfers.length > 0 && (
        <TabsContent value='transfers' className='mt-2'>
          <TransfersTab transfers={transfers} />
        </TabsContent>
      )}
      {dataSubmissions.length > 0 && (
        <TabsContent value='dataSubmissions' className='mt-2'>
          <DataSubmissionTab dataSubmissions={dataSubmissions} />
        </TabsContent>
      )}
    </Tabs>
  );
};

export default RelatedDetails;

const SkeletonItem = ({
  labelWidth = 'w-1/4',
  valueWidth = 'w-3/4',
  className = '',
}) => (
  <div className={`flex flex-col space-y-2 ${className}`}>
    <div className={`h-5 bg-white/10 rounded ${labelWidth}`}></div>
    <div className={`h-10 bg-white/10 rounded ${valueWidth}`}></div>
  </div>
);

const RelatedDetailsSkeleton: React.FC = () => {
  return (
    <div className='animate-pulse space-y-6'>
      <div className='flex space-x-2 mb-4'>
        {['Details', 'Events', 'Data Submissions'].map((tab, index) => (
          <div
            key={tab}
            className={`
              h-8 w-24 rounded-md
              ${index === 0 ? 'bg-white/10' : 'bg-white/5'}
            `}
          ></div>
        ))}
      </div>

      <div className='space-y-6 bg-white/5 rounded-lg p-10 mb-6'>
        <div>
          <div className='h-6 bg-white/10 rounded w-48 mb-4'></div>
          <div className='grid md:grid-cols-2 gap-4'>
            {[1, 2, 3, 4].map((item) => (
              <SkeletonItem key={item} />
            ))}
          </div>
        </div>

        <div>
          <div className='h-6 bg-white/10 rounded w-48 mb-4'></div>
          <div className='h-20 bg-white/10 rounded'></div>
        </div>

        <div>
          <div className='h-6 bg-white/10 rounded w-48 mb-4'></div>
          <div className='grid md:grid-cols-2 gap-4'>
            {[1, 2].map((item) => (
              <SkeletonItem key={item} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
