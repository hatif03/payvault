import {
  handlePaginatedRequest,
  validateMonetizedContent,
  withAuthCheck,
  withErrorHandler
} from '@/app/lib/utils/controllerUtils';
import { Item } from '@/app/models/Item';
import { SharedLink } from '@/app/models/SharedLink';
import { User } from '@/app/models/User';
import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';

function generateLinkId(): string {
  return uuidv4().replace(/-/g, '').substring(0, 16);
}

export async function GET(request: NextRequest) {
  return withErrorHandler(async () => {
    const userId = await withAuthCheck(request);
    const { searchParams } = new URL(request.url);
    const filter = searchParams.get('filter') || searchParams.get('type'); // Support both 'filter' and 'type' params
    
    const query: any = { 
      owner: userId,
      isActive: true
    };
    
    if (filter && ['public', 'monetized'].includes(filter)) {
      query.type = filter;
    }
    
    const { items: links, pagination } = await handlePaginatedRequest(
      query,
      SharedLink,
      {
        page: parseInt(searchParams.get('page') || '1'),
        limit: parseInt(searchParams.get('limit') || '20'),
        sort: { createdAt: -1 }
      }
    );
    
    // Enrich with item and owner data
    const enrichedLinks = await Promise.all(links.map(async (link) => {
      const item = await Item.findById(link.item);
      const owner = await User.findById(link.owner);
      
      return {
        ...link,
        item: item ? {
          name: item.name,
          type: item.type,
          size: item.size,
          mimeType: item.mimeType,
          url: item.url
        } : null,
        owner: owner ? {
          name: owner.name,
          email: owner.email,
          wallet: owner.wallet
        } : null
      };
    }));
    
    return NextResponse.json({ links: enrichedLinks, pagination });
  });
}

export async function POST(request: NextRequest) {
  return withErrorHandler(async () => {
    const userId = await withAuthCheck(request);
    const { itemId, type, price, title, description, expiresAt } = await request.json();
    
    if (!itemId || !type || !title) {
      throw new Error('Item ID, type, and title are required');
    }
    
    validateMonetizedContent({
      type,
      price,
      paidUsers: []
    });

    // Verify the item exists and belongs to the user
    const item = await Item.findOne({ 
      id: itemId, 
      owner: userId 
    });
    
    if (!item) {
      throw new Error('Item not found or you do not have permission to share it');
    }
    
    // Check for existing active shared link for this item
    const existingLink = await SharedLink.findOne({
      item: itemId,
      owner: userId,
      isActive: true
    });
    
    if (existingLink) {
      throw new Error('An active shared link already exists for this item');
    }
    
    const linkData = {
      item: itemId,
      owner: userId,
      linkId: generateLinkId(),
      type,
      title,
      description,
      paidUsers: [],
      ...(type === 'monetized' && { price }),
      ...(expiresAt && { expiresAt: new Date(expiresAt) })
    };
    
    // Create shared link
    const sharedLink = await SharedLink.createSharedLink(linkData);
    
    // Fetch owner data
    const owner = await User.findById(userId);
    
    // Enrich with item and owner data
    const enrichedLink = {
      ...sharedLink,
      item: {
        name: item.name,
        type: item.type,
        size: item.size,
        mimeType: item.mimeType,
        url: item.url
      },
      owner: owner ? {
        name: owner.name || userId,
        email: owner.email || userId,
        wallet: owner.wallet || userId
      } : {
        name: userId,
        email: userId,
        wallet: userId
      }
    };
    
    return NextResponse.json(enrichedLink, { status: 201 });
  });
} 