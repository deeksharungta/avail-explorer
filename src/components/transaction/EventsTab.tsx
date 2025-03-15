import React from 'react';
import { Code, Activity, List } from 'lucide-react';
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import CodeBlock from './CodeBlock';
import { EventNode } from '@/types/graphql';

interface EventsTabProps {
  events: EventNode[];
}

const EventsTab: React.FC<EventsTabProps> = ({ events }) => {
  // Function to format event name and module
  const getEventName = (event: EventNode) => {
    return `${event.module}.${event.event}`;
  };

  // Function to get params from argsName and argsValue
  const getEventParams = (event: EventNode) => {
    // Combine argsName and argsValue into a params-like structure
    const argsName = event.argsName as Record<string, string>;
    const argsValue = event.argsValue as Record<string, unknown>;

    const params: Record<string, unknown> = {};

    // Create a params object with name/value pairs
    Object.keys(argsName).forEach((key) => {
      params[key] = {
        name: key,
        type: argsName[key],
        value: argsValue[key],
      };
    });

    return params;
  };

  return (
    <Card className='bg-secondary/70 border-white/20 shadow-lg'>
      <CardContent className='py-6'>
        {events.length > 0 ? (
          <Accordion type='single' collapsible className='w-full space-y-2'>
            {events.map((event, index) => {
              return (
                <AccordionItem
                  key={event.id}
                  value={`event-${index}`}
                  className='border-white/10 bg-white/5 rounded-lg hover:bg-white/10 transition-all'
                >
                  <AccordionTrigger className='text-white hover:text-white/80 hover:no-underline px-4 py-3'>
                    <div className='flex items-center space-x-3'>
                      <List className='h-5 w-5 text-blue-400 flex-shrink-0' />
                      <Badge
                        variant='secondary'
                        className='bg-white/10 text-white/70'
                      >
                        Event {event.eventIndex}
                      </Badge>
                      <span className='font-medium'>{getEventName(event)}</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className='px-4 pb-4'>
                    <div className='bg-white/5 rounded-lg p-4'>
                      <CodeBlock
                        content={JSON.stringify(getEventParams(event), null, 2)}
                        className='mb-3'
                      />
                      <div className='flex items-center text-sm text-white/60 space-x-2'>
                        <Code className='h-4 w-4 text-cyan-400' />
                        <span>Phase: {event.call || 'ApplyExtrinsic'}</span>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              );
            })}
          </Accordion>
        ) : (
          <div className='text-center text-white/60 py-8 flex flex-col items-center'>
            <Activity className='h-12 w-12 text-blue-400 mb-4' />
            <p>No events were emitted during this extrinsic</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default EventsTab;
