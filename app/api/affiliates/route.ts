import { NextRequest, NextResponse } from 'next/server';
import { Affiliate } from '@/app/models/Affiliate';
import { User } from '@/app/models/User';
import connectDB from '@/app/lib/mongodb';

export async function GET(_request: NextRequest) {
  try {
    await connectDB();
    
    const affiliates = await Affiliate.findMany({});
    
    // Enrich with affiliate user data
    const enrichedAffiliates = await Promise.all(affiliates.map(async (affiliate) => {
      const affiliateUser = await User.findById(affiliate.affiliateUser);
      return {
        ...affiliate,
        affiliateUser: affiliateUser || null
      };
    }));
    
    return NextResponse.json({ affiliates: enrichedAffiliates });
  } catch (error: any) {
    console.error('Affiliates GET API error:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}