"use server";

// These actions are deprecated - use client-side purchaseListing from marketplaceFunctions instead
// They remain for backward compatibility but will be removed
// Server actions can't use x402 payment interceptor, so all purchases should go through client-side functions

export async function purchaseFromMarketplace(wallet: `0x${string}`, id: string, affiliateCode?: string) {
  throw new Error('Use client-side purchaseListing function instead. Server actions cannot handle x402 payments.');
}

export async function purchaseMonetizedLink(wallet: `0x${string}`, id: string) {
  throw new Error('Use client-side purchase function instead. Server actions cannot handle x402 payments.');
}
