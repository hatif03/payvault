import { authOptions } from '@/app/lib/backend/authConfig';
import { getServerSession } from 'next-auth/next';
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/app/lib/mock/mockDb';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const id = request.nextUrl.pathname.split("/")[3];
    const item = db.items.find(i => i._id === id && i.owner === session.user.id);
    
    if (!item) {
      return NextResponse.json({ error: 'Item not found' }, { status: 404 });
    }

    return NextResponse.json(item);
  } catch (error: any) {
    console.error('GET /api/items/[id] error:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const id = request.nextUrl.pathname.split("/")[3];
    const contentType = request.headers.get('content-type');

    let name: string | undefined;
    let parentId: string | undefined;

    if (contentType?.includes('multipart/form-data')) {
      const formData = await request.formData();
      const nameField = formData.get('name');
      const parentIdField = formData.get('parentId');
      
      name = nameField ? nameField.toString() : undefined;
      parentId = parentIdField ? parentIdField.toString() : undefined;
    } else {
      const body = await request.json();
      name = body.name;
      parentId = body.parentId;
    }

    const itemIndex = db.items.findIndex(i => i._id === id && i.owner === session.user.id);
    
    if (itemIndex === -1) {
      return NextResponse.json({ error: 'Item not found' }, { status: 404 });
    }

    if (name) db.items[itemIndex].name = name;
    if (parentId !== undefined) db.items[itemIndex].parentId = parentId;

    return NextResponse.json(db.items[itemIndex]);
  } catch (error: any) {
    console.error('PUT /api/items/[id] error:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const id = request.nextUrl.pathname.split("/")[3];
    const itemIndex = db.items.findIndex(i => i._id === id && i.owner === session.user.id);
    
    if (itemIndex === -1) {
      return NextResponse.json({ error: 'Item not found' }, { status: 404 });
    }

    // Simple deletion - remove the item
    db.items.splice(itemIndex, 1);

    return NextResponse.json({ 
      message: 'Item deleted successfully',
      deletedCount: 1 
    });
  } catch (error: any) {
    console.error('DELETE /api/items/[id] error:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}

