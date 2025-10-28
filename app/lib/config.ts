export const secrets = {
  NEXTAUTH_URL: process.env.NEXTAUTH_URL || 'http://localhost:3000',
  NEXT_PUBLIC_HOST_NAME: process.env.NEXT_PUBLIC_HOST_NAME || 'http://localhost:3000',
  NODE_ENV: process.env.NODE_ENV || 'development',
  
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
