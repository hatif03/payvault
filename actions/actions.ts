"use server";

import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/lib/backend/authConfig';
import axios from 'axios';

export async function purchaseFromMarketplace(wallet: `0x${string}`, id: string, affiliateCode?: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) throw new Error('User not authenticated');
  if (!wallet || !wallet.startsWith('0x')) throw new Error('Invalid wallet address');

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'x-user-id': session.user.id,
    'x-user-email': session.user.email || ''
  };
  if (affiliateCode) headers['x-affiliate-code'] = affiliateCode;

  const baseURL = process.env.NEXT_PUBLIC_HOST_NAME || 'http://localhost:3000';
  const url = `${baseURL}/api/listings/${id}/purchase${affiliateCode ? '?affiliateProvided=true' : ''}`;
  const res = await axios.post(url, {}, { headers, withCredentials: true });
  return res.data;
}

export async function purchaseMonetizedLink(wallet: `0x${string}`, id: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) throw new Error('User not authenticated');
  if (!wallet || !wallet.startsWith('0x')) throw new Error('Invalid wallet address');

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'x-user-id': session.user.id,
    'x-user-email': session.user.email || ''
  };

  const baseURL = process.env.NEXT_PUBLIC_HOST_NAME || 'http://localhost:3000';
  const url  = `${baseURL}/api/shared-links/${id}/purchase`;
  const res = await axios.post(url, {}, { headers, withCredentials: true });
  return res.data;
}
