'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as d3 from 'd3';
import { useNetworkStore } from '@/stores/network-store';
import { useVisualizationStore } from '@/stores/visualization-store';
import { NetworkControls } from './network-controls';
import { NetworkLegend } from './network-legend';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { cn } from '@networkoracle/ui';

interface NetworkVisualizationProps {
  className?: string;
}

export function NetworkVisualization({ className }: NetworkVisualizationProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });
  const [isLoading, setIsLoading] = useState(false);
  
  const { network, analysis } = useNetworkStore();
  const { 
    layout, 
    nodeSize, 
    edgeWidth, 
    colors,
    physics,
    selectedNodes,
    selectedEdges,
    filters 
  } = useVisualizationStore();

  // Update dimensions on resize
  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setDimensions({
          width: rect.width,
          height: rect.height
        });
      }
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  // Create D3 visualization
  const createVisualization = useCallback(() => {
    if (!svgRef.current || !network || !containerRef.current) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove(); // Clear previous visualization

    const { width, height } = dimensions;
    svg.attr('width', width).attr('height', height);

    // Create main group
    const g = svg.append('g');

    // Create zoom behavior
    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.1, 10])
      .on('zoom', (event) => {
        g.attr('transform', event.transform);
      });

    svg.call(zoom);

    // Create force simulation
    const simulation = d3.forceSimulation(network.nodes)
      .force('link', d3.forceLink(network.edges)
        .id((d: any) => d.id)
        .distance(100)
        .strength(0.1))
      .force('charge', d3.forceManyBody()
        .strength(-300))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('collision', d3.forceCollide()
        .radius(30));

    // Create arrow markers for directed edges
    svg.append('defs').selectAll('marker')
      .data(['arrowhead'])
      .enter().append('marker')
      .attr('id', 'arrowhead')
      .attr('viewBox', '-0 -5 10 10')
      .attr('refX', 25)
      .attr('refY', 0)
      .attr('orient', 'auto')
      .attr('markerWidth', 6)
      .attr('markerHeight', 6)
      .attr('xoverflow', 'visible')
      .append('svg:path')
      .attr('d', 'M 0,-5 L 10 ,0 L 0,5')
      .attr('fill', colors.edgeColor)
      .attr('stroke', colors.edgeColor);

    // Create links
    const link = g.append('g')
      .attr('class', 'links')
      .selectAll('line')
      .data(network.edges)
      .enter().append('line')
      .attr('class', 'link')
      .attr('stroke', colors.edgeColor)
      .attr('stroke-opacity', 0.6)
      .attr('stroke-width', (d: any) => {
        if (edgeWidth.attribute && d.properties && d.properties[edgeWidth.attribute]) {
          return Math.max(edgeWidth.min, 
            Math.min(edgeWidth.max, d.properties[edgeWidth.attribute] * edgeWidth.scaling));
        }
        return edgeWidth.min;
      })
      .attr('marker-end', (d: any) => network.type === 'DIRECTED' ? 'url(#arrowhead)' : null);

    // Create nodes
    const node = g.append('g')
      .attr('class', 'nodes')
      .selectAll('circle')
      .data(network.nodes)
      .enter().append('circle')
      .attr('class', 'node')
      .attr('r', (d: any) => {
        if (nodeSize.attribute && d.properties && d.properties[nodeSize.attribute]) {
          return Math.max(nodeSize.min, 
            Math.min(nodeSize.max, d.properties[nodeSize.attribute] * nodeSize.scaling));
        }
        return nodeSize.min;
      })
      .attr('fill', (d: any) => {
        if (selectedNodes.includes(d.id)) {
          return colors.highlightColor;
        }
        return colors.nodeColor;
      })
      .attr('stroke', '#fff')
      .attr('stroke-width', 2)
      .style('cursor', 'pointer')
      .call(d3.drag<SVGCircleElement, any>()
        .on('start', dragstarted)
        .on('drag', dragged)
        .on('end', dragended));

    // Add node labels
    const labels = g.append('g')
      .attr('class', 'labels')
      .selectAll('text')
      .data(network.nodes)
      .enter().append('text')
      .attr('class', 'label')
      .text((d: any) => d.label || d.id)
      .attr('font-size', 12)
      .attr('font-family', 'Arial, sans-serif')
      .attr('text-anchor', 'middle')
      .attr('dy', '.35em')
      .style('pointer-events', 'none')
      .style('user-select', 'none');

    // Node click handler
    node.on('click', (event, d) => {
      event.stopPropagation();
      useVisualizationStore.getState().toggleNodeSelection(d.id);
    });

    // Link click handler
    link.on('click', (event, d) => {
      event.stopPropagation();
      useVisualizationStore.getState().toggleEdgeSelection(d.id);
    });

    // Background click handler
    svg.on('click', () => {
      useVisualizationStore.getState().clearSelection();
    });

    // Update positions on simulation tick
    simulation.on('tick', () => {
      link
        .attr('x1', (d: any) => d.source.x)
        .attr('y1', (d: any) => d.source.y)
        .attr('x2', (d: any) => d.target.x)
        .attr('y2', (d: any) => d.target.y);

      node
        .attr('cx', (d: any) => d.x)
        .attr('cy', (d: any) => d.y);

      labels
        .attr('x', (d: any) => d.x)
        .attr('y', (d: any) => d.y);
    });

    // Drag functions
    function dragstarted(event: d3.D3DragEvent<SVGCircleElement, any, any>, d: any) {
      if (!event.active) simulation.alphaTarget(0.3).restart();
      d.fx = d.x;
      d.fy = d.y;
    }

    function dragged(event: d3.D3DragEvent<SVGCircleElement, any, any>, d: any) {
      d.fx = event.x;
      d.fy = event.y;
    }

    function dragended(event: d3.D3DragEvent<SVGCircleElement, any, any>, d: any) {
      if (!event.active) simulation.alphaTarget(0);
      d.fx = null;
      d.fy = null;
    }

    // Apply centrality-based coloring if analysis is available
    if (analysis && analysis.centralities) {
      node.attr('fill', (d: any) => {
        const nodeAnalysis = analysis.centralities.find(c => c.type === 'degree');
        if (nodeAnalysis) {
          const nodeResult = nodeAnalysis.results.find(r => r.nodeId === d.id);
          if (nodeResult) {
            const intensity = nodeResult.value;
            return d3.interpolateReds(intensity);
          }
        }
        return colors.nodeColor;
      });
    }

  }, [network, analysis, dimensions, layout, nodeSize, edgeWidth, colors, physics, selectedNodes, selectedEdges, filters]);

  // Recreate visualization when dependencies change
  useEffect(() => {
    if (network) {
      setIsLoading(true);
      createVisualization();
      setTimeout(() => setIsLoading(false), 100);
    }
  }, [network, createVisualization]);

  if (!network) {
    return (
      <div className={cn("flex items-center justify-center h-full", className)}>
        <div className="text-center">
          <div className="text-muted-foreground mb-4">
            No network data available
          </div>
          <p className="text-sm text-muted-foreground">
            Load a network to start visualization
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("relative w-full h-full", className)} ref={containerRef}>
      {isLoading && (
        <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-10">
          <LoadingSpinner />
        </div>
      )}
      
      <svg
        ref={svgRef}
        className="w-full h-full border rounded-lg"
        style={{ background: colors.backgroundColor }}
      />
      
      <NetworkControls className="absolute top-4 left-4 z-10" />
      <NetworkLegend className="absolute bottom-4 right-4 z-10" />
    </div>
  );
}
