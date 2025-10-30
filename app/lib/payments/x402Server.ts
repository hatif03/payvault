import { createThirdwebClient } from "thirdweb";
import { facilitator, settlePayment } from "thirdweb/x402";
import type { Chain } from "thirdweb/chains";

export function createFacilitator(secretKey: string, serverWalletAddress: string) {
  const client = createThirdwebClient({ secretKey });
  return facilitator({ client, serverWalletAddress });
}

export async function settleRequestPayment(params: {
  resourceUrl: string;
  method: string;
  paymentData: string | null;
  payTo: `0x${string}`;
  network: Chain;
  price: string; // e.g. "$0.01" or "$1.00"
  facilitatorInstance: ReturnType<typeof createFacilitator>;
  description?: string;
  mimeType?: string;
  maxTimeoutSeconds?: number;
}) {
  return await settlePayment({
    resourceUrl: params.resourceUrl,
    method: params.method,
    paymentData: params.paymentData ?? undefined,
    payTo: params.payTo,
    network: params.network,
    price: params.price,
    facilitator: params.facilitatorInstance,
    routeConfig: {
      description: params.description ?? "Access to paid resource",
      mimeType: params.mimeType ?? "application/json",
      maxTimeoutSeconds: params.maxTimeoutSeconds ?? 300,
    },
  });
}


