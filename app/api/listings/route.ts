import { NextRequest, NextResponse } from 'next/server'
import { Listing } from '@/app/models/Listing'
import { User } from '@/app/models/User'
import { Item } from '@/app/models/Item'
import connectDB from '@/app/lib/mongodb'

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
        seller: seller ? { name: seller.name, email: seller.email } : null,
        item: item ? { 
          name: item.name, 
          type: item.type, 
          size: item.size, 
          mimeType: item.mimeType 
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