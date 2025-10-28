import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const { prompt } = await request.json();
  
  return NextResponse.json({
    content: 'This is a demo generated response. The actual AI generation features are disabled in this demo version.',
    success: true
  });
} 