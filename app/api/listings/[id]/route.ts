import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/lib/backend/authConfig';
import { Listing } from '@/app/models/Listing';
import { Item } from '@/app/models/Item';
import { User } from '@/app/models/User';

type ListingUpdateData = {
  title?: string;
  description?: string;
  price?: number;
  status?: 'active' | 'inactive';
  tags?: string[];
};

function validateStatus(status: string | undefined): status is 'active' | 'inactive' {
  if (status === undefined) return true;
  return ['active', 'inactive'].includes(status);
}

async function enrichListing(listing: any) {
  const seller = listing?.seller ? await User.findById(listing.seller) : null;
  const item = listing?.item ? await Item.findById(listing.item) : null;
  return {
    _id: listing.id,
    ...listing,
    seller: seller ? { _id: seller.id, name: seller.name, wallet: seller.wallet } : null,
    item: item ? { name: item.name, type: item.type, size: item.size, mimeType: item.mimeType, url: item.url } : null,
  };
}

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params;
    const { searchParams } = new URL(request.url);
    const incrementView = searchParams.get('incrementView') === 'true';

    const listing = await Listing.findById(params.id);
    if (!listing) {
      return NextResponse.json({ error: 'Listing not found' }, { status: 404 });
    }

    if (incrementView) {
      const currentViews = listing.views || 0;
      await Listing.update(listing.id, { views: currentViews + 1 } as ListingUpdateData);
      listing.views = currentViews + 1;
    }

    const enriched = await enrichListing(listing);
    return NextResponse.json(enriched);
  } catch (error: any) {
    console.error('Listings [id] GET error:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const params = await context.params;
    const listing = await Listing.findById(params.id);
    if (!listing) return NextResponse.json({ error: 'Listing not found' }, { status: 404 });
    if (listing.seller !== session.user.id) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const body = await request.json();
    const { title, description, price, status, tags } = body as ListingUpdateData;
    if (!validateStatus(status)) {
      return NextResponse.json({ error: 'Invalid status. Must be active or inactive' }, { status: 400 });
    }

    const updateData: ListingUpdateData = {};
    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (price !== undefined) updateData.price = price;
    if (status !== undefined) updateData.status = status;
    if (tags !== undefined) updateData.tags = Array.isArray(tags) ? tags : [];

    const updated = await Listing.update(params.id, updateData);
    if (!updated) return NextResponse.json({ error: 'Failed to update listing' }, { status: 500 });
    const enriched = await enrichListing(updated);
    return NextResponse.json(enriched);
  } catch (error: any) {
    console.error('Listings [id] PATCH error:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const params = await context.params;
    const listing = await Listing.findById(params.id);
    if (!listing) return NextResponse.json({ error: 'Listing not found' }, { status: 404 });
    if (listing.seller !== session.user.id) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const ok = await Listing.delete(params.id);
    if (!ok) return NextResponse.json({ error: 'Failed to delete listing' }, { status: 500 });
    return NextResponse.json({ message: 'Listing deleted successfully' });
  } catch (error: any) {
    console.error('Listings [id] DELETE error:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}