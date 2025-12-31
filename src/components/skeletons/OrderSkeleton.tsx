// ============================================
// Order Skeleton Loader
// ============================================

import React from 'react';
import { Skeleton } from '../ui/Skeleton';
import { Card, CardContent, CardHeader } from '../ui/Card';

export function OrderSkeleton() {
  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <Skeleton variant="text" height={24} width={200} />
              <Skeleton variant="rectangular" height={24} width={100} />
            </div>
            <Skeleton variant="text" height={16} width={150} />
          </div>
          <div className="text-right">
            <Skeleton variant="text" height={16} width={60} />
            <Skeleton variant="text" height={24} width={80} className="mt-1" />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-3">
          <Skeleton variant="rectangular" height={36} width={120} />
          <Skeleton variant="rectangular" height={36} width={120} />
        </div>
      </CardContent>
    </Card>
  );
}

