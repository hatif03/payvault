import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/app/lib/mock/mockDb'

export async function GET(_request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params
  const listing = db.listings.find(l => l._id === id)
  if (!listing) return NextResponse.json({ error: 'Listing not found' }, { status: 404 })

  const item = db.items.find(i => i._id === listing.item)
  const seller = db.users.find(u => u._id === listing.seller)

  return NextResponse.json({
    _id: listing._id,
    title: listing.title,
    description: listing.description,
    price: listing.price,
    tags: listing.tags,
    status: listing.status,
    views: listing.views,
    sellerWallet: listing.sellerWallet,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    item: item ? { name: item.name, type: item.type, size: item.size, mimeType: item.mimeType } : null,
    seller: seller ? { name: seller.name, email: seller.email } : null
  })
}
