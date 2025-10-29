# Firebase Migration Guide

This demo folder has been migrated from AWS S3 + MongoDB to Firebase Firestore + Firebase Storage.

## What's Changed

### 1. Dependencies
- **Added**: `firebase` and `firebase-admin` packages
- **Removed**: `@aws-sdk/client-s3`, `@aws-sdk/s3-request-presigner`, `mongoose`

### 2. Configuration
- **New**: Firebase configuration in `app/lib/config.ts`
- **New**: Firebase Admin SDK setup in `app/lib/firebase.ts`
- **New**: Firebase Client SDK setup in `app/lib/firebaseClient.ts`

### 3. Database Layer
- **Replaced**: MongoDB/Mongoose models with Firestore services
- **New**: `app/lib/firestoreService.ts` - Base service class for Firestore operations
- **New**: `app/lib/firestoreTransaction.ts` - Transaction utilities
- **Updated**: All models in `app/models/` now use Firestore

### 4. Storage Layer
- **Replaced**: AWS S3 with Firebase Storage
- **Updated**: `app/lib/s3.ts` now uses Firebase Storage (kept same interface for compatibility)

### 5. API Routes
- **Updated**: `app/api/user/route.ts` as an example of using new Firestore models
- **Updated**: `app/lib/utils/controllerUtils.ts` for Firestore compatibility

## Setup Instructions

### 1. Create Firebase Project
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project
3. Enable Firestore Database
4. Enable Firebase Storage

### 2. Generate Service Account Key
1. Go to Project Settings > Service Accounts
2. Click "Generate new private key"
3. Download the JSON file

### 3. Get Web App Configuration
1. Go to Project Settings > General
2. Scroll to "Your apps" section
3. Add a web app if you haven't already
4. Copy the configuration values

### 4. Environment Variables
Create a `.env.local` file with:

```env
# Firebase Admin SDK Configuration (Server-side)
FIREBASE_PROJECT_ID=your-firebase-project-id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour private key here\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project-id.iam.gserviceaccount.com
FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com

# Firebase Client Configuration (Frontend)
NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-firebase-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-messaging-sender-id
NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id

# NextAuth Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-nextauth-secret-key

# Application Configuration
NEXT_PUBLIC_HOST_NAME=http://localhost:3000
NODE_ENV=development
```

### 5. Install Dependencies
```bash
cd demo
npm install
```

### 6. Run the Application
```bash
npm run dev
```

## Key Differences from MongoDB

### 1. Document Structure
- **MongoDB**: Uses `_id` field
- **Firestore**: Uses `id` field (automatically generated)

### 2. References
- **MongoDB**: Uses `ObjectId` references
- **Firestore**: Uses document ID strings as references

### 3. Queries
- **MongoDB**: Complex queries with aggregation
- **Firestore**: Simpler queries (some limitations on complex queries)

### 4. Transactions
- **MongoDB**: Session-based transactions
- **Firestore**: Transaction-based operations

## Migration Benefits

1. **Unified Platform**: Single platform for database, storage, and authentication
2. **Real-time Updates**: Built-in real-time capabilities
3. **Scalability**: Automatic scaling without server management
4. **Security**: Built-in security rules
5. **Cost Efficiency**: Pay-per-use model
6. **Developer Experience**: Better tooling and documentation

## Testing the Migration

The demo app includes fallback mechanisms:
- If Firebase is not configured, it falls back to mock mode
- All operations will work with mock data
- Check console logs for Firebase connection status

## Next Steps

1. **Test all functionality** with Firebase configured
2. **Update remaining API routes** to use Firestore models
3. **Implement Firestore security rules**
4. **Add real-time listeners** where needed
5. **Migrate production data** from MongoDB to Firestore
6. **Update deployment configuration**

## Troubleshooting

### Common Issues
1. **Firebase not initialized**: Check environment variables
2. **Permission denied**: Verify service account permissions
3. **Storage bucket not found**: Ensure bucket exists and is accessible
4. **Query limitations**: Some complex queries may need restructuring

### Debug Mode
Set `NODE_ENV=development` to see detailed logs and fallback to mock mode when Firebase is not available.


