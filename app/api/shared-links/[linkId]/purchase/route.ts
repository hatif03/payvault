import { SharedLink, Transaction } from '@/app/lib/models';
import { Item } from '@/app/models/Item';
import connectDB from '@/app/lib/mongodb';
import { Affiliate } from '@/app/models/Affiliate';
import { Commission } from '@/app/models/Commission';
import { User } from '@/app/models/User';
import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { secrets } from '@/app/lib/config';
import { CircleClient } from '@/app/lib/circle/circleClient';

interface PaymentResponse {
  transaction: string;
  network: string;
  payer: string;
  success: boolean;
}

interface SharedLinkDocument {
  _id: Types.ObjectId;
  linkId: string;
  title: string;
  price: number;
  type: 'public' | 'monetized';
  isActive: boolean;
  expiresAt?: Date;
  paidUsers: Types.ObjectId[];
  affiliateEnabled: boolean;
  owner: {
    _id: Types.ObjectId;
    name: string;
    email: string;
    wallet: string;
  };
  item: {
    _id: Types.ObjectId;
    name: string;
    type: string;
    size: number;
    mimeType: string;
  };
}

const generateReceiptNumber = (): string => {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `RCP-${timestamp}-${random}`;
};

const parsePaymentResponse = (paymentResponseHeader: string | null): PaymentResponse | null => {
  if (!paymentResponseHeader) return null;
  
  try {
    return JSON.parse(paymentResponseHeader);
  } catch (error) {
    console.error('Error parsing x-payment-response:', error);
    return null;
  }
};

async function getSharedLinkWithAuth(
  linkId: string,
  userId?: string
): Promise<SharedLinkDocument> {
  const sharedLink = await SharedLink.findByLinkId(linkId);

  if (!sharedLink || !sharedLink.isActive || sharedLink.type !== 'monetized') {
    throw new Error('Monetized link not found or expired');
  }

  if (sharedLink.expiresAt && new Date(sharedLink.expiresAt) < new Date()) {
    throw new Error('Link has expired');
  }

  // Manually populate owner and item
  const owner = await User.findById(sharedLink.owner);
  const item = await Item.findById(sharedLink.item);

  if (!owner || !item) {
    throw new Error('Link data incomplete');
  }

  if (sharedLink.owner.toString() === userId) {
    throw new Error('You cannot purchase your own content');
  }

  const hasPaid = sharedLink.paidUsers.some(
    (paidUserId: string) => paidUserId.toString() === userId
  );

  if (hasPaid) {
    throw new Error('You have already paid for this content');
  }

  return {
    ...sharedLink,
    owner: {
      _id: owner.id,
      name: owner.name,
      email: owner.email,
      wallet: owner.wallet
    },
    item: {
      _id: item.id,
      name: item.name,
      type: item.type,
      size: item.size,
      mimeType: item.mimeType
    }
  } as SharedLinkDocument;
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ linkId: string }> }
) {
  try {
    const userIdFromHeader = request.headers.get('x-user-id');
    const userEmailFromHeader = request.headers.get('x-user-email');
    const affiliateCodeFromHeader = request.headers.get('x-affiliate-code');
    
    if (!userIdFromHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    
    const { linkId } = await params;
    if (!linkId) {
      return NextResponse.json({ error: 'Link ID is required' }, { status: 400 });
    }

    const sharedLink = await getSharedLinkWithAuth(linkId, userIdFromHeader);

    // Get buyer's Circle wallet ID for payment
    const buyer = await User.findById(userIdFromHeader);
    if (!buyer) return NextResponse.json({ error: 'Buyer not found' }, { status: 404 });

    // Handle payment using Circle transfer for developer-controlled wallets
    let paymentDetails: any = { transaction: '0x', network: 'arc-testnet', payer: userIdFromHeader, success: false };
    
    // Check configuration for Circle transfer
    const hasCircleWallet = !!buyer.circleWalletId;
    const hasCircleApiKey = !!secrets.CIRCLE_API_KEY;
    const hasArcUsdcAddress = !!secrets.ARC_USDC_CONTRACT_ADDRESS;
    
    // Try Circle transfer (for developer-controlled wallets)
    if (hasCircleWallet && hasCircleApiKey && hasArcUsdcAddress) {
      let sellerAddress: string | undefined;
      let amountInUsdc: string | undefined;
      
      try {
        const circle = new CircleClient(secrets.CIRCLE_API_KEY);
        sellerAddress = typeof sharedLink.owner === 'object' && sharedLink.owner?.wallet
          ? sharedLink.owner.wallet as string
          : null;
        
        if (sellerAddress && typeof sellerAddress === 'string' && sellerAddress.startsWith('0x')) {
          // Convert price to USDC amount (6 decimals for USDC)
          amountInUsdc = Math.floor(sharedLink.price * 1000000).toString();
          
          const transferResult = await circle.transfer({
            fromWalletId: buyer.circleWalletId,
            toAddress: sellerAddress as `0x${string}`,
            amount: amountInUsdc,
            chainId: secrets.ARC_CHAIN_ID,
            tokenAddress: secrets.ARC_USDC_CONTRACT_ADDRESS as `0x${string}`,
          });
          
          if (transferResult.transactionHash) {
            paymentDetails = {
              transaction: transferResult.transactionHash,
              network: 'arc-testnet',
              payer: buyer.wallet,
              success: true,
              paymentMethod: 'circle-transfer'
            };
          } else {
            throw new Error('Circle transfer did not return transaction hash');
          }
        } else {
          throw new Error('Invalid seller wallet address');
        }
      } catch (circleError: any) {
        console.error('Circle transfer failed:', {
          error: circleError.message,
          response: circleError.response?.data,
          status: circleError.response?.status,
          buyerWalletId: buyer.circleWalletId,
          sellerAddress: sellerAddress || 'not defined',
          amount: amountInUsdc || 'not defined'
        });
        
        const errorMsg = circleError.response?.data?.message || circleError.message || 'Payment failed';
        const detailedError = circleError.response?.data?.errors?.[0]?.message || errorMsg;
        
        return NextResponse.json({ 
          error: `Payment failed: ${detailedError}. Please ensure your wallet has sufficient USDC balance.`,
          details: {
            hasCircleWallet,
            hasCircleApiKey,
            hasArcUsdcAddress,
            circleError: detailedError
          }
        }, { status: 402 });
      }
    } else {
      // Circle transfer not available
      let errorMessage = 'Payment required. ';
      if (!hasCircleWallet) {
        errorMessage += 'Your wallet is not configured for payments. Please contact support.';
      } else if (!hasCircleApiKey) {
        errorMessage += 'Payment service is not configured. Please contact support.';
      } else if (!hasArcUsdcAddress) {
        errorMessage += 'USDC contract address is not configured. Please contact support.';
      } else {
        errorMessage += 'Please ensure your wallet has sufficient USDC balance on Arc network.';
      }
      
      return NextResponse.json({ 
        error: errorMessage,
        details: {
          hasCircleWallet,
          hasCircleApiKey,
          hasArcUsdcAddress
        }
      }, { status: 402 });
    }
    
    // Get IDs properly (handle both id and _id formats)
    const sharedLinkId = sharedLink.id || (sharedLink as any)._id;
    const ownerId = typeof sharedLink.owner === 'object' && sharedLink.owner?._id 
      ? sharedLink.owner._id 
      : typeof sharedLink.owner === 'object' && sharedLink.owner?.id
      ? sharedLink.owner.id
      : sharedLink.owner;
    const itemId = typeof sharedLink.item === 'object' && sharedLink.item?._id 
      ? sharedLink.item._id 
      : typeof sharedLink.item === 'object' && sharedLink.item?.id
      ? sharedLink.item.id
      : sharedLink.item;

    const transaction = await Transaction.createTransaction({
      sharedLink: sharedLinkId,
      buyer: userIdFromHeader,
      seller: ownerId as string,
      item: itemId as string,
      amount: sharedLink.price,
      status: 'completed',
      transactionId: uuidv4(),
      receiptNumber: generateReceiptNumber(),
      purchaseDate: new Date(),
      transactionType: 'purchase',
      paymentFlow: 'direct',
      metadata: paymentDetails ? {
        blockchainTransaction: paymentDetails.transaction,
        network: paymentDetails.network,
        payer: paymentDetails.payer,
        success: paymentDetails.success,
        paymentMethod: paymentDetails.paymentMethod
      } : undefined
    });

    // Add user to paidUsers list
    const currentPaidUsers = Array.isArray(sharedLink.paidUsers) ? [...sharedLink.paidUsers] : [];
    if (!currentPaidUsers.includes(userIdFromHeader)) {
      currentPaidUsers.push(userIdFromHeader);
      await SharedLink.update(sharedLinkId, { paidUsers: currentPaidUsers } as any);
    }

    // Process affiliate commission if applicable
    let commission = null;
    if (affiliateCodeFromHeader && sharedLink.affiliateEnabled) {
      try {
        const affiliate = await Affiliate.findOne({
          affiliateCode: affiliateCodeFromHeader,
          sharedLink: sharedLinkId,
          status: 'active'
        });

        if (affiliate && affiliate.affiliateUser.toString() !== userIdFromHeader) {
          const commissionAmount = (sharedLink.price * affiliate.commissionRate) / 100;
          
          commission = await Commission.create({
            affiliate: affiliate.id,
            originalTransaction: transaction.id,
            commissionRate: affiliate.commissionRate,
            commissionAmount,
            status: 'pending'
          });
          
          // Update affiliate stats
          const currentEarnings = affiliate.totalEarnings || 0;
          const currentSales = affiliate.totalSales || 0;
          await Affiliate.update(affiliate.id, {
            totalEarnings: currentEarnings + commissionAmount,
            totalSales: currentSales + 1
          } as any);
        }
      } catch (affiliateError) {
        console.error('Error processing affiliate commission:', affiliateError);
      }
    }
    
    // Manually populate transaction for response
    const buyer = await User.findById(transaction.buyer);
    const seller = await User.findById(transaction.seller);
    const transactionItem = await Item.findById(transaction.item);
    
    const populatedTransaction = {
      ...transaction,
      buyer: buyer ? { name: buyer.name, email: buyer.email } : null,
      seller: seller ? { name: seller.name, email: seller.email } : null,
      item: transactionItem ? { 
        name: transactionItem.name, 
        type: transactionItem.type, 
        size: transactionItem.size, 
        mimeType: transactionItem.mimeType 
      } : null
    };
    
    return NextResponse.json({
      transactionData: {
        transaction: populatedTransaction,
        paymentDetails,
        message: 'Purchase completed successfully',
        sharedLink: {
          linkId: sharedLink.linkId,
          title: sharedLink.title
        },
        affiliateCommission: commission ? {
          amount: commission.commissionAmount,
          rate: commission.commissionRate
        } : null
      }
    }, { status: 201 });
      
  } catch (error: any) {
    console.error('POST /api/shared-links/[linkId]/purchase error:', error);
    
    const status = 
      error.code === 11000 ? 400 :
      error.message === 'Link has expired' ? 410 :
      error.message === 'Monetized link not found or expired' ? 404 : 500;
    
    const message = 
      error.code === 11000 ? 'Transaction already exists' :
      error.message || 'Failed to complete purchase';
    
    return NextResponse.json({ error: message }, { status });
  }
} 