export const secrets = {
  NEXTAUTH_URL: process.env.NEXTAUTH_URL || 'http://localhost:3000',
  NEXT_PUBLIC_HOST_NAME: process.env.NEXT_PUBLIC_HOST_NAME || 'http://localhost:3000',
  NODE_ENV: process.env.NODE_ENV || 'development',
  
  // Circle / Arc Configuration
  CIRCLE_API_KEY: process.env.CIRCLE_API_KEY || '',
  CIRCLE_APP_ID: process.env.CIRCLE_APP_ID || '',
  CIRCLE_WALLET_ID: process.env.CIRCLE_WALLET_ID || '',
  CIRCLE_WALLET_SET_ID: process.env.CIRCLE_WALLET_SET_ID || '',
  CIRCLE_API_URL: process.env.CIRCLE_API_URL || 'https://api.circle.com',
  
  // Arc Testnet Configuration (from https://docs.arc.network/arc/references/connect-to-arc)
  ARC_RPC_URL: process.env.ARC_RPC_URL || 'https://rpc.testnet.arc.network',
  ARC_CHAIN_ID: process.env.ARC_CHAIN_ID || '5042002',
  ARC_USDC_CONTRACT_ADDRESS: process.env.ARC_USDC_CONTRACT_ADDRESS || '',
  
  // Public Arc config (for client-side access)
  NEXT_PUBLIC_ARC_RPC_URL: process.env.NEXT_PUBLIC_ARC_RPC_URL || 'https://rpc.testnet.arc.network',
  NEXT_PUBLIC_ARC_USDC_CONTRACT_ADDRESS: process.env.NEXT_PUBLIC_ARC_USDC_CONTRACT_ADDRESS || '',

  // thirdweb x402 configuration
  THIRDWEB_CLIENT_ID: process.env.THIRDWEB_CLIENT_ID || '',
  THIRDWEB_SECRET_KEY: process.env.THIRDWEB_SECRET_KEY || '',
  SERVER_WALLET_ADDRESS: process.env.SERVER_WALLET_ADDRESS || '',
  
  // Firebase Configuration
  FIREBASE_PROJECT_ID: process.env.FIREBASE_PROJECT_ID || '',
  FIREBASE_PRIVATE_KEY: process.env.FIREBASE_PRIVATE_KEY || '',
  FIREBASE_CLIENT_EMAIL: process.env.FIREBASE_CLIENT_EMAIL || '',
  FIREBASE_STORAGE_BUCKET: process.env.FIREBASE_STORAGE_BUCKET || '',
  
  // Firebase Client Config (for frontend)
  NEXT_PUBLIC_FIREBASE_API_KEY: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || '',
  NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || '',
  NEXT_PUBLIC_FIREBASE_PROJECT_ID: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || '',
  NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || '',
  NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '',
  NEXT_PUBLIC_FIREBASE_APP_ID: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || '',
} as const;

export const validateS3Config = (): boolean => true;

export const validateMongoConfig = (): boolean => true;

export const validateAuthConfig = (): boolean => true;

export const validateFirebaseConfig = (): boolean => {
  return !!(
    secrets.FIREBASE_PROJECT_ID &&
    secrets.FIREBASE_PRIVATE_KEY &&
    secrets.FIREBASE_CLIENT_EMAIL &&
    secrets.FIREBASE_STORAGE_BUCKET
  );
};

export const validateFirebaseClientConfig = (): boolean => {
  return !!(
    secrets.NEXT_PUBLIC_FIREBASE_API_KEY &&
    secrets.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN &&
    secrets.NEXT_PUBLIC_FIREBASE_PROJECT_ID &&
    secrets.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET &&
    secrets.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID &&
    secrets.NEXT_PUBLIC_FIREBASE_APP_ID
  );
};
