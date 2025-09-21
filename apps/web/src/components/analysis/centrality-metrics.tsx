'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { useNetworkStore } from '@/stores/network-store';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp, TrendingDown, Award, Target } from 'lucide-react';
import { cn } from '@/lib/utils';

export function CentralityMetrics() {
  const { analysis, isLoading } = useNetworkStore();

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">Centrality Metrics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-secondary rounded w-3/4"></div>
            <div className="h-4 bg-secondary rounded w-1/2"></div>
            <div className="h-32 bg-secondary rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!analysis || !analysis.centralities || analysis.centralities.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">Centrality Metrics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-muted-foreground py-8">
            <Target className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No centrality analysis available</p>
            <p className="text-xs">Run analysis to see metrics</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Prepare data for visualization
  const centralityData = analysis.centralities.map(centrality => {
    const results = centrality.results;
    const values = results.map(r => r.value);
    
    return {
      type: centrality.type.replace('_', ' ').toUpperCase(),
      average: values.reduce((a, b) => a + b, 0) / values.length,
      maximum: Math.max(...values),
      minimum: Math.min(...values),
      stdDev: Math.sqrt(values.reduce((sq, n) => sq + Math.pow(n - (values.reduce((a, b) => a + b, 0) / values.length), 2), 0) / values.length),
      executionTime: centrality.executionTime
    };
  });

  // Get top nodes for each centrality
  const topNodes = analysis.centralities.map(centrality => {
    const topNode = centrality.results
      .sort((a, b) => b.value - a.value)[0];
    
    return {
      type: centrality.type,
      nodeId: topNode.nodeId,
      value: topNode.value,
      rank: topNode.rank
    };
  });

  return (
    <div className="space-y-4">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 gap-2">
        <Card className="p-3">
          <div className="flex items-center gap-2">
            <Award className="h-4 w-4 text-blue-500" />
            <div>
              <div className="text-xs font-medium">Top Performer</div>
              <div className="text-xs text-muted-foreground">
                {topNodes[0]?.type.replace('_', ' ')}: {topNodes[0]?.nodeId}
              </div>
            </div>
          </div>
        </Card>
        
        <Card className="p-3">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-green-500" />
            <div>
              <div className="text-xs font-medium">Analysis Time</div>
              <div className="text-xs text-muted-foreground">
                {(analysis.metadata.executionTime * 1000).toFixed(0)}ms
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Centrality Comparison Chart */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium">Centrality Comparison</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={centralityData} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis 
                  dataKey="type" 
                  fontSize={10}
                  angle={-45}
                  textAnchor="end"
                  height={60}
                />
                <YAxis fontSize={10} />
                <Tooltip 
                  formatter={(value: number, name: string) => [
                    value.toFixed(3), 
                    name === 'average' ? 'Average' : 
                    name === 'maximum' ? 'Maximum' : 'Minimum'
                  ]}
                />
                <Bar dataKey="average" fill="#3b82f6" name="average" />
                <Bar dataKey="maximum" fill="#ef4444" name="maximum" />
                <Bar dataKey="minimum" fill="#10b981" name="minimum" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Top Nodes by Centrality */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium">Top Nodes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {topNodes.slice(0, 5).map((node, index) => (
              <div key={node.type} className="flex items-center justify-between p-2 bg-secondary/50 rounded">
                <div className="flex items-center gap-2">
                  <div className={cn(
                    "w-2 h-2 rounded-full",
                    index === 0 ? "bg-yellow-500" :
                    index === 1 ? "bg-gray-400" :
                    index === 2 ? "bg-orange-600" : "bg-blue-500"
                  )} />
                  <span className="text-xs font-medium capitalize">
                    {node.type.replace('_', ' ')}
                  </span>
                </div>
                <div className="text-right">
                  <div className="text-xs font-mono">
                    {node.value.toFixed(3)}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {node.nodeId}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Centrality Details */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium">Algorithm Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {analysis.centralities.map((centrality) => (
              <div key={centrality.type} className="border rounded p-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium capitalize">
                    {centrality.type.replace('_', ' ')}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {(centrality.executionTime * 1000).toFixed(0)}ms
                  </span>
                </div>
                
                <div className="grid grid-cols-3 gap-2 text-xs">
                  <div>
                    <div className="text-muted-foreground">Nodes</div>
                    <div className="font-medium">{centrality.results.length}</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Avg Value</div>
                    <div className="font-medium">
                      {(centrality.results.reduce((sum, r) => sum + r.value, 0) / centrality.results.length).toFixed(3)}
                    </div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Max Value</div>
                    <div className="font-medium">
                      {Math.max(...centrality.results.map(r => r.value)).toFixed(3)}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
