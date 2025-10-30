"use server"
import { mockHelpers } from "@/app/lib/mock/mockDb";
import { requestCircleFaucet } from "@/app/lib/circle/faucet";

export async function fundWallet(wallet: `0x${string}`) {
  // Try Circle faucet first (mocked transaction hash for now)
  const circle = await requestCircleFaucet(wallet);
  if (circle.transactionHash) {
    const newBal = mockHelpers.fund(wallet, 1);
    return { transactionHash: circle.transactionHash, balance: newBal };
  }

  // Fallback to mock funding + provide manual faucet link if available
  const newBal = mockHelpers.fund(wallet, 1);
  return { transactionHash: "0xMOCKFAUCET", balance: newBal, link: circle.link } as any;
}


