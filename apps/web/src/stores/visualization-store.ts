import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { LayoutAlgorithm } from '@networkoracle/types';

interface VisualizationConfig {
  layout: LayoutAlgorithm;
  nodeSize: {
    attribute: string | null;
    min: number;
    max: number;
    scaling: 'LINEAR' | 'LOGARITHMIC' | 'SQUARE_ROOT';
  };
  edgeWidth: {
    attribute: string | null;
    min: number;
    max: number;
    scaling: 'LINEAR' | 'LOGARITHMIC' | 'SQUARE_ROOT';
  };
  colors: {
    nodeColor: string;
    edgeColor: string;
    highlightColor: string;
    backgroundColor: string;
  };
  physics: {
    enabled: boolean;
    repulsion: number;
    attraction: number;
    damping: number;
  };
}

interface VisualizationState extends VisualizationConfig {
  // Selection state
  selectedNodes: string[];
  selectedEdges: string[];
  
  // View state
  viewport: {
    center: { x: number; y: number };
    zoom: number;
    rotation: number;
  };
  
  // Filters
  filters: {
    nodes: Record<string, any>;
    edges: Record<string, any>;
  };
  
  // Actions
  setLayout: (layout: LayoutAlgorithm) => void;
  setNodeSize: (nodeSize: Partial<VisualizationConfig['nodeSize']>) => void;
  setEdgeWidth: (edgeWidth: Partial<VisualizationConfig['edgeWidth']>) => void;
  setColors: (colors: Partial<VisualizationConfig['colors']>) => void;
  setPhysics: (physics: Partial<VisualizationConfig['physics']>) => void;
  
  // Selection actions
  selectNode: (nodeId: string) => void;
  selectNodes: (nodeIds: string[]) => void;
  toggleNodeSelection: (nodeId: string) => void;
  clearNodeSelection: () => void;
  
  selectEdge: (edgeId: string) => void;
  selectEdges: (edgeIds: string[]) => void;
  toggleEdgeSelection: (edgeId: string) => void;
  clearEdgeSelection: () => void;
  clearSelection: () => void;
  
  // View actions
  setViewport: (viewport: Partial<VisualizationState['viewport']>) => void;
  resetView: () => void;
  zoomIn: () => void;
  zoomOut: () => void;
  fitToView: () => void;
  
  // Filter actions
  setNodeFilter: (key: string, value: any) => void;
  setEdgeFilter: (key: string, value: any) => void;
  clearFilters: () => void;
  
  // Utility actions
  togglePhysics: () => void;
  resetConfig: () => void;
}

const defaultConfig: VisualizationConfig = {
  layout: 'FORCE_DIRECTED',
  nodeSize: {
    attribute: null,
    min: 5,
    max: 50,
    scaling: 'LINEAR'
  },
  edgeWidth: {
    attribute: null,
    min: 1,
    max: 10,
    scaling: 'LINEAR'
  },
  colors: {
    nodeColor: '#1f77b4',
    edgeColor: '#999999',
    highlightColor: '#ff7f0e',
    backgroundColor: '#ffffff'
  },
  physics: {
    enabled: true,
    repulsion: 1000,
    attraction: 0.1,
    damping: 0.8
  }
};

export const useVisualizationStore = create<VisualizationState>()(
  devtools(
    persist(
      (set, get) => ({
        ...defaultConfig,
        
        // Initial state
        selectedNodes: [],
        selectedEdges: [],
        viewport: {
          center: { x: 0, y: 0 },
          zoom: 1,
          rotation: 0
        },
        filters: {
          nodes: {},
          edges: {}
        },

        // Config setters
        setLayout: (layout) => set({ layout }),
        setNodeSize: (nodeSize) => set((state) => ({ 
          nodeSize: { ...state.nodeSize, ...nodeSize } 
        })),
        setEdgeWidth: (edgeWidth) => set((state) => ({ 
          edgeWidth: { ...state.edgeWidth, ...edgeWidth } 
        })),
        setColors: (colors) => set((state) => ({ 
          colors: { ...state.colors, ...colors } 
        })),
        setPhysics: (physics) => set((state) => ({ 
          physics: { ...state.physics, ...physics } 
        })),

        // Node selection
        selectNode: (nodeId) => set({ selectedNodes: [nodeId] }),
        selectNodes: (nodeIds) => set({ selectedNodes: nodeIds }),
        toggleNodeSelection: (nodeId) => set((state) => {
          const isSelected = state.selectedNodes.includes(nodeId);
          return {
            selectedNodes: isSelected
              ? state.selectedNodes.filter(id => id !== nodeId)
              : [...state.selectedNodes, nodeId]
          };
        }),
        clearNodeSelection: () => set({ selectedNodes: [] }),

        // Edge selection
        selectEdge: (edgeId) => set({ selectedEdges: [edgeId] }),
        selectEdges: (edgeIds) => set({ selectedEdges: edgeIds }),
        toggleEdgeSelection: (edgeId) => set((state) => {
          const isSelected = state.selectedEdges.includes(edgeId);
          return {
            selectedEdges: isSelected
              ? state.selectedEdges.filter(id => id !== edgeId)
              : [...state.selectedEdges, edgeId]
          };
        }),
        clearEdgeSelection: () => set({ selectedEdges: [] }),
        clearSelection: () => set({ selectedNodes: [], selectedEdges: [] }),

        // View actions
        setViewport: (viewport) => set((state) => ({
          viewport: { ...state.viewport, ...viewport }
        })),
        resetView: () => set({
          viewport: {
            center: { x: 0, y: 0 },
            zoom: 1,
            rotation: 0
          }
        }),
        zoomIn: () => set((state) => ({
          viewport: {
            ...state.viewport,
            zoom: Math.min(state.viewport.zoom * 1.2, 10)
          }
        })),
        zoomOut: () => set((state) => ({
          viewport: {
            ...state.viewport,
            zoom: Math.max(state.viewport.zoom / 1.2, 0.1)
          }
        })),
        fitToView: () => set({
          viewport: {
            center: { x: 0, y: 0 },
            zoom: 1,
            rotation: 0
          }
        }),

        // Filter actions
        setNodeFilter: (key, value) => set((state) => ({
          filters: {
            ...state.filters,
            nodes: { ...state.filters.nodes, [key]: value }
          }
        })),
        setEdgeFilter: (key, value) => set((state) => ({
          filters: {
            ...state.filters,
            edges: { ...state.filters.edges, [key]: value }
          }
        })),
        clearFilters: () => set({
          filters: { nodes: {}, edges: {} }
        }),

        // Utility actions
        togglePhysics: () => set((state) => ({
          physics: { ...state.physics, enabled: !state.physics.enabled }
        })),
        resetConfig: () => set(defaultConfig),
      }),
      {
        name: 'visualization-store',
        partialize: (state) => ({
          layout: state.layout,
          nodeSize: state.nodeSize,
          edgeWidth: state.edgeWidth,
          colors: state.colors,
          physics: state.physics,
        }),
      }
    ),
    {
      name: 'visualization-store',
    }
  )
);
