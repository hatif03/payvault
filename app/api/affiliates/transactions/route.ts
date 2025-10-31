import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/lib/backend/authConfig';
import connectDB from '@/app/lib/mongodb';
import { Commission } from '@/app/models/Commission';
import { Transaction } from '@/app/models/Transaction';
// Mongoose is not used in the demo Firestore-backed models

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Demo implementation without mongoose/population: return empty, well-structured response
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    return NextResponse.json({
      transactions: [],
      summary: {
        pending: { amount: 0, count: 0 },
        paid: { amount: 0, count: 0 },
        failed: { amount: 0, count: 0 }
      },
      pagination: {
        current: page,
        total: 1,
        count: 0,
        totalItems: 0
      }
    });
  } catch (error) {
    console.error('Error fetching affiliate transactions:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}