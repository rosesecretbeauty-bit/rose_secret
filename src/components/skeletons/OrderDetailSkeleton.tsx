// ============================================
// Order Detail Skeleton Loader
// ============================================

import React from 'react';
import { Skeleton } from '../ui/Skeleton';
import { Card, CardContent, CardHeader } from '../ui/Card';

export function OrderDetailSkeleton() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="space-y-4">
        <Skeleton variant="text" height={16} width={100} />
        <Skeleton variant="text" height={32} width={300} />
        <div className="flex items-center gap-3">
          <Skeleton variant="text" height={16} width={200} />
          <Skeleton variant="rectangular" height={24} width={100} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Order Items */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <Skeleton variant="text" height={24} width={200} />
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="flex items-center gap-4 pb-4 border-b border-gray-100 last:border-0">
                    <Skeleton variant="rectangular" height={64} width={64} />
                    <div className="flex-1 space-y-2">
                      <Skeleton variant="text" height={20} width="70%" />
                      <Skeleton variant="text" height={16} width="40%" />
                    </div>
                    <Skeleton variant="text" height={20} width={80} />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Summary & Address */}
        <div className="lg:col-span-1 space-y-6">
          {/* Summary */}
          <Card>
            <CardHeader>
              <Skeleton variant="text" height={24} width={180} />
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <Skeleton variant="text" height={16} width={80} />
                  <Skeleton variant="text" height={16} width={60} />
                </div>
                <div className="flex justify-between">
                  <Skeleton variant="text" height={16} width={60} />
                  <Skeleton variant="text" height={16} width={60} />
                </div>
                <div className="flex justify-between pt-4 border-t border-gray-100">
                  <Skeleton variant="text" height={20} width={50} />
                  <Skeleton variant="text" height={20} width={80} />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Address */}
          <Card>
            <CardHeader>
              <Skeleton variant="text" height={24} width={180} />
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Skeleton variant="text" height={18} width="90%" />
                <Skeleton variant="text" height={16} width="100%" />
                <Skeleton variant="text" height={16} width="80%" />
                <Skeleton variant="text" height={16} width="70%" />
                <Skeleton variant="text" height={16} width={60%" className="mt-2" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

