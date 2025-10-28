import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const { messages } = await request.json();
  
  return NextResponse.json({
    id: 'demo-chat-id',
    choices: [{
      index: 0,
      message: { 
        role: 'assistant', 
        content: 'This is a demo AI response. The actual AI features are disabled in this demo version.' 
      },
      finish_reason: 'stop'
    }]
  });
}