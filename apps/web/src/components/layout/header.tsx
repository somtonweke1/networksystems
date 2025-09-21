'use client';

import React from 'react';
import { Button } from '@networkoracle/ui';
import { 
  Network, 
  Menu, 
  Settings, 
  HelpCircle, 
  User,
  Upload,
  Download,
  Save
} from 'lucide-react';
import { cn } from '@networkoracle/ui';

export function Header() {
  return (
    <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between px-4">
        {/* Logo and Title */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Network className="h-6 w-6 text-primary" />
            <div>
              <h1 className="text-lg font-bold">NetworkOracle Pro</h1>
              <p className="text-xs text-muted-foreground">Advanced Network Intelligence</p>
            </div>
          </div>
        </div>

        {/* Main Actions */}
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Upload className="h-4 w-4 mr-2" />
            Import
          </Button>
          
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          
          <Button variant="outline" size="sm">
            <Save className="h-4 w-4 mr-2" />
            Save
          </Button>
        </div>

        {/* User Actions */}
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" title="Help">
            <HelpCircle className="h-4 w-4" />
          </Button>
          
          <Button variant="ghost" size="sm" title="Settings">
            <Settings className="h-4 w-4" />
          </Button>
          
          <Button variant="ghost" size="sm" title="Profile">
            <User className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </header>
  );
}
