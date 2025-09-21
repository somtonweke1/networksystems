'use client';

import React from 'react';
import { Button } from '@networkoracle/ui';
import { 
  BarChart3, 
  Network, 
  Upload, 
  History, 
  Settings,
  Database,
  Zap,
  Target
} from 'lucide-react';
import { cn } from '@networkoracle/ui';

const navigation = [
  {
    name: 'Dashboard',
    href: '/',
    icon: BarChart3,
    current: true
  },
  {
    name: 'Networks',
    href: '/networks',
    icon: Network,
    current: false
  },
  {
    name: 'Analysis',
    href: '/analysis',
    icon: Zap,
    current: false
  },
  {
    name: 'Visualization',
    href: '/visualization',
    icon: Target,
    current: false
  },
  {
    name: 'Data Sources',
    href: '/data-sources',
    icon: Database,
    current: false
  },
  {
    name: 'History',
    href: '/history',
    icon: History,
    current: false
  }
];

export function Sidebar() {
  return (
    <div className="w-64 border-r bg-background">
      <div className="flex flex-col h-full">
        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-2">
          {navigation.map((item) => {
            const Icon = item.icon;
            return (
              <Button
                key={item.name}
                variant={item.current ? "default" : "ghost"}
                className={cn(
                  "w-full justify-start",
                  item.current 
                    ? "bg-primary text-primary-foreground" 
                    : "text-muted-foreground hover:text-foreground"
                )}
                onClick={() => {
                  // TODO: Add navigation logic
                }}
              >
                <Icon className="h-4 w-4 mr-3" />
                {item.name}
              </Button>
            );
          })}
        </nav>

        {/* Quick Actions */}
        <div className="border-t px-4 py-4 space-y-2">
          <div className="text-xs font-medium text-muted-foreground mb-2">Quick Actions</div>
          
          <Button variant="outline" size="sm" className="w-full justify-start">
            <Upload className="h-4 w-4 mr-2" />
            Import Network
          </Button>
          
          <Button variant="outline" size="sm" className="w-full justify-start">
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </Button>
        </div>
      </div>
    </div>
  );
}
