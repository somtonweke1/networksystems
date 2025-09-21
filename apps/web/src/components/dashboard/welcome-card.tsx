'use client';

import React from 'react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { 
  Network, 
  Upload, 
  Zap, 
  BarChart3,
  ArrowRight,
  Sparkles
} from 'lucide-react';
import { cn } from '@networkoracle/ui';

export function WelcomeCard() {
  const quickActions = [
    {
      icon: Upload,
      title: 'Import Network',
      description: 'Upload CSV, JSON, or connect to data source',
      action: 'Import',
      color: 'text-blue-500',
      bgColor: 'bg-blue-50'
    },
    {
      icon: Zap,
      title: 'Run Analysis',
      description: 'Compute centrality measures and network metrics',
      action: 'Analyze',
      color: 'text-green-500',
      bgColor: 'bg-green-50'
    },
    {
      icon: BarChart3,
      title: 'Visualize',
      description: 'Create interactive network visualizations',
      action: 'Visualize',
      color: 'text-purple-500',
      bgColor: 'bg-purple-50'
    }
  ];

  return (
    <Card>
      <CardHeader className="pb-4">
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          <CardTitle className="text-sm font-medium">Welcome to NetworkOracle Pro</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Introduction */}
        <div className="text-xs text-muted-foreground">
          <p className="mb-2">
            Advanced network intelligence platform with 15+ centrality algorithms, 
            real-time visualization, and enterprise-grade analytics.
          </p>
          <div className="flex items-center gap-4 text-xs">
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>15+ Algorithms</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span>Real-time Analysis</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
              <span>Interactive Viz</span>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="space-y-2">
          <div className="text-xs font-medium text-muted-foreground">Quick Start</div>
          <div className="space-y-2">
            {quickActions.map((action, index) => {
              const Icon = action.icon;
              return (
                <div
                  key={index}
                  className="flex items-center gap-3 p-2 rounded-lg hover:bg-secondary/50 transition-colors cursor-pointer"
                  onClick={() => {
                    // TODO: Implement quick actions
                    console.log(`Quick action: ${action.action}`);
                  }}
                >
                  <div className={cn("p-2 rounded-lg", action.bgColor)}>
                    <Icon className={cn("h-4 w-4", action.color)} />
                  </div>
                  <div className="flex-1">
                    <div className="text-xs font-medium">{action.title}</div>
                    <div className="text-xs text-muted-foreground">{action.description}</div>
                  </div>
                  <ArrowRight className="h-3 w-3 text-muted-foreground" />
                </div>
              );
            })}
          </div>
        </div>

        {/* Getting Started */}
        <div className="pt-2 border-t">
          <div className="text-xs font-medium text-muted-foreground mb-2">Getting Started</div>
          <div className="space-y-1 text-xs text-muted-foreground">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-primary/10 flex items-center justify-center text-xs font-medium text-primary">1</div>
              <span>Import or create your network data</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-primary/10 flex items-center justify-center text-xs font-medium text-primary">2</div>
              <span>Select centrality algorithms to run</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-primary/10 flex items-center justify-center text-xs font-medium text-primary">3</div>
              <span>Analyze results and create visualizations</span>
            </div>
          </div>
        </div>

        {/* Status Indicators */}
        <div className="pt-2 border-t">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Service Status</span>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-green-600">All Systems Operational</span>
            </div>
          </div>
          <div className="flex items-center justify-between text-xs mt-1">
            <span className="text-muted-foreground">Analysis Engine</span>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-green-600">Ready</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
