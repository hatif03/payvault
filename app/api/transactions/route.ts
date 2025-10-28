import { NextRequest, NextResponse } from 'next/server'
import { Transaction } from '@/app/models/Transaction'
import connectDB from '@/app/lib/mongodb'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type')
    const limit = parseInt(searchParams.get('limit') || '50')

    await connectDB()

    let transactions = await Transaction.findMany({})

    if (type === 'purchases') {
      transactions = transactions.filter(t => t.transactionType === 'purchase')
    }
    if (type === 'sales') {
      transactions = transactions.filter(t => t.transactionType === 'sale')
    }
    if (type === 'commissions') {
      transactions = transactions.filter(t => t.transactionType === 'commission')
    }

    const sliced = transactions.slice(0, limit)
    return NextResponse.json({ transactions: sliced, total: transactions.length })
  } catch (error: any) {
    console.error('Transactions GET API error:', error)
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 })
  }
} 