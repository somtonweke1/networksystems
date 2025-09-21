'use client';

import React from 'react';
import { Card } from '@/components/ui/card';

export function CentralityMetrics() {
  return (
    <Card className="p-6">
      <h2 className="text-xl font-bold mb-4">Centrality Metrics</h2>
      <div className="grid grid-cols-2 gap-4">
        <div className="text-center p-4 bg-gray-50 rounded">
          <div className="text-2xl font-bold text-blue-600">0.85</div>
          <div className="text-sm text-gray-600">Degree Centrality</div>
        </div>
        <div className="text-center p-4 bg-gray-50 rounded">
          <div className="text-2xl font-bold text-green-600">0.72</div>
          <div className="text-sm text-gray-600">Betweenness</div>
        </div>
        <div className="text-center p-4 bg-gray-50 rounded">
          <div className="text-2xl font-bold text-purple-600">0.91</div>
          <div className="text-sm text-gray-600">Closeness</div>
        </div>
        <div className="text-center p-4 bg-gray-50 rounded">
          <div className="text-2xl font-bold text-orange-600">0.68</div>
          <div className="text-sm text-gray-600">Eigenvector</div>
        </div>
      </div>
    </Card>
  );
}