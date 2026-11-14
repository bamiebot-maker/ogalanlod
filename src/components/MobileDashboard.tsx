import React, { useState } from 'react';
import { 
  Bell, UserPlus, Eye, ChevronLeft, ChevronRight, TrendingUp, 
  ArrowUpRight, Coins, Sparkles, Building, ShieldCheck
} from 'lucide-react';
import type { LeaseVault, UserProfile } from '../types';
import { calculateYield } from '../services/pollarService';

interface MobileDashboardProps {
  user: UserProfile;
  vaults: LeaseVault[];
  onSelectVault: (vault: LeaseVault) => void;
  onOpenCreate: () => void;
  onOpenProfile: () => void;
  onSwitchTab: (tab: 'vault' | 'yield') => void;
}

export const MobileDashboard: React.FC<MobileDashboardProps> = ({
  user,
  vaults,
  onSelectVault,
  onOpenCreate,
  onOpenProfile,
  onSwitchTab,
}) => {
  const [currentCardIndex, setCurrentCardIndex] = useState(0);

  const totalLocked = vaults.reduce((acc, v) => acc + v.depositAmount, 0);
  const totalAccruedYield = vaults.reduce((acc, v) => {
    const y = calculateYield(v.depositAmount, v.selectedPool.apy, v.simulatedMonthsElapsed || 0);
    return acc + y.accrued;
  }, 0);

  const activeVault = vaults[currentCardIndex] || vaults[0];

  return (
    <div className="space-y-4 text-left text-slate-100">
      {/* 1. Header with User Profile */}
      <div className="flex items-center justify-between pt-1 px-1">
        <div 
          onClick={onOpenProfile}
          className="flex items-center space-x-2.5 cursor-pointer group"
          title="Switch User Role or Edit Profile"
        >
          <div className="relative">
            <img
              src={user.avatarUrl}
              alt={user.name}
              className="w-10 h-10 rounded-full object-cover ring-2 ring-emerald-500/60 group-hover:scale-105 transition-transform"
            />
            <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-400 rounded-full ring-2 ring-slate-950" />
          </div>
          <div>
            <h1 className="text-sm font-bold text-white tracking-tight flex items-center gap-1">
              <span>Hi, {user.name.split(' ')[0]}</span>
              <span className="text-[10px] text-emerald-400 font-semibold px-1.5 py-0.2 bg-emerald-950/80 rounded border border-emerald-500/30">
                {user.role === 'landlord' ? 'Landlord' : 'Tenant'}
              </span>
            </h1>
            <p className="text-[11px] text-slate-400 font-mono">
              ID: <span className="text-emerald-400 font-bold">{user.id}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={onOpenCreate}
            className="w-9 h-9 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-300 hover:text-white hover:bg-slate-800 transition-colors shadow-sm"
            title="Create New Lease Vault"
          >
            <UserPlus className="w-4 h-4" />
          </button>
          <button
            onClick={() => onSwitchTab('yield')}
            className="w-9 h-9 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-300 hover:text-white hover:bg-slate-800 transition-colors relative shadow-sm"
            title="Yield Notifications"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-2 right-2 w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
          </button>
        </div>
      </div>

      {/* 2. Hero Balance Card with Active Vault Preview */}
      <div className="rounded-[30px] bg-[#111318] border border-slate-800/80 p-5 shadow-2xl relative overflow-hidden">
        {/* Subtle ambient green glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />

        {/* Balance Title & Visibility Eye */}
        <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
          <span className="font-medium tracking-wide">Total Protected Escrow</span>
          <Eye className="w-3.5 h-3.5 text-slate-500 cursor-pointer hover:text-slate-300" />
        </div>

        {/* Balance Amount */}
        <div className="flex items-baseline space-x-1 my-1">
          <span className="text-2xl sm:text-3xl font-extrabold text-white font-mono tracking-tight">
            ${(totalLocked + totalAccruedYield).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
          <span className="text-xs font-semibold text-emerald-400">USDC</span>
        </div>

        {/* Pill row */}
        <div className="flex flex-wrap items-center gap-1.5 mt-2 text-[10px]">
          <span className="px-2 py-0.5 rounded-full bg-slate-900 border border-slate-800 text-slate-300">
            Account: <strong className="text-white">{user.name.split(' ')[0]}</strong>
          </span>
          <span className="px-2 py-0.5 rounded-full bg-slate-900 border border-slate-800 text-slate-300 font-mono">
            ID: <strong className="text-emerald-400">{user.id}</strong>
          </span>
          <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-semibold">
            Status: Active
          </span>
        </div>

        {/* Interactive Property Vault Card */}
        {activeVault && (
          <div 
            onClick={() => onSelectVault(activeVault)}
            className="my-4 cursor-pointer p-4 rounded-2xl bg-gradient-to-b from-emerald-500/10 via-slate-950/60 to-emerald-950/20 border border-emerald-500/20 flex flex-col items-center justify-center relative group hover:border-emerald-500/40 transition-all"
          >
            <Sparkles className="w-3.5 h-3.5 text-emerald-300 absolute top-3 left-4 animate-pulse" />

            {/* Shield / Vault Graphic */}
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#10b981] to-[#34d399] flex items-center justify-center text-slate-950 font-black text-2xl shadow-xl shadow-emerald-500/30 group-hover:scale-105 transition-transform">
              <ShieldCheck className="w-7 h-7 text-slate-950 stroke-[2.5]" />
            </div>

            <div className="mt-2.5 text-center">
              <span className="text-xs font-bold text-white block">
                {activeVault.propertyName}
              </span>
              <span className="text-[10px] text-emerald-400 font-semibold mt-0.5 block font-mono">
                ${activeVault.depositAmount.toFixed(2)} USDC • {activeVault.selectedPool.apy}% APY
              </span>
            </div>

            <span className="mt-2 text-[10px] text-slate-400 group-hover:text-emerald-300 transition-colors flex items-center gap-1">
              <span>Inspect Security Deposit Vault</span>
              <ArrowUpRight className="w-3 h-3" />
            </span>
          </div>
        )}

        {/* House Switcher Controls */}
        <div className="flex items-center justify-between text-xs text-slate-400 pt-1 px-1">
          <button 
            onClick={() => setCurrentCardIndex((prev) => (prev > 0 ? prev - 1 : vaults.length - 1))}
            className="p-1 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          
          <div className="flex items-center space-x-1.5">
            <span className="text-[11px] font-bold text-slate-300">
              House {currentCardIndex + 1} of {vaults.length}
            </span>
            <div className="flex space-x-1">
              {vaults.map((_, i) => (
                <span 
                  key={i} 
                  className={`w-1.5 h-1.5 rounded-full transition-all ${i === currentCardIndex ? 'bg-emerald-400 w-3' : 'bg-slate-700'}`} 
                />
              ))}
            </div>
          </div>

          <button 
            onClick={() => setCurrentCardIndex((prev) => (prev < vaults.length - 1 ? prev + 1 : 0))}
            className="p-1 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 3. Earning Dynamics Card */}
      <div 
        onClick={() => onSwitchTab('yield')}
        className="rounded-[28px] bg-[#111318] border border-slate-800/80 p-4 shadow-xl relative overflow-hidden cursor-pointer hover:border-emerald-500/30 transition-all"
      >
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-2 text-white">
            <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-xs font-bold">Earning Dynamics</span>
          </div>
          <div className="flex items-center space-x-2 text-[10px]">
            <span className="flex items-center gap-1 text-slate-400">
              <span className="w-1.5 h-1.5 rounded-full bg-slate-500" /> Normal
            </span>
            <span className="flex items-center gap-1 text-emerald-400 font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" /> Compounding
            </span>
          </div>
        </div>

        {/* Wave graphic */}
        <div className="py-1 relative">
          <div className="h-14 flex items-end justify-between gap-1 px-1">
            <div className="w-full bg-emerald-500/20 rounded-t-md h-[35%]" />
            <div className="w-full bg-emerald-500/30 rounded-t-md h-[50%]" />
            <div className="w-full bg-emerald-500/40 rounded-t-md h-[45%]" />
            <div className="w-full bg-emerald-500/60 rounded-t-md h-[65%]" />
            <div className="w-full bg-emerald-500/75 rounded-t-md h-[60%]" />
            <div className="w-full bg-emerald-500/90 rounded-t-md h-[80%]" />
            <div className="w-full bg-emerald-400 rounded-t-md h-[100%] shadow-lg shadow-emerald-400/40" />
          </div>
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 text-[11px] text-slate-400">
          <span className="flex items-center gap-1 text-slate-300">
            <Coins className="w-3.5 h-3.5 text-emerald-400" />
            <span>Stellar Soroban Yield</span>
          </span>
          <span className="font-mono font-bold text-emerald-400">
            +${totalAccruedYield.toFixed(2)} USDC
          </span>
        </div>
      </div>

      {/* 4. Real Estate Escrow Safety Banner */}
      {activeVault && (
        <div 
          onClick={() => onSelectVault(activeVault)}
          className="cursor-pointer rounded-2xl bg-[#161922] border border-slate-800 p-3.5 flex items-center justify-between group hover:border-emerald-500/30 transition-all"
        >
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
              <Building className="w-4 h-4 text-emerald-400" />
            </div>
            <div>
              <div className="text-xs font-bold text-white group-hover:text-emerald-400 transition-colors">
                Protect your tenancy deposit
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5">
                Non-custodial smart escrow • Mutual co-signing
              </div>
            </div>
          </div>

          <ArrowUpRight className="w-4 h-4 text-slate-500 group-hover:text-emerald-400 transition-colors" />
        </div>
      )}
    </div>
  );
};