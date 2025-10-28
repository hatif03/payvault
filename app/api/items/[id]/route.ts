import { authOptions } from '@/app/lib/backend/authConfig';
import { getServerSession } from 'next-auth/next';
import { NextRequest, NextResponse } from 'next/server';
import { Item } from '@/app/models/Item';
import { uploadFileToS3 } from '@/app/lib/s3';
import connectDB from '@/app/lib/mongodb';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const id = request.nextUrl.pathname.split("/")[3];
    await connectDB();
    
    const item = await Item.findById(id);
    
    if (!item || item.owner !== session.user.id) {
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
    await connectDB();

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

    const item = await Item.findById(id);
    
    if (!item || item.owner !== session.user.id) {
      return NextResponse.json({ error: 'Item not found' }, { status: 404 });
    }

    const updateData: any = {};
    if (name) updateData.name = name;
    if (parentId !== undefined) updateData.parentId = parentId;

    const updatedItem = await Item.update(id, updateData);

    return NextResponse.json(updatedItem);
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
    await connectDB();
    
    const item = await Item.findById(id);
    
    if (!item || item.owner !== session.user.id) {
      return NextResponse.json({ error: 'Item not found' }, { status: 404 });
    }

    const success = await Item.deleteItem(id);

    return NextResponse.json({ 
      message: 'Item deleted successfully',
      deletedCount: success ? 1 : 0
    });
  } catch (error: any) {
    console.error('DELETE /api/items/[id] error:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}

