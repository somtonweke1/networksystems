'use client';

import React, { useState, useEffect } from 'react';
import { useNetworkStore } from '@/stores/network-store';
import { Network3D, convertTo3D } from '@/components/visualization/network-3d';
import { TemporalAnalysis } from '@/components/visualization/temporal-analysis';

const AdvancedDashboard: React.FC = () => {
  const {
    networks,
    currentNetwork,
    analysisResults,
    loading,
    error,
    setCurrentNetwork,
    addNetwork,
    runCentralityAnalysis,
    runNetworkAnalysis,
    clearError
  } = useNetworkStore();

  const [activeTab, setActiveTab] = useState<'3d' | 'temporal' | 'ml'>('3d');
  const [mlPredictions, setMlPredictions] = useState<any>(null);
  const [mlLoading, setMlLoading] = useState(false);
  const [predictionType, setPredictionType] = useState('network_growth');
  const [timeHorizon, setTimeHorizon] = useState(12);
  const [networkHistory, setNetworkHistory] = useState<any[]>([]);

  // Sample network data for demonstration
  const sampleNetwork = {
    id: 'sample-advanced',
    name: 'Advanced Sample Network',
    description: 'A sample network for demonstrating ML and 3D features',
    nodes: [
      { id: 'A', label: 'Alice', group: 'users', x: 0, y: 0, z: 0 },
      { id: 'B', label: 'Bob', group: 'users', x: 2, y: 0, z: 0 },
      { id: 'C', label: 'Charlie', group: 'users', x: 1, y: 2, z: 0 },
      { id: 'D', label: 'Diana', group: 'admins', x: -1, y: 1, z: 1 },
      { id: 'E', label: 'Eve', group: 'admins', x: 3, y: 1, z: -1 },
      { id: 'F', label: 'Frank', group: 'users', x: 0, y: -2, z: 1 },
      { id: 'G', label: 'Grace', group: 'users', x: -2, y: 0, z: -1 },
      { id: 'H', label: 'Henry', group: 'admins', x: 2, y: -1, z: 1 }
    ],
    edges: [
      { source: 'A', target: 'B', weight: 1 },
      { source: 'B', target: 'C', weight: 1 },
      { source: 'C', target: 'D', weight: 1 },
      { source: 'D', target: 'E', weight: 1 },
      { source: 'E', target: 'F', weight: 1 },
      { source: 'F', target: 'G', weight: 1 },
      { source: 'G', target: 'H', weight: 1 },
      { source: 'H', target: 'A', weight: 1 },
      { source: 'A', target: 'C', weight: 1 },
      { source: 'B', target: 'D', weight: 1 },
      { source: 'C', target: 'E', weight: 1 },
      { source: 'D', target: 'F', weight: 1 },
      { source: 'E', target: 'G', weight: 1 },
      { source: 'F', target: 'H', weight: 1 }
    ],
    directed: false,
    createdAt: new Date().toISOString()
  };

  // Generate temporal network history
  useEffect(() => {
    if (currentNetwork) {
      const history = generateNetworkHistory(currentNetwork);
      setNetworkHistory(history);
    }
  }, [currentNetwork]);

  // Generate network evolution history
  const generateNetworkHistory = (network: any) => {
    const history = [];
    const baseTime = Date.now() - 30 * 24 * 60 * 60 * 1000; // 30 days ago
    
    for (let i = 0; i < 10; i++) {
      const timestamp = baseTime + i * 3 * 24 * 60 * 60 * 1000; // Every 3 days
      const growthFactor = 1 + (i * 0.1); // 10% growth each step
      
      const evolvedNodes = network.nodes.map((node: any) => ({
        ...node,
        timestamp,
        size: node.size * growthFactor,
        centrality: Math.random() * 0.5 + 0.3 // Simulate centrality evolution
      }));
      
      const evolvedEdges = network.edges.map((edge: any) => ({
        ...edge,
        timestamp,
        weight: edge.weight * growthFactor
      }));
      
      history.push({
        timestamp,
        nodes: evolvedNodes,
        edges: evolvedEdges
      });
    }
    
    return history;
  };

  // Run ML predictions
  const handleMlPrediction = async () => {
    if (!currentNetwork) return;
    
    setMlLoading(true);
    try {
      const response = await fetch('/api/ml/predictive', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          network: currentNetwork,
          predictionType,
          timeHorizon,
          features: ['degree', 'betweenness', 'closeness']
        }),
      });

      if (!response.ok) {
        throw new Error(`ML API error: ${response.status}`);
      }

      const result = await response.json();
      setMlPredictions(result);
    } catch (error) {
      console.error('ML prediction failed:', error);
    } finally {
      setMlLoading(false);
    }
  };

  // Load sample network
  const handleLoadSample = async () => {
    try {
      await addNetwork(sampleNetwork);
      setCurrentNetwork(sampleNetwork);
    } catch (error) {
      console.error('Failed to load sample network:', error);
    }
  };

  // Run centrality analysis for 3D visualization
  const handleRunCentrality = async () => {
    if (!currentNetwork) return;
    
    try {
      const result = await runCentralityAnalysis(currentNetwork, 'degree');
      console.log('Centrality analysis result:', result);
    } catch (error) {
      console.error('Centrality analysis failed:', error);
    }
  };

  // Get 3D network data
  const get3DNetworkData = () => {
    if (!currentNetwork) return { nodes3D: [], edges3D: [] };
    
    const centralityResults = analysisResults[currentNetwork.id]?.centrality || [];
    return convertTo3D(currentNetwork.nodes, currentNetwork.edges, centralityResults);
  };

  const { nodes3D, edges3D } = get3DNetworkData();

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            NetworkOracle Pro - Advanced Analytics
          </h1>
          <div className="flex gap-4">
            <button
              onClick={handleLoadSample}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Load Sample Network
            </button>
            <button
              onClick={handleRunCentrality}
              disabled={!currentNetwork || loading}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
            >
              Run Centrality Analysis
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
            <div className="flex justify-between items-center">
              <span>{error}</span>
              <button
                onClick={clearError}
                className="text-red-500 hover:text-red-700"
              >
                ×
              </button>
            </div>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="bg-white rounded-lg shadow-md mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8 px-6">
              {[
                { id: '3d', name: '3D Visualization', icon: '🎯' },
                { id: 'temporal', name: 'Temporal Analysis', icon: '📈' },
                { id: 'ml', name: 'ML Predictions', icon: '🤖' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <span className="mr-2">{tab.icon}</span>
                  {tab.name}
                </button>
              ))}
            </nav>
          </div>

          <div className="p-6">
            {/* 3D Visualization Tab */}
            {activeTab === '3d' && (
              <div>
                <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                  3D Network Visualization
                </h2>
                {currentNetwork ? (
                  <div className="bg-gray-100 rounded-lg p-4">
                    <Network3D
                      nodes={nodes3D}
                      edges={edges3D}
                      width={800}
                      height={600}
                      showLabels={true}
                      colorScheme="centrality"
                    />
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="text-gray-500 text-lg">
                      Load a network to see the 3D visualization
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Temporal Analysis Tab */}
            {activeTab === 'temporal' && (
              <div>
                <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                  Temporal Network Analysis
                </h2>
                {networkHistory.length > 0 ? (
                  <TemporalAnalysis
                    networkHistory={networkHistory}
                    width={800}
                    height={400}
                    showEvolution={true}
                    animationSpeed={1000}
                  />
                ) : (
                  <div className="text-center py-12">
                    <div className="text-gray-500 text-lg">
                      Load a network to see temporal analysis
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ML Predictions Tab */}
            {activeTab === 'ml' && (
              <div>
                <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                  Machine Learning Predictions
                </h2>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Controls */}
                  <div className="bg-gray-50 p-6 rounded-lg">
                    <h3 className="text-lg font-semibold mb-4">Prediction Settings</h3>
                    
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Prediction Type
                        </label>
                        <select
                          value={predictionType}
                          onChange={(e) => setPredictionType(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="network_growth">Network Growth</option>
                          <option value="anomaly_detection">Anomaly Detection</option>
                          <option value="influence_prediction">Influence Prediction</option>
                          <option value="community_evolution">Community Evolution</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Time Horizon (months)
                        </label>
                        <input
                          type="number"
                          value={timeHorizon}
                          onChange={(e) => setTimeHorizon(Number(e.target.value))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          min="1"
                          max="60"
                        />
                      </div>

                      <button
                        onClick={handleMlPrediction}
                        disabled={!currentNetwork || mlLoading}
                        className="w-full px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:opacity-50"
                      >
                        {mlLoading ? 'Generating Predictions...' : 'Generate Predictions'}
                      </button>
                    </div>
                  </div>

                  {/* Results */}
                  <div className="bg-gray-50 p-6 rounded-lg">
                    <h3 className="text-lg font-semibold mb-4">Prediction Results</h3>
                    
                    {mlPredictions ? (
                      <div className="space-y-4">
                        <div className="bg-white p-4 rounded border">
                          <h4 className="font-semibold mb-2">Network Summary</h4>
                          <div className="text-sm space-y-1">
                            <p>Nodes: {mlPredictions.network_summary?.nodeCount}</p>
                            <p>Edges: {mlPredictions.network_summary?.edgeCount}</p>
                            <p>Density: {mlPredictions.network_summary?.density?.toFixed(3)}</p>
                            <p>Average Degree: {mlPredictions.network_summary?.avgDegree?.toFixed(2)}</p>
                          </div>
                        </div>

                        <div className="bg-white p-4 rounded border">
                          <h4 className="font-semibold mb-2">Predictions</h4>
                          <div className="text-sm">
                            <pre className="whitespace-pre-wrap bg-gray-100 p-2 rounded text-xs">
                              {JSON.stringify(mlPredictions.predictions, null, 2)}
                            </pre>
                          </div>
                        </div>

                        <div className="bg-white p-4 rounded border">
                          <h4 className="font-semibold mb-2">Model Info</h4>
                          <div className="text-sm space-y-1">
                            <p>Model: {mlPredictions.metadata?.model}</p>
                            <p>Confidence: {(mlPredictions.metadata?.confidence * 100).toFixed(1)}%</p>
                            <p>Prediction Type: {mlPredictions.prediction_type}</p>
                            <p>Time Horizon: {mlPredictions.time_horizon} months</p>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <div className="text-gray-500">
                          {currentNetwork 
                            ? 'Click "Generate Predictions" to see ML insights'
                            : 'Load a network to generate predictions'
                          }
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Network Info */}
        {currentNetwork && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Current Network: {currentNetwork.name}
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-blue-50 p-3 rounded">
                <div className="text-sm text-gray-600">Nodes</div>
                <div className="text-2xl font-bold text-blue-600">
                  {currentNetwork.nodes.length}
                </div>
              </div>
              <div className="bg-green-50 p-3 rounded">
                <div className="text-sm text-gray-600">Edges</div>
                <div className="text-2xl font-bold text-green-600">
                  {currentNetwork.edges.length}
                </div>
              </div>
              <div className="bg-purple-50 p-3 rounded">
                <div className="text-sm text-gray-600">Groups</div>
                <div className="text-2xl font-bold text-purple-600">
                  {new Set(currentNetwork.nodes.map(n => n.group)).size}
                </div>
              </div>
              <div className="bg-orange-50 p-3 rounded">
                <div className="text-sm text-gray-600">Analyses</div>
                <div className="text-2xl font-bold text-orange-600">
                  {Object.keys(analysisResults).length}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdvancedDashboard;
