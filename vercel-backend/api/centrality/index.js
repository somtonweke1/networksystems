/**
 * NetworkOracle Pro - Advanced Centrality API for Vercel (Node.js)
 * Implements sophisticated network analysis algorithms
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
    // Return available algorithms with detailed information
    const algorithms = [
      {
        id: 'degree',
        name: 'Degree Centrality',
        description: 'Measures the number of connections a node has',
        complexity: 'O(V + E)',
        useCase: 'Identify highly connected nodes in social networks',
        parameters: {}
      },
      {
        id: 'betweenness',
        name: 'Betweenness Centrality',
        description: 'Measures how often a node acts as a bridge between other nodes',
        complexity: 'O(V³)',
        useCase: 'Find nodes that control information flow',
        parameters: {
          normalized: { type: 'boolean', default: true, description: 'Normalize scores' }
        }
      },
      {
        id: 'closeness',
        name: 'Closeness Centrality',
        description: 'Measures how close a node is to all other nodes',
        complexity: 'O(V²)',
        useCase: 'Identify nodes that can spread information quickly',
        parameters: {
          normalized: { type: 'boolean', default: true, description: 'Normalize scores' }
        }
      },
      {
        id: 'eigenvector',
        name: 'Eigenvector Centrality',
        description: 'Measures influence based on connections to influential nodes',
        complexity: 'O(V³)',
        useCase: 'Find influential nodes in social networks',
        parameters: {
          maxIterations: { type: 'number', default: 100, description: 'Maximum iterations' },
          tolerance: { type: 'number', default: 1e-6, description: 'Convergence tolerance' }
        }
      },
      {
        id: 'pagerank',
        name: 'PageRank',
        description: 'Google\'s algorithm for ranking web pages',
        complexity: 'O(V + E)',
        useCase: 'Rank nodes by importance',
        parameters: {
          damping: { type: 'number', default: 0.85, description: 'Damping factor' },
          maxIterations: { type: 'number', default: 100, description: 'Maximum iterations' }
        }
      },
      {
        id: 'katz',
        name: 'Katz Centrality',
        description: 'Generalized degree centrality with attenuation factor',
        complexity: 'O(V³)',
        useCase: 'Measure influence with distance decay',
        parameters: {
          alpha: { type: 'number', default: 0.1, description: 'Attenuation factor' },
          beta: { type: 'number', default: 1.0, description: 'Initial centrality value' }
        }
      },
      {
        id: 'hits',
        name: 'HITS (Hubs and Authorities)',
        description: 'Identifies hub and authority nodes',
        complexity: 'O(V²)',
        useCase: 'Web page ranking and citation networks',
        parameters: {
          maxIterations: { type: 'number', default: 50, description: 'Maximum iterations' }
        }
      },
      {
        id: 'harmonic',
        name: 'Harmonic Centrality',
        description: 'Sum of reciprocal distances to all other nodes',
        complexity: 'O(V²)',
        useCase: 'Alternative to closeness centrality for disconnected graphs',
        parameters: {}
      },
      {
        id: 'subgraph',
        name: 'Subgraph Centrality',
        description: 'Measures centrality based on closed walks',
        complexity: 'O(V³)',
        useCase: 'Identify nodes participating in many subgraphs',
        parameters: {
          maxLength: { type: 'number', default: 10, description: 'Maximum walk length' }
        }
      }
    ];

    res.status(200).json({
      success: true,
      algorithms,
      total: algorithms.length,
      timestamp: new Date().toISOString()
    });
    return;
  }

  if (req.method === 'POST') {
    try {
      const startTime = Date.now();
      const { network, algorithm, options = {} } = req.body;

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

      if (!algorithm) {
        return res.status(400).json({
          success: false,
          error: 'Algorithm must be specified',
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

      // Compute centrality based on algorithm
      let results;
      switch (algorithm.toLowerCase()) {
        case 'degree':
          results = computeDegreeCentrality(network.nodes, adjacencyList);
          break;
        case 'betweenness':
          results = computeBetweennessCentrality(network.nodes, adjacencyList, options);
          break;
        case 'closeness':
          results = computeClosenessCentrality(network.nodes, adjacencyList, options);
          break;
        case 'eigenvector':
          results = computeEigenvectorCentrality(network.nodes, adjacencyList, options);
          break;
        case 'pagerank':
          results = computePageRank(network.nodes, adjacencyList, options);
          break;
        case 'katz':
          results = computeKatzCentrality(network.nodes, adjacencyList, options);
          break;
        case 'hits':
          results = computeHITS(network.nodes, adjacencyList, options);
          break;
        case 'harmonic':
          results = computeHarmonicCentrality(network.nodes, adjacencyList);
          break;
        case 'subgraph':
          results = computeSubgraphCentrality(network.nodes, adjacencyList, options);
          break;
        default:
          return res.status(400).json({
            success: false,
            error: `Unknown algorithm: ${algorithm}`,
            timestamp: new Date().toISOString()
          });
      }

      const computationTime = Date.now() - startTime;

      res.status(200).json({
        success: true,
        algorithm,
        results: results.centrality,
        metadata: {
          nodeCount: network.nodes.length,
          edgeCount: network.edges.length,
          computationTime,
          algorithm: algorithm,
          parameters: options,
          statistics: results.statistics || {}
        },
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      console.error('Centrality computation error:', error);
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

// Advanced centrality computation functions

function computeDegreeCentrality(nodes, adjacencyList) {
  const centrality = nodes.map(node => ({
    nodeId: node.id,
    value: adjacencyList[node.id].length,
    normalizedValue: 0
  }));

  const maxDegree = Math.max(...centrality.map(c => c.value));
  centrality.forEach(c => {
    c.normalizedValue = maxDegree > 0 ? c.value / maxDegree : 0;
  });

  return {
    centrality,
    statistics: {
      maxDegree,
      avgDegree: centrality.reduce((sum, c) => sum + c.value, 0) / centrality.length,
      degreeDistribution: getDistribution(centrality.map(c => c.value))
    }
  };
}

function computeBetweennessCentrality(nodes, adjacencyList, options) {
  const betweenness = {};
  nodes.forEach(node => betweenness[node.id] = 0);

  // Floyd-Warshall algorithm for shortest paths
  const distances = {};
  const next = {};
  
  nodes.forEach(node1 => {
    distances[node1.id] = {};
    next[node1.id] = {};
    nodes.forEach(node2 => {
      if (node1.id === node2.id) {
        distances[node1.id][node2.id] = 0;
      } else if (adjacencyList[node1.id].includes(node2.id)) {
        distances[node1.id][node2.id] = 1;
        next[node1.id][node2.id] = node2.id;
      } else {
        distances[node1.id][node2.id] = Infinity;
      }
    });
  });

  nodes.forEach(k => {
    nodes.forEach(i => {
      nodes.forEach(j => {
        if (distances[i.id][k.id] + distances[k.id][j.id] < distances[i.id][j.id]) {
          distances[i.id][j.id] = distances[i.id][k.id] + distances[k.id][j.id];
          next[i.id][j.id] = next[i.id][k.id];
        }
      });
    });
  });

  // Calculate betweenness centrality
  nodes.forEach(s => {
    nodes.forEach(t => {
      if (s.id !== t.id && distances[s.id][t.id] !== Infinity) {
        const paths = findAllShortestPaths(s.id, t.id, adjacencyList, distances);
        const numPaths = paths.length;
        
        paths.forEach(path => {
          path.slice(1, -1).forEach(nodeId => {
            betweenness[nodeId] += 1 / numPaths;
          });
        });
      }
    });
  });

  const maxBetweenness = Math.max(...Object.values(betweenness));
  const centrality = nodes.map(node => ({
    nodeId: node.id,
    value: betweenness[node.id],
    normalizedValue: options.normalized !== false && maxBetweenness > 0 ? 
      betweenness[node.id] / maxBetweenness : betweenness[node.id]
  }));

  return {
    centrality,
    statistics: {
      maxBetweenness,
      avgBetweenness: Object.values(betweenness).reduce((sum, val) => sum + val, 0) / nodes.length
    }
  };
}

function computeClosenessCentrality(nodes, adjacencyList, options) {
  const centrality = nodes.map(node => {
    const distances = computeDistances(node.id, adjacencyList);
    const reachableNodes = Object.keys(distances).length - 1; // Exclude self
    const totalDistance = Object.values(distances).reduce((sum, dist) => sum + dist, 0);
    
    const closeness = reachableNodes > 0 ? reachableNodes / totalDistance : 0;
    
    return {
      nodeId: node.id,
      value: closeness,
      normalizedValue: options.normalized !== false ? closeness * reachableNodes : closeness,
      reachableNodes
    };
  });

  return {
    centrality,
    statistics: {
      avgCloseness: centrality.reduce((sum, c) => sum + c.value, 0) / centrality.length,
      connectedComponents: countConnectedComponents(nodes, adjacencyList)
    }
  };
}

function computeEigenvectorCentrality(nodes, adjacencyList, options) {
  const maxIterations = options.maxIterations || 100;
  const tolerance = options.tolerance || 1e-6;
  
  let eigenvector = {};
  nodes.forEach(node => {
    eigenvector[node.id] = 1.0;
  });

  for (let iter = 0; iter < maxIterations; iter++) {
    const newEigenvector = {};
    let maxValue = 0;
    
    nodes.forEach(node => {
      let sum = 0;
      adjacencyList[node.id].forEach(neighbor => {
        sum += eigenvector[neighbor];
      });
      newEigenvector[node.id] = sum;
      maxValue = Math.max(maxValue, sum);
    });

    // Normalize
    if (maxValue > 0) {
      nodes.forEach(node => {
        newEigenvector[node.id] /= maxValue;
      });
    }

    // Check convergence
    let converged = true;
    nodes.forEach(node => {
      if (Math.abs(newEigenvector[node.id] - eigenvector[node.id]) > tolerance) {
        converged = false;
      }
    });

    eigenvector = newEigenvector;
    if (converged) break;
  }

  const centrality = nodes.map(node => ({
    nodeId: node.id,
    value: eigenvector[node.id],
    normalizedValue: eigenvector[node.id]
  }));

  return {
    centrality,
    statistics: {
      maxEigenvalue: Math.max(...Object.values(eigenvector)),
      convergenceIterations: maxIterations
    }
  };
}

function computePageRank(nodes, adjacencyList, options) {
  const damping = options.damping || 0.85;
  const maxIterations = options.maxIterations || 100;
  
  let pagerank = {};
  nodes.forEach(node => {
    pagerank[node.id] = 1.0 / nodes.length;
  });

  for (let iter = 0; iter < maxIterations; iter++) {
    const newPagerank = {};
    let totalRank = 0;
    
    nodes.forEach(node => {
      let sum = 0;
      adjacencyList[node.id].forEach(neighbor => {
        const outDegree = adjacencyList[neighbor].length;
        if (outDegree > 0) {
          sum += pagerank[neighbor] / outDegree;
        }
      });
      newPagerank[node.id] = (1 - damping) / nodes.length + damping * sum;
      totalRank += newPagerank[node.id];
    });
    
    pagerank = newPagerank;
  }

  const centrality = nodes.map(node => ({
    nodeId: node.id,
    value: pagerank[node.id],
    normalizedValue: pagerank[node.id]
  }));

  return {
    centrality,
    statistics: {
      totalRank: centrality.reduce((sum, c) => sum + c.value, 0),
      maxRank: Math.max(...centrality.map(c => c.value)),
      minRank: Math.min(...centrality.map(c => c.value))
    }
  };
}

function computeKatzCentrality(nodes, adjacencyList, options) {
  const alpha = options.alpha || 0.1;
  const beta = options.beta || 1.0;
  
  // Build adjacency matrix
  const nodeIndex = {};
  nodes.forEach((node, i) => {
    nodeIndex[node.id] = i;
  });

  const matrix = nodes.map(node1 => 
    nodes.map(node2 => 
      adjacencyList[node1.id].includes(node2.id) ? 1 : 0
    )
  );

  // Katz centrality: (I - αA)^(-1) * β
  let katz = {};
  nodes.forEach(node => {
    katz[node.id] = beta;
  });

  // Iterative computation
  for (let iter = 0; iter < 20; iter++) {
    const newKatz = {};
    nodes.forEach((node, i) => {
      let sum = beta;
      nodes.forEach((otherNode, j) => {
        sum += alpha * matrix[i][j] * katz[otherNode.id];
      });
      newKatz[node.id] = sum;
    });
    katz = newKatz;
  }

  const maxValue = Math.max(...Object.values(katz));
  const centrality = nodes.map(node => ({
    nodeId: node.id,
    value: katz[node.id],
    normalizedValue: maxValue > 0 ? katz[node.id] / maxValue : 0
  }));

  return {
    centrality,
    statistics: {
      alpha,
      beta,
      maxKatz: maxValue
    }
  };
}

function computeHITS(nodes, adjacencyList, options) {
  const maxIterations = options.maxIterations || 50;
  
  let hubs = {};
  let authorities = {};
  
  nodes.forEach(node => {
    hubs[node.id] = 1.0;
    authorities[node.id] = 1.0;
  });

  // Iterative computation
  for (let iter = 0; iter < maxIterations; iter++) {
    const newAuthorities = {};
    const newHubs = {};
    
    // Update authorities
    nodes.forEach(node => {
      let sum = 0;
      adjacencyList[node.id].forEach(neighbor => {
        sum += hubs[neighbor];
      });
      newAuthorities[node.id] = sum;
    });
    
    // Update hubs
    nodes.forEach(node => {
      let sum = 0;
      adjacencyList[node.id].forEach(neighbor => {
        sum += authorities[neighbor];
      });
      newHubs[node.id] = sum;
    });
    
    // Normalize
    const maxAuth = Math.max(...Object.values(newAuthorities));
    const maxHub = Math.max(...Object.values(newHubs));
    
    if (maxAuth > 0) {
      nodes.forEach(node => {
        newAuthorities[node.id] /= maxAuth;
      });
    }
    
    if (maxHub > 0) {
      nodes.forEach(node => {
        newHubs[node.id] /= maxHub;
      });
    }
    
    authorities = newAuthorities;
    hubs = newHubs;
  }

  const centrality = nodes.map(node => ({
    nodeId: node.id,
    value: authorities[node.id],
    normalizedValue: authorities[node.id],
    hubValue: hubs[node.id],
    authorityValue: authorities[node.id]
  }));

  return {
    centrality,
    statistics: {
      maxHub: Math.max(...Object.values(hubs)),
      maxAuthority: Math.max(...Object.values(authorities))
    }
  };
}

function computeHarmonicCentrality(nodes, adjacencyList) {
  const centrality = nodes.map(node => {
    const distances = computeDistances(node.id, adjacencyList);
    let harmonicSum = 0;
    let reachableCount = 0;
    
    Object.entries(distances).forEach(([nodeId, distance]) => {
      if (nodeId !== node.id && distance !== Infinity) {
        harmonicSum += 1 / distance;
        reachableCount++;
      }
    });
    
    return {
      nodeId: node.id,
      value: harmonicSum,
      normalizedValue: reachableCount > 0 ? harmonicSum / reachableCount : 0,
      reachableNodes: reachableCount
    };
  });

  return {
    centrality,
    statistics: {
      avgHarmonic: centrality.reduce((sum, c) => sum + c.value, 0) / centrality.length,
      maxHarmonic: Math.max(...centrality.map(c => c.value))
    }
  };
}

function computeSubgraphCentrality(nodes, adjacencyList, options) {
  const maxLength = options.maxLength || 10;
  
  // Build adjacency matrix
  const nodeIndex = {};
  nodes.forEach((node, i) => {
    nodeIndex[node.id] = i;
  });

  const matrix = nodes.map(node1 => 
    nodes.map(node2 => 
      adjacencyList[node1.id].includes(node2.id) ? 1 : 0
    )
  );

  // Matrix exponentiation for closed walks
  let result = Array(nodes.length).fill().map(() => Array(nodes.length).fill(0));
  let temp = matrix.map(row => [...row]);
  
  for (let length = 2; length <= maxLength; length++) {
    // Matrix multiplication
    const newTemp = Array(nodes.length).fill().map(() => Array(nodes.length).fill(0));
    
    for (let i = 0; i < nodes.length; i++) {
      for (let j = 0; j < nodes.length; j++) {
        for (let k = 0; k < nodes.length; k++) {
          newTemp[i][j] += temp[i][k] * matrix[k][j];
        }
      }
    }
    
    temp = newTemp;
    
    // Add diagonal elements (closed walks)
    for (let i = 0; i < nodes.length; i++) {
      result[i][i] += temp[i][i] / length; // Weight by walk length
    }
  }

  const centrality = nodes.map((node, i) => ({
    nodeId: node.id,
    value: result[i][i],
    normalizedValue: result[i][i]
  }));

  return {
    centrality,
    statistics: {
      maxSubgraph: Math.max(...centrality.map(c => c.value)),
      avgSubgraph: centrality.reduce((sum, c) => sum + c.value, 0) / centrality.length
    }
  };
}

// Helper functions

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

function findAllShortestPaths(start, end, adjacencyList, distances) {
  if (distances[start][end] === Infinity) return [];
  
  const paths = [];
  const path = [start];
  
  function dfs(current, target, currentPath) {
    if (current === target) {
      paths.push([...currentPath]);
      return;
    }
    
    adjacencyList[current].forEach(neighbor => {
      if (distances[neighbor][target] === distances[current][target] - 1) {
        currentPath.push(neighbor);
        dfs(neighbor, target, currentPath);
        currentPath.pop();
      }
    });
  }
  
  dfs(start, end, path);
  return paths;
}

function countConnectedComponents(nodes, adjacencyList) {
  const visited = new Set();
  let components = 0;
  
  nodes.forEach(node => {
    if (!visited.has(node.id)) {
      components++;
      const queue = [node.id];
      visited.add(node.id);
      
      while (queue.length > 0) {
        const current = queue.shift();
        adjacencyList[current].forEach(neighbor => {
          if (!visited.has(neighbor)) {
            visited.add(neighbor);
            queue.push(neighbor);
          }
        });
      }
    }
  });
  
  return components;
}

function getDistribution(values) {
  const distribution = {};
  values.forEach(value => {
    distribution[value] = (distribution[value] || 0) + 1;
  });
  return distribution;
}