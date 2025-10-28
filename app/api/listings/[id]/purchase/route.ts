import { NextRequest, NextResponse } from 'next/server'
import { v4 as uuidv4 } from 'uuid'
import { db } from '@/app/lib/mock/mockDb'

const generateReceiptNumber = (): string => {
  const timestamp = Date.now().toString(36).toUpperCase()
  const random = Math.random().toString(36).substring(2, 8).toUpperCase()
  return `RCP-${timestamp}-${random}`
}

export async function POST(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const userId = request.headers.get('x-user-id')
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await context.params
  const listing = db.listings.find(l => l._id === id)
  if (!listing) return NextResponse.json({ error: 'Listing not found' }, { status: 404 })
  if (listing.status !== 'active') return NextResponse.json({ error: 'This listing is no longer available for purchase' }, { status: 400 })
  if (listing.seller === userId) return NextResponse.json({ error: 'You cannot purchase your own listing' }, { status: 400 })

  const exists = db.transactions.find(t => t.listing === id && t.buyer === userId && t.status === 'completed')
  if (exists) return NextResponse.json({ error: 'You have already purchased this item' }, { status: 400 })

  const paymentDetails = {
    transaction: '0xMOCKTX',
    network: 'base-sepolia',
    payer: userId,
    success: true
  }

  const transaction = {
    _id: uuidv4(),
    listing: listing._id,
    buyer: userId,
    seller: listing.seller,
    item: listing.item,
    amount: listing.price,
    status: 'completed' as const,
    transactionId: uuidv4(),
    receiptNumber: generateReceiptNumber(),
    purchaseDate: new Date(),
    transactionType: 'purchase' as const,
    paymentFlow: 'direct' as const,
    metadata: paymentDetails
  }
  db.transactions.push(transaction)

  const copiedItem = { _id: listing.item, name: 'Sample PDF.pdf', path: `/marketplace/Sample PDF.pdf` }

  return NextResponse.json({
    transactionData: {
      transaction,
      copiedItem,
      paymentDetails,
      message: 'Purchase completed successfully',
      affiliateCommission: null
    }
  }, { status: 201 })
} 