import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/app/lib/mock/mockDb';

export async function GET(_request: NextRequest) {
  const affiliates = db.affiliates.map(aff => ({
    ...aff,
    affiliateUser: db.users.find(u => u._id === aff.affiliateUser) || null
  }));
  return NextResponse.json({ affiliates });
}