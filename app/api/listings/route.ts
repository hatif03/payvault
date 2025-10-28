import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/app/lib/mock/mockDb'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const page = parseInt(searchParams.get('page') || '1')
  const limit = parseInt(searchParams.get('limit') || '20')
  const status = searchParams.get('status') || 'active'
  const tags = (searchParams.get('tags') || '').split(',').filter(Boolean)
  const sellerId = searchParams.get('sellerId')
  const search = (searchParams.get('search') || '').toLowerCase()

  let listings = db.listings.filter(l => l.status === status)

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
  const pageItems = listings.slice(start, start + limit).map(l => ({
    ...l,
    seller: db.users.find(u => u._id === l.seller) ? { name: db.users.find(u => u._id === l.seller)!.name, email: db.users.find(u => u._id === l.seller)!.email } : null,
    item: db.items.find(i => i._id === l.item) ? { name: db.items.find(i => i._id === l.item)!.name, type: db.items.find(i => i._id === l.item)!.type, size: db.items.find(i => i._id === l.item)!.size, mimeType: db.items.find(i => i._id === l.item)!.mimeType } : null
  }))

  return NextResponse.json({
    listings: pageItems,
    pagination: { current: page, limit, total: Math.ceil(totalItems / limit), totalItems }
  })
} 