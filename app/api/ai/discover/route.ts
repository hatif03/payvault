import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const { query } = await request.json();
  
  return NextResponse.json({
    results: [
      {
        id: 'demo-result-1',
        title: 'Sample Document',
        description: 'A sample document found in the demo',
        relevance: 0.95,
        metadata: { source: 'demo' }
      }
    ],
    total: 1
  });
}