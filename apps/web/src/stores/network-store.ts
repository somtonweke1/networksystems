import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { Network, NetworkAnalysis, CentralityAnalysis } from '@networkoracle/types';

interface NetworkState {
  // Current network data
  network: Network | null;
  analysis: NetworkAnalysis | null;
  
  // Loading states
  isLoading: boolean;
  isAnalyzing: boolean;
  
  // Error states
  error: string | null;
  
  // Actions
  setNetwork: (network: Network | null) => void;
  setAnalysis: (analysis: NetworkAnalysis | null) => void;
  setLoading: (loading: boolean) => void;
  setAnalyzing: (analyzing: boolean) => void;
  setError: (error: string | null) => void;
  
  // Network operations
  updateNetwork: (updates: Partial<Network>) => void;
  addNode: (node: any) => void;
  removeNode: (nodeId: string) => void;
  addEdge: (edge: any) => void;
  removeEdge: (edgeId: string) => void;
  
  // Analysis operations
  computeCentrality: (centralityTypes: string[]) => Promise<void>;
  clearAnalysis: () => void;
  
  // Network metrics
  getNetworkMetrics: () => {
    nodes: number;
    edges: number;
    density: number;
    averageDegree: number;
    clustering: number;
    connected: boolean;
  } | null;
}

export const useNetworkStore = create<NetworkState>()(
  devtools(
    persist(
      (set, get) => ({
        // Initial state
        network: null,
        analysis: null,
        isLoading: false,
        isAnalyzing: false,
        error: null,

        // Basic setters
        setNetwork: (network) => set({ network, error: null }),
        setAnalysis: (analysis) => set({ analysis, error: null }),
        setLoading: (isLoading) => set({ isLoading }),
        setAnalyzing: (isAnalyzing) => set({ isAnalyzing }),
        setError: (error) => set({ error }),

        // Network operations
        updateNetwork: (updates) => {
          const { network } = get();
          if (network) {
            set({ network: { ...network, ...updates } });
          }
        },

        addNode: (node) => {
          const { network } = get();
          if (network) {
            set({
              network: {
                ...network,
                nodes: [...network.nodes, node]
              }
            });
          }
        },

        removeNode: (nodeId) => {
          const { network } = get();
          if (network) {
            set({
              network: {
                ...network,
                nodes: network.nodes.filter(n => n.id !== nodeId),
                edges: network.edges.filter(e => e.source !== nodeId && e.target !== nodeId)
              }
            });
          }
        },

        addEdge: (edge) => {
          const { network } = get();
          if (network) {
            set({
              network: {
                ...network,
                edges: [...network.edges, edge]
              }
            });
          }
        },

        removeEdge: (edgeId) => {
          const { network } = get();
          if (network) {
            set({
              network: {
                ...network,
                edges: network.edges.filter(e => e.id !== edgeId)
              }
            });
          }
        },

        // Analysis operations
        computeCentrality: async (centralityTypes) => {
          const { network, setAnalyzing, setError, setAnalysis } = get();
          
          if (!network) {
            setError('No network data available');
            return;
          }

          setAnalyzing(true);
          setError(null);

          try {
            const response = await fetch('/api/centrality', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                network,
                centrality_types: centralityTypes,
                parameters: {
                  normalize: true,
                  weight: null,
                  max_iter: 100,
                  tol: 1e-6
                }
              }),
            });

            if (!response.ok) {
              throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();
            
            if (result.success) {
              setAnalysis(result.data || result);
            } else {
              setError(result.error || 'Analysis failed');
            }
          } catch (error) {
            console.error('Centrality computation error:', error);
            setError(error instanceof Error ? error.message : 'Unknown error occurred');
          } finally {
            setAnalyzing(false);
          }
        },

        clearAnalysis: () => set({ analysis: null }),

        // Network metrics
        getNetworkMetrics: () => {
          const { network } = get();
          
          if (!network) return null;

          const nodes = network.nodes.length;
          const edges = network.edges.length;
          
          // Calculate density
          const maxEdges = network.type === 'DIRECTED' 
            ? nodes * (nodes - 1)
            : nodes * (nodes - 1) / 2;
          const density = maxEdges > 0 ? edges / maxEdges : 0;
          
          // Calculate average degree
          const averageDegree = nodes > 0 ? (edges * 2) / nodes : 0;
          
          // For now, return placeholder values for clustering and connectivity
          // These would be computed by the analysis service
          return {
            nodes,
            edges,
            density,
            averageDegree,
            clustering: 0, // Placeholder
            connected: false // Placeholder
          };
        },
      }),
      {
        name: 'network-store',
        partialize: (state) => ({
          network: state.network,
          analysis: state.analysis,
        }),
      }
    ),
    {
      name: 'network-store',
    }
  )
);
