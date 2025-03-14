import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '../ui/card';
import CodeBlock from './CodeBlock';

export interface ErrorInfo {
  module: string;
  name: string;
  details: string;
  stackTrace: string;
}

const ErrorCard: React.FC<{ error: ErrorInfo }> = ({ error }) => (
  <Card className='bg-red-500/10 border-red-500/20 mb-6'>
    <CardHeader className='pb-2'>
      <CardTitle className='text-red-500'>Extrinsic Failed</CardTitle>
      <CardDescription className='text-red-300'>
        Error information
      </CardDescription>
    </CardHeader>
    <CardContent>
      <CodeBlock
        content={`Error: ${error.module}.${error.name} - ${error.details}
Stack trace:
${error.stackTrace}`}
        className='border-red-500/20'
      />
    </CardContent>
  </Card>
);

export default ErrorCard;
