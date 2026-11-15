import React, { useState } from 'react';
import { 
  Building, Plus, Link2, Check, Search, Share2 
} from 'lucide-react';
import type { LeaseVault } from '../types';

interface ActivePropertiesViewProps {
  vaults: LeaseVault[];
  onSelectVault: (vault: LeaseVault) => void;
  onOpenCreate: () => void;
  onOpenShare: (vault: LeaseVault) => void;
}

export const ActivePropertiesView: React.FC<ActivePropertiesViewProps> = ({
  vaults,
  onSelectVault,
  onOpenCreate,
  onOpenShare,
}) => {
  const [filter, setFilter] = useState<'all' | 'active' | 'awaiting'>('all');
  const [search, setSearch] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const filteredVaults = vaults.filter((v) => {
    const matchesFilter =
      filter === 'all'
        ? true
        : filter === 'active'
        ? v.status === 'earning_yield'
        : v.status === 'awaiting_deposit';

    const matchesSearch =
      v.propertyName.toLowerCase().includes(search.toLowerCase()) ||
      v.tenantName.toLowerCase().includes(search.toLowerCase()) ||
      v.houseCode.toLowerCase().includes(search.toLowerCase());

    return matchesFilter && matchesSearch;
  });

  const handleCopyLink = (vault: LeaseVault, e: React.MouseEvent) => {
    e.stopPropagation();
    const url = `${window.location.origin}?vault=${vault.id}&role=tenant`;
    navigator.clipboard.writeText(url);
    setCopiedId(vault.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-4 text-left pb-4 text-stone-900">
      
      {/* 1. Header with Add Button */}
      <div className="flex items-center justify-between pt-1">
        <div>
          <h1 className="text-xl font-black text-stone-950 tracking-tight">
            Active Properties
          </h1>
          <p className="text-xs text-stone-500 mt-0.5">
            Manage your lease vaults & invite tenants
          </p>
        </div>

        <button
          onClick={onOpenCreate}
          className="px-3.5 py-2 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-black text-xs rounded-xl shadow-lg shadow-orange-500/25 flex items-center space-x-1.5 active:scale-95 transition-all"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>Add House</span>
        </button>
      </div>

      {/* 2. Search & Filter Bar */}
      <div className="space-y-2.5">
        <div className="relative">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search house, unit, or tenant..."
            className="w-full pl-9 pr-3.5 py-2.5 bg-white border border-stone-200/90 rounded-xl text-xs text-stone-900 placeholder-stone-400 focus:outline-none focus:border-orange-500 transition-colors shadow-sm"
          />
          <Search className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
        </div>

        <div className="flex space-x-1.5 overflow-x-auto pb-1 text-xs">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1 rounded-full font-black text-[10px] transition-all whitespace-nowrap ${
              filter === 'all'
                ? 'bg-orange-500 text-white shadow-sm'
                : 'bg-white text-stone-600 border border-stone-200/90 hover:text-stone-950 shadow-sm'
            }`}
          >
            All Houses ({vaults.length})
          </button>
          <button
            onClick={() => setFilter('active')}
            className={`px-3 py-1 rounded-full font-black text-[10px] transition-all whitespace-nowrap ${
              filter === 'active'
                ? 'bg-orange-500 text-white shadow-sm'
                : 'bg-white text-stone-600 border border-stone-200/90 hover:text-stone-950 shadow-sm'
            }`}
          >
            Compounding ({vaults.filter((v) => v.status === 'earning_yield').length})
          </button>
          <button
            onClick={() => setFilter('awaiting')}
            className={`px-3 py-1 rounded-full font-black text-[10px] transition-all whitespace-nowrap ${
              filter === 'awaiting'
                ? 'bg-orange-500 text-white shadow-sm'
                : 'bg-white text-stone-600 border border-stone-200/90 hover:text-stone-950 shadow-sm'
            }`}
          >
            Awaiting Payment ({vaults.filter((v) => v.status === 'awaiting_deposit').length})
          </button>
        </div>
      </div>

      {/* 3. Property Cards List */}
      <div className="space-y-3">
        {filteredVaults.map((vault) => (
          <div
            key={vault.id}
            onClick={() => onSelectVault(vault)}
            className="p-4 rounded-2xl bg-white border border-stone-200/90 hover:border-orange-300 space-y-3 cursor-pointer transition-all shadow-sm hover:shadow group"
          >
            {/* Top row: House Code & Status */}
            <div className="flex justify-between items-start">
              <div className="flex items-center space-x-2">
                <span className="px-2 py-0.5 rounded-lg bg-orange-50 text-orange-700 font-mono text-xs font-black border border-orange-200/80">
                  {vault.houseCode}
                </span>
                <span className="text-xs font-black text-stone-950 truncate max-w-[180px]">
                  {vault.propertyName}
                </span>
              </div>

              <span className={`px-2 py-0.5 rounded-full text-[10px] font-black flex items-center gap-1 ${
                vault.status === 'earning_yield'
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  : 'bg-amber-50 text-amber-800 border border-amber-200'
              }`}>
                <span className={`w-1.5 h-1.5 rounded-full ${
                  vault.status === 'earning_yield' ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'
                }`} />
                {vault.status === 'earning_yield' ? 'Earning Yield' : 'Awaiting Tenant'}
              </span>
            </div>

            {/* Address & Tenant Info */}
            <div className="text-[11px] text-stone-500 space-y-0.5">
              <p className="truncate text-stone-700 font-medium">{vault.propertyAddress}</p>
              <p>Tenant: <strong className="text-stone-900">{vault.tenantName}</strong> ({vault.tenantEmail})</p>
            </div>

            {/* Financials & Yield Row */}
            <div className="p-2.5 rounded-xl bg-stone-50 border border-stone-200/70 flex justify-between items-center text-xs">
              <div>
                <span className="text-[9px] text-stone-400 block uppercase font-bold">
                  Caution Deposit
                </span>
                <span className="font-mono font-black text-stone-950">
                  ${vault.depositAmount.toFixed(2)} USDC
                </span>
                <span className="text-[10px] text-stone-500 block -mt-0.5">
                  ≈ ₦{(vault.depositAmount * 1500).toLocaleString()}
                </span>
              </div>

              <div className="text-right">
                <span className="text-[9px] text-stone-400 block uppercase font-bold">
                  Compounding Yield
                </span>
                <span className="font-mono font-black text-orange-600">
                  +${(vault.accruedYield || 0).toFixed(2)} USDC
                </span>
                <span className="text-[9px] text-stone-500 block font-medium">
                  {vault.selectedPool.apy}% APY • {vault.selectedPool.name.split(' ')[0]}
                </span>
              </div>
            </div>

            {/* Action Row */}
            <div className="flex items-center justify-between pt-1">
              <button
                onClick={(e) => handleCopyLink(vault, e)}
                className="px-3 py-1.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-bold flex items-center space-x-1.5 transition-colors shadow-sm"
                title="Copy Share Link for Tenant"
              >
                {copiedId === vault.id ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="text-emerald-700">Link Copied!</span>
                  </>
                ) : (
                  <>
                    <Link2 className="w-3.5 h-3.5 text-stone-600" />
                    <span>Copy Tenant Link</span>
                  </>
                )}
              </button>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onOpenShare(vault);
                }}
                className="px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold flex items-center space-x-1 transition-colors border border-emerald-200"
              >
                <Share2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>WhatsApp</span>
              </button>
            </div>
          </div>
        ))}

        {filteredVaults.length === 0 && (
          <div className="py-12 text-center text-stone-400 text-xs space-y-2">
            <Building className="w-8 h-8 text-stone-300 mx-auto" />
            <p>No properties match your filter or search.</p>
          </div>
        )}
      </div>

    </div>
  );
};
