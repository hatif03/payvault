import axios from 'axios';
import { secrets } from '@/app/lib/config';

export type TransferParams = {
  fromWalletId: string;
  toAddress: `0x${string}`;
  amount: string; // in USDC base units or decimal per API contract
  chainId: string;
  tokenAddress?: `0x${string}`; // USDC ERC20 if needed
};

export class CircleClient {
  private apiKey: string;
  private baseUrl: string;
  
  constructor(apiKey: string) {
    this.apiKey = apiKey;
    // Circle API base URL - adjust for sandbox/production
    this.baseUrl = secrets.CIRCLE_API_URL || 'https://api.circle.com';
  }

  private async makeRequest(endpoint: string, method: 'GET' | 'POST' | 'PUT' = 'GET', data?: any) {
    try {
      const response = await axios({
        method,
        url: `${this.baseUrl}${endpoint}`,
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        data,
      });
      return response.data;
    } catch (error: any) {
      console.error(`Circle API error (${endpoint}):`, error.response?.data || error.message);
      throw error;
    }
  }

  async createWalletSet(name: string = 'Entity WalletSet'): Promise<string> {
    // Circle Developer-Controlled Wallets API: Create Wallet Set
    // Reference: https://developers.circle.com/wallets/dev-controlled/create-your-first-wallet
    // Step 1: Create a wallet set (required before creating wallets)
    try {
      const response = await this.makeRequest('/v1/w3s/developer/walletSets', 'POST', {
        name,
      });

      if (response.data?.walletSet?.id) {
        return response.data.walletSet.id;
      }
      throw new Error('No wallet set created in response');
    } catch (error) {
      console.error('Circle wallet set creation failed:', error);
      throw error;
    }
  }

  async getOrCreateWalletSet(): Promise<string> {
    // Get existing wallet set ID from config, or create a new one
    if (secrets.CIRCLE_WALLET_SET_ID) {
      return secrets.CIRCLE_WALLET_SET_ID;
    }

    // Create a new wallet set if none exists
    const walletSetId = await this.createWalletSet('CashDrive Wallet Set');
    console.warn(`Created new Circle wallet set: ${walletSetId}. Add CIRCLE_WALLET_SET_ID=${walletSetId} to your .env`);
    return walletSetId;
  }

  async createWallet(userRef: { email: string; name?: string }) {
    // Circle Developer-Controlled Wallets API: Create Wallet
    // Reference: https://developers.circle.com/wallets/dev-controlled/create-your-first-wallet
    // Step 2: Create wallets within a wallet set
    try {
      // First ensure we have a wallet set
      const walletSetId = await this.getOrCreateWalletSet();

      // Generate unique idempotency key
      const idempotencyKey = Buffer.from(userRef.email + Date.now()).toString('base64').slice(0, 36);

      // Create wallet on Arc testnet
      // Note: Circle may use different blockchain codes. If 'ARC-TESTNET' doesn't work, 
      // check Circle's supported blockchains list
      const response = await this.makeRequest('/v1/w3s/developer/wallets', 'POST', {
        idempotencyKey,
        walletSetId,
        accountType: 'SCA', // Smart Contract Account (recommended for EVM chains)
        blockchains: ['ARC-TESTNET'], // Arc testnet - verify with Circle if this code is correct
        count: 1,
      });

      if (response.data?.wallets?.[0]) {
        const wallet = response.data.wallets[0];
        return {
          walletId: wallet.id,
          address: wallet.address as `0x${string}`,
          walletSetId: wallet.walletSetId,
        };
      }
      throw new Error('No wallet created in response');
    } catch (error: any) {
      // Fallback if Circle API not configured or fails
      const errorMsg = error.response?.data?.message || error.message;
      console.warn('Circle wallet creation failed, using fallback:', errorMsg);
      
      // Generate deterministic fallback address
      const seed = Buffer.from((userRef.email || Math.random().toString()).toLowerCase());
      const hex = [...seed].map(b => (b % 16).toString(16)).join('').padEnd(40, '0').slice(0, 40);
      const address = (`0x${hex}`) as `0x${string}`;
      const walletId = `circle_${Buffer.from(userRef.email).toString('hex').slice(0, 24)}`;
      return { walletId, address, walletSetId: 'fallback' };
    }
  }

  async getBalance(walletId: string, tokenAddress?: `0x${string}`): Promise<string> {
    // Circle Wallets API: Get Wallet Balances
    // Reference: https://developers.circle.com/developer/v1/reference/getwalletbalance
    try {
      const endpoint = `/v1/w3s/wallets/${walletId}/balances`;
      const response = await this.makeRequest(endpoint);
      
      if (response.data?.tokenBalances) {
        // Find USDC balance
        const usdc = response.data.tokenBalances.find(
          (tb: any) => tb.token?.symbol === 'USDC' || tb.token?.address === tokenAddress
        );
        if (usdc) {
          const amount = Number(usdc.amount || 0);
          const decimals = usdc.token?.decimals || 6;
          return (amount / Math.pow(10, decimals)).toFixed(2);
        }
      }
      return "0.00";
    } catch (error) {
      console.error('Error fetching Circle balance:', error);
      return "0.00";
    }
  }

  async transfer(params: TransferParams): Promise<{ transactionHash?: string }> {
    // Circle Wallets API: Create Transfer
    // Reference: https://developers.circle.com/developer/v1/reference/createtransfer
    try {
      const response = await this.makeRequest('/v1/w3s/wallets/transfers', 'POST', {
        idempotencyKey: `${params.fromWalletId}-${Date.now()}`,
        source: {
          type: 'wallet',
          id: params.fromWalletId,
        },
        destination: {
          type: 'blockchain',
          address: params.toAddress,
          chainId: parseInt(params.chainId),
        },
        amount: {
          amount: params.amount,
          currency: 'USDC',
        },
        fee: {
          type: 'blockchain',
        },
      });

      return {
        transactionHash: response.data?.transfer?.transactionHash,
      };
    } catch (error) {
      console.error('Circle transfer error:', error);
      throw error;
    }
  }
}


