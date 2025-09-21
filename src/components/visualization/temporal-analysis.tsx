'use client';

import React, { useState, useEffect, useRef } from 'react';
import * as d3 from 'd3';

interface TemporalNode {
  id: string;
  label: string;
  x: number;
  y: number;
  size: number;
  color: string;
  centrality?: number;
  timestamp: number;
}

interface TemporalEdge {
  source: string;
  target: string;
  weight: number;
  color?: string;
  timestamp: number;
}

interface TemporalAnalysisProps {
  networkHistory: Array<{
    timestamp: number;
    nodes: TemporalNode[];
    edges: TemporalEdge[];
  }>;
  width?: number;
  height?: number;
  showEvolution?: boolean;
  animationSpeed?: number;
}

export function TemporalAnalysis({
  networkHistory,
  width = 800,
  height = 600,
  showEvolution = true,
  animationSpeed = 1000
}: TemporalAnalysisProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [currentTimeIndex, setCurrentTimeIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [selectedMetrics, setSelectedMetrics] = useState<string[]>(['density', 'clustering']);

  // Sort network history by timestamp
  const sortedHistory = [...networkHistory].sort((a, b) => a.timestamp - b.timestamp);

  // Calculate network metrics for each time point
  const networkMetrics = sortedHistory.map((snapshot, index) => {
    const nodes = snapshot.nodes;
    const edges = snapshot.edges;
    
    // Calculate density
    const maxPossibleEdges = nodes.length * (nodes.length - 1) / 2;
    const density = maxPossibleEdges > 0 ? edges.length / maxPossibleEdges : 0;
    
    // Calculate average degree
    const degreeSum = edges.length * 2; // Each edge contributes to 2 nodes
    const avgDegree = nodes.length > 0 ? degreeSum / nodes.length : 0;
    
    // Calculate clustering coefficient (simplified)
    const clusteringCoeff = calculateClusteringCoefficient(nodes, edges);
    
    // Calculate largest component size
    const componentSize = calculateLargestComponent(nodes, edges);
    
    return {
      timestamp: snapshot.timestamp,
      index,
      metrics: {
        nodeCount: nodes.length,
        edgeCount: edges.length,
        density,
        avgDegree,
        clusteringCoeff,
        componentSize,
        modularity: calculateModularity(nodes, edges)
      }
    };
  });

  // Calculate clustering coefficient
  function calculateClusteringCoefficient(nodes: TemporalNode[], edges: TemporalEdge[]): number {
    if (nodes.length < 3) return 0;
    
    let totalClustering = 0;
    let nodesWithNeighbors = 0;
    
    nodes.forEach(node => {
      const neighbors = edges
        .filter(e => e.source === node.id || e.target === node.id)
        .map(e => e.source === node.id ? e.target : e.source);
      
      if (neighbors.length >= 2) {
        let triangles = 0;
        for (let i = 0; i < neighbors.length; i++) {
          for (let j = i + 1; j < neighbors.length; j++) {
            const hasEdge = edges.some(e => 
              (e.source === neighbors[i] && e.target === neighbors[j]) ||
              (e.source === neighbors[j] && e.target === neighbors[i])
            );
            if (hasEdge) triangles++;
          }
        }
        const possibleTriangles = neighbors.length * (neighbors.length - 1) / 2;
        totalClustering += possibleTriangles > 0 ? triangles / possibleTriangles : 0;
        nodesWithNeighbors++;
      }
    });
    
    return nodesWithNeighbors > 0 ? totalClustering / nodesWithNeighbors : 0;
  }

  // Calculate largest connected component
  function calculateLargestComponent(nodes: TemporalNode[], edges: TemporalEdge[]): number {
    if (nodes.length === 0) return 0;
    
    const visited = new Set<string>();
    let maxSize = 0;
    
    nodes.forEach(node => {
      if (!visited.has(node.id)) {
        const componentSize = dfs(node.id, visited, edges);
        maxSize = Math.max(maxSize, componentSize);
      }
    });
    
    return maxSize;
  }

  // DFS for component calculation
  function dfs(nodeId: string, visited: Set<string>, edges: TemporalEdge[]): number {
    visited.add(nodeId);
    let size = 1;
    
    const neighbors = edges
      .filter(e => e.source === nodeId || e.target === nodeId)
      .map(e => e.source === nodeId ? e.target : e.source);
    
    neighbors.forEach(neighbor => {
      if (!visited.has(neighbor)) {
        size += dfs(neighbor, visited, edges);
      }
    });
    
    return size;
  }

  // Calculate modularity (simplified)
  function calculateModularity(nodes: TemporalNode[], edges: TemporalEdge[]): number {
    // Simplified modularity calculation
    // In a real implementation, you'd use a proper community detection algorithm
    const communities = new Map<string, number>();
    nodes.forEach((node, index) => {
      communities.set(node.id, index % Math.max(1, Math.floor(nodes.length / 5)));
    });
    
    let modularity = 0;
    const m = edges.length;
    
    if (m > 0) {
      edges.forEach(edge => {
        const sourceCommunity = communities.get(edge.source);
        const targetCommunity = communities.get(edge.target);
        
        if (sourceCommunity === targetCommunity) {
          modularity += 1;
        }
      });
      
      modularity = (modularity / m) - 0.5; // Simplified calculation
    }
    
    return Math.max(0, modularity);
  }

  // Animation effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isPlaying && sortedHistory.length > 1) {
      interval = setInterval(() => {
        setCurrentTimeIndex(prev => (prev + 1) % sortedHistory.length);
      }, animationSpeed);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isPlaying, sortedHistory.length, animationSpeed]);

  // D3 visualization
  useEffect(() => {
    if (!svgRef.current || networkMetrics.length === 0) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const margin = { top: 20, right: 30, bottom: 40, left: 40 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    const g = svg.append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    // Create scales
    const xScale = d3.scaleLinear()
      .domain(d3.extent(networkMetrics, d => d.index) as [number, number])
      .range([0, innerWidth]);

    const yScale = d3.scaleLinear()
      .domain([0, d3.max(networkMetrics, d => Math.max(
        d.metrics.density,
        d.metrics.clusteringCoeff,
        d.metrics.avgDegree / 10, // Normalize for visualization
        d.metrics.componentSize / 100
      )) as number])
      .range([innerHeight, 0]);

    // Create line generators
    const line = d3.line<typeof networkMetrics[0]>()
      .x(d => xScale(d.index))
      .y(d => yScale(d.metrics.density))
      .curve(d3.curveMonotoneX);

    const line2 = d3.line<typeof networkMetrics[0]>()
      .x(d => xScale(d.index))
      .y(d => yScale(d.metrics.clusteringCoeff))
      .curve(d3.curveMonotoneX);

    // Add axes
    g.append("g")
      .attr("transform", `translate(0,${innerHeight})`)
      .call(d3.axisBottom(xScale).tickFormat(d => `T${d}`));

    g.append("g")
      .call(d3.axisLeft(yScale));

    // Add current time indicator
    const currentTimeLine = g.append("line")
      .attr("x1", xScale(currentTimeIndex))
      .attr("x2", xScale(currentTimeIndex))
      .attr("y1", 0)
      .attr("y2", innerHeight)
      .attr("stroke", "#ff6b6b")
      .attr("stroke-width", 2)
      .attr("stroke-dasharray", "5,5");

    // Update current time line when time index changes
    currentTimeLine
      .transition()
      .duration(200)
      .attr("x1", xScale(currentTimeIndex))
      .attr("x2", xScale(currentTimeIndex));

    // Add metrics lines
    if (selectedMetrics.includes('density')) {
      g.append("path")
        .datum(networkMetrics)
        .attr("fill", "none")
        .attr("stroke", "#4ecdc4")
        .attr("stroke-width", 2)
        .attr("d", line);
    }

    if (selectedMetrics.includes('clustering')) {
      g.append("path")
        .datum(networkMetrics)
        .attr("fill", "none")
        .attr("stroke", "#45b7d1")
        .attr("stroke-width", 2)
        .attr("d", line2);
    }

    // Add legend
    const legend = g.append("g")
      .attr("transform", `translate(${innerWidth - 150}, 20)`);

    legend.append("text")
      .attr("x", 0)
      .attr("y", 0)
      .attr("font-size", "12px")
      .attr("fill", "#4ecdc4")
      .text("Density");

    legend.append("text")
      .attr("x", 0)
      .attr("y", 20)
      .attr("font-size", "12px")
      .attr("fill", "#45b7d1")
      .text("Clustering");

  }, [networkMetrics, currentTimeIndex, selectedMetrics, width, height]);

  // Get current network snapshot
  const currentSnapshot = sortedHistory[currentTimeIndex];

  return (
    <div className="w-full space-y-4">
      {/* Controls */}
      <div className="flex flex-wrap gap-4 items-center justify-between bg-gray-100 p-4 rounded-lg">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className={`px-4 py-2 rounded ${
              isPlaying ? 'bg-red-500 text-white' : 'bg-green-500 text-white'
            }`}
          >
            {isPlaying ? 'Pause' : 'Play'}
          </button>
          
          <div className="flex items-center gap-2">
            <label>Time:</label>
            <input
              type="range"
              min="0"
              max={sortedHistory.length - 1}
              value={currentTimeIndex}
              onChange={(e) => setCurrentTimeIndex(Number(e.target.value))}
              className="w-32"
            />
            <span>{currentTimeIndex + 1} / {sortedHistory.length}</span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <label>Metrics:</label>
          {['density', 'clustering', 'avgDegree', 'componentSize'].map(metric => (
            <label key={metric} className="flex items-center gap-1">
              <input
                type="checkbox"
                checked={selectedMetrics.includes(metric)}
                onChange={(e) => {
                  if (e.target.checked) {
                    setSelectedMetrics([...selectedMetrics, metric]);
                  } else {
                    setSelectedMetrics(selectedMetrics.filter(m => m !== metric));
                  }
                }}
              />
              {metric}
            </label>
          ))}
        </div>
      </div>

      {/* Main visualization */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Temporal evolution chart */}
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Network Evolution Over Time</h3>
          <svg
            ref={svgRef}
            width={width}
            height={height}
            className="border rounded"
          />
        </div>

        {/* Current snapshot metrics */}
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">
            Current Snapshot (Time {currentTimeIndex + 1})
          </h3>
          {currentSnapshot && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-blue-50 p-3 rounded">
                  <div className="text-sm text-gray-600">Nodes</div>
                  <div className="text-2xl font-bold text-blue-600">
                    {currentSnapshot.nodes.length}
                  </div>
                </div>
                <div className="bg-green-50 p-3 rounded">
                  <div className="text-sm text-gray-600">Edges</div>
                  <div className="text-2xl font-bold text-green-600">
                    {currentSnapshot.edges.length}
                  </div>
                </div>
                <div className="bg-purple-50 p-3 rounded">
                  <div className="text-sm text-gray-600">Density</div>
                  <div className="text-2xl font-bold text-purple-600">
                    {networkMetrics[currentTimeIndex]?.metrics.density.toFixed(3)}
                  </div>
                </div>
                <div className="bg-orange-50 p-3 rounded">
                  <div className="text-sm text-gray-600">Clustering</div>
                  <div className="text-2xl font-bold text-orange-600">
                    {networkMetrics[currentTimeIndex]?.metrics.clusteringCoeff.toFixed(3)}
                  </div>
                </div>
              </div>

              {/* Network summary */}
              <div className="mt-4">
                <h4 className="font-semibold mb-2">Network Summary</h4>
                <div className="text-sm space-y-1">
                  <p>Average Degree: {networkMetrics[currentTimeIndex]?.metrics.avgDegree.toFixed(2)}</p>
                  <p>Largest Component: {networkMetrics[currentTimeIndex]?.metrics.componentSize} nodes</p>
                  <p>Modularity: {networkMetrics[currentTimeIndex]?.metrics.modularity.toFixed(3)}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Evolution insights */}
      <div className="bg-white p-4 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4">Evolution Insights</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-blue-50 p-3 rounded">
            <div className="text-sm text-gray-600">Growth Rate</div>
            <div className="text-lg font-bold text-blue-600">
              {networkMetrics.length > 1 
                ? `${((networkMetrics[networkMetrics.length - 1].metrics.nodeCount - networkMetrics[0].metrics.nodeCount) / networkMetrics[0].metrics.nodeCount * 100).toFixed(1)}%`
                : '0%'
              }
            </div>
          </div>
          <div className="bg-green-50 p-3 rounded">
            <div className="text-sm text-gray-600">Stability</div>
            <div className="text-lg font-bold text-green-600">
              {networkMetrics.length > 1 
                ? `${(networkMetrics.reduce((acc, curr, i) => i > 0 ? acc + Math.abs(curr.metrics.density - networkMetrics[i-1].metrics.density) : 0, 0) / (networkMetrics.length - 1) < 0.1 ? 'High' : 'Low')}`
                : 'N/A'
              }
            </div>
          </div>
          <div className="bg-purple-50 p-3 rounded">
            <div className="text-sm text-gray-600">Complexity</div>
            <div className="text-lg font-bold text-purple-600">
              {networkMetrics[currentTimeIndex]?.metrics.density > 0.5 ? 'High' : 
               networkMetrics[currentTimeIndex]?.metrics.density > 0.2 ? 'Medium' : 'Low'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
