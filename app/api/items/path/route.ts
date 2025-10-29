import { authOptions } from '@/app/lib/backend/authConfig';
import connectDB from '@/app/lib/mongodb';
import { Item } from '@/app/models/Item';
import { getServerSession } from 'next-auth/next';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const itemId = searchParams.get('itemId');

    const userSession = await getServerSession(authOptions);
    
    if (!userSession?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    if (!itemId) {
      return NextResponse.json(
        { error: 'Item ID is required' },
        { status: 400 }
      );
    }

    await connectDB();

    // Find the target item by ID
    const targetItem = await Item.findById(itemId);
    
    if (!targetItem || targetItem.owner !== userSession.user.id) {
      return NextResponse.json({ error: 'Item not found or unauthorized' }, { status: 404 });
    }

    const path: any[] = [];
    let currentId = itemId;

    // Build breadcrumb path by traversing up the parent chain
    while (currentId) {
      const item = await Item.findById(currentId);
      
      if (!item || item.owner !== userSession.user.id) break;

      path.unshift({
        id: item.id,
        name: item.name,
        type: item.type
      });

      // Stop if we've reached the root folder
      if (item.id === userSession.user.rootFolder) break;
      
      // Move to parent folder
      currentId = item.parentId || null;
      
      // Prevent infinite loops
      if (!currentId || currentId === item.id) break;
    }

    console.log(`Breadcrumb path for ${itemId}:`, path.map(p => p.name).join(' > '));

    return NextResponse.json(path);

  } catch (error: any) {
    console.error('Path API error:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
} 