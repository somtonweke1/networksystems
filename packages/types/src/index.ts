import { z } from 'zod';

// ============================================================================
// CORE NETWORK TYPES
// ============================================================================

export const NodeSchema = z.object({
  id: z.string(),
  label: z.string().optional(),
  properties: z.record(z.any()).optional(),
  position: z.object({
    x: z.number(),
    y: z.number(),
    z: z.number().optional()
  }).optional()
});

export const EdgeSchema = z.object({
  id: z.string(),
  source: z.string(),
  target: z.string(),
  weight: z.number().optional(),
  properties: z.record(z.any()).optional()
});

export const NetworkSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().optional(),
  type: z.enum(['DIRECTED', 'UNDIRECTED', 'MULTIGRAPH', 'WEIGHTED']),
  nodes: z.array(NodeSchema),
  edges: z.array(EdgeSchema),
  metadata: z.object({
    createdAt: z.date(),
    updatedAt: z.date(),
    version: z.string().optional(),
    tags: z.array(z.string()).optional()
  }).optional()
});

// ============================================================================
// CENTRALITY TYPES
// ============================================================================

export type CentralityType = 
  | 'DEGREE'
  | 'BETWEENNESS'
  | 'CLOSENESS'
  | 'EIGENVECTOR'
  | 'KATZ'
  | 'PAGERANK'
  | 'BONACICH_POWER'
  | 'HITS_HUBS'
  | 'HITS_AUTHORITIES'
  | 'LEVERAGE'
  | 'LOAD'
  | 'HARMONIC'
  | 'SUBGRAPH'
  | 'KATZ_STATUS'
  | 'ALPHA'
  | 'COMMUNICABILITY_BETWEENNESS';

export const CentralityResultSchema = z.object({
  nodeId: z.string(),
  value: z.number(),
  rank: z.number().optional(),
  normalized: z.boolean().default(false)
});

export const CentralityAnalysisSchema = z.object({
  type: z.enum(['DEGREE', 'BETWEENNESS', 'CLOSENESS', 'EIGENVECTOR', 'KATZ', 'PAGERANK', 'BONACICH_POWER', 'HITS_HUBS', 'HITS_AUTHORITIES', 'LEVERAGE', 'LOAD', 'HARMONIC', 'SUBGRAPH', 'ALPHA', 'COMMUNICABILITY_BETWEENNESS']),
  results: z.array(CentralityResultSchema),
  metadata: z.object({
    algorithm: z.string(),
    parameters: z.record(z.any()).optional(),
    executionTime: z.number(),
    timestamp: z.date()
  })
});

// ============================================================================
// NETWORK ANALYSIS TYPES
// ============================================================================

export const DegreeAnalysisSchema = z.object({
  degreeDistribution: z.record(z.number()),
  averageDegree: z.number(),
  maxDegree: z.number(),
  minDegree: z.number(),
  degreeVariance: z.number()
});

export const PathAnalysisSchema = z.object({
  averagePathLength: z.number(),
  diameter: z.number(),
  radius: z.number(),
  eccentricity: z.record(z.number()),
  shortestPaths: z.record(z.record(z.number())).optional()
});

export const ConnectivityAnalysisSchema = z.object({
  isConnected: z.boolean(),
  numberOfComponents: z.number(),
  largestComponentSize: z.number(),
  connectivityRatio: z.number(),
  articulationPoints: z.array(z.string()).optional(),
  bridges: z.array(z.object({
    source: z.string(),
    target: z.string()
  })).optional()
});

export const ClusteringAnalysisSchema = z.object({
  averageClustering: z.number(),
  globalClustering: z.number(),
  localClustering: z.record(z.number()),
  transitivity: z.number()
});

export const CommunityStructureSchema = z.object({
  algorithm: z.string(),
  communities: z.array(z.object({
    id: z.string(),
    nodes: z.array(z.string()),
    modularity: z.number().optional(),
    size: z.number()
  })),
  modularity: z.number(),
  coverage: z.number()
});

export const NetworkAnalysisSchema = z.object({
  id: z.string(),
  networkId: z.string(),
  degreeAnalysis: DegreeAnalysisSchema,
  pathAnalysis: PathAnalysisSchema,
  connectivityAnalysis: ConnectivityAnalysisSchema,
  clusteringAnalysis: ClusteringAnalysisSchema,
  centralities: z.array(CentralityAnalysisSchema),
  communityStructure: CommunityStructureSchema.optional(),
  metadata: z.object({
    executionTime: z.number(),
    timestamp: z.date(),
    algorithmVersions: z.record(z.string()).optional()
  })
});

// ============================================================================
// VISUALIZATION TYPES
// ============================================================================

export type LayoutAlgorithm = 
  | 'FORCE_DIRECTED'
  | 'HIERARCHICAL'
  | 'CIRCULAR'
  | 'GRID'
  | 'GEOSPATIAL'
  | 'MULTI_LAYER'
  | 'TEMPORAL';

export const VisualizationConfigSchema = z.object({
  layout: z.enum(['FORCE_DIRECTED', 'HIERARCHICAL', 'CIRCULAR', 'GRID', 'GEOSPATIAL', 'MULTI_LAYER', 'TEMPORAL']),
  nodeSize: z.object({
    attribute: z.string().optional(),
    min: z.number().default(5),
    max: z.number().default(50),
    scaling: z.enum(['LINEAR', 'LOGARITHMIC', 'SQUARE_ROOT']).default('LINEAR')
  }),
  edgeWidth: z.object({
    attribute: z.string().optional(),
    min: z.number().default(1),
    max: z.number().default(10),
    scaling: z.enum(['LINEAR', 'LOGARITHMIC', 'SQUARE_ROOT']).default('LINEAR')
  }),
  colors: z.object({
    nodeColor: z.string().default('#1f77b4'),
    edgeColor: z.string().default('#999999'),
    highlightColor: z.string().default('#ff7f0e'),
    backgroundColor: z.string().default('#ffffff')
  }),
  physics: z.object({
    enabled: z.boolean().default(true),
    repulsion: z.number().default(1000),
    attraction: z.number().default(0.1),
    damping: z.number().default(0.8)
  }).optional()
});

export const VisualizationStateSchema = z.object({
  id: z.string(),
  networkId: z.string(),
  config: VisualizationConfigSchema,
  viewport: z.object({
    center: z.object({ x: z.number(), y: z.number() }),
    zoom: z.number(),
    rotation: z.number().optional()
  }),
  selectedNodes: z.array(z.string()),
  selectedEdges: z.array(z.string()),
  filters: z.object({
    nodes: z.record(z.any()).optional(),
    edges: z.record(z.any()).optional()
  }).optional()
});

// ============================================================================
// API TYPES
// ============================================================================

export const ApiResponseSchema = z.object({
  success: z.boolean(),
  data: z.any().optional(),
  error: z.object({
    code: z.string(),
    message: z.string(),
    details: z.any().optional()
  }).optional(),
  metadata: z.object({
    timestamp: z.date(),
    requestId: z.string(),
    executionTime: z.number().optional()
  })
});

export const PaginationSchema = z.object({
  page: z.number().min(1),
  limit: z.number().min(1).max(1000),
  total: z.number(),
  totalPages: z.number()
});

export const ApiRequestSchema = z.object({
  pagination: PaginationSchema.optional(),
  filters: z.record(z.any()).optional(),
  sort: z.object({
    field: z.string(),
    direction: z.enum(['ASC', 'DESC'])
  }).optional()
});

// ============================================================================
// USER & AUTHENTICATION TYPES
// ============================================================================

export const UserSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  name: z.string(),
  role: z.enum(['ADMIN', 'ANALYST', 'VIEWER', 'GUEST']),
  organization: z.string().optional(),
  permissions: z.array(z.string()),
  preferences: z.record(z.any()).optional(),
  createdAt: z.date(),
  updatedAt: z.date()
});

export const AuthTokenSchema = z.object({
  accessToken: z.string(),
  refreshToken: z.string(),
  expiresIn: z.number(),
  tokenType: z.string().default('Bearer')
});

// ============================================================================
// DATA INTEGRATION TYPES
// ============================================================================

export type DataSourceType = 
  | 'CSV'
  | 'JSON'
  | 'XML'
  | 'DATABASE'
  | 'API'
  | 'SOCIAL_MEDIA'
  | 'CRM'
  | 'ERP'
  | 'CUSTOM';

export const DataSourceSchema = z.object({
  id: z.string(),
  name: z.string(),
  type: z.enum(['CSV', 'JSON', 'XML', 'DATABASE', 'API', 'SOCIAL_MEDIA', 'CRM', 'ERP', 'CUSTOM']),
  config: z.record(z.any()),
  mapping: z.object({
    nodeId: z.string(),
    nodeLabel: z.string().optional(),
    edgeSource: z.string().optional(),
    edgeTarget: z.string().optional(),
    edgeWeight: z.string().optional(),
    properties: z.record(z.string()).optional()
  }),
  status: z.enum(['ACTIVE', 'INACTIVE', 'ERROR', 'PROCESSING']),
  lastSync: z.date().optional(),
  createdAt: z.date(),
  updatedAt: z.date()
});

// ============================================================================
// EXPORT TYPES
// ============================================================================

export type Node = z.infer<typeof NodeSchema>;
export type Edge = z.infer<typeof EdgeSchema>;
export type Network = z.infer<typeof NetworkSchema>;
export type CentralityResult = z.infer<typeof CentralityResultSchema>;
export type CentralityAnalysis = z.infer<typeof CentralityAnalysisSchema>;
export type NetworkAnalysis = z.infer<typeof NetworkAnalysisSchema>;
export type VisualizationConfig = z.infer<typeof VisualizationConfigSchema>;
export type VisualizationState = z.infer<typeof VisualizationStateSchema>;
export type ApiResponse<T = any> = z.infer<typeof ApiResponseSchema> & { data?: T };
export type User = z.infer<typeof UserSchema>;
export type AuthToken = z.infer<typeof AuthTokenSchema>;
export type DataSource = z.infer<typeof DataSourceSchema>;

// ============================================================================
// UTILITY TYPES
// ============================================================================

export interface AlgorithmParameters {
  [key: string]: any;
}

export interface AlgorithmResult {
  [nodeId: string]: number;
}

export interface NetworkMetrics {
  nodes: number;
  edges: number;
  density: number;
  averageDegree: number;
  clustering: number;
  connected: boolean;
}

export interface PerformanceMetrics {
  executionTime: number;
  memoryUsage: number;
  algorithmComplexity: string;
  scalability: 'O(n)' | 'O(n²)' | 'O(n³)' | 'O(m)' | 'O(nm)' | string;
}

// ============================================================================
// CONSTANTS
// ============================================================================

export const CENTRALITY_TYPES = {
  DEGREE: 'DEGREE' as const,
  BETWEENNESS: 'BETWEENNESS' as const,
  CLOSENESS: 'CLOSENESS' as const,
  EIGENVECTOR: 'EIGENVECTOR' as const,
  KATZ: 'KATZ' as const,
  PAGERANK: 'PAGERANK' as const,
  BONACICH_POWER: 'BONACICH_POWER' as const,
  HITS_HUBS: 'HITS_HUBS' as const,
  HITS_AUTHORITIES: 'HITS_AUTHORITIES' as const,
  LEVERAGE: 'LEVERAGE' as const,
  LOAD: 'LOAD' as const,
  HARMONIC: 'HARMONIC' as const,
  SUBGRAPH: 'SUBGRAPH' as const,
  KATZ_STATUS: 'KATZ_STATUS' as const,
  ALPHA: 'ALPHA' as const,
  COMMUNICABILITY_BETWEENNESS: 'COMMUNICABILITY_BETWEENNESS' as const
};

export const LAYOUT_ALGORITHMS = {
  FORCE_DIRECTED: 'FORCE_DIRECTED' as const,
  HIERARCHICAL: 'HIERARCHICAL' as const,
  CIRCULAR: 'CIRCULAR' as const,
  GRID: 'GRID' as const,
  GEOSPATIAL: 'GEOSPATIAL' as const,
  MULTI_LAYER: 'MULTI_LAYER' as const,
  TEMPORAL: 'TEMPORAL' as const
};

export const DATA_SOURCE_TYPES = {
  CSV: 'CSV' as const,
  JSON: 'JSON' as const,
  XML: 'XML' as const,
  DATABASE: 'DATABASE' as const,
  API: 'API' as const,
  SOCIAL_MEDIA: 'SOCIAL_MEDIA' as const,
  CRM: 'CRM' as const,
  ERP: 'ERP' as const,
  CUSTOM: 'CUSTOM' as const
};
