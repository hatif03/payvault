import { NextRequest, NextResponse } from 'next/server';
import { User } from '@/app/models/User';
import { Item } from '@/app/models/Item';
import connectDB from '@/app/lib/mongodb';
import { withErrorHandler } from '@/app/lib/utils/controllerUtils';

export async function POST(request: NextRequest) {
  return withErrorHandler(async () => {
    const { email, password, name, wallet } = await request.json();

    // Validate input
    if (!email || !password || !name) {
      return NextResponse.json(
        { error: 'Email, password, and name are required' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters long' },
        { status: 400 }
      );
    }

    await connectDB();

    // Check if user already exists
    const existingUser = await User.findByEmail(email);
    if (existingUser) {
      return NextResponse.json(
        { error: 'An account with this email already exists' },
        { status: 409 }
      );
    }

    // Generate a demo wallet address if not provided
    const userWallet = wallet || `0x${Math.random().toString(16).substr(2, 40)}`;

    // Create root folder for the user
    const rootFolder = await Item.createItem({
      name: email,
      type: 'folder',
      owner: 'temp', // Will be updated after user creation
    });

    // Create the user
    console.log('Creating user with data:', { email: email.toLowerCase(), name, wallet: userWallet });
    const newUser = await User.createUser({
      email: email.toLowerCase(),
      password,
      name,
      wallet: userWallet,
      rootFolder: rootFolder.id,
    });
    console.log('User created successfully:', newUser.id);

    // Update the root folder with the correct owner
    await Item.update(rootFolder.id, { owner: newUser.id });
    console.log('Root folder updated with owner:', newUser.id);

    return NextResponse.json({
      success: true,
      user: {
        id: newUser.id,
        email: newUser.email,
        name: newUser.name,
        wallet: newUser.wallet,
        rootFolder: newUser.rootFolder,
        createdAt: newUser.createdAt,
      },
    });
  });
}
