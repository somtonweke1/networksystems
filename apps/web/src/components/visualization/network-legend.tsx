'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@networkoracle/ui';
import { useNetworkStore } from '@/stores/network-store';
import { useVisualizationStore } from '@/stores/visualization-store';
import { 
  Circle, 
  Square, 
  Triangle, 
  Info,
  BarChart3,
  Users,
  Network
} from 'lucide-react';
import { cn } from '@networkoracle/ui';

interface NetworkLegendProps {
  className?: string;
}

export function NetworkLegend({ className }: NetworkLegendProps) {
  const { network, analysis } = useNetworkStore();
  const { selectedNodes, selectedEdges } = useVisualizationStore();

  if (!network) return null;

  const nodeCount = network.nodes.length;
  const edgeCount = network.edges.length;
  const selectedNodeCount = selectedNodes.length;
  const selectedEdgeCount = selectedEdges.length;

  // Calculate basic network metrics
  const density = network.edges.length / (network.nodes.length * (network.nodes.length - 1) / 2);
  const averageDegree = network.edges.length * 2 / network.nodes.length;

  return (
    <Card className={cn("w-64", className)}>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <Info className="h-4 w-4" />
          Network Legend
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Network Statistics */}
        <div className="space-y-2">
          <div className="text-xs font-medium text-muted-foreground">Statistics</div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="flex items-center gap-2">
              <Circle className="h-3 w-3 text-blue-500" />
              <span>Nodes: {nodeCount}</span>
            </div>
            <div className="flex items-center gap-2">
              <Square className="h-3 w-3 text-green-500" />
              <span>Edges: {edgeCount}</span>
            </div>
            <div className="flex items-center gap-2">
              <BarChart3 className="h-3 w-3 text-purple-500" />
              <span>Density: {(density * 100).toFixed(1)}%</span>
            </div>
            <div className="flex items-center gap-2">
              <Network className="h-3 w-3 text-orange-500" />
              <span>Avg Degree: {averageDegree.toFixed(1)}</span>
            </div>
          </div>
        </div>

        {/* Selection Status */}
        {(selectedNodeCount > 0 || selectedEdgeCount > 0) && (
          <div className="space-y-2">
            <div className="text-xs font-medium text-muted-foreground">Selection</div>
            <div className="text-xs space-y-1">
              {selectedNodeCount > 0 && (
                <div className="flex items-center gap-2">
                  <Circle className="h-3 w-3 text-blue-600" />
                  <span>{selectedNodeCount} node{selectedNodeCount !== 1 ? 's' : ''} selected</span>
                </div>
              )}
              {selectedEdgeCount > 0 && (
                <div className="flex items-center gap-2">
                  <Square className="h-3 w-3 text-green-600" />
                  <span>{selectedEdgeCount} edge{selectedEdgeCount !== 1 ? 's' : ''} selected</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Centrality Information */}
        {analysis && analysis.centralities && analysis.centralities.length > 0 && (
          <div className="space-y-2">
            <div className="text-xs font-medium text-muted-foreground">Centrality Analysis</div>
            <div className="space-y-1">
              {analysis.centralities.slice(0, 3).map((centrality, index) => (
                <div key={centrality.type} className="flex items-center gap-2 text-xs">
                  <div className={`h-2 w-2 rounded-full ${
                    index === 0 ? 'bg-red-500' : 
                    index === 1 ? 'bg-yellow-500' : 'bg-green-500'
                  }`} />
                  <span className="capitalize">{centrality.type.replace('_', ' ')}</span>
                </div>
              ))}
              {analysis.centralities.length > 3 && (
                <div className="text-xs text-muted-foreground">
                  +{analysis.centralities.length - 3} more...
                </div>
              )}
            </div>
          </div>
        )}

        {/* Color Scale */}
        <div className="space-y-2">
          <div className="text-xs font-medium text-muted-foreground">Color Scale</div>
          <div className="flex items-center gap-2">
            <div className="text-xs">Low</div>
            <div className="flex-1 h-3 bg-gradient-to-r from-blue-200 to-red-500 rounded"></div>
            <div className="text-xs">High</div>
          </div>
          <div className="text-xs text-muted-foreground">
            Centrality values
          </div>
        </div>

        {/* Network Type */}
        <div className="space-y-2">
          <div className="text-xs font-medium text-muted-foreground">Network Type</div>
          <div className="flex items-center gap-2 text-xs">
            <Triangle className="h-3 w-3 text-blue-500" />
            <span className="capitalize">{network.type.toLowerCase()}</span>
          </div>
        </div>

        {/* Interactive Hints */}
        <div className="space-y-2 pt-2 border-t">
          <div className="text-xs font-medium text-muted-foreground">Interactions</div>
          <div className="text-xs space-y-1 text-muted-foreground">
            <div>• Click nodes to select</div>
            <div>• Drag to move nodes</div>
            <div>• Scroll to zoom</div>
            <div>• Drag background to pan</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
