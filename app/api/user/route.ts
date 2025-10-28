import { authOptions } from '@/app/lib/backend/authConfig';
import { getServerSession } from 'next-auth/next';
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/app/lib/mock/mockDb';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = db.users.find(u => u._id === session.user.id);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        rootFolder: user.rootFolder,
        createdAt: new Date().toISOString()
      }
    });
  } catch (error: any) {
    console.error('GET /api/user error:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { email } = await request.json();
    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    const user = db.users.find(u => u.email === email);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (user.email === session.user.email) {
      return NextResponse.json({ error: 'Cannot create affiliate for yourself' }, { status: 400 });
    }

    return NextResponse.json({ user: { _id: user._id, name: user.name, email: user.email } });
  } catch (error: any) {
    console.error('POST /api/user error:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
