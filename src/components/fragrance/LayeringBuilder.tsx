import React, { useState } from 'react';
import { Plus, RefreshCw } from 'lucide-react';
import { GlassCard } from '../ui/GlassCard';
import { Button } from '../ui/Button';
export function LayeringBuilder() {
  const [base, setBase] = useState<any>(null);
  const [top, setTop] = useState<any>(null);
  return <GlassCard className="p-8 max-w-2xl mx-auto">
      <h2 className="text-2xl font-serif font-bold text-center mb-8">
        Create Your Signature Blend
      </h2>

      <div className="flex items-center justify-center gap-4 mb-8">
        {/* Base Note */}
        <div className="text-center">
          <div className="w-32 h-32 rounded-full border-2 border-dashed border-gray-300 flex items-center justify-center mb-4 bg-gray-50">
            {base ? <img src={base.image} className="w-full h-full rounded-full object-cover" /> : <span className="text-sm text-gray-400">Select Base</span>}
          </div>
          <p className="font-medium">Base Note</p>
        </div>

        <Plus className="h-6 w-6 text-gray-400" />

        {/* Top Note */}
        <div className="text-center">
          <div className="w-32 h-32 rounded-full border-2 border-dashed border-gray-300 flex items-center justify-center mb-4 bg-gray-50">
            {top ? <img src={top.image} className="w-full h-full rounded-full object-cover" /> : <span className="text-sm text-gray-400">Select Top</span>}
          </div>
          <p className="font-medium">Top Note</p>
        </div>
      </div>

      <div className="text-center">
        <Button size="lg" disabled={!base || !top}>
          <RefreshCw className="mr-2 h-4 w-4" /> Mix & Match
        </Button>
      </div>
    </GlassCard>;
}