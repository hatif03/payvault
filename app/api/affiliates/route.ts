import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/lib/backend/authConfig';
import { Affiliate } from '@/app/models/Affiliate';
import { User } from '@/app/models/User';
import { Listing } from '@/app/models/Listing';
import { SharedLink } from '@/app/models/SharedLink';
import connectDB from '@/app/lib/mongodb';

function generateAffiliateCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Excluding similar-looking chars
  let code = '';
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

export async function GET(_request: NextRequest) {
  try {
    await connectDB();
    
    const affiliates = await Affiliate.findMany({});
    
    // Enrich with affiliate user data
    const enrichedAffiliates = await Promise.all(affiliates.map(async (affiliate) => {
      const affiliateUser = await User.findById(affiliate.affiliateUser);
      return {
        ...affiliate,
        affiliateUser: affiliateUser || null
      };
    }));
    
    return NextResponse.json({ affiliates: enrichedAffiliates });
  } catch (error: any) {
    console.error('Affiliates GET API error:', error);
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
    
    const body = await request.json();
    const { listingId, sharedLinkId, affiliateUserId, commissionRate } = body;

    // Validate input
    if (!listingId && !sharedLinkId) {
      return NextResponse.json({ error: 'Either listingId or sharedLinkId is required' }, { status: 400 });
    }

    if (listingId && sharedLinkId) {
      return NextResponse.json({ error: 'Cannot specify both listingId and sharedLinkId' }, { status: 400 });
    }

    if (!affiliateUserId) {
      return NextResponse.json({ error: 'affiliateUserId is required' }, { status: 400 });
    }

    // Determine owner and validate content exists
    let ownerId: string;
    let contentId: string;

    if (listingId) {
      const listing = await Listing.findById(listingId);
      if (!listing) {
        return NextResponse.json({ error: 'Listing not found' }, { status: 404 });
      }
      ownerId = listing.seller;
      contentId = listingId;
    } else {
      const sharedLink = await SharedLink.findById(sharedLinkId);
      if (!sharedLink) {
        return NextResponse.json({ error: 'Shared link not found' }, { status: 404 });
      }
      ownerId = sharedLink.owner;
      contentId = sharedLinkId;
    }

    // Check if user is authorized (must be owner or becoming affiliate themselves)
    if (ownerId !== session.user.id && affiliateUserId !== session.user.id) {
      return NextResponse.json({ error: 'Unauthorized - You can only create affiliates for your own content or become an affiliate yourself' }, { status: 403 });
    }

    // Check if affiliate already exists
    const existingAffiliate = await Affiliate.findOne({
      ...(listingId ? { listing: listingId } : { sharedLink: sharedLinkId }),
      affiliateUser: affiliateUserId
    });

    if (existingAffiliate) {
      return NextResponse.json({ error: 'Affiliate already exists for this content and user' }, { status: 400 });
    }

    // Generate unique affiliate code
    let affiliateCode = generateAffiliateCode();
    let attempts = 0;
    while (await Affiliate.findByAffiliateCode(affiliateCode) && attempts < 10) {
      affiliateCode = generateAffiliateCode();
      attempts++;
    }

    if (attempts >= 10) {
      return NextResponse.json({ error: 'Failed to generate unique affiliate code' }, { status: 500 });
    }

    // Create affiliate
    const affiliateData: any = {
      owner: ownerId,
      affiliateUser: affiliateUserId,
      commissionRate: commissionRate || 10,
      affiliateCode: affiliateCode.toUpperCase(),
      status: 'active',
      totalEarnings: 0,
      totalSales: 0
    };

    if (listingId) {
      affiliateData.listing = listingId;
    } else {
      affiliateData.sharedLink = sharedLinkId;
    }

    const affiliate = await Affiliate.createAffiliate(affiliateData);

    return NextResponse.json({ affiliate }, { status: 201 });
  } catch (error: any) {
    console.error('Affiliates POST API error:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}