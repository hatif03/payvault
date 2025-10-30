import { NextRequest, NextResponse } from 'next/server'
import { v4 as uuidv4 } from 'uuid'
import { Listing } from '@/app/models/Listing'
import { Transaction } from '@/app/models/Transaction'
import { Item } from '@/app/models/Item'
import connectDB from '@/app/lib/mongodb'
import { secrets } from '@/app/lib/config'
import { createFacilitator, settleRequestPayment } from '@/app/lib/payments/x402Server'
import { getArcChain } from '@/app/lib/payments/arcChain'

const generateReceiptNumber = (): string => {
  const timestamp = Date.now().toString(36).toUpperCase()
  const random = Math.random().toString(36).substring(2, 8).toUpperCase()
  return `RCP-${timestamp}-${random}`
}

export async function POST(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const userId = request.headers.get('x-user-id')
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { id } = await context.params
    await connectDB()
    
    const listing = await Listing.findById(id)
    if (!listing) return NextResponse.json({ error: 'Listing not found' }, { status: 404 })
    if (listing.status !== 'active') return NextResponse.json({ error: 'This listing is no longer available for purchase' }, { status: 400 })
    if (listing.seller === userId) return NextResponse.json({ error: 'You cannot purchase your own listing' }, { status: 400 })

    // thirdweb x402 settlement
    if (secrets.THIRDWEB_SECRET_KEY && secrets.SERVER_WALLET_ADDRESS) {
      const facil = createFacilitator(secrets.THIRDWEB_SECRET_KEY, secrets.SERVER_WALLET_ADDRESS as `0x${string}`)
      const payResult = await settleRequestPayment({
        resourceUrl: `${secrets.NEXTAUTH_URL}/api/listings/${id}/purchase`,
        method: 'POST',
        paymentData: request.headers.get('x-payment'),
        payTo: listing.seller as `0x${string}`,
        network: getArcChain(),
        price: `$${listing.price}`,
        facilitatorInstance: facil,
        description: `Purchase: ${listing.title}`,
      })

      if (payResult.status !== 200) {
        return new NextResponse(JSON.stringify(payResult.responseBody), {
          status: payResult.status,
          headers: payResult.responseHeaders as any,
        })
      }
    }

    const existingTransaction = await Transaction.findOne({
      listing: id,
      buyer: userId,
      status: 'completed'
    })
    if (existingTransaction) return NextResponse.json({ error: 'You have already purchased this item' }, { status: 400 })

    const paymentDetails = (() => {
      const header = request.headers.get('x-payment-response')
      try { return header ? JSON.parse(header) : { transaction: '0x', network: 'arc-testnet', payer: userId, success: true } } catch { return { transaction: '0x', network: 'arc-testnet', payer: userId, success: true } }
    })()

    const transactionData = {
      listing: listing.id,
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

    const transaction = await Transaction.create(transactionData)
    const item = await Item.findById(listing.item)

    const copiedItem = item ? { 
      id: item.id, 
      name: item.name, 
      path: `/marketplace/${item.name}` 
    } : { id: listing.item, name: 'Sample PDF.pdf', path: `/marketplace/Sample PDF.pdf` }

    return NextResponse.json({
      transactionData: {
        transaction,
        copiedItem,
        paymentDetails,
        message: 'Purchase completed successfully',
        affiliateCommission: null
      }
    }, { status: 201 })
  } catch (error: any) {
    console.error('Purchase API error:', error)
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 })
  }
} 