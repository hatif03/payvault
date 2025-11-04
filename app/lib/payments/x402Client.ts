"use client";

import { wrapFetchWithPayment } from "thirdweb/x402";
import { createThirdwebClient } from "thirdweb";
import { getWallet } from "thirdweb/wallets";

/**
 * Creates a fetch function wrapped with x402 payment interceptor
 * This handles 402 Payment Required responses automatically
 * 
 * Note: For Circle developer-controlled wallets, payments are handled server-side.
 * This wrapper is only used if x402 fallback is needed (when Circle transfer fails).
 */
export async function getFetchWithPayment(walletAddress: `0x${string}`) {
  const clientId = process.env.NEXT_PUBLIC_THIRDWEB_CLIENT_ID;
  if (!clientId) {
    console.warn('NEXT_PUBLIC_THIRDWEB_CLIENT_ID not set, x402 payments will not work');
    return fetch;
  }

  try {
    const client = createThirdwebClient({ clientId });
    
    // Try to get a connected wallet (MetaMask, etc.)
    // For Circle dev-controlled wallets, users typically won't have a client-side wallet
    // This is mainly for x402 fallback scenarios
    const wallet = getWallet("io.metamask");
    
    if (!wallet) {
      // No client-side wallet available - return regular fetch
      // Server will handle payment via Circle transfer
      console.log('No client-side wallet found, payment will be handled server-side via Circle');
      return fetch;
    }

    // Check if wallet is connected
    const account = wallet.getAccount();
    if (!account) {
      console.log('Wallet not connected, payment will be handled server-side via Circle');
      return fetch;
    }

    // Use x402 wrapper for connected wallets
    return wrapFetchWithPayment(fetch, client, wallet);
  } catch (error) {
    console.error('Error setting up x402 payment wrapper:', error);
    // Fallback to regular fetch - server will handle payment via Circle
    return fetch;
  }
}


