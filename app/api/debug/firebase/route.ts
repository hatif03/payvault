import { NextRequest, NextResponse } from 'next/server';
import { getFirestoreInstance } from '@/app/lib/firebase';
import { User } from '@/app/models/User';
import connectDB from '@/app/lib/mongodb';

export async function GET() {
  try {
    console.log('=== Firebase Debug Test ===');
    
    // Test Firebase connection
    const firestore = getFirestoreInstance();
    console.log('Firestore instance:', firestore ? 'Connected' : 'Not connected');
    
    if (!firestore) {
      return NextResponse.json({
        firebaseConnected: false,
        message: 'Firebase not initialized - check environment variables'
      });
    }

    await connectDB();
    
    // Test user creation and retrieval
    const testEmail = `test-${Date.now()}@example.com`;
    console.log('Creating test user:', testEmail);
    
    const testUser = await User.createUser({
      email: testEmail,
      password: 'test123',
      name: 'Test User',
      wallet: '0x' + Math.random().toString(16).substr(2, 40),
      rootFolder: 'test-folder'
    });
    
    console.log('Test user created:', testUser.id);
    
    // Try to find the user immediately
    const foundUser = await User.findByEmail(testEmail);
    console.log('User found after creation:', foundUser ? 'Yes' : 'No');
    
    // Clean up test user
    await User.delete(testUser.id);
    console.log('Test user cleaned up');
    
    return NextResponse.json({
      firebaseConnected: true,
      testUserCreated: true,
      userFoundAfterCreation: !!foundUser,
      message: 'Firebase test completed successfully'
    });
    
  } catch (error: any) {
    console.error('Firebase debug test error:', error);
    return NextResponse.json({
      firebaseConnected: false,
      error: error.message,
      message: 'Firebase test failed'
    }, { status: 500 });
  }
}




