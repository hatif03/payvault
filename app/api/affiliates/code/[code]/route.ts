import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/app/lib/mock/mockDb';

export async function GET(_request: NextRequest, context: { params: Promise<{ code: string }> }) {
  const { code } = await context.params;
  const affiliate = db.affiliates.find(a => a.affiliateCode === code);
  
  if (!affiliate) {
    return NextResponse.json({ error: 'Affiliate not found' }, { status: 404 });
  }
  
  return NextResponse.json({ 
    affiliate: {
      ...affiliate,
      affiliateUser: db.users.find(u => u._id === affiliate.affiliateUser)
    }
  });
}