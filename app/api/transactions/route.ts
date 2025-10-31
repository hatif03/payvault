import { NextRequest, NextResponse } from 'next/server'
import { Transaction } from '@/app/models/Transaction'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type')
    const status = searchParams.get('status') as 'completed' | 'pending' | 'failed' | 'refunded' | null
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')

    let transactions = await Transaction.findMany({} as any)

    if (type === 'purchases') {
      transactions = transactions.filter(t => t.transactionType === 'purchase')
    }
    if (type === 'sales') {
      transactions = transactions.filter(t => t.transactionType === 'sale')
    }
    if (type === 'commissions') {
      transactions = transactions.filter(t => t.transactionType === 'commission')
    }
    if (status) {
      transactions = transactions.filter(t => t.status === status)
    }

    const totalItems = transactions.length
    const total = Math.max(1, Math.ceil(totalItems / limit))
    const current = Math.min(Math.max(1, page), total)
    const start = (current - 1) * limit
    const sliced = transactions.slice(start, start + limit)

    // Transform to align with frontend expectations where _id is used
    const transformed = sliced.map((t: any) => ({
      _id: t.id,
      ...t,
    }))

    return NextResponse.json({
      transactions: transformed,
      pagination: {
        current,
        total,
        count: transformed.length,
        totalItems,
      },
    })
  } catch (error: any) {
    console.error('Transactions GET API error:', error)
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 })
  }
} 