import { NextResponse } from 'next/server';

const CENTRALITY_SERVICE_URL = process.env.CENTRALITY_SERVICE_URL || 'http://localhost:8001';

export async function GET() {
  try {
    // Check backend service health
    const backendResponse = await fetch(`${CENTRALITY_SERVICE_URL}/health`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const backendHealth = backendResponse.ok ? await backendResponse.json() : null;

    return NextResponse.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      services: {
        frontend: 'healthy',
        backend: backendHealth ? 'healthy' : 'unhealthy',
        database: 'unknown' // Will be checked by backend
      },
      version: '1.0.0'
    });
  } catch (error) {
    return NextResponse.json({
      status: 'degraded',
      timestamp: new Date().toISOString(),
      services: {
        frontend: 'healthy',
        backend: 'unreachable',
        database: 'unknown'
      },
      version: '1.0.0',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 503 });
  }
}
