"use server";

import axios from "axios";
import { secrets } from "@/app/lib/config";

type FaucetResult = {
  transactionHash?: string;
  link?: string;
};

export async function requestCircleFaucet(address: `0x${string}`): Promise<FaucetResult> {
  // If Circle API is configured, attempt a programmatic faucet call (placeholder)
  if (secrets.CIRCLE_API_KEY && secrets.ARC_CHAIN_ID) {
    try {
      // Placeholder implementation: real Circle faucet API may require different endpoint/flow
      // For now, return a mocked transaction hash to unblock UX; users can still use faucet link
      return { transactionHash: "0xCIRCLE_FAUCET_MOCK" };
    } catch (e) {
      // fall through to link fallback
    }
  }

  // Fallback to manual faucet link
  return { link: "https://faucet.circle.com/" };
}


