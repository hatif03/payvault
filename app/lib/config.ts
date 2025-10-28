export const secrets = {
  NEXTAUTH_URL: process.env.NEXTAUTH_URL || 'http://localhost:3000',
  NEXT_PUBLIC_HOST_NAME: process.env.NEXT_PUBLIC_HOST_NAME || 'http://localhost:3000',
  NODE_ENV: process.env.NODE_ENV || 'development',
} as const;

export const validateS3Config = (): boolean => true;

export const validateMongoConfig = (): boolean => true;

export const validateAuthConfig = (): boolean => true;
