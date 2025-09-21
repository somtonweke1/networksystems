'use client';

import React from 'react';
import { Button } from '@networkoracle/ui';
import { Card, CardContent, CardHeader, CardTitle } from '@networkoracle/ui';
import { useVisualizationStore } from '@/stores/visualization-store';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  ZoomIn, 
  ZoomOut, 
  Maximize2,
  Settings,
  Palette,
  Network
} from 'lucide-react';
import { cn } from '@networkoracle/ui';

interface NetworkControlsProps {
  className?: string;
}

export function NetworkControls({ className }: NetworkControlsProps) {
  const {
    layout,
    physics,
    setLayout,
    setPhysics,
    resetView,
    zoomIn,
    zoomOut,
    fitToView,
    togglePhysics
  } = useVisualizationStore();

  const layoutOptions = [
    { value: 'FORCE_DIRECTED', label: 'Force Directed', icon: Network },
    { value: 'HIERARCHICAL', label: 'Hierarchical', icon: Network },
    { value: 'CIRCULAR', label: 'Circular', icon: Network },
    { value: 'GRID', label: 'Grid', icon: Network }
  ];

  return (
    <Card className={cn("w-64", className)}>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <Settings className="h-4 w-4" />
          Visualization Controls
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Physics Controls */}
        <div className="space-y-2">
          <div className="text-xs font-medium text-muted-foreground">Physics</div>
          <div className="flex gap-1">
            <Button
              variant={physics.enabled ? "default" : "outline"}
              size="sm"
              onClick={togglePhysics}
              className="flex-1"
            >
              {physics.enabled ? (
                <>
                  <Pause className="h-3 w-3 mr-1" />
                  Pause
                </>
              ) : (
                <>
                  <Play className="h-3 w-3 mr-1" />
                  Play
                </>
              )}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={resetView}
              title="Reset view"
            >
              <RotateCcw className="h-3 w-3" />
            </Button>
          </div>
        </div>

        {/* Layout Controls */}
        <div className="space-y-2">
          <div className="text-xs font-medium text-muted-foreground">Layout</div>
          <div className="grid grid-cols-2 gap-1">
            {layoutOptions.map((option) => {
              const Icon = option.icon;
              return (
                <Button
                  key={option.value}
                  variant={layout === option.value ? "default" : "outline"}
                  size="sm"
                  onClick={() => setLayout(option.value as any)}
                  className="text-xs"
                >
                  <Icon className="h-3 w-3 mr-1" />
                  {option.label}
                </Button>
              );
            })}
          </div>
        </div>

        {/* Zoom Controls */}
        <div className="space-y-2">
          <div className="text-xs font-medium text-muted-foreground">Zoom</div>
          <div className="flex gap-1">
            <Button
              variant="outline"
              size="sm"
              onClick={zoomOut}
              title="Zoom out"
            >
              <ZoomOut className="h-3 w-3" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={fitToView}
              title="Fit to view"
              className="flex-1"
            >
              <Maximize2 className="h-3 w-3 mr-1" />
              Fit
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={zoomIn}
              title="Zoom in"
            >
              <ZoomIn className="h-3 w-3" />
            </Button>
          </div>
        </div>

        {/* Physics Parameters */}
        {physics.enabled && (
          <div className="space-y-2">
            <div className="text-xs font-medium text-muted-foreground">Physics Settings</div>
            <div className="space-y-2">
              <div>
                <label className="text-xs text-muted-foreground">Repulsion</label>
                <input
                  type="range"
                  min="100"
                  max="2000"
                  step="100"
                  value={physics.repulsion}
                  onChange={(e) => setPhysics({ ...physics, repulsion: Number(e.target.value) })}
                  className="w-full h-1 bg-secondary rounded-lg appearance-none cursor-pointer"
                />
                <div className="text-xs text-muted-foreground text-center">{physics.repulsion}</div>
              </div>
              
              <div>
                <label className="text-xs text-muted-foreground">Attraction</label>
                <input
                  type="range"
                  min="0.01"
                  max="1"
                  step="0.01"
                  value={physics.attraction}
                  onChange={(e) => setPhysics({ ...physics, attraction: Number(e.target.value) })}
                  className="w-full h-1 bg-secondary rounded-lg appearance-none cursor-pointer"
                />
                <div className="text-xs text-muted-foreground text-center">{physics.attraction}</div>
              </div>
              
              <div>
                <label className="text-xs text-muted-foreground">Damping</label>
                <input
                  type="range"
                  min="0.1"
                  max="1"
                  step="0.1"
                  value={physics.damping}
                  onChange={(e) => setPhysics({ ...physics, damping: Number(e.target.value) })}
                  className="w-full h-1 bg-secondary rounded-lg appearance-none cursor-pointer"
                />
                <div className="text-xs text-muted-foreground text-center">{physics.damping}</div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
