import React from 'react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

interface StatusBadgeProps {
  status: 'active' | 'inactive';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const isActive = status === 'active';
  return (
    <Badge
      className={cn(
        'px-2 py-0.5 text-xs rounded-full font-medium',
        isActive
          ? 'bg-primary/10 text-primary'
          : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200'
      )}
    >
      {isActive ? 'Active' : 'Inactive'}
    </Badge>
  );
};
