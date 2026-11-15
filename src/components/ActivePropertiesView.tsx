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
    <div className="space-y-4 text-left pb-4 text-white">
      
      {/* 1. Header with Add Button */}
      <div className="flex items-center justify-between pt-1">
        <div>
          <h1 className="text-xl font-black text-white tracking-tight">
            Active Properties
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Manage your lease vaults & invite tenants
          </p>
        </div>

        <button
          onClick={onOpenCreate}
          className="px-3.5 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl shadow-lg shadow-emerald-500/20 flex items-center space-x-1.5 active:scale-95 transition-all"
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
            className="w-full pl-9 pr-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors"
          />
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
        </div>

        <div className="flex space-x-1.5 overflow-x-auto pb-1 text-xs">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1 rounded-full font-bold text-[10px] transition-all whitespace-nowrap ${
              filter === 'all'
                ? 'bg-emerald-500 text-slate-950 shadow-sm'
                : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-white'
            }`}
          >
            All Houses ({vaults.length})
          </button>
          <button
            onClick={() => setFilter('active')}
            className={`px-3 py-1 rounded-full font-bold text-[10px] transition-all whitespace-nowrap ${
              filter === 'active'
                ? 'bg-emerald-500 text-slate-950 shadow-sm'
                : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-white'
            }`}
          >
            Compounding ({vaults.filter((v) => v.status === 'earning_yield').length})
          </button>
          <button
            onClick={() => setFilter('awaiting')}
            className={`px-3 py-1 rounded-full font-bold text-[10px] transition-all whitespace-nowrap ${
              filter === 'awaiting'
                ? 'bg-emerald-500 text-slate-950 shadow-sm'
                : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-white'
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
            className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-slate-700 space-y-3 cursor-pointer transition-all hover:bg-slate-850 shadow-md group"
          >
            {/* Top row: House Code & Status */}
            <div className="flex justify-between items-start">
              <div className="flex items-center space-x-2">
                <span className="px-2 py-0.5 rounded-lg bg-slate-800 text-emerald-400 font-mono text-xs font-bold border border-slate-700">
                  {vault.houseCode}
                </span>
                <span className="text-xs font-bold text-white truncate max-w-[180px]">
                  {vault.propertyName}
                </span>
              </div>

              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold flex items-center gap-1 ${
                vault.status === 'earning_yield'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                  : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
              }`}>
                <span className={`w-1.5 h-1.5 rounded-full ${
                  vault.status === 'earning_yield' ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'
                }`} />
                {vault.status === 'earning_yield' ? 'Earning Yield' : 'Awaiting Tenant'}
              </span>
            </div>

            {/* Address & Tenant Info */}
            <div className="text-[11px] text-slate-400 space-y-0.5">
              <p className="truncate text-slate-300">{vault.propertyAddress}</p>
              <p>Tenant: <strong className="text-white">{vault.tenantName}</strong> ({vault.tenantEmail})</p>
            </div>

            {/* Financials & Yield Row */}
            <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-850 flex justify-between items-center text-xs">
              <div>
                <span className="text-[9px] text-slate-500 block uppercase font-bold">
                  Caution Deposit
                </span>
                <span className="font-mono font-black text-white">
                  ${vault.depositAmount.toFixed(2)} USDC
                </span>
                <span className="text-[10px] text-slate-400 block -mt-0.5">
                  ≈ ₦{(vault.depositAmount * 1500).toLocaleString()}
                </span>
              </div>

              <div className="text-right">
                <span className="text-[9px] text-slate-500 block uppercase font-bold">
                  Compounding Yield
                </span>
                <span className="font-mono font-bold text-emerald-400">
                  +${(vault.accruedYield || 0).toFixed(2)} USDC
                </span>
                <span className="text-[9px] text-emerald-300/80 block">
                  {vault.selectedPool.apy}% APY • {vault.selectedPool.name.split(' ')[0]}
                </span>
              </div>
            </div>

            {/* Action Row */}
            <div className="flex items-center justify-between pt-1">
              <button
                onClick={(e) => handleCopyLink(vault, e)}
                className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center space-x-1.5 transition-colors"
                title="Copy Share Link for Tenant"
              >
                {copiedId === vault.id ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-400">Link Copied!</span>
                  </>
                ) : (
                  <>
                    <Link2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Copy Tenant Link</span>
                  </>
                )}
              </button>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onOpenShare(vault);
                }}
                className="px-3 py-1.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 text-xs font-bold flex items-center space-x-1 transition-colors"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>WhatsApp</span>
              </button>
            </div>
          </div>
        ))}

        {filteredVaults.length === 0 && (
          <div className="py-12 text-center text-slate-500 text-xs space-y-2">
            <Building className="w-8 h-8 text-slate-600 mx-auto" />
            <p>No properties match your filter or search.</p>
          </div>
        )}
      </div>

    </div>
  );
};
