'use client';

import React, { useRef, useState, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Text, Sphere, Line } from '@react-three/drei';
import * as THREE from 'three';

interface Node3D {
  id: string;
  label: string;
  x: number;
  y: number;
  z: number;
  size: number;
  color: string;
  centrality?: number;
  group?: string;
}

interface Edge3D {
  source: string;
  target: string;
  weight: number;
  color?: string;
}

interface Network3DProps {
  nodes: Node3D[];
  edges: Edge3D[];
  width?: number;
  height?: number;
  showLabels?: boolean;
  animationSpeed?: number;
  colorScheme?: 'centrality' | 'group' | 'default';
}

// 3D Node Component
function Node3DComponent({ 
  node, 
  showLabel, 
  colorScheme, 
  isSelected, 
  onClick 
}: { 
  node: Node3D; 
  showLabel: boolean; 
  colorScheme: string;
  isSelected: boolean;
  onClick: (node: Node3D) => void;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);

  // Animation for selected nodes
  useFrame((state) => {
    if (meshRef.current) {
      if (isSelected || hovered) {
        meshRef.current.scale.setScalar(1.5 + Math.sin(state.clock.elapsedTime * 4) * 0.1);
      } else {
        meshRef.current.scale.lerp(new THREE.Vector3(1, 1, 1), 0.1);
      }
    }
  });

  // Determine color based on scheme
  const getColor = () => {
    if (colorScheme === 'centrality' && node.centrality !== undefined) {
      // Color by centrality (red = high, blue = low)
      const intensity = Math.max(0, Math.min(1, node.centrality));
      return new THREE.Color().setHSL(intensity * 0.7, 0.8, 0.6);
    } else if (colorScheme === 'group' && node.group) {
      // Color by group
      const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#ffeaa7', '#dda0dd'];
      const groupIndex = node.group.charCodeAt(0) % colors.length;
      return new THREE.Color(colors[groupIndex]);
    } else {
      return new THREE.Color(node.color || '#4ecdc4');
    }
  };

  return (
    <group position={[node.x, node.y, node.z]}>
      <mesh
        ref={meshRef}
        onClick={(e) => {
          e.stopPropagation();
          onClick(node);
        }}
        onPointerOver={(e) => {
          e.stopPropagation();
          setHovered(true);
        }}
        onPointerOut={() => setHovered(false)}
      >
        <sphereGeometry args={[node.size, 16, 16]} />
        <meshStandardMaterial 
          color={getColor()} 
          emissive={hovered ? '#ffffff' : '#000000'}
          emissiveIntensity={hovered ? 0.2 : 0}
        />
      </mesh>
      
      {showLabel && (
        <Text
          position={[0, node.size + 0.5, 0]}
          fontSize={0.3}
          color="#ffffff"
          anchorX="center"
          anchorY="middle"
        >
          {node.label}
        </Text>
      )}
      
      {/* Centrality indicator */}
      {node.centrality !== undefined && (
        <mesh position={[0, 0, node.size + 0.1]}>
          <ringGeometry args={[node.size + 0.1, node.size + 0.2, 8]} />
          <meshBasicMaterial 
            color="#ffffff" 
            transparent 
            opacity={0.6}
          />
        </mesh>
      )}
    </group>
  );
}

// 3D Edge Component
function Edge3DComponent({ 
  edge, 
  nodes, 
  colorScheme 
}: { 
  edge: Edge3D; 
  nodes: Node3D[]; 
  colorScheme: string;
}) {
  const sourceNode = nodes.find(n => n.id === edge.source);
  const targetNode = nodes.find(n => n.id === edge.target);
  
  if (!sourceNode || !targetNode) return null;

  const points = [
    new THREE.Vector3(sourceNode.x, sourceNode.y, sourceNode.z),
    new THREE.Vector3(targetNode.x, targetNode.y, targetNode.z)
  ];

  const geometry = new THREE.BufferGeometry().setFromPoints(points);

  // Determine edge color
  const getEdgeColor = () => {
    if (colorScheme === 'centrality') {
      const avgCentrality = ((sourceNode.centrality || 0) + (targetNode.centrality || 0)) / 2;
      const intensity = Math.max(0, Math.min(1, avgCentrality));
      return new THREE.Color().setHSL(intensity * 0.7, 0.8, 0.6);
    } else {
      return new THREE.Color(edge.color || '#666666');
    }
  };

  return (
    <line geometry={geometry}>
      <lineBasicMaterial 
        color={getEdgeColor()} 
        linewidth={edge.weight * 2}
        transparent
        opacity={0.6}
      />
    </line>
  );
}

// Main 3D Network Component
export function Network3D({
  nodes,
  edges,
  width = 800,
  height = 600,
  showLabels = true,
  animationSpeed = 1,
  colorScheme = 'default'
}: Network3DProps) {
  const [selectedNode, setSelectedNode] = useState<Node3D | null>(null);
  const [controlsEnabled, setControlsEnabled] = useState(true);

  // Handle node selection
  const handleNodeClick = (node: Node3D) => {
    setSelectedNode(selectedNode?.id === node.id ? null : node);
  };

  // Handle canvas click to deselect
  const handleCanvasClick = () => {
    setSelectedNode(null);
  };

  return (
    <div className="w-full h-full relative">
      <Canvas
        camera={{ position: [10, 10, 10], fov: 60 }}
        style={{ width, height }}
        onClick={handleCanvasClick}
      >
        {/* Lighting */}
        <ambientLight intensity={0.4} />
        <directionalLight position={[10, 10, 5]} intensity={0.8} />
        <pointLight position={[-10, -10, -5]} intensity={0.3} />

        {/* Controls */}
        <OrbitControls 
          enablePan={true}
          enableZoom={true}
          enableRotate={true}
          autoRotate={false}
          autoRotateSpeed={animationSpeed}
        />

        {/* Grid */}
        <gridHelper args={[20, 20, '#444444', '#444444']} />

        {/* Network Nodes */}
        {nodes.map((node) => (
          <Node3DComponent
            key={node.id}
            node={node}
            showLabel={showLabels}
            colorScheme={colorScheme}
            isSelected={selectedNode?.id === node.id}
            onClick={handleNodeClick}
          />
        ))}

        {/* Network Edges */}
        {edges.map((edge, index) => (
          <Edge3DComponent
            key={`${edge.source}-${edge.target}-${index}`}
            edge={edge}
            nodes={nodes}
            colorScheme={colorScheme}
          />
        ))}
      </Canvas>

      {/* Controls Panel */}
      <div className="absolute top-4 left-4 bg-black bg-opacity-50 text-white p-4 rounded-lg">
        <h3 className="text-lg font-semibold mb-2">3D Network Controls</h3>
        <div className="space-y-2">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={showLabels}
              onChange={(e) => setShowLabels(e.target.checked)}
              className="mr-2"
            />
            Show Labels
          </label>
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={controlsEnabled}
              onChange={(e) => setControlsEnabled(e.target.checked)}
              className="mr-2"
            />
            Enable Controls
          </label>
          <div>
            <label className="block text-sm">Color Scheme:</label>
            <select
              value={colorScheme}
              onChange={(e) => setColorScheme(e.target.value as any)}
              className="mt-1 bg-gray-700 text-white rounded px-2 py-1"
            >
              <option value="default">Default</option>
              <option value="centrality">Centrality</option>
              <option value="group">Group</option>
            </select>
          </div>
        </div>
      </div>

      {/* Node Information Panel */}
      {selectedNode && (
        <div className="absolute top-4 right-4 bg-black bg-opacity-50 text-white p-4 rounded-lg max-w-xs">
          <h3 className="text-lg font-semibold mb-2">Node Details</h3>
          <div className="space-y-1">
            <p><strong>ID:</strong> {selectedNode.id}</p>
            <p><strong>Label:</strong> {selectedNode.label}</p>
            <p><strong>Position:</strong> ({selectedNode.x.toFixed(2)}, {selectedNode.y.toFixed(2)}, {selectedNode.z.toFixed(2)})</p>
            <p><strong>Size:</strong> {selectedNode.size}</p>
            {selectedNode.centrality !== undefined && (
              <p><strong>Centrality:</strong> {selectedNode.centrality.toFixed(3)}</p>
            )}
            {selectedNode.group && (
              <p><strong>Group:</strong> {selectedNode.group}</p>
            )}
          </div>
        </div>
      )}

      {/* Instructions */}
      <div className="absolute bottom-4 left-4 bg-black bg-opacity-50 text-white p-3 rounded-lg text-sm">
        <p><strong>Controls:</strong></p>
        <p>• Left click + drag: Rotate</p>
        <p>• Right click + drag: Pan</p>
        <p>• Scroll: Zoom</p>
        <p>• Click node: Select</p>
      </div>
    </div>
  );
}

// Utility function to convert 2D network to 3D
export function convertTo3D(nodes: any[], edges: any[], centralityResults?: any[]): { nodes3D: Node3D[], edges3D: Edge3D[] } {
  const nodes3D: Node3D[] = nodes.map((node, index) => {
    // Generate 3D coordinates (sphere distribution)
    const radius = 5;
    const theta = (index / nodes.length) * 2 * Math.PI;
    const phi = Math.acos(1 - 2 * Math.random());
    
    const x = radius * Math.sin(phi) * Math.cos(theta);
    const y = radius * Math.sin(phi) * Math.sin(theta);
    const z = radius * Math.cos(phi);

    // Find centrality score if available
    const centralityScore = centralityResults?.find(r => r.nodeId === node.id)?.centrality_score || 0;

    return {
      id: node.id,
      label: node.label || node.id,
      x: node.x || x,
      y: node.y || y,
      z: node.z || z,
      size: Math.max(0.3, Math.min(1.0, 0.5 + centralityScore * 0.5)),
      color: node.color || '#4ecdc4',
      centrality: centralityScore,
      group: node.group
    };
  });

  const edges3D: Edge3D[] = edges.map(edge => ({
    source: edge.source,
    target: edge.target,
    weight: edge.weight || 1,
    color: edge.color || '#666666'
  }));

  return { nodes3D, edges3D };
}
