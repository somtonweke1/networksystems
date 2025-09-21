'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { useNetworkStore } from '@/stores/network-store';
import { 
  Network, 
  Users, 
  Link, 
  BarChart3, 
  Activity,
  Zap,
  Target,
  TrendingUp
} from 'lucide-react';
import { cn } from '@networkoracle/ui';

export function NetworkStats() {
  const { network, analysis, getNetworkMetrics } = useNetworkStore();
  
  const metrics = getNetworkMetrics();

  if (!network || !metrics) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">Network Statistics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-muted-foreground py-8">
            <Network className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No network data available</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const stats = [
    {
      icon: Users,
      label: 'Nodes',
      value: metrics.nodes,
      color: 'text-blue-500',
      bgColor: 'bg-blue-50',
      description: 'Total number of nodes'
    },
    {
      icon: Link,
      label: 'Edges',
      value: metrics.edges,
      color: 'text-green-500',
      bgColor: 'bg-green-50',
      description: 'Total number of edges'
    },
    {
      icon: BarChart3,
      label: 'Density',
      value: `${(metrics.density * 100).toFixed(1)}%`,
      color: 'text-purple-500',
      bgColor: 'bg-purple-50',
      description: 'Network density ratio'
    },
    {
      icon: Activity,
      label: 'Avg Degree',
      value: metrics.averageDegree.toFixed(1),
      color: 'text-orange-500',
      bgColor: 'bg-orange-50',
      description: 'Average node degree'
    }
  ];

  // Calculate additional metrics from analysis if available
  const additionalStats = [];
  
  if (analysis) {
    if (analysis.clusteringAnalysis) {
      additionalStats.push({
        icon: Zap,
        label: 'Clustering',
        value: analysis.clusteringAnalysis.averageClustering.toFixed(3),
        color: 'text-yellow-500',
        bgColor: 'bg-yellow-50',
        description: 'Average clustering coefficient'
      });
    }

    if (analysis.pathAnalysis) {
      additionalStats.push({
        icon: Target,
        label: 'Diameter',
        value: analysis.pathAnalysis.diameter.toString(),
        color: 'text-red-500',
        bgColor: 'bg-red-50',
        description: 'Network diameter'
      });
    }

    if (analysis.connectivityAnalysis) {
      additionalStats.push({
        icon: TrendingUp,
        label: 'Components',
        value: analysis.connectivityAnalysis.numberOfComponents.toString(),
        color: 'text-indigo-500',
        bgColor: 'bg-indigo-50',
        description: 'Number of connected components'
      });
    }
  }

  return (
    <div className="space-y-4">
      {/* Basic Statistics */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium">Basic Statistics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-3">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <div key={index} className="flex items-center gap-3 p-3 rounded-lg bg-secondary/50">
                  <div className={cn("p-2 rounded-lg", stat.bgColor)}>
                    <Icon className={cn("h-4 w-4", stat.color)} />
                  </div>
                  <div className="flex-1">
                    <div className="text-xs font-medium">{stat.label}</div>
                    <div className="text-lg font-bold">{stat.value}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Additional Metrics from Analysis */}
      {additionalStats.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Analysis Metrics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-3">
              {additionalStats.map((stat, index) => {
                const Icon = stat.icon;
                return (
                  <div key={index} className="flex items-center gap-3 p-3 rounded-lg bg-secondary/50">
                    <div className={cn("p-2 rounded-lg", stat.bgColor)}>
                      <Icon className={cn("h-4 w-4", stat.color)} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <div className="text-xs font-medium">{stat.label}</div>
                        <div className="text-sm font-bold">{stat.value}</div>
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        {stat.description}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Network Type and Properties */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium">Network Properties</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Type</span>
              <span className="text-xs font-medium capitalize">
                {network.type.toLowerCase()}
              </span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Connected</span>
              <span className={cn(
                "text-xs font-medium",
                metrics.connected ? "text-green-600" : "text-red-600"
              )}>
                {metrics.connected ? "Yes" : "No"}
              </span>
            </div>
            
            {network.metadata && (
              <>
                {network.metadata.version && (
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">Version</span>
                    <span className="text-xs font-medium">{network.metadata.version}</span>
                  </div>
                )}
                
                {network.metadata.tags && network.metadata.tags.length > 0 && (
                  <div>
                    <span className="text-xs text-muted-foreground">Tags</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {network.metadata.tags.slice(0, 3).map((tag, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 text-xs bg-primary/10 text-primary rounded-full"
                        >
                          {tag}
                        </span>
                      ))}
                      {network.metadata.tags.length > 3 && (
                        <span className="px-2 py-1 text-xs bg-secondary text-muted-foreground rounded-full">
                          +{network.metadata.tags.length - 3}
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Performance Metrics */}
      {analysis && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Total Analysis Time</span>
                <span className="text-xs font-medium">
                  {(analysis.metadata.executionTime * 1000).toFixed(0)}ms
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Algorithms Run</span>
                <span className="text-xs font-medium">
                  {analysis.centralities.length}
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Avg per Algorithm</span>
                <span className="text-xs font-medium">
                  {((analysis.metadata.executionTime / analysis.centralities.length) * 1000).toFixed(0)}ms
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
