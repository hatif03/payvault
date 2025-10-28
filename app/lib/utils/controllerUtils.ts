import { authOptions } from '@/app/lib/backend/authConfig';
import connectDB from '@/app/lib/mongodb';
import { getServerSession } from 'next-auth/next';
import { NextRequest, NextResponse } from 'next/server';
import { withFirestoreTransaction } from '../firestoreTransaction';

export interface PaginationParams {
  page?: number;
  limit?: number;
  sort?: { [key: string]: 'asc' | 'desc' };
}

export interface PaginationResult<T> {
  items: T[];
  pagination: {
    current: number;
    total: number;
    count: number;
    totalItems: number;
  };
}

export async function handlePaginatedRequest<T>(
  query: any,
  service: any, // FirestoreService instance
  params: PaginationParams = {}
): Promise<PaginationResult<T>> {
  const page = parseInt(String(params.page || '1'));
  const limit = parseInt(String(params.limit || '20'));
  const skip = (page - 1) * limit;

  await connectDB();

  try {
    // Get all items matching the query
    const allItems = await service.findMany(query);
    
    // Apply sorting if provided
    let sortedItems = allItems;
    if (params.sort) {
      sortedItems = allItems.sort((a: any, b: any) => {
        for (const [field, direction] of Object.entries(params.sort!)) {
          const aVal = a[field];
          const bVal = b[field];
          
          if (aVal < bVal) return direction === 'asc' ? -1 : 1;
          if (aVal > bVal) return direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }

    // Apply pagination
    const paginatedItems = sortedItems.slice(skip, skip + limit);

    return {
      items: paginatedItems,
      pagination: {
        current: page,
        total: Math.ceil(allItems.length / limit),
        count: paginatedItems.length,
        totalItems: allItems.length
      }
    };
  } catch (error) {
    console.error('Error in paginated request:', error);
    return {
      items: [],
      pagination: {
        current: page,
        total: 0,
        count: 0,
        totalItems: 0
      }
    };
  }
}

export async function withErrorHandler(
  handler: () => Promise<NextResponse>,
  customErrorMap?: Record<string, number>
): Promise<NextResponse> {
  try {
    return await handler();
  } catch (error: any) {
    console.error('API error:', error);
    
    const defaultErrorMap: Record<string, number> = {
      'not found': 404,
      'expired': 410,
      'already exists': 409,
      'Unauthorized': 401,
      'Payment required': 402,
    };

    const errorMap = { ...defaultErrorMap, ...customErrorMap };
    let status = 500;

    for (const [message, code] of Object.entries(errorMap)) {
      if (error.message.includes(message)) {
        status = code;
        break;
      }
    }

    return NextResponse.json({ error: error.message || 'Internal server error' }, { status });
  }
}

export async function withAuthCheck(request: NextRequest): Promise<string> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    throw new Error('Unauthorized');
  }
  return session.user.id;
}

export async function withTransaction<T>(
  handler: (transaction: any) => Promise<T>
): Promise<T> {
  return withFirestoreTransaction(handler);
}

export interface MonetizedContent {
  type: 'public' | 'monetized';
  price?: number;
  paidUsers: string[];
}

export function validateMonetizedContent(content: MonetizedContent) {
  if (!['public', 'monetized'].includes(content?.type)) {
    throw new Error('Type must be either "public" or "monetized"');
  }

  if (content?.type === 'monetized' && (!content.price || typeof content.price !== 'number' || content.price <= 0)) {
    throw new Error('Price is required for monetized content and must be greater than 0');
  }
}

export function createAccessResponse(
  content: any,
  isMonetized: boolean,
  userId?: string
) {
  // Check if user is the owner
  const isOwner = userId && content.owner && content.owner === userId;

  // Owner or paid users can access
  if (isOwner || !isMonetized || (userId && content.paidUsers.some((paidUserId: any) => paidUserId === userId))) {
    return {
      link: content,
      canAccess: true,
      requiresPayment: false,
      ...(isMonetized && !isOwner && { alreadyPaid: true }),
      ...(isOwner && { isOwner: true })
    };
  }

  const limitedInfo = {
    id: content.id,
    title: content.title,
    description: content.description,
    type: content?.type,
    price: content.price,
    owner: content.owner,
    item: content.item ? {
      name: content.item.name,
      type: content.item?.type,
      size: content.item.size
    } : undefined
  };

  return {
    link: limitedInfo,
    canAccess: false,
    requiresPayment: true,
    requiresAuth: !userId
  };
} 