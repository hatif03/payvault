import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/app/lib/mock/mockDb'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const type = searchParams.get('type')
  const limit = parseInt(searchParams.get('limit') || '50')

  let transactions = db.transactions
  if (type === 'purchases') transactions = transactions.filter(t => t.transactionType === 'purchase')
  if (type === 'sales') transactions = transactions.filter(t => t.transactionType === 'sale')
  if (type === 'commissions') transactions = transactions.filter(t => t.transactionType === 'commission')

  const sliced = transactions.slice(0, limit)
  return NextResponse.json({ transactions: sliced, total: transactions.length })
} 