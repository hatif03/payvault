export type TransferParams = {
  fromWalletId: string;
  toAddress: `0x${string}`;
  amount: string; // in USDC base units or decimal per API contract
  chainId: string;
  tokenAddress?: `0x${string}`; // USDC ERC20 if needed
};

export class CircleClient {
  private apiKey: string;
  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  // Stubs to be implemented when wiring Circle Wallets API.
  // Returns string decimal USDC (e.g., "12.34").
  async getBalance(_walletId: string, _tokenAddress?: `0x${string}`): Promise<string> {
    // TODO: Implement with Circle Wallets API balances endpoint
    return "0.00";
  }

  async transfer(_params: TransferParams): Promise<{ transactionHash?: string }> {
    // TODO: Implement with Circle Wallets API transfer endpoint
    return { transactionHash: "0xCIRCLE_TRANSFER_MOCK" };
  }
}


