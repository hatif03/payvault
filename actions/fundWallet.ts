"use server"
import { mockHelpers } from "@/app/lib/mock/mockDb";

export async function fundWallet(wallet: `0x${string}`) {
  const newBal = mockHelpers.fund(wallet, 1);
  return { transactionHash: "0xMOCKFAUCET", balance: newBal };
}


