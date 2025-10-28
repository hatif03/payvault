'use client';

import { getFileIcon as getExplorerFileIcon } from '@/app/lib/frontend/explorerFunctions';
import { formatListingPrice } from '@/app/lib/frontend/marketplaceFunctions';
import { formatTransactionDate, getNetworkDisplayName, getTransactionStatusColor, getTransactionTypeColor } from '@/app/lib/frontend/transactionFunctions';
import { Transaction } from '@/app/lib/types';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { createElement, useCallback, useEffect, useState } from 'react';
import FooterPattern from '../components/global/FooterPattern';
import Loader from '../components/global/Loader';
import { DashboardCard } from '../components/ui/DashboardCard';

export default function TransactionsPage() {
  const { data: session } = useSession();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    current: 1,
    total: 1,
    count: 0,
    totalItems: 0
  });
  const [filters, setFilters] = useState({
    type: 'all' as 'purchases' | 'sales' | 'all',
    status: '' as '' | 'completed' | 'pending' | 'failed' | 'refunded',
    page: 1,
    limit: 20
  });

  const fetchTransactions = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch('/api/transactions');
      if (!response.ok) {
        throw new Error('Failed to fetch transactions');
      }
      const data = await response.json();
      setTransactions(data.transactions);
      setPagination(data.pagination);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch transactions');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (session?.user?.id) {
      fetchTransactions();
    }
  }, [session, fetchTransactions]);

  const handleFilterChange = (newFilters: Partial<typeof filters>) => {
    setFilters(prev => ({ ...prev, ...newFilters, page: 1 }));
  };

  const handlePageChange = (page: number) => {
    setFilters(prev => ({ ...prev, page }));
  };

  if (!session) {
    return (
      <div className="min-h-screen bg-slate-900 relative">
        <main className="max-w-7xl mx-auto py-24 px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center">
            <h1 className="text-6xl heading-text-2 font-anton mb-4 text-white">TRANSACTION HISTORY</h1>
            <p className="mt-4 text-xl font-freeman text-slate-300">Please log in to view your transaction history</p>
            <Link
              href="/api/auth/signin"
              className="mt-8 inline-block neopop-gradient-primary border-2 border-slate-600 brutal-shadow-left px-6 py-3 font-freeman hover:neopop-glow transition-all rounded-lg"
            >
              Sign In
            </Link>
          </div>
        </main>
        <FooterPattern design={1} className='w-[80vw] bottom-0 right-0 opacity-30' />
      <FooterPattern design={1} className='w-[80vw] top-0 left-0 -scale-100 opacity-30' />
      </div>
    );
  }

  if (loading && transactions.length === 0) {
    return (
      <div className="min-h-screen bg-slate-900 relative">
        <main className="max-w-7xl mx-auto py-24 px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center">
            <h1 className="text-6xl text-white">TRANSACTION HISTORY</h1>
            <div className="mt-12 flex justify-center">
              <Loader />
            </div>
          </div>
        </main>
        <FooterPattern design={1} className='w-[80vw] bottom-0 right-0 opacity-30' />
      <FooterPattern design={1} className='w-[80vw] top-0 left-0 -scale-100 opacity-30' />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-900 relative">
        <main className="max-w-7xl mx-auto py-24 px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center">
            <h1 className="text-6xl text-white">TRANSACTION HISTORY</h1>
            <div className="mt-12 bg-slate-900 border-2 border-black brutal-shadow-left p-6 max-w-md mx-auto">
              <h3 className="text-xl font-freeman mb-3">Error loading transactions</h3>
              <p className="text-lg mb-4">{error}</p>
              <button
                onClick={fetchTransactions}
                className="bg-primary border-2 border-black brutal-shadow-left px-4 py-2 font-freeman hover:translate-x-1 hover:translate-y-1 hover:brutal-shadow-center transition-all"
              >
                Try again
              </button>
            </div>
          </div>
        </main>
        <FooterPattern design={1} className='w-[80vw] bottom-0 right-0 opacity-30' />
      <FooterPattern design={1} className='w-[80vw] top-0 left-0 -scale-100 opacity-30' />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 relative">
      <main className="max-w-7xl mx-auto py-24 px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-12">
          <h1 className="text-6xl heading-text-2 font-anton mb-4 text-white">TRANSACTION HISTORY</h1>
          <p className="text-xl font-freeman text-slate-300">View your purchase and sale history</p>
        </div>

        <DashboardCard />
        
        {/* Filters */}
        <div className="mb-8 bg-slate-800 border-2 border-slate-600 brutal-shadow-left p-6 rounded-lg">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-lg font-freeman mb-2 text-white">
                Transaction Type
              </label>
              <select
                value={filters?.type}
                onChange={(e) => handleFilterChange({ type: e.target.value as any })}
                className="w-full bg-slate-700 border-2 border-slate-600 p-2 font-freeman brutal-shadow-left focus:outline-none focus:ring-2 focus:ring-primary text-white rounded"
              >
                <option value="all">All Transactions</option>
                <option value="purchases">Purchases</option>
                <option value="sales">Sales</option>
              </select>
            </div>
            
            <div>
              <label className="block text-lg font-freeman mb-2 text-white">
                Status
              </label>
              <select
                value={filters.status}
                onChange={(e) => handleFilterChange({ status: e.target.value as any })}
                className="w-full bg-slate-700 border-2 border-slate-600 p-2 font-freeman brutal-shadow-left focus:outline-none focus:ring-2 focus:ring-primary text-white rounded"
              >
                <option value="">All Statuses</option>
                <option value="completed">Completed</option>
                <option value="pending">Pending</option>
                <option value="failed">Failed</option>
                <option value="refunded">Refunded</option>
              </select>
            </div>

            <div className="flex items-end">
              <div className="text-lg font-freeman text-slate-300">
                {pagination.totalItems} {pagination.totalItems === 1 ? 'transaction' : 'transactions'} found
              </div>
            </div>
          </div>
        </div>

        {transactions.length === 0 ? (
          <div className="text-center py-12 bg-slate-800 border-2 border-slate-600 brutal-shadow-right rounded-lg">
            <h3 className="text-2xl font-anton mb-4 text-white">No transactions found</h3>
            <p className="text-lg font-freeman mb-6 text-slate-300">
              {filters?.type === 'purchases' 
                ? "You haven't made any purchases yet." 
                : filters?.type === 'sales'
                ? "You haven't made any sales yet."
                : "You don't have any transactions yet."}
            </p>
            <Link
              href="/marketplace"
              className="inline-block neopop-gradient-primary border-2 border-slate-600 button-primary duration-100 px-6 py-3 font-freeman hover:neopop-glow transition-all rounded-lg"
            >
              Browse Marketplace
            </Link>
          </div>
        ) : (
          <>
            {/* Transactions List */}
            <div className="">
              <ul className="">
                {transactions.map((transaction) => (
                  <li key={transaction._id} className="relative">
                    <Link href={`/transactions/${transaction._id}`} className="block">
                      <div className="bg-slate-800 border-2 border-slate-600 button-primary p-4 rounded-lg">
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="flex items-center gap-3">
                              <span className="text-2xl">
                                {createElement(getExplorerFileIcon(transaction.item?.mimeType), { className: "w-6 h-6" })}
                              </span>
                              <div>
                                <p className="text-lg font-freeman text-white">
                                  {transaction.listing?.title || transaction.metadata?.sharedLinkTitle || transaction.item.name}
                                </p>
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className={`px-3 py-1 ${getTransactionTypeColor(transaction.transactionType)} border-2 border-slate-600 text-sm font-freeman rounded`}>
                                    {transaction.transactionType.charAt(0).toUpperCase() + transaction.transactionType.slice(1)}
                                  </span>
                                  {transaction.paymentFlow === 'admin' && 
                                   transaction.affiliateInfo?.isAffiliateSale && 
                                   session?.user?.id === transaction.seller._id && (
                                    <span className="px-3 py-1 bg-yellow-900 border-2 border-slate-600 text-sm font-freeman text-yellow-200 rounded">
                                      Affiliate Sale
                                    </span>
                                  )}
                                  <span className={`px-3 py-1 ${getTransactionStatusColor(transaction.status)} border-2 border-slate-600 text-sm font-freeman rounded`}>
                                    {transaction.status}
                                  </span>
                                </div>
                              </div>
                            </div>
                            <div className="mt-2 flex items-center text-base font-freeman gap-2 text-slate-300">
                              <p>
                                {transaction.transactionType === 'purchase' 
                                  ? `Purchased from ${transaction.seller.name}`
                                  : transaction.transactionType === 'sale'
                                  ? `Sold to ${transaction.buyer.name}`
                                  : `Commission from ${transaction.buyer.name}'s purchase`}
                              </p>
                              <span>•</span>
                              <p>{formatTransactionDate(transaction.purchaseDate)}</p>
                              {transaction.metadata?.network && (
                                <>
                                  <span>•</span>
                                  <p className="capitalize">{getNetworkDisplayName(transaction.metadata.network)}</p>
                                </>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            <div className="text-right">
                              {transaction.paymentFlow === 'admin' && 
                               transaction.affiliateInfo?.isAffiliateSale && 
                               transaction.transactionType === 'sale' && 
                               session?.user?.id === transaction.seller._id ? (
                                <>
                                  <p className="text-xl font-freeman text-white">
                                    {formatListingPrice(transaction.affiliateInfo.netAmount)}
                                  </p>
                                  <p className="text-sm text-slate-400">
                                    -{formatListingPrice(transaction.affiliateInfo.originalAmount - transaction.affiliateInfo.netAmount)} commission
                                  </p>
                                </>
                              ) : 
                              transaction.transactionType === 'commission' ? (
                                <>
                                  <p className="text-xl font-freeman text-white">
                                    {formatListingPrice(transaction.amount)}
                                  </p>
                                  <p className="text-sm text-slate-400">
                                    Commission
                                  </p>
                                </>
                              ) : (
                                <p className="text-xl font-freeman text-white">
                                  {formatListingPrice(transaction.amount)}
                                </p>
                              )}
                              <p className="text-sm font-freeman text-slate-400">
                                {transaction.receiptNumber}
                              </p>
                            </div>
                            <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                            </svg>
                          </div>
                        </div>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Pagination */}
            {pagination.total > 1 && (
              <div className="mt-8 flex items-center justify-center gap-2">
                <button
                  onClick={() => handlePageChange(pagination.current - 1)}
                  disabled={pagination.current === 1}
                  className="bg-slate-800 border-2 border-slate-600 brutal-shadow-left px-4 py-2 font-freeman disabled:opacity-50 disabled:cursor-not-allowed hover:neopop-glow transition-all rounded-lg"
                >
                  Previous
                </button>
                
                {Array.from({ length: pagination.total }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => handlePageChange(page)}
                    className={`px-4 py-2 border-2 border-slate-600 font-freeman rounded ${
                      page === pagination.current
                        ? 'neopop-gradient-primary brutal-shadow-center translate-x-1 translate-y-1 text-white'
                        : 'bg-slate-800 brutal-shadow-left hover:neopop-glow transition-all text-slate-300'
                    } transition-all`}
                  >
                    {page}
                  </button>
                ))}
                
                <button
                  onClick={() => handlePageChange(pagination.current + 1)}
                  disabled={pagination.current === pagination.total}
                  className="bg-slate-800 border-2 border-slate-600 brutal-shadow-left px-4 py-2 font-freeman disabled:opacity-50 disabled:cursor-not-allowed hover:neopop-glow transition-all rounded-lg"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </main>
      <FooterPattern design={1} className='w-[80vw] top-0 left-0 -scale-100 opacity-30' />
      <FooterPattern design={1} className='w-[80vw] top-0 left-0 -scale-100 opacity-30' />
    </div>
  );
} 