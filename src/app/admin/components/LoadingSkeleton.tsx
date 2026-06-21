// Loading skeleton components for table rows and card placeholders
import React from "react";

export const TableSkeleton: React.FC = () => (
  <div className="animate-pulse space-y-2">
    <div className="flex">
      <div className="h-4 w-32 bg-gray-200 dark:bg-gray-700 rounded mr-4" />
      <div className="h-4 w-40 bg-gray-200 dark:bg-gray-700 rounded mr-4" />
      <div className="h-4 w-20 bg-gray-200 dark:bg-gray-700 rounded mr-4" />
      <div className="h-4 w-16 bg-gray-200 dark:bg-gray-700 rounded mr-4" />
      <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded mr-4" />
      <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded mr-4" />
      <div className="h-4 w-12 bg-gray-200 dark:bg-gray-700 rounded mr-4" />
      <div className="h-4 w-16 bg-gray-200 dark:bg-gray-700 rounded" />
    </div>
  </div>
);


export const CardSkeleton: React.FC = () => (
  <div className="rounded-xl border border-gray-100 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-sm animate-pulse">
    <div className="flex justify-between items-start mb-2">
      <div className="space-y-2">
        <div className="h-5 w-40 bg-gray-200 dark:bg-gray-700 rounded" />
        <div className="h-4 w-64 bg-gray-200 dark:bg-gray-700 rounded" />
      </div>
      <div className="h-6 w-16 bg-gray-200 dark:bg-gray-700 rounded" />
    </div>
    <div className="space-y-2 mt-3">
      <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded" />
      <div className="h-4 w-32 bg-gray-200 dark:bg-gray-700 rounded" />
      <div className="h-4 w-20 bg-gray-200 dark:bg-gray-700 rounded" />
    </div>
    <div className="mt-3 space-y-2">
      <div className="h-8 w-full bg-gray-200 dark:bg-gray-700 rounded" />
      <div className="h-8 w-full bg-gray-200 dark:bg-gray-700 rounded" />
      <div className="h-8 w-full bg-gray-200 dark:bg-gray-700 rounded" />
    </div>
  </div>
);
