import {
  createAccessResponse,
  withAuthCheck,
  withErrorHandler,
  withTransaction
} from '@/app/lib/utils/controllerUtils';
import { copyItemToUserDrive } from '@/app/lib/utils/itemUtils';
import { SharedLink } from '@/app/models/SharedLink';
import { Item } from '@/app/models/Item';
import { User } from '@/app/models/User';
import { NextRequest, NextResponse } from 'next/server';

async function getAndValidateLink(linkId: string, session?: any) {
  const sharedLink = await SharedLink.findByLinkId(linkId);
  
  if (!sharedLink || !sharedLink.isActive) {
    throw new Error('Link not found or expired');
  }
  
  if (sharedLink.expiresAt && new Date(sharedLink.expiresAt) < new Date()) {
    throw new Error('Link has expired');
  }

  if (!['public', 'monetized'].includes(sharedLink?.type)) {
    throw new Error('Invalid link type');
  }
  
  // Manually populate item and owner data
  const item = await Item.findById(sharedLink.item);
  const owner = await User.findById(sharedLink.owner);
  
  return {
    ...sharedLink,
    item: item ? {
      _id: item.id,
      name: item.name,
      type: item.type,
      size: item.size,
      mimeType: item.mimeType,
      url: item.url
    } : null,
    owner: sharedLink.owner, // Keep owner as ID string for createAccessResponse
    ownerData: owner ? {
      _id: owner.id,
      name: owner.name,
      email: owner.email,
      wallet: owner.wallet
    } : null
  };
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ linkId: string }> }
) {
  return withErrorHandler(async () => {
    const { linkId } = await params;
    const sharedLink = await getAndValidateLink(linkId);
    
    // Increment access count
    const currentCount = sharedLink.accessCount || 0;
    await SharedLink.update(sharedLink.id, { accessCount: currentCount + 1 } as any);
    
    let userId;
    try {
      userId = await withAuthCheck(request);
    } catch (error) {
    }
    
    return NextResponse.json(
      createAccessResponse(sharedLink, sharedLink?.type === 'monetized', userId)
    );
  }, {
    'expired': 410,
    'not found or expired': 404,
    'Invalid link type': 400
  });
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ linkId: string }> }
) {
  return withErrorHandler(async () => {
    const userId = await withAuthCheck(request);
    const { linkId } = await params;
    
    return await withTransaction(async (session) => {
      const sharedLink = await getAndValidateLink(linkId);
      
      if (sharedLink?.type === 'monetized' && 
          !sharedLink.paidUsers.some((paidUserId: any) => paidUserId.toString() === userId)) {
        throw new Error('Payment required to access this content');
      }
      
      // Get item data for copying
      const itemData = typeof sharedLink.item === 'string' 
        ? await Item.findById(sharedLink.item)
        : sharedLink.item;
      
      if (!itemData) {
        throw new Error('Item not found');
      }
      
      const copiedItem = await copyItemToUserDrive(userId, itemData);
      
      const itemName = typeof sharedLink.item === 'object' && sharedLink.item?.name 
        ? sharedLink.item.name 
        : itemData?.name || 'Item';
      
      return NextResponse.json({
        success: true,
        message: `${itemName} has been added to your drive in the 'shared' folder`,
        copiedItem
      });
    });
  }, {
    'expired': 410,
    'not found or expired': 404,
    'Payment required': 402
  });
} 