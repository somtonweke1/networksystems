/**
 * NetworkOracle Pro - Advanced Network Analysis API for Vercel (Node.js)
 * Implements comprehensive network analysis algorithms
 */

export default function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method === 'GET') {
    // Return available analysis algorithms
    const analyses = [
      {
        id: 'community_detection',
        name: 'Community Detection',
        description: 'Identify densely connected groups of nodes',
        algorithms: [
          { id: 'louvain', name: 'Louvain Algorithm', complexity: 'O(n log n)' },
          { id: 'girvan_newman', name: 'Girvan-Newman Algorithm', complexity: 'O(m²n)' },
          { id: 'label_propagation', name: 'Label Propagation', complexity: 'O(m)' }
        ]
      },
      {
        id: 'path_analysis',
        name: 'Path Analysis',
        description: 'Analyze shortest paths and connectivity',
        algorithms: [
          { id: 'shortest_paths', name: 'All Pairs Shortest Paths', complexity: 'O(n³)' },
          { id: 'diameter', name: 'Network Diameter', complexity: 'O(n³)' },
          { id: 'eccentricity', name: 'Node Eccentricity', complexity: 'O(n²)' }
        ]
      },
      {
        id: 'clustering',
        name: 'Clustering Analysis',
        description: 'Measure local clustering properties',
        algorithms: [
          { id: 'clustering_coefficient', name: 'Clustering Coefficient', complexity: 'O(n²)' },
          { id: 'transitivity', name: 'Transitivity', complexity: 'O(n³)' },
          { id: 'triangles', name: 'Triangle Count', complexity: 'O(n³)' }
        ]
      },
      {
        id: 'structural_properties',
        name: 'Structural Properties',
        description: 'Analyze overall network structure',
        algorithms: [
          { id: 'density', name: 'Network Density', complexity: 'O(1)' },
          { id: 'assortativity', name: 'Assortativity', complexity: 'O(m)' },
          { id: 'modularity', name: 'Modularity', complexity: 'O(m)' }
        ]
      }
    ];

    res.status(200).json({
      success: true,
      analyses,
      total: analyses.length,
      timestamp: new Date().toISOString()
    });
    return;
  }

  if (req.method === 'POST') {
    try {
      const startTime = Date.now();
      const { network, analysis, algorithm, options = {} } = req.body;

      // Validate input
      if (!network || !network.nodes || !Array.isArray(network.nodes)) {
        return res.status(400).json({
          success: false,
          error: 'Network must have a nodes array',
          timestamp: new Date().toISOString()
        });
      }

      if (!network.edges || !Array.isArray(network.edges)) {
        return res.status(400).json({
          success: false,
          error: 'Network must have an edges array',
          timestamp: new Date().toISOString()
        });
      }

      if (!analysis) {
        return res.status(400).json({
          success: false,
          error: 'Analysis type must be specified',
          timestamp: new Date().toISOString()
        });
      }

      // Build adjacency list
      const adjacencyList = {};
      network.nodes.forEach(node => {
        adjacencyList[node.id] = [];
      });

      network.edges.forEach(edge => {
        if (adjacencyList[edge.source] && adjacencyList[edge.target]) {
          adjacencyList[edge.source].push(edge.target);
          if (!network.directed) {
            adjacencyList[edge.target].push(edge.source);
          }
        }
      });

      // Perform analysis based on type
      let results;
      switch (analysis.toLowerCase()) {
        case 'community_detection':
          results = performCommunityDetection(network.nodes, adjacencyList, algorithm, options);
          break;
        case 'path_analysis':
          results = performPathAnalysis(network.nodes, adjacencyList, algorithm, options);
          break;
        case 'clustering':
          results = performClusteringAnalysis(network.nodes, adjacencyList, algorithm, options);
          break;
        case 'structural_properties':
          results = performStructuralAnalysis(network.nodes, adjacencyList, algorithm, options);
          break;
        default:
          return res.status(400).json({
            success: false,
            error: `Unknown analysis type: ${analysis}`,
            timestamp: new Date().toISOString()
          });
      }

      const computationTime = Date.now() - startTime;

      res.status(200).json({
        success: true,
        analysis,
        algorithm: algorithm || 'default',
        results,
        metadata: {
          nodeCount: network.nodes.length,
          edgeCount: network.edges.length,
          computationTime,
          analysis: analysis,
          algorithm: algorithm,
          parameters: options,
          statistics: results.statistics || {}
        },
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      console.error('Analysis computation error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error',
        details: error.message,
        timestamp: new Date().toISOString()
      });
    }
    return;
  }

  res.status(405).json({
    success: false,
    error: 'Method not allowed',
    timestamp: new Date().toISOString()
  });
}

// Community Detection Algorithms

function performCommunityDetection(nodes, adjacencyList, algorithm, options) {
  switch (algorithm?.toLowerCase() || 'louvain') {
    case 'louvain':
      return louvainCommunityDetection(nodes, adjacencyList, options);
    case 'girvan_newman':
      return girvanNewmanCommunityDetection(nodes, adjacencyList, options);
    case 'label_propagation':
      return labelPropagationCommunityDetection(nodes, adjacencyList, options);
    default:
      return louvainCommunityDetection(nodes, adjacencyList, options);
  }
}

function louvainCommunityDetection(nodes, adjacencyList, options) {
  const maxIterations = options.maxIterations || 10;
  
  // Initialize: each node is its own community
  let communities = {};
  nodes.forEach(node => {
    communities[node.id] = node.id;
  });

  let improved = true;
  let iteration = 0;

  while (improved && iteration < maxIterations) {
    improved = false;
    iteration++;

    // Try moving each node to neighboring communities
    nodes.forEach(node => {
      const currentCommunity = communities[node.id];
      let bestCommunity = currentCommunity;
      let bestModularityGain = 0;

      // Get neighboring communities
      const neighborCommunities = new Set();
      adjacencyList[node.id].forEach(neighbor => {
        neighborCommunities.add(communities[neighbor]);
      });

      // Calculate modularity gain for each possible move
      neighborCommunities.forEach(community => {
        if (community !== currentCommunity) {
          const modularityGain = calculateModularityGain(node.id, currentCommunity, community, communities, adjacencyList);
          if (modularityGain > bestModularityGain) {
            bestModularityGain = modularityGain;
            bestCommunity = community;
          }
        }
      });

      if (bestCommunity !== currentCommunity) {
        communities[node.id] = bestCommunity;
        improved = true;
      }
    });
  }

  // Convert to community groups
  const communityGroups = {};
  Object.entries(communities).forEach(([nodeId, communityId]) => {
    if (!communityGroups[communityId]) {
      communityGroups[communityId] = [];
    }
    communityGroups[communityId].push(nodeId);
  });

  const results = nodes.map(node => ({
    nodeId: node.id,
    community: communities[node.id],
    communitySize: communityGroups[communities[node.id]].length
  }));

  const modularity = calculateModularity(communities, adjacencyList);

  return {
    communities: results,
    communityGroups: Object.values(communityGroups),
    statistics: {
      numCommunities: Object.keys(communityGroups).length,
      modularity,
      iterations: iteration,
      avgCommunitySize: nodes.length / Object.keys(communityGroups).length
    }
  };
}

function girvanNewmanCommunityDetection(nodes, adjacencyList, options) {
  const maxCommunities = options.maxCommunities || 5;
  
  // Calculate edge betweenness
  const edgeBetweenness = calculateEdgeBetweenness(nodes, adjacencyList);
  
  const communities = [];
  let currentAdjacency = JSON.parse(JSON.stringify(adjacencyList));
  
  while (Object.keys(currentAdjacency).length > 1) {
    // Find edge with highest betweenness
    let maxBetweenness = 0;
    let edgeToRemove = null;
    
    Object.entries(edgeBetweenness).forEach(([edge, betweenness]) => {
      if (betweenness > maxBetweenness) {
        maxBetweenness = betweenness;
        edgeToRemove = edge;
      }
    });

    if (!edgeToRemove) break;

    // Remove edge
    const [source, target] = edgeToRemove.split('-');
    currentAdjacency[source] = currentAdjacency[source].filter(n => n !== target);
    currentAdjacency[target] = currentAdjacency[target].filter(n => n !== source);

    // Find connected components
    const components = findConnectedComponents(nodes, currentAdjacency);
    
    if (components.length > 1) {
      communities.push(components);
    }

    if (communities.length >= maxCommunities) break;

    // Recalculate edge betweenness
    Object.keys(edgeBetweenness).forEach(edge => {
      edgeBetweenness[edge] = 0;
    });
    
    nodes.forEach(source => {
      nodes.forEach(target => {
        if (source.id !== target.id) {
          const paths = findAllPaths(source.id, target.id, currentAdjacency);
          const shortestPaths = paths.filter(path => path.length === Math.min(...paths.map(p => p.length)));
          
          shortestPaths.forEach(path => {
            for (let i = 0; i < path.length - 1; i++) {
              const edge = `${path[i]}-${path[i + 1]}`;
              if (edgeBetweenness[edge] !== undefined) {
                edgeBetweenness[edge] += 1 / shortestPaths.length;
              }
            }
          });
        }
      });
    });
  }

  // Assign final communities
  const finalCommunities = {};
  communities[communities.length - 1]?.forEach((component, index) => {
    component.forEach(nodeId => {
      finalCommunities[nodeId] = index;
    });
  });

  const results = nodes.map(node => ({
    nodeId: node.id,
    community: finalCommunities[node.id] || 0,
    communitySize: communities[communities.length - 1]?.[finalCommunities[node.id]]?.length || 1
  }));

  return {
    communities: results,
    communityGroups: communities[communities.length - 1] || [],
    statistics: {
      numCommunities: Object.keys(finalCommunities).length,
      modularity: calculateModularity(finalCommunities, adjacencyList),
      iterations: communities.length
    }
  };
}

function labelPropagationCommunityDetection(nodes, adjacencyList, options) {
  const maxIterations = options.maxIterations || 50;
  
  // Initialize labels
  let labels = {};
  nodes.forEach((node, index) => {
    labels[node.id] = index;
  });

  let stable = false;
  let iteration = 0;

  while (!stable && iteration < maxIterations) {
    stable = true;
    iteration++;

    // Randomize node order
    const shuffledNodes = [...nodes].sort(() => Math.random() - 0.5);

    shuffledNodes.forEach(node => {
      const neighborLabels = adjacencyList[node.id].map(neighbor => labels[neighbor]);
      
      if (neighborLabels.length > 0) {
        // Find most frequent label
        const labelCounts = {};
        neighborLabels.forEach(label => {
          labelCounts[label] = (labelCounts[label] || 0) + 1;
        });

        const mostFrequentLabel = Object.keys(labelCounts).reduce((a, b) => 
          labelCounts[a] > labelCounts[b] ? a : b
        );

        if (labels[node.id] !== mostFrequentLabel) {
          labels[node.id] = mostFrequentLabel;
          stable = false;
        }
      }
    });
  }

  const results = nodes.map(node => ({
    nodeId: node.id,
    community: labels[node.id],
    communitySize: Object.values(labels).filter(label => label === labels[node.id]).length
  }));

  return {
    communities: results,
    communityGroups: Object.values(labels),
    statistics: {
      numCommunities: new Set(Object.values(labels)).size,
      modularity: calculateModularity(labels, adjacencyList),
      iterations: iteration
    }
  };
}

// Path Analysis Algorithms

function performPathAnalysis(nodes, adjacencyList, algorithm, options) {
  switch (algorithm?.toLowerCase() || 'shortest_paths') {
    case 'shortest_paths':
      return calculateShortestPaths(nodes, adjacencyList, options);
    case 'diameter':
      return calculateNetworkDiameter(nodes, adjacencyList, options);
    case 'eccentricity':
      return calculateNodeEccentricity(nodes, adjacencyList, options);
    default:
      return calculateShortestPaths(nodes, adjacencyList, options);
  }
}

function calculateShortestPaths(nodes, adjacencyList, options) {
  const distances = {};
  const paths = {};

  nodes.forEach(source => {
    distances[source.id] = {};
    paths[source.id] = {};
    
    nodes.forEach(target => {
      if (source.id === target.id) {
        distances[source.id][target.id] = 0;
        paths[source.id][target.id] = [source.id];
      } else {
        distances[source.id][target.id] = Infinity;
        paths[source.id][target.id] = [];
      }
    });
  });

  // Floyd-Warshall algorithm
  nodes.forEach(k => {
    nodes.forEach(i => {
      nodes.forEach(j => {
        if (distances[i.id][k.id] + distances[k.id][j.id] < distances[i.id][j.id]) {
          distances[i.id][j.id] = distances[i.id][k.id] + distances[k.id][j.id];
          // Reconstruct path
          paths[i.id][j.id] = [...paths[i.id][k.id], ...paths[k.id][j.id].slice(1)];
        }
      });
    });
  });

  const results = nodes.map(node => ({
    nodeId: node.id,
    shortestPaths: distances[node.id],
    avgDistance: Object.values(distances[node.id])
      .filter(d => d !== Infinity)
      .reduce((sum, d) => sum + d, 0) / (nodes.length - 1)
  }));

  return {
    shortestPaths: results,
    statistics: {
      avgPathLength: results.reduce((sum, r) => sum + r.avgDistance, 0) / results.length,
      maxDistance: Math.max(...results.map(r => Math.max(...Object.values(r.shortestPaths).filter(d => d !== Infinity)))),
      connectedPairs: results.reduce((sum, r) => sum + Object.values(r.shortestPaths).filter(d => d !== Infinity).length, 0) / 2
    }
  };
}

function calculateNetworkDiameter(nodes, adjacencyList, options) {
  const distances = {};
  
  nodes.forEach(source => {
    distances[source.id] = {};
    
    const queue = [{ node: source.id, distance: 0 }];
    const visited = new Set([source.id]);
    
    while (queue.length > 0) {
      const { node, distance } = queue.shift();
      distances[source.id][node] = distance;
      
      adjacencyList[node].forEach(neighbor => {
        if (!visited.has(neighbor)) {
          visited.add(neighbor);
          queue.push({ node: neighbor, distance: distance + 1 });
        }
      });
    }
  });

  let diameter = 0;
  let eccentricities = {};

  nodes.forEach(node => {
    const maxDistance = Math.max(...Object.values(distances[node.id]).filter(d => d !== Infinity));
    eccentricities[node.id] = maxDistance;
    diameter = Math.max(diameter, maxDistance);
  });

  return {
    diameter,
    eccentricities,
    statistics: {
      diameter,
      avgEccentricity: Object.values(eccentricities).reduce((sum, e) => sum + e, 0) / nodes.length,
      radius: Math.min(...Object.values(eccentricities))
    }
  };
}

function calculateNodeEccentricity(nodes, adjacencyList, options) {
  const results = nodes.map(node => {
    const distances = computeDistances(node.id, adjacencyList);
    const eccentricity = Math.max(...Object.values(distances).filter(d => d !== Infinity));
    
    return {
      nodeId: node.id,
      eccentricity,
      distances
    };
  });

  return {
    eccentricities: results,
    statistics: {
      maxEccentricity: Math.max(...results.map(r => r.eccentricity)),
      minEccentricity: Math.min(...results.map(r => r.eccentricity)),
      avgEccentricity: results.reduce((sum, r) => sum + r.eccentricity, 0) / results.length
    }
  };
}

// Clustering Analysis Algorithms

function performClusteringAnalysis(nodes, adjacencyList, algorithm, options) {
  switch (algorithm?.toLowerCase() || 'clustering_coefficient') {
    case 'clustering_coefficient':
      return calculateClusteringCoefficient(nodes, adjacencyList, options);
    case 'transitivity':
      return calculateTransitivity(nodes, adjacencyList, options);
    case 'triangles':
      return calculateTriangles(nodes, adjacencyList, options);
    default:
      return calculateClusteringCoefficient(nodes, adjacencyList, options);
  }
}

function calculateClusteringCoefficient(nodes, adjacencyList, options) {
  const results = nodes.map(node => {
    const neighbors = adjacencyList[node.id];
    const degree = neighbors.length;
    
    if (degree < 2) {
      return {
        nodeId: node.id,
        clusteringCoefficient: 0,
        degree,
        triangles: 0,
        possibleTriangles: 0
      };
    }

    // Count triangles
    let triangles = 0;
    for (let i = 0; i < neighbors.length; i++) {
      for (let j = i + 1; j < neighbors.length; j++) {
        if (adjacencyList[neighbors[i]].includes(neighbors[j])) {
          triangles++;
        }
      }
    }

    const possibleTriangles = degree * (degree - 1) / 2;
    const clusteringCoefficient = possibleTriangles > 0 ? triangles / possibleTriangles : 0;

    return {
      nodeId: node.id,
      clusteringCoefficient,
      degree,
      triangles,
      possibleTriangles
    };
  });

  const avgClustering = results.reduce((sum, r) => sum + r.clusteringCoefficient, 0) / results.length;

  return {
    clusteringCoefficients: results,
    statistics: {
      avgClusteringCoefficient: avgClustering,
      maxClusteringCoefficient: Math.max(...results.map(r => r.clusteringCoefficient)),
      totalTriangles: results.reduce((sum, r) => sum + r.triangles, 0) / 3 // Each triangle counted 3 times
    }
  };
}

function calculateTransitivity(nodes, adjacencyList, options) {
  let triangles = 0;
  let triplets = 0;

  nodes.forEach(node => {
    const neighbors = adjacencyList[node.id];
    
    for (let i = 0; i < neighbors.length; i++) {
      for (let j = i + 1; j < neighbors.length; j++) {
        triplets++;
        if (adjacencyList[neighbors[i]].includes(neighbors[j])) {
          triangles++;
        }
      }
    }
  });

  const transitivity = triplets > 0 ? triangles / triplets : 0;

  return {
    transitivity,
    statistics: {
      triangles,
      triplets,
      transitivity
    }
  };
}

function calculateTriangles(nodes, adjacencyList, options) {
  let totalTriangles = 0;
  const nodeTriangles = {};

  nodes.forEach(node => {
    nodeTriangles[node.id] = 0;
    const neighbors = adjacencyList[node.id];
    
    for (let i = 0; i < neighbors.length; i++) {
      for (let j = i + 1; j < neighbors.length; j++) {
        if (adjacencyList[neighbors[i]].includes(neighbors[j])) {
          nodeTriangles[node.id]++;
          totalTriangles++;
        }
      }
    }
  });

  return {
    triangles: Object.entries(nodeTriangles).map(([nodeId, count]) => ({
      nodeId,
      triangleCount: count
    })),
    statistics: {
      totalTriangles: totalTriangles / 3, // Each triangle counted 3 times
      avgTrianglesPerNode: totalTriangles / (3 * nodes.length),
      maxTrianglesPerNode: Math.max(...Object.values(nodeTriangles))
    }
  };
}

// Structural Properties Analysis

function performStructuralAnalysis(nodes, adjacencyList, algorithm, options) {
  switch (algorithm?.toLowerCase() || 'density') {
    case 'density':
      return calculateNetworkDensity(nodes, adjacencyList, options);
    case 'assortativity':
      return calculateAssortativity(nodes, adjacencyList, options);
    case 'modularity':
      return calculateModularityAnalysis(nodes, adjacencyList, options);
    default:
      return calculateNetworkDensity(nodes, adjacencyList, options);
  }
}

function calculateNetworkDensity(nodes, adjacencyList, options) {
  const totalEdges = Object.values(adjacencyList).reduce((sum, neighbors) => sum + neighbors.length, 0) / 2;
  const maxPossibleEdges = nodes.length * (nodes.length - 1) / 2;
  const density = maxPossibleEdges > 0 ? totalEdges / maxPossibleEdges : 0;

  return {
    density,
    statistics: {
      totalEdges,
      maxPossibleEdges,
      density,
      sparsity: 1 - density
    }
  };
}

function calculateAssortativity(nodes, adjacencyList, options) {
  const degrees = {};
  nodes.forEach(node => {
    degrees[node.id] = adjacencyList[node.id].length;
  });

  let sum1 = 0, sum2 = 0, sum3 = 0;
  let totalEdges = 0;

  Object.entries(adjacencyList).forEach(([nodeId, neighbors]) => {
    neighbors.forEach(neighborId => {
      sum1 += degrees[nodeId] * degrees[neighborId];
      sum2 += degrees[nodeId] + degrees[neighborId];
      sum3 += degrees[nodeId] * degrees[nodeId] + degrees[neighborId] * degrees[neighborId];
      totalEdges++;
    });
  });

  totalEdges /= 2; // Undirected edges

  const assortativity = (4 * totalEdges * sum1 - sum2 * sum2) / (2 * totalEdges * sum3 - sum2 * sum2);

  return {
    assortativity,
    statistics: {
      assortativity,
      totalEdges,
      avgDegree: sum2 / (2 * totalEdges)
    }
  };
}

function calculateModularityAnalysis(nodes, adjacencyList, options) {
  // Simple modularity calculation for random communities
  const communities = {};
  nodes.forEach((node, index) => {
    communities[node.id] = Math.floor(index / 5); // Simple grouping
  });

  const modularity = calculateModularity(communities, adjacencyList);

  return {
    modularity,
    statistics: {
      modularity,
      numCommunities: new Set(Object.values(communities)).size
    }
  };
}

// Helper functions

function calculateModularity(communities, adjacencyList) {
  const nodes = Object.keys(communities);
  const edges = Object.values(adjacencyList).reduce((sum, neighbors) => sum + neighbors.length, 0) / 2;
  
  let modularity = 0;
  
  nodes.forEach(node => {
    const nodeCommunity = communities[node];
    adjacencyList[node].forEach(neighbor => {
      const neighborCommunity = communities[neighbor];
      const delta = nodeCommunity === neighborCommunity ? 1 : 0;
      const degree1 = adjacencyList[node].length;
      const degree2 = adjacencyList[neighbor].length;
      
      modularity += delta - (degree1 * degree2) / (2 * edges);
    });
  });
  
  return modularity / (2 * edges);
}

function calculateModularityGain(nodeId, oldCommunity, newCommunity, communities, adjacencyList) {
  // Simplified modularity gain calculation
  const neighbors = adjacencyList[nodeId];
  let gain = 0;
  
  neighbors.forEach(neighbor => {
    if (communities[neighbor] === newCommunity) {
      gain += 1;
    } else if (communities[neighbor] === oldCommunity) {
      gain -= 1;
    }
  });
  
  return gain / neighbors.length;
}

function calculateEdgeBetweenness(nodes, adjacencyList) {
  const edgeBetweenness = {};
  
  // Initialize edge betweenness
  nodes.forEach(node => {
    adjacencyList[node.id].forEach(neighbor => {
      const edge = `${Math.min(node.id, neighbor)}-${Math.max(node.id, neighbor)}`;
      edgeBetweenness[edge] = 0;
    });
  });

  nodes.forEach(source => {
    nodes.forEach(target => {
      if (source.id !== target.id) {
        const paths = findAllPaths(source.id, target.id, adjacencyList);
        const shortestPaths = paths.filter(path => path.length === Math.min(...paths.map(p => p.length)));
        
        shortestPaths.forEach(path => {
          for (let i = 0; i < path.length - 1; i++) {
            const edge = `${Math.min(path[i], path[i + 1])}-${Math.max(path[i], path[i + 1])}`;
            if (edgeBetweenness[edge] !== undefined) {
              edgeBetweenness[edge] += 1 / shortestPaths.length;
            }
          }
        });
      }
    });
  });

  return edgeBetweenness;
}

function findConnectedComponents(nodes, adjacencyList) {
  const visited = new Set();
  const components = [];
  
  nodes.forEach(node => {
    if (!visited.has(node.id)) {
      const component = [];
      const queue = [node.id];
      visited.add(node.id);
      
      while (queue.length > 0) {
        const current = queue.shift();
        component.push(current);
        
        adjacencyList[current].forEach(neighbor => {
          if (!visited.has(neighbor)) {
            visited.add(neighbor);
            queue.push(neighbor);
          }
        });
      }
      
      components.push(component);
    }
  });
  
  return components;
}

function findAllPaths(start, end, adjacencyList) {
  const paths = [];
  const visited = new Set();
  
  function dfs(current, target, path) {
    if (current === target) {
      paths.push([...path]);
      return;
    }
    
    visited.add(current);
    adjacencyList[current].forEach(neighbor => {
      if (!visited.has(neighbor)) {
        path.push(neighbor);
        dfs(neighbor, target, path);
        path.pop();
      }
    });
    visited.delete(current);
  }
  
  dfs(start, end, [start]);
  return paths;
}

function computeDistances(start, adjacencyList) {
  const distances = {};
  const queue = [{ node: start, distance: 0 }];
  const visited = new Set([start]);
  
  while (queue.length > 0) {
    const { node, distance } = queue.shift();
    distances[node] = distance;
    
    adjacencyList[node].forEach(neighbor => {
      if (!visited.has(neighbor)) {
        visited.add(neighbor);
        queue.push({ node: neighbor, distance: distance + 1 });
      }
    });
  }
  
  return distances;
}