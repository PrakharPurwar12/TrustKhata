import React from 'react';

export const CustomerCardSkeleton = () => {
  return (
    <div className="bg-white dark:bg-slate-800 p-6 sm:p-8 rounded-[2.5rem] border border-slate-200 dark:border-slate-700 animate-pulse transition-colors duration-300">
      <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-8">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-slate-200 dark:bg-slate-700 rounded-2xl flex-shrink-0" />
          <div className="space-y-3 w-32 sm:w-48">
            <div className="h-5 bg-slate-200 dark:bg-slate-700 rounded-lg w-3/4" />
            <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded-md w-1/2" />
          </div>
        </div>
        <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded-full w-24" />
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded-md w-1/2" />
          <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded-lg w-full" />
        </div>
        <div className="space-y-2 text-right flex flex-col items-end">
          <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded-md w-1/2" />
          <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded-lg w-full" />
        </div>
      </div>
    </div>
  );
};

export const TransactionSkeleton = () => {
  return (
    <tr className="animate-pulse bg-white dark:bg-slate-800 border-b border-slate-100 dark:border-slate-700">
      <td className="px-6 py-6 sm:px-10">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-slate-200 dark:bg-slate-700 flex-shrink-0" />
          <div className="space-y-2 w-24 sm:w-32">
            <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded-md w-full" />
            <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded-md w-2/3" />
          </div>
        </div>
      </td>
      <td className="px-6 py-6 sm:px-10 text-right">
        <div className="h-5 bg-slate-200 dark:bg-slate-700 rounded-md w-16 ml-auto" />
      </td>
      <td className="px-6 py-6 sm:px-10 text-right">
        <div className="h-5 bg-slate-200 dark:bg-slate-700 rounded-md w-16 ml-auto" />
      </td>
    </tr>
  );
};
