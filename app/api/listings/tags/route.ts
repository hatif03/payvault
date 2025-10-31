import { Listing } from '@/app/models/Listing';
import { NextRequest, NextResponse } from 'next/server';

let tagsCache: string[] | null = null;
let lastCacheTime: number = 0;
const CACHE_DURATION = 5 * 60 * 1000;

export async function GET(request: NextRequest) {
  try {
    const now = Date.now();
    if (tagsCache && (now - lastCacheTime) < CACHE_DURATION) {
      return NextResponse.json(tagsCache);
    }

    // Compute tags from Firestore-based Listing service
    const activeListings = await Listing.findActiveListings();
    const tagCounts: Record<string, number> = {};
    for (const listing of activeListings) {
      const listTags = Array.isArray(listing.tags) ? listing.tags : [];
      for (const tag of listTags) {
        if (!tag) continue;
        tagCounts[tag] = (tagCounts[tag] || 0) + 1;
      }
    }
    const sorted = Object.entries(tagCounts)
      .filter(([, count]) => count > 0)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 100)
      .map(([tag]) => tag);

    tagsCache = sorted;
    lastCacheTime = now;
    
    return NextResponse.json(tagsCache);
  } catch (error: any) {
    console.error('GET /api/listings/tags error:', error);
    if (tagsCache) {
      console.warn('Returning cached tags due to error');
      return NextResponse.json(tagsCache);
    }
    return NextResponse.json({ error: 'Failed to fetch tags' }, { status: 500 });
  }
} 