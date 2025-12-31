// ============================================
// Product Management Skeleton Loader
// ============================================

import React from 'react';
import { Skeleton } from '../ui/Skeleton';

export function ProductManagementSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton variant="text" height={36} width={300} />
          <Skeleton variant="text" height={20} width={250} />
        </div>
        <Skeleton variant="rectangular" height={40} width={160} />
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-4">
              <Skeleton variant="rectangular" height={48} width={48} className="rounded-lg" />
              <div className="flex-1 space-y-2">
                <Skeleton variant="text" height={16} width={120} />
                <Skeleton variant="text" height={28} width={60} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
        {/* Search */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <Skeleton variant="rectangular" height={40} width="100%" />
        </div>

        {/* Table Header */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                {[...Array(7)].map((_, i) => (
                  <th key={i} className="px-6 py-3">
                    <Skeleton variant="text" height={16} width={80} />
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[...Array(5)].map((_, i) => (
                <tr key={i} className="border-b border-gray-200 dark:border-gray-700">
                  {[...Array(7)].map((_, j) => (
                    <td key={j} className="px-6 py-4">
                      <Skeleton variant="text" height={20} width={j === 0 ? 40 : j === 1 ? 64 : 100} />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

