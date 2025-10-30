"use server";

import { secrets } from "@/app/lib/config";
import { CircleClient } from "@/app/lib/circle/circleClient";

export async function circleTransferPoc(to: `0x${string}`, amountUsdc: number) {
  if (!secrets.CIRCLE_API_KEY || !secrets.CIRCLE_WALLET_ID) {
    return { ok: false, reason: "Missing Circle config" };
  }
  const client = new CircleClient(secrets.CIRCLE_API_KEY);
  const res = await client.transfer({
    fromWalletId: secrets.CIRCLE_WALLET_ID,
    toAddress: to,
    amount: amountUsdc.toFixed(2),
    chainId: secrets.ARC_CHAIN_ID,
    tokenAddress: secrets.ARC_USDC_CONTRACT_ADDRESS as `0x${string}`,
  });
  return { ok: true, tx: res.transactionHash ?? null };
}


