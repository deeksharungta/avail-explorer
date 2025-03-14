import { ActionForm } from '@/components/action/ActionForm';
import { ActionHistory } from '@/components/action/ActionHistory';

export default function HomePage() {
  return (
    <div className='container mx-auto px-4 py-8 space-y-8'>
      <ActionForm />
      <ActionHistory />
    </div>
  );
}
