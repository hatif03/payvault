import { SharedLink } from '@/app/lib/models';
import { Transaction } from '@/app/models/Transaction';
import { withErrorHandler } from '@/app/lib/utils/controllerUtils';
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/lib/backend/authConfig';

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ linkId: string }> }
) {
  return withErrorHandler(async () => {
    const params = await context.params;
    const session = await getServerSession(authOptions);

    const sharedLink = await SharedLink.findByLinkId(params.linkId);

    if (!sharedLink || !sharedLink.isActive) {
      throw new Error('Shared link not found');
    }
    
    // Manually populate item and owner data
    const item = await Item.findById(sharedLink.item);
    const owner = await User.findById(sharedLink.owner);

    // Determine access conditions
    const isOwner = session?.user?.id === sharedLink.owner?.toString();
    const requiresPayment = sharedLink?.type === 'monetized';
    const requiresAuth = requiresPayment && !session;
    
    // Check if user has already paid for this shared link
    let alreadyPaid = false;
    if (session?.user?.id && requiresPayment) {
      const existingTransaction = await Transaction.findOne({
        sharedLink: sharedLink.id,
        buyer: session.user.id,
        status: 'completed'
      });
      alreadyPaid = !!existingTransaction;
    }
    
    const canAccess = isOwner || !requiresPayment || alreadyPaid;

    // Build the link object with populated data
    const link = {
      title: sharedLink.title || '',
      description: sharedLink.description || '',
      type: sharedLink?.type || 'public',
      price: sharedLink.price || 0,
      item: item ? {
        _id: item.id,
        name: item.name,
        type: item.type,
        size: item.size,
        mimeType: item.mimeType,
        url: item.url
      } : null,
      owner: owner ? {
        _id: owner.id,
        name: owner.name,
        email: owner.email,
        wallet: owner.wallet
      } : null,
      createdAt: sharedLink.createdAt || new Date(),
      expiresAt: sharedLink.expiresAt || null,
      accessCount: sharedLink.accessCount || 0
    };

    return NextResponse.json({
      sharedLink: {
        link,
        canAccess,
        requiresPayment,
        requiresAuth,
        alreadyPaid,
        isOwner
      }
    });
  });
} 