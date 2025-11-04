import { NextRequest, NextResponse } from 'next/server'
import { v4 as uuidv4 } from 'uuid'
import { Listing } from '@/app/models/Listing'
import { Transaction } from '@/app/models/Transaction'
import { Item } from '@/app/models/Item'
import { User } from '@/app/models/User'
import { Affiliate } from '@/app/models/Affiliate'
import { Commission } from '@/app/models/Commission'
import connectDB from '@/app/lib/mongodb'
import { secrets } from '@/app/lib/config'
import { createFacilitator, settleRequestPayment } from '@/app/lib/payments/x402Server'
import { getArcChain } from '@/app/lib/payments/arcChain'
import { CircleClient } from '@/app/lib/circle/circleClient'

const generateReceiptNumber = (): string => {
  const timestamp = Date.now().toString(36).toUpperCase()
  const random = Math.random().toString(36).substring(2, 8).toUpperCase()
  return `RCP-${timestamp}-${random}`
}

const parsePaymentResponse = (header: string | null) => {
  if (!header) return null
  try { 
    return JSON.parse(header)
  } catch { 
    return null
  }
}

export async function POST(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const userId = request.headers.get('x-user-id')
    const affiliateCodeFromHeader = request.headers.get('x-affiliate-code')
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { id } = await context.params
    await connectDB()
    
    const listing = await Listing.findById(id)
    if (!listing) return NextResponse.json({ error: 'Listing not found' }, { status: 404 })
    if (listing.status !== 'active') return NextResponse.json({ error: 'This listing is no longer available for purchase' }, { status: 400 })
    if (listing.seller === userId) return NextResponse.json({ error: 'You cannot purchase your own listing' }, { status: 400 })

    // Get buyer's Circle wallet ID for payment
    const buyer = await User.findById(userId)
    if (!buyer) return NextResponse.json({ error: 'Buyer not found' }, { status: 404 })

    // Handle payment using Circle transfer for developer-controlled wallets
    let paymentDetails: any = { transaction: '0x', network: 'arc-testnet', payer: userId, success: false }
    
    // Check if payment was already processed via x402 (client-side payment)
    const x402PaymentHeader = request.headers.get('x-payment-response')
    const x402PaymentData = request.headers.get('x-payment')
    
    if (x402PaymentHeader) {
      try {
        paymentDetails = JSON.parse(x402PaymentHeader)
        paymentDetails.success = true
        paymentDetails.paymentMethod = 'x402'
        console.log('Payment already processed via x402')
      } catch {
        // Continue with Circle transfer if x402 payment data is invalid
        console.log('x402 payment header invalid, will try Circle transfer')
      }
    }
    
    // Check configuration for Circle transfer
    const hasCircleWallet = !!buyer.circleWalletId
    const hasCircleApiKey = !!secrets.CIRCLE_API_KEY
    const hasArcUsdcAddress = !!secrets.ARC_USDC_CONTRACT_ADDRESS
    
    console.log('Payment configuration:', {
      hasCircleWallet,
      hasCircleApiKey,
      hasArcUsdcAddress,
      buyerWallet: buyer.wallet,
      buyerCircleWalletId: buyer.circleWalletId
    })
    
    // If no x402 payment, try Circle transfer (for developer-controlled wallets)
    if (!paymentDetails.success && hasCircleWallet && hasCircleApiKey && hasArcUsdcAddress) {
      // Get seller's wallet address (defined outside try block for error logging)
      let sellerAddress: string | undefined
      let amountInUsdc: string | undefined
      
      try {
        const circle = new CircleClient(secrets.CIRCLE_API_KEY)
        
        // Get seller's wallet address
        const seller = await User.findById(listing.seller)
        sellerAddress = seller?.wallet || listing.sellerWallet || listing.seller as string
        
        if (sellerAddress && sellerAddress.startsWith('0x')) {
          // Convert price to USDC amount (6 decimals for USDC)
          amountInUsdc = Math.floor(listing.price * 1000000).toString()
          
          const transferResult = await circle.transfer({
            fromWalletId: buyer.circleWalletId,
            toAddress: sellerAddress as `0x${string}`,
            amount: amountInUsdc,
            chainId: secrets.ARC_CHAIN_ID,
            tokenAddress: secrets.ARC_USDC_CONTRACT_ADDRESS as `0x${string}`,
          })
          
          if (transferResult.transactionHash) {
            paymentDetails = {
              transaction: transferResult.transactionHash,
              network: 'arc-testnet',
              payer: buyer.wallet,
              success: true,
              paymentMethod: 'circle-transfer'
            }
          } else {
            throw new Error('Circle transfer did not return transaction hash')
          }
        } else {
          throw new Error('Invalid seller wallet address')
        }
      } catch (circleError: any) {
        console.error('Circle transfer failed:', {
          error: circleError.message,
          response: circleError.response?.data,
          status: circleError.response?.status,
          buyerWalletId: buyer.circleWalletId,
          sellerAddress: sellerAddress || 'not defined',
          amount: amountInUsdc || 'not defined',
          listingSeller: listing.seller
        })
        
        const errorMsg = circleError.response?.data?.message || circleError.message || 'Payment failed'
        const detailedError = circleError.response?.data?.errors?.[0]?.message || errorMsg
        
        // If Circle transfer fails and no x402 payment, return 402 to trigger client-side x402
        if (!x402PaymentHeader && secrets.THIRDWEB_SECRET_KEY && secrets.SERVER_WALLET_ADDRESS) {
          console.log('Attempting x402 fallback after Circle transfer failure')
          const facil = createFacilitator(secrets.THIRDWEB_SECRET_KEY, secrets.SERVER_WALLET_ADDRESS as `0x${string}`)
          
          // Get seller address for payment
          const seller = await User.findById(listing.seller).catch(() => null)
          const sellerAddress = seller?.wallet || listing.sellerWallet || listing.seller as string
          
          if (!sellerAddress || !sellerAddress.startsWith('0x')) {
            return NextResponse.json({ 
              error: 'Invalid seller wallet address. Cannot process payment.' 
            }, { status: 400 })
          }
          
          const payResult = await settleRequestPayment({
            resourceUrl: `${secrets.NEXTAUTH_URL}/api/listings/${id}/purchase`,
            method: 'POST',
            paymentData: request.headers.get('x-payment') || undefined, // undefined means no payment yet
            payTo: sellerAddress as `0x${string}`,
            network: getArcChain(),
            price: `$${listing.price}`,
            facilitatorInstance: facil,
            description: `Purchase: ${listing.title}`,
          })

          // If status is 200, payment was processed
          if (payResult.status === 200) {
            // Extract payment details from x402 response
            const x402Payment = parsePaymentResponse(request.headers.get('x-payment-response'))
            if (x402Payment) {
              paymentDetails = x402Payment
              paymentDetails.success = true
              paymentDetails.paymentMethod = 'x402'
            } else {
              // Payment processed but no response header - create fallback payment details
              paymentDetails = {
                transaction: 'x402-processed',
                network: 'arc-testnet',
                payer: buyer.wallet,
                success: true,
                paymentMethod: 'x402'
              }
            }
          } else {
            // Return 402 with payment instructions for client to handle
            return new NextResponse(JSON.stringify(payResult.responseBody || { 
              error: 'Payment required',
              message: 'Please complete the payment to proceed with your purchase'
            }), {
              status: payResult.status,
              headers: payResult.responseHeaders as any,
            })
          }
        } else {
          // Return detailed error if payment cannot be processed
          let errorMessage = `Payment failed: ${detailedError}`
          if (!hasCircleWallet) {
            errorMessage = 'Your wallet is not configured for payments. Please contact support or try re-registering.'
          } else if (!hasCircleApiKey) {
            errorMessage = 'Payment service is not configured. Please contact support.'
          } else if (!hasArcUsdcAddress) {
            errorMessage = 'USDC contract address is not configured. Please contact support.'
          }
          
          return NextResponse.json({ 
            error: errorMessage,
            details: {
              hasCircleWallet,
              hasCircleApiKey,
              hasArcUsdcAddress,
              circleError: detailedError
            }
          }, { status: 402 })
        }
      }
    } else if (!paymentDetails.success) {
      // Circle transfer not attempted - try x402 as fallback
      if (secrets.THIRDWEB_SECRET_KEY && secrets.SERVER_WALLET_ADDRESS) {
        console.log('Circle transfer not available, attempting x402 payment flow')
        const facil = createFacilitator(secrets.THIRDWEB_SECRET_KEY, secrets.SERVER_WALLET_ADDRESS as `0x${string}`)
        
        // Get seller address for payment
        const seller = await User.findById(listing.seller).catch(() => null)
        const sellerAddress = seller?.wallet || listing.sellerWallet || listing.seller as string
        
        if (sellerAddress && sellerAddress.startsWith('0x')) {
          const payResult = await settleRequestPayment({
            resourceUrl: `${secrets.NEXTAUTH_URL}/api/listings/${id}/purchase`,
            method: 'POST',
            paymentData: x402PaymentData || undefined, // undefined triggers 402 response
            payTo: sellerAddress as `0x${string}`,
            network: getArcChain(),
            price: `$${listing.price}`,
            facilitatorInstance: facil,
            description: `Purchase: ${listing.title}`,
          })

          // If status is 200, payment was processed
          if (payResult.status === 200) {
            const x402Payment = parsePaymentResponse(request.headers.get('x-payment-response'))
            if (x402Payment) {
              paymentDetails = x402Payment
              paymentDetails.success = true
              paymentDetails.paymentMethod = 'x402'
            } else {
              paymentDetails = {
                transaction: 'x402-processed',
                network: 'arc-testnet',
                payer: buyer.wallet,
                success: true,
                paymentMethod: 'x402'
              }
            }
          } else {
            // Return 402 with payment instructions for client to handle
            return new NextResponse(JSON.stringify(payResult.responseBody || { 
              error: 'Payment required',
              message: 'Please complete the payment to proceed with your purchase'
            }), {
              status: payResult.status,
              headers: payResult.responseHeaders as any,
            })
          }
        }
      }
      
      // If x402 also didn't work, return error
      if (!paymentDetails.success) {
        let errorMessage = 'Payment required. '
        if (!hasCircleWallet) {
          errorMessage += 'Your wallet is not configured for payments. Please contact support.'
        } else if (!hasCircleApiKey) {
          errorMessage += 'Payment service is not configured. Please contact support.'
        } else if (!hasArcUsdcAddress) {
          errorMessage += 'USDC contract address is not configured. Please contact support.'
        } else {
          errorMessage += 'Please ensure your wallet has sufficient USDC balance on Arc network.'
        }
        
        console.log('Payment failed - no method available:', {
          hasCircleWallet,
          hasCircleApiKey,
          hasArcUsdcAddress,
          hasThirdwebConfig: !!(secrets.THIRDWEB_SECRET_KEY && secrets.SERVER_WALLET_ADDRESS)
        })
        
        return NextResponse.json({ 
          error: errorMessage,
          details: {
            hasCircleWallet,
            hasCircleApiKey,
            hasArcUsdcAddress
          }
        }, { status: 402 })
      }
    }

    // Check if user already purchased this listing
    const userTransactions = await Transaction.findByBuyer(userId)
    const existingTransaction = userTransactions.find(t => 
      t.listing === id && t.status === 'completed'
    )
    if (existingTransaction) return NextResponse.json({ error: 'You have already purchased this item' }, { status: 400 })

    // Payment details already set above (from Circle or x402)

    const transactionData = {
      listing: listing.id,
      buyer: userId,
      seller: listing.seller,
      item: listing.item,
      amount: listing.price,
      status: 'completed' as const,
      transactionId: uuidv4(),
      receiptNumber: generateReceiptNumber(),
      purchaseDate: new Date(),
      transactionType: 'purchase' as const,
      paymentFlow: 'direct' as const,
      metadata: paymentDetails
    }

    const transaction = await Transaction.createTransaction(transactionData)
    const item = await Item.findById(listing.item)
    
    // Process affiliate commission if applicable
    let commission = null
    if (affiliateCodeFromHeader && listing.affiliateEnabled) {
      try {
        const affiliate = await Affiliate.findOne({
          affiliateCode: affiliateCodeFromHeader,
          listing: listing.id,
          status: 'active'
        })

        if (affiliate && affiliate.affiliateUser.toString() !== userId) {
          const commissionAmount = (listing.price * affiliate.commissionRate) / 100
          
          commission = await Commission.create({
            affiliate: affiliate._id,
            originalTransaction: transaction.id,
            commissionRate: affiliate.commissionRate,
            commissionAmount,
            status: 'pending'
          })
          
          await Affiliate.findByIdAndUpdate(affiliate._id, {
            $inc: { 
              totalEarnings: commissionAmount,
              totalSales: 1
            }
          })
        }
      } catch (affiliateError) {
        console.error('Error processing affiliate commission:', affiliateError)
      }
    }
    
    // Copy item to buyer's marketplace folder
    let copiedItem = null
    if (item) {
      const buyer = await User.findById(userId)
      if (!buyer) {
        return NextResponse.json({ error: 'Buyer not found' }, { status: 404 })
      }
      
      // Ensure marketplace folder exists
      const marketplaceFolderName = 'marketplace'
      let marketplaceFolder = await Item.findOne({ 
        owner: userId, 
        name: marketplaceFolderName, 
        type: 'folder' 
      } as any)
      
      if (!marketplaceFolder) {
        marketplaceFolder = await Item.createItem({
          name: marketplaceFolderName,
          type: 'folder',
          parentId: buyer.rootFolder,
          owner: userId
        })
      }
      
      // Create a copy of the item in buyer's marketplace folder
      const copiedItemData = await Item.createItem({
        name: `${item.name} (Purchased)`,
        type: item.type,
        parentId: marketplaceFolder.id,
        owner: userId,
        size: item.size,
        mimeType: item.mimeType,
        url: item.url, // Copy the URL so the file content is accessible
        contentSource: 'marketplace_purchase'
      })
      
      copiedItem = {
        _id: copiedItemData.id,
        id: copiedItemData.id,
        name: copiedItemData.name,
        path: `/${marketplaceFolderName}/${copiedItemData.name}`
      }
    } else {
      copiedItem = { 
        id: listing.item, 
        name: 'Item not found', 
        path: '/marketplace' 
      }
    }

    return NextResponse.json({
      transactionData: {
        transaction,
        copiedItem,
        paymentDetails,
        message: 'Purchase completed successfully',
        affiliateCommission: commission ? {
          amount: commission.commissionAmount,
          rate: commission.commissionRate
        } : null
      }
    }, { status: 201 })
  } catch (error: any) {
    console.error('Purchase API error:', error)
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 })
  }
} 