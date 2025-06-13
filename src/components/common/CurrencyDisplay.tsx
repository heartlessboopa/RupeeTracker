import type React from 'react';
import { RupeeIcon } from '@/components/icons/RupeeIcon';

interface CurrencyDisplayProps {
  amount: number;
  className?: string;
}

export const CurrencyDisplay: React.FC<CurrencyDisplayProps> = ({ amount, className }) => {
  return (
    <span className={className}>
      <RupeeIcon className="inline-block h-4 w-4 mr-1" />
      {amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
    </span>
  );
};
