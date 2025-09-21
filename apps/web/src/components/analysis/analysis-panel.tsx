'use client';

import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { useNetworkStore } from '@/stores/network-store';
import { 
  Play, 
  Settings, 
  Download, 
  RefreshCw,
  BarChart3,
  Network,
  Zap,
  Target,
  CheckCircle,
  Clock
} from 'lucide-react';
import { cn } from '@networkoracle/ui';

const CENTRALITY_OPTIONS = [
  { id: 'degree', label: 'Degree Centrality', description: 'Number of connections', icon: Network },
  { id: 'betweenness', label: 'Betweenness Centrality', description: 'Bridge importance', icon: Target },
  { id: 'closeness', label: 'Closeness Centrality', description: 'Proximity to others', icon: Zap },
  { id: 'eigenvector', label: 'Eigenvector Centrality', description: 'Influence measure', icon: BarChart3 },
  { id: 'pagerank', label: 'PageRank', description: 'Page importance', icon: BarChart3 },
  { id: 'katz', label: 'Katz Centrality', description: 'Attenuated influence', icon: Zap },
  { id: 'harmonic', label: 'Harmonic Centrality', description: 'Harmonic distance', icon: Network },
  { id: 'load', label: 'Load Centrality', description: 'Traffic load', icon: Target },
  { id: 'hits_hubs', label: 'HITS Hubs', description: 'Hub authority', icon: Network },
  { id: 'hits_authorities', label: 'HITS Authorities', description: 'Authority score', icon: Target },
  { id: 'leverage', label: 'Leverage Centrality', description: 'Neighborhood importance', icon: Zap },
  { id: 'subgraph', label: 'Subgraph Centrality', description: 'Closed walks', icon: BarChart3 },
  { id: 'alpha', label: 'Alpha Centrality', description: 'External influence', icon: Network },
  { id: 'communicability_betweenness', label: 'Communicability Betweenness', description: 'Communication flow', icon: Target },
  { id: 'bonacich_power', label: 'Bonacich Power', description: 'Power centrality', icon: Zap }
];

export function AnalysisPanel() {
  const { 
    network, 
    analysis, 
    isAnalyzing, 
    computeCentrality, 
    clearAnalysis 
  } = useNetworkStore();
  
  const [selectedCentralities, setSelectedCentralities] = useState<string[]>([]);
  const [showSettings, setShowSettings] = useState(false);

  const toggleCentrality = (centralityId: string) => {
    setSelectedCentralities(prev => 
      prev.includes(centralityId) 
        ? prev.filter(id => id !== centralityId)
        : [...prev, centralityId]
    );
  };

  const handleRunAnalysis = async () => {
    if (selectedCentralities.length === 0) return;
    
    try {
      await computeCentrality(selectedCentralities);
    } catch (error) {
      console.error('Analysis failed:', error);
    }
  };

  const handleClearAnalysis = () => {
    clearAnalysis();
    setSelectedCentralities([]);
  };

  const handleExportResults = () => {
    if (!analysis) return;
    
    const dataStr = JSON.stringify(analysis, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `network-analysis-${Date.now()}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  if (!network) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">Analysis Panel</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-muted-foreground py-8">
            <BarChart3 className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No network loaded</p>
            <p className="text-xs">Load a network to run analysis</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Analysis Controls */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium">Analysis Controls</CardTitle>
            <div className="flex gap-1">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowSettings(!showSettings)}
                title="Settings"
              >
                <Settings className="h-3 w-3" />
              </Button>
              {analysis && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleExportResults}
                  title="Export Results"
                >
                  <Download className="h-3 w-3" />
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Centrality Selection */}
          <div className="space-y-2">
            <div className="text-xs font-medium text-muted-foreground">
              Select Centrality Algorithms ({selectedCentralities.length} selected)
            </div>
            <div className="grid grid-cols-1 gap-2 max-h-48 overflow-y-auto">
              {CENTRALITY_OPTIONS.map((option) => {
                const Icon = option.icon;
                const isSelected = selectedCentralities.includes(option.id);
                const isComputed = analysis?.centralities?.some(c => c.type === option.id.toUpperCase());
                
                return (
                  <div
                    key={option.id}
                    className={cn(
                      "flex items-center gap-2 p-2 rounded cursor-pointer transition-colors",
                      isSelected 
                        ? "bg-primary/10 border border-primary/20" 
                        : "bg-secondary/50 hover:bg-secondary/80",
                      isComputed && "border-green-200 bg-green-50"
                    )}
                    onClick={() => toggleCentrality(option.id)}
                  >
                    <div className="flex items-center gap-2 flex-1">
                      <Icon className="h-4 w-4 text-muted-foreground" />
                      <div className="flex-1">
                        <div className="text-xs font-medium">{option.label}</div>
                        <div className="text-xs text-muted-foreground">{option.description}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      {isComputed && (
                        <CheckCircle className="h-3 w-3 text-green-500" />
                      )}
                      {isSelected && (
                        <div className="w-2 h-2 bg-primary rounded-full"></div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            <Button
              onClick={handleRunAnalysis}
              disabled={selectedCentralities.length === 0 || isAnalyzing}
              className="flex-1"
              size="sm"
            >
              {isAnalyzing ? (
                <>
                  <RefreshCw className="h-3 w-3 mr-2 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Play className="h-3 w-3 mr-2" />
                  Run Analysis
                </>
              )}
            </Button>
            
            {analysis && (
              <Button
                variant="outline"
                onClick={handleClearAnalysis}
                size="sm"
              >
                Clear
              </Button>
            )}
          </div>

          {/* Analysis Status */}
          {isAnalyzing && (
            <div className="flex items-center gap-2 p-2 bg-blue-50 rounded text-xs">
              <Clock className="h-3 w-3 text-blue-500 animate-spin" />
              <span className="text-blue-700">
                Computing centrality measures... This may take a few moments for large networks.
              </span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Analysis Results Summary */}
      {analysis && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Analysis Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <div className="text-muted-foreground">Algorithms Run</div>
                  <div className="font-medium">{analysis.centralities.length}</div>
                </div>
                <div>
                  <div className="text-muted-foreground">Execution Time</div>
                  <div className="font-medium">
                    {(analysis.metadata.executionTime * 1000).toFixed(0)}ms
                  </div>
                </div>
                <div>
                  <div className="text-muted-foreground">Network Size</div>
                  <div className="font-medium">{network.nodes.length} nodes</div>
                </div>
                <div>
                  <div className="text-muted-foreground">Edges</div>
                  <div className="font-medium">{network.edges.length} edges</div>
                </div>
              </div>
              
              <div className="pt-2 border-t">
                <div className="text-xs text-muted-foreground mb-2">Completed Algorithms</div>
                <div className="flex flex-wrap gap-1">
                  {analysis.centralities.map((centrality) => (
                    <span
                      key={centrality.type}
                      className="px-2 py-1 text-xs bg-green-100 text-green-700 rounded-full"
                    >
                      {centrality.type.replace('_', ' ')}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Settings Panel */}
      {showSettings && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Analysis Settings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 text-xs">
              <div>
                <label className="text-muted-foreground">Normalization</label>
                <div className="mt-1">
                  <label className="flex items-center gap-2">
                    <input type="checkbox" defaultChecked className="rounded" />
                    <span>Normalize centrality values</span>
                  </label>
                </div>
              </div>
              
              <div>
                <label className="text-muted-foreground">Convergence Tolerance</label>
                <input
                  type="number"
                  defaultValue={1e-6}
                  step={1e-7}
                  className="w-full mt-1 px-2 py-1 border rounded text-xs"
                />
              </div>
              
              <div>
                <label className="text-muted-foreground">Max Iterations</label>
                <input
                  type="number"
                  defaultValue={100}
                  min={10}
                  max={1000}
                  className="w-full mt-1 px-2 py-1 border rounded text-xs"
                />
              </div>
              
              <div>
                <label className="text-muted-foreground">Alpha (Damping)</label>
                <input
                  type="number"
                  defaultValue={0.85}
                  min={0.1}
                  max={1}
                  step={0.05}
                  className="w-full mt-1 px-2 py-1 border rounded text-xs"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
