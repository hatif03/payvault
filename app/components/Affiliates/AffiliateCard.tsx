'use client';

import { useState } from 'react';
import { FiCopy, FiEdit, FiTrash2, FiExternalLink } from 'react-icons/fi';

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

interface AffiliateCardProps {
  affiliate: Affiliate;
  currentUserId: string;
  onUpdate?: (affiliateId: string, updates: any) => void;
  onDelete?: (affiliateId: string) => void;
}

export default function AffiliateCard({
  affiliate,
  currentUserId,
  onUpdate,
  onDelete
}: AffiliateCardProps) {
  const [showEditForm, setShowEditForm] = useState(false);
  const [editCommission, setEditCommission] = useState(affiliate.commissionRate);
  const [editStatus, setEditStatus] = useState(affiliate.status);
  const [loading, setLoading] = useState(false);

  const isOwner = affiliate.owner._id === currentUserId;
  const content = affiliate.listing || affiliate.sharedLink;
  const contentType = affiliate.listing ? 'listing' : 'shared link';
  
  const affiliateUrl = `${window.location.origin}/${affiliate.listing ? 'marketplace' : 'shared'}/${affiliate.listing ? affiliate.listing._id : affiliate.sharedLink?.linkId || ''}?ref=${affiliate.affiliateCode}`;

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    // You could add a toast notification here
  };

  const handleUpdate = async () => {
    if (!onUpdate) return;
    
    setLoading(true);
    try {
      await onUpdate(affiliate._id, {
        commissionRate: editCommission,
        status: editStatus
      });
      setShowEditForm(false);
    } catch (error) {
      console.error('Error updating affiliate:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-900 border-green-600 text-green-200';
      case 'inactive': return 'bg-slate-700 border-slate-600 text-slate-300';
      case 'suspended': return 'bg-red-900 border-red-600 text-red-200';
      default: return 'bg-slate-700 border-slate-600 text-slate-300';
    }
  };

  return (
    <div className="bg-slate-800 border-2 border-slate-600 brutal-shadow-left rounded-lg">
      <div className="bg-slate-700 border-b-2 border-slate-600 p-4 rounded-t-lg">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <h3 className="font-anton text-lg mb-1 text-white">{content?.title}</h3>
            <p className="font-freeman text-sm text-slate-300 mb-2">
              {contentType} • ${content?.price}
            </p>
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <span className={`px-2 py-1 text-xs font-freeman border-2 border-slate-600 brutal-shadow-center ${getStatusColor(affiliate.status)}`}>
                {affiliate.status.toUpperCase()}
              </span>
              <span className="font-freeman text-sm px-2 py-1 bg-slate-800 border-2 border-slate-600 brutal-shadow-center text-slate-300">
                {affiliate.commissionRate}% commission
              </span>
            </div>
          </div>
          {isOwner && (
            <div className="flex gap-2">
              <button
                onClick={() => setShowEditForm(!showEditForm)}
                className="p-2 bg-slate-800 border-2 border-slate-600 brutal-shadow-center hover:translate-x-1 hover:translate-y-1 hover:brutal-shadow-center transition-all text-slate-300"
                title="Edit affiliate"
              >
                <FiEdit className="w-4 h-4" />
              </button>
              <button
                onClick={() => onDelete?.(affiliate._id)}
                className="p-2 bg-slate-800 border-2 border-red-600 brutal-shadow-center hover:translate-x-1 hover:translate-y-1 hover:brutal-shadow-center transition-all text-red-400"
                title="Delete affiliate"
              >
                <FiTrash2 className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4 text-center">
          <div>
            <p className="font-anton text-xl text-white">${affiliate.totalEarnings.toFixed(2)}</p>
            <p className="font-freeman text-xs text-slate-300">Total Earnings</p>
          </div>
          <div>
            <p className="font-anton text-xl text-white">{affiliate.totalSales}</p>
            <p className="font-freeman text-xs text-slate-300">Sales</p>
          </div>
        </div>
      </div>

      <div className="p-4">
        <div className="mb-3">
          <p className="font-freeman text-sm mb-1 text-slate-300">
            {isOwner ? 'Affiliate:' : 'Content Owner:'}
          </p>
          <p className="font-freeman text-sm font-semibold text-white">
            {isOwner ? affiliate.affiliateUser.name : affiliate.owner.name}
          </p>
          <p className="font-freeman text-xs text-slate-400">
            {isOwner ? affiliate.affiliateUser.email : affiliate.owner.email}
          </p>
        </div>

        <div className="mb-3">
          <p className="font-freeman text-sm mb-1 text-slate-300">Affiliate Code:</p>
          <div className="flex gap-2">
            <code className="flex-1 px-2 py-1 bg-slate-700 border-2 border-slate-600 font-mono text-sm text-slate-300">
              {affiliate.affiliateCode}
            </code>
            <button
              onClick={() => copyToClipboard(affiliate.affiliateCode)}
              className="button-primary neopop-gradient-primary px-2 py-1 border-2 border-slate-600 brutal-shadow-center hover:translate-x-1 hover:translate-y-1 transition-all text-white"
              title="Copy code"
            >
              <FiCopy className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="mb-4">
          <p className="font-freeman text-sm mb-1 text-slate-300">Affiliate URL:</p>
          <div className="flex gap-2">
            <input
              type="text"
              value={affiliateUrl}
              readOnly
              className="flex-1 px-2 py-1 bg-slate-700 border-2 border-slate-600 font-freeman text-xs text-slate-300"
            />
            <button
              onClick={() => copyToClipboard(affiliateUrl)}
              className="button-primary neopop-gradient-primary px-2 py-1 border-2 border-slate-600 brutal-shadow-center hover:translate-x-1 hover:translate-y-1 transition-all text-white"
              title="Copy URL"
            >
              <FiCopy className="w-4 h-4" />
            </button>
            <button
              onClick={() => window.open(affiliateUrl, '_blank')}
              className="button-primary neopop-gradient-primary px-2 py-1 border-2 border-slate-600 brutal-shadow-center hover:translate-x-1 hover:translate-y-1 transition-all text-white"
              title="Open in new tab"
            >
              <FiExternalLink className="w-4 h-4" />
            </button>
          </div>
        </div>

        {showEditForm && isOwner && (
          <div className="border-t-2 border-slate-600 pt-4 space-y-3">
            <div>
              <label className="block font-freeman text-sm mb-1 text-slate-300">
                Commission Rate (%)
              </label>
              <input
                type="number"
                min="0"
                max="100"
                step="0.1"
                value={editCommission}
                onChange={(e) => setEditCommission(parseFloat(e.target.value))}
                className="w-full px-2 py-1 bg-slate-700 border-2 border-slate-600 font-freeman focus:outline-none focus:border-primary brutal-shadow-center text-white"
              />
            </div>
            <div>
              <label className="block font-freeman text-sm mb-1 text-slate-300">Status</label>
              <select
                value={editStatus}
                onChange={(e) => setEditStatus(e.target.value as any)}
                className="w-full px-2 py-1 bg-slate-700 border-2 border-slate-600 font-freeman focus:outline-none focus:border-primary brutal-shadow-center text-white"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="suspended">Suspended</option>
              </select>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setShowEditForm(false)}
                className="flex-1 button-primary bg-slate-700 text-slate-300 px-3 py-1 text-sm duration-100 border-2 border-slate-600"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdate}
                disabled={loading}
                className="flex-1 button-primary neopop-gradient-primary px-3 py-1 text-sm disabled:opacity-50 duration-100 text-white border-2 border-slate-600"
              >
                {loading ? 'Saving...' : 'Update'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}