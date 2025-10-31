'use client';

import { fundWallet } from '@/actions/fundWallet';
import { useSession } from 'next-auth/react';
import { usePathname } from 'next/navigation';
import React, { useCallback, useEffect, useState } from 'react';
import { BiMoney } from 'react-icons/bi';
import { FaCheckCircle, FaWallet, FaArrowRight, FaArrowDown, FaSync } from 'react-icons/fa';
import { IoCopyOutline } from 'react-icons/io5';
// No mock balances; always read from chain
import { ethers } from 'ethers';
import abi from '@/app/utils/abi/erc20abi';

interface WalletCompProps {
  compact?: boolean;
}

interface Transaction {
  _id: string;
  amount: number;
  status: string;
  transactionType: string;
  purchaseDate: string;
  metadata?: {
    blockchainTransaction?: string;
    network?: string;
  };
}

export const WalletComp = ({ compact = false }: WalletCompProps) => {
  const { data: session } = useSession();
  const pathname = usePathname();
  const [balance, setBalance] = React.useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [recentTransactions, setRecentTransactions] = useState<Transaction[]>([]);
  const [networkStatus, setNetworkStatus] = useState<'connected' | 'checking' | 'disconnected'>('checking');

  const isHomePage = pathname === '/';

  const fetchBalance = useCallback(async () => {
    try {
      const wallet = session?.user.wallet as `0x${string}` | undefined;
      if (!wallet) return;

      // Use public env vars for client-side access
      const rpcUrl = process.env.NEXT_PUBLIC_ARC_RPC_URL || 'https://rpc.testnet.arc.network';
      const contractAddress = process.env.NEXT_PUBLIC_ARC_USDC_CONTRACT_ADDRESS;
      
      if (contractAddress) {
        setNetworkStatus('checking');
        const provider = new ethers.providers.JsonRpcProvider(rpcUrl);
        const contract = new ethers.Contract(
          contractAddress as `0x${string}`,
          abi,
          provider
        );
        const raw = await contract.balanceOf(wallet);
        const value = Number(raw) / 10 ** 6;
        setBalance(value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 6 }));
        setNetworkStatus('connected');
      } else {
        console.warn('ARC_USDC_CONTRACT_ADDRESS not configured. Add NEXT_PUBLIC_ARC_USDC_CONTRACT_ADDRESS to .env.local');
        setNetworkStatus('disconnected');
      }
    } catch (error) {
      console.error('Error fetching wallet balance:', error);
      setNetworkStatus('disconnected');
    }
  }, [session?.user.wallet]);

  const fetchTransactions = useCallback(async () => {
    try {
      const res = await fetch('/api/transactions?limit=5');
      if (res.ok) {
        const data = await res.json();
        setRecentTransactions(data.transactions || []);
      }
    } catch (error) {
      console.error('Error fetching transactions:', error);
    }
  }, []);

  const refreshWallet = useCallback(async () => {
    setIsRefreshing(true);
    await Promise.all([fetchBalance(), fetchTransactions()]);
    setIsRefreshing(false);
  }, [fetchBalance, fetchTransactions]);

  async function fundAcc() {
    try {
      setIsLoading(true);
      const res = await fundWallet(session?.user.wallet as `0x${string}`);
      if (res?.link) {
        window.open(res.link, '_blank', 'noopener,noreferrer');
      }
      await refreshWallet();
    } catch (err) {
      console.log('Error funding account:', err);
    } finally {
      setIsLoading(false);
    }
  }

  const copyToClipboard = async () => {
    if (session?.user.wallet) {
      await navigator.clipboard.writeText(session.user.wallet);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };


  useEffect(() => {
    if (session?.user?.wallet) {
      fetchBalance();
      fetchTransactions();
    }
  }, [session?.user?.wallet, fetchBalance, fetchTransactions]);

  // Auto-refresh when modal opens
  useEffect(() => {
    if (isModalOpen && session?.user?.wallet) {
      refreshWallet();
      // Poll for updates every 10 seconds when modal is open
      const interval = setInterval(() => {
        refreshWallet();
      }, 10000);
      return () => clearInterval(interval);
    }
  }, [isModalOpen, session?.user?.wallet, refreshWallet]);

  // Close modal when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const modal = document.getElementById('wallet-modal');
      if (modal && !modal.contains(event.target as Node)) {
        setIsModalOpen(false);
      }
    };

    if (isModalOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isModalOpen]);

  // Compact mode for AI overlay
  if (compact) {
    // Don't render anything if no session or on auth pages
    if (!session?.user?.wallet || pathname.startsWith('/auth')) {
      return null;
    }
    
    return (
      <>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-amber-100 border-2 border-black px-3 py-2 font-freeman button-primary transition-all duration-100"
        >
          <div className="flex items-center gap-2">
            <FaWallet className="h-4 w-4" />
            <div className="flex flex-col items-start">
              <p className="font-freeman text-xs">
                {session?.user.wallet?.slice(0, 6)}...{session?.user.wallet?.slice(-4)}
              </p>
              <p className="font-freeman font-bold text-xs flex items-center gap-1">
                <BiMoney className="h-3 w-3" />
                <span>{balance || '...'} USDC</span>
              </p>
            </div>
          </div>
        </button>

        {/* Modal Overlay */}
        {isModalOpen && (
          <div className="fixed inset-0 z-[100]">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" />

            {/* Modal */}
            <div className="flex items-center justify-center min-h-screen p-4">
              <div 
                id="wallet-modal"
                className="bg-amber-100 border-2 border-black brutal-shadow-left w-full max-w-md 
                           relative transform transition-all"
              >
                {/* Header */}
                <div className="bg-primary border-b-2 border-black p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <FaWallet className="h-6 w-6" />
                      <h3 className="font-anton text-xl">WALLET DETAILS</h3>
                    </div>
                    <button 
                      onClick={() => setIsModalOpen(false)}
                      className="font-freeman text-2xl leading-none hover:opacity-70"
                    >
                      ×
                    </button>
                  </div>
                </div>

                {/* Content */}
                <div className="p-6 space-y-6">
                  {/* Balance & Network Status */}
                  <div className="bg-white border-2 border-black brutal-shadow-left p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <BiMoney className="h-5 w-5" />
                        <span className="font-freeman font-bold text-lg">{balance || '0.00'} USDC</span>
                      </div>
                      <button
                        onClick={refreshWallet}
                        disabled={isRefreshing}
                        className="button-primary bg-primary p-2 duration-100 disabled:opacity-50"
                        title="Refresh"
                      >
                        <FaSync className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                      </button>
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                      <div className={`w-2 h-2 rounded-full ${networkStatus === 'connected' ? 'bg-green-500' : networkStatus === 'checking' ? 'bg-yellow-500' : 'bg-red-500'}`} />
                      <span className="font-freeman">
                        {networkStatus === 'connected' ? 'Arc Network Connected' : networkStatus === 'checking' ? 'Checking...' : 'Network Disconnected'}
                      </span>
                    </div>
                  </div>

                  {/* Wallet Address */}
                  <div className="bg-white border-2 border-black brutal-shadow-left p-4">
                    <div className="flex items-center justify-between">
                      <p className="font-mono text-sm truncate mr-2">
                        {session?.user.wallet}
                      </p>
                      <button
                        onClick={copyToClipboard}
                        className="button-primary bg-primary p-2 duration-100 "
                      >
                        {copied ? (
                          <FaCheckCircle className="h-5 w-5" />
                        ) : (
                          <IoCopyOutline className="h-5 w-5" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Recent Transactions */}
                  {recentTransactions.length > 0 && (
                    <div className="bg-white border-2 border-black brutal-shadow-left p-4">
                      <h4 className="font-freeman font-bold mb-3 text-sm">Recent Activity</h4>
                      <div className="space-y-2 max-h-48 overflow-y-auto">
                        {recentTransactions.map((tx) => (
                          <div key={tx._id} className="flex items-center justify-between text-xs border-b border-gray-200 pb-2 last:border-0">
                            <div className="flex items-center gap-2">
                              {tx.transactionType === 'purchase' ? (
                                <FaArrowDown className="h-3 w-3 text-red-500" />
                              ) : (
                                <FaArrowRight className="h-3 w-3 text-green-500" />
                              )}
                              <span className="font-freeman capitalize">{tx.transactionType}</span>
                            </div>
                            <div className="text-right">
                              <div className="font-freeman font-bold">{tx.amount.toFixed(2)} USDC</div>
                              {tx.metadata?.blockchainTransaction && (
                                <a 
                                  href={`https://explorer.arc.network/tx/${tx.metadata.blockchainTransaction}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-xs text-blue-600 hover:underline"
                                >
                                  View on Explorer
                                </a>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Fund Button */}
                  <div className="space-y-3">
                    <button
                      onClick={fundAcc}
                      disabled={isLoading}
                      className="w-full button-primary bg-primary px-6 py-3 
                               disabled:opacity-50 disabled:cursor-not-allowed duration-100"
                    >
                      <div className="flex flex-col items-center">
                        <div className='flex gap-2 items-center'>
                          {isLoading ? (
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-black" />
                          ) : (
                            <BiMoney className="h-5 w-5" />
                          )}
                          <span>{isLoading ? 'Funding...' : 'Fund Wallet'}</span>
                        </div>
                        <span className="text-xs">Get 1 USDC</span>
                      </div>
                    </button>

                    <a 
                      href="https://faucet.circle.com/" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="block text-center font-freeman underline hover:no-underline"
                    >
                      Get more from Circle Faucet →
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </>
    );
  }

  return (
    <>
      {/* Wallet Button - Only show if not on homepage or auth pages and has session */}
      {!isHomePage && !pathname.startsWith('/auth') && session?.user?.wallet && (
        <button 
          onClick={() => setIsModalOpen(true)}
          className="fixed top-4 right-4 z-40 bg-amber-100 border-2 
                     px-4 pb-4 pl-2 py-2 font-freeman button-primary transition-all duration-100"
        >
          <div className="flex items-center gap-4">
            <div className="bg-primary p-2  border-2 border-black brutal-shadow-center">
              <FaWallet className="h-5 w-5" />
            </div>
            <div className="flex flex-col items-start">
              <div className="flex items-center gap-2">
                <p className="font-freeman text-sm">
                  {session?.user.wallet?.slice(0, 6)}...{session?.user.wallet?.slice(-4)}
                </p>
                {/* <span className="bg-white px-2 py-0.5 text-xs border-2 border-black brutal-shadow-center">
                  WALLET
                </span> */}
              </div>
              <p className="font-freeman font-bold text-sm flex items-center gap-1">
                <BiMoney className="h-4 w-fit" />
                <span>{balance || '...'} USDC</span>
              </p>
            </div>
          </div>
        </button>
      )}

      {/* Modal Overlay */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50">
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" />

          {/* Modal */}
          <div className="flex items-center justify-center min-h-screen p-4">
            <div 
              id="wallet-modal"
              className="bg-amber-100 border-2 border-black brutal-shadow-left w-full max-w-md 
                         relative transform transition-all"
            >
              {/* Header */}
              <div className="bg-primary border-b-2 border-black p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FaWallet className="h-6 w-6" />
                    <h3 className="font-anton text-xl">WALLET DETAILS</h3>
                  </div>
                  <button 
                    onClick={() => setIsModalOpen(false)}
                    className="font-freeman text-2xl leading-none hover:opacity-70"
                  >
                    ×
                  </button>
                </div>
              </div>

              {/* Content */}
              <div className="p-6 space-y-6">
                {/* Balance & Network Status */}
                <div className="bg-white border-2 border-black brutal-shadow-left p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <BiMoney className="h-5 w-5" />
                      <span className="font-freeman font-bold text-lg">{balance || '0.00'} USDC</span>
                    </div>
                    <button
                      onClick={refreshWallet}
                      disabled={isRefreshing}
                      className="button-primary bg-primary p-2 duration-100 disabled:opacity-50"
                      title="Refresh"
                    >
                      <FaSync className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                    </button>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <div className={`w-2 h-2 rounded-full ${networkStatus === 'connected' ? 'bg-green-500' : networkStatus === 'checking' ? 'bg-yellow-500' : 'bg-red-500'}`} />
                    <span className="font-freeman">
                      {networkStatus === 'connected' ? 'Arc Network Connected' : networkStatus === 'checking' ? 'Checking...' : 'Network Disconnected'}
                    </span>
                  </div>
                </div>

                {/* Wallet Address */}
                <div className="bg-white border-2 border-black brutal-shadow-left p-4">
                  <div className="flex items-center justify-between">
                    <p className="font-mono text-sm truncate mr-2">
                      {session?.user.wallet}
                    </p>
                    <button
                      onClick={copyToClipboard}
                      className="button-primary bg-primary p-2 duration-100 "
                    >
                      {copied ? (
                        <FaCheckCircle className="h-5 w-5" />
                      ) : (
                        <IoCopyOutline className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Recent Transactions */}
                {recentTransactions.length > 0 && (
                  <div className="bg-white border-2 border-black brutal-shadow-left p-4">
                    <h4 className="font-freeman font-bold mb-3 text-sm">Recent Activity</h4>
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {recentTransactions.map((tx) => (
                        <div key={tx._id} className="flex items-center justify-between text-xs border-b border-gray-200 pb-2 last:border-0">
                          <div className="flex items-center gap-2">
                            {tx.transactionType === 'purchase' ? (
                              <FaArrowDown className="h-3 w-3 text-red-500" />
                            ) : (
                              <FaArrowRight className="h-3 w-3 text-green-500" />
                            )}
                            <span className="font-freeman capitalize">{tx.transactionType}</span>
                          </div>
                          <div className="text-right">
                            <div className="font-freeman font-bold">{tx.amount.toFixed(2)} USDC</div>
                            {tx.metadata?.blockchainTransaction && (
                              <a 
                                href={`https://explorer.arc.network/tx/${tx.metadata.blockchainTransaction}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs text-blue-600 hover:underline"
                              >
                                View on Explorer
                              </a>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Fund Button */}
                <div className="space-y-3">
                  <button
                    onClick={fundAcc}
                    disabled={isLoading}
                    className="w-full button-primary bg-primary px-6 py-3 
                             disabled:opacity-50 disabled:cursor-not-allowed duration-100"
                  >
                    <div className="flex flex-col items-center">
                      <div className='flex gap-2 items-center'>
                        {isLoading ? (
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-black" />
                        ) : (
                          <BiMoney className="h-5 w-5" />
                        )}
                        <span>{isLoading ? 'Funding...' : 'Fund Wallet'}</span>
                      </div>
                      <span className="text-xs">Get 1 USDC</span>
                    </div>
                  </button>

                  <a 
                    href="https://faucet.circle.com/" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="block text-center font-freeman underline hover:no-underline"
                  >
                    Get more from Circle Faucet →
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
