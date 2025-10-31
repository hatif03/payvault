import { secrets } from "@/app/lib/config";

// Arc Testnet chain configuration for thirdweb/x402
// Reference: https://docs.arc.network/arc/references/connect-to-arc
export const getArcChain = () => {
  const chainIdNum = Number(secrets.ARC_CHAIN_ID || 5042002);
  return {
    id: chainIdNum,
    rpc: secrets.ARC_RPC_URL ? [secrets.ARC_RPC_URL] : ['https://rpc.testnet.arc.network'],
    nativeCurrency: { name: "USDC", symbol: "USDC", decimals: 6 },
    name: "Arc Testnet",
    testnet: true,
  } as any;
};


