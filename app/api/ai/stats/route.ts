import { NextRequest, NextResponse } from 'next/server';

export async function GET(_request: NextRequest) {
  return NextResponse.json({
    totalFiles: 5,
    processedFiles: 3,
    totalChunks: 15,
    averageRelevance: 0.87
  });
}