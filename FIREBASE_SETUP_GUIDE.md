# Firebase Setup Guide for Demo Folder

## Step 1: Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Create a project" or "Add project"
3. Enter project name: `cashdrive-demo` (or any name you prefer)
4. Enable Google Analytics (optional)
5. Click "Create project"

## Step 2: Enable Required Services

### Enable Firestore Database
1. In Firebase Console, go to "Firestore Database"
2. Click "Create database"
3. Choose "Start in test mode" (for demo purposes)
4. Select a location (choose closest to your users)
5. Click "Done"

### Enable Firebase Storage
1. In Firebase Console, go to "Storage"
2. Click "Get started"
3. Choose "Start in test mode" (for demo purposes)
4. Select same location as Firestore
5. Click "Done"

## Step 3: Create Web App

1. In Firebase Console, go to Project Settings (gear icon)
2. Scroll down to "Your apps" section
3. Click "Add app" and select Web (</>) icon
4. Enter app nickname: `cashdrive-demo-web`
5. Check "Also set up Firebase Hosting" (optional)
6. Click "Register app"
7. Copy the configuration object (you'll need this for env variables)

## Step 4: Generate Service Account Key

1. In Firebase Console, go to Project Settings
2. Click "Service accounts" tab
3. Click "Generate new private key"
4. Click "Generate key" in the popup
5. Download the JSON file (keep it secure!)

## Step 5: Set Up Environment Variables

Create a `.env.local` file in the demo folder with the following content:

```env
# Firebase Admin SDK Configuration (Server-side)
FIREBASE_PROJECT_ID=your-project-id-here
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour-private-key-content-here\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project-id.iam.gserviceaccount.com
FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com

# Firebase Client Configuration (Frontend)
NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key-here
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id-here
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-messaging-sender-id
NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id-here

# NextAuth Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-random-secret-key-here

# Application Configuration
NEXT_PUBLIC_HOST_NAME=http://localhost:3000
NODE_ENV=development
```

## Step 6: Extract Values from Firebase

### From Service Account JSON:
- `FIREBASE_PROJECT_ID` = `project_id` field
- `FIREBASE_PRIVATE_KEY` = `private_key` field (keep the quotes and \n characters)
- `FIREBASE_CLIENT_EMAIL` = `client_email` field
- `FIREBASE_STORAGE_BUCKET` = `project_id` + `.appspot.com`

### From Web App Config:
- `NEXT_PUBLIC_FIREBASE_API_KEY` = `apiKey` field
- `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` = `authDomain` field
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID` = `projectId` field
- `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` = `storageBucket` field
- `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` = `messagingSenderId` field
- `NEXT_PUBLIC_FIREBASE_APP_ID` = `appId` field

## Step 7: Generate NextAuth Secret

Run this command to generate a secure secret:
```bash
openssl rand -base64 32
```

Or use an online generator: https://generate-secret.vercel.app/32

## Step 8: Test the Setup

1. Install dependencies:
```bash
cd demo
npm install
```

2. Start the development server:
```bash
npm run dev
```

3. Check the console for Firebase connection status
4. Visit http://localhost:3000 to test the application

## Security Rules (Optional for Demo)

### Firestore Rules (for production):
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can read/write their own data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Items are readable by owner, writable by owner
    match /items/{itemId} {
      allow read, write: if request.auth != null && 
        resource.data.owner == request.auth.uid;
    }
    
    // Listings are readable by all, writable by seller
    match /listings/{listingId} {
      allow read: if true;
      allow write: if request.auth != null && 
        resource.data.seller == request.auth.uid;
    }
  }
}
```

### Storage Rules (for production):
```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /uploads/{userId}/{allPaths=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

## Troubleshooting

### Common Issues:
1. **"Firebase not initialized"**: Check if all environment variables are set correctly
2. **"Permission denied"**: Verify service account has proper permissions
3. **"Storage bucket not found"**: Ensure bucket exists and name is correct
4. **"Invalid private key"**: Make sure private key includes \n characters and quotes

### Debug Mode:
The app will automatically fall back to mock mode if Firebase is not properly configured. Check the console logs for connection status.

## Example Complete .env.local

Here's a complete example (replace with your actual values):

```env
# Firebase Admin SDK Configuration
FIREBASE_PROJECT_ID=cashdrive-demo-12345
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC...\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-abc123@cashdrive-demo-12345.iam.gserviceaccount.com
FIREBASE_STORAGE_BUCKET=cashdrive-demo-12345.appspot.com

# Firebase Client Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyBxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=cashdrive-demo-12345.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=cashdrive-demo-12345
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=cashdrive-demo-12345.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789012
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789012:web:abcdef1234567890

# NextAuth Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-super-secret-key-here-make-it-long-and-random

# Application Configuration
NEXT_PUBLIC_HOST_NAME=http://localhost:3000
NODE_ENV=development
```

That's it! Your demo folder should now be fully configured with Firebase.









