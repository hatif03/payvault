# User Registration Testing Guide

## ✅ **Fixed Issues**

The user registration system has been completely updated to work with Firebase Firestore. Here's what was fixed:

### **1. Authentication System**
- **Before**: Only worked with hardcoded demo user (`demo@demo.com` / `demo123`)
- **After**: Full user registration and login with Firebase Firestore

### **2. User Registration Flow**
- **Before**: Registration was broken - only demo user could sign in
- **After**: Complete registration flow with:
  - Email validation
  - Password hashing with bcrypt
  - User creation in Firestore
  - Automatic root folder creation
  - Wallet address generation

### **3. API Endpoints**
- **New**: `/api/auth/register` - Dedicated registration endpoint
- **Updated**: Authentication system now supports both registration and login

## 🧪 **Testing Instructions**

### **Test 1: User Registration**

1. **Start the demo app**:
   ```bash
   cd demo
   npm install
   npm run dev
   ```

2. **Go to registration page**: `http://localhost:3000/auth/signup`

3. **Fill out the form**:
   - Name: `Test User`
   - Email: `test@example.com`
   - Password: `password123`

4. **Expected Result**: 
   - User should be created successfully
   - Automatically redirected to dashboard
   - User data stored in Firebase Firestore

### **Test 2: Duplicate Email Prevention**

1. **Try to register with same email again**
2. **Expected Result**: Error message "An account with this email already exists"

### **Test 3: Login with New User**

1. **Go to sign-in page**: `http://localhost:3000/auth/signin`
2. **Use the credentials from Test 1**
3. **Expected Result**: Successful login and redirect to dashboard

### **Test 4: Demo User Fallback**

1. **If Firebase is not configured**, try logging in with:
   - Email: `demo@demo.com`
   - Password: `demo123`
2. **Expected Result**: Should work with mock data

## 🔧 **Environment Setup**

### **With Firebase (Recommended)**

Create `.env.local` in the demo folder:

```env
# Firebase Configuration
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour-private-key\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project-id.iam.gserviceaccount.com
FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com

NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-messaging-sender-id
NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id

NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key
NEXT_PUBLIC_HOST_NAME=http://localhost:3000
NODE_ENV=development
```

### **Without Firebase (Mock Mode)**

The app will automatically fall back to mock mode if Firebase is not configured. You can still test with the demo user:
- Email: `demo@demo.com`
- Password: `demo123`

## 📊 **What Gets Created**

When a user registers, the system creates:

1. **User Document** in Firestore `users` collection:
   ```json
   {
     "id": "auto-generated-id",
     "email": "test@example.com",
     "name": "Test User",
     "wallet": "0x...",
     "rootFolder": "folder-id",
     "createdAt": "2024-01-01T00:00:00Z",
     "updatedAt": "2024-01-01T00:00:00Z"
   }
   ```

2. **Root Folder** in Firestore `items` collection:
   ```json
   {
     "id": "folder-id",
     "name": "test@example.com",
     "type": "folder",
     "owner": "user-id",
     "createdAt": "2024-01-01T00:00:00Z",
     "updatedAt": "2024-01-01T00:00:00Z"
   }
   ```

## 🐛 **Troubleshooting**

### **Common Issues**

1. **"Firebase not initialized"**
   - **Cause**: Missing or incorrect Firebase configuration
   - **Solution**: Check `.env.local` file and Firebase project setup

2. **"User already exists"**
   - **Cause**: Trying to register with existing email
   - **Solution**: Use different email or sign in instead

3. **"Password must be at least 6 characters"**
   - **Cause**: Password too short
   - **Solution**: Use password with 6+ characters

4. **"Registration successful but sign-in failed"**
   - **Cause**: User created but session creation failed
   - **Solution**: Try signing in manually

### **Debug Mode**

Check the browser console and server logs for detailed error messages. The app will show:
- Firebase connection status
- Registration process steps
- Any errors during user creation

## ✅ **Verification Checklist**

- [ ] User registration form works
- [ ] New users are created in Firebase Firestore
- [ ] Root folder is automatically created
- [ ] Password is properly hashed
- [ ] Duplicate email prevention works
- [ ] Login with new user works
- [ ] Demo user fallback works (if Firebase not configured)
- [ ] Error messages are user-friendly
- [ ] Redirect to dashboard after successful registration

## 🚀 **Next Steps**

After confirming user registration works:

1. **Test other features**:
   - File uploads
   - Marketplace listings
   - Transactions
   - Affiliate system

2. **Configure Firebase Security Rules** (for production)

3. **Add email verification** (optional enhancement)

4. **Implement password reset** (optional enhancement)

The user registration system is now fully functional with Firebase Firestore!








