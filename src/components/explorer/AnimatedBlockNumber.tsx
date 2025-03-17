import React, { useEffect, useState } from 'react';
import { Blocks } from 'lucide-react';

interface SimpleAnimatedBlockNumberProps {
  value: number | null;
}

const AnimatedBlockNumber: React.FC<SimpleAnimatedBlockNumberProps> = ({
  value,
}) => {
  const [prevValue, setPrevValue] = useState<number | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);

  // Detect changes in block number
  useEffect(() => {
    if (value !== null && prevValue !== null && value !== prevValue) {
      setIsAnimating(true);

      // Reset animation state after animation completes
      const timer = setTimeout(() => {
        setIsAnimating(false);
      }, 1000);

      return () => clearTimeout(timer);
    }

    setPrevValue(value);
  }, [value, prevValue]);

  if (value === null) return null;

  return (
    <div className='flex items-center text-white/70'>
      <Blocks className='h-4 w-4 mr-1' />
      <span>Current Block #</span>
      <span
        className={`font-mono ${
          isAnimating ? 'text-primary animate-pulse' : ''
        }`}
        style={{ transition: 'color 0.5s ease-in-out' }}
      >
        {value}
      </span>
    </div>
  );
};

export default AnimatedBlockNumber;
