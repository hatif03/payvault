import { secrets } from "@/app/lib/config";

// Minimal chain object for thirdweb/x402
export const getArcChain = () => {
  const chainIdNum = Number(secrets.ARC_CHAIN_ID || 0);
  return {
    id: chainIdNum,
    rpc: secrets.ARC_RPC_URL ? [secrets.ARC_RPC_URL] : [],
    nativeCurrency: { name: "USDC", symbol: "USDC", decimals: 6 },
    name: "Arc Testnet",
    testnet: true,
  } as any;
};


