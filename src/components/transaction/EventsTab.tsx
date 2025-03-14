import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from '@radix-ui/react-accordion';
import { Badge } from 'lucide-react';
import { Card, CardContent } from '../ui/card';
import CodeBlock from './CodeBlock';
import { Event } from './TransactionDetails';

const EventsTab: React.FC<{ events: Event[] }> = ({ events }) => (
  <Card className='bg-secondary border-white/10'>
    <CardContent>
      {events.length > 0 ? (
        <Accordion type='single' collapsible className='w-full'>
          {events.map((event, index) => (
            <AccordionItem
              key={event.id}
              value={`event-${index}`}
              className='border-white/10'
            >
              <AccordionTrigger className='text-white hover:text-white hover:no-underline py-4'>
                <div className='flex items-center'>
                  <Badge className='bg-primary/20 text-primary mr-2'>
                    Event {event.eventIndex}
                  </Badge>
                  {event.module}.{event.name}
                </div>
              </AccordionTrigger>
              <AccordionContent className='text-gray-300'>
                <CodeBlock
                  content={JSON.stringify(event.params, null, 2)}
                  className='mb-2'
                />
                <div className='text-sm text-white/60'>
                  Phase: {event.phase}
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      ) : (
        <div className='text-center text-white/60 py-8'>
          No events were emitted during this extrinsic
        </div>
      )}
    </CardContent>
  </Card>
);

export default EventsTab;
