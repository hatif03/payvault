# Demo: Circle + Arc + thirdweb x402

This demo is wired to use Arc for USDC balances, thirdweb x402 for payments, and a Circle wrapper for transfers/faucet scaffolding.

## Env setup (copy to demo/.env.local)

```
NEXTAUTH_URL=http://localhost:3000
NEXT_PUBLIC_HOST_NAME=http://localhost:3000
NODE_ENV=development

# Arc Network
ARC_RPC_URL=YOUR_ARC_TESTNET_RPC
ARC_CHAIN_ID=YOUR_ARC_CHAIN_ID
ARC_USDC_CONTRACT_ADDRESS=USDC_CONTRACT_ON_ARC

# thirdweb x402
THIRDWEB_CLIENT_ID=YOUR_THIRDWEB_CLIENT_ID
THIRDWEB_SECRET_KEY=YOUR_THIRDWEB_SECRET_KEY
SERVER_WALLET_ADDRESS=0xYourServerPayoutWallet

# Circle (optional, for PoC transfer)
CIRCLE_API_KEY=YOUR_CIRCLE_API_KEY
CIRCLE_APP_ID=YOUR_CIRCLE_APP_ID
CIRCLE_WALLET_ID=YOUR_CIRCLE_WALLET_ID
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
