"use client";

import { wrapFetchWithPayment } from "thirdweb/x402";
import { createThirdwebClient } from "thirdweb";
import { createWallet } from "thirdweb/wallets";

export function createFetchWithPayment(clientId: string, walletId: string) {
  const client = createThirdwebClient({ clientId });
  const wallet = createWallet(walletId);
  // connection will be handled by consumer app where appropriate
  return wrapFetchWithPayment(fetch, client, wallet);
}


