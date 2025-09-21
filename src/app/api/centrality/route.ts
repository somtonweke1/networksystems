import { NextRequest, NextResponse } from 'next/server';

const CENTRALITY_SERVICE_URL = process.env.CENTRALITY_SERVICE_URL || 'http://localhost:8001';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const response = await fetch(`${CENTRALITY_SERVICE_URL}/api/v1/centrality/compute`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      throw new Error(`Centrality service error: ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Centrality API error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to compute centrality measures',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const response = await fetch(`${CENTRALITY_SERVICE_URL}/api/v1/centrality/algorithms`);
    
    if (!response.ok) {
      throw new Error(`Centrality service error: ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Centrality algorithms API error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch available algorithms',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
