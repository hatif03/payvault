'use client';

import AffiliateCard from '@/app/components/Affiliates/AffiliateCard';
import FooterPattern from '@/app/components/global/FooterPattern';
import Loader from '@/app/components/global/Loader';
import { DashboardCard } from '@/app/components/ui/DashboardCard';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';

interface Affiliate {
  _id: string;
  affiliateCode: string;
  commissionRate: number;
  status: 'active' | 'inactive' | 'suspended';
  totalEarnings: number;
  totalSales: number;
  affiliateUser: {
    _id: string;
    name: string;
    email: string;
  };
  owner: {
    _id: string;
    name: string;
    email: string;
  };
  listing?: {
    _id: string;
    title: string;
    price: number;
  };
  sharedLink?: {
    _id: string;
    title: string;
    price: number;
    type: string;
    linkId: string;
  };
  createdAt: string;
}

interface Commission {
  _id: string;
  affiliate: Affiliate;
  originalTransaction: {
    _id: string;
    buyer: {
      name: string;
      email: string;
    };
    amount: number;
  };
  commissionAmount: number;
  commissionRate: number;
  status: 'pending' | 'paid' | 'failed';
  createdAt: string;
}

export default function AffiliatesPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'owned' | 'affiliate' | 'transactions'>('owned');
  const [affiliates, setAffiliates] = useState<Affiliate[]>([]);
  const [transactions, setTransactions] = useState<Commission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState({
    totalEarned: 0,
    totalOwed: 0,
    pendingCommissions: 0,
    activeAffiliates: 0
  });

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      if (activeTab === 'transactions') {
        const [earnedResponse, paidResponse] = await Promise.all([
          fetch('/api/affiliates/transactions?type=earned'),
          fetch('/api/affiliates/transactions?type=paid')
        ]);

        if (earnedResponse.ok && paidResponse.ok) {
          const earnedData = await earnedResponse.json();
          const paidData = await paidResponse.json();
          
          const allTransactions = [
            ...(Array.isArray(earnedData.transactions) ? earnedData.transactions : []),
            ...(Array.isArray(paidData.transactions) ? paidData.transactions : [])
          ];
          setTransactions(allTransactions);
          setStats(prev => ({
            ...prev,
            totalEarned: earnedData.summary.paid.amount,
            pendingCommissions: earnedData.summary.pending.amount,
            totalOwed: paidData.summary.pending.amount
          }));
        }
      } else {
        const response = await fetch(`/api/affiliates?type=${activeTab}`);
        if (response.ok) {
          const data = await response.json();
          const affiliatesList = Array.isArray(data.affiliates) ? data.affiliates : [];
          setAffiliates(affiliatesList);
          
          // Calculate stats
          const activeCount = affiliatesList.filter((a: Affiliate) => a.status === 'active').length;
          setStats(prev => ({
            ...prev,
            activeAffiliates: activeCount
          }));
        }
      }
    } catch (err) {
      setError('Failed to fetch data');
    } finally {
      setLoading(false);
    }
  }, [activeTab]);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
    }
  }, [status, router]);

  useEffect(() => {
    if (session?.user?.id) {
      fetchData();
    }
  }, [session, fetchData]);

  const handleUpdateAffiliate = async (affiliateId: string, updates: any) => {
    try {
      const response = await fetch(`/api/affiliates/${affiliateId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });

      if (response.ok) {
        fetchData(); // Refresh data
      } else {
        throw new Error('Failed to update affiliate');
      }
    } catch (error) {
      console.error('Error updating affiliate:', error);
    }
  };

  const handleDeleteAffiliate = async (affiliateId: string) => {
    if (!confirm('Are you sure you want to delete this affiliate?')) return;

    try {
      const response = await fetch(`/api/affiliates/${affiliateId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        fetchData(); // Refresh data
      } else {
        throw new Error('Failed to delete affiliate');
      }
    } catch (error) {
      console.error('Error deleting affiliate:', error);
    }
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <Loader />
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <div className="min-h-screen bg-slate-900 relative">
      <main className="max-w-7xl mx-auto py-24 px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="heading-text-2 text-6xl font-anton mb-4 text-white">
            AFFILIATE PROGRAM
          </h1>
          <p className="font-freeman text-xl max-w-2xl mx-auto text-slate-300">
            Manage your affiliate partnerships and track your earnings
          </p>
        </div>

        <DashboardCard />

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-slate-800 border-2 border-slate-600 brutal-shadow-left p-4 text-center rounded-lg">
            <h3 className="font-anton text-2xl text-white">${stats.totalEarned.toFixed(2)}</h3>
            <p className="font-freeman text-sm text-slate-300">Total Earned</p>
          </div>
          <div className="bg-slate-800 border-2 border-slate-600 brutal-shadow-left p-4 text-center rounded-lg">
            <h3 className="font-anton text-2xl text-white">${stats.pendingCommissions.toFixed(2)}</h3>
            <p className="font-freeman text-sm text-slate-300">Pending Commissions</p>
          </div>
          <div className="bg-slate-800 border-2 border-slate-600 brutal-shadow-left p-4 text-center rounded-lg">
            <h3 className="font-anton text-2xl text-white">${stats.totalOwed.toFixed(2)}</h3>
            <p className="font-freeman text-sm text-slate-300">Total Owed</p>
          </div>
          <div className="bg-slate-800 border-2 border-slate-600 brutal-shadow-left p-4 text-center rounded-lg">
            <h3 className="font-anton text-2xl text-white">{stats.activeAffiliates}</h3>
            <p className="font-freeman text-sm text-slate-300">Active Affiliates</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-2 border-slate-600 bg-slate-800 mb-6 rounded-lg">
          <button
            onClick={() => setActiveTab('owned')}
            className={`flex-1 px-6 py-3 font-freeman border-r-2 border-slate-600 rounded-l-lg ${
              activeTab === 'owned' ? 'neopop-gradient-primary text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            My Content Affiliates
          </button>
          <button
            onClick={() => setActiveTab('affiliate')}
            className={`flex-1 px-6 py-3 font-freeman border-r-2 border-slate-600 ${
              activeTab === 'affiliate' ? 'neopop-gradient-primary text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            My Partnerships
          </button>
          <button
            onClick={() => setActiveTab('transactions')}
            className={`flex-1 px-6 py-3 font-freeman rounded-r-lg ${
              activeTab === 'transactions' ? 'neopop-gradient-primary text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            Transactions
          </button>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex justify-center py-12">
            <Loader />
          </div>
        ) : error ? (
          <div className="bg-red-900 border-2 border-red-600 p-8 text-center rounded-lg">
            <p className="font-freeman text-lg text-red-200">{error}</p>
            <button
              onClick={fetchData}
              className="mt-4 button-primary neopop-gradient-primary px-6 py-2 rounded-lg hover:neopop-glow"
            >
              Try Again
            </button>
          </div>
        ) : (
          <div>
            {activeTab === 'transactions' ? (
              <div className="space-y-4">
                {transactions.length === 0 ? (
                  <div className="text-center py-12 bg-slate-800 border-2 border-slate-600 brutal-shadow-left rounded-lg">
                    <p className="font-freeman text-lg text-slate-300">No transactions found</p>
                  </div>
                ) : (
                  transactions.map((transaction, index) => {
                    // Create a unique key combining _id, createdAt, and index as fallback
                    const uniqueKey = transaction._id 
                      ? `${transaction._id}-${transaction.createdAt || index}` 
                      : `transaction-${index}-${transaction.createdAt || Date.now()}`;
                    return (
                    <div key={uniqueKey} className="bg-slate-800 border-2 border-slate-600 brutal-shadow-left p-4 rounded-lg">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-freeman text-sm text-slate-400">
                            {new Date(transaction.createdAt).toLocaleDateString()}
                          </p>
                          <p className="font-anton text-lg text-white">
                            ${transaction.commissionAmount.toFixed(2)} commission
                          </p>
                          <p className="font-freeman text-sm text-slate-300">
                            {transaction.commissionRate}% of ${transaction.originalTransaction.amount.toFixed(2)} sale
                          </p>
                          <p className="font-freeman text-sm text-slate-300">
                            Code: {transaction.affiliate.affiliateCode}
                          </p>
                        </div>
                        <span className={`px-3 py-1 text-xs font-freeman border-2 border-slate-600 rounded ${
                          transaction.status === 'paid' ? 'bg-green-900 text-green-200' :
                          transaction.status === 'pending' ? 'bg-yellow-900 text-yellow-200' :
                          'bg-red-900 text-red-200'
                        }`}>
                          {transaction.status.toUpperCase()}
                        </span>
                      </div>
                    </div>
                    );
                  })
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {affiliates.length === 0 ? (
                  <div className="col-span-full text-center py-12 bg-slate-800 border-2 border-slate-600 brutal-shadow-left rounded-lg">
                    <p className="font-freeman text-lg text-slate-300">
                      {activeTab === 'owned' 
                        ? 'No affiliates set up for your content yet'
                        : 'You are not an affiliate for any content yet'
                      }
                    </p>
                  </div>
                ) : (
                  affiliates.map((affiliate, index) => {
                    // Create a unique key combining _id, affiliateCode, and index as fallback
                    const uniqueKey = affiliate._id 
                      ? `${affiliate._id}-${affiliate.affiliateCode || index}` 
                      : `affiliate-${index}-${affiliate.affiliateCode || Date.now()}`;
                    return (
                    <AffiliateCard
                      key={uniqueKey}
                      affiliate={affiliate}
                      currentUserId={session.user.id}
                      onUpdate={handleUpdateAffiliate}
                      onDelete={handleDeleteAffiliate}
                    />
                    );
                  })
                )}
              </div>
            )}
          </div>
        )}
      </main>

      <FooterPattern design={1} className='w-[80vw] bottom-0 right-0 opacity-30' />
      <FooterPattern design={1} className='w-[80vw] top-0 left-0 -scale-100 opacity-30' />
    </div>
  );
}