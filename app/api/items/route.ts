import { authOptions } from '@/app/lib/backend/authConfig';
import { getServerSession } from 'next-auth/next';
import { NextRequest, NextResponse } from 'next/server';
import { Item } from '@/app/models/Item';
import { uploadFileToS3 } from '@/app/lib/s3';
import connectDB from '@/app/lib/mongodb';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const parentId = searchParams.get('parentId');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    let items;
    if (parentId) {
      items = await Item.findByParent(parentId);
    } else {
      // Return root folder if no parentId specified
      const rootFolder = await Item.findById(session.user.rootFolder);
      items = rootFolder ? [rootFolder] : [];
    }

    // Filter by owner
    items = items.filter(item => item.owner === session.user.id);

    const totalItems = items.length;
    const start = (page - 1) * limit;
    const pageItems = items.slice(start, start + limit);

    return NextResponse.json({
      items: pageItems,
      pagination: {
        current: page,
        total: Math.ceil(totalItems / limit),
        count: pageItems.length,
        totalItems,
        hasNextPage: start + limit < totalItems,
        hasPreviousPage: page > 1,
        nextCursor: null,
        limit
      }
    });
  } catch (error: any) {
    console.error('Items GET API error:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const contentType = request.headers.get('content-type');

    if (contentType?.includes('multipart/form-data')) {
      const formData = await request.formData();
      const file = formData.get('file') as File;
      const url = formData.get('url') as string;
      const parentId = formData.get('parentId') as string;
      const name = formData.get('name') as string;

      if (!name) {
        return NextResponse.json({ error: 'Name is required' }, { status: 400 });
      }

      let fileUrl = url || '/file.svg';
      let fileSize = 0;
      let mimeType = null;

      if (file) {
        const uploadResult = await uploadFileToS3(file, name, session.user.id);
        fileUrl = uploadResult.url;
        fileSize = uploadResult.size;
        mimeType = file.type;
      }

      const item = await Item.createItem({
        name,
        type: 'file',
        parentId: parentId || session.user.rootFolder,
        owner: session.user.id,
        size: fileSize,
        mimeType: mimeType,
        url: fileUrl
      });

      return NextResponse.json(item, { status: 201 });
    } else {
      const body = await request.json();
      const { name, parentId, type } = body;

      if (!name || !type) {
        return NextResponse.json({ error: 'Name and type are required' }, { status: 400 });
      }

      if (!['file', 'folder'].includes(type)) {
        return NextResponse.json({ error: 'Invalid type. Must be "file" or "folder".' }, { status: 400 });
      }

      const item = await Item.createItem({
        name,
        type: type as 'file' | 'folder',
        parentId: parentId || session.user.rootFolder,
        owner: session.user.id
      });

      return NextResponse.json(item, { status: 201 });
    }
  } catch (error: any) {
    console.error('API Error:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
} 