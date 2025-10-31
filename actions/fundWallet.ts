"use server"
import { requestCircleFaucet } from "@/app/lib/circle/faucet";

export async function fundWallet(wallet: `0x${string}`) {
  // Real funding should be done via Circle faucet or onramp. We return faucet link.
  const circle = await requestCircleFaucet(wallet);
  if (circle.link) {
    return { link: circle.link } as any;
  }
  // If programmatic faucet becomes available, return its tx hash here
  return { error: 'Funding unavailable. Use faucet.' } as any;
}


