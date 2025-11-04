# 🔍 **Debugging User Registration & Login Issue**

## 🚨 **Problem Identified**

You're experiencing:
- ✅ User registration says "user created" 
- ❌ Sign-in fails immediately after registration
- ❌ No user appears in Firebase console

## 🔧 **Debugging Steps**

I've added comprehensive logging to help identify the issue. Follow these steps:

### **1. Test Registration with Debug Logs**

1. **Open your browser's Developer Tools** (F12)
2. **Go to Console tab**
3. **Try registering a new user** at `http://localhost:3000/auth/signup`
4. **Watch the console logs** - you should see:

```
Creating user with data: { email: "test@example.com", name: "Test User", wallet: "0x..." }
User created successfully: [user-id]
Root folder updated with owner: [user-id]
Attempting login for: test@example.com
Finding user by email: test@example.com
findOne query for users: { email: "test@example.com" }
Adding filter: email == test@example.com
Query result for users: No results / 1 results
```

### **2. Check Firebase Console**

1. **Go to Firebase Console** → Firestore Database
2. **Look for a `users` collection**
3. **Check if documents are being created**

### **3. Common Issues & Solutions**

#### **Issue A: Firestore Not Initialized**
**Console shows:**
```
Firebase configuration is incomplete. Using mock mode.
Firestore not initialized, using mock mode for users
```

**Solution:** Check your `.env.local` file has all Firebase variables:
```bash
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxx@your-project.iam.gserviceaccount.com
FIREBASE_STORAGE_BUCKET=your-project.appspot.com
```

#### **Issue B: User Created but Not Found**
**Console shows:**
```
User created successfully: [id]
findOne query for users: { email: "test@example.com" }
Query result for users: No results
```

**Possible causes:**
1. **Firestore indexing** - New documents might not be immediately queryable
2. **Case sensitivity** - Email case mismatch
3. **Firestore rules** - Read permissions issue

#### **Issue C: Password Verification Fails**
**Console shows:**
```
User found: Yes
Verifying password for user: test@example.com
Password valid: false
```

**Solution:** Check if password hashing is working correctly.

## 🛠️ **Quick Fixes to Try**

### **Fix 1: Add Small Delay**
Add a small delay between registration and login:

```typescript
// In SignUpForm.tsx, after successful registration:
await new Promise(resolve => setTimeout(resolve, 1000)); // 1 second delay
const result = await signIn('credentials', { ... });
```

### **Fix 2: Check Email Case**
Ensure email is consistently lowercased:

```typescript
// In registration API:
email: email.toLowerCase().trim()
```

### **Fix 3: Verify Firebase Connection**
Test Firebase connection:

```typescript
// Add to any API route:
const firestore = getFirestoreInstance();
console.log('Firestore instance:', firestore ? 'Connected' : 'Not connected');
```

## 📊 **Expected Console Output (Success)**

**Registration:**
```
Creating user with data: { email: "test@example.com", name: "Test User", wallet: "0x..." }
User created successfully: abc123
Root folder updated with owner: abc123
```

**Login:**
```
Attempting login for: test@example.com
Finding user by email: test@example.com
findOne query for users: { email: "test@example.com" }
Adding filter: email == test@example.com
Query result for users: 1 results
Found document in users: abc123
Verifying password for user: test@example.com
Password valid: true
Login successful for: test@example.com
```

## 🚀 **Next Steps**

1. **Run the test** with debug logs enabled
2. **Share the console output** with me
3. **Check Firebase Console** for user documents
4. **Try the quick fixes** if needed

The debug logs will help us identify exactly where the issue is occurring!








