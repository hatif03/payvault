import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { Listing } from '@/app/models/Listing'
import { User } from '@/app/models/User'
import { Item } from '@/app/models/Item'
import connectDB from '@/app/lib/mongodb'
import { authOptions } from '@/app/lib/backend/authConfig'

async function enrichListing(listing: any) {
  const seller = listing?.seller ? await User.findById(listing.seller) : null
  const item = listing?.item ? await Item.findById(listing.item) : null
  return {
    ...listing,
    _id: listing.id, // Ensure _id is present for frontend
    seller: seller ? { name: seller.name, email: seller.email } : null,
    item: item ? { 
      _id: item.id,
      name: item.name, 
      type: item.type, 
      size: item.size, 
      mimeType: item.mimeType,
      url: item.url || null
    } : null
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const status = searchParams.get('status') || 'active'
    const tags = (searchParams.get('tags') || '').split(',').filter(Boolean)
    const sellerId = searchParams.get('sellerId')
    const search = (searchParams.get('search') || '').toLowerCase()

    await connectDB()

    // Get listings with status filter
    let listings = await Listing.findByStatus(status as any)

    // Apply additional filters
    if (tags.length > 0) {
      listings = listings.filter(l => l.tags.some(t => tags.includes(t)))
    }
    if (sellerId) {
      listings = listings.filter(l => l.seller === sellerId)
    }
    if (search) {
      listings = listings.filter(l =>
        l.title.toLowerCase().includes(search) ||
        l.description.toLowerCase().includes(search) ||
        l.tags.some(t => t.toLowerCase().includes(search))
      )
    }

    const totalItems = listings.length
    const start = (page - 1) * limit
    const pageItems = listings.slice(start, start + limit)

    // Enrich with seller and item data
    const enrichedItems = await Promise.all(pageItems.map(async (listing) => {
      const seller = await User.findById(listing.seller)
      const item = await Item.findById(listing.item)
      
      return {
        ...listing,
        _id: listing.id, // Ensure _id is present for frontend
        seller: seller ? { name: seller.name, email: seller.email } : null,
        item: item ? { 
          _id: item.id,
          name: item.name, 
          type: item.type, 
          size: item.size, 
          mimeType: item.mimeType,
          url: item.url || null
        } : null
      }
    }))

    return NextResponse.json({
      listings: enrichedItems,
      pagination: { current: page, limit, total: Math.ceil(totalItems / limit), totalItems }
    })
  } catch (error: any) {
    console.error('Listings GET API error:', error)
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 })
  }
} 

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { item: itemField, itemId, title, description, price, tags, affiliateEnabled, status } = body || {}
    const item = itemId || itemField

    if (!item || !title || !description || price === undefined) {
      return NextResponse.json({ error: 'item, title, description, and price are required' }, { status: 400 })
    }

    if (typeof price !== 'number' || price < 0) {
      return NextResponse.json({ error: 'price must be a non-negative number' }, { status: 400 })
    }

    await connectDB()

    const existingItem = await Item.findById(item)
    if (!existingItem) {
      return NextResponse.json({ error: 'Item not found' }, { status: 404 })
    }

    if (existingItem.owner !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden: item does not belong to user' }, { status: 403 })
    }

    const created = await Listing.createListing({
      item,
      seller: session.user.id,
      title,
      description,
      price,
      status,
      tags: Array.isArray(tags) ? tags : [],
      affiliateEnabled: Boolean(affiliateEnabled),
    })

    // Enrich the created listing with _id and full item data
    const enrichedCreated = await enrichListing(created)
    return NextResponse.json(enrichedCreated, { status: 201 })
  } catch (error: any) {
    console.error('Listings POST API error:', error)
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 })
  }
}