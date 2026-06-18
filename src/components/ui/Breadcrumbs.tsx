import React from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

interface Crumb {
  label: string;
  href?: string;
}

export const Breadcrumbs: React.FC<{ items: Crumb[] }> = ({ items }) => {
  return (
    <nav className="flex items-center space-x-1 text-sm text-gray-500 dark:text-gray-400">
      {items.map((crumb, idx) => (
        <React.Fragment key={idx}>
          {crumb.href ? (
            <Link href={crumb.href} className="hover:underline">
              {crumb.label}
            </Link>
          ) : (
            <span>{crumb.label}</span>
          )}
          {idx < items.length - 1 && <span className="mx-1">&gt;</span>}
        </React.Fragment>
      ))}
    </nav>
  );
};
