# Demo: Circle + Arc + thirdweb x402

This demo is wired to use Arc for USDC balances, thirdweb x402 for payments, and a Circle wrapper for transfers/faucet scaffolding.

## Env setup (copy to demo/.env.local)

```
NEXTAUTH_URL=http://localhost:3000
NEXT_PUBLIC_HOST_NAME=http://localhost:3000
NODE_ENV=development

# Arc Testnet (from https://docs.arc.network/arc/references/connect-to-arc)
# Server-side (for API routes)
ARC_RPC_URL=https://rpc.testnet.arc.network
ARC_CHAIN_ID=5042002
ARC_USDC_CONTRACT_ADDRESS=USDC_CONTRACT_ON_ARC  # Get from https://docs.arc.network/arc/references/contract-addresses#usdc

# Client-side (required for wallet component)
NEXT_PUBLIC_ARC_RPC_URL=https://rpc.testnet.arc.network
NEXT_PUBLIC_ARC_USDC_CONTRACT_ADDRESS=USDC_CONTRACT_ON_ARC  # Same as ARC_USDC_CONTRACT_ADDRESS

# thirdweb x402
THIRDWEB_CLIENT_ID=YOUR_THIRDWEB_CLIENT_ID
THIRDWEB_SECRET_KEY=YOUR_THIRDWEB_SECRET_KEY
SERVER_WALLET_ADDRESS=0xYourServerPayoutWallet

# Circle Wallets API Configuration (from https://developers.circle.com/wallets/dev-controlled/create-your-first-wallet)
# Get API key from: https://developers.circle.com/
CIRCLE_API_KEY=YOUR_CIRCLE_API_KEY
CIRCLE_WALLET_SET_ID=YOUR_WALLET_SET_ID  # Created automatically on first use, but recommended to set manually
CIRCLE_API_URL=https://api.circle.com  # Use https://api-sandbox.circle.com for testnet
```

## Key parts
- Wallet balance (USDC on Arc): `app/components/wallet/walletComp.tsx`
- x402 server settlement: `app/api/listings/[id]/purchase/route.ts`, `app/api/shared-links/[linkId]/purchase/route.ts`
- x402 client util: `app/lib/payments/x402Client.ts`
- x402 server util: `app/lib/payments/x402Server.ts`
- Arc chain helper: `app/lib/payments/arcChain.ts`
- Circle transfer PoC: `actions/circle.ts` + button in wallet modal
- Circle faucet scaffolding: `app/lib/circle/faucet.ts`, used by `actions/fundWallet.ts`

## Testing
1) `npm run dev` in demo
2) Sign in and open the wallet modal (button on pages)
3) Fund with Circle (mock) to increment demo balance, or use Circle faucet link
4) Use "Send 0.01 USDC (Circle PoC)" if Circle env set; balance will refresh
5) Purchase a listing/shared link to trigger thirdweb x402 settlement

## References
- thirdweb x402: https://portal.thirdweb.com/payments/x402
- Circle Docs: https://developers.circle.com/
- CCTP: https://www.circle.com/cross-chain-transfer-protocol
- Bridge Kit: https://developers.circle.com/bridge-kit
- Arc USDC Addresses: https://docs.arc.network/arc/references/contract-addresses#usdc
