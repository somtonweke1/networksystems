-- NetworkOracle Pro Database Initialization
-- PostgreSQL 17 with PostGIS extension

-- Enable PostGIS extension for geospatial data
CREATE EXTENSION IF NOT EXISTS postgis;

-- Create database schema
CREATE SCHEMA IF NOT EXISTS networkoracle;

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    username VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    is_active BOOLEAN DEFAULT true,
    is_verified BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Networks table
CREATE TABLE IF NOT EXISTS networks (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    network_data JSONB NOT NULL,
    metadata JSONB DEFAULT '{}',
    is_public BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Centrality results table
CREATE TABLE IF NOT EXISTS centrality_results (
    id SERIAL PRIMARY KEY,
    network_id INTEGER REFERENCES networks(id) ON DELETE CASCADE,
    algorithm VARCHAR(100) NOT NULL,
    results JSONB NOT NULL,
    parameters JSONB DEFAULT '{}',
    execution_time FLOAT NOT NULL,
    node_count INTEGER NOT NULL,
    edge_count INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP DEFAULT (CURRENT_TIMESTAMP + INTERVAL '7 days')
);

-- Analysis results table
CREATE TABLE IF NOT EXISTS analysis_results (
    id SERIAL PRIMARY KEY,
    network_id INTEGER REFERENCES networks(id) ON DELETE CASCADE,
    analysis_type VARCHAR(100) NOT NULL,
    results JSONB NOT NULL,
    parameters JSONB DEFAULT '{}',
    execution_time FLOAT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP DEFAULT (CURRENT_TIMESTAMP + INTERVAL '7 days')
);

-- Visualization configurations table
CREATE TABLE IF NOT EXISTS visualization_configs (
    id SERIAL PRIMARY KEY,
    network_id INTEGER REFERENCES networks(id) ON DELETE CASCADE,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    config JSONB NOT NULL,
    is_default BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Performance metrics table
CREATE TABLE IF NOT EXISTS performance_metrics (
    id SERIAL PRIMARY KEY,
    service_name VARCHAR(100) NOT NULL,
    algorithm VARCHAR(100),
    node_count INTEGER NOT NULL,
    edge_count INTEGER NOT NULL,
    execution_time FLOAT NOT NULL,
    memory_usage FLOAT,
    cpu_usage FLOAT,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- API keys table for external integrations
CREATE TABLE IF NOT EXISTS api_keys (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    key_hash VARCHAR(255) UNIQUE NOT NULL,
    permissions JSONB DEFAULT '[]',
    is_active BOOLEAN DEFAULT true,
    last_used TIMESTAMP,
    expires_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Data sources table
CREATE TABLE IF NOT EXISTS data_sources (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    source_type VARCHAR(100) NOT NULL,
    config JSONB NOT NULL,
    is_active BOOLEAN DEFAULT true,
    last_sync TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_networks_user_id ON networks(user_id);
CREATE INDEX IF NOT EXISTS idx_networks_created_at ON networks(created_at);
CREATE INDEX IF NOT EXISTS idx_centrality_results_network_id ON centrality_results(network_id);
CREATE INDEX IF NOT EXISTS idx_centrality_results_algorithm ON centrality_results(algorithm);
CREATE INDEX IF NOT EXISTS idx_centrality_results_expires_at ON centrality_results(expires_at);
CREATE INDEX IF NOT EXISTS idx_analysis_results_network_id ON analysis_results(network_id);
CREATE INDEX IF NOT EXISTS idx_analysis_results_analysis_type ON analysis_results(analysis_type);
CREATE INDEX IF NOT EXISTS idx_visualization_configs_network_id ON visualization_configs(network_id);
CREATE INDEX IF NOT EXISTS idx_visualization_configs_user_id ON visualization_configs(user_id);
CREATE INDEX IF NOT EXISTS idx_performance_metrics_service ON performance_metrics(service_name);
CREATE INDEX IF NOT EXISTS idx_performance_metrics_timestamp ON performance_metrics(timestamp);
CREATE INDEX IF NOT EXISTS idx_api_keys_user_id ON api_keys(user_id);
CREATE INDEX IF NOT EXISTS idx_api_keys_key_hash ON api_keys(key_hash);
CREATE INDEX IF NOT EXISTS idx_data_sources_user_id ON data_sources(user_id);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_networks_updated_at BEFORE UPDATE ON networks
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_visualization_configs_updated_at BEFORE UPDATE ON visualization_configs
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_data_sources_updated_at BEFORE UPDATE ON data_sources
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert default admin user (password: admin123)
INSERT INTO users (email, username, password_hash, first_name, last_name, is_active, is_verified)
VALUES (
    'admin@networkoracle.com',
    'admin',
    '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J/5g8Yj5i', -- bcrypt hash of 'admin123'
    'Admin',
    'User',
    true,
    true
) ON CONFLICT (email) DO NOTHING;

-- Insert sample network data
INSERT INTO networks (user_id, name, description, network_data, is_public)
VALUES (
    1,
    'Sample Social Network',
    'A sample social network for testing centrality algorithms',
    '{
        "nodes": [
            {"id": "1", "label": "Alice", "attributes": {"age": 30, "city": "New York"}},
            {"id": "2", "label": "Bob", "attributes": {"age": 25, "city": "Boston"}},
            {"id": "3", "label": "Charlie", "attributes": {"age": 35, "city": "Chicago"}},
            {"id": "4", "label": "Diana", "attributes": {"age": 28, "city": "New York"}},
            {"id": "5", "label": "Eve", "attributes": {"age": 32, "city": "Boston"}}
        ],
        "edges": [
            {"source": "1", "target": "2", "weight": 1.0},
            {"source": "1", "target": "3", "weight": 0.8},
            {"source": "2", "target": "4", "weight": 1.0},
            {"source": "3", "target": "4", "weight": 0.6},
            {"source": "4", "target": "5", "weight": 1.0},
            {"source": "1", "target": "5", "weight": 0.9}
        ],
        "directed": false,
        "metadata": {"type": "social", "domain": "friendship"}
    }',
    true
) ON CONFLICT DO NOTHING;

-- Create a view for network statistics
CREATE OR REPLACE VIEW network_stats AS
SELECT 
    n.id,
    n.name,
    n.user_id,
    u.username,
    jsonb_array_length(n.network_data->'nodes') as node_count,
    jsonb_array_length(n.network_data->'edges') as edge_count,
    n.created_at,
    n.updated_at
FROM networks n
JOIN users u ON n.user_id = u.id;

-- Create a view for algorithm performance
CREATE OR REPLACE VIEW algorithm_performance AS
SELECT 
    algorithm,
    AVG(execution_time) as avg_execution_time,
    MIN(execution_time) as min_execution_time,
    MAX(execution_time) as max_execution_time,
    COUNT(*) as total_runs,
    AVG(node_count) as avg_nodes,
    AVG(edge_count) as avg_edges
FROM centrality_results
WHERE created_at > CURRENT_TIMESTAMP - INTERVAL '30 days'
GROUP BY algorithm;

-- Grant permissions
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO postgres;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO postgres;

-- Success message
DO $$
BEGIN
    RAISE NOTICE 'NetworkOracle Pro database initialized successfully!';
END $$;
